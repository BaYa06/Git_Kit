export default function PersonalCard({ data }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Личные данные</h3>
        <button className="text-primary hover:text-white transition" type="button">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 items-center">
          <span className="text-sm text-gray-500">Полное имя</span>
          <span className="text-sm text-white col-span-2 font-medium">{data.fullName}</span>
        </div>
        <div className="grid grid-cols-3 items-center">
          <span className="text-sm text-gray-500">Дата рождения</span>
          <span className="text-sm text-white col-span-2 font-medium">{data.birthDate}</span>
        </div>
        <div className="grid grid-cols-3 items-center">
          <span className="text-sm text-gray-500">Город</span>
          <span className="text-sm text-white col-span-2 font-medium">{data.city}</span>
        </div>
        <div className="grid grid-cols-3 items-start">
          <span className="text-sm text-gray-500 mt-1">Языки</span>
          <div className="col-span-2 flex flex-wrap gap-2">
            {data.languages?.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
