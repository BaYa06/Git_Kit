# Desktop Admin Components

Новая десктоп-версия админ-панели с современным дизайном в стиле glassmorphism.

## Структура компонентов

```
desktop/
├── DesktopAdminLayout.jsx    - Главный layout (header + sidebar + content)
├── DesktopHeader.jsx          - Header с профилем и уведомлениями
├── DesktopSidebar.jsx         - Боковая навигация
├── DesktopDashboard.jsx       - Контент дашборда
├── DesktopKPICards.jsx        - 4 KPI метрики
├── DesktopUpcomingTours.jsx   - Таблица ближайших туров
├── DesktopQuickActions.jsx    - Виджет быстрых действий
└── DesktopAlerts.jsx          - Виджет уведомлений/рисков
```

## Использование

В [admin.js](../../../../pages/company/[id]/admin.js) добавлена проверка размера экрана:

```jsx
const isDesktop = useIsDesktop();

if (isDesktop) {
  return <DesktopAdminLayout ... />;
}

// Иначе показывается мобильная версия
```

## Дизайн-система

### Цвета
- **Primary**: `#652de6` (фиолетовый)
- **Background**: `#111621` (темный синий)
- **Surface**: `#1F2937` (серый)
- **Border**: `rgba(255,255,255,0.10)` (полупрозрачный белый)

### Эффекты
- **Glass card**: `backdrop-filter: blur(12px)` + полупрозрачный фон
- **Тени**: shadow-primary с разной прозрачностью (20%, 25%, 40%)
- **Hover**: `bg-white/5` для интерактивных элементов

### Иконки
- **Material Symbols Outlined** от Google Fonts
- Настройка: `font-variation-settings: 'FILL' 0|1, 'wght' 400`

## Breakpoints

- **Desktop**: >= 768px (md)
- **Mobile**: < 768px

## Функциональность

### KPI Cards
Отображают ключевые метрики:
- Active Tours (активные туры)
- Available Guides (доступные гиды)
- Partner Hotels (партнерские отели)
- Plan Occupancy (заполняемость)

### Upcoming Tours
- Фильтры по дням (сегодня, завтра, послезавтра)
- Статусы: Confirmed, Planned, In Progress
- Клик по туру → переход на страницу тура

### Quick Actions
- Создать тур из шаблона
- Добавить гида
- Добавить отель
- Добавить транспорт

### Alerts
- Интеграция с системой рисков
- Отображение уведомлений с иконками
- Счётчик непрочитанных

## TODO

- [ ] Подключить реальные данные для KPI
- [ ] Интегрировать систему рисков в DesktopAlerts
- [ ] Добавить функционал поиска
- [ ] Реализовать разделы "Все туры", "База", "Шаблоны"
- [ ] Добавить анимации и transitions
- [ ] Оптимизировать для планшетов (768px - 1024px)
