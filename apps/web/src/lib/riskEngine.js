/**
 * Risk Engine — система обнаружения и управления рисками туров
 * 
 * Проверяет все категории рисков:
 * A. Подготовка тура и заполненность данных
 * B. Конфликты ресурсов и расписания
 * C. Туристы и документы
 * D. Финансовые риски
 * E. Качество сервиса и репутация
 * 
 * @note Этот модуль только для серверного использования (API routes)
 */

// Ленивая инициализация Pool (чтобы не падало при билде)
let pool = null;
function getPool() {
  if (!pool) {
    // Динамический require для избежания проблем с билдом
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

// Конфигурация пороговых значений
const CONFIG = {
  // Временные пороги (часы до выезда)
  criticalHoursBefore: 20,      // Для гида, транспорта, отеля
  warningHoursBefore: 48,
  touristDataHours: 16,         // Для неполных данных туристов
  debtHoursBefore: 8,           // Для финансовых рисков (долг)
  
  // Финансовые пороги (%)
  maxDebtPercent: 20,
  minDepositPercent: 30,
  maxDiscountPercent: 20,
  
  // Операционные пороги
  minTouristsFillPercent: 80,
  maxGuideTours7Days: 4,
  
  // Качество
  minAcceptableRating: 4.0,
  maxComplaintHours: 48,
  maxIncidents30Days: 1,
};

// Кэш существующих таблиц (чтобы не проверять каждый раз)
let tablesCache = null;

async function getExistingTables(client) {
  if (tablesCache) return tablesCache;
  
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  tablesCache = new Set(result.rows.map(r => r.table_name));
  return tablesCache;
}

/**
 * Проверить все риски для тура
 */
export async function checkTourRisks(tourId, companyId = null) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    // Получаем список существующих таблиц
    const existingTables = await getExistingTables(client);

    // Загружаем данные тура
    const tourData = await loadTourData(client, tourId);
    
    if (!tourData) {
      throw new Error(`Tour ${tourId} not found`);
    }

    // Добавляем информацию о существующих таблицах к данным тура
    tourData._tables = existingTables;

    // Проверяем доступ к компании (если указан)
    if (companyId && tourData.company_id !== companyId) {
      throw new Error('Access denied');
    }

    // Собираем все риски
    const risks = [];

    // Вспомогательная функция для безопасного вызова проверок
    async function safeCheck(name, checkFn) {
      try {
        await client.query(`SAVEPOINT ${name}`);
        const result = await checkFn();
        await client.query(`RELEASE SAVEPOINT ${name}`);
        return result;
      } catch (error) {
        console.warn(`[Risks] ${name} check failed:`, error.message);
        await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
        return [];
      }
    }

    // Проверяем, завершился ли тур (по дате окончания или статусу)
    const isTourCompleted = tourData.status === 'completed' || 
                            tourData.status === 'canceled' ||
                            tourData.status === 'cancelled' ||
                            (tourData.end_date && new Date(tourData.end_date) < new Date());

    // Для завершённых туров проверяем только финансовые риски (задолженность)
    if (isTourCompleted) {
      // D. Только финансовые риски для завершённых туров
      risks.push(...await safeCheck('finance', () => checkFinancialRisksCompleted(client, tourData)));
    } else {
      // A. Подготовка тура
      risks.push(...await safeCheck('prep', () => checkPreparationRisks(client, tourData)));

      // B. Конфликты ресурсов
      risks.push(...await safeCheck('conflicts', () => checkResourceConflicts(client, tourData)));

      // C. Туристы и документы
      risks.push(...await safeCheck('tourists', () => checkTouristRisks(client, tourData)));

      // D. Финансовые риски
      risks.push(...await safeCheck('finance', () => checkFinancialRisks(client, tourData)));

      // E. Качество и репутация
      risks.push(...await safeCheck('quality', () => checkQualityRisks(client, tourData)));
    };

    // Сохраняем риски в БД (закрываем старые, создаём новые)
    await saveRisks(client, tourId, risks);

    await client.query('COMMIT');
    
    return risks;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Получить все открытые риски компании
 */
export async function getCompanyRisks(companyId, filters = {}) {
  const { severity, limit = 100 } = filters;
  
  let query = `
    SELECT * FROM v_open_risks
    WHERE company_id = $1
  `;
  
  const params = [companyId];
  
  if (severity) {
    query += ` AND severity = $2`;
    params.push(severity);
  }
  
  query += ` LIMIT $${params.length + 1}`;
  params.push(limit);
  
  const result = await getPool().query(query, params);
  return result.rows;
}

/**
 * Загрузить данные тура
 */
async function loadTourData(client, tourId) {
  const result = await client.query(`
    SELECT 
      t.*,
      EXTRACT(EPOCH FROM (t.start_date - NOW())) / 3600 AS hours_to_departure
    FROM tours t
    WHERE t.id = $1
  `, [tourId]);
  
  return result.rows[0] || null;
}

// ============================================
// A. ПОДГОТОВКА ТУРА И ЗАПОЛНЕННОСТЬ ДАННЫХ
// ============================================

async function checkPreparationRisks(client, tour) {
  const risks = [];
  const hoursLeft = tour.hours_to_departure;
  const tables = tour._tables || new Set();
  
  // 1. Нет назначенного гида - проверяем main_guide_id И tour_components
  let hasGuide = !!tour.main_guide_id;
  
  // Также проверяем в компонентах тура
  if (!hasGuide && tables.has('tour_components')) {
    const guideRes = await client.query(`
      SELECT 1 FROM tour_components 
      WHERE tour_id = $1 AND type = 'guide' AND guide_id IS NOT NULL
      LIMIT 1
    `, [tour.id]);
    hasGuide = guideRes.rowCount > 0;
  }
  
  if (!hasGuide && hoursLeft < CONFIG.criticalHoursBefore) {
    risks.push({
      risk_type: 'missing_guide',
      severity: 'critical',
      title: 'Не назначен гид',
      description: `Тур начинается через ${Math.round(hoursLeft)} часов, но гид не назначен`,
      due_at: tour.start_date,
      metadata: {
        hours_to_departure: Math.round(hoursLeft),
        tour_name: tour.name,
      },
    });
  }

  // 2. Нет транспорта (проверяем в tour_components)
  if (tables.has('tour_components') && hoursLeft < CONFIG.criticalHoursBefore) {
    const vehicleRes = await client.query(`
      SELECT COUNT(*) as count FROM tour_components 
      WHERE tour_id = $1 AND type = 'transport'
    `, [tour.id]);
    
    if (parseInt(vehicleRes.rows[0].count) === 0) {
      risks.push({
        risk_type: 'missing_vehicle',
        severity: 'critical',
        title: 'Не назначен транспорт',
        description: `Выезд через ${Math.round(hoursLeft)} часов, транспорт не указан`,
        due_at: tour.start_date,
        metadata: { hours_to_departure: Math.round(hoursLeft) },
      });
    }
  }

  // 3. Отель не указан (для многодневных туров)
  // Определяем многодневность по разнице start_date и end_date
  const startDate = new Date(tour.start_date);
  const endDate = tour.end_date ? new Date(tour.end_date) : startDate;
  const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const isOvernightTour = durationDays > 1;
  
  if (isOvernightTour && hoursLeft < CONFIG.criticalHoursBefore) {
    let hasHotel = false;
    
    // Проверяем в компонентах тура
    if (tables.has('tour_components')) {
      const hotelRes = await client.query(`
        SELECT 1 FROM tour_components 
        WHERE tour_id = $1 AND type = 'hotel' AND hotel_id IS NOT NULL
        LIMIT 1
      `, [tour.id]);
      hasHotel = hotelRes.rowCount > 0;
    }
    
    if (!hasHotel) {
      risks.push({
        risk_type: 'missing_hotel',
        severity: 'critical',
        title: 'Не указан отель для тура с проживанием',
        description: `Многодневный тур (${durationDays} дней), выезд через ${Math.round(hoursLeft)} часов, но отель не назначен`,
        due_at: tour.start_date,
        metadata: { 
          duration_days: durationDays,
          hours_to_departure: Math.round(hoursLeft),
        },
      });
    }
  }

  return risks;
}

// ============================================
// B. КОНФЛИКТЫ РЕСУРСОВ И РАСПИСАНИЯ
// ============================================

async function checkResourceConflicts(client, tour) {
  const risks = [];
  const tables = tour._tables || new Set();

  // Собираем все guide_id для текущего тура
  let guideIds = [];
  if (tour.main_guide_id) {
    guideIds.push(tour.main_guide_id);
  }
  
  // Также проверяем гидов в компонентах тура
  if (tables.has('tour_components')) {
    const guideRes = await client.query(`
      SELECT guide_id FROM tour_components 
      WHERE tour_id = $1 AND type = 'guide' AND guide_id IS NOT NULL
    `, [tour.id]);
    guideIds.push(...guideRes.rows.map(r => r.guide_id));
  }
  
  // Убираем дубликаты
  guideIds = [...new Set(guideIds)];

  // 4. Гид назначен на два тура в одно время
  for (const guideId of guideIds) {
    // Проверяем конфликты по main_guide_id
    const conflictMainRes = await client.query(`
      SELECT t.id, t.name
      FROM tours t
      WHERE t.main_guide_id = $1
        AND t.id != $2
        AND t.status NOT IN ('cancelled', 'completed', 'canceled')
        AND (
          (t.start_date, t.end_date) OVERLAPS ($3, $4)
        )
      LIMIT 1
    `, [guideId, tour.id, tour.start_date, tour.end_date]);

    // Также проверяем конфликты по tour_components
    let conflictComponentRes = { rows: [] };
    if (tables.has('tour_components')) {
      conflictComponentRes = await client.query(`
        SELECT t.id, t.name
        FROM tour_components tc
        JOIN tours t ON t.id = tc.tour_id
        WHERE tc.guide_id = $1
          AND tc.type = 'guide'
          AND t.id != $2
          AND t.status NOT IN ('cancelled', 'completed', 'canceled')
          AND (
            (t.start_date, t.end_date) OVERLAPS ($3, $4)
          )
        LIMIT 1
      `, [guideId, tour.id, tour.start_date, tour.end_date]);
    }

    const conflict = conflictMainRes.rows[0] || conflictComponentRes.rows[0];
    if (conflict) {
      risks.push({
        risk_type: 'guide_conflict',
        severity: 'critical',
        title: 'Гид занят в другом туре',
        description: `Гид уже назначен на тур "${conflict.name}" в это же время`,
        related_entity_type: 'guide',
        // related_entity_id храним в metadata (т.к. это UUID, а поле integer)
        due_at: tour.start_date,
        metadata: {
          guide_id: guideId,
          conflicting_tour_id: conflict.id,
          conflicting_tour_name: conflict.name,
        },
      });
      break; // Одного конфликта достаточно
    }
  }

  // guide_overload удалён по запросу

  return risks;
}

// ============================================
// C. ТУРИСТЫ И ДОКУМЕНТЫ
// ============================================

async function checkTouristRisks(client, tour) {
  const risks = [];

  // 15. Список туристов не заполнен
  const guestsRes = await client.query(`
    SELECT COUNT(*) as filled_count
    FROM tour_guests
    WHERE tour_id = $1
  `, [tour.id]);

  const filledCount = parseInt(guestsRes.rows[0].filled_count);
  const expectedCount = tour.tourists_count || 0;

  if (expectedCount > 0) {
    const fillPercent = (filledCount / expectedCount) * 100;
    
    if (fillPercent < CONFIG.minTouristsFillPercent && tour.hours_to_departure < CONFIG.warningHoursBefore) {
      risks.push({
        risk_type: 'tourists_incomplete',
        severity: fillPercent < 50 ? 'warning' : 'attention',
        title: 'Список туристов неполный',
        description: `Заполнено ${filledCount} из ${expectedCount} ожидаемых туристов (${Math.round(fillPercent)}%)`,
        due_at: tour.start_date,
        metadata: {
          tourists_filled: filledCount,
          tourists_expected: expectedCount,
          completion_percent: Math.round(fillPercent),
          min_required_percent: CONFIG.minTouristsFillPercent,
        },
      });
    }
  }

  // 7. Туристы без телефона/ФИО - только за 16 часов
  const invalidRes = await client.query(`
    SELECT COUNT(*) as count
    FROM tour_guests
    WHERE tour_id = $1
      AND (full_name IS NULL OR full_name = '' OR phone IS NULL OR phone = '')
  `, [tour.id]);

  const invalidCount = parseInt(invalidRes.rows[0].count);
  if (invalidCount > 0 && tour.hours_to_departure < CONFIG.touristDataHours) {
    risks.push({
      risk_type: 'tourists_missing_data',
      severity: 'critical',
      title: `У ${invalidCount} туристов не хватает данных`,
      description: 'Пустые обязательные поля: ФИО или телефон',
      due_at: tour.start_date,
      metadata: { 
        total_invalid: invalidCount,
        hours_to_departure: Math.round(tour.hours_to_departure),
      },
    });
  }

  return risks;
}

// ============================================
// D. ФИНАНСОВЫЕ РИСКИ
// ============================================

async function checkFinancialRisks(client, tour) {
  const risks = [];

  // Получаем финансовые данные тура
  const financeRes = await client.query(`
    SELECT 
      COALESCE(SUM(cost_cents), 0) as total_price_cents,
      COALESCE(SUM(prepayment_cents), 0) as deposit_cents,
      COALESCE(SUM(CASE WHEN is_paid THEN 0 ELSE (cost_cents - prepayment_cents) END), 0) as debt_cents
    FROM tour_guests
    WHERE tour_id = $1
  `, [tour.id]);

  const finance = financeRes.rows[0];
  const totalPrice = finance.total_price_cents / 100;
  const deposit = finance.deposit_cents / 100;
  const debt = finance.debt_cents / 100;

  if (totalPrice === 0) return risks;

  const depositPercent = (deposit / totalPrice) * 100;
  const debtPercent = (debt / totalPrice) * 100;

  // 8. Большая дебиторка перед выездом - за 8 часов
  if (debt > 0 && debtPercent > CONFIG.maxDebtPercent && tour.hours_to_departure < CONFIG.debtHoursBefore) {
    risks.push({
      risk_type: 'high_debt_before_tour',
      severity: 'critical',
      title: `Большая задолженность за ${Math.round(tour.hours_to_departure)} часов до выезда`,
      description: `Долг ${debt.toLocaleString()}₽ (${Math.round(debtPercent)}% от стоимости тура)`,
      due_at: tour.start_date,
      metadata: {
        due_amount: debt,
        total_price: totalPrice,
        debt_percent: Math.round(debtPercent),
        max_allowed_percent: CONFIG.maxDebtPercent,
        hours_to_departure: Math.round(tour.hours_to_departure),
      },
    });
  }

  // low_deposit удалён по запросу

  return risks;
}

// ============================================
// D2. ФИНАНСОВЫЕ РИСКИ ДЛЯ ЗАВЕРШЁННЫХ ТУРОВ
// ============================================

async function checkFinancialRisksCompleted(client, tour) {
  const risks = [];

  // Получаем финансовые данные тура
  const financeRes = await client.query(`
    SELECT 
      COALESCE(SUM(cost_cents), 0) as total_price_cents,
      COALESCE(SUM(prepayment_cents), 0) as deposit_cents,
      COALESCE(SUM(CASE WHEN is_paid THEN 0 ELSE (cost_cents - prepayment_cents) END), 0) as debt_cents
    FROM tour_guests
    WHERE tour_id = $1
  `, [tour.id]);

  const finance = financeRes.rows[0];
  const totalPrice = finance.total_price_cents / 100;
  const debt = finance.debt_cents / 100;

  if (totalPrice === 0) return risks;

  // Для завершённых туров показываем любую задолженность
  if (debt > 0) {
    const debtPercent = (debt / totalPrice) * 100;
    risks.push({
      risk_type: 'outstanding_debt',
      severity: debtPercent > 50 ? 'critical' : 'warning',
      title: `Непогашенная задолженность после тура`,
      description: `Долг ${debt.toLocaleString()}₽ (${Math.round(debtPercent)}% от стоимости тура)`,
      due_at: tour.end_date || tour.start_date,
      metadata: {
        due_amount: debt,
        total_price: totalPrice,
        debt_percent: Math.round(debtPercent),
        tour_ended: tour.end_date,
      },
    });
  }

  return risks;
}

// ============================================
// E. КАЧЕСТВО СЕРВИСА И РЕПУТАЦИЯ
// ============================================

async function checkQualityRisks(client, tour) {
  const risks = [];
  const tables = tour._tables || new Set();

  // 27. Неразобранные жалобы (только если таблица complaints существует)
  if (tables.has('complaints')) {
    const complaintRes = await client.query(`
      SELECT id, created_at, description
      FROM complaints
      WHERE tour_id = $1
        AND status = 'open'
        AND created_at < NOW() - INTERVAL '${CONFIG.maxComplaintHours} hours'
      LIMIT 1
    `, [tour.id]);

    if (complaintRes.rows.length > 0) {
      const complaint = complaintRes.rows[0];
      const hoursOpen = Math.round((Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60));
      
      risks.push({
        risk_type: 'unresolved_complaint',
        severity: 'warning',
        title: `Жалоба не рассмотрена ${hoursOpen} часов`,
        description: complaint.description || 'Жалоба от туриста',
        related_entity_type: 'complaint',
        related_entity_id: complaint.id,
        metadata: {
          hours_open: hoursOpen,
          max_allowed_hours: CONFIG.maxComplaintHours,
        },
      });
    }
  }

  return risks;
}

// ============================================
// СОХРАНЕНИЕ РИСКОВ
// ============================================

async function saveRisks(client, tourId, newRisks) {
  // Удаляем все старые риски этого тура (не засоряем базу resolved записями)
  await client.query(`
    DELETE FROM tour_risks
    WHERE tour_id = $1
  `, [tourId]);

  // Создаём только актуальные (открытые) риски
  for (const risk of newRisks) {
    await client.query(`
      INSERT INTO tour_risks (
        tour_id, risk_type, severity, title, description,
        related_entity_type, related_entity_id, due_at, metadata, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
    `, [
      tourId,
      risk.risk_type,
      risk.severity,
      risk.title,
      risk.description || null,
      risk.related_entity_type || null,
      risk.related_entity_id || null,
      risk.due_at || null,
      JSON.stringify(risk.metadata || {}),
    ]);
  }
}

export default { checkTourRisks, getCompanyRisks };
