import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardData, Incident } from '../types';
import { Button } from '../components/ui/Button';
import {
  Eye,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
  Send,
} from 'lucide-react';

interface CommanderPageProps {
  onSelectIncident: (id: string) => void;
  onOpenAssistant: () => void;
}

export const CommanderPage: React.FC<CommanderPageProps> = ({
  onSelectIncident,
  onOpenAssistant,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [topIncident, setTopIncident] = useState<Incident | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const loadCommanderData = async () => {
      try {
        const d = await api.getDashboard();
        setData(d);
        const incs = await api.getIncidents({ priority: 'CRITICAL' });
        if (incs.length > 0) {
          const detailed = await api.getIncidentDetail(incs[0].id);
          setTopIncident(detailed);
        }
      } catch (err) {
        console.error('Commander view error:', err);
      }
    };
    loadCommanderData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* High-Impact Executive Banner */}
      <div className="bg-rose-50/90 dark:bg-gradient-to-r dark:from-red-950/80 dark:via-[#130914] dark:to-[#070b14] border-2 border-rose-300 dark:border-red-500/80 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-sm font-mono uppercase tracking-widest text-rose-700 dark:text-red-400 font-extrabold">
              COMMANDER SITUATION DIRECTIVE
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>LAST FUSED CYCLE: JUST NOW</span>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1 font-bold">
              CURRENT ENTERPRISE THREAT LEVEL
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="text-rose-600 dark:text-red-500">DEFCON 2 // CRITICAL</span>
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-sans mt-2 max-w-2xl leading-relaxed font-medium">
              Coordinated adversary intrusion actively targeting Primary Domain Infrastructure and SCADA Telemetry Gateways. Immediate defensive containment mandated.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-right font-mono bg-white dark:bg-slate-950/80 border border-rose-200 dark:border-red-500/40 p-5 rounded-2xl shadow-sm">
              <div className="text-[11px] text-slate-400 uppercase font-bold">PRIORITY RISK SCORE</div>
              <div className="text-5xl font-black text-rose-600 dark:text-red-500 font-mono tracking-tight">
                94.0 <span className="text-xl text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">HIGH OPERATIONAL IMPACT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Priority Incident & BLUF */}
      {topIncident && (
        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-cyan-500/50 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold mb-1">
                TOP PRIORITY ACTIVE THREAT CAMPAIGN: {topIncident.id}
              </div>
              <h2 className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {topIncident.title}
              </h2>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectIncident(topIncident.id)}
              className="font-mono text-xs font-semibold"
            >
              Investigate Full Technical Dossier
              <ExternalLink className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* Commander BLUF Box */}
          <div className="bg-blue-50/70 dark:bg-slate-950/90 border border-blue-200 dark:border-cyan-500/30 rounded-2xl p-6 shadow-inner">
            <h3 className="text-xs font-mono uppercase tracking-widest text-blue-800 dark:text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" /> BOTTOM LINE UP FRONT (BLUF)
            </h3>
            <div className="text-base leading-relaxed text-slate-800 dark:text-slate-100 font-sans whitespace-pre-line font-medium">
              {topIncident.bluf_summary || (
                "A coordinated cyber intrusion is actively targeting critical domain controller ASSET-104. Four independent feeds corroborate active credential dumping and ongoing command-and-control beaconing to hostile external IP 198.51.100.45. Compromise threatens total command boundary persistence."
              )}
            </div>
          </div>

          {/* Strategic Action Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Immediate Priorities */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> IMMEDIATE COMMANDER PRIORITIES
              </h4>
              <ul className="space-y-2.5 text-xs font-sans text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 dark:text-red-400 font-bold font-mono">1.</span>
                  <span>Isolate <strong>ASSET-104 (Command Server)</strong> at perimeter switch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 dark:text-red-400 font-bold font-mono">2.</span>
                  <span>Implement null-route block on border firewalls for <strong>198.51.100.45</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 dark:text-red-400 font-bold font-mono">3.</span>
                  <span>Force emergency Kerberos ticket-granting service password reset.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 dark:text-red-400 font-bold font-mono">4.</span>
                  <span>Verify telemetry integrity on <strong>ASSET-107 (SCADA Gateway)</strong>.</span>
                </li>
              </ul>
            </div>

            {/* Strategic Asset Exposure */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-cyan-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> AFFECTED STRATEGIC ASSETS
              </h4>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">ASSET-104 (dc-primary.mil.net)</span>
                    <div className="text-[10px] text-slate-400">Command Server / Domain Controller</div>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-red-400">94.0 RISK</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">ASSET-107 (scada-gw-01.grid.local)</span>
                    <div className="text-[10px] text-slate-400">SCADA Telemetry Gateway</div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">86.0 RISK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commander Order Execution Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Watch Commander signature: <strong className="text-slate-800 dark:text-slate-200">Maj. C. Vance // SecOps Command</strong>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={acknowledged ? 'secondary' : 'destructive'}
                size="md"
                onClick={() => setAcknowledged(true)}
                className="font-mono text-xs uppercase tracking-wider"
              >
                {acknowledged ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                    Directive Dispatched to SOC Floor
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Acknowledge & Dispatch Containment Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
