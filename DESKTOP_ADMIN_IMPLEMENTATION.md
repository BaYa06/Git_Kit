# Реализация Desktop Admin UI

## ✅ Выполнено

### 1. Структура компонентов
Создано 8 новых компонентов в `src/components/company/admin/desktop/`:

- **DesktopAdminLayout.jsx** - Главный layout с header, sidebar и content area
- **DesktopHeader.jsx** - Sticky header с логотипом, профилем пользователя и уведомлениями
- **DesktopSidebar.jsx** - Фиксированная боковая навигация (Дашборд, Туры, База, Шаблоны)
- **DesktopDashboard.jsx** - Главная страница с поиском и grid layout
- **DesktopKPICards.jsx** - 4 KPI карточки (Active Tours, Guides, Hotels, Occupancy)
- **DesktopUpcomingTours.jsx** - Таблица ближайших туров с фильтрами
- **DesktopQuickActions.jsx** - Виджет быстрых действий
- **DesktopAlerts.jsx** - Виджет уведомлений (интегрирован с системой рисков)

### 2. Responsive Design
- Добавлена проверка в [admin.js](../../../pages/company/[id]/admin.js) с использованием `useIsDesktop()`
- При экране >= 768px показывается новый desktop UI
- При экране < 768px показывается существующая мобильная версия
- Компоненты полностью разделены, без пересечений

### 3. Стили и дизайн
- Создан [desktop.css](../../../styles/admin/desktop.css) с glassmorphic стилями
- Цветовая схема:
  - Primary: #652de6 (фиолетовый)
  - Background: #111621 (темный)
  - Surface: #1F2937 (серый)
- Эффекты: backdrop blur, прозрачные карточки, тени с primary цветом
- Material Symbols Icons (уже подключены в _document.js)

### 4. Функциональность
✅ Навигация между разделами (Dashboard, Туры, База, Шаблоны)
✅ Поиск по турам, гидам, отелям
✅ KPI метрики с трендами
✅ Фильтрация туров по дням (сегодня, завтра, послезавтра)
✅ Клик по туру → навигация на страницу тура
✅ Быстрые действия (создание тура, добавление гида/отеля/транспорта)
✅ Виджет уведомлений с интеграцией рисков
✅ Кнопка "Назад" в header

## Технические детали

### Используемые технологии
- **React** - компоненты
- **Next.js Pages Router** - роутинг
- **Tailwind CSS** - стилизация
- **Material Symbols** - иконки
- **Custom hooks** - useMediaQuery для responsive design

### Breakpoints
```javascript
// useMediaQuery.js
const breakpoints = {
  sm: '640px',
  md: '768px',   // Desktop версия включается здесь
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

### Grid Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header (sticky, h-16)                                   │
├──────────┬──────────────────────────────────────────────┤
│          │ Main Content (overflow-y-auto)               │
│ Sidebar  │ ┌────────────────────────────────────────┐   │
│ (w-64)   │ │ Search Bar                             │   │
│          │ ├────────────────────────────────────────┤   │
│ - Dash   │ │ KPI Cards (grid-cols-4)                │   │
│ - Tours  │ ├────────────┬───────────────────────────┤   │
│ - Base   │ │ Upcoming   │ Quick Actions & Alerts    │   │
│ - Tmpls  │ │ Tours      │ (col-span-4)              │   │
│          │ │ (col-span-8│                           │   │
│ ------   │ │            │                           │   │
│ - Help   │ │            │                           │   │
│ - Logout │ │            │                           │   │
└──────────┴─────────────┴───────────────────────────┴───┘
```

## Данные

### Props передаваемые в DesktopAdminLayout
```javascript
{
  company: { id, name, ... },
  user: { name, avatar, ... },
  role: 'owner' | 'admin' | ...,
  guides: [...],
  hotels: [...],
  drivers: [...],
  tours: [...],
  companyId: uuid
}
```

### Mock данные (временные)
Пока используются mock данные в компонентах:
- KPI: 14 active tours, 8/24 guides, 23 hotels, 85% occupancy
- Tours: 4 примера туров с разными статусами
- Alerts: 3 примера уведомлений

### Интеграция с реальными данными
TODO: Подключить API endpoints для:
- [ ] Real-time KPI статистики
- [ ] Фильтрация туров по датам из базы
- [ ] Система рисков (уже есть в проекте)
- [ ] Поиск через API

## Как запустить

1. Убедитесь что dev сервер запущен:
```bash
npm run dev -- -p 3005 --hostname 0.0.0.0
```

2. Откройте админ-панель компании:
```
http://localhost:3005/company/[id]/admin
```

3. Измените размер окна:
   - **>= 768px** → показывается новый desktop UI
   - **< 768px** → показывается мобильная версия

## Следующие шаги

### Срочные задачи
- [ ] Тестирование на разных разрешениях
- [ ] Проверка работы навигации
- [ ] Интеграция системы рисков в DesktopAlerts

### Дополнительные улучшения
- [ ] Анимации при переключении табов
- [ ] Drag & drop для быстрых действий
- [ ] Уведомления в реальном времени (SSE)
- [ ] Экспорт данных (PDF, Excel)
- [ ] Темная/светлая тема (сейчас только темная)

### Новые разделы
- [ ] "Все туры" - полный список с фильтрами
- [ ] "База" - управление гидами, отелями, транспортом
- [ ] "Шаблоны" - CRUD для шаблонов туров

## Файлы изменены

### Новые файлы
```
src/components/company/admin/desktop/
├── DesktopAdminLayout.jsx
├── DesktopHeader.jsx
├── DesktopSidebar.jsx
├── DesktopDashboard.jsx
├── DesktopKPICards.jsx
├── DesktopUpcomingTours.jsx
├── DesktopQuickActions.jsx
├── DesktopAlerts.jsx
└── README.md

src/styles/admin/
└── desktop.css (новый)
```

### Измененные файлы
```
src/pages/company/[id]/admin.js
└── Добавлен conditional rendering: desktop vs mobile
```

## Заметки разработчика

- Все компоненты используют **functional components** с hooks
- Стили применяются через **Tailwind CSS** классы
- Material Symbols уже подключены глобально в `_document.js`
- useMediaQuery hook использует `window.matchMedia` для определения breakpoint
- Desktop и mobile версии полностью изолированы
