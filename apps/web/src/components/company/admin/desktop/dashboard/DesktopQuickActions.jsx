import { useRouter } from 'next/router';

export default function DesktopQuickActions({ companyId, onCreateTour }) {
  const router = useRouter();

  const handleCreateTour = () => {
    if (onCreateTour) {
      onCreateTour();
    } else {
      router.push(`/company/${companyId}/tours/create`);
    }
  };

  const handleAddGuide = () => {
    router.push(`/company/${companyId}/guides/add`);
  };

  const handleAddHotel = () => {
    router.push(`/company/${companyId}/hotels/add`);
  };

  const handleAddTransport = () => {
    router.push(`/company/${companyId}/transport/add`);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Быстрые действия</h3>
      
      <button
        onClick={handleCreateTour}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Создать тур из шаблона
      </button>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleAddGuide}
          className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-500">group_add</span>
            Добавить гида
          </div>
          <span className="material-symbols-outlined text-gray-600 text-[18px]">
            arrow_forward
          </span>
        </button>
        
        <button
          onClick={handleAddHotel}
          className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-500">domain_add</span>
            Добавить отель
          </div>
          <span className="material-symbols-outlined text-gray-600 text-[18px]">
            arrow_forward
          </span>
        </button>
        
        <button
          onClick={handleAddTransport}
          className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-500">directions_bus</span>
            Добавить транспорт
          </div>
          <span className="material-symbols-outlined text-gray-600 text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
