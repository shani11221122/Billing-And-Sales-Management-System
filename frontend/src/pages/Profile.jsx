import React, { useState } from 'react';
import { User, Mail, Shield, Key, Bell, CreditCard, ChevronRight, LogOut, Camera } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');

  const stats = [
    { label: 'Total Sales', value: '$12,450', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Orders Processed', value: '142', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Growth rate', value: '+14%', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-8">
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-end gap-5 -mt-10 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md border border-slate-100">
                <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-2xl border border-slate-200 overflow-hidden relative">
                  AU
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                    <Camera size={16} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin User</h2>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" /> System Administrator
              </p>
            </div>
            <div className="flex gap-2 mb-1">
              <button className="px-5 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
                Edit Profile
              </button>
              <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            {stats.map((stat, i) => (
              <div key={i} className={`p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <span className={`text-lg font-bold text-slate-900`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 space-y-1">
            {[
              { id: 'account', label: 'Account Information', icon: User },
              { id: 'security', label: 'Security & Access', icon: Key },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'billing', label: 'Billing Details', icon: CreditCard },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                  activeTab === item.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-slate-400'} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'text-white' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                      <input readOnly value="Admin User" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                      <input readOnly value="admin@billingsaas.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Role</label>
                       <input readOnly value="Administrator" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Timezone</label>
                       <input readOnly value="GMT+5:00 Islamabad" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-900" />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    This account is tied to the <span className="text-slate-900 font-bold">Main Headquarters</span> branch. All records are indexed under your admin ID.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab !== 'account' && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-200">
                  <Shield size={40} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Module Locked</h3>
                <p className="text-xs text-slate-400 max-w-xs font-medium">This section is currently under security lock. Access will be granted shortly.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}