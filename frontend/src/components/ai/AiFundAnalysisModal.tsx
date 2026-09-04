import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AiAnalysis } from '../../types';
import { api } from '../../services/api';

interface AiFundAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundId: number;
  fundName: string;
}

export const AiFundAnalysisModal: React.FC<AiFundAnalysisModalProps> = ({
  isOpen,
  onClose,
  fundId,
  fundName,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeFund(fundId);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze fund finances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    } else {
      setAnalysis(null);
      setError(null);
    }
  }, [isOpen, fundId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Financial Intelligence"
      maxWidth="lg"
    >
      <div className="space-y-5">
        
        {/* Header Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-[#EAF5F2] border border-[#C5E5DC] rounded-lg">
          <div className="p-2 bg-accent text-white rounded-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-accent tracking-wider">Fund Analysis</span>
            <h4 className="text-sm font-bold text-text">{fundName}</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Automated financial assessment calculated from verified contributions and recorded expenditures.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <RefreshCw className="w-7 h-7 text-accent animate-spin" />
            <p className="text-sm font-medium text-text">Evaluating fund metrics...</p>
            <p className="text-xs text-text-muted">Analyzing expenditure distributions and contribution velocity</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-danger-light border border-[#F6C6C6] rounded-lg text-danger text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={fetchAnalysis} className="w-fit">
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && analysis && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Executive Summary */}
            <div>
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" />
                Executive Summary
              </h5>
              <div className="p-4 bg-[#F7F9F8] border border-border rounded-lg text-sm text-text leading-relaxed">
                {analysis.summary}
              </div>
            </div>

            {/* Key Observations */}
            <div>
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Key Observations
              </h5>
              <div className="space-y-2">
                {analysis.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-text bg-white p-2.5 border border-border rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Recommendation */}
            <div>
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-warning" />
                Tactical Recommendation
              </h5>
              <div className="p-3.5 bg-warning-light border border-[#F5E6B8] rounded-lg text-xs font-medium text-text leading-relaxed">
                {analysis.recommendation}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-text-subtle border-t border-border">
              <span>Backend audit analysis via Google Gemini API</span>
              <button
                onClick={fetchAnalysis}
                className="text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Re-analyze
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
