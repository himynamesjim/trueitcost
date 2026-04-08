'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Users, CheckCircle } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated on your solutions, projects, and team activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Notifications
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Empty State */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12">
              <div className="text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No notifications yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  When you have updates about your solutions, projects, or team activity, they'll appear here.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </h2>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">Email</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Receive email updates</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                {/* Push Notifications */}
                <div>
                  <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">Push</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Browser notifications</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                </div>

                {/* Notification Types */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">
                    Notify me about:
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4" defaultChecked />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Solution updates</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Changes to your saved solutions</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4" defaultChecked />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Project milestones</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Project progress and completion</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4" defaultChecked />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Team activity</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">When team members share or comment</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4" defaultChecked />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Pricing updates</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Market price changes</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 w-4 h-4" />
                      <div className="text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">Marketing updates</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">New features and tips</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
