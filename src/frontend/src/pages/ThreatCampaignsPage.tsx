import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Campaign } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatDate, getStatusClasses, getRiskColor } from '../lib/utils';
import {
  Flame,
  ShieldAlert,
  Grid,
  ChevronRight,
  Activity,
} from 'lucide-react';

interface ThreatCampaignsPageProps {
  onSelectIncident: (id: string) => void;
}

export const ThreatCampaignsPage: React.FC<ThreatCampaignsPageProps> = ({ onSelectIncident }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) {
        const detail = await api.getCampaignDetail(data[0].id);
        setSelectedCampaign(detail);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSelectCampaign = async (c: Campaign) => {
    try {
      const detail = await api.getCampaignDetail(c.id);
      setSelectedCampaign(detail);
    } catch (err) {
      setSelectedCampaign(c);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          ADVANCED THREAT CAMPAIGN DETECTION
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
          Strategic correlation of multiple incident clusters attributed to coordinated Advanced Persistent Threat (APT) campaigns.
        </p>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const isSelected = selectedCampaign?.id === camp.id;
          const riskColor = getRiskColor(camp.risk_score);
          const statusClass = getStatusClasses(camp.status);

          return (
            <div
              key={camp.id}
              onClick={() => handleSelectCampaign(camp)}
              className={`rounded-2xl p-5 border-2 transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:border-cyan-500 dark:bg-cyan-950/20 shadow-md'
                  : 'bg-white dark:bg-[#0b1329] border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">{camp.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${statusClass}`}>
                      {camp.status}
                    </span>
                    {camp.is_synthetic && (
                      <span className="text-[9px] font-mono bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-cyan-800 font-bold">
                        SYNTHETIC DEMO
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">{camp.name}</h3>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-mono mt-0.5 font-bold">{camp.threat_actor}</div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-2xl font-black" style={{ color: riskColor }}>
                    {camp.risk_score.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400">Risk Score</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mb-4 line-clamp-2">
                {camp.description}
              </p>

              {/* Metrics row */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center font-mono text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">ALERTS</div>
                  <div className="font-bold text-blue-600 dark:text-cyan-400">{camp.alerts_count}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">ASSETS</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{camp.assets_count}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">CONFIDENCE</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{camp.confidence}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">TECHNIQUES</div>
                  <div className="font-bold text-amber-700 dark:text-amber-400">{camp.mitre_techniques.length}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Detailed Dossier */}
      {selectedCampaign && (
        <Card className="border border-blue-200 dark:border-cyan-500/30 shadow-sm">
          <CardHeader>
            <CardTitle>
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Strategic Campaign Investigation: {selectedCampaign.name} ({selectedCampaign.id})
            </CardTitle>
            <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">CONNECTED INTEL</span>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Attribution & Timeline summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">THREAT ACTOR</span>
                <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">{selectedCampaign.threat_actor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">TIME WINDOW</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {formatDate(selectedCampaign.first_seen)} → {formatDate(selectedCampaign.last_seen)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">STRATEGIC RISK POSTURE</span>
                <span className="text-rose-600 dark:text-red-400 font-bold text-sm">
                  {selectedCampaign.risk_score}/100 (CRITICAL CAMPAIGN)
                </span>
              </div>
            </div>

            {/* MITRE ATT&CK Matrix for this Campaign */}
            <div>
              <h4 className="text-xs uppercase font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-semibold">
                <Grid className="w-3.5 h-3.5 text-amber-500" /> Attributed MITRE ATT&CK Techniques:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCampaign.mitre_techniques.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50 font-mono text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Correlated Incidents */}
            <div>
              <h4 className="text-xs uppercase font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-red-400" /> Correlated Security Incidents in Campaign:
              </h4>
              <div className="space-y-2">
                {selectedCampaign.incidents && selectedCampaign.incidents.length > 0 ? (
                  selectedCampaign.incidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc.id)}
                      className="p-3 bg-white hover:bg-blue-50/70 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-blue-600 dark:text-cyan-400 font-bold">{inc.id}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-sans font-medium">{inc.title}</span>
                        <span className="text-slate-400">({inc.alerts_count} alerts)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-rose-600 dark:text-red-400">
                          {inc.risk_score.toFixed(1)} / 100
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 font-mono text-xs">
                    Linked primary incident: <button onClick={() => onSelectIncident('INC-001')} className="text-blue-600 dark:text-cyan-400 hover:underline font-bold">INC-001</button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
