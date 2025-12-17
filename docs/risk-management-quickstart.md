# Быстрый запуск системы рисков

## 🚀 Шаг 1: Применить миграцию БД

```bash
# Подключиться к вашей Neon БД
psql "postgresql://[ваш connection string]"

# Выполнить миграцию
\i database/migrations/004_tour_risks_neon.sql

# Проверить создание таблицы
\dt tour_risks
```

## ✅ Шаг 2: Перезапустить Next.js

```bash
# В папке apps/web
npm run dev
```

## 🧪 Шаг 3: Протестировать

### Вариант А: Создать тур через UI
1. Откройте админ-панель компании
2. Создайте новый тур **без назначения гида**
3. Откройте `/owner/dashboard`
4. В виджете "Alerts & Risks" должен появиться красный риск "Нет назначенного гида"

### Вариант Б: Проверить через API

```bash
# 1. Получить токен авторизации
TOKEN="ваш_jwt_token"

# 2. Создать тестовый тур без гида
curl -X POST http://localhost:3000/api/v1/tours/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "UUID_вашей_компании",
    "name": "Тест риски",
    "start_date": "2024-06-15",
    "tourists_count": 5
  }'

# 3. Проверить риски в БД
psql "..." -c "SELECT risk_type, severity, message FROM tour_risks ORDER BY detected_at DESC LIMIT 3;"

# 4. Получить риски через API
curl "http://localhost:3000/api/v1/risks/list?companyId=UUID_компании" \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 Шаг 4: Проверить результат

### В БД должна быть запись:
```sql
risk_type  | severity | message
-----------+----------+---------------------------------------
no_guide   | critical | Нет назначенного гида для тура "Тест риски"
```

### В дашборде:
![](https://via.placeholder.com/600x150/ff4444/ffffff?text=КРИТИЧЕСКИЙ+РИСК:+Нет+гида)

---

## 🎯 Что происходит автоматически

- ✅ При создании тура → проверка рисков
- ✅ При обновлении тура → проверка рисков
- ✅ Риски сохраняются в `tour_risks`
- ✅ AlertsWidget показывает только критические и высокие риски
- ✅ При исправлении проблемы риск автоматически исчезает

---

## ❓ Проблемы?

### "Таблица tour_risks не существует"
→ Выполните миграцию `004_tour_risks_neon.sql`

### "Виджет показывает Загрузка рисков..."
→ Проверьте, что передается `companyId`:
```javascript
// В owner.js должно быть:
<AlertsWidget companyId={companyId} />
```

### "Риски не детектируются"
→ Проверьте логи сервера:
```bash
[Risks] Checked tour a1b2c3...
[Risks] Found 1 risks: critical=1
```

---

## 📚 Полная документация

См. `docs/risk-management-workflow.md` для:
- Архитектуры системы
- Всех 5 категорий рисков (A-E)
- Интеграции с SSE для real-time
- Настройки cron для периодической проверки
