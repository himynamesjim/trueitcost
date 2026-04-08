'use client';

import { useState } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function BestPracticesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: '📖' },
    { id: 'planning', label: 'Planning', icon: '📋' },
    { id: 'implementation', label: 'Implementation', icon: '🔧' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'optimization', label: 'Optimization', icon: '⚡' },
    { id: 'vendor', label: 'Vendor Management', icon: '🤝' },
  ];

  const topics = [
    {
      category: 'Planning',
      title: 'IT Infrastructure Assessment Best Practices',
      description: 'Learn how to conduct thorough infrastructure assessments and gap analysis',
      icon: '📊',
    },
    {
      category: 'Implementation',
      title: 'Phased Deployment Strategies',
      description: 'Best practices for rolling out new solutions with minimal disruption',
      icon: '🚀',
    },
    {
      category: 'Security',
      title: 'Zero Trust Architecture Implementation',
      description: 'Step-by-step guide to implementing zero trust security models',
      icon: '🛡️',
    },
    {
      category: 'Optimization',
      title: 'Cloud Cost Optimization Techniques',
      description: 'Strategies to reduce cloud spending without sacrificing performance',
      icon: '💰',
    },
    {
      category: 'Vendor Management',
      title: 'Vendor Selection and Evaluation',
      description: 'Framework for selecting the right vendors for your organization',
      icon: '✅',
    },
    {
      category: 'Planning',
      title: 'Network Design Fundamentals',
      description: 'Core principles for designing scalable, resilient networks',
      icon: '🌐',
    },
  ];

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
            Best Practices
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Expert guidance and proven methodologies for IT infrastructure projects
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search best practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Topic */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <BookOpen className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2 opacity-90">FEATURED GUIDE</div>
              <h2 className="text-2xl font-bold mb-3">
                Complete Guide to IT Solution Design
              </h2>
              <p className="text-blue-100 mb-4">
                A comprehensive guide covering everything from requirements gathering to deployment and optimization. Learn the methodologies used by top IT consultants.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                Read Guide
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{topic.icon}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {topic.category}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {topic.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                Learn more
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-slate-100 dark:bg-slate-900 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Our AI Solutions Architect can provide personalized guidance and best practices tailored to your specific needs.
          </p>
          <a
            href="/ai-solutions?category=custom"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md"
          >
            Ask AI Solutions Architect
          </a>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
