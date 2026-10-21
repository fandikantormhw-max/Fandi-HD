import React from 'react';
import { PlusCircle, FileText } from 'lucide-react';

export type ActiveNavTab = 'dashboard' | 'daily' | 'monthly' | 'yearly' | 'settings';

interface TopNavProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  onOpenNewReportModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewReportModal,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-sm no-print">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onTabChange('dashboard')} 
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
          <FileText className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          LaporPro
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links with subtle underline/active state */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
              : 'hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => onTabChange('daily')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'daily'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
              : 'hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          Laporan Harian
        </button>
        <button
          onClick={() => onTabChange('monthly')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'monthly'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
              : 'hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          Laporan Bulanan
        </button>
        <button
          onClick={() => onTabChange('yearly')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'yearly'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
              : 'hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          Laporan Tahunan
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'settings'
              ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
              : 'hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          Pengaturan
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenNewReportModal}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Buat Laporan Harian</span>
        </button>
      </div>
    </header>
  );
};
