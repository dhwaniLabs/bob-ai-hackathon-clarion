import React, { useState } from 'react';
import { MitreTechnique } from '../types';
import { Modal } from './ui/Modal';

interface MITREMatrixProps {
  matrix: Record<string, Array<{ id: string; name: string; severity_hint: string; observed_count: number }>>;
  onSelectTechnique?: (techniqueId: string) => void;
}

export const MITREMatrix: React.FC<MITREMatrixProps> = ({ matrix, onSelectTechnique }) => {
  const [selectedTech, setSelectedTech] = useState<any>(null);

  const tactics = Object.keys(matrix);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex gap-3 min-w-full">
        {tactics.map((tactic) => {
          const techniques = matrix[tactic] || [];
          const totalHits = techniques.reduce((acc, t) => acc + t.observed_count, 0);

          return (
            <div
              key={tactic}
              className="w-52 flex-shrink-0 bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col overflow-hidden shadow-sm"
            >
              {/* Tactic Column Header */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-blue-600 dark:text-cyan-400 font-bold">
                    TACTIC
                  </span>
                  {totalHits > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold dark:bg-red-950 dark:text-red-400 dark:border-red-800/60">
                      {totalHits} HITS
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={tactic}>
                  {tactic}
                </h4>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {techniques.length} techniques
                </div>
              </div>

              {/* Techniques List */}
              <div className="p-2 space-y-2 flex-1 max-h-[520px] overflow-y-auto">
                {techniques.map((t) => {
                  const hasHits = t.observed_count > 0;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTech(t);
                        if (onSelectTechnique) onSelectTechnique(t.id);
                      }}
                      className={`p-2.5 rounded-lg text-left transition-all cursor-pointer border text-xs font-sans ${
                        hasHits
                          ? 'bg-rose-50/90 border-rose-200 text-slate-900 font-medium shadow-sm hover:border-rose-400 dark:bg-red-950/40 dark:border-red-500/50 dark:text-slate-100'
                          : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300 text-slate-500 dark:bg-slate-900/40 dark:border-slate-800/60 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 font-mono text-[10px]">
                        <span className={hasHits ? 'text-rose-600 dark:text-red-400 font-bold' : 'text-slate-400'}>
                          {t.id}
                        </span>
                        {hasHits && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white dark:bg-red-500 dark:text-black font-bold text-[9px]">
                            {t.observed_count} OBSERVED
                          </span>
                        )}
                      </div>
                      <div className="font-semibold line-clamp-2 leading-tight">
                        {t.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Technique Modal Detail */}
      <Modal
        isOpen={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        title={`MITRE ATT&CK: ${selectedTech?.id} — ${selectedTech?.name}`}
      >
        {selectedTech && (
          <div className="space-y-4 font-sans text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-bold dark:bg-red-950 dark:text-red-400 dark:border-red-800/50">
                Observed Hits: {selectedTech.observed_count}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                Severity: {selectedTech.severity_hint}
              </span>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono text-slate-500 dark:text-slate-400 mb-1 font-semibold">Description</h4>
              <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                Adversary technique observed within the environment targeting system integrity and operational state.
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-cyan-950/30 border border-blue-200 dark:border-cyan-800/40 rounded-xl text-xs text-blue-800 dark:text-cyan-200">
              Correlated in active incident response investigations. Refer to the Incidents tab to review specific evidence alerts for this technique.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
