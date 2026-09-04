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
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { AiFundAnalysisModal } from '../../components/ai/AiFundAnalysisModal';
import { Fund, Contribution, Expense, ExpenseCategory, BankItem } from '../../types';
import { api } from '../../services/api';

interface FundDetailPageProps {
  fundId: number;
  onNavigate: (route: string, params?: any) => void;
}

const DEFAULT_BANKS: BankItem[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Moniepoint MFB', code: '090393' },
  { name: 'OPay (PayCom)', code: '090405' },
  { name: 'PalmPay', code: '090175' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '039' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Suntrust Bank', code: '100' },
  { name: 'Taj Bank', code: '302' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

export const FundDetailPage: React.FC<FundDetailPageProps> = ({ fundId, onNavigate }) => {
  const [fund, setFund] = useState<Fund | null>(null);
  const [contributors, setContributors] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [banks, setBanks] = useState<BankItem[]>(DEFAULT_BANKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Withdrawal / Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Materials');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState(DEFAULT_BANKS[6].name); // GTBank
  const [recipientBankCode, setRecipientBankCode] = useState(DEFAULT_BANKS[6].code);
  const [autoApprove, setAutoApprove] = useState(true);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Action approval state
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadFundData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fundData, contribData, expData, banksData] = await Promise.all([
        api.getFund(fundId),
        api.getContributors(fundId),
        api.getExpenses(fundId),
        api.getBanks().catch(() => DEFAULT_BANKS),
      ]);
      setFund(fundData);
      setContributors(contribData);
      setExpenses(expData);
      if (banksData && banksData.length > 0) {
        setBanks(banksData);
      }
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

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankName = e.target.value;
    setRecipientBank(selectedBankName);
    const found = banks.find((b) => b.name === selectedBankName);
    if (found) {
      setRecipientBankCode(found.code);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle || isNaN(amt) || amt <= 0) {
      setExpenseError('Please enter a valid expense title and amount');
      return;
    }
    if (fund && amt > fund.available_balance) {
      setExpenseError(
        `Amount exceeds available balance of ₦${fund.available_balance.toLocaleString()}. Please adjust requested amount.`
      );
      return;
    }
    if (!recipientAccount || recipientAccount.length < 10) {
      setExpenseError('Please enter a valid 10-digit Nigerian NUBAN account number');
      return;
    }
    if (!recipientName) {
      setExpenseError('Please enter the recipient account name');
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
        recipient_name: recipientName,
        recipient_account_number: recipientAccount,
        recipient_bank_name: recipientBank,
        recipient_bank_code: recipientBankCode,
        auto_approve: autoApprove,
      });
      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDescription('');
      setRecipientName('');
      setRecipientAccount('');
      // Reload fund to reflect new balance calculation
      await loadFundData();
      setActionFeedback(
        autoApprove
          ? 'Withdrawal approved & disbursed successfully via BMONI rails.'
          : 'Withdrawal request submitted for approval.'
      );
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setExpenseError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleApprove = async (expenseId: number) => {
    setActionLoadingId(expenseId);
    try {
      await api.approveExpense(expenseId, 'Approved by fund administrator');
      setActionFeedback('Expense approved & disbursed via BMONI Nigerian rails.');
      await loadFundData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to approve expense');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (expenseId: number) => {
    const reason = prompt('Please provide a reason for rejecting this withdrawal:');
    if (reason === null) return; // user cancelled prompt

    setActionLoadingId(expenseId);
    try {
      await api.rejectExpense(expenseId, reason || 'Rejected by fund administrator');
      setActionFeedback('Withdrawal request rejected.');
      await loadFundData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reject expense');
    } finally {
      setActionLoadingId(null);
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

      {actionFeedback && (
        <div className="p-3 bg-[#EAF5F2] border border-[#C5E5DC] text-accent rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Hero Overview Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-surface">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
                {fund.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
              {fund.description || 'Verified group contribution and expense fund.'}
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
              variant="primary"
              size="sm"
              onClick={() => setShowExpenseModal(true)}
              icon={<ArrowUpRight className="w-4 h-4 text-accent" />}
            >
              Request Withdrawal
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
              variant="outline"
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
              <span className="block text-[11px] uppercase font-semibold text-warning">Settled Payouts</span>
              <div className="text-lg font-bold text-warning mt-0.5">
                ₦{fund.total_spent.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-[#F0FDF4] rounded-md border border-[#BBF7D0]">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] uppercase font-semibold text-emerald-800">Available to Withdraw</span>
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                ₦{fund.available_balance.toLocaleString()}
              </div>
              {fund.pending_expenses > 0 && (
                <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                  ₦{fund.pending_expenses.toLocaleString()} pending approval
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Contributors on Left / Expenses & Withdrawals on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Contributors Section (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
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

        {/* Right: Governed Expenses & Withdrawals Section (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Receipt className="w-4 h-4 text-warning" />
              Withdrawals & Expenses ({expenses.length})
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Request
            </button>
          </div>

          {expenses.length === 0 ? (
            <Card className="text-center py-10 space-y-2">
              <p className="text-xs text-text-muted">No expenses or withdrawals recorded yet.</p>
              <Button size="sm" variant="outline" onClick={() => setShowExpenseModal(true)}>
                Request first withdrawal
              </Button>
            </Card>
          ) : (
            <div className="border border-border rounded-lg bg-surface divide-y divide-border overflow-hidden shadow-subtle">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-text">{exp.title}</h4>
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            exp.status === 'success'
                              ? 'bg-[#EAF5F2] text-accent'
                              : exp.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : exp.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {exp.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                          {exp.status === 'pending' && <Clock className="w-3 h-3" />}
                          {exp.status === 'processing' && <Clock className="w-3 h-3 animate-spin" />}
                          {exp.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {exp.status ? exp.status.toUpperCase() : 'SETTLED'}
                        </span>
                      </div>

                      {exp.description && (
                        <p className="text-[11px] text-text-muted line-clamp-1">{exp.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-sm text-text">₦{exp.amount.toLocaleString()}</span>
                  </div>

                  {/* Recipient & Bank NUBAN Rail Information */}
                  {(exp.recipient_name || exp.recipient_bank_name) && (
                    <div className="p-2 bg-[#F8FAFA] rounded border border-border text-[11px] flex items-center justify-between text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                        <span>
                          To: <strong className="text-text">{exp.recipient_name || 'Vendor'}</strong> •{' '}
                          {exp.recipient_bank_name} {exp.recipient_account_number ? `(${exp.recipient_account_number})` : ''}
                        </span>
                      </div>
                      {exp.reference_id && (
                        <span className="font-mono text-[10px] text-accent font-medium hidden sm:inline">
                          {exp.reference_id}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Governance Actions for Pending Expenses */}
                  {exp.status === 'pending' && (
                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-border">
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Awaiting administrator approval
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoadingId === exp.id}
                          onClick={() => handleReject(exp.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-danger hover:bg-danger-light rounded transition-colors"
                        >
                          Reject
                        </button>
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actionLoadingId === exp.id}
                          onClick={() => handleApprove(exp.id)}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Approve Payout
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-text-subtle pt-0.5">
                    <span className="bg-[#F1F4F3] px-2 py-0.5 rounded text-text-muted font-medium">
                      {exp.category}
                    </span>
                    <span>
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

      {/* Request Governed Withdrawal / Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Request Withdrawal / Expense Payout"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          {expenseError && (
            <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger">
              {expenseError}
            </div>
          )}

          {/* Available balance indicator banner */}
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-md flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium">Available balance to withdraw:</span>
            <span className="font-bold text-emerald-800">₦{fund.available_balance.toLocaleString()}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1" htmlFor="exp-title">
              Expense / Withdrawal Title <span className="text-danger">*</span>
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
                max={fund.available_balance}
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

          {/* Nigerian Bank Disbursement Account Details */}
          <div className="p-3.5 bg-[#F8FAFA] rounded-md border border-border space-y-3">
            <span className="block text-[11px] uppercase font-bold text-text tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-accent" /> Recipient Nigerian Bank Account
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1" htmlFor="recipient-bank">
                Select Nigerian Bank
              </label>
              <select
                id="recipient-bank"
                value={recipientBank}
                onChange={handleBankChange}
                className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
              >
                {banks.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1" htmlFor="recipient-account">
                  NUBAN Account Number <span className="text-danger">*</span>
                </label>
                <input
                  id="recipient-account"
                  type="text"
                  maxLength={10}
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="0123456789"
                  className="w-full px-3 py-2 text-xs font-mono border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-1" htmlFor="recipient-name">
                  Account Name / Vendor <span className="text-danger">*</span>
                </label>
                <input
                  id="recipient-name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. University Xerox Press"
                  className="w-full px-3 py-2 text-xs border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                  required
                />
              </div>
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

          {/* Governance Auto-Disburse Switch */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="auto-approve-toggle"
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent h-4 w-4"
            />
            <label htmlFor="auto-approve-toggle" className="text-xs text-text cursor-pointer select-none">
              Approve & execute BMONI payout immediately as Fund Administrator
            </label>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
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
              {autoApprove ? 'Disburse Payout' : 'Submit Request'}
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
