import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Share2, 
  MoreVertical, 
  QrCode, 
  ExternalLink, 
  Wifi, 
  Cable, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'banner' | 'modal' | 'pill';
  onClose?: () => void;
}

export const PWAInstallBanner: React.FC<Props> = ({ className = '', variant = 'banner', onClose }) => {
  const { isInstallable, isInstalled, isStandalone, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'chrome' | 'usb' | 'wifi'>('chrome');

  // If already running standalone inside the installed app, show nothing or minimal badge
  if (isStandalone) {
    if (variant === 'pill') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Native App Mode
        </span>
      );
    }
    return null;
  }

  if (dismissed && variant !== 'modal') {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const outcome = await promptInstall();
    setIsInstalling(false);

    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        setDismissed(true);
      }, 3000);
    } else if (outcome === 'unavailable') {
      // Browser didn't trigger native prompt (e.g. iOS or manual install required), show guide modal
      setShowGuideModal(true);
    }
  };

  // Local IP and URLs
  const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000';
  const wifiUrl = `http://10.231.17.67:${port}`;
  const localhostUrl = `http://localhost:${port}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(wifiUrl)}`;

  return (
    <>
      {/* ── 1. Compact Header Pill Variant ────────────────────────────── */}
      {variant === 'pill' && (
        <button
          onClick={handleInstallClick}
          className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-950/50 flex items-center gap-1.5 transition-all active:scale-95 ${className}`}
          title="Install SAFEGRID app on this phone"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* ── 2. Prominent Mobile Banner Variant ─────────────────────────── */}
      {variant === 'banner' && (
        <div 
          id="pwa-install-banner"
          className={`mx-3 my-2 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 text-white shadow-xl shadow-slate-950/80 animate-in fade-in slide-in-from-top-2 relative overflow-hidden ${className}`}
        >
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 p-0.5 shadow-lg shadow-rose-500/30 shrink-0 flex items-center justify-center">
                <img 
                  src="/pwa-192x192.png" 
                  alt="SafeGrid" 
                  className="w-10 h-10 rounded-[14px] object-cover" 
                  onError={(e) => {
                    // Fallback to icon if png fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white tracking-tight truncate">
                    Install SAFEGRID App
                  </h4>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full">
                    PWA APK
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  Full-screen, offline protection &amp; instant SOS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-pwa-install-now"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/60 transition-all"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Installed!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Install</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Step-by-Step Install & Localhost Helper Modal ─────────── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Install SAFEGRID on Your Phone</h3>
                  <p className="text-xs text-slate-400">Run as a standalone app with full-screen experience</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2">
              <button
                onClick={() => setActiveGuideTab('chrome')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeGuideTab === 'chrome'
                    ? 'border-rose-500 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
                <span>1-Tap Chrome Install</span>
              </button>

              <button
                onClick={() => setActiveGuideTab('usb')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeGuideTab === 'usb'
                    ? 'border-rose-500 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cable className="w-3.5 h-3.5" />
                <span>USB &apos;localhost&apos;</span>
              </button>

              <button
                onClick={() => setActiveGuideTab('wifi')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${
                  activeGuideTab === 'wifi'
                    ? 'border-rose-500 text-rose-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Wi-Fi QR Access</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* TAB 1: Chrome Menu Install */}
              {activeGuideTab === 'chrome' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
                    <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rose-400" />
                      Direct Chrome Installation
                    </p>
                    When viewing this page in Google Chrome on your phone, you can install SAFEGRID directly onto your home screen in 2 clicks:
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block mb-0.5">Tap Chrome Menu (⋮)</strong>
                        <span className="text-slate-400">
                          In the top-right corner of Chrome on your Android phone, tap the three dots (<strong className="text-white">⋮</strong>).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block mb-0.5">Select &apos;Install app&apos; or &apos;Add to Home screen&apos;</strong>
                        <span className="text-slate-400">
                          Tap <strong className="text-white">&quot;Install app&quot;</strong> (or &quot;Add to Home screen&quot;).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div className="text-xs">
                        <strong className="text-white block mb-0.5">Tap &apos;Install&apos; in the pop-up</strong>
                        <span className="text-slate-400">
                          Android will install the SAFEGRID icon into your app drawer and home screen. Launching it opens a full-screen, standalone app without any browser URL bars!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USB Localhost Port Forwarding */}
              {activeGuideTab === 'usb' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
                    <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <Cable className="w-4 h-4 text-blue-400" />
                      True &apos;http://localhost:5173&apos; on Android
                    </p>
                    Want to literally open <code className="text-amber-300 font-mono">http://localhost:5173</code> on your phone&apos;s Chrome? Chrome Remote Debugging makes your phone access your PC&apos;s localhost directly!
                  </div>

                  <ol className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-rose-400">1.</span>
                      <span>Connect phone to PC using a USB cable with <strong>USB Debugging enabled</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-rose-400">2.</span>
                      <span>On your PC Chrome, open: <code className="text-amber-300 font-mono select-all">chrome://inspect/#devices</code></span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-rose-400">3.</span>
                      <span>Click <strong>&quot;Port forwarding...&quot;</strong>, set Port <strong>5173</strong> to <code className="text-amber-300 font-mono">localhost:5173</code>, and check &quot;Enable port forwarding&quot;.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="font-bold text-emerald-400">4.</span>
                      <span>Now in Chrome on your phone, open <strong className="text-emerald-400 font-mono">http://localhost:5173</strong>. Chrome recognizes it as fully secure and shows the <strong>Install App</strong> button automatically!</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* TAB 3: Wi-Fi Access & QR */}
              {activeGuideTab === 'wifi' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                    <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-indigo-400" />
                      Wireless Same-Network Access
                    </p>
                    Connect your phone to the same Wi-Fi network as this PC, then scan this QR code or type the URL:
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="p-2 bg-white rounded-2xl shadow-xl">
                      <img 
                        src={qrCodeUrl} 
                        alt="Scan to open on phone" 
                        className="w-36 h-36 object-contain"
                      />
                    </div>

                    <div className="text-center sm:text-left space-y-2">
                      <p className="text-xs text-slate-400">Direct Wi-Fi URL:</p>
                      <code className="text-xs font-mono font-bold text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 block select-all">
                        {wifiUrl}
                      </code>
                      <p className="text-[11px] text-slate-400">
                        Scan with your phone&apos;s camera app to open Chrome instantly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
