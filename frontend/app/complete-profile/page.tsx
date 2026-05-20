'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CompleteProfilePage() {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  
  const { user, token, login, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!birthDate) {
      setError(t('pleaseEnterDateOfBirth'));
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
      setError(t('mustBe18'));
      return;
    }

    setIsLoading(true);

    try {
      const pendingToken = sessionStorage.getItem('pendingGoogleToken');
      
      if (pendingToken) {
        // Registering a new Google User
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/firebase/register`, {
          token: pendingToken,
          birth_date: birthDate
        });
        
        const apiToken = res.data.access_token;
        
        // Fetch user profile
        const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${apiToken}` }
        });
        
        sessionStorage.removeItem('pendingGoogleToken');
        login(apiToken, userRes.data);
      } else {
        // Updating an existing user who is missing birth_date
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/complete-profile`, {
          birth_date: birthDate
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local context user with the new birth_date
        login(token as string, res.data);
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('failedToUpdateProfile'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('pendingGoogleToken');
    logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="InsureHub Logo" className="h-16 w-auto object-contain mix-blend-multiply mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy">{t('almostThere')}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('provideDOBToComplete')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dateOfBirth')}</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevents future dates
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-gray-700"
            />
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-brand-orange hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
