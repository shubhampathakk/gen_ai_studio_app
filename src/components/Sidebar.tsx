import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Activity, Database, GitBranch, Zap } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'xray', label: 'The X-Ray', icon: GitBranch },
    { id: 'cart', label: 'The Cart', icon: Database },
    { id: 'factory', label: 'The Factory', icon: Zap },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          OneData.ai
        </h1>
        <p className="text-xs text-slate-400 mt-1">SAP to BigQuery Migration</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs">
            OD
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-500">admin@onedata.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
