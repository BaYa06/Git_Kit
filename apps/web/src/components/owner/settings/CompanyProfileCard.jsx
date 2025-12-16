import { useState } from 'react';

export default function CompanyProfileCard({ company, onChange }) {
  const [formData, setFormData] = useState({
    name: company?.name || 'Avangard Travel',
    legalName: company?.legalName || 'Avangard Travel LLC',
    phone: company?.phone || '+996 555 123 456',
    email: company?.email || 'contact@avangard.kg',
    city: company?.city || 'Bishkek, Kyrgyzstan',
    timezone: company?.timezone || 'Asia/Bishkek (UTC+6)',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onChange?.({ ...formData, [field]: value });
  };

  const cities = [
    'Bishkek, Kyrgyzstan',
    'Almaty, Kazakhstan',
    'Tashkent, Uzbekistan',
  ];

  const timezones = [
    'Asia/Bishkek (UTC+6)',
    'Asia/Almaty (UTC+5)',
    'Europe/London (UTC+0)',
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <h3 className="text-lg font-bold text-[#111118] mb-1">Основная информация</h3>
      <p className="text-sm text-[#616189] mb-5">
        Общие данные, используемые в документах и счетах
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company Name */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Название компании
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          />
        </div>

        {/* Legal Name */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Юридическое название
          </label>
          <input
            type="text"
            value={formData.legalName}
            onChange={(e) => handleChange('legalName', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          />
        </div>

        {/* Phone */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">Телефон</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#616189]">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                call
              </span>
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-10 rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#616189]">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                mail
              </span>
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-10 rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* City */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Город / Страна
          </label>
          <select
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div className="col-span-1">
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Часовой пояс
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[#616189] bg-[#f8f8fa] p-2 rounded-lg border border-[#f0f0f4]">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>
          info
        </span>
        Изменение страны может повлиять на доступные способы оплаты.
      </div>
    </div>
  );
}
