'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, AlertCircle } from 'lucide-react';
import { getUser, getUserProfile } from '@/lib/auth/actions';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrialDaysRemaining = () => {
    if (!profile?.trial_ends_at) return 0;
    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  const daysRemaining = getTrialDaysRemaining();
  const isTrialActive = profile?.subscription_tier === 'trial' && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <aside className="dark:bg-[#0a0d14] bg-white" style={{
          width: '280px',
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: 'flex',
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          <NavMenu />
        </aside>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Usage & Billing
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your subscription, usage, and payment methods
          </p>
        </div>

        {/* Trial Banner */}
        {isTrialActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Free Trial Active
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                  You have {daysRemaining} days remaining in your 7-day free trial. Upgrade now to continue using TrueITCost after your trial ends.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm"
                >
                  View Plans & Upgrade
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Current Plan
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {profile?.subscription_tier === 'trial' ? 'Free Trial' : 'Professional'}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {profile?.subscription_tier === 'trial'
                  ? `Expires ${new Date(profile.trial_ends_at).toLocaleDateString()}`
                  : 'Billed monthly'}
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              {profile?.subscription_tier === 'trial' ? 'Upgrade Plan' : 'Change Plan'}
            </Link>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💾</span>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Solutions Created</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">This month</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">AI Queries</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">This month</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📄</span>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Reports Generated</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">This month</div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Payment Method
          </h2>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No payment method on file
            </p>
            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Billing History
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-600 dark:text-slate-400">
              No billing history yet
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
