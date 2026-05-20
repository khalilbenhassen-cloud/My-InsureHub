'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Loader2, Check, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const { t } = useLanguage();
  
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Frontend age validation
    if (!birthDate) {
      setError('Please enter your date of birth.');
      return;
    }
    
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    if (age < 18) {
      setError('You must be at least 18 years old to create an account.');
      return;
    }

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
      // 1. Register User
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        email,
        full_name: fullName,
        password,
        birth_date: birthDate
      });

      // 2. Auto-login after registration
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = loginRes.data.access_token;
      
      const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(token, userRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/firebase`, { token });
      
      if (res.data.status === 'needs_birthdate') {
        sessionStorage.setItem('pendingGoogleToken', token);
        router.push('/complete-profile');
        return;
      }
      
      const apiToken = res.data.access_token;
      
      const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      
      login(apiToken, userRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InsureHub Logo" className="h-16 w-auto object-contain mix-blend-multiply mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy">{t('create_account') || 'Create an Account'}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('join_insurehub') || 'Join My InsureHub to organize your policies'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('full_name') || 'Full Name'}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevents future dates
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password') || 'Password'}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirm_password' as any) || 'Confirm Password'}</label>
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
            className="w-full bg-brand-orange hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (t('create_account') || 'Create Account')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-sm text-gray-400">or continue with</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-8">
          {t('already_have_account') || 'Already have an account?'}{' '}
          <Link href="/login" className="text-brand-orange font-medium hover:underline">
            {t('sign_in') || 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
