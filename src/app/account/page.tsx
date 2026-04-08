'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { getUser, getUserProfile, signOut } from '@/lib/auth/actions';
import {
  User,
  CreditCard,
  FileText,
  BarChart3,
  LogOut,
  Crown,
  Calendar,
  TrendingUp,
  Wrench,
  Trash2,
  Download,
  ExternalLink,
  CheckCircle,
  Edit2,
  Check,
  X,
  Building2,
  MapPin,
  Phone,
  Camera
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
  designs_created: number;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  avatar_url: string | null;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [editingCustomerData, setEditingCustomerData] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [customerData, setCustomerData] = useState({
    full_name: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  // Calculate usage stats from saved designs
  const usageStats = {
    aiDesigns: savedDesigns.filter(d =>
      ['collaboration', 'ucaas', 'networking', 'datacenter', 'security', 'bcdr', 'ai-solution'].includes(d.design_type)
    ).length,
    calculations: savedDesigns.filter(d => d.design_type === 'coterm-calc').length,
    assessments: savedDesigns.filter(d => d.design_type === 'assessment').length
  };

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

    // Initialize customer data from profile
    if (userProfile) {
      setCustomerData({
        full_name: userProfile.full_name || '',
        company: userProfile.company || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        country: userProfile.country || ''
      });
    }

    // Fetch saved designs
    try {
      const response = await fetch('/api/get-designs');
      if (response.ok) {
        const data = await response.json();
        setSavedDesigns(data.designs || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
      setSavedDesigns([]);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      const response = await fetch('/api/get-designs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId })
      });

      if (response.ok) {
        // Remove from local state
        setSavedDesigns(prev => prev.filter(d => d.id !== designId));
        // Refresh profile to update designs_created counter
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } else {
        alert('Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  const handleOpenDesign = (design: SavedDesign) => {
    // Navigate to the appropriate builder with the design data
    const builderMap: Record<string, string> = {
      'collaboration': '/ai-solutions',
      'ucaas': '/ai-solutions',
      'networking': '/ai-solutions',
      'datacenter': '/ai-solutions',
      'security': '/ai-solutions',
      'bcdr': '/ai-solutions',
      'assessment': '/assessment',
      'coterm-calc': '/coterm-calc'
    };

    const builderPath = builderMap[design.design_type] || '/ai-solutions';
    router.push(builderPath);
  };

  const startRename = (design: SavedDesign) => {
    setEditingId(design.id);
    setEditingTitle(design.title);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveRename = async (designId: string) => {
    if (!editingTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/get-designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId, title: editingTitle.trim() })
      });

      if (response.ok) {
        // Update local state
        setSavedDesigns(prev => prev.map(d =>
          d.id === designId ? { ...d, title: editingTitle.trim() } : d
        ));
        setEditingId(null);
        setEditingTitle('');
      } else {
        alert('Failed to rename design');
      }
    } catch (error) {
      console.error('Error renaming design:', error);
      alert('Failed to rename design');
    }
  };

  const startEditCustomerData = () => {
    setEditingCustomerData(true);
  };

  const cancelEditCustomerData = () => {
    // Reset to profile data
    if (profile) {
      setCustomerData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        country: profile.country || ''
      });
    }
    setEditingCustomerData(false);
  };

  const saveCustomerData = async () => {
    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        // Refresh profile
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setEditingCustomerData(false);
      } else {
        alert('Failed to update customer information');
      }
    } catch (error) {
      console.error('Error updating customer data:', error);
      alert('Failed to update customer information');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Refresh profile to get new avatar URL
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to upload profile image');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile image');
    } finally {
      setUploadingAvatar(false);
    }
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
        price: '$0',
        period: '/month',
        features: ['Limited access', 'Basic features only']
      },
      builder: {
        name: 'Builder',
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        gradient: 'from-blue-600 to-blue-700',
        price: '$4.99',
        period: '/month',
        features: ['Choose any 1 builder', 'Unlimited designs', 'PDF export']
      },
      professional: {
        name: 'Professional',
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        gradient: 'from-emerald-600 to-emerald-700',
        price: '$9.99',
        period: '/month',
        features: ['Solution Architect', 'Co-Term Calculator', 'Priority support']
      },
      all_in: {
        name: 'All-In',
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        gradient: 'from-purple-600 to-purple-700',
        price: '$14.99',
        period: '/month',
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

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with User Info */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className={`w-20 h-20 rounded-full ${profile.avatar_url ? 'overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg' : `bg-gradient-to-r ${subscriptionInfo.gradient} flex items-center justify-center shadow-lg`}`}>
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Change profile photo"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
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
            {/* Subscription Card - Spans 2 columns */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="h-7 w-7 text-emerald-600 dark:text-emerald-500" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription</h2>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${subscriptionInfo.color}`}>
                  {subscriptionInfo.name}
                </span>
              </div>

              {/* Current Plan Info */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    {subscriptionInfo.price}
                  </span>
                  <span className="text-xl text-slate-600 dark:text-slate-400">
                    {subscriptionInfo.period}
                  </span>
                </div>
                <ul className="space-y-2">
                  {subscriptionInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trial Info */}
              {profile.trial_ends_at && profile.subscription_status === 'trialing' && (
                <>
                  <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                      Trial ends on {new Date(profile.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Trial Design Limit */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Trial Design Limit</h4>
                      </div>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
                        {profile.designs_created || 0} / 6
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(((profile.designs_created || 0) / 6) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                      {profile.designs_created >= 6
                        ? 'Trial limit reached. Upgrade to create more designs.'
                        : `${6 - (profile.designs_created || 0)} design${6 - (profile.designs_created || 0) === 1 ? '' : 's'} remaining in your trial.`}
                    </p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {profile.subscription_tier === 'free' ? (
                  <Link
                    href="/pricing"
                    className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Upgrade Now
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/pricing"
                      className="flex-1 text-center px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
                    >
                      Change Plan
                    </Link>
                    <button className="flex-1 px-6 py-3 border-2 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-all">
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Customer Data Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-500" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Information</h2>
                </div>
                {!editingCustomerData && (
                  <button
                    onClick={startEditCustomerData}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              {editingCustomerData ? (
                <div className="space-y-4">
                  {/* Name and Company */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerData.full_name}
                        onChange={(e) => setCustomerData({ ...customerData, full_name: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={customerData.company}
                        onChange={(e) => setCustomerData({ ...customerData, company: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  {/* Phone and Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      placeholder="123 Main Street"
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={customerData.state}
                        onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={customerData.zip_code}
                        onChange={(e) => setCustomerData({ ...customerData, zip_code: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={customerData.country}
                      onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      placeholder="United States"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveCustomerData}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      <Check className="h-5 w-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditCustomerData}
                      className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.full_name || '—'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Company</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.company || '—'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.phone || '—'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {user?.email || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.address || '—'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">City</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.city || '—'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">State</p>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white pl-6">
                          {profile.state || '—'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">ZIP</p>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white pl-6">
                          {profile.zip_code || '—'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Country</p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white pl-6">
                        {profile.country || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Info & Stats */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Info</h3>
                <div className="space-y-3">
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

              {/* Usage Stats */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Usage</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI Solutions</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{usageStats.aiDesigns}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Co-Term Calcs</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{usageStats.calculations}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Assessments</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{usageStats.assessments}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account Settings</h2>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                  <span className="font-medium text-slate-900 dark:text-white">Update Profile Information</span>
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                  <span className="font-medium text-slate-900 dark:text-white">Email Preferences</span>
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                  <span className="font-medium text-slate-900 dark:text-white">Billing History</span>
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                  <span className="font-medium text-slate-900 dark:text-white">Payment Methods</span>
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
