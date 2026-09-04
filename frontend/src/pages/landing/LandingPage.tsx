import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Users, FileText, ArrowUpRight, Lock, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onDemoLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onDemoLogin }) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF5F2] border border-[#C5E5DC] rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Financial Coordination for Students
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text leading-[1.15]">
              Group contributions, <br />
              <span className="text-primary">without the chaos.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Create a fund, collect contributions, track expenses and keep everyone accountable — all in one transparent platform. No WhatsApp screenshots or spreadsheet headaches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => onNavigate('register')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create a fund
              </Button>
              {onDemoLogin ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onDemoLogin}
                >
                  View demo account
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('login')}
                >
                  Sign in
                </Button>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Verified payments via BMONI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent" />
                <span>Zero exposed bank details</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent" />
                <span>Audit-ready financial reports</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Realistic Product Dashboard Preview */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Subtle background card framing */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#123B35]/5 to-accent/10 rounded-2xl blur-sm" />
              
              <div className="relative bg-white border border-border rounded-xl shadow-dropdown overflow-hidden">
                {/* Mock Window Chrome */}
                <div className="px-4 py-3 bg-[#FAFCFB] border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E58888]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F5CA7B]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#82CCA6]" />
                    <span className="text-[11px] font-mono text-text-subtle ml-2">schoolfund.ng/csc301</span>
                  </div>
                  <Badge variant="success" size="sm">Active Fund</Badge>
                </div>

                {/* Card Content Preview */}
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-text-muted">CODE: SF-CSC301</span>
                      <h3 className="text-lg font-bold text-text">CSC 301 Final Project</h3>
                      <p className="text-xs text-text-muted mt-0.5">Hardware components & cloud hosting</p>
                    </div>
                    <Badge variant="primary">₦5,000 / member</Badge>
                  </div>

                  {/* Fund Health Metric Block */}
                  <div className="p-4 bg-[#F7F9F8] rounded-lg border border-border space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-text flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-accent" />
                        Fund Health: <strong className="text-accent">Healthy</strong>
                      </span>
                      <span className="text-text font-bold">63% funded</span>
                    </div>

                    <ProgressBar value={63} size="md" />

                    <div className="flex justify-between items-center text-xs pt-1 text-text-muted">
                      <span>Collected: <strong className="text-text">₦95,000</strong></span>
                      <span>Target: <strong>₦150,000</strong></span>
                    </div>
                  </div>

                  {/* Recent Verified Contributors Preview */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-text-muted mb-2">
                      <span>RECENT CONTRIBUTORS</span>
                      <span className="text-accent">19 paid • 11 pending</span>
                    </div>
                    <div className="divide-y divide-border border border-border rounded-md text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-white">
                        <span className="font-medium text-text">David Okafor</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Paid</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-[#FAFCFB]">
                        <span className="font-medium text-text">Mary James</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Paid</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white">
                        <span className="font-medium text-text">Peter Obi</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={onDemoLogin || (() => onNavigate('login'))}
                      className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Open Live Dashboard Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Target Audiences / Use-Cases */}
      <section className="border-y border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-center mb-6">
            Built for everyday group contributions in Lagos universities
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-[#F8FAFA] border border-border">
              <span className="text-sm font-semibold text-text">Class Projects</span>
              <p className="text-xs text-text-muted mt-1">Final year thesis, lab kits & printing</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFA] border border-border">
              <span className="text-sm font-semibold text-text">Student Associations</span>
              <p className="text-xs text-text-muted mt-1">Departmental dues & excursion levies</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFA] border border-border">
              <span className="text-sm font-semibold text-text">Campus Events</span>
              <p className="text-xs text-text-muted mt-1">Class dinners, sports days & seminars</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAFA] border border-border">
              <span className="text-sm font-semibold text-text">Tech & Hackathon Teams</span>
              <p className="text-xs text-text-muted mt-1">Hardware pooling, domains & logistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Core Journey */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-text">How SchoolFund works</h2>
          <p className="text-sm text-text-muted mt-2">
            One transparent workflow replacing manual banking verification and unorganized group chats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="flex flex-col space-y-3">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-base font-semibold text-text">Create Fund</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Set a target, contribution per member, deadline, and a project description in seconds.
            </p>
          </Card>

          <Card className="flex flex-col space-y-3">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-base font-semibold text-text">Share Secure Link</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Contributors open <span className="font-mono text-primary font-medium">/join/SF-XXXX</span> without needing an account to pay.
            </p>
          </Card>

          <Card className="flex flex-col space-y-3">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-base font-semibold text-text">Verified Payments</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Contributions are verified by backend infrastructure. Progress updates automatically.
            </p>
          </Card>

          <Card className="flex flex-col space-y-3">
            <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-base font-semibold text-text">Financial Report</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Log expenditures and generate a one-page transparent audit report for your group.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to organize your group contributions?
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto">
            Join hundreds of class representatives and student leaders across Lagos managing funds with clarity and trust.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('register')}
            >
              Get started now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
