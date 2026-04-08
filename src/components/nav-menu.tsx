'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function NavMenu() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['core', 'solutions', 'resources', 'admin', 'account']);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin (simplified - you may want to use context)
  useState(() => {
    if (typeof window !== 'undefined') {
      // This will be populated by the actual admin check in your app
      setIsAdmin(true); // TODO: Implement proper admin check
    }
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const navSections: { id: string; section: NavSection; adminOnly?: boolean }[] = [
    {
      id: 'core',
      section: {
        title: 'Core Tools',
        items: [
          { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
          { icon: '✨', label: 'AI Solution Builder', href: '/ai-solutions' },
          { icon: '📊', label: 'Co-Term Calculator', href: '/coterm-calc' },
          // MSP Assessment - Hidden for now
          // { icon: '🎯', label: 'MSP Assessment', href: '/assessment' },
        ],
      },
    },
    {
      id: 'solutions',
      section: {
        title: 'My Solutions',
        items: [
          { icon: '💾', label: 'Saved Solutions', href: '/saved-solutions' },
          { icon: '📋', label: 'Projects', href: '/projects' },
          { icon: '⭐', label: 'Favorites', href: '/favorites' },
        ],
      },
    },
    {
      id: 'resources',
      section: {
        title: 'Templates & Resources',
        items: [
          { icon: '📚', label: 'Solution Templates', href: '/templates' },
          { icon: '💰', label: 'Pricing Guide', href: '/pricing-guide' },
          { icon: '📖', label: 'Best Practices', href: '/best-practices' },
        ],
      },
    },
    {
      id: 'account',
      section: {
        title: 'Account & Settings',
        items: [
          { icon: '👤', label: 'Profile', href: '/profile' },
          { icon: '🏢', label: 'Organization', href: '/organization' },
          { icon: '📈', label: 'Usage & Billing', href: '/billing' },
          { icon: '🔔', label: 'Notifications', href: '/notifications' },
        ],
      },
    },
  ];

  return (
    <nav className="flex flex-col h-full">
      {navSections
        .filter(({ adminOnly }) => !adminOnly || isAdmin)
        .map(({ id, section }) => {
        const isExpanded = expandedSections.includes(id);
        return (
          <div key={id} className="border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => toggleSection(id)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs uppercase tracking-wider">{section.title}</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isExpanded && (
              <div className="py-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-3 border-blue-600'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
