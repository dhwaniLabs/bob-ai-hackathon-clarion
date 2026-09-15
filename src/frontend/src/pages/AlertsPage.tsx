import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Alert, IngestionStats } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDate, getSeverityClasses } from '../lib/utils';
import {
  BellRing,
  Upload,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStats, setUploadStats] = useState<IngestionStats | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Manual Alert Form State
  const [manualForm, setManualForm] = useState<{
    source: string;
    source_type: string;
    event_type: string;
    severity: Alert['severity'];
    hostname: string;
    asset_id: string;
    src_ip: string;
    dst_ip: string;
    user: string;
    description: string;
  }>({
    source: 'SIEM',
    source_type: 'authentication',
    event_type: 'suspicious_login',
    severity: 'high',
    hostname: 'dc-primary.mil.net',
    asset_id: 'ASSET-104',
    src_ip: '198.51.100.45',
    dst_ip: '10.10.4.10',
    user: 'admin_svc',
    description: 'Manual tactical inject: Anomalous privileged logon detected.',
  });

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAlerts({
        severity: filterSeverity || undefined,
        source: filterSource || undefined,
        search: search || undefined,
        limit: 100,
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterSeverity, filterSource]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const stats = await api.uploadAlerts(uploadFile);
      setUploadStats(stats);
      fetchAlerts();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAlert(manualForm);
      setIsManualOpen(false);
      fetchAlerts();
    } catch (err: any) {
      alert(`Error creating alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            MULTI-SOURCE ALERT INGESTION & NORMALISATION
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Parses heterogeneous security feeds into standard schema with automated deduplication.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5 text-blue-600 dark:text-cyan-400" />
            Ingest Feed (CSV/JSON)
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsManualOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Manual Alert Inject
          </Button>
        </div>
      </div>

      {/* Ingestion Statistics Banner if Uploaded */}
      {uploadStats && (
        <div className="bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-500/50 rounded-2xl p-4 animate-fade-in shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-blue-800 dark:text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              INGESTION PIPELINE EXECUTION REPORT
            </span>
            <button
              onClick={() => setUploadStats(null)}
              className="text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white font-mono"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3 text-center text-xs font-mono">
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-400 text-[10px]">RECEIVED</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{uploadStats.records_received}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-400 text-[10px]">VALIDATED</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{uploadStats.valid_records}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-400 text-[10px]">NEW ALERTS</div>
              <div className="text-base font-bold text-blue-600 dark:text-cyan-400">{uploadStats.new_alerts}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-400 text-[10px]">DUPLICATES</div>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">{uploadStats.duplicates}</div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-slate-400 text-[10px]">INVALID</div>
              <div className="text-base font-bold text-rose-600 dark:text-red-400">{uploadStats.invalid_records}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search alert description, IP, user, hostname..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>

            {/* Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            >
              <option value="">All Sources</option>
              <option value="SIEM">SIEM</option>
              <option value="Firewall">Firewall</option>
              <option value="IDS">IDS</option>
              <option value="Endpoint">Endpoint</option>
              <option value="Network Sensor">Network Sensor</option>
              <option value="Satellite Feed">Satellite Feed</option>
              <option value="Intelligence Report">Intelligence Report</option>
            </select>

            <Button type="submit" variant="secondary" size="sm">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Apply Filter
            </Button>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </form>
      </div>

      {/* Alerts Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 pl-5">Alert ID</th>
                <th className="p-3.5">Time (UTC)</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Target Asset / Host</th>
                <th className="p-3.5">Origin IP / User</th>
                <th className="p-3.5 pr-5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono">
                    Loading alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500 font-mono">
                    No alerts found matching current filters.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => {
                  const sevClass = getSeverityClasses(alert.severity);

                  return (
                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="p-3.5 pl-5 font-mono text-blue-600 dark:text-cyan-400 font-bold">
                        {alert.id}
                        {alert.is_synthetic && (
                          <span className="ml-1 text-[8px] bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 px-1 py-0.5 rounded border border-blue-200 dark:border-cyan-800 font-bold">
                            DEMO
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(alert.timestamp)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase font-bold ${sevClass}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {alert.source}
                      </td>
                      <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                        {alert.event_type}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{alert.hostname || 'N/A'}</div>
                        {alert.asset_id && (
                          <div className="text-[10px] text-slate-400">{alert.asset_id}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        <div>{alert.src_ip || '—'}</div>
                        {alert.user && <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">{alert.user}</div>}
                      </td>
                      <td className="p-3.5 pr-5 text-slate-600 dark:text-slate-300 max-w-sm truncate" title={alert.description}>
                        {alert.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Feed Ingestion (CSV / JSON) */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadFile(null);
        }}
        title="Ingest Multi-Source Threat Feed"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Upload CSV or JSON alert exports from SIEM, EDR, Firewall, Satellite feeds, or network sensors.
            The pipeline will validate, parse, normalize, and store alerts in the database.
          </p>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500/60 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept=".csv,.json,.jsonl"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
              <Upload className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {uploadFile ? uploadFile.name : 'Click or Drag & Drop Threat File'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Supports .CSV, .JSON, .JSONL</div>
            </label>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-800">
            <div className="font-semibold text-slate-800 dark:text-slate-300 mb-1">Standard Schema Attributes:</div>
            <div>id, timestamp, source, source_type, event_type, severity, src_ip, dst_ip, user, hostname, asset_id, description</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFileUpload}
              disabled={!uploadFile}
              isLoading={isUploading}
            >
              Parse & Ingest Feed
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Manual Alert Injection */}
      <Modal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Manual Threat Alert Injection"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">SOURCE</label>
              <select
                value={manualForm.source}
                onChange={(e) => setManualForm({ ...manualForm, source: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              >
                <option value="SIEM">SIEM</option>
                <option value="Firewall">Firewall</option>
                <option value="IDS">IDS</option>
                <option value="Endpoint">Endpoint</option>
                <option value="Network Sensor">Network Sensor</option>
                <option value="Satellite Feed">Satellite Feed</option>
                <option value="Intelligence Report">Intelligence Report</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">SEVERITY</label>
              <select
                value={manualForm.severity}
                onChange={(e) => setManualForm({ ...manualForm, severity: e.target.value as Alert['severity'] })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">EVENT TYPE</label>
              <input
                type="text"
                value={manualForm.event_type}
                onChange={(e) => setManualForm({ ...manualForm, event_type: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">SOURCE TYPE</label>
              <input
                type="text"
                value={manualForm.source_type}
                onChange={(e) => setManualForm({ ...manualForm, source_type: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">TARGET HOSTNAME</label>
              <input
                type="text"
                value={manualForm.hostname}
                onChange={(e) => setManualForm({ ...manualForm, hostname: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">ASSET ID</label>
              <input
                type="text"
                value={manualForm.asset_id}
                onChange={(e) => setManualForm({ ...manualForm, asset_id: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">SOURCE IP</label>
              <input
                type="text"
                value={manualForm.src_ip}
                onChange={(e) => setManualForm({ ...manualForm, src_ip: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">DEST IP</label>
              <input
                type="text"
                value={manualForm.dst_ip}
                onChange={(e) => setManualForm({ ...manualForm, dst_ip: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">USER</label>
              <input
                type="text"
                value={manualForm.user}
                onChange={(e) => setManualForm({ ...manualForm, user: e.target.value })}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-mono text-[11px] font-semibold">DESCRIPTION</label>
            <textarea
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-100 font-sans focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsManualOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Inject Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
