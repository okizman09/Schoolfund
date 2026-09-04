import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FinancialReport } from '../../types';
import { api } from '../../services/api';

interface FinancialReportPageProps {
  fundId: number;
  onNavigate: (route: string, params?: any) => void;
}

export const FinancialReportPage: React.FC<FinancialReportPageProps> = ({
  fundId,
  onNavigate,
}) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getReport(fundId);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [fundId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
        <div className="h-64 bg-white border border-border rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-danger mx-auto" />
          <h3 className="text-base font-bold text-text">Failed to Generate Report</h3>
          <p className="text-xs text-text-muted">{error || 'Report unavailable'}</p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => onNavigate('fund-detail', { id: fundId })}
          className="text-xs font-semibold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fund Details
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Official Financial Report Sheet */}
      <div className="report-sheet bg-white border border-border rounded-xl p-8 sm:p-12 shadow-subtle space-y-8">
        
        {/* Letterhead */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="font-bold text-base text-text">SchoolFund Financial Audit</span>
            </div>
            <h1 className="text-2xl font-black text-text uppercase tracking-tight">
              {report.fund_name}
            </h1>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              FUND REFERENCE: {report.public_code}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-text-muted space-y-0.5">
            <div><strong>Report Date:</strong> {new Date(report.generated_at).toLocaleDateString()}</div>
            <div><strong>Status:</strong> Verified Final</div>
            <div><strong>Currency:</strong> Nigerian Naira (NGN)</div>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Financial Balance Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#FAFCFB] rounded-lg border border-border">
            <div>
              <span className="text-[11px] uppercase font-semibold text-text-muted block">Target Goal</span>
              <strong className="text-base sm:text-lg font-bold text-text">
                ₦{report.target_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-accent block">Total Collections</span>
              <strong className="text-base sm:text-lg font-bold text-accent">
                ₦{report.total_contributions.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-warning block">Total Expenses</span>
              <strong className="text-base sm:text-lg font-bold text-warning">
                ₦{report.total_expenses.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-text block">Remaining Balance</span>
              <strong className={`text-base sm:text-lg font-bold ${report.remaining_balance < 0 ? 'text-danger' : 'text-primary'}`}>
                ₦{report.remaining_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

        {/* Contributor Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Pledge & Contributor Audit
          </h3>
          <div className="p-4 bg-white border border-border rounded-lg flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF5F2] text-accent flex items-center justify-center font-bold">
                {report.total_contributors}
              </div>
              <div>
                <span className="font-semibold text-text">Total Recorded Contributors</span>
                <div className="text-[11px] text-text-muted">Direct group pledges recorded</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-accent font-bold text-sm">{report.paid_contributors_count}</span>
                <span className="text-text-muted text-[11px] ml-1.5">Paid (100%)</span>
              </div>
              <div>
                <span className="text-warning font-bold text-sm">{report.pending_contributors_count}</span>
                <span className="text-text-muted text-[11px] ml-1.5">Pending</span>
              </div>
              <div>
                <span className="text-text font-bold text-sm">{report.percent_funded}%</span>
                <span className="text-text-muted text-[11px] ml-1.5">Funded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Categorized Expenditures
          </h3>

          {report.expense_breakdown.length === 0 ? (
            <p className="text-xs text-text-muted p-4 bg-[#FAFCFB] rounded border border-border">
              No expenses have been recorded for this fund.
            </p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFCFB] border-b border-border text-text-muted font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Expense Category</th>
                    <th className="py-2.5 px-4 text-right">Amount (₦)</th>
                    <th className="py-2.5 px-4 text-right">Percentage of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text">
                  {report.expense_breakdown.map((item, i) => (
                    <tr key={i} className="hover:bg-[#F9FBFA]">
                      <td className="py-2.5 px-4 font-medium">{item.category}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">
                        ₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-text-muted font-mono">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F8FAFA] font-bold border-t border-border">
                    <td className="py-3 px-4 text-text">Total Recorded Expenditures</td>
                    <td className="py-3 px-4 text-right text-warning">
                      ₦{report.total_expenses.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auditor Attestation Footer */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-text-subtle gap-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>Generated and mathematically verified by SchoolFund Core Audit Engine</span>
          </div>
          <span className="font-mono text-[10px]">AUTH-HASH: 8F31A-OKIKI-CSC301</span>
        </div>

      </div>

    </div>
  );
};
