import { useRouter } from 'next/router';

export default function OwnerHeader({ companyName = 'Avangard Travel', userName = 'Александр В.', userRole = 'Super Admin' }) {
  const router = useRouter();
  
  return (
    <header className="h-16 bg-white border-b border-[#f0f0f4] flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="text-[#616189] hover:text-[#111118] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[#111118] text-xl font-bold leading-tight tracking-tight">{companyName}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="px-3 py-1 bg-[#1313ec]/10 text-[#1313ec] text-xs font-bold uppercase tracking-wider rounded-full">
          Owner
        </span>
        
        <button className="relative text-[#616189] hover:text-[#1313ec] transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 border-l border-[#f0f0f4]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#111118] leading-none">{userName}</p>
            <p className="text-xs text-[#616189] mt-1">{userRole}</p>
          </div>
          <div 
            className="size-9 rounded-full bg-cover bg-center border border-[#e0e0e4]"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtvQ0IOR71RsO0WOIVwp6XGiK93b479lLwaQ2vlXkS8u6_ZskIfeIrLUCRIhcN2UkAW2KcxwoKKLBLUC_k37dPD2eVT4uxzeVAcLwG_io9hOeVfbMoCDZPyGvKPMYTUh1cVQguJIjGlDJDRydgb6qUNTW_u8tHf_DlDNmhEbpouwUglDI5Iw6a7CFNyHyhdj93S3gCe_U0XXXK6CJATlgh0c1cqelZLIRe1FDAi-tRgMQXWWKTUUQM7ROhZxwwkHHr38lB7fm9hYM')" }}
          />
        </div>
      </div>
    </header>
  );
}
