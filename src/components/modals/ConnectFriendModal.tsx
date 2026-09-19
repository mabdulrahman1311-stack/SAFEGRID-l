import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Smartphone, 
  Send, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Share2, 
  ShieldAlert, 
  Phone, 
  Users, 
  MapPin, 
  Sparkles,
  X,
  Radio,
  Play,
  RotateCw,
  Compass
} from 'lucide-react';
import { formatCoordinates, LOCATION_PRESETS } from '../../utils/geolocation';

export const ConnectFriendModal: React.FC = () => {
  const { 
    isConnectFriendModalOpen, 
    setIsConnectFriendModalOpen, 
    contacts, 
    currentUser, 
    liveCoords, 
    triggerEmergencyIncident,
    setViewMode,
    activeIncident,
    refreshLiveGps,
    isLocatingGps,
    setCustomLocation
  } = useSafeGrid();

  const [activeTab, setActiveTab] = useState<'sms' | 'qr'>('sms');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || 'custom');
  
  // Custom contact input
  const [friendName, setFriendName] = useState<string>(contacts[0]?.name || 'My Friend');
  const [friendPhone, setFriendPhone] = useState<string>(contacts[0]?.phone || '+1 (555) 234-9988');
  const [alertType, setAlertType] = useState<'EMERGENCY' | 'CHECKIN' | 'JOURNEY'>('EMERGENCY');
  const [copied, setCopied] = useState(false);
  const [sendStatusMsg, setSendStatusMsg] = useState<string | null>(null);

  if (!isConnectFriendModalOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://safegrid.app';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  const latStr = liveCoords.lat.toFixed(5);
  const lngStr = liveCoords.lng.toFixed(5);
  const locStr = encodeURIComponent(liveCoords.locationName || 'Live GPS Telemetry');
  const areaStr = encodeURIComponent(liveCoords.approximateArea || 'Active Telemetry Corridor');
  const userStr = encodeURIComponent(currentUser.name);
  const phoneStr = encodeURIComponent(currentUser.phone);
  
  // URL ensures the friend's phone renders the EXACT SAME location
  const guardianUrl = `${currentOrigin}${currentPath}?role=guardian&lat=${latStr}&lng=${lngStr}&loc=${locStr}&area=${areaStr}&user=${userStr}&phone=${phoneStr}`;

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId === 'custom') {
      setFriendName('');
      setFriendPhone('');
    } else {
      const found = contacts.find(c => c.id === contactId);
      if (found) {
        setFriendName(found.name);
        setFriendPhone(found.phone);
      }
    }
  };

  const cleanPhone = friendPhone.replace(/[^0-9+]/g, '');

  const getAlertMessage = () => {
    const lat = liveCoords.lat.toFixed(5);
    const lng = liveCoords.lng.toFixed(5);
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const locationName = liveCoords.locationName || 'Current Live Coordinates';
    const area = liveCoords.approximateArea ? ` (${liveCoords.approximateArea})` : '';

    if (alertType === 'EMERGENCY') {
      return `🚨 SAFEGRID CRITICAL SOS from ${currentUser.name}!\n\nI need immediate assistance! Please verify my safety or coordinate dispatch.\n\n📍 My Location: ${locationName}${area}\n🌐 Exact GPS: ${lat}, ${lng}\n🗺️ Google Maps: ${mapsLink}\n🛡️ Live Companion Tracker: ${guardianUrl}`;
    } else if (alertType === 'CHECKIN') {
      return `⚠️ SAFEGRID Welfare Alert from ${currentUser.name}.\n\nScheduled safety check-in window exceeded without response. Please call or verify my well-being.\n\n📍 Last Known Area: ${locationName}${area}\n🌐 Exact GPS: ${lat}, ${lng}\n🗺️ Google Maps: ${mapsLink}\n🛡️ Companion Console: ${guardianUrl}`;
    } else {
      return `🚶 SAFEGRID Journey Alert from ${currentUser.name}.\n\nCommute is overdue or off expected schedule. Tracking active.\n\n📍 Current Location: ${locationName}${area}\n🌐 Exact GPS: ${lat}, ${lng}\n🗺️ Google Maps: ${mapsLink}\n🛡️ Live Tracking: ${guardianUrl}`;
    }
  };

  const messageText = getAlertMessage();

  const handleSendSMS = () => {
    // Generate native SMS link compatible with iOS and Android
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${cleanPhone}${separator}body=${encodeURIComponent(messageText)}`;
    
    // Trigger in-app emergency state so system reflects the alert
    triggerEmergencyIncident('MANUAL_SOS', `Direct SMS alert dispatched to friend ${friendName} (${friendPhone})`);
    
    setSendStatusMsg(`Opening native Messages app to text ${friendName}...`);
    setTimeout(() => {
      window.location.href = smsUrl;
    }, 400);
  };

  const handleSendWhatsApp = () => {
    const waPhone = cleanPhone.replace(/^\+/, '');
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(messageText)}`;
    
    triggerEmergencyIncident('MANUAL_SOS', `WhatsApp emergency alert dispatched to friend ${friendName}`);
    
    setSendStatusMsg(`Opening WhatsApp with pre-filled SOS for ${friendName}...`);
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `SAFEGRID SOS Alert - ${currentUser.name}`,
          text: messageText,
          url: guardianUrl,
        });
        triggerEmergencyIncident('MANUAL_SOS', `Shared emergency alert via system share sheet`);
        setSendStatusMsg('Alert shared successfully!');
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guardianUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(guardianUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Connect Friend&apos;s Phone</h2>
              <p className="text-xs text-slate-400">
                Send real emergency alerts to your friend&apos;s phone to prove it works
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectFriendModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/30 flex gap-2">
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'sms'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Direct SMS &amp; WhatsApp Alert</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Live Companion Pairing (QR Code)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-200">
          {/* Active GPS & Telemetry Sync Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Transmitted Telemetry Location</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      liveCoords.isRealGps 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                        : 'bg-blue-950 text-blue-400 border-blue-500/40'
                    }`}>
                      {liveCoords.isRealGps ? 'LIVE DEVICE SENSOR' : 'PRESET / SYNCHRONIZED'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    {liveCoords.locationName || 'Live Coordinates'} {liveCoords.approximateArea && `• ${liveCoords.approximateArea}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => refreshLiveGps()}
                disabled={isLocatingGps}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
                title="Query browser device GPS sensor"
              >
                <RotateCw className={`w-3.5 h-3.5 text-rose-400 ${isLocatingGps ? 'animate-spin' : ''}`} />
                <span>{isLocatingGps ? 'Detecting GPS...' : 'Acquire Device GPS'}</span>
              </button>
            </div>

            {/* Coordinates & Alignment Note */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs">
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatCoordinates(liveCoords.lat, liveCoords.lng)}</span>
                <span className="text-slate-600">({liveCoords.lat.toFixed(5)}, {liveCoords.lng.toFixed(5)})</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Google Maps link &amp; Companion screen match 100%
              </span>
            </div>

            {/* Quick Switch Test Cities */}
            <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium mr-1">Switch Test Location:</span>
              {LOCATION_PRESETS.slice(1, 6).map((preset) => {
                const isSelected = Math.abs(liveCoords.lat - preset.coords.lat) < 0.05 && Math.abs(liveCoords.lng - preset.coords.lng) < 0.05;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCustomLocation(preset.coords)}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all ${
                      isSelected
                        ? 'bg-rose-950 border-rose-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {preset.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'sms' ? (
            <div className="space-y-4">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select Friend / Contact
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {contacts.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleContactSelect(c.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedContactId === c.id
                          ? 'border-rose-500 bg-rose-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <p className="font-bold truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{c.phone}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleContactSelect('custom')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedContactId === 'custom'
                        ? 'border-rose-500 bg-rose-950/40 text-white'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <p className="font-bold">+ Custom Friend</p>
                    <p className="text-[11px] text-slate-400">Type phone number</p>
                  </button>
                </div>
              </div>

              {/* Friend Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Friend&apos;s Name</label>
                  <input
                    type="text"
                    value={friendName}
                    onChange={e => setFriendName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Friend&apos;s Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={friendPhone}
                    onChange={e => setFriendPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Alert Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Simulated Scenario to Transmit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('EMERGENCY')}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      alertType === 'EMERGENCY'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🚨 Urgent SOS
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('CHECKIN')}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      alertType === 'CHECKIN'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚠️ Missed Check-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('JOURNEY')}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      alertType === 'JOURNEY'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🚶 Overdue Journey
                  </button>
                </div>
              </div>

              {/* Message Payload Preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">Actual Text Payload to be Sent to Friend:</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Includes Live GPS &amp; Google Map Link</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {messageText}
                </div>
              </div>

              {sendStatusMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{sendStatusMsg}</span>
                </div>
              )}

              {/* Action Buttons to Trigger Real Phone Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSendSMS}
                  disabled={!friendPhone}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 transition-all active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>1. SEND REAL SMS TO FRIEND</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!friendPhone}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-98"
                >
                  <Phone className="w-4 h-4" />
                  <span>2. SEND VIA WHATSAPP</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Share via Any App (Telegram / AirDrop / Email)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy SOS Link'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 2: QR Code & Live Companion Pairing */
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="Guardian QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/30">
                    Step-by-Step Live Demonstration
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    Scan this QR code with your friend&apos;s phone camera!
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Their phone will open the <strong>SAFEGRID Live Guardian Companion Console</strong>. Once connected, whenever you press SOS or miss a check-in, their phone will instantly buzz and sound the alarm with your exact coordinates!
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Link for Friend'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('GUARDIAN');
                        setIsConnectFriendModalOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Guardian Screen Here</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Step Walkthrough */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-black text-rose-400">STEP 1</span>
                  <p className="font-bold text-white">Friend Scans QR</p>
                  <p className="text-slate-400 text-[11px]">Friend opens phone camera and taps the SAFEGRID link.</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-black text-amber-400">STEP 2</span>
                  <p className="font-bold text-white">Trigger SOS on Your Device</p>
                  <p className="text-slate-400 text-[11px]">Tap the red SOS button or simulate a missed check-in.</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-black text-emerald-400">STEP 3</span>
                  <p className="font-bold text-white">Friend Receives Alert</p>
                  <p className="text-slate-400 text-[11px]">Friend&apos;s phone flashes red, gives ETA, and 1-tap Google Maps navigation.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Target device: <strong className="text-slate-200">{friendName} ({cleanPhone || 'Custom'})</strong></span>
          <button
            onClick={() => setIsConnectFriendModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
