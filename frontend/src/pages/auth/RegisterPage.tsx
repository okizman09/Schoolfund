import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { api, setAuthToken } from '../../services/api';
import { User } from '../../types';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onNavigate: (route: string) => void;
  onDemoLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigate,
  onDemoLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength evaluation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaCount = [
    hasMinLength,
    hasUppercase && hasLowercase,
    hasNumber,
    hasSpecial
  ].filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!password) return { label: '', color: 'bg-slate-200', textClass: 'text-text-muted', percent: 0 };
    if (criteriaCount <= 1) return { label: 'Weak', color: 'bg-danger', textClass: 'text-danger', percent: 25 };
    if (criteriaCount === 2) return { label: 'Fair', color: 'bg-amber-500', textClass: 'text-amber-600', percent: 50 };
    if (criteriaCount === 3) return { label: 'Good', color: 'bg-blue-500', textClass: 'text-blue-600', percent: 75 };
    return { label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-600', percent: 100 };
  };

  const strength = getStrengthInfo();
  const isStrongEnough = hasMinLength && (hasUppercase || hasLowercase) && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!isStrongEnough) {
      setError('Please choose a stronger password (at least 8 characters with letters and numbers)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({ name, email, password });
      setAuthToken(res.access_token);
      onRegisterSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text tracking-tight">Create your account</h2>
          <p className="text-xs text-text-muted">
            Start organizing group contributions for your class or project team
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-danger-light border border-[#F6C6C6] rounded-md text-xs text-danger flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Babatunde Adeleke"
                className="w-full px-3.5 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white text-text"
                required
              />
            </div>

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
                {password && (
                  <span className={`text-[11px] font-semibold ${strength.textClass}`}>
                    {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

              {/* Password Strength Meter & Requirements */}
              {password && (
                <div className="mt-2.5 space-y-2">
                  {/* Visual segments bar */}
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    <div className={`h-full rounded-full transition-all duration-300 ${criteriaCount >= 1 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${criteriaCount >= 2 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${criteriaCount >= 3 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${criteriaCount >= 4 ? strength.color : 'bg-slate-200'}`} />
                  </div>

                  {/* Checklist criteria */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-text-muted'}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1 shrink-0" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-text-muted'}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1 shrink-0" />}
                      <span>At least 1 number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${(hasUppercase && hasLowercase) ? 'text-emerald-600 font-medium' : 'text-text-muted'}`}>
                      {(hasUppercase && hasLowercase) ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1 shrink-0" />}
                      <span>Upper & lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-text-muted'}`}>
                      {hasSpecial ? <Check className="w-3.5 h-3.5 shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1 shrink-0" />}
                      <span>Symbol (!@#$)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create account
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-text-muted">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

