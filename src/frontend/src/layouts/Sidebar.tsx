import React from 'react';
import {
  LayoutDashboard,
  BellRing,
  ShieldAlert,
  Flame,
  Grid,
  Crosshair,
  Server,
  BarChart3,
  FileText,
  Eye,
  Cpu,
  Activity,
  Settings,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, incidentsCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'alerts', label: 'Alerts', icon: BellRing },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: incidentsCount > 0 ? String(incidentsCount) : undefined },
    { id: 'campaigns', label: 'Threat Campaigns', icon: Flame },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Grid },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Crosshair },
    { id: 'assets', label: 'Assets', icon: Server },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'commander', label: 'Commander View', icon: Eye, highlight: true },
    { id: 'ibm-ai', label: 'IBM Technology', icon: Cpu },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#050912] border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-colors duration-200">
      {/* Product Branding */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070c18]">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-cyan-600 dark:to-blue-500 flex items-center justify-center text-white dark:text-black font-black text-sm shadow-sm">
            <Shield className="w-5 h-5 text-white dark:text-black fill-current" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
              CLAR<span className="text-blue-600 dark:text-cyan-400">ION</span>
            </h1>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight leading-tight">
          AI Threat Correlation & Alert Prioritisation
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 mb-2 font-semibold">
          Operations Console
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium font-sans transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-500/50 dark:shadow-cyan-950/40'
                  : item.highlight
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50 dark:border-red-900/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-cyan-400'
                      : item.highlight
                      ? 'text-rose-600 dark:text-red-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 text-rose-700 border border-rose-200 font-bold dark:bg-red-950 dark:text-red-400 dark:border-red-800/60">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Analyst Session Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#070c18]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 dark:bg-cyan-950 dark:border-cyan-500/50 flex items-center justify-center font-mono font-bold text-xs text-blue-700 dark:text-cyan-300">
            CV
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Maj. C. Vance</div>
            <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono truncate">Watch Officer // SOC Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
