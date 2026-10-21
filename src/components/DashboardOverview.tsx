import React from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, TrendingUp, DollarSign, 
  ArrowRight, PlusCircle, Copy, Check, FileSpreadsheet, Building2, UserCheck
} from 'lucide-react';
import { ReportEntry, OrganizationConfig, ReportCategory } from '../types/report';
import { 
  formatDateIndo, formatDateWithDay, formatRupiah, getCategoryLabel, 
  getStatusLabel, generateWhatsAppDailyReport 
} from '../utils/formatters';
import { LineChart, DonutChart, BarChart } from './Charts';

interface DashboardOverviewProps {
  reports: ReportEntry[];
  todayDate: string;
  config: OrganizationConfig;
  onNavigateTab: (tab: 'daily' | 'monthly' | 'yearly' | 'settings') => void;
  onOpenCreateModal: (defaultDate?: string) => void;
  onUpdateStatus: (id: string, newStatus: any, reviewerNote?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  reports,
  todayDate,
  config,
  onNavigateTab,
  onOpenCreateModal,
  onUpdateStatus,
}) => {
  const [copiedToast, setCopiedToast] = React.useState(false);

  // Today's records
  const todayReports = reports.filter(r => r.date === todayDate);
  const todayHours = Number(todayReports.reduce((acc, r) => acc + (r.hoursSpent || 0), 0).toFixed(1));

  // Current month records
  const curYear = parseInt(todayDate.split('-')[0], 10);
  const curMonthStr = todayDate.split('-')[1];
  const curMonthPrefix = `${curYear}-${curMonthStr}`;
  const monthReports = reports.filter(r => r.date.startsWith(curMonthPrefix));

  const monthHours = Number(monthReports.reduce((acc, r) => acc + (r.hoursSpent || 0), 0).toFixed(1));
  const monthIncome = monthReports
    .filter(r => r.financialType === 'income')
    .reduce((acc, r) => acc + r.financialAmount, 0);
  const monthExpense = monthReports
    .filter(r => r.financialType === 'expense')
    .reduce((acc, r) => acc + r.financialAmount, 0);
  const monthAvgKpi = monthReports.length > 0 
    ? Math.round(monthReports.reduce((acc, r) => acc + (r.kpiProgress || 0), 0) / monthReports.length)
    : 0;

  // Pending approval items
  const pendingItems = reports.filter(r => r.status === 'pending_review');

  // Last 7 days trend for line chart
  const last7Days: string[] = [];
  const last7Labels: string[] = [];
  const last7Hours: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    last7Days.push(dateStr);
    last7Labels.push(`${day}/${m}`);

    const entries = reports.filter(r => r.date === dateStr);
    const hrs = entries.reduce((acc, r) => acc + (r.hoursSpent || 0), 0);
    last7Hours.push(Number(hrs.toFixed(1)));
  }

  // Category distribution for this month
  const categoryCounts: Record<ReportCategory, number> = {
    operasional: 0,
    keuangan: 0,
    proyek: 0,
    sdm: 0,
    penjualan: 0,
    layanan: 0,
  };
  monthReports.forEach(r => {
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    }
  });

  const categoryColors: Record<ReportCategory, string> = {
    operasional: '#3b82f6',
    keuangan: '#10b981',
    proyek: '#6366f1',
    sdm: '#f59e0b',
    penjualan: '#ec4899',
    layanan: '#8b5cf6',
  };

  const donutSlices = (Object.keys(categoryCounts) as ReportCategory[])
    .filter(cat => categoryCounts[cat] > 0)
    .map(cat => ({
      label: getCategoryLabel(cat),
      count: categoryCounts[cat],
      color: categoryColors[cat] || '#94a3b8',
    }));

  const handleCopyTodayWA = () => {
    const text = generateWhatsAppDailyReport(
      todayDate,
      config.defaultAuthorName,
      config.defaultAuthorRole,
      todayReports
    );
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 mb-1">
              <Building2 className="h-4 w-4" />
              <span>{config.companyName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">{config.companyTagline}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pusat Pelaporan Kinerja & Akuntabilitas
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Selamat datang, <span className="font-semibold text-slate-700">{config.defaultAuthorName}</span> ({config.defaultAuthorRole}). Hari ini {formatDateWithDay(todayDate)}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyTodayWA}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 cursor-pointer"
            >
              {copiedToast ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Format WA Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Salin WA Hari Ini</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenCreateModal(todayDate)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Buat Laporan Harian</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Scopes Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Harian */}
        <div 
          onClick={() => onNavigateTab('daily')}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Laporan Hari Ini</span>
            <Calendar className="h-4 w-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {todayReports.length} <span className="text-xs font-normal text-slate-400">kegiatan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Alokasi: {todayHours} Jam</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
              Buka <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Bulanan */}
        <div 
          onClick={() => onNavigateTab('monthly')}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Rekap Bulan Ini</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {monthReports.length} <span className="text-xs font-normal text-slate-400">kegiatan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>KPI Rata-rata: {monthAvgKpi}%</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
              Analitik <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Keuangan Bulan Ini */}
        <div 
          onClick={() => onNavigateTab('monthly')}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Arus Kas Bulan Ini</span>
            <DollarSign className="h-4 w-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="font-mono text-lg font-bold text-emerald-700 tabular-nums truncate">
            {formatRupiah(monthIncome - monthExpense)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span className="truncate">In: {formatRupiah(monthIncome)}</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
              Rincian <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Antrean Review */}
        <div 
          onClick={() => onNavigateTab('daily')}
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Perlu Verifikasi</span>
            <UserCheck className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-600 tabular-nums">
            {pendingItems.length} <span className="text-xs font-normal text-slate-400">laporan</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Menunggu approval atasan</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
              Review <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7 Days Trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Produktivitas 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Jumlah jam kerja efektif tim dari hari ke hari</p>
            </div>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <LineChart labels={last7Labels} values={last7Hours} height={180} unit="Jam" />
        </div>

        {/* Month Categories */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Distribusi Kategori Bulan Ini</h3>
              <p className="text-xs text-slate-500">Persentase fokus divisi kerja</p>
            </div>
            <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
          </div>
          <DonutChart data={donutSlices} totalLabel="Kegiatan" size={160} />
        </div>
      </div>

      {/* Review Queue & Recent Activities */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Antrean Verifikasi & Aktivitas Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Daftar kegiatan yang baru dicatatkan oleh staf dan membutuhkan konfirmasi
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('daily')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Lihat Semua Laporan Harian →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{report.date}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 font-medium">{getCategoryLabel(report.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{report.author}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
                <p className="text-slate-600 line-clamp-1">{report.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right font-mono text-[11px] text-slate-500 hidden sm:block">
                  <div>{report.hoursSpent} Jam</div>
                  <div className="text-indigo-600 font-semibold">{report.kpiProgress}% KPI</div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  report.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : report.status === 'pending_review'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : report.status === 'revision'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {getStatusLabel(report.status)}
                </span>

                {report.status !== 'approved' && (
                  <button
                    onClick={() => onUpdateStatus(report.id, 'approved')}
                    className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Setujui
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
