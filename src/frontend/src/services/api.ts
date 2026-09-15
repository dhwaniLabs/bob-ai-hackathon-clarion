import {
  Alert,
  Incident,
  Campaign,
  Asset,
  Indicator,
  MitreTechnique,
  Report,
  DashboardData,
  IngestionStats,
  BLUFResponse,
  SystemHealthData,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.detail || err.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<DashboardData>('/dashboard'),

  // Alerts
  getAlerts: (params?: { severity?: string; source?: string; asset_id?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.source) query.set('source', params.source);
    if (params?.asset_id) query.set('asset_id', params.asset_id);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    return fetchJson<Alert[]>(`/alerts?${query.toString()}`);
  },

  createAlert: (alertData: Partial<Alert>) =>
    fetchJson<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    }),

  uploadAlerts: async (file: File): Promise<IngestionStats> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/alerts/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  // Incidents
  getIncidents: (params?: { priority?: string; status?: string; campaign_id?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.priority) query.set('priority', params.priority);
    if (params?.status) query.set('status', params.status);
    if (params?.campaign_id) query.set('campaign_id', params.campaign_id);
    if (params?.search) query.set('search', params.search);
    return fetchJson<Incident[]>(`/incidents?${query.toString()}`);
  },

  getIncidentDetail: (id: string) => fetchJson<Incident>(`/incidents/${id}`),

  generateBluf: (id: string) =>
    fetchJson<BLUFResponse>(`/incidents/${id}/bluf`, {
      method: 'POST',
    }),

  recalculateScore: (id: string) =>
    fetchJson<{ message: string; score_breakdown: any }>(`/incidents/${id}/score`, {
      method: 'POST',
    }),

  reCorrelateIncident: (id: string) =>
    fetchJson<{ message: string; correlation_explanation: string[]; mitre_mappings: any }>(`/incidents/${id}/correlate`, {
      method: 'POST',
    }),

  performIncidentAction: (id: string, action: string, data?: { reason?: string; analyst?: string; note?: string }) =>
    fetchJson<{ status: string; action: string; incident_id: string; new_status: string; new_priority: string }>(`/incidents/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    }),

  // Campaigns
  getCampaigns: () => fetchJson<Campaign[]>('/campaigns'),
  getCampaignDetail: (id: string) => fetchJson<Campaign>(`/campaigns/${id}`),

  // Assets
  getAssets: () => fetchJson<Asset[]>('/assets'),
  getAssetDetail: (id: string) => fetchJson<Asset>(`/assets/${id}`),

  // MITRE
  getMitreTechniques: () => fetchJson<MitreTechnique[]>('/mitre'),
  getMitreMatrix: () => fetchJson<Record<string, Array<{ id: string; name: string; severity_hint: string; observed_count: number }>>>('/mitre/matrix'),

  // Threat Intel
  getThreatIntel: (params?: { indicator_type?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.indicator_type) query.set('indicator_type', params.indicator_type);
    if (params?.search) query.set('search', params.search);
    return fetchJson<Indicator[]>(`/threat-intelligence?${query.toString()}`);
  },

  // Analytics
  getAnalytics: (timeframe = '24h') => fetchJson<any>(`/analytics?timeframe=${timeframe}`),

  // Reports
  getReports: () => fetchJson<Report[]>('/reports'),
  getReportDetail: (id: string) => fetchJson<Report>(`/reports/${id}`),
  generateReport: (data: { title: string; report_type: string; incident_id?: string; notes?: string }) =>
    fetchJson<Report>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI & Assistant
  getAIStatus: () => fetchJson<{ mode: string; configured: boolean; model_id: string; url: string; status_message: string }>('/ai/status'),
  chatAI: (prompt: string, incident_id?: string) =>
    fetchJson<{ response: string; ai_mode: string; model_id: string; sources_cited: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, incident_id }),
    }),

  // Demo Mode
  generateDemoAttack: () =>
    fetchJson<{
      status: string;
      message: string;
      campaign_id: string;
      campaign_name: string;
      incident_id: string;
      alerts_generated: number;
      risk_score: number;
      priority: string;
      confidence: number;
      affected_assets: string[];
      is_synthetic: boolean;
    }>('/demo/generate', {
      method: 'POST',
    }),

  resetDemoDatabase: () =>
    fetchJson<{ status: string; message: string }>('/demo/reset', {
      method: 'POST',
    }),

  // System Health
  getSystemHealth: () => fetchJson<SystemHealthData>('/system-health'),
};
