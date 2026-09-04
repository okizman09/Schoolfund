export type FundStatus = 'active' | 'completed' | 'cancelled';
export type ContributionStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
export type ExpenseCategory = 'Equipment' | 'Materials' | 'Printing' | 'Transport' | 'Venue' | 'Other';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Fund {
  id: number;
  public_code: string;
  owner_id: number;
  name: string;
  description: string | null;
  target_amount: number;
  contribution_amount: number;
  allow_custom_amount: boolean;
  currency: string;
  deadline: string | null;
  status: FundStatus;
  created_at: string;
  // Computed metrics
  total_collected: number;
  total_spent: number;
  remaining_balance: number;
  percent_funded: number;
  contributors_count: number;
  health_status: 'Healthy' | 'Excellent' | 'On Track' | 'Attention Needed' | 'Starting';
}

export interface PublicFund {
  public_code: string;
  name: string;
  description: string | null;
  target_amount: number;
  contribution_amount: number;
  allow_custom_amount: boolean;
  currency: string;
  deadline: string | null;
  status: FundStatus;
  total_collected: number;
  percent_funded: number;
  contributors_count: number;
}

export interface Contribution {
  id: number;
  fund_id: number;
  contributor_name: string;
  contributor_email: string;
  amount: number;
  currency: string;
  status: ContributionStatus;
  provider: string;
  reference_id: string;
  created_at: string;
  completed_at: string | null;
}

export interface Expense {
  id: number;
  fund_id: number;
  title: string;
  description: string | null;
  amount: number;
  category: ExpenseCategory;
  created_by: number;
  created_at: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialReport {
  fund_id: number;
  public_code: string;
  fund_name: string;
  description: string | null;
  target_amount: number;
  total_contributions: number;
  total_expenses: number;
  remaining_balance: number;
  percent_funded: number;
  total_contributors: number;
  paid_contributors_count: number;
  pending_contributors_count: number;
  expense_breakdown: CategoryBreakdown[];
  generated_at: string;
}

export interface AiAnalysis {
  fund_id: number;
  fund_name: string;
  summary: string;
  observations: string[];
  recommendation: string;
  analyzed_at: string;
}

export interface Transaction {
  id: number;
  fund_id: number;
  reference_id: string;
  type: 'contribution' | 'expense' | 'refund';
  amount: number;
  currency: string;
  status: string;
  provider: string;
  fund_name?: string;
  metadata?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  fund_id: number | null;
  action: string;
  metadata: string | null;
  timestamp: string;
  fund_name?: string;
}
