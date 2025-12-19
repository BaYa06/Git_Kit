# Desktop Admin Structure

## Структура папок

```
desktop/
├── DesktopAdminLayout.jsx    - Главный layout с маршрутизацией
├── DesktopHeader.jsx          - Header (профиль, уведомления)
├── DesktopSidebar.jsx         - Навигация
├── DesktopDashboard.jsx       - Дашборд (главная страница)
├── DesktopKPICards.jsx        - KPI метрики
├── DesktopUpcomingTours.jsx   - Виджет ближайших туров
├── DesktopQuickActions.jsx    - Виджет быстрых действий
├── DesktopAlerts.jsx          - Виджет уведомлений/рисков
│
├── tours/                     - Раздел "Все туры"
│   └── ToursPage.jsx          - Список всех туров с фильтрами
│
├── base/                      - Раздел "База данных"
│   └── BasePage.jsx           - Управление гидами, отелями, транспортом
│
├── templates/                 - Раздел "Шаблоны"
│   └── TemplatesPage.jsx      - Управление шаблонами туров
│
└── shared/                    - Общие компоненты
    ├── EmptyState.jsx         - Пустое состояние
    ├── LoadingSpinner.jsx     - Индикатор загрузки
    └── SearchBar.jsx          - Компонент поиска
```

## Компоненты по разделам

### Dashboard (Главная)
- **DesktopDashboard** - основной контейнер
- **DesktopKPICards** - 4 метрики (туры, гиды, отели, заполняемость)
- **DesktopUpcomingTours** - таблица ближайших туров
- **DesktopQuickActions** - быстрые действия
- **DesktopAlerts** - уведомления и риски

### Tours (Все туры)
- **ToursPage** - список всех туров
  - Фильтры: поиск, статус, дата
  - Таблица с колонками: название, даты, гид, статус, участники
  - Кнопка создания нового тура

### Base (База данных)
- **BasePage** - управление базой данных
  - Табы: Гиды, Отели, Транспорт
  - Карточки с информацией
  - Кнопки добавления новых записей

### Templates (Шаблоны)
- **TemplatesPage** - управление шаблонами
  - Поиск по шаблонам
  - Grid карточек шаблонов
  - Кнопки: создать, использовать, редактировать

## Shared Components

### EmptyState
Пустое состояние с иконкой и текстом:
```jsx
<EmptyState
  icon="inbox"
  title="Пусто"
  description="Данные не найдены"
  action={<button>Создать</button>}
/>
```

### LoadingSpinner
Индикатор загрузки:
```jsx
<LoadingSpinner size="md" text="Загрузка..." />
```

### SearchBar
Компонент поиска:
```jsx
<SearchBar
  value={query}
  onChange={setQuery}
  placeholder="Поиск..."
/>
```

## Навигация

Маршрутизация управляется через `activeTab` в **DesktopAdminLayout**:
- `dashboard` → DesktopDashboard
- `tours` → ToursPage
- `base` → BasePage
- `templates` → TemplatesPage

## Добавление нового раздела

1. Создайте папку в `desktop/` (например, `reports/`)
2. Создайте главный компонент (например, `ReportsPage.jsx`)
3. Импортируйте в **DesktopAdminLayout.jsx**
4. Добавьте в `renderContent()` switch case
5. Добавьте кнопку в **DesktopSidebar.jsx**

## Стили

Все компоненты используют:
- **Tailwind CSS** для стилизации
- **Material Symbols** для иконок
- **Glass-card** эффект (из `/styles/admin/desktop.css`)
- **Primary color**: `#652de6`

## TODO

- [ ] Подключить реальные данные из API
- [ ] Добавить модалки создания/редактирования
- [ ] Реализовать детальные страницы
- [ ] Добавить пагинацию для больших списков
- [ ] Добавить фильтры и сортировки
- [ ] Реализовать экспорт данных
