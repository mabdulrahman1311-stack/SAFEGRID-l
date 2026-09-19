import React, { useState } from 'react';
import { 
  ShieldAlert, 
  User, 
  HeartHandshake, 
  GraduationCap, 
  Baby, 
  Stethoscope, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  Info,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { PersonType, EmergencyServiceType } from '../../types';

interface PersonaOption {
  type: PersonType;
  title: string;
  subtitle: string;
  recommendedService: EmergencyServiceType;
  serviceDisplayName: string;
  serviceNumber: string;
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  defaultVicinityKm: number;
  primaryNeed: string;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    type: 'SOLO_WOMAN',
    title: 'Solo Woman / Night Commuter',
    subtitle: 'Transit safety, night commute tracking, anti-harassment shield',
    recommendedService: 'WOMEN_1091',
    serviceDisplayName: '1091 Women Safety Distress Line & Police Patrol',
    serviceNumber: '1091',
    icon: ShieldAlert,
    colorClass: 'text-pink-400 bg-pink-950/60 border-pink-500/40',
    badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-500/40',
    defaultVicinityKm: 3.0,
    primaryNeed: 'Night transit monitoring, rapid police escort, and urgent harassment alert',
  },
  {
    type: 'SENIOR',
    title: 'Senior Citizen / Elderly Living Alone',
    subtitle: 'Sudden fall detection, medication schedules, high-contrast check-ins',
    recommendedService: 'AMBULANCE_108',
    serviceDisplayName: '108 National Emergency Medical Services & Ambulance',
    serviceNumber: '108',
    icon: HeartHandshake,
    colorClass: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    defaultVicinityKm: 2.5,
    primaryNeed: 'Fall alert, medical trauma, missed morning check-in auto-ambulance dispatch',
  },
  {
    type: 'GUARDIAN',
    title: 'Parent / Family Guardian',
    subtitle: 'Child school commutes, arrival curfews, family safe circle supervision',
    recommendedService: 'CHILDLINE_1098',
    serviceDisplayName: '1098 National Child Safety & Emergency Police',
    serviceNumber: '1098',
    icon: Baby,
    colorClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    defaultVicinityKm: 5.0,
    primaryNeed: 'School route tracking, overdue arrival curfew alert, minor protection',
  },
  {
    type: 'STUDENT',
    title: 'Student / Young Adult',
    subtitle: 'Campus night walks, late library studies, peer buddy escort tracking',
    recommendedService: 'POLICE_112',
    serviceDisplayName: '112 Unified Police & Campus Security Response',
    serviceNumber: '112',
    icon: GraduationCap,
    colorClass: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/40',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    defaultVicinityKm: 2.0,
    primaryNeed: 'Campus perimeter security, peer group tracking, direct 112 police ping',
  },
  {
    type: 'RESPONDER',
    title: 'Verified Community First Responder',
    subtitle: 'Trained in CPR/First-Aid, receives local distress alerts in nearest vicinity',
    recommendedService: 'AMBULANCE_108',
    serviceDisplayName: '108 Medical Trauma & Rapid Hospital Intercept',
    serviceNumber: '108',
    icon: Stethoscope,
    colorClass: 'text-blue-400 bg-blue-950/60 border-blue-500/40',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    defaultVicinityKm: 5.0,
    primaryNeed: 'Receive nearby resident SOS pings and volunteer first-aid deployment',
  },
  {
    type: 'GENERAL',
    title: 'General Citizen / Solo Traveler',
    subtitle: 'Everyday safety journeys, solo travel check-ins, multi-contact circle',
    recommendedService: 'POLICE_112',
    serviceDisplayName: '112 All-Emergency Public Safety Command',
    serviceNumber: '112',
    icon: User,
    colorClass: 'text-slate-300 bg-slate-900 border-slate-700',
    badgeBg: 'bg-slate-900 text-slate-300 border-slate-700',
    defaultVicinityKm: 3.0,
    primaryNeed: 'Comprehensive personal safety, rapid 112 escalation when circle is remote',
  },
];

export const PersonTypeOnboardingModal: React.FC = () => {
  const { 
    isOnboardingOpen, 
    setIsOnboardingOpen, 
    currentUser, 
    setPersonTypeAndConfigure 
  } = useSafeGrid();

  const [selectedType, setSelectedType] = useState<PersonType>(currentUser.personType || 'SOLO_WOMAN');
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [vicinityKm, setVicinityKm] = useState<number>(currentUser.vicinityRadiusKm || 3.0);
  const [emergencyNotes, setEmergencyNotes] = useState(currentUser.emergencyNotes || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [medicalConditions, setMedicalConditions] = useState(currentUser.medicalConditions?.join(', ') || '');

  if (!isOnboardingOpen) return null;

  const currentOption = PERSONA_OPTIONS.find(p => p.type === selectedType) || PERSONA_OPTIONS[0];

  const handleSelectType = (option: PersonaOption) => {
    setSelectedType(option.type);
    setVicinityKm(option.defaultVicinityKm);
  };

  const handleSave = () => {
    setPersonTypeAndConfigure(selectedType, {
      name: name.trim() || currentUser.name,
      phone: phone.trim() || currentUser.phone,
      vicinityRadiusKm: Number(vicinityKm),
      preferredEmergencyService: currentOption.recommendedService,
      primaryEmergencyNeed: currentOption.primaryNeed,
      emergencyNotes: emergencyNotes.trim(),
      bloodGroup: bloodGroup.trim(),
      medicalConditions: medicalConditions
        ? medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    });
  };

  return (
    <div 
      id="person-type-onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div 
        id="person-type-onboarding-card"
        className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-6 transition-all text-slate-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 p-5 sm:p-6 text-white border-b border-slate-800 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Welcome to SAFEGRID
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Step 1: Identify your profile to configure your automated SOS & emergency services
                </p>
              </div>
            </div>
            {currentUser.onboardingCompleted && (
              <button
                id="close-onboarding-modal-btn"
                onClick={() => setIsOnboardingOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Persona Selection */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              What type of person are you?
            </label>
            <p className="text-xs text-slate-400 mb-3">
              This determines which specific emergency services (Police 112, Women Helpline 1091, Ambulance 108, Childline 1098) are alerted if no one in your Safety Circle is physically nearby.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERSONA_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    id={`select-persona-${opt.type.toLowerCase()}`}
                    type="button"
                    onClick={() => handleSelectType(opt)}
                    className={`p-3.5 text-left rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20 text-white'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div className={`p-2 rounded-xl ${opt.colorClass} border`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-950" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {opt.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                        {opt.subtitle}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-400">Service:</span>
                      <span className="font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/30">
                        {opt.serviceNumber}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Configuration Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> Assigned Emergency Service
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 border border-indigo-400/40 text-indigo-200">
                Dial {currentOption.serviceNumber}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {currentOption.serviceDisplayName}
            </p>
            <p className="text-xs text-slate-300">
              <span className="font-medium text-slate-400">Primary Protection:</span> {currentOption.primaryNeed}
            </p>

            {/* Vicinity Escalation Rule Notice */}
            <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200 leading-relaxed">
                <span className="font-bold text-amber-300">Vicinity Safeguard Rule:</span> If you trigger SOS or miss a check-in and <strong>no contact in your Safety Circle is within {vicinityKm} km</strong>, SAFEGRID will automatically escalate and dispatch to <strong>{currentOption.serviceDisplayName}</strong> along with the nearest verified community responder.
              </p>
            </div>
          </div>

          {/* User Details Form */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal & Safety Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  id="onboarding-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sarah Chen"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Phone Number
                </label>
                <input
                  id="onboarding-input-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Safety Circle Vicinity Radius</span>
                  <span className="text-indigo-400 font-bold">{vicinityKm} km</span>
                </label>
                <input
                  id="onboarding-input-vicinity-radius"
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={vicinityKm}
                  onChange={(e) => setVicinityKm(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-1"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 km (Immediate)</span>
                  <span>3 km (Standard)</span>
                  <span>10 km (Suburban)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Blood Group
                </label>
                <select
                  id="onboarding-select-blood-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Medical Notes & Conditions (Optional for EMS)
              </label>
              <input
                id="onboarding-input-medical"
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g., Mild Asthma, Diabetic, Pacemaker"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            You can change your person type and emergency preferences anytime in the header profile menu.
          </p>
          <button
            id="onboarding-submit-btn"
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/60 hover:shadow-indigo-900/70 transition-all"
          >
            <span>Activate Safety Shield</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
