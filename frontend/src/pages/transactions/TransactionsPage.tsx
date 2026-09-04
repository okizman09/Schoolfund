import React, { useState, useEffect } from 'react';
import { ReceiptText, ArrowLeft, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Transaction } from '../../types';
import { api } from '../../services/api';

interface TransactionsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <Button size="sm" variant="outline" onClick={fetchTransactions} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      </div>

      <div>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Financial Audit</span>
        <h1 className="text-2xl font-bold text-text tracking-tight mt-0.5">
          Transactions & Ledger
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Complete verified record of all member contributions, provider references, and logged expenditures.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="h-16 bg-white border border-border rounded-lg animate-pulse" />
          <div className="h-16 bg-white border border-border rounded-lg animate-pulse" />
          <div className="h-16 bg-white border border-border rounded-lg animate-pulse" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-light border border-[#F6C6C6] rounded-lg text-danger text-xs">
          {error}
        </div>
      )}

      {!loading && !error && (
        <Card className="p-0 overflow-hidden shadow-subtle">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCFB] border-b border-border text-text-muted font-semibold">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Fund</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4 text-right">Amount (₦)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F9FBFA]">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.type === 'contribution' ? 'bg-[#EAF5F2] text-accent' : 'bg-warning-light text-warning'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-text">{t.fund_name || 'Project Fund'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{t.reference_id}</td>
                      <td className="py-3 px-4 font-medium text-[11px]">{t.provider}</td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        t.type === 'contribution' ? 'text-accent' : 'text-text'
                      }`}>
                        {t.type === 'contribution' ? '+' : '-'}₦{t.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-accent font-semibold">{t.status.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-text-muted text-[11px]">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
