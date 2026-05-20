'use client';

import { useLanguage } from '@/context/LanguageContext';
import { UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileReminderModalProps {
  onClose: () => void;
}

export function ProfileReminderModal({ onClose }: ProfileReminderModalProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleGoToProfile = () => {
    onClose();
    router.push('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 pt-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-brand-orange/10 transition-colors duration-300">
            <UserPlus className="w-10 h-10 text-brand-orange" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {t('profile_reminder_title') || 'Complete Your Profile'}
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            {t('profile_reminder_desc') || 'To provide the best personalized AI recommendations, we need a little bit of information about you before you upload your first policy.'}
          </p>

          <button
            onClick={handleGoToProfile}
            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {t('go_to_profile') || 'Go to Profile'} <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
