'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Check, Wrench, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free Trial',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Try before you buy',
      builders: [
        'Access to all builders',
      ],
      features: [
        '6 designs total',
        '7-day trial period',
        'Full builder access',
        'No credit card required',
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-slate-600 to-slate-700',
      badgeColor: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
      isTrial: true,
    },
    {
      name: 'Builder',
      monthlyPrice: 4.99,
      annualPrice: 47.90, // 20% off (4.99 * 12 * 0.8)
      description: 'Perfect for focused project planning',
      builders: [
        'Choose any 1 builder of your choice',
      ],
      features: [
        'Unlimited designs',
        'PDF export',
        'Email generation',
        'AI-powered recommendations',
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-blue-600 to-blue-700',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      name: 'Professional',
      monthlyPrice: 9.99,
      annualPrice: 95.90, // 20% off (9.99 * 12 * 0.8)
      description: 'For MSPs and IT professionals',
      builders: [
        'AI Solutions Architect builder',
        'Co-Term Calculator',
      ],
      features: [
        'Unlimited designs',
        'PDF export',
        'Email generation',
        'AI-powered recommendations',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-emerald-600 to-emerald-700',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    },
    {
      name: 'All-In',
      monthlyPrice: 14.99,
      annualPrice: 143.90, // 20% off (14.99 * 12 * 0.8)
      description: 'Complete access to everything',
      builders: [
        'All builders (unlimited access)',
        'AI Solutions Architect',
        'Co-Term Calculator',
        'IT Assessment wizard',
      ],
      features: [
        'Unlimited designs',
        'PDF export',
        'Email generation',
        'AI-powered recommendations',
        'Priority support',
        'Early access to new features',
      ],
      cta: 'Start Free Trial',
      popular: false,
      gradient: 'from-purple-600 to-purple-700',
      badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
  ];

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if ('isTrial' in plan && plan.isTrial) {
      return 'FREE';
    }
    if (billingCycle === 'monthly') {
      return `$${plan.monthlyPrice.toFixed(2)}`;
    } else {
      return `$${plan.annualPrice.toFixed(2)}`;
    }
  };

  const getPeriod = (plan: typeof plans[0]) => {
    if ('isTrial' in plan && plan.isTrial) {
      return 'for 7 days';
    }
    return billingCycle === 'monthly' ? '/month' : '/year';
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billingCycle === 'annual') {
      const monthlyCost = plan.monthlyPrice * 12;
      const savings = monthlyCost - plan.annualPrice;
      return savings.toFixed(2);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />

      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include a 7-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8' : ''
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              Annual
            </span>
            <span className="ml-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-8 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-2xl shadow-emerald-500/20 dark:shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {plan.description}
                </p>
                <div className="flex flex-col items-center mb-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">
                      {getDisplayPrice(plan)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {getPeriod(plan)}
                    </span>
                  </div>
                  {!('isTrial' in plan && plan.isTrial) && billingCycle === 'annual' && (
                    <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                      Save ${getSavings(plan)} per year
                    </div>
                  )}
                  {!('isTrial' in plan && plan.isTrial) && billingCycle === 'monthly' && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      or ${plan.annualPrice.toFixed(2)}/year (save 20%)
                    </div>
                  )}
                </div>
              </div>

              {/* Builders Section - Highlighted */}
              <div className={`mb-6 p-4 rounded-xl ${plan.badgeColor} border-2 border-current/20`}>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-5 w-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wide">Included Tools</h4>
                </div>
                <ul className="space-y-2">
                  {plan.builders.map((builder) => (
                    <li key={builder} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0 mt-1" />
                      <span className="text-sm font-semibold leading-tight">
                        {builder}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features Section */}
              <div className="mb-8">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Plus All These Features
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => router.push('/signup')}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-emerald-500/30`
                    : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Can I switch plans?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We accept all major credit cards (Visa, Mastercard, American Express) and support recurring billing through Stripe.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes! All plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Absolutely. You can cancel your subscription at any time with no penalties or fees.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
