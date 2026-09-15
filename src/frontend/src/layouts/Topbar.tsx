import React, { useState } from 'react';
import {
  Search,
  Bell,
  Bot,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  aiMode: string;
  onOpenAssistant: () => void;
  onTriggerDemo: () => void;
  isDemoLoading: boolean;
  onSearchSelect?: (type: string, id: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  aiMode,
  onOpenAssistant,
  onTriggerDemo,
  isDemoLoading,
  onSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white/95 dark:bg-[#070b14]/90 border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-200">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search: alerts, incidents, campaigns, assets, IOCs..."
            className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Attack Trigger */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onTriggerDemo}
          isLoading={isDemoLoading}
          className="shadow-sm border-rose-500 text-xs font-mono font-bold tracking-wider uppercase px-3 py-1.5"
        >
          <Flame className="w-4 h-4 mr-1.5 fill-current animate-pulse text-amber-200" />
          Generate Demo Attack
        </Button>

        {/* AI Copilot Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAssistant}
          className="text-xs font-mono tracking-wider font-semibold"
        >
          <Bot className="w-4 h-4 mr-1" />
          Intel Copilot
        </Button>

        {/* AI Mode Indicator Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              aiMode === 'WATSONX' ? 'bg-blue-600 dark:bg-cyan-400 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">AI:</span>
          <span
            className={`font-bold text-[11px] ${
              aiMode === 'WATSONX' ? 'text-blue-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {aiMode}
          </span>
        </div>

        {/* System Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 font-mono text-xs text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] font-bold tracking-wider">DEFENSE ACTIVE</span>
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark SOC Theme' : 'Switch to White Theme'}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-40 text-xs font-sans animate-fade-in">
              <div className="font-bold text-slate-900 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Tactical Notifications</span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400">3 Unacknowledged</span>
              </div>
              <div className="py-2 space-y-2.5">
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/40 dark:border-red-800/40 dark:text-red-300">
                  <strong>CRITICAL:</strong> High-risk correlation on DC-PRIMARY (INC-001) crossed 90+ threshold.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                  <strong>ATT&CK UPDATE:</strong> New T1003 OS Credential Dumping observed.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                  <strong>AUTO-SUPPRESS:</strong> 42 routine vulnerability sweeps suppressed as false positives.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
