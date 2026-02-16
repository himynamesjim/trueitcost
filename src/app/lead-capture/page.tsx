'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calculator, ArrowLeft, Mail, User, Phone } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessment-store';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LeadCapturePage() {
  const router = useRouter();
  const { setLeadInfo, leadInfo, leadCaptured } = useAssessmentStore();

  // If lead info is already captured, skip to results
  useEffect(() => {
    if (leadCaptured && leadInfo) {
      router.push('/results');
    }
  }, [leadCaptured, leadInfo, router]);

  const [name, setName] = useState(leadInfo?.name || '');
  const [email, setEmail] = useState(leadInfo?.email || '');
  const [phone, setPhone] = useState(leadInfo?.phone || '');
  const [company, setCompany] = useState(leadInfo?.company || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save lead info to store
    setLeadInfo({
      name,
      email,
      phone,
      company: company || undefined,
    });

    // TODO: Later, send lead capture email here

    // Redirect to results page
    router.push('/results');
  };

  const isValid = () => {
    return name.trim() && email.trim() && phone.trim();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm dark:shadow-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/assessment" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <span className="font-bold text-slate-900 dark:text-white">TrueITCost</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-4">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Get Your Personalized Results
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We'll send your MSP assessment report to your email. Enter your details below to continue.
          </p>
        </div>

        {/* Lead Capture Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Company (Optional) */}
            <div className="space-y-2">
              <label htmlFor="company" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Company Name <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your Company Inc."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Privacy Notice */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We respect your privacy. Your information will only be used to send you your assessment results and follow-up consultations. We will never share your data with third parties.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid()}
              className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all transform ${
                isValid()
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-emerald-900/50 hover:scale-105'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              View My Results →
            </button>

            {/* Temporary Skip Button for Testing */}
            <button
              type="button"
              onClick={() => {
                // Set dummy lead info for testing
                setLeadInfo({
                  name: 'Test User',
                  email: 'test@example.com',
                  phone: '555-0000',
                });
                router.push('/results');
              }}
              className="w-full px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Skip for Testing →
            </button>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            🔒 Your data is secure and encrypted
          </p>
        </div>
      </main>
    </div>
  );
}
