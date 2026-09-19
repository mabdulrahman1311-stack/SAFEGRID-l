import React, { useState } from 'react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { 
  Users, 
  ShieldCheck, 
  Phone, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  ShieldAlert, 
  HeartHandshake,
  MapPin,
  AlertTriangle,
  Radio,
  Sliders,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { SafetyContact } from '../../types';

export const MobileCircleView: React.FC = () => {
  const { 
    contacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    toggleContactPermission, 
    currentUser, 
    vicinityRadiusKm, 
    setVicinityRadiusKm, 
    vicinityStatus,
    simulateOverdueJourney,
    triggerSOS
  } = useSafeGrid();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<SafetyContact | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(1.2);
  const [approxLocation, setApproxLocation] = useState('Nearby Residence (1.2 km away)');
  const [canVerifyWelfare, setCanVerifyWelfare] = useState(true);
  const [canReceiveSOS, setCanReceiveSOS] = useState(true);
  const [canTrackLiveJourney, setCanTrackLiveJourney] = useState(true);

  const [childJourneyMonitored, setChildJourneyMonitored] = useState(true);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Family');
    setPhone('');
    setDistanceKm(1.2);
    setApproxLocation('Nearby Residence (1.2 km away)');
    setCanVerifyWelfare(true);
    setCanReceiveSOS(true);
    setCanTrackLiveJourney(true);
    setShowAddModal(true);
  };

  const handleOpenEdit = (contact: SafetyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setDistanceKm(contact.distanceKm ?? 1.5);
    setApproxLocation(contact.approxLocation || '');
    setCanVerifyWelfare(contact.canVerifyWelfare);
    setCanReceiveSOS(contact.canReceiveSOS);
    setCanTrackLiveJourney(contact.canTrackLiveJourney);
    setShowAddModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        name,
        relationship,
        phone,
        distanceKm: Number(distanceKm),
        approxLocation: approxLocation || `${distanceKm} km from current location`,
        canVerifyWelfare,
        canReceiveSOS,
        canTrackLiveJourney,
      });
    } else {
      addContact({
        name,
        relationship,
        phone,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
        isPrimary: contacts.length === 0,
        canVerifyWelfare,
        canReceiveSOS,
        canTrackLiveJourney,
        distanceKm: Number(distanceKm),
        approxLocation: approxLocation || `${distanceKm} km from current location`,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div id="mobile-circle-view-container" className="p-4 space-y-4 pb-16 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Trusted Vicinity Grid
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Safety Circle &amp; Proximity
          </h2>
        </div>
        <button
          id="btn-open-add-contact-modal"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/60 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Configure contacts who receive welfare verification pings and live SOS alerts. If no contacts are in your immediate vicinity, SAFEGRID auto-dispatches emergency services.
      </p>

      {/* Vicinity Safeguard Status Card (Real-time Evaluation) */}
      <div 
        id="vicinity-status-banner"
        className={`p-4 rounded-2xl border transition-all ${
          vicinityStatus.emergencyEscalationRequired
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {vicinityStatus.emergencyEscalationRequired ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Nearest Vicinity Assessment:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  vicinityStatus.emergencyEscalationRequired 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {vicinityStatus.emergencyEscalationRequired ? '0 Contacts Nearby' : `${vicinityStatus.contactsInVicinityCount} Nearby`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Monitoring within <strong>{vicinityRadiusKm} km radius</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">Nearest</span>
            <span className="text-xs font-bold text-white">
              {vicinityStatus.nearestContactDistanceKm !== null ? `${vicinityStatus.nearestContactDistanceKm} km` : 'None'}
            </span>
          </div>
        </div>

        {/* Dynamic Warning or Confidence Message */}
        <div className="mt-2.5 pt-2 border-t border-white/10 text-xs">
          {vicinityStatus.emergencyEscalationRequired ? (
            <div className="space-y-1">
              <p className="text-[11px] text-rose-300 leading-normal">
                🚨 <strong>Zero safety circle contacts in your {vicinityRadiusKm} km vicinity!</strong> If SOS is triggered, SAFEGRID will automatically bypass remote contacts and inform <strong>{vicinityStatus.recommendedEmergencyAgency.name} ({vicinityStatus.recommendedEmergencyAgency.number})</strong>.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  id="btn-test-sos-vicinity-escalation"
                  onClick={triggerSOS}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-all flex items-center gap-1 shadow"
                >
                  <ShieldAlert className="w-3 h-3" /> Test Auto-Dispatch Workflow
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-300 leading-normal">
              ✓ Verified {vicinityStatus.contactsInVicinityCount} contact(s) are physically near you and can respond swiftly to welfare pings.
            </p>
          )}
        </div>
      </div>

      {/* Vicinity Radius Slider Control */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Vicinity Detection Threshold:
          </label>
          <span className="text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
            {vicinityRadiusKm} km
          </span>
        </div>
        <input
          id="input-circle-vicinity-radius-slider"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={vicinityRadiusKm}
          onChange={(e) => setVicinityRadiusKm(parseFloat(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0.5 km (Same Block)</span>
          <span>3.0 km (Standard)</span>
          <span>10 km (Suburban)</span>
        </div>
      </div>

      {/* GUARDIAN CHILD SAFETY CIRCLE */}
      {currentUser.role === 'GUARDIAN' && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">👧</span>
              <div>
                <h3 className="text-xs font-bold text-white">Child Commute Safety Circle</h3>
                <p className="text-[10px] text-purple-300">Monitored Dependent: Aarav (Grade 6)</p>
              </div>
            </div>
            <button
              onClick={() => setChildJourneyMonitored(prev => !prev)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                childJourneyMonitored
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {childJourneyMonitored ? 'Active' : 'Paused'}
            </button>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 text-xs space-y-1.5 border border-purple-500/20">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Route:</span>
              <strong className="text-white">Greenwood School → Home</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Expected Arrival:</span>
              <strong className="text-amber-300">05:00 PM</strong>
            </div>
          </div>

          <button
            onClick={simulateOverdueJourney}
            className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all text-center"
          >
            ⚡ Test Child Overdue Arrival Workflow
          </button>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Contacts ({contacts.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Click edit to update distance/GPS
          </span>
        </div>

        {contacts.map(contact => {
          const isNearby = (contact.distanceKm ?? 999) <= vicinityRadiusKm;
          return (
            <div
              key={contact.id}
              id={`contact-card-${contact.id}`}
              className={`bg-slate-900 border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
                isNearby ? 'border-purple-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{contact.name}</h4>
                      {contact.isPrimary && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Primary
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        isNearby
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {isNearby ? 'In Vicinity' : 'Remote'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{contact.relationship} • {contact.phone}</p>
                    {contact.approxLocation && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{contact.approxLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    id={`btn-edit-contact-${contact.id}`}
                    onClick={() => handleOpenEdit(contact)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit Contact Proximity & Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-delete-contact-${contact.id}`}
                    onClick={() => deleteContact(contact.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Distance Quick Slider / Readout */}
              <div className="bg-slate-950/60 rounded-xl p-2.5 flex items-center justify-between text-xs border border-slate-800/80">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <span>Current Distance:</span>
                  <strong className="text-white">{contact.distanceKm ?? 1.5} km</strong>
                </span>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => updateContact(contact.id, { distanceKm: 0.8, approxLocation: 'Same Neighborhood (<1 km)' })}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    title="Set to Nearby (< 1km)"
                  >
                    Nearby (0.8km)
                  </button>
                  <button
                    onClick={() => updateContact(contact.id, { distanceKm: 8.5, approxLocation: 'Outer City (>8 km)' })}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    title="Set to Remote (> 8km)"
                  >
                    Remote (8.5km)
                  </button>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="pt-1 flex items-center justify-between text-[11px] gap-1.5">
                <button
                  id={`btn-toggle-welfare-${contact.id}`}
                  onClick={() => toggleContactPermission(contact.id, 'canVerifyWelfare')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
                    contact.canVerifyWelfare
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title="Can receive welfare verification ping"
                >
                  <HeartHandshake className="w-3 h-3" />
                  <span className="truncate">Welfare</span>
                </button>

                <button
                  id={`btn-toggle-sos-${contact.id}`}
                  onClick={() => toggleContactPermission(contact.id, 'canReceiveSOS')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
                    contact.canReceiveSOS
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title="Can receive immediate emergency SOS alert"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span className="truncate">SOS Alert</span>
                </button>

                <button
                  id={`btn-toggle-live-journey-${contact.id}`}
                  onClick={() => toggleContactPermission(contact.id, 'canTrackLiveJourney')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
                    contact.canTrackLiveJourney
                      ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title="Can view live journey progress"
                >
                  <Eye className="w-3 h-3" />
                  <span className="truncate">Live GPS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddModal && (
        <div 
          id="contact-form-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editingContact ? 'Edit Circle Contact' : 'Add Trusted Contact'}
              </h3>
              <button 
                id="btn-close-contact-modal"
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Full Name
                </label>
                <input
                  id="input-contact-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Anita Roy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Relationship
                  </label>
                  <select
                    id="select-contact-relationship"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Family">Family</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Son / Daughter">Son / Daughter</option>
                    <option value="Trusted Neighbor">Trusted Neighbor</option>
                    <option value="Friend / Colleague">Friend / Colleague</option>
                    <option value="Community Warden">Community Warden</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Phone Number
                  </label>
                  <input
                    id="input-contact-phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Distance from You (km)
                  </label>
                  <span className="text-xs font-bold text-purple-400">{distanceKm} km</span>
                </div>
                <input
                  id="input-contact-distance"
                  type="range"
                  min="0.1"
                  max="15"
                  step="0.1"
                  value={distanceKm}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setDistanceKm(val);
                    setApproxLocation(`${val} km from current location`);
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>0.1km (Next Door)</span>
                  <span>3.0km (Vicinity limit)</span>
                  <span>15km (Remote)</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Approximate Location / Residence
                </label>
                <input
                  id="input-contact-location"
                  type="text"
                  placeholder="e.g. West Oak Apartments, Flat 302"
                  value={approxLocation}
                  onChange={e => setApproxLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Permissions
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={canVerifyWelfare}
                    onChange={e => setCanVerifyWelfare(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>Can verify welfare pings</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={canReceiveSOS}
                    onChange={e => setCanReceiveSOS(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>Can receive emergency SOS alerts</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={canTrackLiveJourney}
                    onChange={e => setCanTrackLiveJourney(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>Can track live GPS journey</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-contact-submit"
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/60"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
