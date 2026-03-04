'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, Crown } from 'lucide-react';
import { getUserProfile } from '@/lib/auth/actions';

interface UserProfile {
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

export function TrialBanner() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkTrialStatus();
    // Check if banner was previously dismissed in this session
    const dismissed = sessionStorage.getItem('trial-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const checkTrialStatus = async () => {
    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);

      if (userProfile.trial_ends_at && userProfile.subscription_status === 'trialing') {
        const trialEnd = new Date(userProfile.trial_ends_at);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('trial-banner-dismissed', 'true');
  };

  // Don't show banner if:
  // - Profile not loaded
  // - User is not in trial
  // - Banner was dismissed
  // - Trial expired
  if (!profile ||
      profile.subscription_status !== 'trialing' ||
      !profile.trial_ends_at ||
      isDismissed ||
      daysLeft <= 0) {
    return null;
  }

  // Determine urgency styling based on days left
  const isUrgent = daysLeft <= 3;
  const bgColor = isUrgent
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : 'bg-gradient-to-r from-amber-600 to-amber-700';

  return (
    <div className={`${bgColor} text-white py-3 px-4 relative z-40`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <Clock className="h-5 w-5 animate-pulse" />
            ) : (
              <Crown className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base">
              {isUrgent ? (
                <>
                  ⚠️ Trial Ending Soon! Only {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                </>
              ) : (
                <>
                  You're on a free trial with {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
                </>
              )}
            </p>
            <p className="text-xs md:text-sm text-white/90 hidden md:block">
              Upgrade now to keep access to all premium features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Upgrade Now
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
