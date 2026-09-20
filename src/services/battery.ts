/**
 * Real Android & Web Battery Synchronization Service
 * 
 * Accurately retrieves genuine battery percentage and charging state
 * from Android OS BatteryManager (via AndroidBatteryBridge) or the Web Battery API.
 * Never generates fake or random battery data in normal mode.
 */

import { BatteryInfo, BatteryStateCategory } from '../types';

declare global {
  interface Window {
    AndroidBatteryBridge?: {
      getBatteryLevel: () => number;
      isCharging: () => boolean;
      isAvailable: () => boolean;
    };
  }
}

export function categorizeBattery(level: number | null): BatteryStateCategory {
  if (level === null || isNaN(level)) return 'UNAVAILABLE';
  if (level > 50) return 'NORMAL';
  if (level >= 20) return 'MODERATE';
  if (level >= 10) return 'LOW';
  return 'CRITICAL';
}

export async function getRealBatteryStatus(): Promise<BatteryInfo> {
  // 1. Check Native Android Bridge (Inside APK / Capacitor WebView)
  if (typeof window !== 'undefined' && window.AndroidBatteryBridge) {
    try {
      if (window.AndroidBatteryBridge.isAvailable()) {
        const level = window.AndroidBatteryBridge.getBatteryLevel();
        const charging = window.AndroidBatteryBridge.isCharging();
        if (typeof level === 'number' && level >= 0 && level <= 100) {
          return {
            level,
            isCharging: charging,
            state: categorizeBattery(level),
            isAvailable: true,
            source: 'ANDROID_NATIVE',
          };
        }
      }
    } catch (err) {
      console.warn('[SafeGrid Battery] Native bridge read error:', err);
    }
  }

  // 2. Check Modern Web Battery Status API (WebView / Chrome / Edge)
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const battery: any = await (navigator as any).getBattery();
      if (battery && typeof battery.level === 'number') {
        const pct = Math.round(battery.level * 100);
        return {
          level: pct,
          isCharging: !!battery.charging,
          state: categorizeBattery(pct),
          isAvailable: true,
          source: 'WEB_API',
        };
      }
    } catch (err) {
      console.warn('[SafeGrid Battery] Web Battery API unavailable or restricted:', err);
    }
  }

  // 3. Fallback: explicitly report unavailable rather than faking data
  return {
    level: null,
    isCharging: null,
    state: 'UNAVAILABLE',
    isAvailable: false,
    source: 'UNAVAILABLE',
  };
}

/**
 * Subscribes to real battery level and charging state changes.
 * Automatically cleans up listeners and intervals.
 */
export function subscribeBatteryChanges(
  onChange: (info: BatteryInfo) => void
): () => void {
  let isCleanedUp = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let batteryRef: any = null;
  let intervalId: NodeJS.Timeout | null = null;

  const update = async () => {
    if (isCleanedUp) return;
    const status = await getRealBatteryStatus();
    if (!isCleanedUp) {
      onChange(status);
    }
  };

  // Initial immediate fetch
  update();

  // If Web Battery API is supported, attach native events
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).getBattery()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((b: any) => {
        if (isCleanedUp || !b) return;
        batteryRef = b;
        b.addEventListener('levelchange', update);
        b.addEventListener('chargingchange', update);
      })
      .catch(() => {});
  }

  // Set periodic check every 25 seconds for Android bridge and general polling
  intervalId = setInterval(update, 25000);

  return () => {
    isCleanedUp = true;
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (batteryRef) {
      try {
        batteryRef.removeEventListener('levelchange', update);
        batteryRef.removeEventListener('chargingchange', update);
      } catch {}
    }
  };
}
