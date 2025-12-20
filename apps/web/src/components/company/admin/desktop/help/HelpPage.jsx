import { useState } from 'react';
import HelpHeader from './HelpHeader';
import HelpTabs from './HelpTabs';
import HelpSearch from './HelpSearch';
import HelpCategories from './HelpCategories';
import HelpArticles from './HelpArticles';
import { helpTabs, categories, popularArticles, recentArticles } from './data';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState(helpTabs[0].id);
  const [query, setQuery] = useState('');

  const handleClear = () => setQuery('');

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
      <div className="mx-auto max-w-[1200px] flex flex-col gap-10">
        <HelpHeader onCreateTicket={() => {}} />

        <HelpTabs tabs={helpTabs} activeId={activeTab} onChange={setActiveTab} />

        <HelpSearch value={query} onChange={setQuery} onClear={handleClear} />

        <HelpCategories categories={categories} />

        <HelpArticles popular={popularArticles} recent={recentArticles} />
      </div>
    </main>
  );
}
