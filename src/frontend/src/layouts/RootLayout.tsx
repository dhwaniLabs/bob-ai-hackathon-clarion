import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AIAssistantModal } from '../components/AIAssistantModal';

interface RootLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiMode: string;
  onTriggerDemo: () => void;
  isDemoLoading: boolean;
  incidentsCount?: number;
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({
  activeTab,
  setActiveTab,
  aiMode,
  onTriggerDemo,
  isDemoLoading,
  incidentsCount = 0,
  children,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        incidentsCount={incidentsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar
          aiMode={aiMode}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onTriggerDemo={onTriggerDemo}
          isDemoLoading={isDemoLoading}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70 dark:bg-[#070b14]">
          {children}
        </main>
      </div>

      {/* Persistent AI Copilot Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        aiMode={aiMode}
      />
    </div>
  );
};
