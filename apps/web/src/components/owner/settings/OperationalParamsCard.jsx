import { useState } from 'react';

export default function OperationalParamsCard({ params, onChange }) {
  const [formData, setFormData] = useState({
    currency: params?.currency || 'KGS (Kyrgyz Som)',
    dateFormat: params?.dateFormat || 'DD.MM.YYYY (31.12.2024)',
    autoNumbering: params?.autoNumbering ?? true,
    tourPrefix: params?.tourPrefix || 'AV-',
    riskThreshold: params?.riskThreshold || 'В течение 24 часов до выезда',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onChange?.({ ...formData, [field]: value });
  };

  const currencies = [
    'KGS (Kyrgyz Som)',
    'USD (United States Dollar)',
    'EUR (Euro)',
  ];

  const dateFormats = [
    'DD.MM.YYYY (31.12.2024)',
    'MM/DD/YYYY (12/31/2024)',
    'YYYY-MM-DD (2024-12-31)',
  ];

  const riskThresholds = [
    'В течение 24 часов до выезда',
    'В течение 48 часов до выезда',
    'За 3 дня до выезда',
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <h3 className="text-lg font-bold text-[#111118] mb-5">Операционные параметры</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Currency */}
        <div>
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Валюта по умолчанию
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#9ca3af] mt-1">Основная валюта для всех отчетов.</p>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Единый формат дат
          </label>
          <select
            value={formData.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          >
            {dateFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="col-span-1 md:col-span-2 border-t border-dashed border-[#e0e0e4] my-2" />

        {/* Auto Numbering */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#111118]">
              Авто-нумерация туров
            </label>
            <div className="relative inline-block w-8 align-middle select-none">
              <input
                type="checkbox"
                checked={formData.autoNumbering}
                onChange={(e) => handleChange('autoNumbering', e.target.checked)}
                className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                style={{
                  borderColor: formData.autoNumbering ? '#1313ec' : '#d1d5db',
                  right: formData.autoNumbering ? 0 : 'auto',
                  left: formData.autoNumbering ? 'auto' : 0,
                }}
              />
              <div
                className={`block overflow-hidden h-4 rounded-full cursor-pointer ${
                  formData.autoNumbering ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#616189] whitespace-nowrap">Префикс:</span>
            <input
              type="text"
              value={formData.tourPrefix}
              onChange={(e) => handleChange('tourPrefix', e.target.value)}
              className="w-24 rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
            />
            <span className="text-xs text-[#9ca3af]">Пример: {formData.tourPrefix}1004</span>
          </div>
        </div>

        {/* Risk Threshold */}
        <div>
          <label className="block text-sm font-semibold text-[#111118] mb-1.5">
            Порог "Критический риск"
          </label>
          <select
            value={formData.riskThreshold}
            onChange={(e) => handleChange('riskThreshold', e.target.value)}
            className="w-full rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm focus:border-primary focus:ring-primary shadow-sm"
          >
            {riskThresholds.map((threshold) => (
              <option key={threshold} value={threshold}>
                {threshold}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#9ca3af] mt-1">
            Определяет, когда тур попадает в блок "Риски".
          </p>
        </div>
      </div>
    </div>
  );
}
