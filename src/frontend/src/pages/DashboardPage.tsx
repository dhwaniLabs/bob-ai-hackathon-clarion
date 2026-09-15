import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getPriorityClasses, getStatusClasses, getRiskColor } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldAlert,
  AlertTriangle,
  BellRing,
  Layers,
  FilterX,
  Server,
  Flame,
  Activity,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardPageProps {
  onSelectIncident: (incidentId: string) => void;
  onSelectCampaign: (campaignId: string) => void;
  onTriggerDemo: () => void;
  isDemoLoading: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectIncident,
  onSelectCampaign,
  onTriggerDemo,
  isDemoLoading,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-sm text-blue-600 dark:text-cyan-400">Loading Clarion Command Floor Telemetry...</p>
      </div>
    );
  }

  const { kpis } = data;
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = isDark
    ? { backgroundColor: '#091124', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Operational Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-600 dark:text-red-400 font-bold">
              THREAT POSTURE LEVEL: DEFCON 2 // CRITICAL
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
            OPERATIONAL THREAT COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time multi-INT telemetry fusion, automated explainable clustering, and commander prioritisation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={onTriggerDemo}
            isLoading={isDemoLoading}
            className="font-mono tracking-wider text-xs uppercase shadow-sm"
          >
            <Flame className="w-4 h-4 mr-1.5 fill-current text-amber-200 animate-pulse" />
            Generate Demo Attack
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Critical Threats */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-red-500/40 bg-rose-50/70 dark:bg-red-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-700 dark:text-red-400 font-bold flex items-center justify-between">
            <span>Critical Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-red-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-rose-700 dark:text-red-500 tracking-tight">
            {kpis.critical_threats}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Immediate action</div>
        </div>

        {/* High Priority */}
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold flex items-center justify-between">
            <span>High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-amber-700 dark:text-amber-500 tracking-tight">
            {kpis.high_priority}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">SOC watch queue</div>
        </div>

        {/* Total Alerts */}
        <div className="p-4 rounded-xl border border-sky-200 dark:border-blue-500/40 bg-sky-50/70 dark:bg-blue-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-800 dark:text-cyan-400 font-bold flex items-center justify-between">
            <span>Total Alerts</span>
            <BellRing className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-sky-700 dark:text-cyan-300 tracking-tight">
            {kpis.total_alerts.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">7 multi-INT feeds</div>
        </div>

        {/* Correlated Incidents */}
        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-500/40 bg-purple-50/70 dark:bg-purple-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-purple-800 dark:text-purple-400 font-bold flex items-center justify-between">
            <span>Correlated</span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-purple-700 dark:text-purple-400 tracking-tight">
            {kpis.correlated_incidents}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Graph clusters</div>
        </div>

        {/* False Positive Rate */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-between">
            <span>FP Suppression</span>
            <FilterX className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 tracking-tight">
            {kpis.false_positive_rate}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Filtered noise</div>
        </div>

        {/* Affected Assets */}
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/70 dark:bg-indigo-950/10 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-800 dark:text-indigo-400 font-bold flex items-center justify-between">
            <span>Affected Assets</span>
            <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-black font-mono text-indigo-700 dark:text-indigo-300 tracking-tight">
            {kpis.affected_assets}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Critical tier hosts</div>
        </div>
      </div>

      {/* Row 1: Charts (Alerts Over Time & Severity Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Over Time Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Alert Ingestion & Correlation Velocity (24 Hours)
            </CardTitle>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">HOURLY BUCKETS</span>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.alerts_over_time}>
                  <defs>
                    <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                  <YAxis stroke={axisStroke} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="alerts" stroke="#2563eb" fillOpacity={1} fill="url(#alertGrad)" name="Raw Ingestion" />
                  <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#threatGrad)" name="Correlated Threats" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Threat Severity Distribution
            </CardTitle>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">RATIO</span>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.severity_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {data.severity_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              {data.severity_distribution.map((s) => (
                <div key={s.severity} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{s.severity}:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Threat Sources & Top MITRE Techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Sources Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Multi-Source Ingestion Feeds
            </CardTitle>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">DISTRIBUTED DISCIPLINE</span>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.threat_sources} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis type="number" stroke={axisStroke} fontSize={11} />
                  <YAxis type="category" dataKey="source" stroke={axisStroke} fontSize={11} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* MITRE Technique Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Observed MITRE ATT&CK Techniques
            </CardTitle>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">TACTICAL FREQUENCY</span>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mitre_technique_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="technique" stroke={axisStroke} fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke={axisStroke} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Active Threats Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-red-400" />
            Active Correlated Threats & Prioritised Incidents
          </CardTitle>
          <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-semibold">CLICK ROW TO INVESTIGATE</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Priority</th>
                  <th className="p-3.5">Incident</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Affected Assets</th>
                  <th className="p-3.5">MITRE Technique</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {data.active_threats.map((threat) => {
                  const prioClass = getPriorityClasses(threat.priority);
                  const statusClass = getStatusClasses(threat.status);
                  const riskColor = getRiskColor(threat.risk_score);

                  return (
                    <tr
                      key={threat.id}
                      onClick={() => onSelectIncident(threat.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${prioClass}`}>
                          {threat.priority}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-600 dark:text-cyan-400 text-xs font-bold">{threat.id}</span>
                          <span className="truncate max-w-xs">{threat.title}</span>
                          {threat.is_synthetic && (
                            <span className="text-[9px] font-mono bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-cyan-800 font-bold">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-sm" style={{ color: riskColor }}>
                        {threat.risk_score.toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {threat.confidence}%
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {threat.affected_assets_count} Host(s)
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={threat.mitre_technique}>
                        {threat.mitre_technique}
                      </td>
                      <td className="p-3.5 font-mono text-blue-600 dark:text-cyan-400 text-[11px] font-medium">
                        {threat.source}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${statusClass}`}>
                          {threat.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform font-bold">
                          Investigate <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
