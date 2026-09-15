import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Asset } from '../types';
import { Button } from '../components/ui/Button';
import { getRiskColor } from '../lib/utils';
import { Server, MapPin, Building, RefreshCw } from 'lucide-react';

interface AssetsPageProps {
  onSelectIncident?: (id: string) => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({ onSelectIncident }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const getCriticalityBadge = (crit: string) => {
    switch (crit.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-950/70 dark:text-red-400 dark:border-red-500/50 font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-400 dark:border-amber-500/50 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/70 dark:text-yellow-400 dark:border-yellow-500/50 font-semibold';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-400 dark:border-blue-500/50 font-medium';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            CRITICAL INFRASTRUCTURE ASSET REGISTER
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time asset risk weighting, mission criticality registers, and compromise impact scoring.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchAssets}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Assets Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((ast) => {
          const riskColor = getRiskColor(ast.current_risk);
          const critClass = getCriticalityBadge(ast.criticality);

          return (
            <div
              key={ast.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm space-y-3 flex flex-col justify-between hover:shadow transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">{ast.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${critClass}`}>
                    {ast.criticality}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate" title={ast.hostname}>
                  {ast.hostname}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">{ast.type}</div>

                <div className="space-y-1 mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{ast.owner}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{ast.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">IP:</span>
                    <strong className="text-slate-800 dark:text-slate-300 font-semibold">{ast.ip_address}</strong>
                  </div>
                </div>
              </div>

              {/* Threat Posture Gauge */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-baseline justify-between font-mono mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Calculated Risk</span>
                  <span className="text-base font-bold" style={{ color: riskColor }}>
                    {ast.current_risk.toFixed(1)} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(5, ast.current_risk))}%`, backgroundColor: riskColor }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
