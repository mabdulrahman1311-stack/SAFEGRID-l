/**
 * SAFEGRID Comprehensive Guided Onboarding Flow
 * 6-step wizard: Persona -> Personal Info -> Trusted Member -> Check-in -> Emergency Preferences -> Permissions
 */
import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  User, 
  HeartHandshake, 
  GraduationCap, 
  Baby, 
  Stethoscope, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Phone, 
  Heart, 
  Clock, 
  MapPin, 
  Bell, 
  Sparkles,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useSafeGrid } from '../../context/SafeGridContext';
import { PersonType, EmergencyServiceType, SafetyContact } from '../../types';
import { saveOnboardingComplete, saveProfile, saveContacts, saveCheckIns } from '../../services/storage';

interface Props {
  userId: string;
  userEmail: string;
  initialName?: string;
  onComplete: () => void;
}

interface PersonaOption {
  type: PersonType;
  title: string;
  subtitle: string;
  recommendedService: EmergencyServiceType;
  serviceDisplayName: string;
  serviceNumber: string;
  icon: React.ElementType;
  accentColor: string;
  defaultVicinityKm: number;
}

const PERSONAS: PersonaOption[] = [
  {
    type: 'SOLO_WOMAN',
    title: 'Solo Woman / Night Commuter',
    subtitle: 'Transit protection, night route tracking, 1091 women distress hotline',
    recommendedService: 'WOMEN_1091',
    serviceDisplayName: '1091 Women Safety Distress Line',
    serviceNumber: '1091',
    icon: ShieldAlert,
    accentColor: 'pink',
    defaultVicinityKm: 3.0,
  },
  {
    type: 'SENIOR',
    title: 'Senior Citizen / Living Alone',
    subtitle: 'Fall detection, regular welfare reminders, 108 medical ambulance',
    recommendedService: 'AMBULANCE_108',
    serviceDisplayName: '108 National Emergency Medical Services',
    serviceNumber: '108',
    icon: HeartHandshake,
    accentColor: 'amber',
    defaultVicinityKm: 2.5,
  },
  {
    type: 'GUARDIAN',
    title: 'Parent / Family Guardian',
    subtitle: 'Child safety tracking, arrival curfews, family circle alerts',
    recommendedService: 'CHILDLINE_1098',
    serviceDisplayName: '1098 National Child Safety Emergency Line',
    serviceNumber: '1098',
    icon: Baby,
    accentColor: 'emerald',
    defaultVicinityKm: 5.0,
  },
  {
    type: 'STUDENT',
    title: 'Student / Young Adult',
    subtitle: 'Campus night safety, peer buddy tracking, 112 emergency line',
    recommendedService: 'POLICE_112',
    serviceDisplayName: '112 Unified Emergency Response',
    serviceNumber: '112',
    icon: GraduationCap,
    accentColor: 'indigo',
    defaultVicinityKm: 2.0,
  },
  {
    type: 'RESPONDER',
    title: 'Community First Responder',
    subtitle: 'CPR/First-aid certified, receives localized vicinity alerts',
    recommendedService: 'AMBULANCE_108',
    serviceDisplayName: '108 Medical Trauma & Rapid Response',
    serviceNumber: '108',
    icon: Stethoscope,
    accentColor: 'blue',
    defaultVicinityKm: 5.0,
  },
  {
    type: 'GENERAL',
    title: 'General Citizen / Solo Traveler',
    subtitle: 'Universal journey tracking, reliable safe circle, 112 emergency',
    recommendedService: 'POLICE_112',
    serviceDisplayName: '112 All-Emergency Police & Dispatch',
    serviceNumber: '112',
    icon: User,
    accentColor: 'cyan',
    defaultVicinityKm: 3.0,
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RELATIONSHIPS = [
  'Mother', 'Father', 'Spouse', 'Partner', 'Son', 'Daughter', 
  'Sister', 'Brother', 'Friend', 'Roommate', 'Colleague', 'Neighbor', 'Campus Security'
];

export const OnboardingFlow: React.FC<Props> = ({
  userId,
  userEmail,
  initialName = '',
  onComplete
}) => {
  const { 
    currentUser, 
    updateCurrentUserProfile, 
    setPersonTypeAndConfigure, 
    contacts, 
    addContact,
    checkins,
    addCheckIn,
    refreshLiveGps
  } = useSafeGrid();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 1: Persona
  const [selectedPersona, setSelectedPersona] = useState<PersonType>('SOLO_WOMAN');

  // Step 2: Personal details
  const [fullName, setFullName] = useState(initialName || currentUser.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [medicalConditions, setMedicalConditions] = useState(currentUser.medicalConditions?.join(', ') || '');
  const [emergencyNotes, setEmergencyNotes] = useState(currentUser.emergencyNotes || '');

  // Step 3: First trusted contact
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Parent');

  // Step 4: Check-in setup
  const [enableCheckIn, setEnableCheckIn] = useState(true);
  const [checkInLabel, setCheckInLabel] = useState('Morning Welfare Check');
  const [checkInTime, setCheckInTime] = useState('09:00');

  // Step 5: Emergency preferences
  const [primaryService, setPrimaryService] = useState<EmergencyServiceType>('POLICE_112');
  const [vicinityRadius, setVicinityRadius] = useState<number>(3.0);

  // Step 6: Permissions
  const [gpsGranted, setGpsGranted] = useState<boolean | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  // Step validation error
  const [validationError, setValidationError] = useState('');

  // Handle persona select
  const handleSelectPersona = (p: PersonaOption) => {
    setSelectedPersona(p.type);
    setPrimaryService(p.recommendedService);
    setVicinityRadius(p.defaultVicinityKm);
    if (p.type === 'SENIOR') {
      setCheckInLabel('Morning Medication & Welfare');
    } else if (p.type === 'STUDENT' || p.type === 'SOLO_WOMAN') {
      setCheckInLabel('Evening Commute Safety Check');
      setCheckInTime('20:00');
    }
  };

  // Next step handler with validation
  const handleNext = () => {
    setValidationError('');

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name');
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.length < 8) {
        setValidationError('Please enter a valid phone number');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!contactName.trim() && contacts.length === 0) {
        setValidationError('Please provide at least one trusted emergency contact');
        return;
      }
      if (contactName.trim() && (!contactPhone.trim() || contactPhone.length < 8)) {
        setValidationError('Please provide a valid phone number for your contact');
        return;
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      setStep(5);
      return;
    }

    if (step === 5) {
      setStep(6);
      return;
    }
  };

  // Permission requests
  const handleRequestLocation = async () => {
    setGpsLoading(true);
    try {
      if ('geolocation' in navigator) {
        await refreshLiveGps();
        setGpsGranted(true);
      } else {
        setGpsGranted(false);
      }
    } catch {
      setGpsGranted(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotifGranted(permission === 'granted');
      } catch {
        setNotifGranted(false);
      }
    } else {
      setNotifGranted(false);
    }
  };

  // Finish Onboarding
  const handleFinish = () => {
    // 1. Configure persona & profile
    const conditions = medicalConditions
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    setPersonTypeAndConfigure(selectedPersona, {
      name: fullName.trim(),
      phone: phoneNumber.trim(),
      email: userEmail,
      bloodGroup,
      medicalConditions: conditions,
      emergencyNotes: emergencyNotes.trim(),
      preferredEmergencyService: primaryService,
      vicinityRadiusKm: vicinityRadius,
    });

    const updatedProfile = {
      ...currentUser,
      name: fullName.trim(),
      phone: phoneNumber.trim(),
      email: userEmail,
      personType: selectedPersona,
      bloodGroup,
      medicalConditions: conditions,
      emergencyNotes: emergencyNotes.trim(),
      preferredEmergencyService: primaryService,
      vicinityRadiusKm: vicinityRadius,
    };
    saveProfile(userId, updatedProfile);

    // 2. Add Trusted Contact if entered
    if (contactName.trim() && contactPhone.trim()) {
      const newContact: Omit<SafetyContact, 'id'> = {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship: contactRelationship,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        isPrimary: true,
        canVerifyWelfare: true,
        canReceiveSOS: true,
        canTrackLiveJourney: true,
        distanceKm: 1.2,
        approxLocation: 'Local Safety Circle (1.2 km)',
      };
      addContact(newContact);
      saveContacts(userId, [...contacts, { ...newContact, id: 'contact_' + Date.now() }]);
    }

    // 3. Add Check-in if enabled
    if (enableCheckIn) {
      const formattedTime = checkInTime.length === 5 
        ? checkInTime.slice(0, 5) 
        : '09:00';
      const newCheckIn = {
        label: checkInLabel.trim() || 'Daily Welfare Check',
        scheduledTime: formattedTime,
        gracePeriodMinutes: 15,
        frequency: 'DAILY' as const,
        category: (selectedPersona === 'SENIOR' ? 'MEDICATION' : 'WELFARE') as any,
      };
      addCheckIn(newCheckIn);
      saveCheckIns(userId, [...checkins, { ...newCheckIn, id: 'checkin_' + Date.now(), isCompletedToday: false }]);
    }

    // 4. Mark Onboarding Complete in storage
    saveOnboardingComplete(userId);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 overflow-y-auto">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">SAFEGRID Setup</h1>
            <p className="text-xs text-slate-400">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress bar dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx + 1 === step 
                  ? 'w-6 bg-emerald-400' 
                  : idx + 1 < step 
                    ? 'w-2 bg-emerald-600' 
                    : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full flex flex-col justify-between">
        <div>
          {validationError && (
            <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-300 text-xs animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Persona Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Sparkles className="w-3 h-3" /> Step 1: Personalization
                </span>
                <h2 className="text-xl font-bold text-white">How will you use SAFEGRID?</h2>
                <p className="text-xs text-slate-400 mt-1">
                  We customize emergency numbers, check-in prompts, and alerts to match your safety profile.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPersona === p.type;
                  return (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                        isSelected 
                          ? 'bg-slate-800/90 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/20' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isSelected 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white truncate">{p.title}</h3>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{p.subtitle}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            Line: {p.serviceNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Vicinity: {p.defaultVicinityKm} km
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <User className="w-3 h-3" /> Step 2: Personal Profile
                </span>
                <h2 className="text-xl font-bold text-white">Your Medical & Contact Info</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Shared securely with first responders and your trusted circle in an active emergency.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (with country code) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBloodGroup(bg)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
                          bloodGroup === bg 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 ring-1 ring-rose-500/40' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Medical Conditions or Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="e.g. Asthma, Penicillin allergy, Diabetes"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Dispatch Notes</label>
                  <textarea
                    rows={2}
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    placeholder="e.g. Door access code, flat number, specific instructions..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Trusted Member */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Users className="w-3 h-3" /> Step 3: Safety Circle
                </span>
                <h2 className="text-xl font-bold text-white">Add Your First Trusted Contact</h2>
                <p className="text-xs text-slate-400 mt-1">
                  This person will receive your live SOS alert, route delays, and welfare verification checks.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3.5 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Elena (Mom)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                  <select
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none transition"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel} className="bg-slate-900 text-white">
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Automatically granted SOS alerts & welfare checks
                  </p>
                  <p className="text-[11px] text-slate-500">
                    You can add more circle members or customize permissions anytime in the Members tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Welfare & Check-in Schedule */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <Clock className="w-3 h-3" /> Step 4: Proactive Check-In
                </span>
                <h2 className="text-xl font-bold text-white">Daily Safety Check-In</h2>
                <p className="text-xs text-slate-400 mt-1">
                  SAFEGRID checks in on you automatically. If you miss it past grace period, your circle is alerted.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Enable Daily Check-In</h3>
                    <p className="text-xs text-slate-400">Receive a 1-tap confirmation prompt</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableCheckIn}
                      onChange={(e) => setEnableCheckIn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {enableCheckIn && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Check-in Name / Purpose</label>
                      <input
                        type="text"
                        value={checkInLabel}
                        onChange={(e) => setCheckInLabel(e.target.value)}
                        placeholder="e.g. Morning Safety Check"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time</label>
                      <input
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none transition"
                      />
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span>15-minute grace period before safety escalation kicks in.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Emergency Preferences */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <ShieldAlert className="w-3 h-3" /> Step 5: Dispatch Settings
                </span>
                <h2 className="text-xl font-bold text-white">Emergency Services & Vicinity</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure which service to dial directly and what distance constitutes your local circle.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Emergency Hotlink</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'POLICE_112', title: '112 — National Emergency & Police', desc: 'Unified distress dispatch across all states' },
                      { id: 'WOMEN_1091', title: '1091 — Women Helpline & Rapid Escort', desc: 'Dedicated anti-harassment and night transit assistance' },
                      { id: 'AMBULANCE_108', title: '108 — Emergency Medical & Ambulance', desc: 'Immediate trauma, fall, and medical response' },
                      { id: 'CHILDLINE_1098', title: '1098 — Childline Protection', desc: '24/7 dedicated minor and family safety service' },
                    ].map((srv) => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setPrimaryService(srv.id as EmergencyServiceType)}
                        className={`text-left p-3 rounded-xl border transition ${
                          primaryService === srv.id
                            ? 'bg-slate-800 border-emerald-500/80 ring-1 ring-emerald-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{srv.title}</span>
                          {primaryService === srv.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{srv.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Safety Circle Vicinity Radius</label>
                    <span className="text-xs font-bold text-emerald-400">{vicinityRadius.toFixed(1)} km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={vicinityRadius}
                    onChange={(e) => setVicinityRadius(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Contacts within this distance from your live position are tagged as "In Vicinity" and alerted first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Location & Permissions */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <MapPin className="w-3 h-3" /> Step 6: Final Verification
                </span>
                <h2 className="text-xl font-bold text-white">Device Permissions</h2>
                <p className="text-xs text-slate-400 mt-1">
                  SAFEGRID requires GPS access to monitor journeys and push notifications for urgent check-ins.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Location Permission */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">GPS Geolocation</h3>
                      <p className="text-xs text-slate-400">Accurate emergency coordinates</p>
                    </div>
                  </div>

                  <div>
                    {gpsGranted === true ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Granted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestLocation}
                        disabled={gpsLoading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                      >
                        {gpsLoading ? 'Checking...' : 'Allow GPS'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification Permission */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Push Notifications</h3>
                      <p className="text-xs text-slate-400">Welfare check-in alerts & pings</p>
                    </div>
                  </div>

                  <div>
                    {notifGranted === true ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Granted
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestNotification}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Allow Alerts
                      </button>
                    )}
                  </div>
                </div>

                {/* Review summary */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2 mt-4 text-xs">
                  <h4 className="font-semibold text-slate-300">Ready to activate your safety shield:</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>• User: <span className="text-white font-medium">{fullName} ({phoneNumber})</span></li>
                    <li>• Persona: <span className="text-white font-medium">{selectedPersona}</span></li>
                    <li>• Primary Hotlink: <span className="text-white font-medium">{primaryService}</span></li>
                    {contactName && (
                      <li>• Trusted Contact: <span className="text-white font-medium">{contactName} ({contactRelationship})</span></li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-6 pb-2 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => { setValidationError(''); setStep(step - 1); }}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.99]"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-[0.99]"
            >
              <Shield className="w-4 h-4" /> Activate SAFEGRID Protection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
