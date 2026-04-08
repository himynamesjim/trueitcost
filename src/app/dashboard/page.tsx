'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of your IT solutions and projects
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-2xl mb-2">💾</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Saved Solutions</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Active Projects</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Favorites</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">0</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Templates Used</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/ai-solutions"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">AI Solution Builder</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Design infrastructure</div>
              </div>
            </Link>
            <Link
              href="/coterm-calc"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Co-Term Calculator</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Align renewals</div>
              </div>
            </Link>
            {/* MSP Assessment - Hidden for now */}
            {/* <Link
              href="/assessment"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">MSP Assessment</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Evaluate value</div>
              </div>
            </Link> */}
            <Link
              href="/templates"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Browse Templates</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Quick start</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No recent activity yet. Start by creating your first solution!
          </div>
        </div>
      </div>
    </div>
  );
}
