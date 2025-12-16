export default function SettingsInfoCards({ lastModifiedBy, lastModifiedAt }) {
  return (
    <div className="xl:col-span-4 flex flex-col gap-6">
      {/* Access Info */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f0f0f4] p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#616189]">lock</span>
          <div>
            <h4 className="text-sm font-bold text-[#111118]">Кто видит эти настройки?</h4>
            <p className="text-xs text-[#616189] mt-1 leading-relaxed">
              Доступ к разделу "Профиль компании" имеют только пользователи с ролями{' '}
              <span className="font-semibold text-[#111118]">Owner</span> и{' '}
              <span className="font-semibold text-[#111118]">Admin</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Last Modified */}
      <div className="bg-white rounded-xl shadow-sm border border-[#f0f0f4] p-5">
        <h4 className="text-sm font-bold text-[#111118] mb-2">Последнее изменение</h4>
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-cover bg-center border border-[#e0e0e4]"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtvQ0IOR71RsO0WOIVwp6XGiK93b479lLwaQ2vlXkS8u6_ZskIfeIrLUCRIhcN2UkAW2KcxwoKKLBLUC_k37dPD2eVT4uxzeVAcLwG_io9hOeVfbMoCDZPyGvKPMYTUh1cVQguJIjGlDJDRydgb6qUNTW_u8tHf_DlDNmhEbpouwUglDI5Iw6a7CFNyHyhdj93S3gCe_U0XXXK6CJATlgh0c1cqelZLIRe1FDAi-tRgMQXWWKTUUQM7ROhZxwwkHHr38lB7fm9hYM')`,
            }}
          />
          <div>
            <p className="text-xs font-bold text-[#111118]">
              {lastModifiedBy || 'Александр В.'}
            </p>
            <p className="text-[10px] text-[#616189]">{lastModifiedAt || 'Сегодня, 10:42 AM'}</p>
          </div>
        </div>
      </div>

      {/* Branding Tip */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">palette</span>
          <div>
            <h4 className="text-sm font-bold text-primary">Брендинг важен</h4>
            <p className="text-xs text-[#616189] mt-1 leading-relaxed">
              Ваш логотип и цвета используются в PDF-билетах для туристов. Качественное
              оформление повышает доверие клиентов на 15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
