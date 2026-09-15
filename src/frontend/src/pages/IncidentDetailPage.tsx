import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Incident, ScoreBreakdown } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { IncidentTimeline } from '../components/IncidentTimeline';
import { BlufCard } from '../components/BlufCard';
import { formatDate, getPriorityClasses, getStatusClasses } from '../lib/utils';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  FileDown,
  UserCheck,
  MessageSquare,
  Flame,
  Grid,
  Activity,
  Layers,
} from 'lucide-react';

interface IncidentDetailPageProps {
  incidentId: string;
  onBack: () => void;
  onSelectCampaign?: (campaignId: string) => void;
  onGenerateReport?: (incidentId: string) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({
  incidentId,
  onBack,
  onSelectCampaign,
  onGenerateReport,
}) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlufLoading, setIsBlufLoading] = useState(false);

  // Modals for actions
  const [isFpModalOpen, setIsFpModalOpen] = useState(false);
  const [fpReason, setFpReason] = useState('Authorized vulnerability assessment scan executed by internal NetSec team.');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedAnalyst, setAssignedAnalyst] = useState('Maj. C. Vance');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchIncident = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidentDetail(incidentId);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [incidentId]);

  const handleAction = async (action: string, data?: any) => {
    try {
      await api.performIncidentAction(incidentId, action, data);
      fetchIncident();
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    }
  };

  const handleGenerateBluf = async () => {
    setIsBlufLoading(true);
    try {
      await api.generateBluf(incidentId);
      fetchIncident();
    } catch (err: any) {
      alert(`BLUF generation failed: ${err.message}`);
    } finally {
      setIsBlufLoading(false);
    }
  };

  if (isLoading || !incident) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-mono space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading tactical dossier for {incidentId}...</p>
      </div>
    );
  }

  const prioClass = getPriorityClasses(incident.priority);
  const statusClass = getStatusClasses(incident.status);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Incidents
        </button>

        {/* Analyst Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {incident.status !== 'CONFIRMED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction('confirm')}
              className="text-xs font-mono font-bold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Confirm Threat
            </Button>
          )}

          {incident.status !== 'FALSE_POSITIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFpModalOpen(true)}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Mark False Positive
            </Button>
          )}

          {incident.status !== 'ESCALATED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('escalate')}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/60 dark:text-purple-300 dark:hover:bg-purple-950/40 text-xs font-mono"
            >
              <AlertOctagon className="w-3.5 h-3.5 mr-1" />
              Escalate
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            className="text-xs font-mono"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-cyan-400" />
            Assign Analyst
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNoteModalOpen(true)}
            className="text-xs font-mono"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-cyan-400" />
            Add Note
          </Button>

          {onGenerateReport && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onGenerateReport(incident.id)}
              className="text-xs font-mono font-semibold"
            >
              <FileDown className="w-3.5 h-3.5 mr-1" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Dossier */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-[#0c1630] dark:via-[#091024] dark:to-[#070b14] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 font-mono text-xs">
              <span className="text-blue-600 dark:text-cyan-400 font-bold text-base">{incident.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full border font-bold ${prioClass}`}>
                {incident.priority}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border font-bold ${statusClass}`}>
                {incident.status}
              </span>
              {incident.is_synthetic && (
                <span className="bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-cyan-800 text-[10px] font-bold">
                  SYNTHETIC DEMO DATA
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mb-2">
              {incident.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>
                First Seen: <strong className="text-slate-800 dark:text-slate-200">{formatDate(incident.first_seen)}</strong>
              </span>
              <span>
                Last Seen: <strong className="text-slate-800 dark:text-slate-200">{formatDate(incident.last_seen)}</strong>
              </span>
              <span>
                Assigned: <strong className="text-blue-600 dark:text-cyan-400 font-semibold">{incident.assigned_analyst}</strong>
              </span>
              {incident.campaign_id && (
                <button
                  onClick={() => onSelectCampaign && onSelectCampaign(incident.campaign_id!)}
                  className="text-amber-600 hover:underline flex items-center gap-1 font-bold"
                >
                  <Flame className="w-3.5 h-3.5" /> Campaign: {incident.campaign_id}
                </button>
              )}
            </div>
          </div>

          {/* Prominent Risk Score Header Badge */}
          <div className="text-right font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">
              Priority Threat Score
            </div>
            <div className="text-4xl font-black text-rose-600 dark:text-red-400 tracking-tight">
              {incident.risk_score.toFixed(1)}
              <span className="text-base text-slate-400 font-semibold"> / 100</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
              Confidence: {incident.confidence}%
            </div>
          </div>
        </div>

        {/* False positive banner if marked */}
        {incident.status === 'FALSE_POSITIVE' && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-xs font-sans text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Marked False Positive:</strong> {incident.false_positive_reason || 'Classified as benign activity.'}
            </div>
          </div>
        )}
      </div>

      {/* AI BLUF Section */}
      <BlufCard
        blufText={incident.bluf_summary}
        onRegenerate={handleGenerateBluf}
        isLoading={isBlufLoading}
      />

      {/* Two Column Layout: Explainable Scoring & Correlation Reason */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Explainable 0-100 Risk Score Gauge */}
        <RiskScoreGauge
          score={incident.risk_score}
          priority={incident.priority}
          breakdown={incident.score_breakdown as ScoreBreakdown}
        />

        {/* Right Column: Explainable Correlation Justifications */}
        <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                Correlation Justification Breakdown
              </span>
              <span className="text-[10px] text-slate-400 font-mono">EXPLAINABLE LOGIC</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 font-sans">
              The engine grouped these alerts using multi-factor graph convergence over shared entity anchors and temporal windows:
            </p>

            <div className="space-y-2.5">
              {incident.correlation_explanation && incident.correlation_explanation.length > 0 ? (
                incident.correlation_explanation.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-blue-50/70 dark:bg-slate-900/90 border border-blue-200 dark:border-slate-800 text-xs font-mono text-blue-950 dark:text-cyan-200 flex items-start gap-2"
                  >
                    <span className="text-blue-600 dark:text-cyan-400 font-bold">✓</span>
                    <span>{reason}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-slate-400">
                  + Temporal convergence across multi-discipline sensors
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400">
            Automated correlation verified against NSA / CISA threat actor signatures.
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Technique Mapping with Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Grid className="w-4 h-4 text-amber-500" />
            MITRE ATT&CK Behavioral Mapping & Concrete Evidence
          </CardTitle>
          <span className="text-[10px] font-mono text-slate-400">ICD-203 STANDARDS</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {incident.mitre_mappings && incident.mitre_mappings.length > 0 ? (
              incident.mitre_mappings.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-sans space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-800 dark:text-amber-400 uppercase font-bold">
                      {m.tactic}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-cyan-800 font-bold">
                      {m.confidence}% Conf.
                    </span>
                  </div>

                  <div className="font-mono font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="text-blue-600 dark:text-cyan-400">{m.technique_id}</span>
                    <span className="truncate">{m.technique_name}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    <strong>Evidence:</strong> {m.evidence}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-slate-400 font-mono text-xs text-center py-4">
                No techniques mapped to this alert cluster.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chronological Attack Sequence Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Correlated Alert Kill-Chain Sequence ({incident.alerts?.length || incident.alerts_count} Events)
          </CardTitle>
          <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-semibold">CHRONOLOGICAL PROGRESSION</span>
        </CardHeader>
        <CardContent>
          <IncidentTimeline alerts={incident.alerts || []} />
        </CardContent>
      </Card>

      {/* Investigation Notes & Audit Log */}
      {incident.investigation_notes && incident.investigation_notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Analyst Investigation Notes & Audits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {incident.investigation_notes.map((n, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-sans">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                  <span className="text-blue-600 dark:text-cyan-400 font-bold">{n.analyst}</span>
                  <span>{formatDate(n.timestamp)}</span>
                </div>
                <div className="text-slate-800 dark:text-slate-200">{n.note}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modal: Mark False Positive */}
      <Modal
        isOpen={isFpModalOpen}
        onClose={() => setIsFpModalOpen(false)}
        title="Document False Positive Decision"
      >
        <div className="space-y-4 text-xs font-sans">
          <p className="text-slate-600 dark:text-slate-300">
            Documenting the rationale for marking this cluster as a False Positive ensures the suppression engine can adaptively reduce alerts without deleting audit records.
          </p>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-mono text-[11px] mb-1 font-semibold">REASON / JUSTIFICATION</label>
            <textarea
              value={fpReason}
              onChange={(e) => setFpReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-sans focus:bg-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleAction('false_positive', { reason: fpReason });
                setIsFpModalOpen(false);
              }}
            >
              Confirm False Positive
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Assign Analyst */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Investigation Owner"
      >
        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-mono text-[11px] mb-1 font-semibold">ANALYST</label>
            <input
              type="text"
              value={assignedAnalyst}
              onChange={(e) => setAssignedAnalyst(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleAction('assign', { analyst: assignedAnalyst });
                setIsAssignModalOpen(false);
              }}
            >
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Note */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Investigation Finding Note"
      >
        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-mono text-[11px] mb-1 font-semibold">FINDING NOTE</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              placeholder="Record forensic evidence or containment actions taken..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-sans focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (newNote.trim()) {
                  handleAction('add_note', { note: newNote, analyst: 'Maj. C. Vance' });
                  setNewNote('');
                  setIsNoteModalOpen(false);
                }
              }}
            >
              Add Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
