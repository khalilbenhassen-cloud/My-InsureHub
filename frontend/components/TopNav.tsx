'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Bell, Globe, LogOut, CheckCheck } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const [userPhoto, setUserPhoto] = useState('https://api.dicebear.com/7.x/notionists/svg?seed=Khalil');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications`);
      setNotifications(res.data);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReadNotification = async (notificationId: number, link?: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setIsDropdownOpen(false);
      if (link) {
        router.push(link);
      }
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleReadAll = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;


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
          <Link href="/dashboard" className="flex items-center gap-2 w-64">
            <img src="/logo.png" alt="InsureHub Logo" className="h-8 w-auto object-contain mix-blend-multiply" />
            <span className="font-extrabold text-2xl text-brand-navy tracking-tighter uppercase">InsureHub</span>
          </Link>

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
                      ? 'border-brand-orange text-brand-navy'
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
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-400 hover:text-gray-600 relative p-1 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleReadAll}
                        className="text-xs text-[#0D7AF5] hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => handleReadNotification(notif.id, notif.link)}
                          className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <h4 className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notif.title}
                              </h4>
                              <p className={`text-xs mt-1 line-clamp-2 ${!notif.is_read ? 'text-gray-600' : 'text-gray-500'}`}>
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-2 block">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 rounded-full bg-[#0D7AF5] mt-1.5 flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src={userPhoto} 
                alt="Profile" 
                className="h-8 w-8 rounded-full bg-[#F5F3EC] border border-[#B8C7BA] object-cover"
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
