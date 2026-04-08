'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';

export default function AdminTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [constraintInfo, setConstraintInfo] = useState<any>(null);

  const upgradeAccount = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/upgrade-test-account', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Success! Your account has been upgraded to All-In (highest tier) with full access.');
        setTimeout(() => {
          window.location.href = '/account';
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConstraint = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/check-constraint');
      const data = await response.json();

      if (response.ok) {
        setConstraintInfo(data);
        setMessage('✅ Constraint info loaded - see below');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            🔧 Testing Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Development and testing utilities for TrueITCost
          </p>

          <div className="space-y-6">
            {/* Upgrade Account */}
            <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 bg-emerald-50 dark:bg-emerald-900/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Upgrade to All-In (Full Access)
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Give your account full All-In tier access for testing. This will:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                <li>Set subscription tier to <strong>All-In</strong> (highest tier)</li>
                <li>Set subscription status to <strong>Active</strong></li>
                <li>Remove trial expiration</li>
                <li>Grant unlimited access to all features</li>
              </ul>

              <button
                onClick={upgradeAccount}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Upgrading...' : '⬆️ Upgrade My Account to All-In'}
              </button>

              {message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  message.startsWith('✅')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {message}
                </div>
              )}
            </div>

            {/* Check Constraint */}
            <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Check Database Constraint
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Query the database to see what subscription_tier values are currently allowed
              </p>

              <button
                onClick={checkConstraint}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? '⏳ Checking...' : '🔍 Check Valid Tier Values'}
              </button>

              {constraintInfo && (
                <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <div className="mb-2">
                    <strong>Valid Tier Values:</strong>
                    <pre className="mt-1 text-sm">{JSON.stringify(constraintInfo.uniqueTiers, null, 2)}</pre>
                  </div>
                  <div className="mb-2">
                    <strong>Valid Status Values:</strong>
                    <pre className="mt-1 text-sm">{JSON.stringify(constraintInfo.uniqueStatuses, null, 2)}</pre>
                  </div>
                  <div>
                    <strong>Total Profiles:</strong> {constraintInfo.totalProfiles}
                  </div>
                </div>
              )}
            </div>

            {/* Other Test Actions */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Quick Links
              </h2>
              <div className="space-y-2">
                <a
                  href="/account"
                  className="block px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white transition-colors"
                >
                  → View My Account
                </a>
                <a
                  href="/saved-solutions"
                  className="block px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white transition-colors"
                >
                  → View Saved Solutions
                </a>
                <a
                  href="/pricing"
                  className="block px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white transition-colors"
                >
                  → View Pricing Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
