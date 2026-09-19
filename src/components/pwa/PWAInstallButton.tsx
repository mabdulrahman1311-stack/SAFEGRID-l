import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, CheckCircle, ExternalLink } from 'lucide-react';
import { ApkExportModal } from '../modals/ApkExportModal';

interface Props {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'compact' }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [showApkModal, setShowApkModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowApkModal(true);
      }
    } else {
      setShowApkModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>APK Active</span>
      </div>
    );
  }

  return (
    <>
      <button
        id="btn-install-apk"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 active:scale-95 transition-all ${className}`}
        title="Install Android WebAPK or Generate APK file"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
        <span>{variant === 'full' ? 'Install Android APK' : 'APK / App'}</span>
      </button>

      {showApkModal && (
        <ApkExportModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
      )}
    </>
  );
};
