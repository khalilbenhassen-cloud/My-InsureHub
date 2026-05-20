'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, DollarSign, Clock, CheckCircle, XCircle, Edit2, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface Claim {
  id: number;
  policy_id: number;
  description: string;
  date_filed: string;
  amount: number;
  status: string;
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClaimId, setEditingClaimId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Claim>>({});
  const { t } = useLanguage();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/claims`);
      setClaims(res.data);
    } catch (error) {
      console.error("Failed to fetch claims", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (claim: Claim) => {
    setEditingClaimId(claim.id);
    setEditFormData({
      description: claim.description,
      amount: claim.amount,
      status: claim.status,
      date_filed: claim.date_filed
    });
  };

  const handleCancelEdit = () => {
    setEditingClaimId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/claims/${id}`, editFormData);
      setEditingClaimId(null);
      fetchClaims();
    } catch (error) {
      console.error("Failed to update claim", error);
      alert("Failed to update claim.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this claim?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/claims/${id}`);
      fetchClaims();
    } catch (error) {
      console.error("Failed to delete claim", error);
      alert("Failed to delete claim.");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const displayStatus = t(s as any) || status;
    if (s === 'resolved' || s === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> {displayStatus}</span>;
    if (s === 'denied' || s === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> {displayStatus}</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="h-3 w-3" /> {displayStatus}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('global_claims')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('claims_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900">No claims filed yet.</p>
            <p className="text-sm mt-1">Go to a specific policy to log a new claim.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date_filed')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('policy')} ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.map((claim) => {
                const isEditing = editingClaimId === claim.id;
                
                return (
                <tr key={claim.id} className={`${isEditing ? 'bg-brand-navy/5' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(claim.date_filed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/policies/${claim.policy_id}`} className="text-brand-navy hover:underline text-sm font-bold">
                      #{claim.policy_id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editFormData.description} 
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-brand-orange focus:border-brand-orange"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{claim.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <input 
                          type="number" 
                          value={editFormData.amount} 
                          onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value)})}
                          className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-brand-orange focus:border-brand-orange"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        {claim.amount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select 
                        value={editFormData.status} 
                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-brand-orange focus:border-brand-orange bg-white"
                      >
                        <option value="Pending">{t('pending')}</option>
                        <option value="Resolved">{t('resolved')}</option>
                        <option value="Denied">{t('denied')}</option>
                      </select>
                    ) : (
                      getStatusBadge(claim.status)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSaveEdit(claim.id)} className="text-emerald-600 hover:text-emerald-900 p-1.5 bg-emerald-50 rounded-md" title="Save">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-1.5 bg-gray-100 rounded-md" title="Cancel">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(claim)} className="text-brand-navy hover:text-brand-navy/80 p-1.5 bg-brand-navy/10 rounded-md transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(claim.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
