'use client';

import LandingNav from '@/components/LandingNav';
import Link from 'next/link';
import { Bot, FolderLock, HeartHandshake, Zap, ChevronRight, BarChart3, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <LandingNav />

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-[#FDFBF7] z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              
              {/* Left Column (Text) */}
              <div className="lg:col-span-7 text-center lg:text-left mb-16 lg:mb-0 mt-8">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight mb-6 animate-in slide-in-from-bottom-3 duration-700">
                  {t('land_headline_1')} <br className="hidden lg:block"/>
                  <span className="text-brand-navy">
                    {t('land_headline_2')}
                  </span>
                </h1>
                <p className="text-xl text-slate-700 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-100">
                  {t('land_subhead')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                  <Link 
                    href="/register" 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-orange hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-orange/30 text-lg group"
                  >
                    {t('land_start_free')}
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/login" 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-brand-navy px-8 py-4 rounded-xl font-bold transition-all text-lg"
                  >
                    {t('land_sign_in_acc')}
                  </Link>
                </div>
                <p className="mt-5 text-sm text-slate-600 font-medium">{t('land_no_cc')}</p>
              </div>

              {/* Right Column (Visual) */}
              <div className="lg:col-span-5 relative animate-in zoom-in-95 duration-1000 hidden md:block">
                {/* Geometric Sage Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-[30%] -translate-y-1/2 w-[150%] h-[150%] bg-[#F0F5F2] -z-10 transform rotate-[15deg] skew-x-[-10deg] rounded-[4rem]"></div>
                
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500 max-w-sm ml-auto">
                  {/* Fake App UI Header */}
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  {/* Fake App Body */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 text-xl">{t('land_active_policies')}</h3>
                      <div className="h-8 w-8 bg-brand-orange/20 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex-shrink-0"></div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
                          <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex-shrink-0"></div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                          <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-4 opacity-50">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex-shrink-0"></div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fake AI Chat box floating */}
                    <div className="absolute -right-6 -bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 w-64 transform -rotate-2">
                       <div className="flex items-center gap-3 mb-3">
                         <div className="h-8 w-8 rounded-full bg-brand-navy flex items-center justify-center">
                           <Bot className="h-4 w-4 text-brand-orange" />
                         </div>
                         <div className="text-sm font-bold text-slate-800">{t('land_ai_agent')}</div>
                       </div>
                       <p className="text-xs text-slate-700">{t('land_ai_message')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section 2: AI Assistant (Text Left, Image Right) */}
        <section className="bg-[#FDFBF7] py-24 border-t border-slate-100 overflow-hidden relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0 lg:order-2 relative">
                {/* Geometric Sage Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[#F0F5F2] -z-10 transform rotate-[15deg] skew-x-[10deg] rounded-[4rem]"></div>
                
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white transform rotate-1 hover:rotate-0 transition-transform duration-500 relative z-10">
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400"></div><div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div><div className="h-2.5 w-2.5 rounded-full bg-green-400"></div></div>
                  </div>
                  <img src="/screenshots/MyInsureHub - PolicyAssistant.JPG" alt="AI Policy Assistant Mockup" className="w-full h-auto object-cover" />
                </div>
              </div>
              <div className="lg:order-1">
                <h2 className="text-3xl font-bold text-brand-navy mb-6">{t('land_showcase2_title')}</h2>
                <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                  {t('land_showcase2_desc')}
                </p>
                <Link href="/register" className="inline-flex items-center gap-2 text-brand-orange font-bold hover:opacity-80 transition-colors group">
                  {t('land_showcase2_link')} <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Section 1: Dashboard (Image Left, Text Right) */}
        <section className="bg-[#FDFBF7] py-24 border-t border-slate-100 overflow-hidden relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0 relative">
                {/* Geometric Sage Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-1/2 w-[150%] h-[150%] bg-[#F0F5F2] -z-10 transform -rotate-[15deg] skew-x-[-10deg] rounded-[4rem]"></div>
                
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xl bg-white transform -rotate-1 hover:rotate-0 transition-transform duration-500 relative z-10">
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-400"></div><div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div><div className="h-2.5 w-2.5 rounded-full bg-green-400"></div></div>
                  </div>
                  <img src="/screenshots/MyInsureHub - Dashboard.JPG" alt="Dashboard Mockup" className="w-full h-auto object-cover" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-brand-navy mb-6">{t('land_showcase1_title')}</h2>
                <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                  {t('land_showcase1_desc')}
                </p>
                <Link href="/register" className="inline-flex items-center gap-2 text-brand-orange font-bold hover:opacity-80 transition-colors group">
                  {t('land_showcase1_link')} <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('land_features_title')}</h2>
              <p className="text-lg text-slate-700 max-w-2xl mx-auto">{t('land_features_sub')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center mb-6">
                  <FolderLock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{t('land_feat1_title')}</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {t('land_feat1_desc')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-brand-navy/10 text-brand-navy rounded-xl flex items-center justify-center mb-6">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{t('land_feat2_title')}</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {t('land_feat2_desc')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center mb-6">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{t('land_feat3_title')}</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {t('land_feat3_desc')}
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-brand-navy/10 text-brand-navy rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{t('land_feat4_title')}</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {t('land_feat4_desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* B2B / SaaS Callout Section (Subtle) */}
        <section className="bg-brand-navy text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">{t('land_b2b_title')}</h2>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto">{t('land_b2b_sub')}</p>
            <div className="flex justify-center flex-wrap gap-8 md:gap-12 text-slate-300">
               <div className="flex flex-col items-center gap-2">
                 <BarChart3 className="h-8 w-8 text-brand-orange" />
                 <span className="font-semibold">{t('land_kpi')}</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <Users className="h-8 w-8 text-brand-orange" />
                 <span className="font-semibold">{t('land_users')}</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                 <ShieldCheck className="h-8 w-8 text-brand-orange" />
                 <span className="font-semibold">{t('land_security')}</span>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="InsureHub Logo" className="h-12 w-auto object-contain mix-blend-multiply" />
            <span className="font-extrabold text-4xl text-brand-navy tracking-tighter uppercase">InsureHub</span>
          </Link>
          <p className="text-slate-600 text-sm">{t('land_copyright', { year: currentYear })}</p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-brand-orange">{t('land_privacy')}</a>
            <a href="#" className="hover:text-brand-orange">{t('land_terms')}</a>
            <a href="mailto:support@insurehub.com" className="hover:text-brand-orange">{t('land_contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}