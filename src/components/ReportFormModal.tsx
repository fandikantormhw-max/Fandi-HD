import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Clock, AlertTriangle, Tag, Building2, User } from 'lucide-react';
import { ReportEntry, ReportCategory, PriorityLevel, FinancialFlowType, ReportStatus, OrganizationConfig } from '../types/report';
import { formatRupiah } from '../utils/formatters';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<ReportEntry>) => void;
  initialData?: ReportEntry | null;
  config: OrganizationConfig;
  defaultDate?: string;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  config,
  defaultDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('operasional');
  const [department, setDepartment] = useState('');
  const [author, setAuthor] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [solution, setSolution] = useState('');
  const [hoursSpent, setHoursSpent] = useState<number>(4);
  const [kpiProgress, setKpiProgress] = useState<number>(100);
  const [financialType, setFinancialType] = useState<FinancialFlowType>('none');
  const [financialAmount, setFinancialAmount] = useState<number>(0);
  const [financialNote, setFinancialNote] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('sedang');
  const [status, setStatus] = useState<ReportStatus>('pending_review');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setTitle(initialData.title);
      setCategory(initialData.category);
      setDepartment(initialData.department);
      setAuthor(initialData.author);
      setAuthorRole(initialData.authorRole);
      setDescription(initialData.description);
      setOutput(initialData.output);
      setObstacle(initialData.obstacle || '');
      setSolution(initialData.solution || '');
      setHoursSpent(initialData.hoursSpent);
      setKpiProgress(initialData.kpiProgress);
      setFinancialType(initialData.financialType);
      setFinancialAmount(initialData.financialAmount);
      setFinancialNote(initialData.financialNote || '');
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setTagsInput(initialData.tags?.join(', ') || '');
    } else {
      setDate(defaultDate || todayStr);
      setTitle('');
      setCategory('operasional');
      setDepartment(config.departmentList[0] || 'Operasional & Logistik');
      setAuthor(config.defaultAuthorName);
      setAuthorRole(config.defaultAuthorRole);
      setDescription('');
      setOutput('');
      setObstacle('');
      setSolution('');
      setHoursSpent(4);
      setKpiProgress(100);
      setFinancialType('none');
      setFinancialAmount(0);
      setFinancialNote('');
      setPriority('sedang');
      setStatus('pending_review');
      setTagsInput('');
    }
  }, [initialData, defaultDate, config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      ...(initialData ? { id: initialData.id, createdAt: initialData.createdAt } : {}),
      date,
      title: title.trim(),
      category,
      department,
      author: author.trim() || config.defaultAuthorName,
      authorRole: authorRole.trim() || config.defaultAuthorRole,
      description: description.trim(),
      output: output.trim(),
      obstacle: obstacle.trim() || undefined,
      solution: solution.trim() || undefined,
      hoursSpent: Number(hoursSpent) || 0,
      kpiProgress: Number(kpiProgress) || 0,
      financialType,
      financialAmount: financialType === 'none' ? 0 : Number(financialAmount) || 0,
      financialNote: financialType === 'none' ? undefined : financialNote.trim(),
      priority,
      status,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs no-print overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-xl border border-slate-200 my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? 'Ubah Laporan Harian' : 'Buat Laporan Aktivitas Harian Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Isi data detail kegiatan harian, capaian KPI, dan rincian transaksi bila ada.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Row 1: Tanggal & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Laporan *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Laporan *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ReportCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="operasional">Operasional & Lapangan</option>
                <option value="keuangan">Keuangan & Akuntansi</option>
                <option value="proyek">Proyek & Teknologi</option>
                <option value="sdm">SDM, Personalia & Legal</option>
                <option value="penjualan">Penjualan & Pemasaran</option>
                <option value="layanan">Layanan Pelanggan & Kualitas</option>
              </select>
            </div>
          </div>

          {/* Row 2: Judul Kegiatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Kegiatan / Pokok Pekerjaan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemeliharaan Server Database dan Audit Patching Mingguan"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Row 3: Departemen & Pelapor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>Divisi / Departemen</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {config.departmentList.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Nama Pelapor</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Pelapor
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Uraian & Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rincian / Uraian Pelaksanaan Kegiatan *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Deskripsikan proses teknis, koordinasi pihak terkait, dan tindakan yang dilakukan..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Output / Capaian Hasil yang Diperoleh *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Sebutkan hasil nyata, deliverable, dokumen, atau status penyelesaian..."
                value={output}
                onChange={e => setOutput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Kendala & Solusi (Hambatan dan Tindak Lanjut) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Kendala / Hambatan (Bila ada)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Keterlambatan pengiriman material dari vendor..."
                value={obstacle}
                onChange={e => setObstacle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solusi / Rencana Tindak Lanjut
              </label>
              <input
                type="text"
                placeholder="Contoh: Mengalihkan order ke suplier cadangan & penyesuaian jadwal..."
                value={solution}
                onChange={e => setSolution(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Jam Kerja & Capaian KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Durasi Jam Kerja (Jam)</span>
                </span>
                <span className="font-mono text-indigo-700 font-semibold">{hoursSpent} Jam</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hoursSpent}
                onChange={e => setHoursSpent(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Capaian Target KPI (%)</span>
                <span className="font-mono text-indigo-700 font-semibold">{kpiProgress}%</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={kpiProgress}
                  onChange={e => setKpiProgress(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kpiProgress}
                  onChange={e => setKpiProgress(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono text-center tabular-nums focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 7: Transaksi Finansial (Pemasukan / Pengeluaran) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                <span>Pencatatan Finansial Terkait (Opsional)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFinancialType('none')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                    financialType === 'none'
                      ? 'bg-white shadow-xs text-slate-900 border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tidak Ada
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialType('income')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                    financialType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialType('expense')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                    financialType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-rose-700'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            {financialType !== 'none' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nominal Rupiah (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={financialAmount}
                    onChange={e => setFinancialAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
                    placeholder="Contoh: 1500000"
                  />
                  <span className="block mt-1 text-[11px] font-mono text-slate-500">
                    Terformat: {formatRupiah(financialAmount)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Keterangan Transaksi / No. Kuitansi
                  </label>
                  <input
                    type="text"
                    value={financialNote}
                    onChange={e => setFinancialNote(e.target.value)}
                    placeholder="Contoh: Pembelian BBM & Tol armada B-9122-XYZ"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 8: Prioritas, Status & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioritas Pekerjaan
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="rendah">Rendah (Low)</option>
                <option value="sedang">Sedang (Standard)</option>
                <option value="tinggi">Tinggi (High)</option>
                <option value="kritis">Kritis / Mendesak (Urgent)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Verifikasi
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ReportStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="draft">Draft (Konsep Pribadi)</option>
                <option value="pending_review">Kirim untuk Ditinjau (Pending)</option>
                <option value="approved">Langsung Disetujui (Approved)</option>
                <option value="revision">Perlu Revisi (Revision)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>Kata Kunci / Tag (Pisah koma)</span>
              </label>
              <input
                type="text"
                placeholder="Logistik, Server, Vendor"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Terbitkan Laporan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
