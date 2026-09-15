import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Incident } from '../types';
import { Button } from '../components/ui/Button';
import { formatDate, getPriorityClasses, getStatusClasses, getRiskColor } from '../lib/utils';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface IncidentsPageProps {
  onSelectIncident: (id: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [isCorrelating, setIsCorrelating] = useState(false);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidents({
        priority: filterPriority || undefined,
        status: filterStatus || undefined,
        search: search || undefined,
      });
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [filterPriority, filterStatus]);

  const handleRunCorrelation = async () => {
    setIsCorrelating(true);
    try {
      await fetch('/api/demo/correlate-now', { method: 'POST' });
      fetchIncidents();
    } catch (err) {
      console.error('Correlation error:', err);
    } finally {
      setIsCorrelating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-red-400" />
            CORRELATED THREAT INCIDENTS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Automated multi-factor clusters with transparent risk scoring and explainable justifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunCorrelation}
            isLoading={isCorrelating}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-cyan-500/50 dark:text-cyan-300 font-mono text-xs"
          >
            <Layers className="w-4 h-4 mr-1.5 text-blue-600 dark:text-cyan-400" />
            Run Correlation Cycle
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchIncidents()}
                placeholder="Search incident title, ID, analyst..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CONFIRMED">Confirmed Threat</option>
              <option value="FALSE_POSITIVE">False Positive</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <Button variant="secondary" size="sm" onClick={fetchIncidents}>
              <Filter className="w-3.5 h-3.5 mr-1" />
              Apply Filter
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={fetchIncidents}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 pl-5">Priority</th>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Threat Title</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Alerts</th>
                <th className="p-3.5">Assets</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Analyst</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono">
                    Loading correlated security clusters...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono">
                    No incidents match current filter criteria.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const prioClass = getPriorityClasses(inc.priority);
                  const statusClass = getStatusClasses(inc.status);
                  const riskColor = getRiskColor(inc.risk_score);

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${prioClass}`}>
                          {inc.priority}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-cyan-400">
                        {inc.id}
                        {inc.is_synthetic && (
                          <span className="ml-1 text-[8px] bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 px-1 py-0.5 rounded border border-blue-200 dark:border-cyan-800 font-bold">
                            DEMO
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-200">
                        <div className="truncate max-w-sm" title={inc.title}>
                          {inc.title}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-sm" style={{ color: riskColor }}>
                        {inc.risk_score.toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {inc.confidence}%
                      </td>
                      <td className="p-3.5 font-mono text-blue-600 dark:text-cyan-400 font-bold">
                        {inc.alerts_count}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {inc.affected_assets_count} Host(s)
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${statusClass}`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {inc.assigned_analyst}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform font-bold">
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
