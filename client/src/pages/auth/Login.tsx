import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { Mail, Lock, User, Building2, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as any) || 'patient';

  const [activeRoleTab, setActiveRoleTab] = useState<'patient' | 'hospital' | 'admin'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail: string, demoPass: string, role: 'patient' | 'hospital' | 'admin') => {
    setActiveRoleTab(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'patient') navigate('/patient/dashboard');
        else if (res.user.role === 'hospital') navigate('/hospital/dashboard');
        else navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
      {/* Top Bar with Language Selector */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-xs font-semibold text-slate-400">🌐 {t('common.language', 'Language')}</span>
        <LanguageSelector compact />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('auth.signInTitle', 'Sign in to PFIS')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.signInSubtitle', 'Access your non-clinical healthcare intelligence dashboard')}
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setActiveRoleTab('patient');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeRoleTab === 'patient'
              ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('auth.patient', 'Patient')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRoleTab('hospital');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeRoleTab === 'hospital'
              ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('auth.hospital', 'Hospital')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRoleTab('admin');
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeRoleTab === 'admin'
              ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{t('auth.admin', 'Admin')}</span>
        </button>
      </div>

      {/* 1-Click Demo Accounts Pill Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <span>⚡ {t('auth.instantDemo', 'Instant Demo Auto-Fill:')}</span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">
            {t('auth.clickToTest', 'Click to test')}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoFill('patient@pfis.org', 'Patient@123', 'patient')}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
          >
            {t('auth.demoPatient', 'Demo Patient')}
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('hospital@apollo.org', 'Hospital@123', 'hospital')}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
          >
            {t('auth.demoHospital', 'Demo Hospital')}
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('admin@pfis.org', 'Admin@123', 'admin')}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-[11px] text-slate-700 dark:text-slate-300 shadow-xs transition-colors"
          >
            {t('auth.demoAdmin', 'Demo Admin')}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label={t('auth.passwordLabel', 'Password')}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          {t('auth.signInButton', 'Sign In')}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        {t('auth.noAccount', "Don't have a PFIS account?")}{' '}
        <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
          {t('auth.createAccount', 'Create an Account')}
        </Link>
      </div>
    </div>
  );
};
