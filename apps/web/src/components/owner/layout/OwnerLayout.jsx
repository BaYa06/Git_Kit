import Head from 'next/head';
import OwnerSidebar from './OwnerSidebar';
import OwnerHeader from './OwnerHeader';

export default function OwnerLayout({ children, title = 'Owner Dashboard', companyName = 'Avangard Travel' }) {
  return (
    <>
      <Head>
        <title>{title} - {companyName}</title>
      </Head>
      
      <div className="bg-[#f6f6f8] text-[#111118] font-['Inter',sans-serif] antialiased overflow-hidden h-screen flex">
        {/* Sidebar */}
        <OwnerSidebar />
        
        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative bg-[#f6f6f8]">
          {/* Header */}
          <OwnerHeader companyName={companyName} />
          
          {/* Main Scrollable Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
