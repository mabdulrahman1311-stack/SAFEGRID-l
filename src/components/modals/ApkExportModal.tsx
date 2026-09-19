import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Sparkles,
  GitBranch
} from 'lucide-react';
import { usePWAInstall } from '../pwa/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isAndroid } = usePWAInstall();
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  // Use published URL or fallback to current origin
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://safegrid-welfare.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentOrigin)}`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const bubblewrapCommand = `# 1. Install Google Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize from SafeGrid Web Manifest
bubblewrap init --manifest=${currentOrigin}/manifest.json

# 3. Build signed Android APK and AAB for Google Play
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Android APK &amp; WebAPK Packaging
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Ready to Publish
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatic generation methods for Android devices, sideloading, and Google Play Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Instant Android Automatic WebAPK (Zero-touch) */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Method 1: Automatic Android WebAPK (On-Device Minting)
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Native Android Core
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            When you publish this app and open it on any Android device (Chrome, Edge, Samsung Internet), Android&apos;s 
            <strong className="text-white"> Google Play Services WebAPK minting service</strong> automatically compiles a signed, 
            standalone <strong className="text-emerald-300">.apk file</strong> in the background and installs it into your Android App Drawer 
            with custom splash screens, app badges, and offline functionality.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isInstallable ? (
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/40 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Trigger Android Install Now</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PWA Manifest &amp; Service Worker are active and ready for automatic minting.</span>
              </div>
            )}
          </div>
        </div>

        {/* Method 2: Instant 1-Click APK Generator (PWABuilder) */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Method 2: 1-Click Sideloadable APK &amp; Google Play Package
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-500/20">
              PWABuilder (Google &amp; Microsoft)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Generate an exportable <strong className="text-white">.apk</strong> (for testing or sharing) and a signed <strong className="text-white">.aab</strong> (Android App Bundle for Google Play Store) directly from your published web app URL without needing Android Studio.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-900/30 transition-all"
            >
              <span>Package APK via PWABuilder</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => copyText(currentOrigin, 'origin')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied === 'origin' ? 'URL Copied!' : 'Copy Published URL'}</span>
            </button>
          </div>
        </div>

        {/* Method 3: GitHub Actions Auto-Build APK */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                Method 3: GitHub Actions Auto-Build on Publish
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-500/20">
              Automated CI/CD
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            We have generated <code className="text-purple-300 font-mono">.github/workflows/build-apk.yml</code> in your repository. When you publish or push code to GitHub, GitHub Actions automatically executes Google Bubblewrap to build the Android APK and publishes it as a downloadable release artifact!
          </p>

          {/* Bubblewrap CLI Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Or run directly via CLI with Bubblewrap:</span>
              <button
                onClick={() => copyText(bubblewrapCommand, 'cli')}
                className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'cli' ? 'Copied!' : 'Copy commands'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
              {bubblewrapCommand}
            </pre>
          </div>
        </div>

        {/* Pre-Flight Checklist */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">PWA Pre-Flight:</span>
            <span className="text-slate-400">192x192, 512x512, Maskable Icon, Service Worker, Standalone Mode</span>
          </div>
          <a
            href="/manifest.json"
            target="_blank"
            className="text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
          >
            <span>View manifest.json</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
