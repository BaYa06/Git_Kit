# 🚨 Система управления рисками туров

Полностью рабочая система для обнаружения критических рисков и проблем в турах.

## 📋 Что создано

### 1. База данных
- **Таблица `tour_risks`** — хранение всех рисков
- **Представление `v_open_risks`** — открытые риски с данными туров
- **Индексы** для быстрого поиска по severity, status, due_at
- **Триггеры** для автообновления updated_at

### 2. Backend (Risk Engine)
- **`/lib/riskEngine.js`** — логика проверки всех категорий рисков:
  - ✅ A. Подготовка тура (нет гида, транспорта, отеля)
  - ✅ B. Конфликты ресурсов (двойное бронирование)
  - ✅ C. Туристы и документы (неполный список)
  - ✅ D. Финансовые риски (долги, низкие предоплаты)
  - ✅ E. Качество сервиса (жалобы, низкие оценки)

### 3. API Endpoints
- **POST `/api/v1/risks/check/:tourId`** — проверить риски тура
- **GET `/api/v1/risks/list`** — получить риски компании

### 4. Frontend
- **`AlertsWidget`** — виджет критических рисков в дашборде
- Автообновление каждые 2 минуты
- Фильтрация по severity (critical/warning/attention)
- Переход к туру по клику на кнопку действия

---

## 🚀 Установка

### Шаг 1: Применить миграцию

```bash
# Из корня проекта
chmod +x scripts/setup-risk-system.sh
./scripts/setup-risk-system.sh
```

Или вручную:

```bash
psql $DATABASE_URL -f database/migrations/004_tour_risks.sql
```

### Шаг 2: Перезапустить сервер

```bash
cd apps/web
npm run dev
```

### Шаг 3: Открыть дашборд

```
http://localhost:3000/owner/dashboard
```

---

## 📊 Как это работает

### Автоматическая проверка рисков

```javascript
import { checkTourRisks } from '@/lib/riskEngine';

// Проверить все риски тура
const risks = await checkTourRisks(tourId, companyId);

// Результат:
// [
//   {
//     risk_type: 'missing_guide',
//     severity: 'critical',
//     title: 'Не назначен гид',
//     description: 'Тур начинается через 18 часов...',
//     due_at: '2025-12-18T08:00:00Z',
//     metadata: { hours_to_departure: 18 }
//   }
// ]
```

### Получение рисков компании

```javascript
// GET /api/v1/risks/list?company_id=123&severity=critical
const response = await fetch('/api/v1/risks/list?company_id=123');
const data = await response.json();

// data.grouped.critical — критичные риски
// data.grouped.warning — важные
// data.grouped.attention — обратить внимание
```

---

## 🎯 Типы рисков

### A. Подготовка тура

| Risk Type | Severity | Условие |
|-----------|----------|---------|
| `missing_guide` | critical | Нет гида за <24ч до выезда |
| `missing_vehicle` | critical | Нет транспорта за <24ч |
| `missing_hotel` | critical | Нет отеля для overnight тура |

### B. Конфликты ресурсов

| Risk Type | Severity | Условие |
|-----------|----------|---------|
| `guide_conflict` | critical | Гид в двух турах одновременно |
| `vehicle_conflict` | critical | Транспорт в двух турах |
| `guide_overload` | attention | >4 туров за 7 дней |

### C. Туристы и документы

| Risk Type | Severity | Условие |
|-----------|----------|---------|
| `tourists_incomplete` | warning | Заполнено <80% списка |
| `tourists_missing_data` | warning | Пустые ФИО или телефоны |

### D. Финансовые риски

| Risk Type | Severity | Условие |
|-----------|----------|---------|
| `high_debt_before_tour` | critical | Долг >20% за <24ч |
| `low_deposit` | warning | Предоплата <30% |

### E. Качество

| Risk Type | Severity | Условие |
|-----------|----------|---------|
| `unresolved_complaint` | warning | Жалоба открыта >48ч |
| `low_rating` | attention | Рейтинг <4.0 |

---

## 🔧 Настройка порогов

Отредактируйте константы в `/lib/riskEngine.js`:

```javascript
const CONFIG = {
  criticalHoursBefore: 24,      // критично за 24ч
  warningHoursBefore: 48,       // предупреждение за 48ч
  maxDebtPercent: 20,           // макс. долг 20%
  minDepositPercent: 30,        // мин. предоплата 30%
  minTouristsFillPercent: 80,   // мин. заполнение 80%
  maxGuideTours7Days: 4,        // макс. туров на гида
  minAcceptableRating: 4.0,     // мин. рейтинг
  maxComplaintHours: 48,        // макс. время жалобы
};
```

---

## 🔄 Интеграция с другими системами

### 1. Проверка при сохранении тура

```javascript
// В save.js после успешного сохранения
import { checkTourRisks } from '@/lib/riskEngine';

await checkTourRisks(tourId, companyId);
// Риски автоматически сохранятся в tour_risks
```

### 2. Cron-задача для периодической проверки

```javascript
// Проверять все активные туры каждый час
import { checkTourRisks } from '@/lib/riskEngine';

async function checkAllTours() {
  const tours = await getTours({ status: 'active' });
  for (const tour of tours) {
    await checkTourRisks(tour.id, tour.company_id);
  }
}

setInterval(checkAllTours, 3600000); // каждый час
```

### 3. Real-time обновления через SSE

```javascript
// После обновления рисков
import eventHub from '@/lib/eventHub';

await checkTourRisks(tourId);
eventHub.publishToCompany(companyId, 'risks_updated', { tourId });
```

---

## 📱 Пример использования в UI

```jsx
import AlertsWidget from '@/components/owner/dashboard/AlertsWidget';

function Dashboard() {
  const handleRiskAction = (risk) => {
    // Переход к туру для исправления
    router.push(`/tours/${risk.tour_id}`);
  };

  return (
    <AlertsWidget 
      companyId={123} 
      onAction={handleRiskAction} 
    />
  );
}
```

---

## 🧪 Тестирование

### 1. Создать тестовый тур с рисками

```sql
-- Тур через 20 часов без гида
INSERT INTO tours (company_id, name, start_date, tourists_count)
VALUES (1, 'Тест', NOW() + INTERVAL '20 hours', 25);
```

### 2. Проверить риски

```bash
curl -X POST http://localhost:3000/api/v1/risks/check/123 \
  -H "Cookie: gidkit_token=<your_token>" \
  -H "Content-Type: application/json" \
  -d '{"companyId": 1}'
```

### 3. Посмотреть результат

```sql
SELECT * FROM tour_risks WHERE tour_id = 123;
```

---

## 📈 Дальнейшее развитие

### Приоритет 1: Уведомления
- [ ] Email при критичных рисках
- [ ] Telegram-бот для алертов
- [ ] Push-уведомления в браузере

### Приоритет 2: Автоматизация
- [ ] Cron для проверки всех туров
- [ ] Авто-напоминания менеджерам
- [ ] Эскалация просроченных рисков

### Приоритет 3: Аналитика
- [ ] Дашборд трендов рисков
- [ ] Рейтинг менеджеров по рискам
- [ ] Экспорт отчётов

---

## 🐛 Troubleshooting

### Риски не появляются в дашборде

1. Проверьте что миграция применена: `\d tour_risks`
2. Проверьте что API работает: `curl http://localhost:3000/api/v1/risks/list?company_id=1`
3. Проверьте консоль браузера на ошибки

### Ошибка "Access denied"

Убедитесь что пользователь имеет роль `owner` или `admin` в `user_company_roles`.

### Риски не обновляются

Risk Engine пересчитывает риски **только при вызове**. Настройте cron или вызывайте после изменений тура.

---

## 📞 Поддержка

По вопросам обращайтесь к документации или изучите код:
- [/lib/riskEngine.js](../apps/web/src/lib/riskEngine.js) — логика
- [/pages/api/v1/risks/](../apps/web/src/pages/api/v1/risks/) — API
- [/components/owner/dashboard/AlertsWidget.jsx](../apps/web/src/components/owner/dashboard/AlertsWidget.jsx) — UI
