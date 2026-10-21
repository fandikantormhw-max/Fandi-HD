import { ReportCategory, ReportEntry, ReportStatus, PriorityLevel } from '../types/report';

export const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDO_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${INDO_MONTHS[month]} ${year}`;
}

export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayName = INDO_DAYS[d.getDay()];
  return `${dayName}, ${formatDateIndo(dateStr)}`;
}

export function getCategoryLabel(category: ReportCategory): string {
  const map: Record<ReportCategory, string> = {
    operasional: 'Operasional',
    keuangan: 'Keuangan & Akuntansi',
    proyek: 'Proyek & Teknis',
    sdm: 'SDM & Personalia',
    penjualan: 'Penjualan & Pemasaran',
    layanan: 'Layanan & Pelanggan',
  };
  return map[category] || category;
}

export function getStatusLabel(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    draft: 'Draft (Konsep)',
    pending_review: 'Menunggu Review',
    approved: 'Disetujui',
    revision: 'Perlu Revisi',
  };
  return map[status] || status;
}

export function getPriorityLabel(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    rendah: 'Rendah',
    sedang: 'Sedang',
    tinggi: 'Tinggi',
    kritis: 'Kritis (Mendesak)',
  };
  return map[priority] || priority;
}

export function generateWhatsAppDailyReport(
  date: string,
  author: string,
  department: string,
  entries: ReportEntry[]
): string {
  const dateFormatted = formatDateWithDay(date);
  let text = `*LAPORAN AKTIVITAS HARIAN*\n`;
  text += `📅 Tanggal: ${dateFormatted}\n`;
  text += `👤 Pelapor: ${author} (${department})\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (entries.length === 0) {
    text += `Belum ada catatan aktivitas untuk hari ini.\n`;
    return text;
  }

  let totalHours = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  entries.forEach((item, index) => {
    totalHours += item.hoursSpent || 0;
    if (item.financialType === 'income') totalIncome += item.financialAmount || 0;
    if (item.financialType === 'expense') totalExpense += item.financialAmount || 0;

    text += `*${index + 1}. [${getCategoryLabel(item.category)}] ${item.title}*\n`;
    text += `   • Uraian: ${item.description}\n`;
    text += `   • Capaian/Output: ${item.output}\n`;
    text += `   • Durasi: ${item.hoursSpent} Jam | Progres: ${item.kpiProgress}%\n`;
    if (item.obstacle) {
      text += `   • Kendala: ${item.obstacle}\n`;
      if (item.solution) {
        text += `   • Tindak Lanjut: ${item.solution}\n`;
      }
    }
    if (item.financialType !== 'none' && item.financialAmount > 0) {
      const typeLabel = item.financialType === 'income' ? 'Pemasukan' : 'Pengeluaran';
      text += `   • Finansial (${typeLabel}): ${formatRupiah(item.financialAmount)}\n`;
    }
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 *RINGKASAN TOTAL:*\n`;
  text += `• Total Tugas: ${entries.length} kegiatan\n`;
  text += `• Total Jam Kerja: ${totalHours.toFixed(1)} Jam\n`;
  if (totalIncome > 0) text += `• Total Pemasukan: ${formatRupiah(totalIncome)}\n`;
  if (totalExpense > 0) text += `• Total Pengeluaran: ${formatRupiah(totalExpense)}\n`;
  text += `\nDemikian laporan harian ini disampaikan. Terima kasih.`;

  return text;
}

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(h => {
          let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
          val = val.replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
