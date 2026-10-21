import React, { useState } from 'react';
import { 
  Building2, UserCheck, ShieldCheck, Download, Upload, RotateCcw, 
  Save, Plus, Trash2, Check, AlertCircle 
} from 'lucide-react';
import { OrganizationConfig, ReportEntry } from '../types/report';

interface SettingsModalProps {
  config: OrganizationConfig;
  onSaveConfig: (updated: OrganizationConfig) => void;
  reports: ReportEntry[];
  onImportReports: (imported: ReportEntry[]) => void;
  onResetDefaultData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSaveConfig,
  reports,
  onImportReports,
  onResetDefaultData,
}) => {
  const [formData, setFormData] = useState<OrganizationConfig>({ ...config });
  const [newDept, setNewDept] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddDept = () => {
    if (!newDept.trim()) return;
    if (formData.departmentList.includes(newDept.trim())) return;
    setFormData(prev => ({
      ...prev,
      departmentList: [...prev.departmentList, newDept.trim()],
    }));
    setNewDept('');
  };

  const handleRemoveDept = (deptToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      departmentList: prev.departmentList.filter(d => d !== deptToRemove),
    }));
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config: formData,
      reports,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LaporPro-Cadangan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.reports && Array.isArray(parsed.reports)) {
          onImportReports(parsed.reports);
          if (parsed.config) {
            setFormData(parsed.config);
            onSaveConfig(parsed.config);
          }
          setImportStatus('Data cadangan berhasil dipulihkan!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Format file JSON tidak sesuai.');
        }
      } catch (err) {
        setImportStatus('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Organisasi & Lembar Pengesahan
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi identitas institusi, nama penandatangan laporan resmi, dan daftar departemen.
            </p>
          </div>
          {savedToast && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="h-4 w-4" />
              <span>Pengaturan Berhasil Disimpan!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-6 text-xs">
          {/* Section 1: Profil Organisasi */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Profil Instansi / Perusahaan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Perusahaan / Organisasi
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tagline / Deskripsi Subtitle
                </label>
                <input
                  type="text"
                  value={formData.companyTagline}
                  onChange={e => setFormData({ ...formData, companyTagline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Penandatangan Dokumen Cetak */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Pejabat Penandatangan Laporan Cetak (Kop Surat)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px]">1. Pimpinan Tertinggi (Direktur)</span>
                <div>
                  <label className="block text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.chiefOfficerName}
                    onChange={e => setFormData({ ...formData, chiefOfficerName: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.chiefOfficerRole}
                    onChange={e => setFormData({ ...formData, chiefOfficerRole: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px]">2. Pemeriksa (Supervisor/Kepala Divisi)</span>
                <div>
                  <label className="block text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.supervisorName}
                    onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={formData.supervisorRole}
                    onChange={e => setFormData({ ...formData, supervisorRole: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px]">3. Penyusun Laporan (Staf/Koordinator)</span>
                <div>
                  <label className="block text-slate-600 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.defaultAuthorName}
                    onChange={e => setFormData({ ...formData, defaultAuthorName: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.defaultAuthorRole}
                    onChange={e => setFormData({ ...formData, defaultAuthorRole: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Daftar Departemen / Divisi */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              <span>Kelola Daftar Divisi / Departemen</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah nama divisi baru..."
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDept();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDept}
                className="flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.departmentList.map(dept => (
                <div
                  key={dept}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                >
                  <span>{dept}</span>
                  {formData.departmentList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDept(dept)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi Organisasi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup, Restore & Reset Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Cadangan & Pemulihan Data (Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Simpan seluruh data laporan dan konfigurasi ke dalam berkas JSON atau pulihkan data sebelumnya.
        </p>

        {importStatus && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-800">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Ekspor Cadangan (.JSON)</span>
          </button>

          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Impor Cadangan (.JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin memuat ulang seluruh data demo bawaan? Semua data saat ini akan diganti dengan data sampel resmi.')) {
                onResetDefaultData();
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Reset ke Data Demo Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
