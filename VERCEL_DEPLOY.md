# Deployment Instructions

## ✅ Исправлены проблемы для деплоя в Vercel

### Что было исправлено:
1. ✅ Добавлен `turbo` в devDependencies
2. ✅ Исправлен неправильный импорт в guide.js
3. ✅ Добавлены build скрипты для всех пакетов
4. ✅ Настроен transpilePackages в next.config.js
5. ✅ Создан правильный vercel.json для монорепо
6. ✅ Билд проходит успешно ✨

---

## Vercel Deployment

### Настройка через Dashboard:
1. Зайдите на [vercel.com](https://vercel.com) и войдите в аккаунт
2. Нажмите **"Add New Project"** → **"Import Git Repository"**
3. Выберите ваш репозиторий
4. **НЕ МЕНЯЙТЕ настройки** - vercel.json все сделает автоматически
5. Добавьте переменные окружения:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `JWT_SECRET` - секретный ключ для JWT (любая длинная строка)
   - `BLOB_READ_WRITE_TOKEN` - токен Vercel Blob (опционально)
6. Нажмите **"Deploy"**

### Переменные окружения (обязательные):
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Переменные окружения (опциональные):
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
```

---

## Важные замечания:

### ⚠️ API приложение (apps/api):
- **НЕ деплоится** на Vercel автоматически
- Если нужно - деплойте отдельно на:
  - [Railway](https://railway.app) (рекомендуется)
  - [Render](https://render.com)
  - [Fly.io](https://fly.io)

### 🗄️ База данных:
- Используйте [Neon](https://neon.tech) - бесплатный Postgres для Vercel
- Или [Supabase](https://supabase.com)
- Или [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

### 🔧 Локальная разработка:
```bash
npm install
npm run dev
```

---

## Решение проблем:

### Ошибка "Module not found":
- ✅ Уже исправлено в коммите

### Ошибка "turbo command not found":
- ✅ Добавлен turbo в devDependencies

### Build failed:
- Проверьте переменные окружения в Vercel Dashboard
- Убедитесь что DATABASE_URL доступен извне

