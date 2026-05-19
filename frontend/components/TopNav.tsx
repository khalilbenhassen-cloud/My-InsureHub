'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Bell, Globe, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [userPhoto, setUserPhoto] = useState('https://api.dicebear.com/7.x/notionists/svg?seed=Khalil');


  const loadProfileData = () => {
    if (!user) {
      setUserPhoto(`https://api.dicebear.com/7.x/initials/svg?seed=User`);
      return;
    }
    const defaultPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`;
    const saved = localStorage.getItem(`userProfile_${user.email}`);
    if (saved) {
      try {
        const profile = JSON.parse(saved);
        if (profile.photoBase64) {
          setUserPhoto(profile.photoBase64);
        } else {
          setUserPhoto(defaultPhoto);
        }
      } catch (e) {
        console.error("Failed to parse user profile in TopNav", e);
        setUserPhoto(defaultPhoto);
      }
    } else {
      setUserPhoto(defaultPhoto);
    }
  };

  useEffect(() => {
    loadProfileData();
    window.addEventListener('profileUpdated', loadProfileData);
    return () => window.removeEventListener('profileUpdated', loadProfileData);
  }, [user]);

  if (pathname === '/login' || pathname === '/register') return null;

  const navItems = [
    { name: t('dashboard'), path: '/dashboard' },
    { name: t('policies'), path: '/policies' },
    { name: t('claims'), path: '/claims' },
    { name: t('support'), path: '/support' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 w-64">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="10" fill="url(#paint0_linear)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M16 6C16 6 10.5 7.5 7 8C7 16.5 9 22.5 16 26C23 22.5 25 16.5 25 8C21.5 7.5 16 6 16 6ZM14.5 18.5L10.5 14.5L12 13L14.5 15.5L19.5 10.5L21 12L14.5 18.5Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
            <Link href="/dashboard" className="text-[22px] font-bold text-gray-900 tracking-tight ml-1">
              My InsureHub
            </Link>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '#' && pathname.startsWith(`${item.path}/`));
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Profile */}
          <div className="flex items-center gap-4 w-64 justify-end">
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors border border-gray-200 focus:outline-none cursor-pointer appearance-none outline-none"
              title="Toggle Language"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
            <button className="text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src={userPhoto} 
                alt="Profile" 
                className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 object-cover"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.full_name || 'My Profile'}</span>
            </Link>
            <button 
              onClick={logout}
              className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
