import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Cpu, Bot, Shield, CheckCircle2, Code2, Sparkles, Terminal } from 'lucide-react';

export const IBMTechPage: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    api.getAIStatus().then(setAiStatus).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          IBM TECHNOLOGY ARCHITECTURE & COPILOT ROLES
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
          Detailed technical demarcation between IBM Bob copilot assistance, IBM watsonx NLP intelligence, and Clarion deterministic security logic.
        </p>
      </div>

      {/* Current AI Engine Status Banner */}
      <div className="p-6 rounded-2xl border border-blue-200 dark:border-cyan-500/40 bg-blue-50/70 dark:bg-gradient-to-r dark:from-cyan-950/40 dark:to-[#070b14] flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-700 dark:text-cyan-400 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            LIVE AI PROVIDER STATE
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {aiStatus ? aiStatus.status_message : 'AI MODE: INITIALIZING'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
            Model Engine: <strong className="text-blue-600 dark:text-cyan-300 font-mono">{aiStatus?.model_id || 'Granite 3.x / Local Kernel'}</strong>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-sm">
          Status: <strong className="text-emerald-600 dark:text-emerald-400">ONLINE & GROUNDED</strong>
        </div>
      </div>

      {/* Three Pillar Architecture Demarcation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: IBM Bob */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-blue-500/40 bg-white dark:bg-blue-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-500/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white mb-2">
              IBM Bob (Copilot Layer)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-4">
              Developer copilot environment accelerating hackathon engineering, workflow design, testing, and rapid prototype validation.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Accelerated full-stack development</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Automated test suite generation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Workflow synthesis & rapid iteration</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Architecture contract enforcement</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
            * Developer & Engineering Tooling Role
          </div>
        </div>

        {/* Pillar 2: IBM watsonx.ai */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/40 bg-white dark:bg-cyan-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-cyan-950 border border-sky-200 dark:border-cyan-500/50 flex items-center justify-center text-sky-600 dark:text-cyan-400 mb-3 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white mb-2">
              IBM watsonx.ai (NLP & BLUF)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-4">
              Enterprise generative foundation model layer (Granite 3.x) transforming multi-source raw alerts into structured commander briefings.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Intelligence report comprehension</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Military BLUF brief drafting</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Natural language SOC analyst Q&A</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>ICD-203 vocabulary formatting</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
            * Foundation Model & Generative Briefing
          </div>
        </div>

        {/* Pillar 3: Clarion Engine */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-emerald-500/40 bg-white dark:bg-emerald-950/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white mb-2">
              Clarion Core (Security Engine)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed mb-4">
              Deterministic, auditable cybersecurity logic executing all correlation clustering, risk math, and false positive decisions.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Multi-INT alert feed normalisation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Explainable graph correlation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Deterministic 0–100 risk scoring</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Auditable analyst approvals & FP suppression</span>
              </li>
            </ul>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
            * Deterministic Rules & Auditable Math
          </div>
        </div>
      </div>

      {/* Environment Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Terminal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            watsonx.ai Dynamic Integration Configuration
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-400">ENVIRONMENT VARIABLES</span>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          <p className="font-sans text-slate-600 dark:text-slate-300 text-xs">
            Clarion automatically switches between <strong>DEMO AI</strong> mode (offline deterministic engine) and <strong>WATSONX</strong> mode when these environment variables are supplied:
          </p>

          <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
{`# IBM watsonx.ai Configuration
WATSONX_API_KEY=your_ibm_cloud_iam_api_key
WATSONX_PROJECT_ID=your_watsonx_project_guid
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct`}
          </pre>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-sans">
            <strong>Operational Guarantee:</strong> If credentials are omitted or network connectivity is severed, the system never fails—it seamlessly runs in high-fidelity Demo AI mode.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
