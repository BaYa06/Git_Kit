export default function HelpTabs({ tabs, activeId, onChange }) {
  return (
    <div className="flex border-b border-white/10">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId || tab.active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={`relative px-6 py-3 text-sm font-medium transition-colors ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
