const toneClasses = {
  blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
  purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
  emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
  orange: 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
  pink: 'bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
  teal: 'bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
};

export default function HelpCategories({ categories }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="glass-card glass-card-hover rounded-2xl p-6 cursor-pointer group transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                toneClasses[cat.tone] || 'bg-white/5 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
            </div>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-gray-300 transition-colors">
              arrow_outward
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{cat.description}</p>
        </div>
      ))}
    </div>
  );
}
