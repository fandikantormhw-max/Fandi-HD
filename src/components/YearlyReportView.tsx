import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Printer, Download, 
  BarChart3, CheckCircle2, TrendingUp, DollarSign, Save, Check 
} from 'lucide-react';
import { ReportEntry, OrganizationConfig } from '../types/report';
import { 
  formatRupiah, formatNumber, exportToCSV 
} from '../utils/formatters';
import { aggregateYearly, getStoredEvaluationNotes, saveEvaluationNotes } from '../utils/storage';
import { BarChart, LineChart } from './Charts';

interface YearlyReportViewProps {
  reports: ReportEntry[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onOpenPrintModal: (title: string, periodLabel: string, entries: ReportEntry[], notes?: string) => void;
  config: OrganizationConfig;
}

export const YearlyReportView: React.FC<YearlyReportViewProps> = ({
  reports,
  selectedYear,
  onYearChange,
  onOpenPrintModal,
  config,
}) => {
  const [evalNotes, setEvalNotes] = useState('');
  const [savedNotesToast, setSavedNotesToast] = useState(false);

  const evalKey = `yearly_${selectedYear}`;

  useEffect(() => {
    setEvalNotes(getStoredEvaluationNotes(evalKey));
  }, [selectedYear]);

  const handleSaveNotes = () => {
    saveEvaluationNotes(evalKey, evalNotes);
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 2000);
  };

  const yearlyData = aggregateYearly(reports, selectedYear);
  const yearEntries = reports.filter(r => r.date.startsWith(`${selectedYear}-`));

  // Chart data: 12 months financial & hours
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthCashFlowData = yearlyData.months.map((m, idx) => ({
    label: monthLabels[idx],
    value: m.totalIncome,
    secondaryValue: m.totalExpense,
  }));
  const monthHoursData = yearlyData.months.map(m => m.totalHours);

  // Export CSV
  const handleExportCSV = () => {
    const rows = yearlyData.months.map(m => ({
      Bulan: m.monthName,
      Tahun: selectedYear,
      'Total Catatan': m.totalEntries,
      'Jam Kerja': m.totalHours,
      'Rata-rata KPI (%)': m.avgKpi,
      'Pemasukan (Rp)': m.totalIncome,
      'Pengeluaran (Rp)': m.totalExpense,
      'Saldo Bersih (Rp)': m.netCashFlow,
      'Disetujui': m.statusCounts.approved,
      'Perlu Revisi': m.statusCounts.revision,
      'Menunggu': m.statusCounts.pending_review,
    }));
    exportToCSV(`Matriks-Laporan-Tahunan-${selectedYear}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Year Selector & Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => onYearChange(selectedYear - 1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-4">
              <Calendar className="h-4 w-4 text-slate-500" />
              <select
                value={selectedYear}
                onChange={e => onYearChange(parseInt(e.target.value, 10))}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onYearChange(selectedYear + 1)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-700">
            Laporan Kinerja & Akuntabilitas Tahunan: <span className="text-indigo-600 font-bold">{selectedYear}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Download CSV Matriks Tahunan"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor Matriks CSV</span>
          </button>

          <button
            onClick={() => onOpenPrintModal(
              `Laporan Kinerja & Akuntabilitas Tahunan`,
              `Tahun Buku ${selectedYear}`,
              yearEntries,
              evalNotes
            )}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            title="Cetak Dokumen Resmi Laporan Tahunan"
          >
            <Printer className="h-3.5 w-3.5 text-white" />
            <span>Cetak Dokumen Tahunan</span>
          </button>
        </div>
      </div>

      {/* Annual Key Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Kegiatan</span>
          <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {yearlyData.totalEntries}
          </div>
          <span className="text-[10px] text-slate-400">Kumulatif setahun</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Jam Kerja</span>
          <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {yearlyData.totalHours} <span className="text-xs font-normal text-slate-400">Jam</span>
          </div>
          <span className="text-[10px] text-slate-400">Waktu terutilisasi</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-rata KPI</span>
          <div className="mt-1 font-mono text-xl font-bold text-indigo-700 tabular-nums">
            {yearlyData.avgKpi}%
          </div>
          <span className="text-[10px] text-slate-400">Indeks keberhasilan</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Pemasukan Tahunan</span>
          <div className="mt-1 font-mono text-xs font-bold text-emerald-700 tabular-nums truncate">
            {formatRupiah(yearlyData.totalIncome)}
          </div>
          <span className="text-[10px] text-slate-400">Total inflow</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Pengeluaran Tahunan</span>
          <div className="mt-1 font-mono text-xs font-bold text-rose-700 tabular-nums truncate">
            {formatRupiah(yearlyData.totalExpense)}
          </div>
          <span className="text-[10px] text-slate-400">Total belanja</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Laba / Saldo Bersih</span>
          <div className={`mt-1 font-mono text-xs font-bold tabular-nums truncate ${
            yearlyData.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatRupiah(yearlyData.netCashFlow)}
          </div>
          <span className="text-[10px] text-slate-400">Hasil bersih tahunan</span>
        </div>
      </div>

      {/* 4 Quarters Breakdown Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Performa Berdasarkan Kuartal (Triwulan)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {yearlyData.quarters.map(q => (
            <div key={q.quarter} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">{q.quarterName}</span>
                <span className="font-mono text-xs font-semibold text-indigo-600">{q.totalEntries} Kegiatan</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Jam Kerja:</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">{q.totalHours} Jam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pencapaian KPI:</span>
                  <span className="font-mono font-bold text-indigo-700 tabular-nums">{q.avgKpi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemasukan:</span>
                  <span className="font-mono font-medium text-emerald-700 tabular-nums">{formatRupiah(q.totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pengeluaran:</span>
                  <span className="font-mono font-medium text-rose-700 tabular-nums">{formatRupiah(q.totalExpense)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold">
                  <span className="text-slate-700">Net Kuartal:</span>
                  <span className={`font-mono tabular-nums ${q.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatRupiah(q.netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics 12 Months */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Arus Kas 12 Bulan (Pemasukan vs Pengeluaran)</h3>
              <p className="text-xs text-slate-500">Perbandingan pergerakan dana masuk dan keluar per bulan</p>
            </div>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <BarChart
            data={monthCashFlowData}
            isCurrency={true}
            primaryLabel="Pemasukan"
            secondaryLabel="Pengeluaran"
            height={200}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Jam Kerja Produktif 12 Bulan</h3>
              <p className="text-xs text-slate-500">Alokasi total jam kerja tim sepanjang tahun</p>
            </div>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <LineChart labels={monthLabels} values={monthHoursData} height={200} unit="Jam" />
        </div>
      </div>

      {/* 12-Month Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 bg-slate-50/60">
          <h3 className="text-sm font-bold text-slate-800">
            Matriks Rekapitulasi Tahunan 12 Bulan ({selectedYear})
          </h3>
          <p className="text-xs text-slate-500">
            Komparasi komprehensif performa kegiatan, alokasi jam, KPI, dan keuangan per bulan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">Bulan</th>
                <th className="px-4 py-3 w-28">Nama Bulan</th>
                <th className="px-4 py-3 text-center">Total Kegiatan</th>
                <th className="px-4 py-3 text-center">Total Jam</th>
                <th className="px-4 py-3 text-center">Rata-rata KPI</th>
                <th className="px-4 py-3 text-right">Pemasukan (In)</th>
                <th className="px-4 py-3 text-right">Pengeluaran (Out)</th>
                <th className="px-4 py-3 text-right">Saldo Bersih (Net)</th>
                <th className="px-4 py-3 text-center">Disetujui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {yearlyData.months.map((m, idx) => (
                <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {m.monthName}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums">
                    {m.totalEntries > 0 ? (
                      <span className="font-semibold text-slate-800">{m.totalEntries}</span>
                    ) : (
                      <span className="text-slate-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums">
                    {m.totalHours > 0 ? `${m.totalHours} Jam` : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums">
                    {m.totalEntries > 0 ? (
                      <span className="font-semibold text-indigo-700">{m.avgKpi}%</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.totalIncome > 0 ? (
                      <span className="text-emerald-700 font-medium">{formatRupiah(m.totalIncome)}</span>
                    ) : (
                      <span className="text-slate-300">Rp 0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                    {m.totalExpense > 0 ? (
                      <span className="text-rose-700 font-medium">{formatRupiah(m.totalExpense)}</span>
                    ) : (
                      <span className="text-slate-300">Rp 0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">
                    {m.netCashFlow !== 0 ? (
                      <span className={m.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {formatRupiah(m.netCashFlow)}
                      </span>
                    ) : (
                      <span className="text-slate-300">Rp 0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums text-emerald-700">
                    {m.statusCounts.approved}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-left">
                  TOTAL AKUMULASI TAHUNAN ({selectedYear})
                </td>
                <td className="px-4 py-3 text-center font-mono tabular-nums">
                  {yearlyData.totalEntries}
                </td>
                <td className="px-4 py-3 text-center font-mono tabular-nums">
                  {yearlyData.totalHours} Jam
                </td>
                <td className="px-4 py-3 text-center font-mono tabular-nums text-indigo-700">
                  {yearlyData.avgKpi}%
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700">
                  {formatRupiah(yearlyData.totalIncome)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-rose-700">
                  {formatRupiah(yearlyData.totalExpense)}
                </td>
                <td className={`px-4 py-3 text-right font-mono tabular-nums ${
                  yearlyData.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {formatRupiah(yearlyData.netCashFlow)}
                </td>
                <td className="px-4 py-3 text-center font-mono tabular-nums text-emerald-700">
                  {yearlyData.months.reduce((acc, m) => acc + m.statusCounts.approved, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Strategic Annual Evaluation Notes */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Catatan Evaluasi Strategis Tahunan & Rekomendasi Dewan Direksi
            </h3>
            <p className="text-xs text-slate-500">
              Uraian pencapaian target tahun buku, restrospeksi kendala, dan prioritas strategis tahun mendatang.
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
          placeholder="Tuliskan evaluasi kinerja tahunan, pencapaian milestone penting, efisiensi anggaran, dan rekomendasi arah kebijakan tahun berikutnya..."
          className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
