import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { api } from '../../services/api';

interface CreateFundPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const CreateFundPage: React.FC<CreateFundPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<string>('150000');
  const [contributionAmount, setContributionAmount] = useState<string>('5000');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [description, setDescription] = useState('');
  const [allowCustom, setAllowCustom] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const contribution = parseFloat(contributionAmount);

    if (!name.trim()) {
      setError('Please provide a fund name');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError('Please provide a valid target amount');
      return;
    }
    if (isNaN(contribution) || contribution <= 0) {
      setError('Please provide a valid contribution amount');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fund = await api.createFund({
        name,
        target_amount: target,
        contribution_amount: contribution,
        deadline,
        description,
        allow_custom_amount: allowCustom,
      });
      onNavigate('fund-detail', { id: fund.id });
    } catch (err: any) {
      setError(err.message || 'Failed to create fund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="text-xs font-semibold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">New Fund</span>
        <h1 className="text-2xl font-bold text-text tracking-tight mt-0.5">
          Create a Contribution Fund
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Set up a target and generate a unique, shareable contribution link for your group members.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick Contribution Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-text mb-2">
              Contribution Type / Quick Template
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Class / Dept Dues', name: 'Accounting 200L Departmental Dues', target: '250000', contrib: '2500', desc: 'Annual departmental dues, association badge, and course materials.' },
                { label: 'Final Year Project', name: 'CSC 401 Final Year Capstone Project', target: '150000', contrib: '5000', desc: 'Hardware components, laboratory reagents, cloud hosting, and survey incentives.' },
                { label: 'Excursion / Field Trip', name: 'Mechanical Eng. Industrial Visit', target: '450000', contrib: '15000', desc: 'Chartered coaster buses, accommodation, and industrial entry passes.' },
                { label: 'Dinner / Event', name: 'Class of 2026 Annual Dinner & Awards', target: '350000', contrib: '7000', desc: 'Banquet venue rental, catering, sound system, and award plaques.' },
                { label: 'Student Welfare Relief', name: 'Classmate Emergency Medical Relief', target: '120000', contrib: '2000', desc: 'Emergency peer welfare and hospital bill support fund.' },
                { label: 'Hostel Maintenance', name: 'Hostel Generator & Amenities Levy', target: '80000', contrib: '3000', desc: 'Generator diesel fueling, borehole pump repair, and common room supplies.' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setName(preset.name);
                    setTargetAmount(preset.target);
                    setContributionAmount(preset.contrib);
                    setDescription(preset.desc);
                  }}
                  className="px-2.5 py-1 text-xs rounded-full border border-border bg-[#F8FAFA] hover:bg-[#EAF5F2] hover:border-accent hover:text-accent font-medium transition-colors text-text"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="fund-name">
              Fund name <span className="text-danger">*</span>
            </label>
            <input
              id="fund-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CSC 301 Final Project or Faculty Dues"
              className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
              required
            />
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="target-amount">
                Total Target Amount (₦) <span className="text-danger">*</span>
              </label>
              <input
                id="target-amount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="150000"
                min={100}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="contrib-amount">
                Contribution per member (₦) <span className="text-danger">*</span>
              </label>
              <input
                id="contrib-amount"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="5000"
                min={100}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="deadline">
                Contribution Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
              />
            </div>

            <div className="flex flex-col justify-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowCustom}
                  onChange={(e) => setAllowCustom(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent"
                />
                <span className="text-xs font-medium text-text">
                  Allow contributors to pay custom amounts
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="description">
              Project / Group Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what the contributions will be used for (e.g. Final project equipment, laboratory supplies, printing)..."
              className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text resize-none"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create Fund
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
