import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  TrendingUp,
  Wallet,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  ReceiptText,
  AlertCircle,
  ExternalLink,
  Share2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Fund, Transaction, User } from '../../types';
import { api } from '../../services/api';

interface DashboardPageProps {
  user: User;
  onNavigate: (route: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fundsData, txData] = await Promise.all([
          api.getFunds(),
          api.getTransactions().catch(() => []),
        ]);
        setFunds(fundsData);
        setTransactions(txData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalCollectedAll = funds.reduce((acc, f) => acc + f.total_collected, 0);
  const activeFundsCount = funds.filter(f => f.status === 'active').length;
  const heroFund = funds[0]; // Primary showcase fund (e.g. CSC 301)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Dashboard Overview</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            Good day, {user.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Here's what is currently happening across your active group contribution funds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('create-fund')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Create new fund
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-white border border-border rounded-lg animate-pulse" />
            <div className="h-24 bg-white border border-border rounded-lg animate-pulse" />
            <div className="h-24 bg-white border border-border rounded-lg animate-pulse" />
          </div>
          <div className="h-44 bg-white border border-border rounded-lg animate-pulse" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-danger-light border border-[#F6C6C6] rounded-lg text-danger text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Top 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-lg bg-[#EAF5F2] text-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Funds</span>
                <div className="text-2xl font-bold text-text mt-0.5">{activeFundsCount}</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-lg bg-[#EAF5F2] text-accent flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Collected</span>
                <div className="text-2xl font-bold text-text mt-0.5">
                  ₦{totalCollectedAll.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </Card>

            <Card className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-lg bg-warning-light text-warning flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pending Pledges</span>
                <div className="text-2xl font-bold text-text mt-0.5">
                  11
                </div>
              </div>
            </Card>
          </div>

          {/* Signature Element: Signature Fund Health Card */}
          {heroFund && (
            <Card className="p-6 border-l-4 border-l-accent bg-gradient-to-r from-white via-white to-[#F7F9F8]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Fund info & Status */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-muted bg-[#F1F4F3] px-2 py-0.5 rounded">
                      {heroFund.public_code}
                    </span>
                    <Badge variant={heroFund.health_status === 'Healthy' || heroFund.health_status === 'Excellent' ? 'success' : 'warning'}>
                      Fund Health: {heroFund.health_status}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-text tracking-tight">
                    {heroFund.name}
                  </h3>

                  <p className="text-xs text-text-muted max-w-xl line-clamp-1">
                    {heroFund.description || 'Student group contribution fund.'}
                  </p>

                  <div className="pt-2 max-w-md">
                    <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                      <span className="text-text font-semibold">
                        ₦{heroFund.total_collected.toLocaleString()} <span className="text-text-muted font-normal">of ₦{heroFund.target_amount.toLocaleString()}</span>
                      </span>
                      <span className="text-accent font-bold">{heroFund.percent_funded}% funded</span>
                    </div>
                    <ProgressBar value={heroFund.percent_funded} size="md" />
                  </div>
                </div>

                {/* Right: Quick actions & Stats */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                  <div className="text-xs text-text-muted flex items-center gap-4 bg-surface p-3 rounded-md border border-border">
                    <div>
                      <span className="block text-[11px] uppercase font-semibold">Contributors</span>
                      <strong className="text-sm text-text font-bold">{heroFund.contributors_count} verified</strong>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                      <span className="block text-[11px] uppercase font-semibold">Balance</span>
                      <strong className="text-sm text-accent font-bold">₦{heroFund.remaining_balance.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate('fund-detail', { id: heroFund.id })}
                      className="flex-1"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View fund
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('public-contribute', { code: heroFund.public_code })}
                      title="Open public contribution link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* Active Funds Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-text">Your Contribution Funds</h3>
              {funds.length > 0 && (
                <button
                  onClick={() => onNavigate('create-fund')}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add another fund
                </button>
              )}
            </div>

            {funds.length === 0 ? (
              <Card className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#EAF5F2] text-accent mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-text">No contribution funds yet</h4>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    Create your first student fund to share a transparent contribution link with your group.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate('create-fund')}
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Create your first fund
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {funds.map((f) => (
                  <Card
                    key={f.id}
                    hoverable
                    onClick={() => onNavigate('fund-detail', { id: f.id })}
                    className="flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-mono text-text-muted bg-[#F1F4F3] px-2 py-0.5 rounded">
                          {f.public_code}
                        </span>
                        <Badge variant="primary" size="sm">
                          ₦{f.contribution_amount.toLocaleString()} / person
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-text leading-snug hover:text-primary transition-colors">
                        {f.name}
                      </h4>

                      <p className="text-xs text-text-muted line-clamp-2">
                        {f.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-text">
                          ₦{f.total_collected.toLocaleString()} <span className="text-text-muted font-normal">/ ₦{f.target_amount.toLocaleString()}</span>
                        </span>
                        <span className="text-accent font-semibold">{f.percent_funded}%</span>
                      </div>
                      <ProgressBar value={f.percent_funded} size="sm" />
                      
                      <div className="flex justify-between items-center text-[11px] text-text-muted pt-1">
                        <span>{f.contributors_count} contributors</span>
                        <span className="text-primary font-medium flex items-center gap-0.5">
                          Manage <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Financial Transactions Activity Feed */}
          {transactions.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-accent" />
                  Recent Verified Activity
                </h3>
                <span className="text-xs text-text-muted">Direct financial audit trail</span>
              </div>

              <div className="border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden">
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        tx.type === 'contribution'
                          ? 'bg-[#EAF5F2] text-accent'
                          : 'bg-warning-light text-warning'
                      }`}>
                        {tx.type === 'contribution' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-semibold text-text">
                          {tx.type === 'contribution' ? 'Member Contribution' : 'Logged Project Expense'}
                        </div>
                        <div className="text-[11px] text-text-muted font-mono">
                          {tx.reference_id} • {tx.fund_name || 'Project Fund'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold ${
                        tx.type === 'contribution' ? 'text-accent' : 'text-text'
                      }`}>
                        {tx.type === 'contribution' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-text-subtle">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
};
