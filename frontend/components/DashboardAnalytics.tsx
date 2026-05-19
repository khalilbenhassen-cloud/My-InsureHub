'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, CreditCard, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Guarantee {
  name: string;
  details: string;
}

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
  premium_amount?: number;
  guarantees?: Guarantee[];
}

interface DashboardAnalyticsProps {
  policies: Policy[];
}

interface Claim {
  id: number;
  status: string;
}

export function DashboardAnalytics({ policies }: DashboardAnalyticsProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/claims`)
      .then(res => setClaims(res.data))
      .catch(err => console.error("Failed to fetch claims for analytics", err));
  }, []);

  // Compute KPIs for a normal user
  const totalPolicies = policies.length;
  // Real annual cost based on extracted premium_amount (fallback to 0)
  const totalAnnualCost = policies.reduce((sum, p) => sum + (p.premium_amount || 0), 0);
  // Real ongoing claims: count claims where status is 'Pending'
  const activeClaims = claims.filter(c => c.status.toLowerCase() === 'pending').length;



  if (policies.length === 0) return null;

  return (
    <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-bottom-4">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="bg-blue-50 text-[#0D7AF5] p-4 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('my_policies')}</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalPolicies}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-500 p-4 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('total_cost')}</p>
            <h3 className="text-2xl font-bold text-gray-900">€{totalAnnualCost.toLocaleString()}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="bg-amber-50 text-amber-500 p-4 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('ongoing_claims')}</p>
            <h3 className="text-2xl font-bold text-gray-900">{activeClaims}</h3>
          </div>
        </div>
      </div>


    </div>
  );
}
