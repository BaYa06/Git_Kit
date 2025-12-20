export default function HelpSearch({ value, onChange, onClear }) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl relative">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-5 text-gray-400 text-[24px]">search</span>
          <input
            className="h-14 w-full rounded-full border border-white/10 bg-white/5 pl-14 pr-12 text-base text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            placeholder="Поиск по статьям: 'как создать тур', 'как добавить гида'..."
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              onClear?.();
            }}
            className="absolute right-4 p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
