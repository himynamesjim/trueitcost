'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['core', 'solutions']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const navSections: NavSection[] = [
    {
      title: 'Core Tools',
      items: [
        { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
        { icon: '✨', label: 'AI Solution Builder', href: '/ai-solutions' },
        { icon: '📊', label: 'Co-Term Calculator', href: '/coterm-calc' },
        // MSP Assessment - Hidden for now
        // { icon: '🎯', label: 'MSP Assessment', href: '/assessment' },
      ],
    },
    {
      title: 'My Solutions',
      items: [
        { icon: '💾', label: 'Saved Solutions', href: '/saved-solutions' },
        { icon: '📋', label: 'Projects', href: '/projects' },
        { icon: '⭐', label: 'Favorites', href: '/favorites' },
      ],
    },
    {
      title: 'Templates & Resources',
      items: [
        { icon: '📚', label: 'Solution Templates', href: '/templates' },
        { icon: '🔧', label: 'Vendor Catalog', href: '/vendors' },
        { icon: '💰', label: 'Pricing Guide', href: '/pricing-guide' },
        { icon: '📖', label: 'Best Practices', href: '/best-practices' },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        { icon: '👤', label: 'Profile', href: '/profile' },
        { icon: '🏢', label: 'Organization', href: '/organization' },
        { icon: '📈', label: 'Usage & Billing', href: '/billing' },
        { icon: '🔔', label: 'Notifications', href: '/notifications' },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          w-64 bg-white dark:bg-slate-950
          border-r border-slate-200 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          overflow-y-auto
        `}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrueITCost
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {navSections.map((section, sectionIdx) => {
            const sectionKey = section.title.toLowerCase().replace(/\s+/g, '-');
            const isExpanded = expandedSections.includes(sectionKey);

            return (
              <div key={sectionIdx} className="mb-6">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Section Items */}
                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {section.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm font-medium transition-colors
                          ${isActive(item.href)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }
                        `}
                        onClick={onClose}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <Link
            href="/support"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span>📞</span>
            <span>Support</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
