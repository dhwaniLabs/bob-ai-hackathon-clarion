export interface Alert {
  id: string;
  timestamp: string;
  source: string;
  source_type: string;
  event_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  src_ip?: string | null;
  dst_ip?: string | null;
  user?: string | null;
  hostname?: string | null;
  asset_id?: string | null;
  description: string;
  raw_data?: string | null;
  incident_id?: string | null;
  mitre_technique_id?: string | null;
  is_synthetic: boolean;
}

export interface ScoreBreakdown {
  severity: number;
  asset_criticality: number;
  correlation: number;
  confidence: number;
  impact: number;
  total: number;
  priority?: string;
}

export interface MitreMappingItem {
  tactic: string;
  technique_id: string;
  technique_name: string;
  confidence: number;
  evidence: string;
  is_suspected?: boolean;
}

export interface InvestigationNote {
  timestamp: string;
  analyst: string;
  note: string;
}

export interface Incident {
  id: string;
  title: string;
  status: 'ACTIVE' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_score: number;
  confidence: number;
  campaign_id?: string | null;
  assigned_analyst: string;
  first_seen: string;
  last_seen: string;
  affected_assets_count: number;
  alerts_count: number;
  score_breakdown?: ScoreBreakdown | null;
  correlation_explanation?: string[] | null;
  mitre_mappings?: MitreMappingItem[] | null;
  bluf_summary?: string | null;
  is_synthetic: boolean;
  alerts?: Alert[];
  investigation_notes?: InvestigationNote[];
  false_positive_reason?: string | null;
}

export interface BLUFResponse {
  incident_id: string;
  bottom_line: string;
  what_happened: string;
  why_it_matters: string;
  affected_assets: string[];
  confidence_level: string;
  relevant_mitre_techniques: string[];
  recommended_priority: string;
  recommended_actions: string[];
  ai_provider: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  threat_actor: string;
  risk_score: number;
  confidence: number;
  first_seen: string;
  last_seen: string;
  description?: string | null;
  alerts_count: number;
  assets_count: number;
  mitre_techniques: string[];
  is_synthetic: boolean;
  incidents?: Incident[];
}

export interface Asset {
  id: string;
  hostname: string;
  type: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  owner: string;
  location: string;
  ip_address: string;
  status: string;
  current_risk: number;
  created_at: string;
  updated_at: string;
  incident_count: number;
}

export interface Indicator {
  id: string;
  indicator_type: string;
  value: string;
  threat_actor?: string | null;
  source: string;
  confidence: number;
  first_seen: string;
  last_seen: string;
  tags: string;
  is_active: boolean;
  description?: string | null;
}

export interface MitreTechnique {
  id: string;
  tactic: string;
  name: string;
  subtechnique_of?: string | null;
  description: string;
  detection_guidance?: string | null;
  severity_hint: string;
  observed_count: number;
}

export interface Report {
  id: string;
  title: string;
  report_type: string;
  incident_id?: string | null;
  generated_by: string;
  created_at: string;
  summary: string;
  content_html: string;
}

export interface DashboardKPIs {
  critical_threats: number;
  high_priority: number;
  total_alerts: number;
  correlated_incidents: number;
  false_positive_rate: number;
  affected_assets: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  severity_distribution: Array<{ severity: string; count: number; color: string }>;
  alerts_over_time: Array<{ time: string; alerts: number; threats: number }>;
  threat_sources: Array<{ source: string; count: number }>;
  mitre_technique_distribution: Array<{ technique: string; count: number; tactic: string }>;
  threat_risk_trend: Array<{ period: string; average_risk: number; peak_risk: number }>;
  top_affected_assets: Array<{ id: string; hostname: string; type: string; criticality: string; risk_score: number; status: string }>;
  active_threats: Array<any>;
}

export interface IngestionStats {
  records_received: number;
  valid_records: number;
  invalid_records: number;
  duplicates: number;
  new_alerts: number;
  details?: string | null;
}

export interface SystemHealthData {
  system_status: string;
  database: { name: string; status: string; latency_ms: number; details: string };
  api: { name: string; status: string; latency_ms: number; details: string };
  ai_engine: { name: string; status: string; latency_ms: number; details: string };
  correlation_engine: { name: string; status: string; latency_ms: number; details: string };
  mitre_knowledge: { name: string; status: string; latency_ms: number; details: string };
  ingestion_pipeline: { name: string; status: string; latency_ms: number; details: string };
  uptime_seconds: number;
  last_processed_event: string;
  total_alerts_processed: number;
}
