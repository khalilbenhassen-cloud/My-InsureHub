'use client';

import Link from 'next/link';
import { usePathname, useRouter, notFound } from 'next/navigation';
import { LayoutDashboard, Users, Ticket, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Disable admin portal in production unless explicitly enabled via env var
  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== 'true') {
    notFound();
  }

  useEffect(() => {
    // If not admin, redirect to user dashboard
    if (user && !user.is_admin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't show sidebar on admin login page
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">{children}</div>;
  }

  const navItems = [
    { name: 'Platform Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Support Inbox', path: '/admin/tickets', icon: Ticket },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Light Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <img src="/logo.png" alt="InsureHub Logo" className="h-8 w-auto object-contain mix-blend-multiply mr-3" />
          <span className="text-brand-navy font-bold tracking-wide">InsureHub Admin</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-orange/10 text-brand-orange' : 'hover:bg-gray-50 hover:text-gray-900 text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
