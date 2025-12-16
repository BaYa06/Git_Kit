import { useState, useRef } from 'react';

export default function BrandingCard({ companyId, logoUrl, onChange }) {
  const [primaryColor, setPrimaryColor] = useState('#1313EC');
  const [secondaryColor, setSecondaryColor] = useState('#101022');
  const [showCompanyName, setShowCompanyName] = useState(false);
  const [showUserRole, setShowUserRole] = useState(true);
  
  const [currentLogo, setCurrentLogo] = useState(logoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handlePrimaryColorChange = (value) => {
    setPrimaryColor(value.toUpperCase());
    onChange?.();
  };

  const handleSecondaryColorChange = (value) => {
    setSecondaryColor(value.toUpperCase());
    onChange?.();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Валидация на клиенте
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Неверный формат. Разрешены: PNG, JPG, WEBP, SVG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Файл слишком большой. Максимум 2MB');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/v1/company/logo/upload?companyId=${companyId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      setCurrentLogo(data.logoUrl);
      onChange?.();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Ошибка загрузки логотипа');
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <h3 className="text-lg font-bold text-[#111118] mb-5">Брендинг</h3>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Logo Upload */}
        <div className="flex-shrink-0 w-full md:w-48">
          <label className="block text-sm font-semibold text-[#111118] mb-2">Логотип</label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="hidden"
          />
          
          <div
            onClick={openFilePicker}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center 
              transition-all cursor-pointer h-32 relative overflow-hidden
              ${dragActive 
                ? 'border-[#1313ec] bg-[#1313ec]/5' 
                : 'border-[#e0e0e4] hover:border-[#1313ec]/50 hover:bg-[#fafafa]'
              }
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-[#1313ec] border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-[#616189]">Загрузка...</span>
              </div>
            ) : currentLogo ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <img
                  src={currentLogo}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Изменить</span>
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[#9ca3af] mb-1">cloud_upload</span>
                <span className="text-xs text-[#616189] font-medium">
                  {dragActive ? 'Отпустите файл' : 'Drag & Drop'}
                </span>
                <span className="text-[10px] text-[#9ca3af]">PNG, JPG до 2MB</span>
              </>
            )}
          </div>
          
          {uploadError && (
            <p className="text-xs text-red-500 mt-2">{uploadError}</p>
          )}
          
          {currentLogo && !uploading && (
            <button
              onClick={openFilePicker}
              className="mt-2 w-full text-xs text-[#1313ec] hover:underline"
            >
              Загрузить другой
            </button>
          )}
        </div>

        {/* Preview and Colors */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-[#111118] mb-2">
              Предпросмотр
            </label>
            <div className="flex gap-4 items-end">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-[#e0e0e4] overflow-hidden">
                {currentLogo ? (
                  <img src={currentLogo} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[#9ca3af]">image</span>
                )}
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-[#e0e0e4] overflow-hidden">
                {currentLogo ? (
                  <img src={currentLogo} alt="Preview small" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[#9ca3af] text-xs">image</span>
                )}
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
                  className="w-24 px-2 py-1.5 rounded-lg border border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm uppercase shadow-sm"
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
                  className="w-24 px-2 py-1.5 rounded-lg border border-[#e0e0e4] bg-[#fcfcfd] text-[#111118] text-sm uppercase shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Options */}
      <div className="mt-6 space-y-3 pt-5 border-t border-[#f0f0f4]">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-[#111118] group-hover:text-[#1313ec] transition-colors">
            Показывать название компании в шапке вместо бренда
          </span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showCompanyName}
              onChange={(e) => {
                setShowCompanyName(e.target.checked);
                onChange?.();
              }}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 right-5"
              style={showCompanyName ? { right: 0, borderColor: '#1313ec' } : {}}
            />
            <div
              className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                showCompanyName ? 'bg-[#1313ec]' : 'bg-gray-300'
              }`}
            />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-[#111118] group-hover:text-[#1313ec] transition-colors">
            Показывать роль пользователя в шапке
          </span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showUserRole}
              onChange={(e) => {
                setShowUserRole(e.target.checked);
                onChange?.();
              }}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 right-5"
              style={showUserRole ? { right: 0, borderColor: '#1313ec' } : {}}
            />
            <div
              className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                showUserRole ? 'bg-[#1313ec]' : 'bg-gray-300'
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
