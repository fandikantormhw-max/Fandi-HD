import { ReportEntry, OrganizationConfig, MonthAggregation, QuarterAggregation, ReportCategory } from '../types/report';
import { sampleReportEntries, initialOrganizationConfig } from './sampleData';
import { INDO_MONTHS } from './formatters';

const STORAGE_KEY_REPORTS = 'laporpro_reports_v1';
const STORAGE_KEY_CONFIG = 'laporpro_config_v1';
const STORAGE_KEY_EVAL_NOTES = 'laporpro_eval_notes_v1';

export function getStoredReports(): ReportEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(sampleReportEntries));
      return sampleReportEntries;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleReportEntries;
  } catch (err) {
    console.error('Failed to read reports from localStorage:', err);
    return sampleReportEntries;
  }
}

export function saveReports(reports: ReportEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage:', err);
  }
}

export function getStoredConfig(): OrganizationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(initialOrganizationConfig));
      return initialOrganizationConfig;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read config from localStorage:', err);
    return initialOrganizationConfig;
  }
}

export function saveConfig(config: OrganizationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save config to localStorage:', err);
  }
}

export function getStoredEvaluationNotes(key: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVAL_NOTES);
    if (!raw) return '';
    const map = JSON.parse(raw);
    return map[key] || '';
  } catch {
    return '';
  }
}

export function saveEvaluationNotes(key: string, notes: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVAL_NOTES);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = notes;
    localStorage.setItem(STORAGE_KEY_EVAL_NOTES, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save evaluation notes:', err);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(sampleReportEntries));
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(initialOrganizationConfig));
  localStorage.removeItem(STORAGE_KEY_EVAL_NOTES);
}

export function aggregateMonthly(reports: ReportEntry[], year: number, month: number): MonthAggregation {
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const prefix = `${year}-${monthStr}`;

  const filtered = reports.filter(r => r.date.startsWith(prefix));

  let totalHours = 0;
  let totalKpi = 0;
  let totalIncome = 0;
  let totalExpense = 0;

  const statusCounts = {
    approved: 0,
    pending_review: 0,
    revision: 0,
    draft: 0
  };

  const categoryCounts: Record<ReportCategory, number> = {
    operasional: 0,
    keuangan: 0,
    proyek: 0,
    sdm: 0,
    penjualan: 0,
    layanan: 0
  };

  filtered.forEach(r => {
    totalHours += r.hoursSpent || 0;
    totalKpi += r.kpiProgress || 0;
    if (r.financialType === 'income') totalIncome += r.financialAmount || 0;
    if (r.financialType === 'expense') totalExpense += r.financialAmount || 0;

    if (statusCounts[r.status] !== undefined) {
      statusCounts[r.status]++;
    }
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    }
  });

  const avgKpi = filtered.length > 0 ? Math.round(totalKpi / filtered.length) : 0;
  const netCashFlow = totalIncome - totalExpense;

  return {
    month,
    monthName: INDO_MONTHS[month - 1],
    year,
    totalEntries: filtered.length,
    totalHours: Number(totalHours.toFixed(1)),
    avgKpi,
    totalIncome,
    totalExpense,
    netCashFlow,
    statusCounts,
    categoryCounts
  };
}

export function aggregateYearly(reports: ReportEntry[], year: number) {
  const months: MonthAggregation[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(aggregateMonthly(reports, year, m));
  }

  const quarters: QuarterAggregation[] = [
    {
      quarter: 1,
      quarterName: 'Kuartal I (Jan - Mar)',
      months: months.slice(0, 3),
      totalEntries: 0,
      totalHours: 0,
      avgKpi: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    },
    {
      quarter: 2,
      quarterName: 'Kuartal II (Apr - Jun)',
      months: months.slice(3, 6),
      totalEntries: 0,
      totalHours: 0,
      avgKpi: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    },
    {
      quarter: 3,
      quarterName: 'Kuartal III (Jul - Sep)',
      months: months.slice(6, 9),
      totalEntries: 0,
      totalHours: 0,
      avgKpi: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    },
    {
      quarter: 4,
      quarterName: 'Kuartal IV (Okt - Des)',
      months: months.slice(9, 12),
      totalEntries: 0,
      totalHours: 0,
      avgKpi: 0,
      totalIncome: 0,
      totalExpense: 0,
      netCashFlow: 0,
    },
  ];

  quarters.forEach(q => {
    q.totalEntries = q.months.reduce((acc, m) => acc + m.totalEntries, 0);
    q.totalHours = Number(q.months.reduce((acc, m) => acc + m.totalHours, 0).toFixed(1));
    q.totalIncome = q.months.reduce((acc, m) => acc + m.totalIncome, 0);
    q.totalExpense = q.months.reduce((acc, m) => acc + m.totalExpense, 0);
    q.netCashFlow = q.totalIncome - q.totalExpense;
    const activeMonths = q.months.filter(m => m.totalEntries > 0);
    q.avgKpi = activeMonths.length > 0 
      ? Math.round(activeMonths.reduce((acc, m) => acc + m.avgKpi, 0) / activeMonths.length)
      : 0;
  });

  const totalEntries = months.reduce((acc, m) => acc + m.totalEntries, 0);
  const totalHours = Number(months.reduce((acc, m) => acc + m.totalHours, 0).toFixed(1));
  const totalIncome = months.reduce((acc, m) => acc + m.totalIncome, 0);
  const totalExpense = months.reduce((acc, m) => acc + m.totalExpense, 0);
  const netCashFlow = totalIncome - totalExpense;
  const activeMonthsAll = months.filter(m => m.totalEntries > 0);
  const avgKpi = activeMonthsAll.length > 0
    ? Math.round(activeMonthsAll.reduce((acc, m) => acc + m.avgKpi, 0) / activeMonthsAll.length)
    : 0;

  return {
    year,
    months,
    quarters,
    totalEntries,
    totalHours,
    avgKpi,
    totalIncome,
    totalExpense,
    netCashFlow,
  };
}
