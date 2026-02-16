'use client';

import Link from 'next/link';
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

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Make Smarter IT Decisions with{' '}
            <span className="text-emerald-400">TrueITCost</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Your AI-powered toolkit for evaluating MSPs, architecting IT solutions, and managing software licensing. Get clear answers to complex IT decisions in minutes.
          </p>
          <a
            href="#tools"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </a>
          <p className="text-slate-400 mt-4 text-sm">Free tools • No credit card required</p>
        </div>
      </section>

      {/* What is TrueITCost */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">
            What is TrueITCost?
          </h2>
          <p className="text-lg text-center text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto">
            TrueITCost is your AI-powered decision-making platform for navigating complex IT choices.
            Whether you&apos;re evaluating managed service providers, designing IT infrastructure, or
            optimizing software licensing, we provide data-driven insights to help you make confident decisions.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* Our Tools */}
      <section id="tools" className="py-16 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
            Our Tools
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            Three powerful tools designed to help you make informed IT decisions with confidence.
          </p>

          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {/* MSP Assessment */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <TrendingUp className="h-10 w-10" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">MSP Assessment</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Not sure if your business needs a Managed Service Provider? This tool helps you evaluate whether partnering with an MSP makes financial sense for your organization.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Compare total cost of ownership: MSP vs. in-house IT staff
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Understand hidden costs like downtime risk, security gaps, and opportunity costs
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Get a detailed ROI projection tailored to your business size and industry
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      Receive an unbiased recommendation based on your specific needs
                    </li>
                  </ul>
                  <Link
                    href="/assessment"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Start MSP Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* AI Solutions Architect */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Server className="h-10 w-10" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">AI Solutions Architect</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Get expert-level IT infrastructure recommendations powered by AI. Whether you&apos;re planning a cloud migration, designing a new network, or choosing between technology stacks, our AI architect provides tailored solutions.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      Get personalized infrastructure designs based on your business requirements
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      Compare cloud vs. on-premise solutions with detailed cost breakdowns
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      Receive vendor-neutral recommendations for hardware, software, and services
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      Get implementation roadmaps with timelines and resource requirements
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

            {/* Co-Term Calc */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <Calculator className="h-10 w-10" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Co-Term Calc</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Simplify software license management and renewals. Calculate co-termination dates, prorate costs, and align all your software subscriptions to a single renewal date for easier budgeting and vendor management.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      Calculate exact prorated costs when aligning subscription renewal dates
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      Consolidate multiple software renewals into a single annual review
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      Identify opportunities to save money by optimizing license counts
                    </li>
                    <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      Export detailed reports for finance and procurement teams
                    </li>
                  </ul>
                  <Link
                    href="/coterm-calc"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Open Co-Term Calculator
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
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
      <section className="py-16 px-4 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make smarter IT decisions?
          </h2>
          <p className="text-slate-400 dark:text-slate-500 mb-8">
            Get data-driven insights in minutes, not weeks. All tools are free to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-400 transition-colors"
            >
              MSP Assessment
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/ai-solutions"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-400 transition-colors"
            >
              AI Solutions Architect
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/coterm-calc"
              className="inline-flex items-center justify-center gap-2 bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-400 transition-colors"
            >
              Co-Term Calc
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 dark:bg-black text-slate-400 dark:text-slate-500 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-500" />
            <span className="font-semibold text-white">TrueITCost</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} TrueITCost. Making IT decisions clearer with AI-powered insights.
          </p>
        </div>
      </footer>
    </main>
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
