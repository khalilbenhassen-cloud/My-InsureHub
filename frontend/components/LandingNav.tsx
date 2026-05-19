'use client';

import Link from 'next/link';
import { ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingNav() {
  const { t, lang, setLang } = useLanguage();

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="InsureHub Logo" className="h-14 w-auto object-contain mix-blend-multiply" />
            <span className="font-extrabold text-5xl text-brand-navy tracking-tighter uppercase">InsureHub</span>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <Globe className="h-4 w-4 text-slate-500 ml-1" />
              <button 
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${lang === 'en' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${lang === 'fr' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                FR
              </button>
            </div>

            <Link 
              href="/login" 
              className="text-slate-600 font-medium hover:text-brand-orange transition-colors hidden sm:block"
            >
              {t('land_sign_in')}
            </Link>
            <Link 
              href="/register" 
              className="bg-brand-orange hover:opacity-90 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-semibold transition-all shadow-md shadow-brand-orange/30 text-sm sm:text-base whitespace-nowrap"
            >
              {t('land_get_started')}
            </Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
}
