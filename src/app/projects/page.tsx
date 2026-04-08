'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Left Panel - Navigation Menu */}
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

        {/* Right Panel - Main Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Organize and track your IT implementation projects
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md">
            <Plus className="w-4 h-4" />
            New Project
          </button>
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
            All Projects
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No projects yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create your first project to organize solutions, track implementation progress, and collaborate with your team.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md">
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
