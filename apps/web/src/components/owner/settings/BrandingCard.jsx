import { useState } from 'react';

export default function BrandingCard({ branding, onChange }) {
  const [primaryColor, setPrimaryColor] = useState(branding?.primaryColor || '#1313EC');
  const [secondaryColor, setSecondaryColor] = useState(branding?.secondaryColor || '#101022');
  const [showCompanyName, setShowCompanyName] = useState(branding?.showCompanyName || false);
  const [showUserRole, setShowUserRole] = useState(branding?.showUserRole ?? true);

  const handlePrimaryColorChange = (value) => {
    setPrimaryColor(value.toUpperCase());
    onChange?.({ primaryColor: value, secondaryColor, showCompanyName, showUserRole });
  };

  const handleSecondaryColorChange = (value) => {
    setSecondaryColor(value.toUpperCase());
    onChange?.({ primaryColor, secondaryColor: value, showCompanyName, showUserRole });
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <h3 className="text-lg font-bold text-[#111118] mb-5">Брендинг</h3>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Logo Upload */}
        <div className="flex-shrink-0 w-full md:w-48">
          <label className="block text-sm font-semibold text-[#111118] mb-2">Логотип</label>
          <div className="border-2 border-dashed border-[#e0e0e4] rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-[#fafafa] transition-colors cursor-pointer h-32">
            <span className="material-symbols-outlined text-[#9ca3af] mb-1">cloud_upload</span>
            <span className="text-xs text-[#616189] font-medium">Drag & Drop</span>
            <span className="text-[10px] text-[#9ca3af]">PNG, JPG до 2MB</span>
          </div>
        </div>

        {/* Preview and Colors */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-[#111118] mb-2">
              Предпросмотр
            </label>
            <div className="flex gap-4 items-end">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-[#e0e0e4]">
                <span className="material-symbols-outlined text-[#9ca3af]">image</span>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-[#e0e0e4]">
                <span className="material-symbols-outlined text-[#9ca3af] text-xs">image</span>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#111118] mb-1.5">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="h-9 w-9 p-0 border-none rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="w-24 rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm uppercase shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#111118] mb-1.5">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => handleSecondaryColorChange(e.target.value)}
                  className="h-9 w-9 p-0 border-none rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => handleSecondaryColorChange(e.target.value)}
                  className="w-24 rounded-lg border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm uppercase shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="mt-6 space-y-3 pt-5 border-t border-[#f0f0f4]">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-[#111118] group-hover:text-primary transition-colors">
            Показывать название компании в шапке вместо бренда
          </span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showCompanyName}
              onChange={(e) => setShowCompanyName(e.target.checked)}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 right-5"
              style={showCompanyName ? { right: 0, borderColor: '#1313ec' } : {}}
            />
            <div
              className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                showCompanyName ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-[#111118] group-hover:text-primary transition-colors">
            Показывать роль пользователя в шапке
          </span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showUserRole}
              onChange={(e) => setShowUserRole(e.target.checked)}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 right-5"
              style={showUserRole ? { right: 0, borderColor: '#1313ec' } : {}}
            />
            <div
              className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                showUserRole ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          </div>
        </label>

        <p className="text-xs text-[#9ca3af] mt-2 italic">
          Примечание: Настройки брендинга используются в PDF инвойсах и главном интерфейсе
          сотрудников.
        </p>
      </div>
    </div>
  );
}
