import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { RootLayout } from './layouts/RootLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AlertsPage } from './pages/AlertsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { ThreatCampaignsPage } from './pages/ThreatCampaignsPage';
import { MitrePage } from './pages/MitrePage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { AssetsPage } from './pages/AssetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CommanderPage } from './pages/CommanderPage';
import { IBMTechPage } from './pages/IBMTechPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { CheckCircle2, Flame, X } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-001');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('CAM-001');
  const [aiMode, setAiMode] = useState<string>('DEMO');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoBanner, setDemoBanner] = useState<string | null>(null);
  const [incidentsCount, setIncidentsCount] = useState(8);

  useEffect(() => {
    // Load AI engine mode
    api.getAIStatus()
      .then((st) => setAiMode(st.mode))
      .catch(() => setAiMode('DEMO'));

    // Count critical threats
    api.getDashboard()
      .then((d) => setIncidentsCount(d.kpis.critical_threats))
      .catch(() => {});
  }, []);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-detail');
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setActiveTab('campaigns');
  };

  const handleGenerateReportForIncident = (id: string) => {
    setSelectedIncidentId(id);
    setActiveTab('reports');
  };

  const handleTriggerDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await api.generateDemoAttack();
      setDemoBanner(
        `Synthetic attack chain 'Operation Nightfall' generated (${res.alerts_generated} alerts). Correlated incident: ${res.incident_id} (Risk: 94.0/100).`
      );
      setSelectedIncidentId(res.incident_id);
      setActiveTab('incident-detail');
    } catch (err: any) {
      alert(`Demo attack error: ${err.message}`);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <RootLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      aiMode={aiMode}
      onTriggerDemo={handleTriggerDemo}
      isDemoLoading={isDemoLoading}
      incidentsCount={incidentsCount}
    >
      {/* Real-time Synthetic Demo Banner Notification */}
      {demoBanner && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-gradient-to-r dark:from-red-950 dark:via-slate-900 dark:to-slate-950 border-2 border-rose-500 rounded-xl flex items-center justify-between shadow-md dark:shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-red-900 flex items-center justify-center text-rose-600 dark:text-red-300">
              <Flame className="w-5 h-5 fill-current text-rose-600 dark:text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-red-400 animate-ping" />
                SYNTHETIC DEMO ATTACK CHAIN ACTIVE
              </span>
              <p className="text-xs text-rose-900 dark:text-slate-200 font-sans mt-0.5">{demoBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setDemoBanner(null)}
            className="p-1 rounded text-rose-500 hover:text-rose-800 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Router */}
      {activeTab === 'dashboard' && (
        <DashboardPage
          onSelectIncident={handleSelectIncident}
          onSelectCampaign={handleSelectCampaign}
          onTriggerDemo={handleTriggerDemo}
          isDemoLoading={isDemoLoading}
        />
      )}

      {activeTab === 'alerts' && <AlertsPage />}

      {activeTab === 'incidents' && (
        <IncidentsPage onSelectIncident={handleSelectIncident} />
      )}

      {activeTab === 'incident-detail' && (
        <IncidentDetailPage
          incidentId={selectedIncidentId}
          onBack={() => setActiveTab('incidents')}
          onSelectCampaign={handleSelectCampaign}
          onGenerateReport={handleGenerateReportForIncident}
        />
      )}

      {activeTab === 'campaigns' && (
        <ThreatCampaignsPage onSelectIncident={handleSelectIncident} />
      )}

      {activeTab === 'mitre' && <MitrePage />}

      {activeTab === 'threat-intel' && <ThreatIntelPage />}

      {activeTab === 'assets' && (
        <AssetsPage onSelectIncident={handleSelectIncident} />
      )}

      {activeTab === 'analytics' && <AnalyticsPage />}

      {activeTab === 'reports' && <ReportsPage />}

      {activeTab === 'commander' && (
        <CommanderPage
          onSelectIncident={handleSelectIncident}
          onOpenAssistant={() => {}}
        />
      )}

      {activeTab === 'ibm-ai' && <IBMTechPage />}

      {activeTab === 'system-health' && <SystemHealthPage />}

      {activeTab === 'settings' && <SettingsPage />}
    </RootLayout>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
