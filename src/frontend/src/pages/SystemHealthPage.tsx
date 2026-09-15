import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SystemHealthData } from '../types';
import { Button } from '../components/ui/Button';
import {
  Activity,
  CheckCircle2,
  Server,
  Cpu,
  RefreshCw,
  Database,
  Layers,
  Grid,
  BellRing,
} from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSystemHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !health) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-mono">
        Probing system health diagnostics...
      </div>
    );
  }

  const formatUptime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${hours}h ${mins}m ${s}s`;
  };

  const components = [
    { key: 'database', title: 'Database Engine', icon: Database, data: health.database },
    { key: 'api', title: 'FastAPI Backend Gateway', icon: Server, data: health.api },
    { key: 'ai_engine', title: 'AI Prioritisation & BLUF', icon: Cpu, data: health.ai_engine },
    { key: 'correlation_engine', title: 'Correlation Graph Engine', icon: Layers, data: health.correlation_engine },
    { key: 'mitre_knowledge', title: 'MITRE ATT&CK Matrix', icon: Grid, data: health.mitre_knowledge },
    { key: 'ingestion_pipeline', title: 'Multi-Source Ingestion', icon: BellRing, data: health.ingestion_pipeline },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            OPERATIONAL DEFENSE SYSTEM HEALTH & DIAGNOSTICS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Continuous health telemetry, pipeline latency metrics, and engine operational statuses.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchHealth}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh Checks
        </Button>
      </div>

      {/* System Status Banner */}
      <div className="bg-emerald-50/70 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/50 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:border-emerald-500/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-bold">
              OVERALL SYSTEM POSTURE
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ALL DEFENSE ENGINES FULLY OPERATIONAL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">SYSTEM UPTIME</span>
            <strong className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{formatUptime(health.uptime_seconds)}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">ALERTS PROCESSED</span>
            <strong className="text-blue-600 dark:text-cyan-400 text-sm font-bold">{health.total_alerts_processed.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Component Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((comp) => {
          const Icon = comp.icon;
          const isOnline = comp.data.status === 'ONLINE';

          return (
            <div key={comp.key} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                  isOnline
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/40 text-amber-600 dark:text-amber-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                    {comp.title}
                  </h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                    }`}
                  >
                    {comp.data.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-2">
                  {comp.data.details}
                </p>

                {comp.data.latency_ms !== null && (
                  <div className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">
                    Latency: {comp.data.latency_ms} ms
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
