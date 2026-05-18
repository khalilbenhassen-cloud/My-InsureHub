'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Bell } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Policies', path: '/policies' },
    { name: 'Claims', path: '/claims' },
    { name: 'Support', path: '#' },
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
            <button className="text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Khalil" 
                alt="Profile" 
                className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Khalil Benhassen</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
