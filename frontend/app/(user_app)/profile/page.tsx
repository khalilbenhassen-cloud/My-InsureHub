'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Home, Car, AlertTriangle, CheckCircle2, Heart, ShieldAlert, Save, Camera, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
}

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  familyStatus: string;
  dependents: string;
  housingStatus: string;
  ownsVehicle: string;
  photoBase64?: string;
}

export default function ProfilePage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    familyStatus: '',
    dependents: '0',
    housingStatus: '',
    ownsVehicle: '',
  });
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  // Load from local storage on mount
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`userProfile_${user.email}`);
    let loadedProfile = { ...profile };
    if (saved) {
      try {
        loadedProfile = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    
    // Always override with DB user if available
    if (user) {
      loadedProfile.fullName = user.full_name;
      loadedProfile.email = user.email;
    }
    
    setProfile(loadedProfile);
    fetchPolicies();
  }, [user]);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies`);
      setPolicies(res.data);
    } catch (error) {
      console.error("Failed to fetch policies", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoBase64: reader.result as string });
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setProfile({ ...profile, photoBase64: '' });
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(profile));
    }
    setIsSaved(true);
    window.dispatchEvent(new Event('profileUpdated'));
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('delete_account_confirm'))) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/me`);
        if (user) {
          localStorage.removeItem(`userProfile_${user.email}`);
        }
        logout();
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  // Smart Alerts Logic
  const hasAuto = policies.some(p => p.policy_type.toLowerCase().includes('auto') || p.policy_type.toLowerCase().includes('car'));
  const hasHome = policies.some(p => p.policy_type.toLowerCase().includes('home') || p.policy_type.toLowerCase().includes('property'));
  const hasLife = policies.some(p => p.policy_type.toLowerCase().includes('life'));

  const alerts = [];
  
  if (profile.ownsVehicle === 'Yes' && !hasAuto) {
    alerts.push({ type: 'danger', message: t('coverage_gap_auto'), icon: Car });
  }
  if ((profile.housingStatus === 'Rent' || profile.housingStatus === 'Own') && !hasHome) {
    alerts.push({ type: 'danger', message: t('coverage_gap_home', { status: profile.housingStatus.toLowerCase() }), icon: Home });
  }
  if ((profile.familyStatus === 'Married' || parseInt(profile.dependents) > 0) && !hasLife) {
    alerts.push({ type: 'warning', message: t('smart_suggestion_life'), icon: Heart });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <User className="h-8 w-8 text-[#0D7AF5]" />
          {t('my_risk_profile')}
        </h1>
        <p className="text-[17px] text-gray-600 mt-1">
          {t('profile_subtitle')}
        </p>
      </div>

      {/* Smart Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> {t('action_required')}
          </h3>
          {alerts.map((alert, idx) => {
            const Icon = alert.icon;
            const bg = alert.type === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
            const text = alert.type === 'danger' ? 'text-red-800' : 'text-amber-800';
            const iconColor = alert.type === 'danger' ? 'text-red-500' : 'text-amber-500';
            
            return (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${bg}`}>
                <div className={`p-2 rounded-lg bg-white bg-opacity-60 ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="pt-1">
                  <p className={`font-medium ${text}`}>{alert.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Photo Upload Section */}
        <div className="p-8 border-b border-gray-100 flex flex-col items-center bg-gray-50 bg-opacity-30">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-100 flex items-center justify-center">
              {profile.photoBase64 ? (
                <img src={profile.photoBase64} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-[#0D7AF5] rounded-full text-white cursor-pointer hover:bg-blue-600 transition shadow-md border-2 border-white">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <p className="text-sm font-medium text-gray-600">{t('profile_photo')}</p>
            {profile.photoBase64 && (
              <button 
                type="button" 
                onClick={handleDeletePhoto}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">JPG or PNG (max. 2MB)</p>
        </div>

        {/* Section 1: Basic Info */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('basic_info')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('full_name')} <span className="text-red-500">*</span></label>
              <input required type="text" name="fullName" value={profile.fullName} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('email_address')} <span className="text-red-500">*</span></label>
              <input required type="email" name="email" value={profile.email} disabled className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('phone_number')} <span className="text-red-500">*</span></label>
              <input required type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+33 6 12 34 56 78" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('dob')} <span className="text-red-500">*</span></label>
              <input required type="date" name="dob" value={profile.dob} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('family_status')} <span className="text-red-500">*</span></label>
              <select required name="familyStatus" value={profile.familyStatus} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select your status...</option>
                <option value="Single">{t('single')}</option>
                <option value="Married">{t('married')}</option>
                <option value="Divorced">{t('divorced')}</option>
                <option value="Widowed">{t('widowed')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('dependents')}</label>
              <input type="number" min="0" name="dependents" value={profile.dependents} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Section 2: Asset Profile */}
        <div className="p-8 bg-gray-50 bg-opacity-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('asset_profile')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Home className="h-4 w-4 text-gray-500"/> {t('housing_status')}</label>
              <select name="housingStatus" value={profile.housingStatus} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select housing status...</option>
                <option value="Rent">{t('rent')}</option>
                <option value="Own">{t('own')}</option>
                <option value="With Parents">{t('with_parents')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Car className="h-4 w-4 text-gray-500"/> {t('owns_vehicle')}</label>
              <select name="ownsVehicle" value={profile.ownsVehicle} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="" disabled>Select vehicle status...</option>
                <option value="Yes">{t('yes_vehicle')}</option>
                <option value="No">{t('no_vehicle')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white flex justify-end items-center gap-4">
          {isSaved && <span className="text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in"><CheckCircle2 className="h-5 w-5"/> {t('profile_saved')}</span>}
          <button type="submit" className="bg-[#0D7AF5] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Save className="h-5 w-5" /> {t('save_profile')}
          </button>
        </div>

      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm mt-8">
        <div>
          <h3 className="text-lg font-bold text-red-800">{t('delete_account')}</h3>
          <p className="text-sm text-red-600 mt-1">{t('delete_account_warning')}</p>
        </div>
        <button 
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Trash2 className="h-5 w-5" /> {t('delete_account')}
        </button>
      </div>

    </div>
  );
}
