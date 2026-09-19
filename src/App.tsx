/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SafeGridProvider, useSafeGrid } from './context/SafeGridContext';
import { Header } from './components/common/Header';
import { MobileShell } from './components/common/MobileShell';
import { MobileHome } from './components/mobile/MobileHome';
import { MobileEmergencyView } from './components/mobile/MobileEmergencyView';
import { MobileJourneyView } from './components/mobile/MobileJourneyView';
import { MobileCheckInView } from './components/mobile/MobileCheckInView';
import { MobileCircleView } from './components/mobile/MobileCircleView';
import { MobileTimelineView } from './components/mobile/MobileTimelineView';
import { MobileSOSModal } from './components/mobile/MobileSOSModal';
import { MobileAttentionModal } from './components/mobile/MobileAttentionModal';
import { WebDashboard } from './components/web/WebDashboard';
import { AdminCommandCenter } from './components/web/AdminCommandCenter';
import { ResponderPortal } from './components/web/ResponderPortal';
import { MasterBlueprintModal } from './components/modals/MasterBlueprintModal';
import { ScenarioRunnerModal } from './components/modals/ScenarioRunnerModal';
import { QuickTestConsole } from './components/quicktest/QuickTestConsole';
import { PersonTypeOnboardingModal } from './components/onboarding/PersonTypeOnboardingModal';
import { GuardianCompanionView } from './components/guardian/GuardianCompanionView';
import { ConnectFriendModal } from './components/modals/ConnectFriendModal';
import { Smartphone, Monitor, ShieldCheck, Activity, Users, Radio } from 'lucide-react';

const IS_REAL_PHONE =
  typeof window !== 'undefined' &&
  (window.innerWidth <= 500 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

const AppContent: React.FC = () => {
  const { viewMode, setViewMode, currentUser, safetyState, setIsConnectFriendModalOpen } = useSafeGrid();
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'journey' | 'checkin' | 'circle' | 'timeline'>('home');
  const [activeWebTab, setActiveWebTab] = useState<'citizen' | 'responder' | 'admin'>('citizen');
  
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  // On a real phone, force MOBILE mode immediately
  React.useEffect(() => {
    if (IS_REAL_PHONE && viewMode !== 'MOBILE') setViewMode('MOBILE');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active web tab when persona changes
  React.useEffect(() => {
    if (currentUser.role === 'ADMIN') setActiveWebTab('admin');
    else if (currentUser.role === 'RESPONDER') setActiveWebTab('responder');
    else setActiveWebTab('citizen');
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenJuryModal={() => setIsJuryModalOpen(true)}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
      />

      {/* Main Content Area based on View Mode */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'GUARDIAN' ? (
          /* Live Friend / Guardian Companion Console */
          <div className="flex-1 flex flex-col">
            <GuardianCompanionView />
          </div>
        ) : viewMode === 'MOBILE' ? (
          /* Mobile App View */
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Context sub-bar — hide on real phone since it fills the screen */}
            {!IS_REAL_PHONE && (
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400 px-4">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  Mobile Prototype View
                </span>
                <span>•</span>
                <span>Persona: <strong className="text-white">{currentUser.name}</strong></span>
                <span>•</span>
                <button
                  onClick={() => setIsConnectFriendModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-colors"
                >
                  <span>📱 Connect Friend&apos;s Phone</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => setViewMode('GUARDIAN')}
                  className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors"
                >
                  Guardian Screen
                </button>
                <span>•</span>
                <button
                  onClick={() => setViewMode('WEB')}
                  className="text-rose-400 hover:text-rose-300 underline font-medium transition-colors"
                >
                  Switch to Web App
                </button>
                <span>•</span>
                <button
                  onClick={() => setViewMode('API_CONSOLE')}
                  className="text-purple-400 hover:text-purple-300 underline font-medium transition-colors"
                >
                  REST API Console
                </button>
              </div>
            )}

            <MobileShell activeTab={activeMobileTab} setActiveTab={setActiveMobileTab}>
              {activeMobileTab === 'home' && (
                safetyState === 'EMERGENCY' ? (
                  <MobileEmergencyView />
                ) : (
                  <MobileHome onNavigate={setActiveMobileTab} />
                )
              )}
              {activeMobileTab === 'journey' && <MobileJourneyView />}
              {activeMobileTab === 'checkin' && <MobileCheckInView />}
              {activeMobileTab === 'circle' && <MobileCircleView />}
              {activeMobileTab === 'timeline' && <MobileTimelineView />}
            </MobileShell>
          </div>
        ) : viewMode === 'API_CONSOLE' ? (
          /* Interactive REST Backend & User Program Test Console */
          <div className="flex-1 flex flex-col">
            <QuickTestConsole />
          </div>
        ) : (
          /* Full Desktop / Tablet Web App Experience */
          <div className="flex-1 flex flex-col">
            {/* Web Sub-navigation between Citizen View, Responder Portal, and Admin Command Center */}
            <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm sticky top-16 z-30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveWebTab('citizen')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWebTab === 'citizen'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Citizen Web Portal</span>
                  </button>

                  <button
                    onClick={() => setActiveWebTab('responder')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWebTab === 'responder'
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Responder Console</span>
                  </button>

                  <button
                    onClick={() => setActiveWebTab('admin')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeWebTab === 'admin'
                        ? 'bg-slate-800 text-rose-400 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>City Operations Center</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>Responsive Desktop App</span>
                </div>
              </div>
            </div>

            {/* Active Web Screen */}
            <div className="flex-1 pb-16">
              {activeWebTab === 'citizen' && <WebDashboard />}
              {activeWebTab === 'responder' && <ResponderPortal />}
              {activeWebTab === 'admin' && <AdminCommandCenter />}
            </div>
          </div>
        )}
      </main>

      {/* Global Modals & Dialogs */}
      <PersonTypeOnboardingModal />
      <ConnectFriendModal />
      <MobileSOSModal />
      <MobileAttentionModal />
      <MasterBlueprintModal isOpen={isJuryModalOpen} onClose={() => setIsJuryModalOpen(false)} />
      <ScenarioRunnerModal isOpen={isScenarioModalOpen} onClose={() => setIsScenarioModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <SafeGridProvider>
      <AppContent />
    </SafeGridProvider>
  );
}
