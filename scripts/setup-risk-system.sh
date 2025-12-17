#!/bin/bash
# Script: Запуск миграции tour_risks и начальная проверка

set -e

echo "🚀 Установка системы управления рисками..."
echo ""

# Проверяем наличие DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Ошибка: DATABASE_URL не установлен"
  echo "Установите переменную окружения DATABASE_URL"
  exit 1
fi

echo "📊 Применение миграции tour_risks..."
psql "$DATABASE_URL" -f database/migrations/004_tour_risks.sql

if [ $? -eq 0 ]; then
  echo "✅ Миграция успешно применена"
else
  echo "❌ Ошибка применения миграции"
  exit 1
fi

echo ""
echo "🔍 Проверка созданных объектов..."

# Проверяем таблицу
psql "$DATABASE_URL" -c "\d tour_risks" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Таблица tour_risks создана"
else
  echo "❌ Таблица tour_risks не найдена"
  exit 1
fi

# Проверяем представление
psql "$DATABASE_URL" -c "\d v_open_risks" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Представление v_open_risks создано"
else
  echo "❌ Представление v_open_risks не найдено"
  exit 1
fi

echo ""
echo "✨ Система управления рисками установлена!"
echo ""
echo "Следующие шаги:"
echo "1. Перезапустите Next.js сервер: npm run dev"
echo "2. Откройте дашборд владельца: http://localhost:3000/owner/dashboard"
echo "3. Проверьте виджет 'Критические риски'"
echo ""
echo "📝 Для ручной проверки рисков тура выполните:"
echo "   curl -X POST http://localhost:3000/api/v1/risks/check/<tour_id> \\"
echo "        -H 'Cookie: gidkit_token=<your_token>'"
