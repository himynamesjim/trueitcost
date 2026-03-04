'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LoginModal } from './login-modal';
import { OnboardingWizard } from './onboarding-wizard';
import { TrialBanner } from './trial-banner';
import { getUser, getUserProfile } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAISolutionsClick = (e: React.MouseEvent) => {
    if (pathname === '/ai-solutions') {
      e.preventDefault();
      // Refresh the page to reset to home view
      router.refresh();
      window.location.href = '/ai-solutions';
    }
  };

  useEffect(() => {
    checkUser();

    // Set up auth state listener
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        setLoading(false);
        // Check if user needs onboarding
        if (session?.user) {
          checkOnboarding();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        setIsOnboardingOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const currentUser = await getUser();
    setUser(currentUser);
    setLoading(false);

    // Check if user needs onboarding
    if (currentUser) {
      checkOnboarding();
    }
  };

  const checkOnboarding = async () => {
    try {
      const profile = await getUserProfile();
      if (profile && !profile.onboarding_completed) {
        setIsOnboardingOpen(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    router.refresh();
  };

  return (
    <>
      <TrialBanner />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
            <Image src="/trueitcost-logo.png" alt="TrueITCost" width={300} height={90} className="h-20 w-auto" priority />
          </Link>
          <div className="flex items-center gap-6 flex-1 justify-end">
            <nav className="flex items-center gap-1">
                <Link
                  href="/assessment"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">MSP Assessment</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Evaluate MSP value & ROI</div>
                </Link>
                <Link
                  href="/ai-solutions"
                  onClick={handleAISolutionsClick}
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">AI Solutions Architect</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Design IT infrastructure</div>
                </Link>
                <Link
                  href="/coterm-calc"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">Co-Term Calc</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Align license renewals</div>
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">Pricing</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">View plans</div>
                </Link>
            </nav>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />

            {/* Auth Section */}
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    Login
                  </button>
                )}
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
