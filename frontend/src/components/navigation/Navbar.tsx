import React, { useState } from 'react';
import { ShieldCheck, Menu, X, LogOut, User as UserIcon, PlusCircle, LayoutDashboard, ReceiptText, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { SchoolFundLogo } from '../ui/Logo';


interface NavbarProps {
  user: User | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onDemoLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentRoute,
  onNavigate,
  onLogout,
  onDemoLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = user
    ? [
        { label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
        { label: 'My Funds', route: 'funds', icon: ShieldCheck },
        { label: 'Transactions', route: 'transactions', icon: ReceiptText },
      ]
    : [
        { label: 'How it works', route: 'how-it-works' },
        { label: 'For organizers', route: 'for-organizers' },
        { label: 'About', route: 'about' },
      ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-subtle group-hover:bg-primary-dark transition-colors">
              <SchoolFundLogo className="w-5 h-5 text-accent" />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-text">SchoolFund</span>
              <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider -mt-1">Nigeria</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === item.route
                    ? 'text-primary bg-[#EAF5F2] font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-[#F4F7F6]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleNavClick('create-fund')}
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Fund
                </Button>

                <div className="h-5 w-px bg-border mx-1" />

                <div className="flex items-center gap-2 px-2.5 py-1 bg-[#F4F7F6] rounded-md border border-border">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-text">{user.name.split(' ')[0]}</span>
                  <button
                    onClick={onLogout}
                    title="Sign out"
                    className="text-text-muted hover:text-danger ml-1 p-0.5 rounded transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {onDemoLogin && (
                  <button
                    onClick={onDemoLogin}
                    className="text-xs font-semibold text-accent hover:text-accent-hover px-2.5 py-1.5 rounded-md border border-accent/30 hover:bg-accent-light transition-colors"
                  >
                    Demo as Okiki
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick('login')}
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNavClick('register')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            {!user && onDemoLogin && (
              <button
                onClick={onDemoLogin}
                className="text-[11px] font-semibold text-accent px-2 py-1 rounded border border-accent/40 bg-accent-light"
              >
                Demo Login
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-muted hover:text-text rounded-md hover:bg-[#F2F5F4] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-6 space-y-3 shadow-dropdown animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === item.route
                    ? 'text-primary bg-[#EAF5F2] font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-[#F4F7F6]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleNavClick('create-fund')}
                  className="w-full"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Fund
                </Button>
                <div className="flex items-center justify-between px-2 pt-2 text-xs text-text-muted">
                  <span>Logged in as <strong className="text-text">{user.name}</strong></span>
                  <button
                    onClick={onLogout}
                    className="text-danger flex items-center gap-1 hover:underline font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleNavClick('login')}
                  className="w-full"
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleNavClick('register')}
                  className="w-full"
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
