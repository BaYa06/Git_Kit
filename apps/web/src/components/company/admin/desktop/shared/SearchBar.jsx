export default function SearchBar({ 
  value = '', 
  onChange, 
  placeholder = 'Поиск...', 
  className = '' 
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-dark/50 border border-white/10 text-white text-sm placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
      />
    </div>
  );
}
