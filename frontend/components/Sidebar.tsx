'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Car, Bell, Inbox, HelpCircle, User, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();

  const { t } = useLanguage();
  const { user } = useAuth();

  if (pathname === '/login' || pathname === '/register') return null;

  const navItems = [
    { icon: Home, path: '/dashboard', label: t('dashboard') },
    { icon: ClipboardList, path: '/policies', label: t('policies') },
    { icon: Car, path: '#', label: 'Auto' },
    { icon: Bell, path: '#', label: 'Notifications' },
    { icon: Inbox, path: '/claims', label: t('claims') },
    { icon: HelpCircle, path: '/support', label: t('support') },
    { icon: User, path: '/profile', label: t('profile') },
  ];

  if (user?.is_admin) {
    navItems.push({ icon: Shield, path: '/admin', label: t('admin_panel') });
  }

  return (
    <aside className="w-16 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col items-center py-6 gap-8 min-h-[calc(100vh-64px)]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link 
            key={index} 
            href={item.path}
            title={item.label}
            className={`p-3 rounded-xl transition-colors ${
              isActive 
                ? 'bg-brand-navy text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 1.5} />
          </Link>
        );
      })}
    </aside>
  );
}
