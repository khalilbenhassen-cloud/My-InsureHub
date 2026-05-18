'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { UploadDropzone } from '@/components/UploadDropzone';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

interface Guarantee {
  name: string;
  details: string;
}

interface Policy {
  id: number;
  company_name: string;
  policy_type: string;
  guarantees?: Guarantee[];
}

export default function DashboardPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [language, setLanguage] = useState<string>('English');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies`);
      // For dashboard, we want guarantees too, so we might need to fetch full details if not included in /policies
      // Let's assume /policies returns basic info. We will fetch full details for each to get guarantees.
      const fullPolicies = await Promise.all(
        res.data.map((p: any) => axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies/${p.id}`).then(r => r.data))
      );
      setPolicies(fullPolicies);
    } catch (error) {
      console.error("Failed to fetch policies", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/policies/${response.data.policy_id}`);
    } catch (err) {
      console.error('Upload error:', err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const getEmoji = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auto') || t.includes('car')) return '🚗';
    if (t.includes('home') || t.includes('property')) return '🏠';
    if (t.includes('health') || t.includes('medical')) return '🏥';
    if (t.includes('life')) return '💙';
    return '📄';
  };

  const getThemeColors = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auto')) return 'bg-blue-50 text-blue-900';
    if (t.includes('home')) return 'bg-sky-50 text-sky-900';
    if (t.includes('health')) return 'bg-red-50 text-red-900';
    if (t.includes('life')) return 'bg-indigo-50 text-indigo-900';
    return 'bg-blue-50 text-blue-900';
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header Area */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">
            Welcome back, Khalil! 👋
          </h1>
          <p className="text-[17px] text-gray-600 mt-1">
            Here's your insurance overview.
          </p>
        </div>
        <button 
          onClick={() => setShowUploadModal(!showUploadModal)}
          className="bg-[#0D7AF5] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-[15px] font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" /> Add New Policy
        </button>
      </div>

      {showUploadModal && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Add New Policy</h2>
            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4">
            <UploadDropzone 
              onFileChange={setFile} 
              onLanguageChange={setLanguage} 
              language={language} 
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !file}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  !file || isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0D7AF5] text-white hover:bg-blue-600'
                }`}
              >
                {isUploading ? 'Extracting Data...' : 'Analyze & Save to Vault'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Policies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-80 bg-gray-100 rounded-[24px] animate-pulse"></div>
          ))}
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <ShieldCheck className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No policies found</p>
          <p className="text-gray-500 mt-1">Click "Add New Policy" to upload your first contract.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map(policy => {
            const shortType = policy.policy_type.split('_')[0];
            const cleanCompanyName = policy.company_name.replace('Insurance', '').trim();
            const topColor = getThemeColors(policy.policy_type);
            const guarantees = policy.guarantees?.slice(0, 3) || []; // Show top 3
            
            return (
              <div key={policy.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                
                {/* Top Section (Light Blue/Color Background) */}
                <div className={`px-6 py-5 ${topColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                      {cleanCompanyName} - {shortType} insurance
                    </span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-tight">
                    <span className="capitalize">{shortType}</span> Policy: {getEmoji(policy.policy_type)} {cleanCompanyName} <span className="text-emerald-500 font-medium text-lg ml-1">(Active)</span>
                  </h3>
                </div>

                {/* Bottom Section (White Background) */}
                <div className="p-6 flex-1 flex flex-col">
                  
                  <div className="flex gap-5 mb-6">
                    {/* Logo Box Placeholder */}
                    <div className="w-[72px] h-[72px] flex-shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center p-2">
                       <span className="font-bold text-center text-[10px] leading-tight text-gray-800 uppercase break-all">
                         {cleanCompanyName}
                       </span>
                    </div>

                    {/* Guarantees List */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-[15px] mb-2">Main guarantees</p>
                      <ul className="space-y-2">
                        {guarantees.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[14px] text-gray-700 leading-snug">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <span>{g.name}</span>
                          </li>
                        ))}
                        {guarantees.length === 0 && (
                          <li className="text-sm text-gray-400 italic">No specific guarantees extracted.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Metadata line */}
                  <div className="text-[13px] text-gray-600 mb-1">
                    Policy ID: {cleanCompanyName.substring(0,2).toUpperCase()}{policy.id}89321 | Total Premium: TBD
                  </div>
                  <div className="text-[13px] text-gray-600 mb-5 flex items-center gap-1">
                    Status: <span className="text-emerald-600 font-medium">Active</span> <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                  </div>

                  {/* Button */}
                  <button 
                    onClick={() => router.push(`/policies/${policy.id}`)}
                    className="w-full mt-auto bg-[#0D7AF5] hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                  >
                    View Policy
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
