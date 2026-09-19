import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow, 
  MapPin, 
  PlayCircle, 
  FileText, 
  RotateCcw,
  Users,
  Terminal,
  Radio
} from 'lucide-react';

import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NotificationCenter } from './NotificationCenter';

interface Props {
  onOpenJuryModal: () => void;
  onOpenScenarioModal: () => void;
}

export const Header: React.FC<Props> = ({ onOpenJuryModal, onOpenScenarioModal }) => {
  const {
    viewMode,
    setViewMode,
    currentUser,
    setCurrentUser,
    personas,
    setIsOnboardingOpen,
    setIsConnectFriendModalOpen,
    isOnline,
    toggleOnlineStatus,
    offlineQueue,
    batteryLevel,
    setBatteryLevel,
    gpsPrecision,
    toggleGpsPrecision,
    resetAllToDefault,
    liveCoords,
    isLocatingGps,
    refreshLiveGps,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useSafeGrid();

  const toggleBattery = () => {
    setBatteryLevel(batteryLevel > 20 ? 14 : 75);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SAFEGRID
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                PROTOTYPE
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 -mt-0.5">
              “Don’t just wait for an SOS. Recognize when safety changes.”
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Mobile App vs Web App vs API Console */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            id="view-mode-mobile"
            onClick={() => setViewMode('MOBILE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'MOBILE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            id="view-mode-web"
            onClick={() => setViewMode('WEB')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'WEB'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Web App</span>
          </button>
          <button
            id="view-mode-api"
            onClick={() => setViewMode('API_CONSOLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'API_CONSOLE'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">REST APIs</span>
            <span className="sm:hidden">APIs</span>
          </button>
          <button
            id="view-mode-guardian"
            onClick={() => setViewMode('GUARDIAN')}
            title="Friend's Phone Live Receiver Screen"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'GUARDIAN'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden md:inline">Friend&apos;s Phone</span>
            <span className="md:hidden">Friend</span>
          </button>
        </div>

        {/* Controls & Simulators */}
        <div className="flex items-center gap-2">
          {/* Persona Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs cursor-pointer transition-colors">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
              <span className="hidden sm:inline-block font-medium text-slate-200 max-w-[100px] truncate">
                {currentUser.name}
              </span>
            </div>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-72 p-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
              <button
                id="header-btn-open-onboarding"
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full mb-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 text-left hover:bg-indigo-600/40 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                    Personalized Needs Setup
                  </span>
                  <p className="text-xs font-bold text-white">Identify Person Type &amp; SOS</p>
                </div>
                <span className="text-xs bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-md">
                  Configure
                </span>
              </button>

              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                Switch Role / Persona
              </div>
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setCurrentUser(persona)}
                  className={`w-full text-left flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                    currentUser.id === persona.id
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{persona.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{persona.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Safety Notifications */}
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markNotificationRead}
            onMarkAllAsRead={markAllNotificationsRead}
            onClearAll={clearAllNotifications}
          />

          {/* Network Simulator */}
          <button
            id="toggle-network"
            onClick={toggleOnlineStatus}
            title={isOnline ? 'Online (Click to simulate connection loss)' : 'Offline (Click to restore & sync)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/50'
                : 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/70 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            {offlineQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {offlineQueue.length}
              </span>
            )}
          </button>

          {/* Battery Simulator */}
          <button
            id="toggle-battery"
            onClick={toggleBattery}
            title={`Battery: ${batteryLevel}% (Click to toggle low battery simulation)`}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              batteryLevel <= 20
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {batteryLevel <= 20 ? <BatteryLow className="w-3.5 h-3.5" /> : <Battery className="w-3.5 h-3.5" />}
            <span>{batteryLevel}%</span>
          </button>

          {/* GPS Accuracy & Location Tracker */}
          <button
            id="toggle-gps"
            onClick={() => refreshLiveGps()}
            title={`Location: ${liveCoords.locationName || 'Live GPS'} (${liveCoords.lat.toFixed(4)}, ${liveCoords.lng.toFixed(4)}) • Click to query GPS sensor`}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
          >
            <MapPin className={`w-3.5 h-3.5 text-rose-400 ${isLocatingGps ? 'animate-spin' : ''}`} />
            <span className="max-w-[120px] truncate">
              {liveCoords.locationName ? liveCoords.locationName.split(' (')[0] : `~${gpsPrecision}m`}
            </span>
          </button>

          {/* PWA / Android APK Packager */}
          <PWAInstallButton />

          {/* Connect Friend's Phone Action */}
          <button
            id="btn-connect-friend"
            onClick={() => setIsConnectFriendModalOpen(true)}
            title="Connect your friend's phone to receive emergency alerts"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Connect Friend&apos;s Phone</span>
            <span className="sm:hidden">Friend</span>
          </button>

          {/* Scenario Runner Modal Button */}
          <button
            id="btn-scenarios"
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demos</span>
          </button>

          {/* Master Blueprint, 15-Slide Presentation & Jury Q&A Modal Button */}
          <button
            id="btn-jury-qa"
            onClick={onOpenJuryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
            title="Open Master Blueprint (93 Sections), 15-Slide Pitch Deck, Jury Q&A, and What-If Matrix"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-bold">Master Doc &amp; PPT</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset"
            onClick={resetAllToDefault}
            title="Reset All State to Clean Defaults"
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
