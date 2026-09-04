import {
  AuthResponse,
  User,
  Fund,
  PublicFund,
  Contribution,
  Expense,
  ExpenseCreatePayload,
  BankItem,
  FinancialReport,
  AiAnalysis,
  Transaction,
  AuditLog
} from '../types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('schoolfund_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('schoolfund_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('schoolfund_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Something went wrong. Please try again.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // fallback to generic
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  demoLogin: () =>
    request<AuthResponse>('/auth/demo-login', { method: 'POST' }),

  getMe: () =>
    request<User>('/auth/me'),

  // Funds
  getFunds: () =>
    request<Fund[]>('/funds'),

  getFund: (id: number) =>
    request<Fund>(`/funds/${id}`),

  createFund: (data: {
    name: string;
    description?: string;
    target_amount: number;
    contribution_amount: number;
    allow_custom_amount: boolean;
    deadline?: string;
  }) => request<Fund>('/funds', { method: 'POST', body: JSON.stringify(data) }),

  getPublicFund: (publicCode: string) =>
    request<PublicFund>(`/funds/public/${publicCode}`),

  // Contributions
  getContributors: (fundId: number) =>
    request<Contribution[]>(`/funds/${fundId}/contributors`),

  makeContribution: (data: {
    public_code: string;
    contributor_name: string;
    contributor_email: string;
    amount: number;
    reference_id?: string;
  }) => request<Contribution>('/contributions', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses & Withdrawals
  getExpenses: (fundId: number) =>
    request<Expense[]>(`/funds/${fundId}/expenses`),

  getBanks: () =>
    request<BankItem[]>('/expenses/banks'),

  addExpense: (data: ExpenseCreatePayload) =>
    request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  approveExpense: (expenseId: number, note?: string) =>
    request<Expense>(`/expenses/${expenseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ note: note || '' })
    }),

  rejectExpense: (expenseId: number, note?: string) =>
    request<Expense>(`/expenses/${expenseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ note: note || '' })
    }),

  // Reports
  getReport: (fundId: number) =>
    request<FinancialReport>(`/reports/${fundId}`),

  // AI Insights
  analyzeFund: (fundId: number) =>
    request<AiAnalysis>(`/ai/analyze/${fundId}`, { method: 'POST' }),

  // Transactions & Audit
  getTransactions: () =>
    request<Transaction[]>('/transactions'),

  getAuditLogs: () =>
    request<AuditLog[]>('/audit-logs'),
};
