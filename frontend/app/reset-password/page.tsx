'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Lock, Loader2, ArrowLeft, Check, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { t } = useLanguage();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  if (!token) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-brand-orange hover:underline font-medium">
          {t('forgot_password') || 'Request a new link'}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError(t('pwd_match_error' as any) || 'Passwords do not match');
      return;
    }

    const hasLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    if (!hasLength || !hasNumber || !hasUpper) {
      setShowPasswordRules(true);
      setError(t('pwd_weak_error' as any) || 'Please meet all password requirements');
      return;
    }
    
    setShowPasswordRules(false);

    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token: token,
        new_password: password
      });
      setMessage(t('password_reset_success') || res.data.message);
      
      // Wait 3 seconds then redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InsureHub Logo" className="h-16 w-auto object-contain mix-blend-multiply mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy">{t('reset_password') || 'Reset Password'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}
        
        {message ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 border border-green-100">
              {message}
            </div>
            <Link href="/login" className="inline-block mt-4 bg-brand-orange hover:opacity-90 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm">
              {t('land_sign_in') || 'Sign In'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('new_password') || 'New Password'}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                  placeholder="••••••••"
                />
              </div>
              {/* Password Validation Rules */}
              {showPasswordRules && (
                <div className="mt-3 space-y-2 text-sm px-1">
                  <div className={`flex items-center gap-2 transition-colors ${password.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {password.length >= 8 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{t('pwd_rule_length' as any) || 'At least 8 characters'}</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${/\d/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {/\d/.test(password) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{t('pwd_rule_number' as any) || 'At least 1 number'}</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {/[A-Z]/.test(password) ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span>{t('pwd_rule_upper' as any) || 'At least 1 uppercase letter'}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirm_password') || 'Confirm Password'}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                  placeholder="••••••••"
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="mt-2 text-sm text-emerald-600 flex items-center gap-2 px-1 animate-in fade-in duration-300">
                  <Check className="h-4 w-4" />
                  <span>{t('pwd_match_success' as any) || 'Passwords match'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (t('reset_password') || 'Reset Password')}
            </button>
          </form>
        )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100">
        <Suspense fallback={<div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-orange" /></div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
