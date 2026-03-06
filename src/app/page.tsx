'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calculator,
  TrendingUp,
  Shield,
  Clock,
  Server,
  Cloud,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SocialProofToast } from '@/components/social-proof-toast';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <SiteHeader />

      {/* Social Proof Toasts - Only show for non-logged-in users */}
      {!isLoading && !isLoggedIn && <SocialProofToast />}

      {/* Scrollable Content */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Make Smarter IT Decisions with{' '}
            <span className="text-emerald-400">TrueITCost</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Your AI-powered toolkit for evaluating MSPs, architecting IT solutions, and managing software licensing. Get clear answers to complex IT decisions in minutes.
          </p>
          <a
            href="#tools"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="text-slate-400 mt-4 text-sm">Free tools • No credit card required</p>
        </div>
      </section>

      {/* What is TrueITCost */}
      <section className="py-12 sm:py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-4 sm:mb-6">
            What is TrueITCost?
          </h2>
          <p className="text-base sm:text-lg text-center text-slate-600 dark:text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto">
            TrueITCost is your AI-powered decision-making platform for navigating complex IT choices.
            Whether you&apos;re evaluating managed service providers, designing IT infrastructure, or
            optimizing software licensing, we provide data-driven insights to help you make confident decisions.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900">
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Data-Driven Decisions</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Replace guesswork with real numbers, cost comparisons, and ROI projections
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900">
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">AI-Powered Intelligence</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Leverage advanced AI to analyze complex scenarios and recommend optimal solutions
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900">
              <div className="text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Save Time & Money</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Get instant insights that would normally take weeks of research and vendor meetings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Explainers with Screenshots */}
      <section id="tools" className="py-12 sm:py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            See Our Tools in Action
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            Each tool is designed to simplify complex IT decisions with intuitive interfaces and AI-powered insights.
          </p>

          {/* MSP Assessment Explainer */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">MSP Assessment Tool</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Answer a few questions about your business and current IT setup, and our AI will analyze whether partnering with an MSP makes financial sense for you.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Interactive wizard guides you through key business questions
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    AI analyzes your responses and calculates total cost of ownership
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Get detailed cost breakdowns and ROI projections
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Save and export your results for stakeholder review
                  </li>
                </ul>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Try MSP Assessment
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <Image
                  src="/msp-assessment-screenshot.png"
                  alt="MSP Assessment Tool Interface"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* AI Solutions Architect Explainer */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2">AI Solutions Architect Screenshot</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Placeholder for screenshot</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    <Server className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI Solutions Architect</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Describe your IT infrastructure needs and let our AI architect design custom solutions with detailed recommendations and cost estimates.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Chat with AI to explain your infrastructure requirements
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Receive tailored architecture designs and vendor recommendations
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Get cost breakdowns for hardware, software, and services
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Export professional proposals for management approval
                  </li>
                </ul>
                <Link
                  href="/ai-solutions"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try AI Solutions Architect
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Co-Term Calculator Explainer */}
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-purple-600 dark:text-purple-400">
                    <Calculator className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Co-Term Calculator</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Input your software licenses and subscription details to calculate exact prorated costs for aligning all renewals to a single date.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    Enter license details and renewal dates in simple forms
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    AI calculates optimal co-termination strategies
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    Visualize costs with interactive charts and breakdowns
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    Export detailed reports for procurement teams
                  </li>
                </ul>
                <Link
                  href="/coterm-calc"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Try Co-Term Calculator
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2">Co-Term Calculator Screenshot</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Placeholder for screenshot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-8 sm:mb-12">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Step
              number={1}
              title="Choose Your Tool"
              description="Select the decision you need help with: MSP evaluation, infrastructure design, or license management."
            />
            <Step
              number={2}
              title="Provide Your Context"
              description="Answer quick questions about your business, current setup, and requirements."
            />
            <Step
              number={3}
              title="Get Data-Driven Insights"
              description="Receive detailed analysis, cost comparisons, and actionable recommendations tailored to your needs."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to make smarter IT decisions?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 mb-6 sm:mb-8">
            Get data-driven insights in minutes, not weeks. All tools are free to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-emerald-400 transition-colors"
            >
              MSP Assessment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/ai-solutions"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-400 transition-colors"
            >
              AI Solutions Architect
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/coterm-calc"
              className="inline-flex items-center justify-center gap-2 bg-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-purple-400 transition-colors"
            >
              Co-Term Calc
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 0", fontSize: "11px", color: "#64748b", textAlign: "center", background: "#0c0f18" }}>
        Powered by{' '}
        <a
          href="https://www.techsolutions.cc"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#94a3b8", textDecoration: "underline", textUnderlineOffset: "2px", transition: "color 0.2s", cursor: "pointer" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          InterPeak Technology Solutions
        </a>
      </footer>
    </div>
  );
}

function CalculatorCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900 transition-all">
      <div className="text-emerald-600 dark:text-emerald-400 mb-4">{icon}</div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{description}</p>
    </div>
  );
}
