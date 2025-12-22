import { useEffect, useState } from 'react';
import InviteUserModal from '../../../../owner/team/InviteUserModal';
import GuidesTab from './GuidesTab';
import HotelsTab from './HotelsTab';
import TransportTab from './TransportTab';

function ModalShell({ open, title, children, onClose, onSubmit, submitLabel = 'Сохранить', submitting = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl glass-card border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form
          className="flex flex-col gap-4 px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          {children}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Сохраняем...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BasePage({ guides, hotels, drivers, companyId }) {
  const [activeTab, setActiveTab] = useState('guides');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [hotelList, setHotelList] = useState(hotels || []);
  const [driverList, setDriverList] = useState(drivers || []);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    phone: '',
    meal_plan: '',
    stars: '',
    address: '',
    checkin_from: '14:00',
    checkout_until: '12:00',
  });
  const [transportForm, setTransportForm] = useState({
    car_name: '',
    plate_number: '',
    seats: '',
    full_name: '',
    phone: '',
    notes: '',
  });
  const [hotelError, setHotelError] = useState(null);
  const [transportError, setTransportError] = useState(null);
  const [savingHotel, setSavingHotel] = useState(false);
  const [savingTransport, setSavingTransport] = useState(false);

  useEffect(() => {
    setHotelList(hotels || []);
  }, [hotels]);

  useEffect(() => {
    setDriverList(drivers || []);
  }, [drivers]);

  const handleAddClick = () => {
    if (activeTab === 'guides') {
      setInviteOpen(true);
      return;
    }
    if (activeTab === 'hotels') {
      setHotelError(null);
      setHotelModalOpen(true);
      return;
    }
    if (activeTab === 'transport') {
      setTransportError(null);
      setTransportModalOpen(true);
    }
  };

  useEffect(() => {
    if (activeTab !== 'guides' && inviteOpen) {
      setInviteOpen(false);
    }
    if (activeTab !== 'hotels' && hotelModalOpen) {
      setHotelModalOpen(false);
    }
    if (activeTab !== 'transport' && transportModalOpen) {
      setTransportModalOpen(false);
    }
  }, [activeTab, inviteOpen, hotelModalOpen, transportModalOpen]);

  const handleSaveHotel = async () => {
    if (!companyId) return;
    if (!hotelForm.name.trim()) {
      setHotelError('Введите название отеля');
      return;
    }

    setSavingHotel(true);
    setHotelError(null);
    try {
      const res = await fetch('/api/v1/company/hotels/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          name: hotelForm.name.trim(),
          stars: hotelForm.stars ? Number(hotelForm.stars) : null,
          phone: hotelForm.phone || null,
          meal_plan: hotelForm.meal_plan || null,
          address: hotelForm.address || null,
          checkin_from: hotelForm.checkin_from || null,
          checkout_until: hotelForm.checkout_until || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Не удалось сохранить отель');
      }

      const data = await res.json();
      if (data.hotel) {
        setHotelList((prev) => [data.hotel, ...prev]);
      }
      setHotelModalOpen(false);
      setHotelForm({
        name: '',
        phone: '',
        meal_plan: '',
        stars: '',
        address: '',
        checkin_from: '14:00',
        checkout_until: '12:00',
      });
    } catch (e) {
      console.error(e);
      setHotelError(e.message);
    } finally {
      setSavingHotel(false);
    }
  };

  const handleSaveTransport = async () => {
    if (!companyId) return;
    if (
      !transportForm.car_name.trim() ||
      !transportForm.full_name.trim() ||
      !transportForm.phone.trim() ||
      !transportForm.plate_number.trim() ||
      !transportForm.seats
    ) {
      setTransportError('Заполните марку, водителя, телефон, номер и количество мест');
      return;
    }

    setSavingTransport(true);
    setTransportError(null);
    try {
      const res = await fetch('/api/v1/company/drivers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          full_name: transportForm.full_name.trim(),
          phone: transportForm.phone.trim(),
          car_name: transportForm.car_name.trim(),
          plate_number: transportForm.plate_number.trim(),
          seats: Number(transportForm.seats),
          notes: transportForm.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Не удалось сохранить транспорт');
      }

      const data = await res.json();
      if (data.driver) {
        setDriverList((prev) => [data.driver, ...prev]);
      }
      setTransportModalOpen(false);
      setTransportForm({
        car_name: '',
        plate_number: '',
        seats: '',
        full_name: '',
        phone: '',
        notes: '',
      });
    } catch (e) {
      console.error(e);
      setTransportError(e.message);
    } finally {
      setSavingTransport(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">База</h1>
            <p className="text-sm text-gray-400">Справочники компании: гиды, отели и локации.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              {activeTab === 'transport' ? 'Экспорт CSV' : 'Экспорт'}
            </button>
            <div className="relative flex">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                {activeTab === 'transport' ? 'Добавить транспорт' : activeTab === 'hotels' ? 'Добавить отель' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center border-b border-white/10 bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('guides')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'guides'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Гиды
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {guides?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'hotels'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">hotel</span>
              Отели
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {hotelList?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'transport'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">directions_car</span>
              Транспорт
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
                {driverList?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'guides' && <GuidesTab guides={guides} />}
        {activeTab === 'hotels' && <HotelsTab hotels={hotelList} />}
        {activeTab === 'transport' && <TransportTab drivers={driverList} />}
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        companyId={companyId}
        allowedRoles={['guide']}
        variant="dark"
      />

      <ModalShell
        open={hotelModalOpen}
        title="Добавить отель"
        onClose={() => setHotelModalOpen(false)}
        onSubmit={handleSaveHotel}
        submitting={savingHotel}
      >
        {hotelError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs px-3 py-2">
            {hotelError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Название
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Grand Hotel"
              value={hotelForm.name}
              onChange={(e) => setHotelForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Телефон
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="+996 555 000 000"
              value={hotelForm.phone}
              onChange={(e) => setHotelForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Питание
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="BB / HB / AI"
              value={hotelForm.meal_plan}
              onChange={(e) => setHotelForm((prev) => ({ ...prev, meal_plan: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Звёзды
            <input
              type="number"
              min="0"
              max="5"
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="4"
              value={hotelForm.stars}
              onChange={(e) => setHotelForm((prev) => ({ ...prev, stars: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200 md:col-span-2">
            Адрес
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="г. Бишкек, ул. ..."
              value={hotelForm.address}
              onChange={(e) => setHotelForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </label>
        </div>
      </ModalShell>

      <ModalShell
        open={transportModalOpen}
        title="Добавить транспорт"
        onClose={() => setTransportModalOpen(false)}
        onSubmit={handleSaveTransport}
        submitting={savingTransport}
      >
        {transportError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs px-3 py-2">
            {transportError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Марка / модель
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Mercedes Sprinter"
              value={transportForm.car_name}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, car_name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Гос. номер
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="123 ABC"
              value={transportForm.plate_number}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, plate_number: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Мест
            <input
              type="number"
              min="1"
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="18"
              value={transportForm.seats}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, seats: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200">
            Водитель
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Имя водителя"
              value={transportForm.full_name}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, full_name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200 md:col-span-2">
            Телефон водителя
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="+996 555 000 001"
              value={transportForm.phone}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-200 md:col-span-2">
            Заметка
            <textarea
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              rows="3"
              placeholder="Особенности транспорта, кондиционер и т.д."
              value={transportForm.notes}
              onChange={(e) => setTransportForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </label>
        </div>
      </ModalShell>
    </main>
  );
}
