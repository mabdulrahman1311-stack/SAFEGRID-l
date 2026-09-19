import React from 'react';
import { SafetyState } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  state: SafetyState;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SafetyStatusBadge: React.FC<Props> = ({ state, size = 'md', showLabel = true }) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'SAFE':
        return {
          icon: ShieldCheck,
          label: 'SAFE',
          sub: 'Expected signal received',
          bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          glow: 'shadow-emerald-500/20',
        };
      case 'ATTENTION':
        return {
          icon: AlertTriangle,
          label: 'ATTENTION',
          sub: 'Verification in progress',
          bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          glow: 'shadow-amber-500/20',
        };
      case 'EMERGENCY':
        return {
          icon: AlertCircle,
          label: 'EMERGENCY',
          sub: 'Welfare protocol active',
          bg: 'bg-rose-950/90 border-rose-500/50 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          glow: 'shadow-rose-500/30',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  }[size];

  return (
    <div
      id={`safety-badge-${state.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${config.glow} ${sizeClasses} font-semibold transition-all`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};
