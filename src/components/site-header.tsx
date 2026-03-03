'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { LoginModal } from './login-modal';

export function SiteHeader() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/trueitcost-logo.png" alt="TrueITCost" width={400} height={120} className="h-28 w-auto" priority />
          </Link>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-1">
                <Link
                  href="/assessment"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">MSP Assessment</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Evaluate MSP value & ROI</div>
                </Link>
                <Link
                  href="/ai-solutions"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">AI Solutions Architect</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Design IT infrastructure</div>
                </Link>
                <Link
                  href="/coterm-calc"
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="font-medium text-slate-700 dark:text-slate-300">Co-Term Calc</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Align license renewals</div>
                </Link>
              </nav>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-sm hover:shadow-md"
              >
                Login
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
