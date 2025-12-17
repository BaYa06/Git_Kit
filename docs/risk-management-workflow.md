# Система управления рисками туров

## 🔄 Как работает автоматическая проверка рисков

### 1. Автоматические триггеры

Риски **автоматически проверяются и сохраняются в БД** в следующих случаях:

#### ✅ При создании нового тура
**Файл**: `apps/web/src/pages/api/v1/tours/create.js`

```javascript
// После успешного создания тура:
const tour = tourRes.rows[0]; // новый тур создан

// ✅ Автоматически запускается проверка рисков
await checkTourRisks(tour.id, company_id);
```

#### ✅ При обновлении существующего тура
**Файл**: `apps/web/src/pages/api/v1/tours/update.js`

```javascript
// После COMMIT транзакции обновления:
await client.query("COMMIT");

// ✅ Автоматически запускается проверка рисков
await checkTourRisks(tour_id, company_id);
```

#### ✅ По требованию (ручная проверка)
**Endpoint**: `POST /api/v1/risks/check/:tourId`

Используется для:
- Переоценки рисков после изменения в других частях системы
- Периодической проверки всех активных туров (cron job)
- Кнопок "Обновить риски" в интерфейсе

---

## 📊 Как риски попадают в базу данных

### Шаг 1: Детекция рисков

`checkTourRisks()` из `riskEngine.js` анализирует тур по 5 категориям:

```javascript
// Категория A: Подготовка тура
const prepRisks = checkPreparationRisks(tour);
// → Проверяет: нет гида, нет дат, нет туристов

// Категория B: Конфликты ресурсов
const conflictRisks = await checkResourceConflicts(tour, pool);
// → Проверяет: гид на 2+ турах одновременно, отель переброан

// Категория C: Документы и туристы
const touristRisks = checkTouristRisks(tour);
// → Проверяет: малые группы (< 3), нестандартные размеры

// Категория D: Финансовые риски
const financialRisks = checkFinancialRisks(tour);
// → Проверяет: долгие туры без гида (дорогие замены)

// Категория E: Качество
const qualityRisks = checkQualityRisks(tour);
// → Проверяет: ручной ввод компонентов (опечатки)
```

### Шаг 2: Сохранение в БД

Каждый найденный риск сохраняется в таблицу `tour_risks`:

```sql
INSERT INTO tour_risks (
  tour_id,        -- UUID тура
  company_id,     -- UUID компании
  risk_type,      -- Тип риска (no_guide, guide_conflict, ...)
  severity,       -- Серьезность: critical, high, medium, low
  category,       -- Категория: preparation, resource_conflicts, ...
  message,        -- Описание на русском
  metadata,       -- Дополнительные данные (JSON)
  detected_at,    -- Когда обнаружен (NOW())
  status          -- Статус: open, acknowledged, resolved
) VALUES (...);
```

**Важно**: Старые риски **удаляются** перед вставкой новых:

```javascript
// 1. Удалить все старые риски этого тура
await pool.query(
  "DELETE FROM tour_risks WHERE tour_id = $1",
  [tourId]
);

// 2. Вставить только актуальные риски
for (const risk of allRisks) {
  await pool.query("INSERT INTO tour_risks ...", [...]);
}
```

### Шаг 3: Отображение в интерфейсе

**Компонент**: `AlertsWidget.jsx` в дашборде владельца

```javascript
// 1. Загрузка рисков через API
const fetchRisks = async () => {
  const res = await fetch(`/api/v1/risks/list?companyId=${companyId}`);
  const data = await res.json();
  setRisks(data.risks); // Показать в виджете
};

// 2. API использует VIEW для фильтрации
// Файл: apps/web/src/pages/api/v1/risks/list.js
SELECT * FROM v_open_risks
WHERE company_id = $1
  AND status = 'open'
  AND severity IN ('critical', 'high')
ORDER BY severity DESC, detected_at DESC
LIMIT 10;
```

---

## 🎯 Пример полного цикла

### Сценарий: Создание тура без гида

1. **Пользователь создает тур** (POST /api/v1/tours/create):
   ```json
   {
     "name": "Тур в Алтай",
     "start_date": "2024-06-01",
     "tourists_count": 5,
     "main_guide_id": null  // ❌ Гид не назначен
   }
   ```

2. **Автоматическая проверка** (в create.js):
   ```javascript
   // После INSERT INTO tours
   await checkTourRisks(tour.id, company_id);
   // → Детектирует риск "no_guide"
   ```

3. **Запись риска в БД**:
   ```sql
   INSERT INTO tour_risks (
     tour_id, company_id, risk_type, severity, category, message, status
   ) VALUES (
     'uuid-тура', 'uuid-компании',
     'no_guide', 'critical', 'preparation',
     'Нет назначенного гида для тура "Тур в Алтай"', 'open'
   );
   ```

4. **Отображение в дашборде**:
   - `AlertsWidget.jsx` вызывает `/api/v1/risks/list`
   - API возвращает риск с severity=critical
   - Виджет показывает красную карточку:
     ```
     🔴 Критический риск
     Нет назначенного гида для тура "Тур в Алтай"
     Категория: Подготовка тура
     [Переназначить] [Отложить]
     ```

5. **Решение проблемы**:
   - Пользователь назначает гида (PATCH /api/v1/tours/update)
   - Автоматически снова вызывается `checkTourRisks()`
   - Риск "no_guide" больше не детектируется → удаляется из БД
   - Виджет обновляется → риск исчезает

---

## ⚙️ Дополнительные возможности

### Периодическая проверка (cron)

Для автоматической переоценки рисков каждый час:

```javascript
// Файл: apps/api/src/cron/checkRisks.js
import { Pool } from "pg";
import { checkTourRisks } from "../lib/riskEngine";

export async function checkAllActiveToursRisks() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Получить все активные туры (статус != cancelled)
  const result = await pool.query(`
    SELECT id, company_id FROM tours
    WHERE status NOT IN ('cancelled', 'completed')
  `);

  for (const tour of result.rows) {
    try {
      await checkTourRisks(tour.id, tour.company_id);
      console.log(`✅ Checked risks for tour ${tour.id}`);
    } catch (err) {
      console.error(`❌ Failed to check tour ${tour.id}:`, err);
    }
  }
}

// Запускать каждый час через node-cron:
import cron from "node-cron";
cron.schedule("0 * * * *", checkAllActiveToursRisks);
```

### Real-time уведомления (SSE)

Интегрировать с существующим EventHub:

```javascript
// В riskEngine.js после сохранения рисков:
import { eventHub } from "./eventHub";

// Опубликовать событие о новых рисках
eventHub.publish(`tour:${tourId}:risks-updated`, {
  tourId,
  risksCount: allRisks.length,
  criticalCount: allRisks.filter(r => r.severity === 'critical').length
});

// В компоненте AlertsWidget.jsx подписаться:
useTourEvents(companyId, (event) => {
  if (event.type === 'risks-updated') {
    fetchRisks(); // Обновить список рисков
  }
});
```

---

## 📁 Структура файлов

```
apps/web/src/
├── lib/
│   └── riskEngine.js          # Логика детекции рисков
├── pages/api/v1/
│   ├── risks/
│   │   ├── list.js            # GET список рисков компании
│   │   └── check/[tourId].js  # POST ручная проверка тура
│   └── tours/
│       ├── create.js          # ✅ Автопроверка при создании
│       └── update.js          # ✅ Автопроверка при обновлении
└── components/owner/dashboard/
    └── AlertsWidget.jsx       # UI виджет рисков

database/
└── migrations/
    └── 004_tour_risks_neon.sql  # Схема БД (таблица + view)
```

---

## 🚀 Миграция и запуск

### 1. Применить миграцию

```bash
# Подключиться к Neon БД
psql "postgresql://user:pass@host/db"

# Выполнить миграцию
\i database/migrations/004_tour_risks_neon.sql
```

### 2. Проверить таблицу

```sql
SELECT * FROM tour_risks LIMIT 1;
```

### 3. Создать тестовый тур без гида

```bash
curl -X POST http://localhost:3000/api/v1/tours/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "...",
    "name": "Тестовый тур",
    "start_date": "2024-06-01",
    "tourists_count": 5
  }'
```

### 4. Проверить риски

```sql
SELECT risk_type, severity, message 
FROM tour_risks 
WHERE company_id = '...';

-- Ожидается: риск "no_guide" с severity="critical"
```

### 5. Открыть дашборд

```
http://localhost:3000/owner/dashboard
```

Виджет "Alerts & Risks" должен показать красный риск "Нет назначенного гида".

---

## 🔍 Отладка

### Логи в консоли сервера

```javascript
[Risks] Checked tour a1b2c3d4-...
[Risks] Found 2 risks: critical=1, high=1
```

### Если виджет показывает "Загрузка рисков..."

1. Проверить, что таблица `tour_risks` существует:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'tour_risks';
   ```

2. Проверить, что API возвращает данные:
   ```bash
   curl http://localhost:3000/api/v1/risks/list?companyId=...
   ```

3. Проверить консоль браузера на ошибки JS

### Если риски не детектируются

1. Проверить логи:
   ```bash
   # В консоли сервера должно быть:
   [Risks] Checked tour ...
   ```

2. Вызвать вручную:
   ```bash
   curl -X POST http://localhost:3000/api/v1/risks/check/TOUR_UUID \
     -H "Authorization: Bearer $TOKEN"
   ```

3. Проверить рабочую логику в `riskEngine.js`:
   ```javascript
   // Добавить console.log для отладки
   console.log('[Debug] Tour data:', tour);
   console.log('[Debug] Detected risks:', allRisks);
   ```

---

## ✅ Итого

**Работа системы**:
1. ✅ Пользователь создает/обновляет тур → автоматически вызывается `checkTourRisks()`
2. ✅ Risk Engine анализирует тур по 20+ правилам в 5 категориях (A-E)
3. ✅ Найденные риски сохраняются в `tour_risks` таблицу
4. ✅ `AlertsWidget` загружает риски через `/api/v1/risks/list`
5. ✅ Отображает критические/высокие риски с кнопками действий
6. ✅ При исправлении проблемы → риск автоматически удаляется

**Никаких ручных действий не требуется** — система работает полностью автоматически!
