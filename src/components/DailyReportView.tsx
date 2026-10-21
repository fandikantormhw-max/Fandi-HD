import React, { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Copy, Check, Download, 
  Printer, Search, Clock, CheckCircle2, AlertCircle, Edit2, Trash2, 
  CornerDownRight, DollarSign, Filter
} from 'lucide-react';
import { ReportEntry, OrganizationConfig, ReportCategory, ReportStatus } from '../types/report';
import { 
  formatDateWithDay, formatRupiah, getCategoryLabel, 
  getStatusLabel, generateWhatsAppDailyReport, exportToCSV 
} from '../utils/formatters';

interface DailyReportViewProps {
  reports: ReportEntry[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenCreateModal: (defaultDate?: string) => void;
  onEditReport: (entry: ReportEntry) => void;
  onDeleteReport: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ReportStatus, reviewerNote?: string) => void;
  onOpenPrintModal: (title: string, periodLabel: string, entries: ReportEntry[]) => void;
  config: OrganizationConfig;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  reports,
  selectedDate,
  onDateChange,
  onOpenCreateModal,
  onEditReport,
  onDeleteReport,
  onUpdateStatus,
  onOpenPrintModal,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [copiedToast, setCopiedToast] = useState(false);

  // Navigate date
  const shiftDate = (days: number) => {
    const parts = selectedDate.split('-');
    const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    cur.setDate(cur.getDate() + days);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${d}`);
  };

  const setToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  // Filter daily reports
  const dayReports = reports.filter(r => r.date === selectedDate);

  const filteredReports = dayReports.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAuthor = r.author.toLowerCase().includes(q);
      const matchOutput = r.output.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAuthor || matchOutput;
    }
    return true;
  });

  // Calculate day stats
  const totalHours = Number(dayReports.reduce((acc, r) => acc + (r.hoursSpent || 0), 0).toFixed(1));
  const avgKpi = dayReports.length > 0 
    ? Math.round(dayReports.reduce((acc, r) => acc + (r.kpiProgress || 0), 0) / dayReports.length) 
    : 0;
  const totalIncome = dayReports
    .filter(r => r.financialType === 'income')
    .reduce((acc, r) => acc + (r.financialAmount || 0), 0);
  const totalExpense = dayReports
    .filter(r => r.financialType === 'expense')
    .reduce((acc, r) => acc + (r.financialAmount || 0), 0);

  // Copy WhatsApp
  const handleCopyWhatsApp = () => {
    const waText = generateWhatsAppDailyReport(
      selectedDate,
      config.defaultAuthorName,
      config.defaultAuthorRole,
      dayReports
    );
    navigator.clipboard.writeText(waText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = dayReports.map(r => ({
      ID: r.id,
      Tanggal: r.date,
      Kategori: getCategoryLabel(r.category),
      Judul: r.title,
      Departemen: r.department,
      Pelapor: r.author,
      Jabatan: r.authorRole,
      Deskripsi: r.description,
      Output: r.output,
      Kendala: r.obstacle || '-',
      Solusi: r.solution || '-',
      'Jam Kerja': r.hoursSpent,
      'KPI (%)': r.kpiProgress,
      'Tipe Finansial': r.financialType,
      'Nominal (Rp)': r.financialAmount,
      Status: getStatusLabel(r.status),
    }));
    exportToCSV(`Laporan-Harian-${selectedDate}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation & Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => shiftDate(-1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={setToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Hari Ini
          </button>

          <span className="hidden sm:inline-block text-xs font-semibold text-slate-900">
            {formatDateWithDay(selectedDate)}
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 cursor-pointer"
            title="Salin rekap siap kirim ke WhatsApp / Email"
          >
            {copiedToast ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Salin Format WA</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Download file CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => onOpenPrintModal(
              `Laporan Harian Pelaksanaan Kegiatan`,
              formatDateWithDay(selectedDate),
              dayReports
            )}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Pratinjau cetak dan PDF resmi"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={() => onOpenCreateModal(selectedDate)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Catat Kegiatan</span>
          </button>
        </div>
      </div>

      {/* Daily Quantitative Rigor Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Kegiatan</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {dayReports.length} <span className="text-xs font-normal text-slate-500">tugas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Terdaftar pada {selectedDate}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Jam Kerja Efektif</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {totalHours} <span className="text-xs font-normal text-slate-500">Jam</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Alokasi waktu kumulatif harian
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata KPI</span>
            <div className="font-mono text-xs font-bold text-indigo-700">{avgKpi}%</div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${avgKpi}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">{avgKpi}%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Target pencapaian seluruh tugas
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Arus Kas Harian</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xs font-mono tabular-nums">
            <div className="text-emerald-700 font-semibold">In: +{formatRupiah(totalIncome)}</div>
            <div className="text-rose-700 font-semibold">Out: -{formatRupiah(totalExpense)}</div>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-mono">
            Net: {formatRupiah(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari kegiatan, rincian, pelapor, atau hasil..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="operasional">Operasional</option>
            <option value="keuangan">Keuangan</option>
            <option value="proyek">Proyek</option>
            <option value="sdm">SDM</option>
            <option value="penjualan">Penjualan</option>
            <option value="layanan">Layanan</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="approved">Disetujui</option>
            <option value="pending_review">Menunggu Review</option>
            <option value="revision">Perlu Revisi</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Departemen</option>
            {config.departmentList.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Records List */}
      {filteredReports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            {dayReports.length === 0
              ? 'Belum ada laporan aktivitas pada tanggal ini'
              : 'Tidak ada laporan yang sesuai dengan filter pencarian'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {dayReports.length === 0
              ? 'Catat pekerjaan yang telah diselesaikan, durasi jam kerja, hasil capaian, dan kendala operasional.'
              : 'Silakan ubah filter kategori, status, atau kata kunci pencarian Anda.'}
          </p>
          {dayReports.length === 0 && (
            <button
              onClick={() => onOpenCreateModal(selectedDate)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kegiatan Pertama Hari Ini</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, idx) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Header: Title, Category, Status & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-indigo-700">{getCategoryLabel(report.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{report.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{report.author} ({report.authorRole})</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {idx + 1}. {report.title}
                  </h3>
                </div>

                {/* Status Badges & Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                    report.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : report.status === 'pending_review'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : report.status === 'revision'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {report.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                    {report.status === 'pending_review' && <Clock className="h-3 w-3" />}
                    {report.status === 'revision' && <AlertCircle className="h-3 w-3" />}
                    <span>{getStatusLabel(report.status)}</span>
                  </span>

                  <button
                    onClick={() => onEditReport(report)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    title="Ubah Laporan"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeleteReport(report.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                    title="Hapus Laporan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body: Deskripsi & Output */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-slate-50/60 p-3 border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1">Uraian / Pelaksanaan:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{report.description}</p>
                </div>
                <div className="rounded-lg bg-emerald-50/40 p-3 border border-emerald-100/60">
                  <span className="font-semibold text-emerald-800 block mb-1">Capaian / Output:</span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{report.output}</p>
                </div>
              </div>

              {/* Obstacle & Solution if any */}
              {(report.obstacle || report.solution) && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs">
                  {report.obstacle && (
                    <div className="text-amber-900">
                      <span className="font-semibold">Kendala: </span>
                      <span>{report.obstacle}</span>
                    </div>
                  )}
                  {report.solution && (
                    <div className="mt-1 text-slate-700 flex items-start gap-1">
                      <CornerDownRight className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-800">Tindak Lanjut / Solusi: </span>
                        <span>{report.solution}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Meta Row: Jam Kerja, KPI, Finansial & Quick Approval */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{report.hoursSpent} Jam</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-400">KPI:</span>
                    <span className="font-semibold text-indigo-700">{report.kpiProgress}%</span>
                  </div>

                  {report.financialType !== 'none' && report.financialAmount > 0 && (
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-400">Kas:</span>
                      <span className={`font-semibold ${
                        report.financialType === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {report.financialType === 'income' ? '+ ' : '- '}
                        {formatRupiah(report.financialAmount)}
                      </span>
                      {report.financialNote && (
                        <span className="text-[11px] text-slate-400 italic">({report.financialNote})</span>
                      )}
                    </div>
                  )}

                  {report.tags && report.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      {report.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supervisor Approval Fast-Switch */}
                <div className="flex items-center gap-2">
                  {report.status !== 'approved' && (
                    <button
                      onClick={() => onUpdateStatus(report.id, 'approved')}
                      className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    >
                      ✓ Setujui
                    </button>
                  )}
                  {report.status !== 'revision' && (
                    <button
                      onClick={() => {
                        const note = prompt('Tuliskan catatan revisi untuk pelapor:', 'Mohon lengkapi data output dokumen pendukung.');
                        if (note !== null) {
                          onUpdateStatus(report.id, 'revision', note);
                        }
                      }}
                      className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                    >
                      Minta Revisi
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
