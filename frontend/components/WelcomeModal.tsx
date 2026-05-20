'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Bot, UploadCloud, ChevronRight, Check } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const steps = [
    {
      icon: ShieldCheck,
      title: t('ob_welcome_title') || 'Welcome to your Digital Vault',
      desc: t('ob_welcome_desc') || 'Say goodbye to scattered paperwork. My InsureHub centralizes all your insurance contracts in one beautifully secure location.',
      color: 'text-brand-orange',
      bg: 'bg-brand-orange/10'
    },
    {
      icon: Bot,
      title: t('ob_ai_title') || 'Chat with your contracts using AI',
      desc: t('ob_ai_desc') || 'Don\'t read 50-page PDFs. Just ask our built-in AI assistant simple questions like "What is my auto deductible?" and get instant answers.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      icon: UploadCloud,
      title: t('ob_start_title') || 'Upload your first policy',
      desc: t('ob_start_desc') || 'To get the magic started, let\'s upload your first Auto, Home, Health, or Life insurance policy into the vault right now.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={handleNext}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Progress Bar */}
        <div className="flex gap-1 p-6 pb-0">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-brand-orange' : 'bg-gray-100'}`}
            />
          ))}
        </div>

        <div className="p-8 pt-6 flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${steps[currentStep].bg}`}>
            <CurrentIcon className={`w-10 h-10 ${steps[currentStep].color}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-gray-500 leading-relaxed mb-8 h-20">
            {steps[currentStep].desc}
          </p>

          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                {t('ob_lets_go') || "Let's Go!"} <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                {t('ob_next') || 'Next'} <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
