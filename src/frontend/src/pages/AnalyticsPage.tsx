import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const fetchAnalytics = async (tf: string) => {
    setIsLoading(true);
    try {
      const res = await api.getAnalytics(tf);
      setData(res);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-mono">
        Aggregating operational analytics & trend curves...
      </div>
    );
  }

  const { summary } = data;
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = isDark
    ? { backgroundColor: '#091124', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px' }
    : { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            STRATEGIC DEFENSE & OPERATIONAL ANALYTICS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Ingestion compression ratios, false positive suppression efficacy, and threat risk trajectories.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs shadow-sm">
          {['24h', '7d', '30d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-blue-200 dark:border-cyan-500/30 bg-white dark:bg-[#0b1329] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Alert Compression Rate</div>
          <div className="mt-1 text-3xl font-black font-mono text-blue-600 dark:text-cyan-400">
            {summary.correlation_compression_rate}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Signal-to-noise ratio reduction</div>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-[#0b1329] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">False Positive Rate</div>
          <div className="mt-1 text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {summary.false_positive_rate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Automated benign suppression</div>
        </div>

        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[#0b1329] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Average Risk Score</div>
          <div className="mt-1 text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
            {summary.average_risk_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across active threat clusters</div>
        </div>

        <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#0b1329] shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Incidents</div>
          <div className="mt-1 text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
            {summary.total_incidents}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Correlated from {summary.total_alerts.toLocaleString()} alerts</div>
        </div>
      </div>

      {/* Time-Series Area Chart: Ingested vs Suppressed */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Ingestion Volume vs. Automated False-Positive Suppression ({timeframe.toUpperCase()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="ingestColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="ingested" stroke="#2563eb" fillOpacity={1} fill="url(#ingestColor)" name="Total Raw Ingested" />
                <Area type="monotone" dataKey="fp_suppressed" stroke="#10b981" fillOpacity={1} fill="url(#fpColor)" name="Suppressed False Positives" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Row: Source Distribution & Top MITRE Risk Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Alert Ingestion by Sensor Discipline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.sources}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke={axisStroke} fontSize={11} />
                  <YAxis stroke={axisStroke} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Top MITRE Techniques by Frequency & Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.top_techniques.map((t: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-sans shadow-sm">
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{t.technique}</div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500">{t.count} hits</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        t.risk_impact === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                      }`}
                    >
                      {t.risk_impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
