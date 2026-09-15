import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MITREMatrix } from '../components/MITREMatrix';
import { MitreTechnique } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Grid, ShieldAlert, Crosshair } from 'lucide-react';

export const MitrePage: React.FC = () => {
  const [matrix, setMatrix] = useState<Record<string, any>>({});
  const [techniques, setTechniques] = useState<MitreTechnique[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMitre = async () => {
      try {
        const [m, t] = await Promise.all([api.getMitreMatrix(), api.getMitreTechniques()]);
        setMatrix(m);
        setTechniques(t);
      } catch (err) {
        console.error('Failed to load MITRE:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMitre();
  }, []);

  const totalObserved = techniques.reduce((sum, t) => sum + t.observed_count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-amber-500" />
            MITRE ATT&CK ENTERPRISE DEFENSE MATRIX
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Tactical adversary behavioral mapping across 14 enterprise tactics and verified evidence signatures.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
            Loaded: <strong className="text-blue-600 dark:text-cyan-400 font-bold">{techniques.length}</strong> Techniques
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-red-950/60 border border-rose-200 dark:border-red-800/60 text-rose-700 dark:text-red-400 shadow-sm">
            Active Hits: <strong className="text-rose-900 dark:text-white font-bold">{totalObserved}</strong> Observed
          </div>
        </div>
      </div>

      {/* Interactive Matrix View */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Crosshair className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Enterprise Tactics Matrix (Red Highlights Indicate Observed Activity)
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-400">HORIZONTAL SCROLLABLE MATRIX</span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-mono">Loading MITRE Matrix...</div>
          ) : (
            <MITREMatrix matrix={matrix} />
          )}
        </CardContent>
      </Card>

      {/* Observed Techniques Evidence Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-red-400" />
            Observed Techniques Breakdown with Evidence Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techniques
              .filter((t) => t.observed_count > 0)
              .map((tech) => (
                <div
                  key={tech.id}
                  className="bg-white dark:bg-slate-950/80 border border-rose-200 dark:border-red-500/40 rounded-xl p-4 text-xs font-sans space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-800 dark:text-amber-400 font-bold uppercase">{tech.tactic}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white dark:bg-red-500 dark:text-black font-extrabold text-[10px]">
                      {tech.observed_count} HITS
                    </span>
                  </div>

                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-blue-600 dark:text-cyan-400 font-bold">{tech.id}</span>
                    <span>{tech.name}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3">
                    {tech.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-900 text-[11px] font-mono text-slate-400">
                    Confidence: <strong className="text-emerald-600 dark:text-emerald-400">High (Corroborated)</strong>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
