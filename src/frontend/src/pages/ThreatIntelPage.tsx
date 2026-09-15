import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Indicator } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { Crosshair, Search, Filter, Globe, Hash, Server, RefreshCw } from 'lucide-react';

export const ThreatIntelPage: React.FC = () => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchIndicators = async () => {
    setIsLoading(true);
    try {
      const data = await api.getThreatIntel({
        indicator_type: typeFilter || undefined,
        search: search || undefined,
      });
      setIndicators(data);
    } catch (err) {
      console.error('Failed to load threat intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [typeFilter]);

  const getIndicatorIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'IP':
        return <Server className="w-4 h-4 text-blue-600 dark:text-cyan-400" />;
      case 'DOMAIN':
        return <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'HASH_SHA256':
        return <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Crosshair className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            THREAT INTELLIGENCE & INDICATORS OF COMPROMISE (IOC)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Verified adversarial infrastructure, malware hashes, and command-and-control nodes from CYBERCOM & NATO feeds.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-blue-50 dark:bg-cyan-950/50 border border-blue-200 dark:border-cyan-500/40 rounded-xl text-xs font-mono text-blue-800 dark:text-cyan-300 shadow-sm font-semibold">
          Total Tracked Indicators: <strong className="text-blue-600 dark:text-cyan-400">{indicators.length}</strong>
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
                onKeyDown={(e) => e.key === 'Enter' && fetchIndicators()}
                placeholder="Search IOC value, threat actor, advisory source..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            >
              <option value="">All Indicator Types</option>
              <option value="IP">IP Address</option>
              <option value="DOMAIN">Domain Name</option>
              <option value="HASH_SHA256">SHA-256 Hash</option>
            </select>

            <Button variant="secondary" size="sm" onClick={fetchIndicators}>
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filter
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={fetchIndicators}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 pl-5">Type</th>
                <th className="p-3.5">Indicator Value</th>
                <th className="p-3.5">Threat Actor Attribution</th>
                <th className="p-3.5">Intel Source</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5 pr-5">First Seen (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono">
                    Loading Threat Intelligence IOC database...
                  </td>
                </tr>
              ) : (
                indicators.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {getIndicatorIcon(ioc.indicator_type)}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ioc.indicator_type}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {ioc.value}
                    </td>
                    <td className="p-3.5 font-mono text-amber-800 dark:text-amber-400 font-bold">
                      {ioc.threat_actor || 'Unknown Group'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {ioc.source}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {ioc.confidence}%
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {ioc.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 pr-5 font-mono text-slate-500 dark:text-slate-400">
                      {formatDate(ioc.first_seen)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
