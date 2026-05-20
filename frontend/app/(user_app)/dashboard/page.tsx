'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { UploadDropzone } from '@/components/UploadDropzone';
import { WelcomeModal } from '@/components/WelcomeModal';
import { ProfileReminderModal } from '@/components/ProfileReminderModal';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { DashboardAnalytics } from '@/components/DashboardAnalytics';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface Guarantee {
  name: string;
  details: string;
}

interface Policy {
  id: number;
  company_name: string;
  company_domain?: string;
  policy_number?: string;
  policy_type: string;
  vehicle_marque?: string;
  vehicle_matricule?: string;
  premium_amount?: number;
  status: string;
  guarantees?: Guarantee[];
}

export default function DashboardPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'User';

  useEffect(() => {
    fetchPolicies();
    if (user && user.email && !localStorage.getItem(`has_seen_onboarding_${user.email}`)) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    if (user && user.email) {
      localStorage.setItem(`has_seen_onboarding_${user.email}`, 'true');
    }
    handleAddPolicyClick();
  };

  const handleAddPolicyClick = () => {
    if (user && user.email && !localStorage.getItem(`profile_completed_${user.email}`)) {
      setShowProfileReminder(true);
    } else {
      setShowUploadModal(!showUploadModal);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies`);
      // For dashboard, we want guarantees too, so we might need to fetch full details if not included in /policies
      // Let's assume /policies returns basic info. We will fetch full details for each to get guarantees.
      const fullPolicies = await Promise.all(
        res.data.map((p: any) => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies/${p.id}`).then(r => r.data))
      );
      setPolicies(fullPolicies);
    } catch (error) {
      console.error("Failed to fetch policies", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', lang === 'fr' ? 'French' : 'English');

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/policies/${response.data.policy_id}`);
    } catch (err) {
      console.error('Upload error:', err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const getEmoji = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auto') || t.includes('car')) return '🚗';
    if (t.includes('home') || t.includes('property')) return '🏠';
    if (t.includes('health') || t.includes('medical')) return '🏥';
    if (t.includes('life')) return '💙';
    return '📄';
  };

  const getThemeColors = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auto')) return 'bg-brand-navy/10 text-brand-navy';
    if (t.includes('home')) return 'bg-brand-sage/20 text-brand-navy';
    if (t.includes('health')) return 'bg-red-50 text-red-900';
    if (t.includes('life')) return 'bg-brand-navy text-white';
    return 'bg-brand-navy/10 text-brand-navy';
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {showWelcome && (
        <WelcomeModal onClose={handleCloseWelcome} />
      )}
      
      {showProfileReminder && (
        <ProfileReminderModal onClose={() => setShowProfileReminder(false)} />
      )}

      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            {t('welcome_back')}, {userName}! 👋
          </h1>
          <p className="text-[17px] text-gray-600 mt-1">
            {t('dashboard_subtitle')}
          </p>
        </div>
        <button 
          onClick={handleAddPolicyClick}
          className="bg-brand-orange hover:opacity-90 text-white px-5 py-2.5 rounded-lg text-[15px] font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" /> {t('add_policy')}
        </button>
      </div>

      {showUploadModal && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{t('add_policy')}</h2>
            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <UploadDropzone 
              onFileChange={setFile} 
              onLanguageChange={() => {}} 
              language={lang === 'fr' ? 'French' : 'English'} 
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  !file || isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-orange text-white hover:opacity-90'
                }`}
              >
                {isUploading ? t('extracting') : t('analyze_save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics Dashboard */}
      {!isLoading && policies.length > 0 && (
        <DashboardAnalytics policies={policies} />
      )}

      {/* Policies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-gray-100 rounded-[24px] animate-pulse"></div>
          ))}
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ShieldCheck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">{t('no_policies')}</p>
          <p className="text-gray-500 mt-1">{t('no_policies_sub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map(policy => {
            const shortType = policy.policy_type.split('_')[0];
            const cleanCompanyName = policy.company_name.replace('Insurance', '').trim();
            const topColor = getThemeColors(policy.policy_type);
            const guarantees = policy.guarantees?.slice(0, 3) || []; // Show top 3
            
            return (
              <div key={policy.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                
                {/* Top Section (Light Blue/Color Background) */}
                <div className={`px-6 py-5 ${topColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {cleanCompanyName} - {lang === 'fr' ? `${t('insurance')} ${t(shortType as any) || shortType}` : `${t(shortType as any) || shortType} ${t('insurance')}`}
                    </span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-tight">
                    <span className="capitalize">{lang === 'fr' ? `${t('policy')} ${t(shortType as any) || shortType}` : `${t(shortType as any) || shortType} ${t('policy')}`}</span>: {getEmoji(policy.policy_type)} {policy.policy_type.toLowerCase().includes('auto') && policy.vehicle_marque ? `${policy.vehicle_marque} ${policy.vehicle_matricule ? `(${policy.vehicle_matricule})` : ''}` : cleanCompanyName} 
                    <span className={`font-medium text-lg ml-2 ${(policy.status || 'Active') === 'Active' ? 'text-emerald-500' : 'text-gray-500'}`}>
                      ({t((policy.status || 'Active').toLowerCase() as any)})
                    </span>
                  </h3>
                </div>

                {/* Bottom Section (White Background) */}
                <div className="p-6 flex-1 flex flex-col">
                  
                  <div className="flex gap-5 mb-6">
                    {/* Logo Box */}
                    <div className="w-[72px] h-[72px] flex-shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center p-2 overflow-hidden relative">
                       {policy.company_domain && (
                         <img 
                           src={`https://www.google.com/s2/favicons?domain=${policy.company_domain}&sz=128`} 
                           alt={policy.company_name} 
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             if (e.currentTarget.nextElementSibling) {
                               (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                             }
                           }}
                           className="w-full h-full object-contain"
                         />
                       )}
                       <span 
                         className="font-bold text-center text-[10px] leading-tight text-gray-800 uppercase break-all flex items-center justify-center w-full h-full"
                         style={{ display: policy.company_domain ? 'none' : 'flex' }}
                       >
                         {cleanCompanyName}
                       </span>
                    </div>

                    {/* Guarantees List */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-[15px] mb-2">{t('main_guarantees')}</p>
                      <ul className="space-y-2">
                        {guarantees.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[14px] text-gray-700 leading-snug">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <span>{g.name}</span>
                          </li>
                        ))}
                        {guarantees.length === 0 && (
                          <li className="text-sm text-gray-400 italic">{t('no_guarantees')}</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Metadata line */}
                  <div className="text-[13px] text-gray-600 mb-1">
                    {t('policy')} ID: {policy.policy_number ? policy.policy_number : `#${policy.id}`} | {t('premium_amount')}: {policy.premium_amount ? `${policy.premium_amount} EUR` : t('tbd')}
                  </div>
                  <div className="text-[13px] text-gray-600 mb-5 flex items-center gap-1">
                    {t('status')}: <span className={`${(policy.status || 'Active') === 'Active' ? 'text-emerald-600' : 'text-gray-600'} font-medium`}>{t((policy.status || 'Active').toLowerCase() as any)}</span> {(policy.status || 'Active') === 'Active' && <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />}
                  </div>

                  {/* Button */}
                  <button 
                    onClick={() => router.push(`/policies/${policy.id}`)}
                    className="w-full mt-auto bg-brand-orange hover:opacity-90 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                  >
                    {t('view_policy')}
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
