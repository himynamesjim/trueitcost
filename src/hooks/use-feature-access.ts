'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'free' | 'builder' | 'professional' | 'all_in';
export type FeatureName = 'ai-solutions' | 'assessment' | 'coterm-calc';

interface FeatureAccess {
  hasAccess: boolean;
  isLoading: boolean;
  isTrialExpired: boolean;
  isDesignLimitReached: boolean;
  isNotLoggedIn: boolean;
  daysRemaining: number | null;
  designsCreated: number;
  designLimit: number;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: string | null;
  requiredTier: SubscriptionTier;
}

// Define which features are available in which tiers
const FEATURE_ACCESS_MAP: Record<FeatureName, SubscriptionTier[]> = {
  'ai-solutions': ['professional', 'all_in'],
  'assessment': ['all_in'],
  'coterm-calc': ['professional', 'all_in'],
};

export function useFeatureAccess(featureName: FeatureName): FeatureAccess {
  const [accessState, setAccessState] = useState<FeatureAccess>({
    hasAccess: false,
    isLoading: true,
    isTrialExpired: false,
    isDesignLimitReached: false,
    isNotLoggedIn: false,
    daysRemaining: null,
    designsCreated: 0,
    designLimit: 6,
    subscriptionTier: 'free',
    subscriptionStatus: null,
    requiredTier: 'builder',
  });

  useEffect(() => {
    checkAccess();
  }, [featureName]);

  const checkAccess = async () => {
    try {
      const supabase = createClient();

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      console.log('[useFeatureAccess] User check:', user ? 'logged in' : 'not logged in');

      if (!user) {
        console.log('[useFeatureAccess] Setting isNotLoggedIn to TRUE');
        setAccessState({
          hasAccess: false,
          isLoading: false,
          isTrialExpired: false,
          isDesignLimitReached: false,
          isNotLoggedIn: true,
          daysRemaining: null,
          designsCreated: 0,
          designLimit: 6,
          subscriptionTier: 'free',
          subscriptionStatus: null,
          requiredTier: getRequiredTier(featureName),
        });
        return;
      }

      // Get user profile with subscription info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('[useFeatureAccess] Profile:', profile);

      if (!profile) {
        console.log('[useFeatureAccess] No profile found, setting isNotLoggedIn to FALSE');
        setAccessState({
          hasAccess: false,
          isLoading: false,
          isTrialExpired: false,
          isDesignLimitReached: false,
          isNotLoggedIn: false,
          daysRemaining: null,
          designsCreated: 0,
          designLimit: 6,
          subscriptionTier: 'free',
          subscriptionStatus: null,
          requiredTier: getRequiredTier(featureName),
        });
        return;
      }

      const tier = (profile.subscription_tier || 'free') as SubscriptionTier;
      const status = profile.subscription_status || 'inactive';
      const designsCreated = profile.designs_created || 0;
      const designLimit = 6;

      // Calculate trial days remaining
      let daysRemaining: number | null = null;
      let isTrialExpired = false;

      if (profile.trial_ends_at) {
        const trialEnd = new Date(profile.trial_ends_at);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays;

        // Trial is expired if days remaining <= 0 and user is still in trialing status
        if (diffDays <= 0 && status === 'trialing') {
          isTrialExpired = true;
        }
      }

      // Check if design limit reached for trial users
      const isDesignLimitReached = status === 'trialing' && designsCreated >= designLimit;

      // Determine if user has access
      let hasAccess = false;

      // If trial is active and not expired, grant access
      if (status === 'trialing' && !isTrialExpired) {
        hasAccess = true;
      }
      // If user has an active paid subscription, check tier
      else if (status === 'active') {
        const allowedTiers = FEATURE_ACCESS_MAP[featureName];
        hasAccess = allowedTiers.includes(tier);
      }

      setAccessState({
        hasAccess,
        isLoading: false,
        isTrialExpired,
        isDesignLimitReached,
        isNotLoggedIn: false,
        daysRemaining,
        designsCreated,
        designLimit,
        subscriptionTier: tier,
        subscriptionStatus: status,
        requiredTier: getRequiredTier(featureName),
      });
    } catch (error) {
      console.error('Error checking feature access:', error);
      setAccessState({
        hasAccess: false,
        isLoading: false,
        isTrialExpired: false,
        isDesignLimitReached: false,
        isNotLoggedIn: false,
        daysRemaining: null,
        designsCreated: 0,
        designLimit: 6,
        subscriptionTier: 'free',
        subscriptionStatus: null,
        requiredTier: getRequiredTier(featureName),
      });
    }
  };

  return accessState;
}

function getRequiredTier(featureName: FeatureName): SubscriptionTier {
  const allowedTiers = FEATURE_ACCESS_MAP[featureName];
  // Return the lowest tier that has access
  if (allowedTiers.includes('builder')) return 'builder';
  if (allowedTiers.includes('professional')) return 'professional';
  if (allowedTiers.includes('all_in')) return 'all_in';
  return 'builder';
}
