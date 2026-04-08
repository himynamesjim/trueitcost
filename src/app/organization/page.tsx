'use client';

import { useState } from 'react';
import { Users, Plus, Mail, Shield, Trash2 } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Organization
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage team members, permissions, and organization settings
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md">
            <Plus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'members' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Total Members</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">1</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Admins</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">1</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pending Invites</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">0</div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Team Members
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="mb-4">No team members yet</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                    <Plus className="w-4 h-4" />
                    Invite Your First Team Member
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Organization Details */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Organization Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Industry
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select industry</option>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company Size
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select size</option>
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>501+ employees</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium transition-all shadow-sm hover:shadow-md">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Default Permissions
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Can create solutions</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Allow members to create and save solutions</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Can share solutions</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Allow members to share solutions with the team</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Can manage billing</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Allow members to view and manage billing settings</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
