/**
 * SAFEGRID Auth Service
 * Lightweight email/password auth via Express backend.
 * Session persisted in localStorage.
 */

const API_BASE = '';
const TOKEN_KEY = 'safegrid_auth_token';
const USER_KEY = 'safegrid_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/** Register a new user */
export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        token: data.token,
      };
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      return { success: true, user: authUser };
    }
    return { success: false, error: data.error || 'Registration failed' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/** Login with email/password */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        token: data.token,
      };
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      return { success: true, user: authUser };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/** Check if user is already logged in from localStorage */
export function getStoredAuth(): AuthUser | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    if (token && userStr) {
      const user = JSON.parse(userStr) as AuthUser;
      if (user.id && user.email) {
        return user;
      }
    }
  } catch {
    // corrupted storage
  }
  return null;
}

/** Logout — clear session */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Get current auth token for API calls */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
