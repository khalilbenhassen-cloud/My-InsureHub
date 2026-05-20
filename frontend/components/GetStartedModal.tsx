'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GetStartedModalProps {
  onClose: () => void;
}

export function GetStartedModal({ onClose }: GetStartedModalProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGetStarted = () => {
    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleGetStarted}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 pt-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 transition-colors duration-300">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('profile_saved_title') || 'Profile Completed!'}
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            {t('profile_saved_desc') || 'Awesome! Your profile is set up. Now you are ready to upload your first insurance policy and start chatting with the AI.'}
          </p>

          <button
            onClick={handleGetStarted}
            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {t('get_started_now') || 'Get Started Now'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
