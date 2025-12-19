# Структура компонентов Admin

## 📁 Организация файлов

```
components/company/admin/
├── mobile/                          ← Мобильная версия (<768px)
│   ├── BaseTab.js
│   ├── DashboardTab.js
│   ├── DesktopDashboard.js
│   ├── TemplateEditor.js
│   ├── TemplatesTab.js
│   └── ToursTab.js
│
└── desktop/                         ← Десктопная версия (≥768px)
    └── (будет создано позже)
```

## 🎯 Правила использования

### Mobile компоненты
- Используются для экранов **< 768px**
- Оптимизированы для touch интерфейсов
- Bottom navigation
- Вертикальная компоновка

### Desktop компоненты
- Используются для экранов **≥ 768px**
- Sidebar navigation
- Горизонтальная компоновка
- Дополнительные функции

## 🔄 Адаптивность

Используйте hook `useMediaQuery` для определения устройства:

```jsx
import { useIsDesktop, useIsMobile } from '@/hooks/useMediaQuery';

function AdminDashboard() {
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();
  
  if (isDesktop) {
    return <DesktopDashboard />;
  }
  
  return <MobileDashboard />;
}
```

## 📱 Breakpoints

- **Mobile**: `< 768px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `≥ 1024px`

## ⚠️ Важно

- Не смешивайте mobile и desktop компоненты
- Общие компоненты выносите в `/shared`
- Используйте единый источник стилей (Tailwind)
