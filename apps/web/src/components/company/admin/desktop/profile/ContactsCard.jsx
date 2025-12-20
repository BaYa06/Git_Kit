export default function ContactsCard({ data }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Контакты</h3>
        <button className="text-primary hover:text-white transition" type="button">
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Рабочий Email</span>
            <span className="text-sm text-white font-medium">{data.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined">phone_iphone</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Мобильный телефон</span>
            <span className="text-sm text-white font-medium">{data.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined">send</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Telegram</span>
            <span className="text-sm text-white font-medium hover:text-primary cursor-pointer transition">
              {data.telegram}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
