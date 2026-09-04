import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileText,
  ArrowUpRight,
  Lock,
  TrendingUp,
  Building2,
  GraduationCap,
  HeartHandshake,
  Compass,
  PartyPopper,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onDemoLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onDemoLogin }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const campuses = [
    'UNILAG', 'Univ. of Ibadan (UI)', 'OAU Ile-Ife', 'ABU Zaria',
    'UNN Nsukka', 'UNIBEN', 'FUTA', 'UNILORIN', 'LASU', 'Covenant Univ.',
    'UNIPORT', 'BUK Kano', 'FUTO', 'Federal Poly Ilaro'
  ];

  const contributionCategories = [
    {
      icon: GraduationCap,
      title: 'Class & Departmental Dues',
      desc: 'Semester association dues, departmental registration, faculty levies, and lecture handout packs.',
      example: '₦2,500 / semester'
    },
    {
      icon: Zap,
      title: 'Final Year Projects & Research',
      desc: 'Hardware components, lab reagents, cloud servers, survey respondent incentives, and thesis binding.',
      example: '₦5,000 / member'
    },
    {
      icon: Compass,
      title: 'Excursions & Field Trips',
      desc: 'Chartered coaster buses, field trip logistics, hostel accommodation, and industrial visit passes.',
      example: '₦12,000 / student'
    },
    {
      icon: PartyPopper,
      title: 'Dinners & Campus Events',
      desc: 'Graduating set dinners, departmental banquets, sports week jerseys, award plaques, and sound systems.',
      example: '₦8,000 / ticket'
    },
    {
      icon: HeartHandshake,
      title: 'Student Welfare & Relief',
      desc: 'Peer emergency medical assistance, urgent distress funds, and compassionate student crowd-giving.',
      example: 'Voluntary amounts'
    },
    {
      icon: Building2,
      title: 'Hostel & Amenities Pooling',
      desc: 'Generator diesel levies, common room maintenance, borehole water repairs, and shared floor Wi-Fi.',
      example: '₦3,000 / room'
    },
  ];

  const faqs = [
    {
      q: 'What is SchoolFund and who is it designed for?',
      a: 'SchoolFund is a transparent financial coordination platform built specifically for student communities across Nigeria. It is used by class governors, departmental executives, project group leads, student clubs, and campus organizers in universities, polytechnics, and colleges across all 36 States and Abuja FCT to collect money, verify payments, track expenditures, and generate audit-ready reports.'
    },
    {
      q: 'Can SchoolFund be used for any form of contribution?',
      a: 'Yes! SchoolFund supports any type of collective contribution—including class and departmental dues, final year project pooling, field trip logistics, campus dinner tickets, student welfare relief, emergency medical funds, and hostel amenities. You can specify a fixed contribution amount per member or enable custom amounts.'
    },
    {
      q: 'Do contributors need to register an account or download an app to pay?',
      a: 'No. Contributors never need to create an account or install an app. The organizer simply shares a secure, masked public link (e.g. schoolfund.ng/#join/SF-CSC301). Group members can open the link in any phone or laptop browser and contribute in seconds via live Nigerian bank transfer or instant checkout.'
    },
    {
      q: 'How does live BMONI infrastructure verify transactions?',
      a: 'SchoolFund is powered by BMONI Embedded financial infrastructure with direct Nigerian banking rails (9 Payment Service Bank). Each fund can receive transfers directly via its verified Nigerian Virtual Bank Account or instant checkout, with real-time backend ledger updates and cryptographic webhook verification—eliminating fake receipts and unverified transfer screenshots forever.'
    },
    {
      q: 'How does SchoolFund prevent disputes between students and organizers?',
      a: 'By creating complete visibility: every contribution is automatically logged on a live progress board visible to group members, organizer personal bank details remain masked, every project expense is categorized with descriptive notes, and organizers can generate an official printable PDF Financial Statement with a single click.'
    },
    {
      q: 'Is SchoolFund available across all higher institutions in Nigeria?',
      a: 'Yes, SchoolFund is available nationwide for all federal, state, and private universities, polytechnics, and colleges of education across Nigeria—including UNILAG, UI, OAU, ABU, UNN, UNIBEN, FUTA, UNILORIN, LASU, Covenant, Babcock, Landmark, UNIPORT, and beyond.'
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF5F2] border border-[#C5E5DC] rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Financial Coordination for Students in Nigeria
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text leading-[1.15]">
              Group contributions, <br />
              <span className="text-primary">without the chaos.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Create a fund, collect contributions, track expenses, and keep everyone accountable — all in one transparent platform. For class dues, final year projects, excursions, campus events, and welfare relief across Nigeria. No WhatsApp screenshots or spreadsheet headaches.
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
                <span>Live BMONI NGN Rails (9PSB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-accent" />
                <span>Zero exposed personal accounts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent" />
                <span>One-click audit statements</span>
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
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <Badge variant="success" size="sm">Active Live Fund</Badge>
                  </div>
                </div>

                {/* Card Content Preview */}
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-text-muted">CODE: SF-CSC301</span>
                      <h3 className="text-lg font-bold text-text">CSC 301 Final Project Fund</h3>
                      <p className="text-xs text-text-muted mt-0.5">Hardware sensors, cloud compute & project binding</p>
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
                      <span className="text-text font-bold">63.3% funded</span>
                    </div>

                    <ProgressBar value={63.3} size="md" />

                    <div className="flex justify-between items-center text-xs pt-1 text-text-muted">
                      <span>Collected: <strong className="text-text">₦95,000</strong></span>
                      <span>Target: <strong>₦150,000</strong></span>
                    </div>
                  </div>

                  {/* Recent Verified Contributors Preview */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-text-muted mb-2">
                      <span>RECENT LIVE CONTRIBUTORS</span>
                      <span className="text-accent font-medium">19 paid • 11 pending</span>
                    </div>
                    <div className="divide-y divide-border border border-border rounded-md text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-white">
                        <div>
                          <span className="font-medium text-text block">David Okafor</span>
                          <span className="text-[10px] text-text-subtle font-mono">SF-CONT-20260904-8A32F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Settled</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-[#FAFCFB]">
                        <div>
                          <span className="font-medium text-text block">Amina Bello</span>
                          <span className="text-[10px] text-text-subtle font-mono">SF-CONT-20260904-C4B18</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Settled</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2.5 bg-white">
                        <div>
                          <span className="font-medium text-text block">Emeka Nwosu</span>
                          <span className="text-[10px] text-text-subtle font-mono">SF-CONT-20260904-1F99D</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">₦5,000</span>
                          <span className="text-[10px] text-accent font-medium bg-[#EAF5F2] px-1.5 py-0.5 rounded">Settled</span>
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

      {/* Campus Trust Banner */}
      <section className="border-y border-border bg-[#F8FAFA] py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted text-center mb-3">
            Trusted by student organizers across universities and polytechnics in Nigeria
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-text font-medium opacity-80">
            {campuses.map((camp, idx) => (
              <span key={idx} className="bg-white border border-border px-3 py-1 rounded-full text-text shadow-xs">
                {camp}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* For Any Form of Contribution Section */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF5F2] border border-[#C5E5DC] rounded-full">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Universal Campus Financial Support
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text">
            Built for any form of student contribution
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Whether you're collecting small group project levies or managing departmental faculty dues across thousands of students, SchoolFund adapts to every student financial need in Nigeria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributionCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Card key={idx} className="p-6 flex flex-col justify-between hover:border-accent transition-all group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-light text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-text">{cat.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-text-subtle">Typical levy:</span>
                  <span className="font-semibold text-primary font-mono">{cat.example}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4-Step Core Journey */}
      <section className="py-16 bg-[#FAFCFB] border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text">How SchoolFund works</h2>
            <p className="text-sm text-text-muted mt-2">
              One transparent, dispute-free workflow replacing manual banking verification and messy WhatsApp chats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="flex flex-col space-y-3 p-6 bg-white">
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-base font-semibold text-text">Create Your Fund</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Set a target amount, contribution per member, deadline, and a project description in seconds.
              </p>
            </Card>

            <Card className="flex flex-col space-y-3 p-6 bg-white">
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-base font-semibold text-text">Share Public Link</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Group members open <span className="font-mono text-primary font-medium">/join/SF-XXXX</span> in any browser without needing to register.
              </p>
            </Card>

            <Card className="flex flex-col space-y-3 p-6 bg-white">
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-base font-semibold text-text">Live Bank Rails</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Contributors pay via instant checkout or 9PSB Virtual Bank Account. Payments verify automatically.
              </p>
            </Card>

            <Card className="flex flex-col space-y-3 p-6 bg-white">
              <div className="w-8 h-8 rounded-md bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="text-base font-semibold text-text">1-Click Audit Report</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Log expenditures against collected funds and generate an official printable statement for your group.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* AEO / Answer Engine Optimization FAQ Section */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="faq">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" /> Answers & Insights
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
            Everything you need to know about transparent group contributions and financial coordination on SchoolFund across Nigeria.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border rounded-lg bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-[#FAFCFB] transition-colors"
                >
                  <span className="text-sm font-semibold text-text">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border/50 bg-[#FCFDFD]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to organize your student contributions?
          </h2>
          <p className="text-sm text-white/80 max-w-xl mx-auto">
            Join class governors, project leaders, and student organizers across all tertiary institutions in Nigeria managing funds with 100% clarity and trust.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('register')}
            >
              Get started now — Free
            </Button>
            {onDemoLogin && (
              <button
                onClick={onDemoLogin}
                className="px-5 py-2.5 rounded-md border border-white/30 text-white hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Explore Demo Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
