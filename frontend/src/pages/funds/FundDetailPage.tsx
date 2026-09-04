import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  PlusCircle,
  FileText,
  Sparkles,
  TrendingUp,
  Receipt,
  Users,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { AiFundAnalysisModal } from '../../components/ai/AiFundAnalysisModal';
import { Fund, Contribution, Expense, ExpenseCategory } from '../../types';
import { api } from '../../services/api';

interface FundDetailPageProps {
  fundId: number;
  onNavigate: (route: string, params?: any) => void;
}

export const FundDetailPage: React.FC<FundDetailPageProps> = ({ fundId, onNavigate }) => {
  const [fund, setFund] = useState<Fund | null>(null);
  const [contributors, setContributors] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Materials');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const loadFundData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fundData, contribData, expData] = await Promise.all([
        api.getFund(fundId),
        api.getContributors(fundId),
        api.getExpenses(fundId),
      ]);
      setFund(fundData);
      setContributors(contribData);
      setExpenses(expData);
    } catch (err: any) {
      setError(err.message || 'Failed to load fund details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFundData();
  }, [fundId]);

  const shareableUrl = fund
    ? `${window.location.origin}/#join/${fund.public_code}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle || isNaN(amt) || amt <= 0) {
      setExpenseError('Please enter a valid expense title and amount');
      return;
    }
    setExpenseLoading(true);
    setExpenseError(null);
    try {
      await api.addExpense({
        fund_id: fundId,
        title: expenseTitle,
        amount: amt,
        category: expenseCategory,
        description: expenseDescription,
      });
      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDescription('');
      // Reload fund to reflect new expense calculation
      await loadFundData();
    } catch (err: any) {
      setExpenseError(err.message || 'Failed to add expense');
    } finally {
      setExpenseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-40 bg-white border border-border rounded-lg animate-pulse" />
        <div className="h-64 bg-white border border-border rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="text-base font-bold text-text">We couldn't load this fund</h3>
          <p className="text-xs text-text-muted">{error || 'Fund not found'}</p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-border text-text font-medium">
            CODE: {fund.public_code}
          </span>
          <Badge variant={fund.health_status === 'Healthy' || fund.health_status === 'Excellent' ? 'success' : 'warning'}>
            {fund.health_status}
          </Badge>
        </div>
      </div>

      {/* Hero Overview Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-surface">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
              {fund.name}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
              {fund.description || 'Student group contribution fund.'}
            </p>
            {fund.deadline && (
              <div className="text-xs text-text-subtle pt-1">
                Deadline: <strong className="text-text">{new Date(fund.deadline).toLocaleDateString()}</strong>
              </div>
            )}
          </div>

          {/* Key Actions Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('public-contribute', { code: fund.public_code })}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Contribute
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              icon={<Share2 className="w-4 h-4" />}
            >
              Invite
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpenseModal(true)}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Add expense
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('financial-report', { id: fund.id })}
              icon={<FileText className="w-4 h-4" />}
            >
              Financial report
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAiModal(true)}
              icon={<Sparkles className="w-4 h-4 text-accent" />}
            >
              Analyze fund
            </Button>
          </div>

        </div>

        {/* Progress Bar & Balances Grid */}
        <div className="pt-4 border-t border-border space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-text">
                ₦{fund.total_collected.toLocaleString()} collected <span className="text-text-muted font-normal">of ₦{fund.target_amount.toLocaleString()} target</span>
              </span>
              <span className="text-accent">{fund.percent_funded}% funded</span>
            </div>
            <ProgressBar value={fund.percent_funded} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 bg-[#F8FAFA] rounded-md border border-border">
              <span className="block text-[11px] uppercase font-semibold text-text-muted">Target</span>
              <div className="text-lg font-bold text-text mt-0.5">
                ₦{fund.target_amount.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-[#EAF5F2] rounded-md border border-[#C5E5DC]">
              <span className="block text-[11px] uppercase font-semibold text-accent">Collected</span>
              <div className="text-lg font-bold text-accent mt-0.5">
                ₦{fund.total_collected.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-warning-light rounded-md border border-[#F5E6B8]">
              <span className="block text-[11px] uppercase font-semibold text-warning">Total Spent</span>
              <div className="text-lg font-bold text-warning mt-0.5">
                ₦{fund.total_spent.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFA] rounded-md border border-border">
              <span className="block text-[11px] uppercase font-semibold text-text-muted">Remaining Balance</span>
              <div className={`text-lg font-bold mt-0.5 ${fund.remaining_balance < 0 ? 'text-danger' : 'text-text'}`}>
                ₦{fund.remaining_balance.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Contributors on Left / Expenses on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Contributors Section (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Verified Contributors ({contributors.length})
            </h3>
            <span className="text-xs text-text-muted">Direct BMONI audit trail</span>
          </div>

          {contributors.length === 0 ? (
            <Card className="text-center py-10 space-y-2">
              <p className="text-xs text-text-muted">No contributions received yet.</p>
              <Button size="sm" variant="outline" onClick={() => setShowInviteModal(true)}>
                Share invite link
              </Button>
            </Card>
          ) : (
            <div className="border border-border rounded-lg bg-surface overflow-hidden shadow-subtle">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFCFB] border-b border-border text-text-muted font-semibold">
                    <tr>
                      <th className="py-3 px-4">Contributor</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text">
                    {contributors.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F9FBFA] transition-colors">
                        <td className="py-3 px-4 font-medium">
                          <div>{c.contributor_name}</div>
                          <div className="text-[11px] text-text-subtle font-mono">{c.contributor_email}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-text">
                          ₦{c.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            c.status === 'success'
                              ? 'bg-[#EAF5F2] text-accent'
                              : 'bg-warning-light text-warning'
                          }`}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-text-muted">
                          {c.reference_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Responsive Cards View */}
              <div className="sm:hidden divide-y divide-border">
                {contributors.map((c) => (
                  <div key={c.id} className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-xs text-text">{c.contributor_name}</span>
                        <div className="text-[10px] text-text-subtle">{c.contributor_email}</div>
                      </div>
                      <span className="font-bold text-xs text-accent">₦{c.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-text-muted pt-1">
                      <span className="font-mono">{c.reference_id}</span>
                      <span className="text-accent font-medium">Verified Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Expenses Section (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Receipt className="w-4 h-4 text-warning" />
              Recorded Expenses ({expenses.length})
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {expenses.length === 0 ? (
            <Card className="text-center py-10 space-y-2">
              <p className="text-xs text-text-muted">No expenses recorded yet.</p>
              <Button size="sm" variant="outline" onClick={() => setShowExpenseModal(true)}>
                Record first expense
              </Button>
            </Card>
          ) : (
            <div className="border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden shadow-subtle">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-3.5 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-xs text-text">{exp.title}</h4>
                      {exp.description && (
                        <p className="text-[11px] text-text-muted line-clamp-1">{exp.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-xs text-text">₦{exp.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="bg-[#F1F4F3] px-2 py-0.5 rounded text-text-muted font-medium">
                      {exp.category}
                    </span>
                    <span className="text-text-subtle">
                      {new Date(exp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Invite / Share Link Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Group Contributors"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            Share this link with your class or group members. Contributors do not need to register an account to make their contribution.
          </p>

          <div className="p-3 bg-[#F7F9F8] border border-border rounded-lg space-y-2">
            <span className="text-[11px] uppercase font-semibold text-text-muted">Public Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-white px-3 py-1.5 text-xs font-mono border border-border rounded focus:outline-none select-all"
              />
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'outline'}
                onClick={handleCopyLink}
                icon={copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hi everyone! Please pay your contribution for ${fund.name} here: ${shareableUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-md hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2"
            >
              Share directly via WhatsApp
            </a>
          </div>
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Record Project Expense"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          {expenseError && (
            <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger">
              {expenseError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text mb-1" htmlFor="exp-title">
              Expense title <span className="text-danger">*</span>
            </label>
            <input
              id="exp-title"
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g. Spiral Binding & Paper"
              className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1" htmlFor="exp-amount">
                Amount (₦) <span className="text-danger">*</span>
              </label>
              <input
                id="exp-amount"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="25000"
                min={1}
                className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1" htmlFor="exp-category">
                Category
              </label>
              <select
                id="exp-category"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
              >
                <option value="Printing">Printing</option>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Transport">Transport</option>
                <option value="Venue">Venue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1" htmlFor="exp-desc">
              Description / Receipt Note
            </label>
            <textarea
              id="exp-desc"
              rows={2}
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              placeholder="e.g. Receipt #402 from University Xerox Center"
              className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text resize-none"
            />
          </div>

          <div className="pt-2 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowExpenseModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={expenseLoading}
            >
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Financial Intelligence Modal */}
      <AiFundAnalysisModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        fundId={fund.id}
        fundName={fund.name}
      />

    </div>
  );
};
