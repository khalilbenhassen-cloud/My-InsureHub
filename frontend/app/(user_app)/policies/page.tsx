'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, PlusCircle, CheckCircle2, Trash2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
  status: string;
  created_at: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies`);
      setPolicies(res.data);
    } catch (error) {
      console.error("Failed to fetch policies", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (policyId: number) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this policy and all its documents?");
    if (!confirmed) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/policies/${policyId}`);
      // Remove from state to update UI instantly without another fetch
      setPolicies(policies.filter(p => p.id !== policyId));
    } catch (error) {
      console.error("Failed to delete policy", error);
      alert("Failed to delete the policy.");
    }
  };

  const handleStatusChange = async (policyId: number, newStatus: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/policies/${policyId}/status`, { status: newStatus });
      setPolicies(policies.map(p => p.id === policyId ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('all_policies')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('policies_subtitle')}</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <PlusCircle className="h-4 w-4" />
          {t('add_policy')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading portfolio...</div>
        ) : policies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            No policies found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('company')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('added_on')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{policy.company_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{t(policy.policy_type.split('_')[0] as any) || policy.policy_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(policy.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={policy.status || 'Active'}
                        onChange={(e) => handleStatusChange(policy.id, e.target.value)}
                        className={`text-xs font-medium pl-2.5 pr-6 py-1 rounded-full border outline-none cursor-pointer appearance-none ${
                          (policy.status || 'Active') === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="Active">{t('active')}</option>
                        <option value="Inactive">{t('inactive')}</option>
                      </select>
                      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none ${
                        (policy.status || 'Active') === 'Active' ? 'text-emerald-800' : 'text-gray-800'
                      }`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/policies/${policy.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                        {t('view_details')}
                      </Link>
                      <button 
                        onClick={() => handleDelete(policy.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                        title="Delete Policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
