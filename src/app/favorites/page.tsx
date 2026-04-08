'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function FavoritesPage() {
  const [filter, setFilter] = useState<'all' | 'solutions' | 'templates'>('all');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <aside className="dark:bg-[#0a0d14] bg-white" style={{
          width: '280px',
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: 'flex',
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          <NavMenu />
        </aside>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Favorites
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Quick access to your starred solutions and templates
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Favorites
          </button>
          <button
            onClick={() => setFilter('solutions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'solutions'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setFilter('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12">
          <div className="text-center">
            <Star className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No favorites yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Star your most-used solutions and templates for quick access from this page.
            </p>
            <Link
              href="/saved-solutions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md"
            >
              Browse Saved Solutions
            </Link>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
