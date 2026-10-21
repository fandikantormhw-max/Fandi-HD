import React, { useState, useEffect } from 'react';
import { ReportEntry, OrganizationConfig, ReportStatus } from './types/report';
import { 
  getStoredReports, saveReports, getStoredConfig, 
  saveConfig, resetAllDataToDefault 
} from './utils/storage';
import { TopNav, ActiveNavTab } from './components/TopNav';
import { DashboardOverview } from './components/DashboardOverview';
import { DailyReportView } from './components/DailyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { YearlyReportView } from './components/YearlyReportView';
import { SettingsModal } from './components/SettingsModal';
import { ReportFormModal } from './components/ReportFormModal';
import { PrintReportModal } from './components/PrintReportModal';

export default function App() {
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [config, setConfig] = useState<OrganizationConfig>(getStoredConfig());
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Time context
  const todayStr = '2026-10-20';
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportEntry | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string>(todayStr);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<{
    title: string;
    periodLabel: string;
    entries: ReportEntry[];
    notes?: string;
  }>({
    title: '',
    periodLabel: '',
    entries: [],
  });

  // Load initial data
  useEffect(() => {
    const loaded = getStoredReports();
    setReports(loaded);
    setConfig(getStoredConfig());
  }, []);

  // Update reports helper
  const updateReportsList = (updated: ReportEntry[]) => {
    setReports(updated);
    saveReports(updated);
  };

  // Create or Update Report
  const handleSaveReport = (entryData: Partial<ReportEntry>) => {
    const nowIso = new Date().toISOString();
    if (entryData.id) {
      // Update existing
      const updated = reports.map(r => {
        if (r.id === entryData.id) {
          return {
            ...r,
            ...entryData,
            updatedAt: nowIso,
          } as ReportEntry;
        }
        return r;
      });
      updateReportsList(updated);
    } else {
      // Create new
      const newEntry: ReportEntry = {
        id: `rep-${Date.now()}`,
        date: entryData.date || selectedDate,
        title: entryData.title || '',
        category: entryData.category || 'operasional',
        department: entryData.department || config.departmentList[0],
        author: entryData.author || config.defaultAuthorName,
        authorRole: entryData.authorRole || config.defaultAuthorRole,
        description: entryData.description || '',
        output: entryData.output || '',
        obstacle: entryData.obstacle,
        solution: entryData.solution,
        hoursSpent: entryData.hoursSpent || 0,
        kpiProgress: entryData.kpiProgress || 0,
        financialType: entryData.financialType || 'none',
        financialAmount: entryData.financialAmount || 0,
        financialNote: entryData.financialNote,
        priority: entryData.priority || 'sedang',
        status: entryData.status || 'pending_review',
        tags: entryData.tags || [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      updateReportsList([newEntry, ...reports]);
    }
    setIsFormModalOpen(false);
    setEditingReport(null);
  };

  // Delete Report
  const handleDeleteReport = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan laporan ini?')) {
      const updated = reports.filter(r => r.id !== id);
      updateReportsList(updated);
    }
  };

  // Update Report Status (Approval workflow)
  const handleUpdateStatus = (id: string, newStatus: ReportStatus, reviewerNote?: string) => {
    const nowFormatted = new Date().toLocaleString('id-ID');
    const updated = reports.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          reviewerNotes: reviewerNote !== undefined ? reviewerNote : r.reviewerNotes,
          reviewedBy: config.supervisorName,
          reviewedAt: nowFormatted,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    updateReportsList(updated);
  };

  // Save Organization Config
  const handleSaveConfig = (newConfig: OrganizationConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  // Import Reports Backup
  const handleImportReports = (imported: ReportEntry[]) => {
    updateReportsList(imported);
  };

  // Reset to default sample
  const handleResetDefaultData = () => {
    resetAllDataToDefault();
    setReports(getStoredReports());
    setConfig(getStoredConfig());
  };

  // Open Form Modal for new entry
  const handleOpenCreateModal = (defDate?: string) => {
    setEditingReport(null);
    setFormDefaultDate(defDate || selectedDate);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for edit entry
  const handleEditReport = (entry: ReportEntry) => {
    setEditingReport(entry);
    setIsFormModalOpen(true);
  };

  // Open Print Modal
  const handleOpenPrintModal = (
    title: string,
    periodLabel: string,
    entries: ReportEntry[],
    notes?: string
  ) => {
    setPrintData({
      title,
      periodLabel,
      entries,
      notes,
    });
    setIsPrintModalOpen(true);
  };

  // Calculation for print modal totals
  const printIncome = printData.entries
    .filter(r => r.financialType === 'income')
    .reduce((acc, r) => acc + (r.financialAmount || 0), 0);
  const printExpense = printData.entries
    .filter(r => r.financialType === 'expense')
    .reduce((acc, r) => acc + (r.financialAmount || 0), 0);
  const printHours = Number(printData.entries.reduce((acc, r) => acc + (r.hoursSpent || 0), 0).toFixed(1));
  const printAvgKpi = printData.entries.length > 0
    ? Math.round(printData.entries.reduce((acc, r) => acc + (r.kpiProgress || 0), 0) / printData.entries.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Bar Contract (Wordmark - Links - Primary Action) */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewReportModal={() => handleOpenCreateModal(selectedDate)}
      />

      {/* Main Viewport Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            reports={reports}
            todayDate={todayStr}
            config={config}
            onNavigateTab={setActiveTab}
            onOpenCreateModal={handleOpenCreateModal}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'daily' && (
          <DailyReportView
            reports={reports}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenCreateModal={handleOpenCreateModal}
            onEditReport={handleEditReport}
            onDeleteReport={handleDeleteReport}
            onUpdateStatus={handleUpdateStatus}
            onOpenPrintModal={(title, period, entries) =>
              handleOpenPrintModal(title, period, entries)
            }
            config={config}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReportView
            reports={reports}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onMonthChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
            onOpenPrintModal={(title, period, entries, notes) =>
              handleOpenPrintModal(title, period, entries, notes)
            }
            config={config}
          />
        )}

        {activeTab === 'yearly' && (
          <YearlyReportView
            reports={reports}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onOpenPrintModal={(title, period, entries, notes) =>
              handleOpenPrintModal(title, period, entries, notes)
            }
            config={config}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            config={config}
            onSaveConfig={handleSaveConfig}
            reports={reports}
            onImportReports={handleImportReports}
            onResetDefaultData={handleResetDefaultData}
          />
        )}
      </main>

      {/* Daily Report Create/Edit Modal */}
      <ReportFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        initialData={editingReport}
        config={config}
        defaultDate={formDefaultDate}
      />

      {/* Formal Printable Document / PDF Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={printData.title}
        periodLabel={printData.periodLabel}
        entries={printData.entries}
        config={config}
        executiveNotes={printData.notes}
        totalIncome={printIncome}
        totalExpense={printExpense}
        totalHours={printHours}
        avgKpi={printAvgKpi}
      />

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {config.companyName} · Sistem Laporan Harian, Bulanan & Tahunan Terpadu
          </span>
          <span className="text-slate-400">
            LaporPro Enterprise v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
