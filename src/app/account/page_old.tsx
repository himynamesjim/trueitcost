'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { getUser, getUserProfile, signOut } from '@/lib/auth/actions';
import {
  User,
  CreditCard,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Crown,
  Calendar,
  TrendingUp,
  Wrench,
  Trash2,
  Download,
  ExternalLink
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
}

interface SavedDesign {
  id: string;
  design_type: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'designs' | 'settings'>('overview');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getUser();
    if (!currentUser) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    const userProfile = await getUserProfile();
    setProfile(userProfile);

    // Mock saved designs - will be replaced with actual API call
    setSavedDesigns([
      // Example data - remove when API is implemented
      // { id: '1', design_type: 'collaboration', title: 'Office Network Design', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <SiteHeader />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading account...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getSubscriptionInfo = () => {
    const tier = profile?.subscription_tier || 'free';
    const configs = {
      free: {
        name: 'Free Plan',
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        gradient: 'from-slate-600 to-slate-700',
        price: '$0/month',
        features: ['Limited access', 'Basic features only']
      },
      builder: {
        name: 'Builder',
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        gradient: 'from-blue-600 to-blue-700',
        price: '$4.99/month',
        features: ['Choose any 1 builder', 'Unlimited designs', 'PDF export']
      },
      professional: {
        name: 'Professional',
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        gradient: 'from-emerald-600 to-emerald-700',
        price: '$9.99/month',
        features: ['Solution Architect', 'Co-Term Calculator', 'Priority support']
      },
      'all-in': {
        name: 'All-In',
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        gradient: 'from-purple-600 to-purple-700',
        price: '$14.99/month',
        features: ['All builders', 'All features', 'Priority support', 'Early access']
      }
    };
    return configs[tier as keyof typeof configs] || configs.free;
  };

  const getDesignTypeName = (type: string) => {
    const types: Record<string, string> = {
      collaboration: 'Collaboration',
      ucaas: 'UCaaS',
      networking: 'Networking',
      datacenter: 'Data Center',
      security: 'Security',
      bcdr: 'Backup & DR'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with User Info */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getSubscriptionInfo().gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {profile.full_name || user.email?.split('@')[0]}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('designs')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'designs'
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Saved Designs ({savedDesigns.length})
              {activeTab === 'designs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {profile.full_name || user.email?.split('@')[0]}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-3">{user.email}</p>
                {getSubscriptionBadge()}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {profile.company || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Member since</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subscription</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Current Plan</p>
                  {getSubscriptionBadge()}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {profile.subscription_tier === 'free' && 'You are on the free plan. Upgrade to unlock premium features.'}
                  {profile.subscription_tier === 'builder' && 'Access to any single builder for $4.99/month'}
                  {profile.subscription_tier === 'professional' && 'Solution Architect + Co-Term Calculator for $9.99/month'}
                  {profile.subscription_tier === 'all-in' && 'Unlimited access to all features for $14.99/month'}
                </p>
              </div>

              {profile.trial_ends_at && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                    Trial ends on {new Date(profile.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {profile.subscription_tier === 'free' ? (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Upgrade Now
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/pricing')}
                      className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
                    >
                      Change Plan
                    </button>
                    <button className="flex-1 px-6 py-3 border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-all">
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Saved Designs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved Designs</h2>
            </div>

            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">No saved designs yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Your saved solutions and designs will appear here
              </p>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Usage Statistics</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Solutions Created</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Assessments Run</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Calculations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="font-medium text-slate-900 dark:text-white">Update Profile</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="font-medium text-slate-900 dark:text-white">Email Preferences</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <span className="font-medium text-slate-900 dark:text-white">Billing History</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
