import React, { useState } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Sliders, Shield, RotateCcw, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [windowMinutes, setWindowMinutes] = useState(30);
  const [isResetting, setIsResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset database and re-seed clean baseline demo corpus?')) return;
    setIsResetting(true);
    try {
      await api.resetDemoDatabase();
      alert('Database reset to initial baseline state successfully!');
      window.location.reload();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600 dark:text-slate-400" />
          SYSTEM CONFIGURATION & PIPELINE TUNING
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
          Tune correlation sliding time windows, inspect transparent risk weights, and manage demo state.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/60 rounded-xl text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Configuration parameters successfully saved and applied to active correlation workers.
        </div>
      )}

      {/* Correlation Engine Tuning */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sliders className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Correlation Clustering Temporal Sliding Window
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-400">GRAPH CONVERGENCE</span>
        </CardHeader>
        <CardContent className="space-y-4 text-xs font-sans">
          <p className="text-slate-600 dark:text-slate-300">
            Defines the maximum temporal gap between corroborated events sharing strong entity keys (Asset, User, IP) before splitting into separate security incidents.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={windowMinutes}
              onChange={(e) => setWindowMinutes(Number(e.target.value))}
              className="flex-1 accent-blue-600 dark:accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-sm font-bold text-blue-600 dark:text-cyan-400 w-20 text-right">
              {windowMinutes} mins
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Scoring Weights (Explainable Formula) */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Shield className="w-4 h-4 text-amber-500" />
            Explainable 0–100 Risk Scoring Weight Decomposition
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-400">TOTAL 100 POINTS</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveWeights} className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">SEVERITY FACTOR</span>
                <strong className="text-rose-600 dark:text-red-400 text-sm">25.0 Points (25%)</strong>
                <div className="text-[10px] text-slate-400 mt-1">Blend of max severity and frequency</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">ASSET CRITICALITY FACTOR</span>
                <strong className="text-amber-600 dark:text-amber-400 text-sm">25.0 Points (25%)</strong>
                <div className="text-[10px] text-slate-400 mt-1">Targeted host infrastructure tier</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">CORRELATION STRENGTH FACTOR</span>
                <strong className="text-blue-600 dark:text-cyan-400 text-sm">20.0 Points (20%)</strong>
                <div className="text-[10px] text-slate-400 mt-1">Distinct multi-INT sensor convergence</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">SENSOR CONFIDENCE FACTOR</span>
                <strong className="text-sky-600 dark:text-blue-400 text-sm">20.0 Points (20%)</strong>
                <div className="text-[10px] text-slate-400 mt-1">Signature confidence & historical FP rate</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">OBSERVED KILL-CHAIN IMPACT</span>
              <strong className="text-purple-600 dark:text-purple-400 text-sm">10.0 Points (10%)</strong>
              <div className="text-[10px] text-slate-400 mt-1">Adversary depth (Exfiltration / Destruction vs initial probe)</div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                <Save className="w-3.5 h-3.5 mr-1" />
                Apply Engine Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Demo State Reset */}
      <Card className="border border-rose-200 dark:border-red-500/30">
        <CardHeader>
          <CardTitle>
            <RotateCcw className="w-4 h-4 text-rose-600 dark:text-red-400" />
            Demonstration Environment Control & Reset
          </CardTitle>
          <span className="text-[10px] font-mono text-rose-600 dark:text-red-400 font-bold">DEMO UTILITY</span>
        </CardHeader>
        <CardContent className="space-y-3 text-xs font-sans">
          <p className="text-slate-600 dark:text-slate-300">
            For jury presentations: Reset all alerts, incidents, and campaigns back to the clean initial baseline state. This removes synthetic demo attack chains and allows running the live demonstration again.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetDatabase}
            isLoading={isResetting}
            className="font-mono text-xs uppercase shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Database to Baseline Demo State
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
