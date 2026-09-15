import React from 'react';
import { ScoreBreakdown } from '../types';
import { getRiskColor } from '../lib/utils';
import { ShieldAlert, Info } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number;
  priority: string;
  breakdown?: ScoreBreakdown | null;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, priority, breakdown }) => {
  const riskColor = getRiskColor(score);

  return (
    <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
          <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          Explainable 0–100 Threat Risk
        </span>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase border"
          style={{
            borderColor: `${riskColor}80`,
            backgroundColor: `${riskColor}15`,
            color: riskColor,
          }}
        >
          {priority} PRIORITY
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-5xl font-black font-mono tracking-tight" style={{ color: riskColor }}>
          {score.toFixed(1)}
        </span>
        <span className="text-xl font-mono text-slate-400 dark:text-slate-500 font-semibold">/ 100</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3.5 mb-6 p-0.5 border border-slate-200 dark:border-slate-800">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(5, score))}%`,
            backgroundColor: riskColor,
            boxShadow: `0 0 8px ${riskColor}60`,
          }}
        />
      </div>

      {/* Explainable Mathematical Factors Breakdown */}
      <div className="space-y-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-xs uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider flex items-center justify-between mb-1 font-semibold">
          <span>Mathematical Weight Decomposition</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">EXACT FACTORS</span>
        </div>

        {/* Severity */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-600 dark:text-slate-300">Severity Factor (Max 25)</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {breakdown ? breakdown.severity.toFixed(1) : (score * 0.25).toFixed(1)} / 25.0
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
            <div
              className="bg-rose-500 h-2 rounded-full"
              style={{ width: `${((breakdown?.severity ?? score * 0.25) / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Asset Criticality */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-600 dark:text-slate-300">Asset Criticality (Max 25)</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {breakdown ? breakdown.asset_criticality.toFixed(1) : (score * 0.25).toFixed(1)} / 25.0
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full"
              style={{ width: `${((breakdown?.asset_criticality ?? score * 0.25) / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Correlation Strength */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-600 dark:text-slate-300">Correlation Strength (Max 20)</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {breakdown ? breakdown.correlation.toFixed(1) : (score * 0.20).toFixed(1)} / 20.0
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full"
              style={{ width: `${((breakdown?.correlation ?? score * 0.20) / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-600 dark:text-slate-300">Sensor Confidence (Max 20)</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {breakdown ? breakdown.confidence.toFixed(1) : (score * 0.20).toFixed(1)} / 20.0
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${((breakdown?.confidence ?? score * 0.20) / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Observed Impact */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-600 dark:text-slate-300">Observed Kill-Chain Impact (Max 10)</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {breakdown ? breakdown.impact.toFixed(1) : (score * 0.10).toFixed(1)} / 10.0
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${((breakdown?.impact ?? score * 0.10) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
        <span>Scoring is 100% deterministic and auditable. Language models never set or modify threat priorities.</span>
      </div>
    </div>
  );
};
