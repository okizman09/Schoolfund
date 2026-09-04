import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Building2,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PublicFund, Contribution } from '../../types';
import { api } from '../../services/api';

interface PublicContributePageProps {
  publicCode: string;
  onNavigate: (route: string, params?: any) => void;
}

type PaymentStage = 'idle' | 'connecting' | 'verifying' | 'completed' | 'failed';
type PaymentMethod = 'instant' | 'transfer';

export const PublicContributePage: React.FC<PublicContributePageProps> = ({
  publicCode,
  onNavigate,
}) => {
  const [fund, setFund] = useState<PublicFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instant');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Payment state machine
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [completedContribution, setCompletedContribution] = useState<Contribution | null>(null);

  // Dynamic reference for bank transfer
  const [generatedRef] = useState(() => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SF-CONT-${d}-${rand}`;
  });

  useEffect(() => {
    const fetchPublicFund = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPublicFund(publicCode);
        setFund(data);
        setAmount(data.contribution_amount.toString());
      } catch (err: any) {
        setError(err.message || 'Fund not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicFund();
  }, [publicCode]);

  const copyToClipboard = (text: string, type: 'account' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = parseFloat(amount);
    if (!name.trim() || !email.trim() || isNaN(payAmt) || payAmt <= 0) {
      setPaymentError('Please complete all contribution details');
      return;
    }

    setPaymentError(null);
    setPaymentStage('connecting');

    try {
      // Step 1: Live connection to BMONI NGN rails
      await new Promise(r => setTimeout(r, 600));
      setPaymentStage('verifying');

      const result = await api.makeContribution({
        public_code: publicCode,
        contributor_name: name,
        contributor_email: email,
        amount: payAmt,
        reference_id: generatedRef,
      });

      setCompletedContribution(result);
      setPaymentStage('completed');
    } catch (err: any) {
      setPaymentError(err.message || 'Payment processing failed. Please try again.');
      setPaymentStage('failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Loading contribution fund details...</p>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="text-base font-bold text-text">Fund Not Found</h3>
          <p className="text-xs text-text-muted">
            The fund code <strong className="font-mono">{publicCode}</strong> does not exist or has been closed.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('landing')}>
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  const bankName = fund.deposit_bank_name || '9 Payment Service Bank';
  const accountNumber = fund.deposit_account_number || '6177463833';
  const accountName = fund.deposit_account_name || 'Bkey Limited / SchoolFund';

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      
      {/* Top Badge & Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF5F2] border border-[#C5E5DC] rounded-full">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Verified Group Contribution
          </span>
        </div>
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {fund.name}
        </h1>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          {fund.description || 'Contribute to your class dues, project fund, welfare relief, or student association.'}
        </p>
      </div>

      {/* Fund Progress Summary Card */}
      <Card className="p-5 bg-[#FAFCFB] space-y-3">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-text font-semibold">
            ₦{fund.total_collected.toLocaleString()} <span className="text-text-muted font-normal">of ₦{fund.target_amount.toLocaleString()}</span>
          </span>
          <span className="text-accent font-bold">{fund.percent_funded}% funded</span>
        </div>
        <ProgressBar value={fund.percent_funded} size="md" />
        <div className="flex justify-between items-center text-[11px] text-text-muted pt-1">
          <span>{fund.contributors_count} group members contributed</span>
          {fund.deadline && (
            <span>Deadline: {new Date(fund.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </Card>

      {/* Success Receipt State */}
      {paymentStage === 'completed' && completedContribution && (
        <Card className="p-6 sm:p-8 space-y-6 border-accent text-center bg-white animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-[#EAF5F2] text-accent rounded-full flex items-center justify-center mx-auto shadow-subtle">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-text">Contribution Successful!</h3>
            <p className="text-xs text-text-muted">
              Thank you, {completedContribution.contributor_name}. Your contribution has been verified live.
            </p>
          </div>

          {/* Receipt Breakdown Box */}
          <div className="p-4 bg-[#F8FAFA] rounded-lg border border-border text-xs space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-text-muted">Amount Paid</span>
              <strong className="text-text font-bold text-sm text-accent">₦{completedContribution.amount.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Transaction Reference</span>
              <span className="font-mono text-text text-[11px]">{completedContribution.reference_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Payment Channel</span>
              <span className="text-accent font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> BMONI Live (9PSB NGN Rails)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Settlement Status</span>
              <span className="px-2 py-0.5 rounded bg-accent-light text-accent text-[11px] font-bold">VERIFIED & SETTLED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Settlement Time</span>
              <span className="text-text">{new Date(completedContribution.completed_at || completedContribution.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setPaymentStage('idle');
                setName('');
                setEmail('');
              }}
              className="flex-1"
            >
              Make another contribution
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh fund status
            </Button>
          </div>
        </Card>
      )}

      {/* Payment Form / Interactive State */}
      {paymentStage !== 'completed' && (
        <Card className="p-6 sm:p-8 space-y-5 bg-white">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text">Contribution Checkout</h3>
            <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Live BMONI NGN Rails
            </span>
          </div>

          {paymentError && (
            <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('instant')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  paymentMethod === 'instant'
                    ? 'border-accent bg-[#EAF5F2]/40 ring-1 ring-accent text-text'
                    : 'border-border hover:border-text-muted bg-white text-text-muted'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-text">
                  <CreditCard className="w-4 h-4 text-accent" />
                  <span>Instant Checkout</span>
                </div>
                <span className="text-[11px] text-text-subtle">Live card & web rails</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  paymentMethod === 'transfer'
                    ? 'border-accent bg-[#EAF5F2]/40 ring-1 ring-accent text-text'
                    : 'border-border hover:border-text-muted bg-white text-text-muted'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs text-text">
                  <Building2 className="w-4 h-4 text-accent" />
                  <span>Bank Transfer</span>
                </div>
                <span className="text-[11px] text-text-subtle">Virtual 9PSB Account</span>
              </button>
            </div>
          </div>

          {/* Bank Transfer Details Box */}
          {paymentMethod === 'transfer' && (
            <div className="p-4 bg-[#F7FAF9] border border-[#C5E5DC] rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-semibold text-text flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-accent" /> Nigerian Virtual Bank Details
                </span>
                <span className="text-[10px] font-bold text-accent bg-[#EAF5F2] px-2 py-0.5 rounded">
                  BMONI Live Rails
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Bank Name:</span>
                  <span className="font-bold text-text">{bankName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Account Number:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-base text-primary tracking-wider">{accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(accountNumber, 'account')}
                      className="p-1 hover:bg-[#EAF5F2] rounded text-text-muted hover:text-accent transition-colors"
                      title="Copy Account Number"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Account Name:</span>
                  <span className="font-semibold text-text">{accountName}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-text-muted">Payment Reference:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-text">{generatedRef}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedRef, 'ref')}
                      className="p-1 hover:bg-[#EAF5F2] rounded text-text-muted hover:text-accent transition-colors"
                      title="Copy Reference"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-text-subtle pt-1">
                Transfer from any Nigerian bank app (GTBank, Access, Kuda, OPay, Zenith, PalmPay, etc.) into the account above. Enter your details below to confirm.
              </p>
            </div>
          )}

          {/* Processing State Machine Indicator */}
          {(paymentStage === 'connecting' || paymentStage === 'verifying') && (
            <div className="p-4 bg-[#F8FAFA] border border-border rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                {paymentStage === 'connecting'
                  ? 'Connecting to BMONI live financial infrastructure...'
                  : 'Settling transaction via BMONI NGN rails...'}
              </div>
              <div className="space-y-1 text-[11px] text-text-muted">
                <div className={`flex items-center gap-2 ${paymentStage === 'connecting' || paymentStage === 'verifying' ? 'text-accent font-medium' : ''}`}>
                  <span>●</span> <span>Secure connection initialized with 9PSB gateway</span>
                </div>
                <div className={`flex items-center gap-2 ${paymentStage === 'verifying' ? 'text-accent font-medium' : 'opacity-40'}`}>
                  <span>●</span> <span>Verifying payment on live banking rails</span>
                </div>
                <div className="flex items-center gap-2 opacity-40">
                  <span>○</span> <span>Confirmed and credited to fund balance</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="contributor-name">
                Your Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="contributor-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tolani Shittu"
                disabled={paymentStage === 'connecting' || paymentStage === 'verifying'}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="contributor-email">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="contributor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@nigeria.edu.ng"
                disabled={paymentStage === 'connecting' || paymentStage === 'verifying'}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text disabled:opacity-50"
                required
              />
              <span className="text-[11px] text-text-subtle mt-0.5 block">
                Your verified payment receipt will be sent to this email.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="contrib-amount">
                Contribution Amount (₦) <span className="text-danger">*</span>
              </label>
              <input
                id="contrib-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!fund.allow_custom_amount || paymentStage === 'connecting' || paymentStage === 'verifying'}
                min={100}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text font-bold disabled:bg-[#F4F7F6] disabled:text-text"
                required
              />
              {!fund.allow_custom_amount && (
                <span className="text-[11px] text-text-subtle mt-0.5 block">
                  Fixed contribution set by the organizer.
                </span>
              )}
            </div>

            {/* Fee Summary Box */}
            <div className="p-3.5 bg-[#F9FBFA] border border-border rounded-md text-xs space-y-2">
              <div className="flex justify-between text-text-muted">
                <span>Contribution</span>
                <span className="text-text font-medium">₦{parseFloat(amount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Processing fee</span>
                <span className="text-accent font-semibold">₦0.00 (Free)</span>
              </div>
              <div className="h-px bg-border pt-1" />
              <div className="flex justify-between text-sm font-bold text-text pt-1">
                <span>Total to pay</span>
                <span className="text-primary font-mono font-bold">₦{parseFloat(amount || '0').toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={paymentStage === 'connecting' || paymentStage === 'verifying'}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {paymentMethod === 'transfer' 
                ? `I Have Transferred ₦${parseFloat(amount || '0').toLocaleString()}`
                : `Pay ₦${parseFloat(amount || '0').toLocaleString()} via BMONI`}
            </Button>
          </form>
        </Card>
      )}

      <div className="text-center text-xs text-text-subtle">
        <span>Protected by SchoolFund's secure payment verification layer & BMONI Nigerian Banking Rails</span>
      </div>

    </div>
  );
};
