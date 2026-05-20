'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, FileText, AlertCircle, Trash2, ShieldCheck, Activity, PowerOff, Power, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface SystemStats {
  total_users: number;
  total_policies: number;
  total_claims: number;
  policy_distribution: { type: string; count: number }[];
}

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  policy_count: number;
  claim_count: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Basic protection to prevent flickering if somehow accessed directly without admin rights
    if (!user) return;
    if (!user.is_admin) {
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, router]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`)
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
    } catch (err: any) {
      console.error("Admin fetch error", err);
      setError("Failed to load admin data. Are you an admin?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: number, currentStatus: boolean, email: string) => {
    const action = currentStatus ? "suspend" : "reactivate";
    if (window.confirm(`Are you sure you want to ${action} ${email}?`)) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-suspend`);
        fetchAdminData();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Error toggling suspension.");
      }
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (window.confirm(`PERMANENT ACTION: Delete user ${email} and all their data?`)) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`);
        fetchAdminData(); // Refresh list
      } catch (err: any) {
        alert(err.response?.data?.detail || "Error deleting user.");
      }
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Platform Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Monitor system health and manage user accounts.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {isLoading && !stats ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
        </div>
      ) : stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-brand-orange/10 text-brand-orange rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-brand-orange/10 text-brand-orange rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_policies}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_claims}</p>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-orange" /> User Directory
              </h2>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-white border border-gray-200 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange text-gray-900 w-64 transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registered On</th>
                    <th className="px-6 py-4">Policies</th>
                    <th className="px-6 py-4">Claims</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                            {u.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {u.full_name}
                              {u.is_admin && <span className="px-2 py-0.5 bg-brand-orange/20 text-brand-orange text-[10px] rounded-full uppercase font-bold tracking-wider">Admin</span>}
                            </div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center bg-brand-orange/10 text-brand-navy h-6 w-6 rounded-full font-semibold text-xs border border-blue-100">
                          {u.policy_count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center bg-amber-50 text-amber-700 h-6 w-6 rounded-full font-semibold text-xs border border-amber-100">
                          {u.claim_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!u.is_admin ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => router.push(`/admin/users/${u.id}`)}
                              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium transition-colors border border-gray-200 shadow-sm"
                            >
                              Inspect
                            </button>
                            <button 
                              onClick={() => handleToggleSuspend(u.id, u.is_active, u.email)}
                              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-amber-600 rounded-xl text-xs font-medium transition-colors border border-gray-200 shadow-sm flex items-center gap-1"
                            >
                              {u.is_active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />} 
                              {u.is_active ? 'Suspend' : 'Reactivate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs font-medium italic">Protected System Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
