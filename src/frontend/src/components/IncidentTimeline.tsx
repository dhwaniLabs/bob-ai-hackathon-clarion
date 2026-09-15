import React from 'react';
import { Alert } from '../types';
import { formatDate, getSeverityClasses } from '../lib/utils';
import { Activity, ShieldAlert, Terminal, Network, KeyRound, Cpu, Database, Radio } from 'lucide-react';

interface IncidentTimelineProps {
  alerts: Alert[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-transparent">
        No correlated timeline alerts recorded for this event.
      </div>
    );
  }

  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getEventIcon = (type: string, source: string) => {
    const t = (type + ' ' + source).toLowerCase();
    if (t.includes('login') || t.includes('auth')) return <KeyRound className="w-4 h-4 text-amber-500" />;
    if (t.includes('powershell') || t.includes('script') || t.includes('exec')) return <Terminal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />;
    if (t.includes('privilege') || t.includes('token')) return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    if (t.includes('dump') || t.includes('lsass')) return <Database className="w-4 h-4 text-purple-500" />;
    if (t.includes('c2') || t.includes('beacon') || t.includes('network') || t.includes('flow')) return <Network className="w-4 h-4 text-blue-500" />;
    if (t.includes('rf') || t.includes('satellite') || t.includes('sigint')) return <Radio className="w-4 h-4 text-emerald-500" />;
    if (t.includes('scada') || t.includes('modbus') || t.includes('plc')) return <Cpu className="w-4 h-4 text-rose-500" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sortedAlerts.map((alert, idx) => {
        const sevClass = getSeverityClasses(alert.severity);

        return (
          <div key={alert.id || idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-cyan-500/70 flex items-center justify-center shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400"></span>
            </div>

            {/* Timeline Card */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 transition-all duration-150 shadow-sm hover:border-blue-400 dark:hover:border-cyan-500/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {getEventIcon(alert.event_type, alert.source)}
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200">
                    {alert.event_type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${sevClass}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-800/40 px-2 py-0.5 rounded">
                    {alert.source}
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-400">
                    {formatDate(alert.timestamp)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-3">
                {alert.description}
              </p>

              {/* Entity Anchors footer */}
              <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-900 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {alert.asset_id && (
                  <span>
                    Asset: <strong className="text-slate-800 dark:text-slate-200">{alert.asset_id}</strong>
                  </span>
                )}
                {alert.hostname && (
                  <span>
                    Host: <strong className="text-slate-800 dark:text-slate-200">{alert.hostname}</strong>
                  </span>
                )}
                {alert.user && (
                  <span>
                    User: <strong className="text-slate-800 dark:text-slate-200">{alert.user}</strong>
                  </span>
                )}
                {alert.src_ip && (
                  <span>
                    Src: <strong className="text-slate-800 dark:text-slate-200">{alert.src_ip}</strong>
                  </span>
                )}
                {alert.mitre_technique_id && (
                  <span className="text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/40 px-1.5 py-0.5 rounded font-semibold">
                    ATT&CK: {alert.mitre_technique_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
