export default function EmptyState({ 
  icon = 'inbox', 
  title = 'Пусто', 
  description = '', 
  action = null 
}) {
  return (
    <div className="py-16 text-center">
      <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 block">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      {action && action}
    </div>
  );
}
