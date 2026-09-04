import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateFundPage } from './pages/funds/CreateFundPage';
import { FundDetailPage } from './pages/funds/FundDetailPage';
import { PublicContributePage } from './pages/contributions/PublicContributePage';
import { FinancialReportPage } from './pages/reports/FinancialReportPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { User } from './types';
import { api, setAuthToken, clearAuthToken } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [routeParams, setRouteParams] = useState<any>({});
  const [authChecking, setAuthChecking] = useState(true);

  // Sync hash with route for direct shareable links
  const parseHash = () => {
    const rawHash = window.location.hash.replace('#', '').replace(/^\//, '');
    if (rawHash.startsWith('join/')) {
      const code = rawHash.replace('join/', '');
      setCurrentRoute('public-contribute');
      setRouteParams({ code });
      return true;
    } else if (rawHash.startsWith('fund/')) {
      const id = parseInt(rawHash.replace('fund/', ''), 10);
      if (!isNaN(id)) {
        setCurrentRoute('fund-detail');
        setRouteParams({ id });
        return true;
      }
    } else if (rawHash.startsWith('report/')) {
      const id = parseInt(rawHash.replace('report/', ''), 10);
      if (!isNaN(id)) {
        setCurrentRoute('financial-report');
        setRouteParams({ id });
        return true;
      }
    } else if (rawHash === 'create-fund' || rawHash === 'funds/create') {
      setCurrentRoute('create-fund');
      return true;
    } else if (rawHash === 'transactions') {
      setCurrentRoute('transactions');
      return true;
    } else if (rawHash === 'funds' || rawHash === 'dashboard') {
      setCurrentRoute('dashboard');
      return true;
    } else if (rawHash === 'login') {
      setCurrentRoute('login');
      return true;
    } else if (rawHash === 'register') {
      setCurrentRoute('register');
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Check initial hash
    const hasSpecialHash = parseHash();

    // Check existing auth session
    const checkAuth = async () => {
      try {
        const user = await api.getMe();
        setCurrentUser(user);
        if (!hasSpecialHash) {
          setCurrentRoute('dashboard');
        }
      } catch {
        // Not logged in or expired
        if (!hasSpecialHash) {
          setCurrentRoute('landing');
        }
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();

    const handleHashChange = () => {
      parseHash();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string, params: any = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo(0, 0);

    if (route === 'public-contribute' && params.code) {
      window.location.hash = `join/${params.code}`;
    } else if (route === 'fund-detail' && params.id) {
      window.location.hash = `fund/${params.id}`;
    } else if (route === 'financial-report' && params.id) {
      window.location.hash = `report/${params.id}`;
    } else if (route === 'create-fund') {
      window.location.hash = 'create-fund';
    } else if (route === 'transactions') {
      window.location.hash = 'transactions';
    } else if (route === 'dashboard' || route === 'funds') {
      window.location.hash = 'dashboard';
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const res = await api.demoLogin();
      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      navigate('dashboard');
    } catch (err: any) {
      alert(err.message || 'Demo login failed');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    navigate('landing');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigate('dashboard');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-accent-light selection:text-primary">
      <Navbar
        user={currentUser}
        currentRoute={currentRoute}
        onNavigate={navigate}
        onLogout={handleLogout}
        onDemoLogin={handleDemoLogin}
      />

      <main className="flex-1">
        {currentRoute === 'landing' && (
          <LandingPage onNavigate={navigate} onDemoLogin={handleDemoLogin} />
        )}

        {currentRoute === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
            onDemoLogin={handleDemoLogin}
          />
        )}

        {currentRoute === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onNavigate={navigate}
            onDemoLogin={handleDemoLogin}
          />
        )}

        {(currentRoute === 'dashboard' || currentRoute === 'funds') && currentUser && (
          <DashboardPage user={currentUser} onNavigate={navigate} />
        )}

        {currentRoute === 'create-fund' && (
          <CreateFundPage onNavigate={navigate} />
        )}

        {currentRoute === 'fund-detail' && (
          <FundDetailPage fundId={routeParams.id || 1} onNavigate={navigate} />
        )}

        {currentRoute === 'public-contribute' && (
          <PublicContributePage
            publicCode={routeParams.code || 'SF-CSC301'}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'financial-report' && (
          <FinancialReportPage
            fundId={routeParams.id || 1}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'transactions' && (
          <TransactionsPage onNavigate={navigate} />
        )}

        {/* Rich informational views for landing sub-links */}
        {currentRoute === 'how-it-works' && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Guide & Architecture</span>
              <h1 className="text-3xl font-bold text-text">How SchoolFund Works</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                A simple, 4-step transparent workflow built specifically for students in Nigeria to replace informal WhatsApp receipts and manual spreadsheet reconciliation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-border rounded-xl space-y-3">
                <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-base font-bold text-text">1. Create a Contribution Fund</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  The student organizer, class governor, or club executive creates a fund in under a minute—specifying target amount, contribution per member, deadline, and project description.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-xl space-y-3">
                <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="text-base font-bold text-text">2. Share Secure Public Link</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  SchoolFund generates a masked link (e.g. <span className="font-mono text-primary">/join/SF-XXXX</span>). Classmates can contribute instantly from any mobile browser without having to create an account.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-xl space-y-3">
                <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-base font-bold text-text">3. Live BMONI Bank Rails</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Powered by BMONI Embedded infrastructure and 9 Payment Service Bank (9PSB). Contributors can pay via instant checkout or direct Nigerian bank transfer with real-time verification.
                </p>
              </div>

              <div className="p-6 bg-white border border-border rounded-xl space-y-3">
                <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-bold flex items-center justify-center">4</span>
                <h3 className="text-base font-bold text-text">4. Expenses & 1-Click Audit</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Organizers log project expenditures against collected funds. Members see live remaining balance, and organizers can export an executive audit report to PDF with one click.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('landing')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                ← Back to homepage
              </button>
              <button
                onClick={() => navigate('register')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Create your first fund →
              </button>
            </div>
          </div>
        )}

        {currentRoute === 'for-organizers' && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Campus Leadership</span>
              <h1 className="text-3xl font-bold text-text">For Class Governors & Campus Organizers</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Managing group funds for 50 to 500+ classmates is stressful. SchoolFund protects your reputation, eliminates disputes, and provides proof of every Naira.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white border border-border rounded-xl space-y-2.5">
                <h3 className="text-sm font-bold text-text">No Personal Account Exposure</h3>
                <p className="text-xs text-text-muted">
                  Keep your personal savings account separate. Contributions go through dedicated virtual accounts so you never mix personal and class money.
                </p>
              </div>
              <div className="p-5 bg-white border border-border rounded-xl space-y-2.5">
                <h3 className="text-sm font-bold text-text">Live Paid vs Pending List</h3>
                <p className="text-xs text-text-muted">
                  Instantly see who has paid and who has pending pledges without manually ticking names in a notebook or updating Google Sheets.
                </p>
              </div>
              <div className="p-5 bg-white border border-border rounded-xl space-y-2.5">
                <h3 className="text-sm font-bold text-text">Printable Audit Statements</h3>
                <p className="text-xs text-text-muted">
                  Print or export clean financial balance sheets ready to share in class group chats or submit to Departmental HODs and Faculty Deans.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('landing')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                ← Back to homepage
              </button>
              <button
                onClick={() => navigate('register')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Get started as an organizer →
              </button>
            </div>
          </div>
        )}

        {currentRoute === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">About SchoolFund</span>
              <h1 className="text-3xl font-bold text-text">Building Financial Trust in Nigerian Higher Institutions</h1>
              <p className="text-sm text-text-muted leading-relaxed">
                SchoolFund is dedicated to transforming student financial coordination across all 36 States and Abuja FCT.
              </p>
            </div>

            <div className="p-6 bg-white border border-border rounded-xl space-y-4 text-xs text-text-muted leading-relaxed">
              <p>
                Every semester in Nigerian universities, polytechnics, and colleges, millions of Naira are collected for class dues, departmental levies, course material printing, final year projects, excursions, and student welfare.
              </p>
              <p>
                Because these funds are collected into personal bank accounts with screenshots dumped in chaotic WhatsApp groups, organizers face constant accusations of embezzlement, transactions get lost, and students lose trust.
              </p>
              <p>
                SchoolFund solves this by leveraging modern BMONI Embedded financial rails to bring banking transparency to campus life. Every payment is verified, every expense is accounted for, and every student can see the real-time health of their fund.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('landing')}
                className="text-xs font-semibold text-accent hover:underline"
              >
                ← Back to homepage
              </button>
              <button
                onClick={() => navigate('register')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Join SchoolFund today →
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
