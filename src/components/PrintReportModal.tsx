import React from 'react';
import { X, Printer } from 'lucide-react';
import { ReportEntry, OrganizationConfig } from '../types/report';
import { formatDateIndo, formatRupiah, getCategoryLabel, getStatusLabel } from '../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  periodLabel: string;
  entries: ReportEntry[];
  config: OrganizationConfig;
  executiveNotes?: string;
  totalIncome?: number;
  totalExpense?: number;
  totalHours?: number;
  avgKpi?: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  title,
  periodLabel,
  entries,
  config,
  executiveNotes,
  totalIncome = 0,
  totalExpense = 0,
  totalHours = 0,
  avgKpi = 0,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const netFlow = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 my-6 flex flex-col max-h-[92vh]">
        {/* Action Bar (Hidden during actual print) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50 rounded-t-xl no-print">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">Pratinjau Cetak / Ekspor PDF Resmi</span>
            <span className="text-xs text-slate-500">· Siap cetak standar dokumen A4</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper View */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 print-container" id="printable-doc">
          {/* Header Kop Surat Perusahaan */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {config.companyName}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {config.companyTagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sistem Informasi & Manajemen Pelaporan Akuntabilitas Terpadu (LaporPro)
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                <div>No. Dok: RPT/{new Date().getFullYear()}/{entries.length}</div>
                <div>Dicetak: {formatDateIndo(new Date().toISOString().split('T')[0])}</div>
              </div>
            </div>
          </div>

          {/* Judul Laporan & Periode */}
          <div className="text-center my-6">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              {title}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Periode Evaluasi: <span className="font-semibold text-slate-800">{periodLabel}</span>
            </p>
          </div>

          {/* Ringkasan Parameter Kunci */}
          <div className="grid grid-cols-4 gap-3 border border-slate-300 rounded-md p-3 mb-6 bg-slate-50/50 text-xs">
            <div>
              <span className="block text-[11px] text-slate-500">Total Kegiatan</span>
              <span className="font-mono text-sm font-bold text-slate-800 tabular-nums">{entries.length} Catatan</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500">Total Jam Efektif</span>
              <span className="font-mono text-sm font-bold text-slate-800 tabular-nums">{totalHours} Jam</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500">Rata-rata KPI</span>
              <span className="font-mono text-sm font-bold text-indigo-700 tabular-nums">{avgKpi}%</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-500">Arus Kas Bersih</span>
              <span className={`font-mono text-xs font-bold tabular-nums ${netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatRupiah(netFlow)}
              </span>
            </div>
          </div>

          {/* Tabel Rincian Kegiatan */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Daftar Rincian Pelaksanaan Pekerjaan
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-left">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2.5 py-1.5 w-24">Tanggal</th>
                  <th className="border border-slate-300 px-2.5 py-1.5">Kegiatan & Deskripsi</th>
                  <th className="border border-slate-300 px-2.5 py-1.5 w-28">Kategori / Divisi</th>
                  <th className="border border-slate-300 px-2.5 py-1.5 w-28 text-right">Finansial</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-16 text-center">KPI / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="align-top">
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-mono tabular-nums">
                      {index + 1}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5">
                      <div className="font-bold text-slate-900">{entry.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{entry.description}</div>
                      {entry.output && (
                        <div className="text-[10px] text-slate-500 mt-0.5 italic">
                          Hasil: {entry.output}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-[11px]">
                      <div className="font-medium text-slate-800">{getCategoryLabel(entry.category)}</div>
                      <div className="text-[10px] text-slate-500">{entry.department}</div>
                    </td>
                    <td className="border border-slate-300 px-2.5 py-1.5 text-right font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {entry.financialType !== 'none' && entry.financialAmount > 0 ? (
                        <span className={entry.financialType === 'income' ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                          {entry.financialType === 'income' ? '+' : '-'} {formatRupiah(entry.financialAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-[10px] font-mono tabular-nums">
                      <div>{entry.kpiProgress}%</div>
                      <div className="text-[9px] text-slate-500">{getStatusLabel(entry.status)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan / Evaluasi Manajemen */}
          {executiveNotes && (
            <div className="mb-8 border border-slate-300 rounded-md p-3.5 bg-slate-50/70 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Catatan Evaluasi & Rekomendasi Pimpinan:</span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{executiveNotes}</p>
            </div>
          )}

          {/* Kolom Lembar Pengesahan & Tanda Tangan */}
          <div className="mt-12 pt-4 border-t border-slate-300 page-break">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <p className="text-slate-500 mb-1">Disusun Oleh,</p>
                <p className="font-medium text-slate-700 mb-16">{config.defaultAuthorRole}</p>
                <div className="border-b border-slate-400 w-36 mx-auto"></div>
                <p className="font-bold text-slate-900 mt-1">{config.defaultAuthorName}</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">Diperiksa Oleh,</p>
                <p className="font-medium text-slate-700 mb-16">{config.supervisorRole}</p>
                <div className="border-b border-slate-400 w-36 mx-auto"></div>
                <p className="font-bold text-slate-900 mt-1">{config.supervisorName}</p>
              </div>

              <div>
                <p className="text-slate-500 mb-1">Mengetahui & Menyetujui,</p>
                <p className="font-medium text-slate-700 mb-16">{config.chiefOfficerRole}</p>
                <div className="border-b border-slate-400 w-36 mx-auto"></div>
                <p className="font-bold text-slate-900 mt-1">{config.chiefOfficerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
