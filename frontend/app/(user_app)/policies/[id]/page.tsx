'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { ShieldCheck, FileText, Send, Upload, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Guarantee {
  name: string;
  details: string;
}

interface Document {
  id: number;
  filename: string;
  doc_type: string;
  uploaded_at: string;
}

interface Claim {
  id: number;
  description: string;
  amount: number;
  status: string;
}

interface Policy {
  id: number;
  company_name: string;
  company_domain?: string;
  policy_type: string;
  summary: string;
  guarantees: Guarantee[];
  documents: Document[];
  claims: Claim[];
}

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { t, lang } = useLanguage();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Claim state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [newClaim, setNewClaim] = useState({ description: '', amount: 0, status: 'Pending' });

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/policies/${id}`);
      setPolicy(res.data);
    } catch (error) {
      console.error("Failed to fetch policy", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
    setIsChatLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        policy_id: parseInt(id),
        question: userQ,
        language: lang === 'fr' ? 'French' : 'English'
      });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error connecting to the vault." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/policies/${id}/documents`, formData);
      setFile(null);
      fetchPolicy(); // refresh
    } catch (err) {
      alert("Failed to upload document.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/policies/${id}/claims`, {
        ...newClaim,
        date_filed: new Date().toISOString()
      });
      setShowClaimForm(false);
      setNewClaim({ description: '', amount: 0, status: 'Pending' });
      fetchPolicy(); // refresh
    } catch (err) {
      alert("Failed to add claim.");
    }
  };

  const handleDeleteDocument = async (docId: number, filename: string) => {
    if (window.confirm(t('delete_document_confirm', { filename }))) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`);
        fetchPolicy();
      } catch (err) {
        alert("Failed to delete document.");
      }
    }
  };

  const handleDeleteClaim = async (claimId: number, description: string) => {
    if (window.confirm(t('delete_claim_confirm', { description }))) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/claims/${claimId}`);
        fetchPolicy();
      } catch (err) {
        alert("Failed to delete claim.");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">{t('policy_cabinet')}</div>;
  if (!policy) return <div className="p-8 text-center text-red-500">{t('policy_not_found')}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN: Filing Cabinet */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden" style={{ width: '64px', height: '64px' }}>
            {policy.company_domain && (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${policy.company_domain}&sz=128`} 
                alt={policy.company_name} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }}
                className="w-full h-full object-contain absolute inset-0 p-1"
              />
            )}
            <ShieldCheck className="h-10 w-10 text-blue-600 absolute" style={{ display: policy.company_domain ? 'none' : 'block' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lang === 'fr' ? `${t('insurance')} ${policy.company_name.replace('Insurance', '').trim()}` : `${policy.company_name.replace('Insurance', '').trim()} ${t('insurance')}`}
            </h1>
            <p className="text-gray-500 capitalize">
              {lang === 'fr' ? `${t('policy')} ${t(policy.policy_type.split('_')[0] as any) || policy.policy_type}` : `${t(policy.policy_type.split('_')[0] as any) || policy.policy_type} ${t('policy')}`}
            </p>
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{policy.summary}</p>
          </div>
        </div>

        {/* Guarantees */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">{t('main_guarantees')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {policy.guarantees.map((g, i) => (
              <div key={i} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="font-semibold text-emerald-900">{g.name}</p>
                <p className="text-sm text-emerald-700 mt-1">{g.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Manager */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">{t('related_documents')}</h2>
          <ul className="space-y-2 mb-4">
            {policy.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{d.filename}</p>
                  <p className="text-xs text-gray-500">{d.doc_type}</p>
                </div>
                <button 
                  onClick={() => handleDeleteDocument(d.id, d.filename)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          
          <form onSubmit={handleUploadDoc} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm flex-1" />
            <button type="submit" disabled={!file || isUploadingDoc} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-1">
              <Upload className="h-4 w-4" /> {t('add_document')}
            </button>
          </form>
        </div>

        {/* Claims Log */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">{t('manual_claims_log')}</h2>
            <button onClick={() => setShowClaimForm(!showClaimForm)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-800">
              <Plus className="h-4 w-4" /> {t('log_claim')}
            </button>
          </div>

          {showClaimForm && (
            <form onSubmit={handleAddClaim} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200 grid gap-3">
              <input type="text" placeholder="Description (e.g. Broken Window)" required value={newClaim.description} onChange={e => setNewClaim({...newClaim, description: e.target.value})} className="p-2 border rounded-md text-sm" />
              <div className="flex gap-3">
                <input type="number" placeholder="Amount ($)" required value={newClaim.amount || ''} onChange={e => setNewClaim({...newClaim, amount: parseFloat(e.target.value)})} className="p-2 border rounded-md text-sm flex-1" />
                <select value={newClaim.status} onChange={e => setNewClaim({...newClaim, status: e.target.value})} className="p-2 border rounded-md text-sm">
                  <option value="Pending">{t('pending')}</option>
                  <option value="Resolved">{t('resolved')}</option>
                  <option value="Denied">{t('denied')}</option>
                </select>
              </div>
              <button type="submit" className="bg-emerald-600 text-white py-2 rounded-md font-medium text-sm hover:bg-emerald-700">{t('save_claim')}</button>
            </form>
          )}

          {policy.claims.length === 0 ? (
             <p className="text-sm text-gray-500 italic">No claims logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {policy.claims.map(c => (
                <li key={c.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.description}</p>
                    <p className="text-xs text-gray-500">${c.amount.toLocaleString()} • {t(c.status.toLowerCase() as any) || c.status}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteClaim(c.id, c.description)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Claim"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Chat Assistant */}
      <div className="lg:w-96 flex flex-col h-[80vh] sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <h2 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> {t('policy_assistant')}
          </h2>
          <p className="text-xs text-blue-100 mt-1">{t('assistant_subtitle')}</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-sm text-gray-400 mt-10">
              {t('try_asking')}
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none text-sm text-gray-400 animate-pulse">
                {t('thinking')}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleChat} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('ask_placeholder')}
            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={isChatLoading || !question.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
