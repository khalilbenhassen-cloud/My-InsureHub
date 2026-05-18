'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Car, Bell, Inbox, HelpCircle, User } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, path: '/dashboard' },
    { icon: ClipboardList, path: '/policies' },
    { icon: Car, path: '#' },
    { icon: Bell, path: '#' },
    { icon: Inbox, path: '/claims' },
    { icon: HelpCircle, path: '#' },
    { icon: User, path: '#' },
  ];

  return (
    <aside className="w-16 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col items-center py-6 gap-8 min-h-[calc(100vh-64px)]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link 
            key={index} 
            href={item.path}
            className={`p-3 rounded-xl transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-600' 
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
