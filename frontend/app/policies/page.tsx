'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
  created_at: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Policies</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your complete insurance portfolio.</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Add Policy
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                    <div className="text-sm text-gray-900 capitalize">{policy.policy_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(policy.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/policies/${policy.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                        View Details
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
