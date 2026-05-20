'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        email: email,
        frontend_url: window.location.origin
      });
      setMessage(t('email_sent') || res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InsureHub Logo" className="h-16 w-auto object-contain mix-blend-multiply mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy">{t('forgot_password') || 'Forgot Password?'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 text-center border border-green-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email_address') || 'Email Address'}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !!message}
            className="w-full bg-brand-orange hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (t('send_reset_link') || 'Send Reset Link')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <Link href="/login" className="text-brand-orange font-medium hover:underline">
            {t('back_to_login') || 'Back to login'}
          </Link>
        </p>
      </div>
    </div>
  );
}
