/**
 * SAFEGRID Persistent Storage Service
 * Saves and loads user data from localStorage so it survives page refreshes.
 * Each key is scoped to the authenticated user's ID.
 */

import type { UserProfile, SafetyContact, CheckInSchedule, Journey } from '../types';

function userKey(userId: string, key: string): string {
  return `safegrid_${userId}_${key}`;
}

// ---- Profile ----
export function saveProfile(userId: string, profile: UserProfile): void {
  try {
    localStorage.setItem(userKey(userId, 'profile'), JSON.stringify(profile));
  } catch { /* quota exceeded */ }
}

export function loadProfile(userId: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(userKey(userId, 'profile'));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---- Trusted Contacts ----
export function saveContacts(userId: string, contacts: SafetyContact[]): void {
  try {
    localStorage.setItem(userKey(userId, 'contacts'), JSON.stringify(contacts));
  } catch { /* quota exceeded */ }
}

export function loadContacts(userId: string): SafetyContact[] | null {
  try {
    const raw = localStorage.getItem(userKey(userId, 'contacts'));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---- Check-In Settings ----
export function saveCheckIns(userId: string, checkins: CheckInSchedule[]): void {
  try {
    localStorage.setItem(userKey(userId, 'checkins'), JSON.stringify(checkins));
  } catch { /* quota exceeded */ }
}

export function loadCheckIns(userId: string): CheckInSchedule[] | null {
  try {
    const raw = localStorage.getItem(userKey(userId, 'checkins'));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---- Saved Journeys ----
export function saveSavedJourneys(userId: string, journeys: Journey[]): void {
  try {
    localStorage.setItem(userKey(userId, 'saved_journeys'), JSON.stringify(journeys));
  } catch { /* quota exceeded */ }
}

export function loadSavedJourneys(userId: string): Journey[] | null {
  try {
    const raw = localStorage.getItem(userKey(userId, 'saved_journeys'));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---- Onboarding Status ----
export function saveOnboardingComplete(userId: string): void {
  try {
    localStorage.setItem(userKey(userId, 'onboarding_complete'), 'true');
  } catch { /* quota exceeded */ }
}

export function isOnboardingComplete(userId: string): boolean {
  try {
    return localStorage.getItem(userKey(userId, 'onboarding_complete')) === 'true';
  } catch { return false; }
}

// ---- Clear all user data (logout) ----
export function clearUserData(userId: string): void {
  const keys = ['profile', 'contacts', 'checkins', 'saved_journeys', 'onboarding_complete'];
  keys.forEach(k => {
    try { localStorage.removeItem(userKey(userId, k)); } catch {}
  });
}
