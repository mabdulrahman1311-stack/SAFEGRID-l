import React from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Battery, 
  BatteryLow, 
  BatteryCharging, 
  MapPin, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  UserX,
  Zap
} from 'lucide-react';

interface DeviceSafetyStatusProps {
  compact?: boolean;
  showJourneyAdvisories?: boolean;
  className?: string;
}

export const DeviceSafetyStatus: React.FC<DeviceSafetyStatusProps> = ({
  compact = false,
  showJourneyAdvisories = true,
  className = '',
}) => {
  const { 
    isOnline, 
    batteryInfo, 
    liveCoords, 
    activeSafetySession,
    journey,
    contacts,
    isDemoMode,
    setIsConnectFriendModalOpen
  } = useSafeGrid();

  const availableContacts = contacts.filter(c => c.canReceiveSOS);
  const isBatteryLow = batteryInfo.level !== null && batteryInfo.level <= 20;
  const isBatteryCritical = batteryInfo.level !== null && batteryInfo.level < 10;
  const isJourneyActive = journey && (journey.status === 'ACTIVE' || journey.status === 'OVERDUE' || journey.status === 'DEVIATION');

  // Battery visual indicator
  const renderBatteryIcon = () => {
    if (batteryInfo.isCharging) {
      return <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />;
    }
    if (batteryInfo.level === null) {
      return <Battery className="w-4 h-4 text-slate-500 shrink-0" />;
    }
    if (isBatteryCritical) {
      return <BatteryLow className="w-4 h-4 text-rose-500 animate-bounce shrink-0" />;
    }
    if (isBatteryLow) {
      return <BatteryLow className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <Battery className="w-4 h-4 text-emerald-400 shrink-0" />;
  };

  const getBatteryBadge = () => {
    switch (batteryInfo.state) {
      case 'NORMAL':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Normal</span>;
      case 'MODERATE':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">Moderate</span>;
      case 'LOW':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">Low</span>;
      case 'CRITICAL':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold animate-pulse">Critical</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Sensor N/A</span>;
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Primary Device Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Device Safety Status
          </span>
          {isDemoMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black">
              DEMO SIMULATION
            </span>
          )}
        </div>

        <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-2.5'}`}>
          {/* 1. BATTERY STATUS */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Battery</span>
              {renderBatteryIcon()}
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-sm font-black text-white font-mono">
                {batteryInfo.level !== null ? `${batteryInfo.level}%` : 'Unavailable'}
              </span>
              {getBatteryBadge()}
            </div>
          </div>

          {/* 2. LOCATION STATUS */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Location</span>
              <MapPin className={`w-4 h-4 shrink-0 ${liveCoords.isRealGps ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div className="mt-0.5">
              <span className="text-xs font-bold text-white block truncate">
                {liveCoords.isRealGps ? 'Available' : (liveCoords.lat !== 0 ? 'Last Known Fix' : 'Unavailable')}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {liveCoords.isRealGps 
                  ? `±${liveCoords.accuracy || 10}m precision` 
                  : (liveCoords.lat !== 0 ? new Date(liveCoords.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'GPS signal lost')}
              </span>
            </div>
          </div>

          {/* 3. NETWORK STATUS */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Network</span>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              )}
            </div>
            <div className="mt-0.5">
              <span className={`text-xs font-bold block ${isOnline ? 'text-white' : 'text-amber-300'}`}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {isOnline ? 'Cloud sync active' : 'Alerts queued locally'}
              </span>
            </div>
          </div>

          {/* 4. SAFETY MONITORING */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 font-medium">Monitoring</span>
              {activeSafetySession ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
            <div className="mt-0.5">
              <span className={`text-xs font-bold block ${activeSafetySession ? 'text-emerald-400' : 'text-slate-400'}`}>
                {activeSafetySession ? 'Active' : 'Standby'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {activeSafetySession ? 'Sensors armed' : 'Tap to resume'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Battery Warning during Active Journey (Part 3) */}
      {showJourneyAdvisories && isJourneyActive && isBatteryLow && (
        <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/50 shadow-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-200 block">Low Battery Advisory ({batteryInfo.level}%)</span>
            <p className="text-amber-300/90 mt-0.5 leading-relaxed">
              Your battery is running low. Consider ending your journey or connecting your charger to ensure continuous location transmission.
            </p>
          </div>
        </div>
      )}

      {/* No Trusted Contacts Available Warning (Part 6) */}
      {availableContacts.length === 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-sm flex items-start gap-3">
          <UserX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-white block">No trusted contact is currently available</span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              You do not have any reachable safety contacts configured. In an emergency, SafeGrid will route alerts directly to verified community responders and 112 emergency services.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsConnectFriendModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
              >
                + Add Trusted Contact
              </button>
              <a
                href="tel:112"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                Emergency Hotline (112)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Warning (Part 19) */}
      {!isOnline && (
        <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-200 block">Network connection unavailable</span>
            <p className="text-amber-300/90 mt-0.5 leading-relaxed">
              SafeGrid is offline. All safety alerts and check-in acknowledgements are stored locally in the <strong>PENDING DELIVERY</strong> queue and will be transmitted automatically once connectivity resumes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
