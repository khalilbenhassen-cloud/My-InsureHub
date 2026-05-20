'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Car, Home as HomeIcon, HeartPulse, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Guarantee {
  name: string;
  details: string;
}

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
  premium_amount: number;
  status: string;
  guarantees: Guarantee[];
}

interface Claim {
  id: number;
  description: string;
  amount: number;
  status: string;
  date_filed: string;
}

interface UserCabinet {
  user_email: string;
  full_name: string;
  policies: Policy[];
  claims: Claim[];
}

export default function UserInspectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [cabinet, setCabinet] = useState<UserCabinet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.is_admin) return;
    
    const fetchCabinet = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}/cabinet`);
        setCabinet(res.data);
      } catch (err: any) {
        setError('Failed to fetch user cabinet.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCabinet();
  }, [id, user]);

  const getPolicyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'auto': return <Car className="h-6 w-6" />;
      case 'home': return <HomeIcon className="h-6 w-6" />;
      case 'health': return <HeartPulse className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  if (!user?.is_admin) return null;

  return (
    <div className="space-y-8 animate-in fade-in">
      
      <button 
        onClick={() => router.push('/admin/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
        </div>
      ) : cabinet && (
        <>
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Inspecting User: {cabinet.full_name}
            </h1>
            <p className="text-gray-500 mt-2">{cabinet.user_email}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Policies ({cabinet.policies.length})</h2>
            {cabinet.policies.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 bg-gray-50 rounded-3xl text-center text-gray-500">
                This user has not uploaded any policies yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cabinet.policies.map(policy => (
                  <div key={policy.id} className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-xl">
                          {getPolicyIcon(policy.policy_type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{policy.company_name}</h3>
                          <p className="text-sm font-medium text-gray-500 capitalize">{policy.policy_type} Insurance</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full border border-gray-200">
                        {policy.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Premium</p>
                      <p className="text-xl font-bold text-gray-900">${policy.premium_amount.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Detected Guarantees:</p>
                      <ul className="space-y-2">
                        {policy.guarantees.map((g, i) => (
                          <li key={i} className="flex flex-col bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="text-sm font-semibold text-gray-800">{g.name}</span>
                            <span className="text-xs text-gray-500">{g.details}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Claims ({cabinet.claims.length})</h2>
            {cabinet.claims.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 bg-gray-50 rounded-3xl text-center text-gray-500">
                This user has not submitted any claims.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cabinet.claims.map(claim => (
                  <div key={claim.id} className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{claim.description}</h3>
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                        claim.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        claim.status === 'Denied' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Filed on {new Date(claim.date_filed).toLocaleDateString()}</p>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
                      <p className="text-xl font-bold text-gray-900">${claim.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
