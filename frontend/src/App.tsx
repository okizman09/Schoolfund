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

        {/* Fallback informational views for landing sub-links */}
        {(currentRoute === 'how-it-works' || currentRoute === 'for-organizers' || currentRoute === 'about') && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
            <h1 className="text-3xl font-bold text-text capitalize">
              {currentRoute.replace('-', ' ')}
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              SchoolFund was designed specifically for Nigerian university students, class governors, and campus communities to eliminate the friction of unverified group transfers, lost WhatsApp screenshots, and spreadsheet reconciliation.
            </p>
            <div className="p-6 bg-white border border-border rounded-lg space-y-4">
              <h3 className="text-base font-bold text-text">Why SchoolFund?</h3>
              <ul className="space-y-2 text-xs text-text-muted list-disc pl-5">
                <li>Instant shareable contribution link (<span className="font-mono">/join/SF-XXXX</span>) without forcing member account creation</li>
                <li>Backend verification powered by BMONI financial infrastructure</li>
                <li>Live progress bars and instant pledge tracking</li>
                <li>Direct project expense logging and categorization</li>
                <li>Executive one-click financial audit reports ready to print or save as PDF</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('landing')}
              className="text-xs font-semibold text-accent hover:underline"
            >
              ← Back to homepage
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
