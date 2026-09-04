import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SchoolFundLogo } from '../../components/ui/Logo';
import { api, setAuthToken } from '../../services/api';

import { User } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (route: string) => void;
  onDemoLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  onDemoLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white shadow-subtle mb-1">
            <SchoolFundLogo className="w-6 h-6 text-accent" />
          </div>

          <h2 className="text-2xl font-bold text-text tracking-tight">Sign in to SchoolFund</h2>
          <p className="text-xs text-text-muted">
            Access your active contribution funds and financial reports
          </p>
        </div>

        {/* Demo Fast Login Banner */}
        {onDemoLogin && (
          <div className="p-3.5 bg-[#EAF5F2] border border-[#C5E5DC] rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text">Evaluating the hackathon demo?</span>
              <span className="text-[11px] text-text-muted">Pre-seeded with CSC 301 Final Project</span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={onDemoLogin}
            >
              Demo as Okiki
            </Button>
          </div>
        )}

        <Card className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.ng"
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-text" htmlFor="password">
                  Password
                </label>
                <span className="text-[11px] text-accent hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-text-muted">
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-accent hover:underline"
            >
              Create account
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
