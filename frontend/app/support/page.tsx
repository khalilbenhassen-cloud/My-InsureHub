'use client';

import { useState } from 'react';
import axios from 'axios';
import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const getFaqs = (t: any) => [
  {
    question: t('faq_1_q'),
    answer: t('faq_1_a')
  },
  {
    question: t('faq_2_q'),
    answer: t('faq_2_a')
  },
  {
    question: t('faq_3_q'),
    answer: t('faq_3_a')
  },
  {
    question: t('faq_4_q'),
    answer: t('faq_4_a')
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First one open by default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  // Form state
  const [ticket, setTicket] = useState({ category: 'General Inquiry', subject: '', message: '' });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.message) return;
    
    setIsSubmitting(true);
    
    let userName = "Unknown User";
    let userEmail = "Not Provided";
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.fullName) userName = profile.fullName;
        if (profile.email) userEmail = profile.email;
      } catch (e) {}
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/support/ticket`, {
        ...ticket,
        user_name: userName,
        user_email: userEmail
      });
      setIsSuccess(true);
      setTicket({ category: 'General Inquiry', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to submit ticket", err);
      alert("Failed to send email. Check your backend configuration and App Password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-[#0D7AF5]" /> {t('support')}
        </h1>
        <p className="text-[17px] text-gray-600 mt-1">
          {t('support_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Smart FAQ */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-400" /> {t('faq')}
            </h2>
            <div className="space-y-4">
              {getFaqs(t).map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`border rounded-xl transition-colors ${isOpen ? 'border-blue-100 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center focus:outline-none"
                    >
                      <span className={`font-medium text-[15px] ${isOpen ? 'text-[#0D7AF5]' : 'text-gray-800'}`}>
                        {faq.question}
                      </span>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-[#0D7AF5]" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed animate-in slide-in-from-top-1">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Contact Methods Cards */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <MessageSquare className="h-6 w-6 text-[#0D7AF5] mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{t('live_chat')}</h3>
                <p className="text-xs text-gray-500 mt-1">Typical reply: under 2m</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <AlertCircle className="h-6 w-6 text-amber-500 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{t('emergency_info')}</h3>
                <p className="text-xs text-gray-500 mt-1">24/7 Claim Support</p>
             </div>
          </div>
        </div>

        {/* Right Column: Ticket Submission */}
        <div>
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('submit_ticket')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('ticket_subtitle')}</p>

            {isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-xl flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold">{t('ticket_submitted')}</h3>
                <p className="text-sm mt-1">Your request has been received. We'll send an update to your registered email soon.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('category')}</label>
                  <select 
                    value={ticket.category}
                    onChange={(e) => setTicket({...ticket, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D7AF5] bg-gray-50/50"
                  >
                    <option value="General Inquiry">{t('cat_general')}</option>
                    <option value="Billing Issue">{t('cat_billing')}</option>
                    <option value="Technical Support">{t('cat_technical')}</option>
                    <option value="Policy Question">{t('cat_policy')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('subject')}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={t('subject_placeholder')}
                    value={ticket.subject}
                    onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D7AF5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('message')}</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder={t('message_placeholder')}
                    value={ticket.message}
                    onChange={(e) => setTicket({...ticket, message: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0D7AF5] resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !ticket.subject || !ticket.message}
                  className="w-full bg-[#0D7AF5] hover:bg-blue-600 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:bg-blue-300"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> {t('submit_request')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
