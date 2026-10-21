import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Printer, Download, 
  Clock, CheckCircle2, TrendingUp, DollarSign, Save, Check, Filter
} from 'lucide-react';
import { ReportEntry, OrganizationConfig, ReportCategory } from '../types/report';
import { 
  INDO_MONTHS, formatRupiah, formatNumber, formatDateIndo, 
  getCategoryLabel, getStatusLabel, exportToCSV 
} from '../utils/formatters';
import { aggregateMonthly, getStoredEvaluationNotes, saveEvaluationNotes } from '../utils/storage';
import { BarChart, LineChart, DonutChart } from './Charts';

interface MonthlyReportViewProps {
  reports: ReportEntry[];
  selectedYear: number;
  selectedMonth: number; // 1 - 12
  onMonthChange: (month: number, year: number) => void;
  onOpenPrintModal: (title: string, periodLabel: string, entries: ReportEntry[], notes?: string) => void;
  config: OrganizationConfig;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  reports,
  selectedYear,
  selectedMonth,
  onMonthChange,
  onOpenPrintModal,
  config,
}) => {
  const [evalNotes, setEvalNotes] = useState('');
  const [savedNotesToast, setSavedNotesToast] = useState(false);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterCat, setFilterCat] = useState<string>('all');

  const evalKey = `monthly_${selectedYear}_${selectedMonth}`;

  useEffect(() => {
    setEvalNotes(getStoredEvaluationNotes(evalKey));
  }, [selectedYear, selectedMonth]);

  const handleSaveNotes = () => {
    saveEvaluationNotes(evalKey, evalNotes);
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 2000);
  };

  const shiftMonth = (delta: number) => {
    let newM = selectedMonth + delta;
    let newY = selectedYear;
    if (newM > 12) {
      newM = 1;
      newY++;
    } else if (newM < 1) {
      newM = 12;
      newY--;
    }
    onMonthChange(newM, newY);
  };

  // Month aggregation
  const aggregation = aggregateMonthly(reports, selectedYear, selectedMonth);

  // Month records
  const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
  const prefix = `${selectedYear}-${monthStr}`;
  const monthEntries = reports.filter(r => r.date.startsWith(prefix));

  const filteredEntries = monthEntries.filter(r => {
    if (filterDept !== 'all' && r.department !== filterDept) return false;
    if (filterCat !== 'all' && r.category !== filterCat) return false;
    return true;
  });

  // Calculate daily trend data for line & bar charts
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dailyLabels: string[] = [];
  const dailyHours: number[] = [];
  const dailyCashFlowData: { label: string; value: number; secondaryValue: number }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateKey = `${prefix}-${dayPadded}`;
    const entriesOnDay = monthEntries.filter(r => r.date === dateKey);

    const hours = entriesOnDay.reduce((acc, r) => acc + (r.hoursSpent || 0), 0);
    const income = entriesOnDay.filter(r => r.financialType === 'income').reduce((acc, r) => acc + r.financialAmount, 0);
    const expense = entriesOnDay.filter(r => r.financialType === 'expense').reduce((acc, r) => acc + r.financialAmount, 0);

    dailyLabels.push(`${d}`);
    dailyHours.push(Number(hours.toFixed(1)));
    if (d % 2 !== 0 || daysInMonth <= 15) {
      dailyCashFlowData.push({
        label: `Tgl ${d}`,
        value: income,
        secondaryValue: expense,
      });
    }
  }

  // Category donut slices
  const categoryColors: Record<ReportCategory, string> = {
    operasional: '#3b82f6',
    keuangan: '#10b981',
    proyek: '#6366f1',
    sdm: '#f59e0b',
    penjualan: '#ec4899',
    layanan: '#8b5cf6',
  };

  const donutSlices = (Object.keys(aggregation.categoryCounts) as ReportCategory[])
    .filter(cat => aggregation.categoryCounts[cat] > 0)
    .map(cat => ({
      label: getCategoryLabel(cat),
      count: aggregation.categoryCounts[cat],
      color: categoryColors[cat] || '#94a3b8',
    }));

  // Export CSV
  const handleExportCSV = () => {
    const rows = monthEntries.map(r => ({
      ID: r.id,
      Tanggal: r.date,
      Kategori: getCategoryLabel(r.category),
      Judul: r.title,
      Departemen: r.department,
      Pelapor: r.author,
      Jabatan: r.authorRole,
      Deskripsi: r.description,
      Output: r.output,
      'Jam Kerja': r.hoursSpent,
      'KPI (%)': r.kpiProgress,
      'Tipe Finansial': r.financialType,
      'Nominal (Rp)': r.financialAmount,
      Status: getStatusLabel(r.status),
    }));
    exportToCSV(`Laporan-Bulanan-${aggregation.monthName}-${selectedYear}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Month & Year Selector Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => shiftMonth(-1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-slate-500" />
              <select
                value={selectedMonth}
                onChange={e => onMonthChange(parseInt(e.target.value, 10), selectedYear)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {INDO_MONTHS.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={e => onMonthChange(selectedMonth, parseInt(e.target.value, 10))}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => shiftMonth(1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-700">
            Rekapitulasi Bulanan: <span className="text-indigo-600 font-bold">{aggregation.monthName} {selectedYear}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Download CSV Laporan Bulanan"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => onOpenPrintModal(
              `Laporan Kinerja & Akuntabilitas Bulanan`,
              `${aggregation.monthName} ${selectedYear}`,
              monthEntries,
              evalNotes
            )}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            title="Cetak format laporan resmi bulanan"
          >
            <Printer className="h-3.5 w-3.5 text-white" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Monthly KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Catatan</span>
          <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {aggregation.totalEntries}
          </div>
          <span className="text-[10px] text-slate-400">Aktivitas terdata</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Jam Kerja Efektif</span>
          <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {aggregation.totalHours} <span className="text-xs font-normal text-slate-400">Jam</span>
          </div>
          <span className="text-[10px] text-slate-400">Kumulatif staf</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-rata KPI</span>
          <div className="mt-1 font-mono text-xl font-bold text-indigo-700 tabular-nums">
            {aggregation.avgKpi}%
          </div>
          <span className="text-[10px] text-slate-400">Target tercapai</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Pemasukan</span>
          <div className="mt-1 font-mono text-xs font-bold text-emerald-700 tabular-nums truncate">
            {formatRupiah(aggregation.totalIncome)}
          </div>
          <span className="text-[10px] text-slate-400">Inflow kas</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Pengeluaran</span>
          <div className="mt-1 font-mono text-xs font-bold text-rose-700 tabular-nums truncate">
            {formatRupiah(aggregation.totalExpense)}
          </div>
          <span className="text-[10px] text-slate-400">Outflow kas</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Arus Kas Bersih</span>
          <div className={`mt-1 font-mono text-xs font-bold tabular-nums truncate ${
            aggregation.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatRupiah(aggregation.netCashFlow)}
          </div>
          <span className="text-[10px] text-slate-400">Net surplus / defisit</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Jam Kerja Harian */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Alokasi Jam Kerja Harian</h3>
              <p className="text-xs text-slate-500">Distribusi jam kerja efektif per tanggal dalam bulan ini</p>
            </div>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <LineChart labels={dailyLabels} values={dailyHours} height={190} unit="Jam" />
        </div>

        {/* Donut Distribusi Kategori */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Komposisi Kategori Tugas</h3>
              <p className="text-xs text-slate-500">Proporsi aktivitas operasional, keuangan, dan proyek</p>
            </div>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <DonutChart data={donutSlices} totalLabel="Kegiatan" size={160} />
        </div>
      </div>

      {/* Arus Kas Bar Chart (Jika ada data keuangan) */}
      {dailyCashFlowData.some(d => d.value > 0 || d.secondaryValue > 0) && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Perbandingan Arus Kas Pemasukan vs Pengeluaran</h3>
              <p className="text-xs text-slate-500">Visualisasi nilai nominal transaksi keuangan dalam bulan ini</p>
            </div>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <BarChart
            data={dailyCashFlowData}
            isCurrency={true}
            primaryLabel="Pemasukan"
            secondaryLabel="Pengeluaran"
            height={190}
          />
        </div>
      )}

      {/* Executive Evaluation Notes Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Catatan Evaluasi Bulanan & Rekomendasi Pimpinan
            </h3>
            <p className="text-xs text-slate-500">
              Catatan ini akan otomatis disertakan pada lembar cetak dokumen resmi laporan bulanan.
            </p>
          </div>
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            {savedNotesToast ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Catatan</span>
              </>
            )}
          </button>
        </div>
        <textarea
          rows={3}
          value={evalNotes}
          onChange={e => setEvalNotes(e.target.value)}
          placeholder="Tuliskan evaluasi pencapaian target bulan ini, kendala utama yang dihadapi, serta rencana tindak lanjut untuk bulan mendatang..."
          className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Detailed Records Table for Selected Month */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 p-4 bg-slate-50/60">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Rekapitulasi Rinci Seluruh Kegiatan ({filteredEntries.length} Data)
            </h3>
            <p className="text-xs text-slate-500">
              Daftar kegiatan pada {aggregation.monthName} {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Departemen</option>
              {config.departmentList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="operasional">Operasional</option>
              <option value="keuangan">Keuangan</option>
              <option value="proyek">Proyek</option>
              <option value="sdm">SDM</option>
              <option value="penjualan">Penjualan</option>
              <option value="layanan">Layanan</option>
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada laporan pada bulan ini yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3 w-28">Tanggal</th>
                  <th className="px-4 py-3">Pokok Kegiatan</th>
                  <th className="px-4 py-3 w-36">Kategori / Divisi</th>
                  <th className="px-4 py-3 w-28 text-right">Finansial</th>
                  <th className="px-4 py-3 w-24 text-center">Durasi / KPI</th>
                  <th className="px-4 py-3 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredEntries.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap text-slate-600">
                      {item.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>
                      {item.output && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          Output: {item.output}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      <div className="font-medium text-slate-800">{getCategoryLabel(item.category)}</div>
                      <div className="text-[10px] text-slate-400">{item.department}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {item.financialType !== 'none' && item.financialAmount > 0 ? (
                        <span className={item.financialType === 'income' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                          {item.financialType === 'income' ? '+' : '-'} {formatRupiah(item.financialAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums text-[11px]">
                      <div>{item.hoursSpent} Jam</div>
                      <div className="font-semibold text-indigo-700">{item.kpiProgress}%</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-xs ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-700'
                          : item.status === 'revision'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
