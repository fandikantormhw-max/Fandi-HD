export type ReportCategory = 
  | 'operasional' 
  | 'keuangan' 
  | 'proyek' 
  | 'sdm' 
  | 'penjualan' 
  | 'layanan';

export type ReportStatus = 'draft' | 'pending_review' | 'approved' | 'revision';

export type PriorityLevel = 'rendah' | 'sedang' | 'tinggi' | 'kritis';

export type FinancialFlowType = 'none' | 'income' | 'expense';

export interface ReportEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: ReportCategory;
  department: string;
  author: string;
  authorRole: string;
  description: string;
  output: string;
  obstacle?: string;
  solution?: string;
  hoursSpent: number;
  kpiProgress: number; // 0 to 100
  financialType: FinancialFlowType;
  financialAmount: number;
  financialNote?: string;
  status: ReportStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  priority: PriorityLevel;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationConfig {
  companyName: string;
  companyTagline: string;
  departmentList: string[];
  chiefOfficerName: string;
  chiefOfficerRole: string;
  supervisorName: string;
  supervisorRole: string;
  defaultAuthorName: string;
  defaultAuthorRole: string;
  currency: string;
}

export interface MonthAggregation {
  month: number; // 1 - 12
  monthName: string;
  year: number;
  totalEntries: number;
  totalHours: number;
  avgKpi: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  statusCounts: {
    approved: number;
    pending_review: number;
    revision: number;
    draft: number;
  };
  categoryCounts: Record<ReportCategory, number>;
}

export interface QuarterAggregation {
  quarter: number; // 1 - 4
  quarterName: string;
  months: MonthAggregation[];
  totalEntries: number;
  totalHours: number;
  avgKpi: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}
