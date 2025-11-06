# Git Kit (Node.js Monorepo, JS)

Monorepo: `web` (Next.js), `api` (Fastify), `packages` (config/lib/pdf/schemas/api-client),
и SQL-файлы для Postgres (`database/schema.sql`, `database/seed.sql` — по 1 записи в каждую таблицу).

## Быстрый старт (локально)

1) Установи Docker и запусти инфраструктуру:
```bash
docker compose -f infra/docker-compose.yml up -d
```

2) Создай БД и тестовые данные:
```bash
# если установлен psql и доступна DATABASE_URL из .env
cp .env.example .env
export $(grep -v '^#' .env | xargs)  # загрузим переменные
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

3) Установка зависимостей и запуск:
```bash
npm i
npm run dev
```
- API: http://localhost:3001 (Fastify)
- Web: http://localhost:3000 (Next.js)

## Деплой БД на Vercel Postgres (Neon)

- Открой консоль SQL (Vercel/Neon), выполни по очереди `database/schema.sql` и `database/seed.sql`.
- Обнови `DATABASE_URL` в `.env` на URL от Vercel Postgres.

## Формы
- `/register`: Имя, Фамилия, Email, Телефон (+996 шаблон), Пароль → сообщение об успехе.
- `/login`: Логин (Email) и Пароль → сообщение об успехе.

Пароли хэшируются `bcryptjs`. Авторизация простая (без куки/JWT) — для MVP.

## Важно
- Это «скелет» большого проекта: добавляй сервисы/пакеты, не ломая структуру.
- Все таблицы созданы и засеяны одной записью (см. `seed.sql`).
