import { useState } from 'react';

export default function EmergencyContactsCard({ contacts, onChange }) {
  const [contactsList, setContactsList] = useState(
    contacts || [
      { id: 1, role: 'Дежурный 24/7', phone: '+996 555 000 000', isFixed: true },
      { id: 2, role: 'Координатор', phone: '', isFixed: false },
    ]
  );

  const handleRoleChange = (id, value) => {
    const updated = contactsList.map((c) => (c.id === id ? { ...c, role: value } : c));
    setContactsList(updated);
    onChange?.(updated);
  };

  const handlePhoneChange = (id, value) => {
    const updated = contactsList.map((c) => (c.id === id ? { ...c, phone: value } : c));
    setContactsList(updated);
    onChange?.(updated);
  };

  const handleDelete = (id) => {
    const updated = contactsList.filter((c) => c.id !== id);
    setContactsList(updated);
    onChange?.(updated);
  };

  const handleAdd = () => {
    const newContact = {
      id: Date.now(),
      role: '',
      phone: '',
      isFixed: false,
    };
    setContactsList([...contactsList, newContact]);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6 mb-8">
      <h3 className="text-lg font-bold text-[#111118] mb-1">Контакты экстренной связи</h3>
      <p className="text-sm text-[#616189] mb-5">
        Эти номера будут доступны гидам и туристам в приложении
      </p>

      <div className="space-y-4">
        {contactsList.map((contact) => (
          <div key={contact.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              {contact.isFixed ? (
                <>
                  <label className="block text-xs font-semibold text-[#616189] uppercase tracking-wide mb-1">
                    Роль
                  </label>
                  <input
                    type="text"
                    value={contact.role}
                    disabled
                    className="w-full rounded-lg border-transparent bg-[#f8f8fa] text-[#616189] text-sm font-medium"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => handleRoleChange(contact.id, e.target.value)}
                  placeholder="Роль"
                  className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
                />
              )}
            </div>
            <div className="sm:col-span-2 relative">
              {contact.isFixed && (
                <label className="block text-xs font-semibold text-[#616189] uppercase tracking-wide mb-1">
                  Телефон
                </label>
              )}
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => handlePhoneChange(contact.id, e.target.value)}
                placeholder="+996 ..."
                className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
              />
              {!contact.isFixed && (
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    delete
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mt-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add_circle
          </span>
          Добавить ещё контакт
        </button>
      </div>
    </div>
  );
}
