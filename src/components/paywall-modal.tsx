'use client';

import { useRouter } from 'next/navigation';
import { X, Lock, Crown, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  builderName: string;
  requiredTier?: 'builder' | 'professional' | 'all_in';
  reason?: 'trial_expired' | 'design_limit' | 'no_access' | 'not_logged_in';
  designsCreated?: number;
  designLimit?: number;
}

export function PaywallModal({
  isOpen,
  onClose,
  builderName,
  requiredTier = 'builder',
  reason = 'no_access',
  designsCreated = 0,
  designLimit = 6
}: PaywallModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const getTierInfo = () => {
    switch (requiredTier) {
      case 'builder':
        return {
          name: 'Builder',
          price: '$4.99/month',
          color: 'from-blue-600 to-blue-700',
        };
      case 'professional':
        return {
          name: 'Professional',
          price: '$9.99/month',
          color: 'from-emerald-600 to-emerald-700',
        };
      case 'all_in':
        return {
          name: 'All-In',
          price: '$14.99/month',
          color: 'from-purple-600 to-purple-700',
        };
      default:
        return {
          name: 'Builder',
          price: '$4.99/month',
          color: 'from-blue-600 to-blue-700',
        };
    }
  };

  const tierInfo = getTierInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 border-2 border-slate-200 dark:border-slate-700">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full bg-gradient-to-br ${tierInfo.color}`}>
            <Lock className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
          {reason === 'not_logged_in' ? `Start Your Free Trial to Access ${builderName}` : `Upgrade to Access ${builderName}`}
        </h2>

        {/* Subtitle */}
        <p className="text-slate-600 dark:text-slate-400 text-center mb-8 text-lg">
          {reason === 'design_limit' ? (
            <>
              You've reached your trial limit of {designLimit} designs ({designsCreated}/{designLimit} used). Upgrade to create unlimited designs.
            </>
          ) : reason === 'trial_expired' ? (
            <>
              Your free trial has ended. Choose a plan to continue using our premium builders.
            </>
          ) : reason === 'not_logged_in' ? (
            <>
              Sign up to start your free 7-day trial and access {builderName} today.
            </>
          ) : (
            <>
              Upgrade to access {builderName} and create professional IT solutions.
            </>
          )}
        </p>
        {/* Features */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-6 w-6 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
              What You'll Get:
            </h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Unlimited access</strong> to {builderName}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>AI-powered recommendations</strong> for optimal solutions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>PDF exports</strong> and professional email generation
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Save and manage</strong> all your designs
              </span>
            </li>
          </ul>
        </div>

        {/* Pricing highlight */}
        <div className={`bg-gradient-to-r ${tierInfo.color} rounded-xl p-6 mb-6 text-white text-center`}>
          <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">
            Recommended Plan
          </div>
          <div className="text-4xl font-bold mb-1">
            {tierInfo.price}
          </div>
          <div className="text-sm opacity-90">
            or save 20% with annual billing
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/pricing')}
            className={`flex-1 py-4 px-6 bg-gradient-to-r ${tierInfo.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all text-lg`}
          >
            View All Plans
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg"
          >
            Start Free Trial
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          7-day free trial • Cancel anytime • No credit card required
        </p>
      </div>
    </div>
  );
}
