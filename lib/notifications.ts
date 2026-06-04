import { Capacitor } from '@capacitor/core';
import { loadAppState } from './storage';
import { getActiveDayIndex, isDayComplete } from './planGenerator';

const MORNING_ID = 1001;
const EVENING_ID = 1002;

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

async function getPlugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

/** Call once on app mount. Requests permission and schedules initial notifications. */
export async function setupNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    const plugin = await getPlugin();
    const { display } = await plugin.requestPermissions();
    if (display !== 'granted') return;
    await scheduleNotifications();
  } catch { /* ignore — non-critical */ }
}

/**
 * Cancel and reschedule both notifications based on current day state.
 * Call on app resume and when day completion status changes.
 */
export async function scheduleNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    const plugin = await getPlugin();

    // Cancel any pending
    const { notifications: pending } = await plugin.getPending();
    if (pending.length > 0) {
      await plugin.cancel({ notifications: pending });
    }

    const now = new Date();
    const toSchedule = [];

    // 8am daily reminder — always on, repeats every day
    const morning = new Date();
    morning.setHours(8, 0, 0, 0);
    if (morning <= now) morning.setDate(morning.getDate() + 1);

    toSchedule.push({
      id: MORNING_ID,
      title: 'Good morning! 🌅',
      body: 'Ready for today? Set your energy and get started.',
      schedule: { at: morning, repeats: true, every: 'day' as const },
      sound: null,
      attachments: null,
      actionTypeId: '',
      extra: null,
    });

    // 9pm streak warning — only if today isn't complete and 9pm hasn't passed
    const dayDone = isTodayComplete();
    if (!dayDone) {
      const evening = new Date();
      evening.setHours(21, 0, 0, 0);
      if (evening > now) {
        toSchedule.push({
          id: EVENING_ID,
          title: "Don't break your streak! 🔥",
          body: "Finish today's goals before midnight to keep it going.",
          schedule: { at: evening },
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
        });
      }
    }

    await plugin.schedule({ notifications: toSchedule });
  } catch { /* ignore — non-critical */ }
}

function isTodayComplete(): boolean {
  try {
    const state = loadAppState();
    if (!state.currentPlan) return false;
    const idx = getActiveDayIndex(state.currentPlan);
    const day = state.currentPlan.days[idx];
    return day ? isDayComplete(day) : false;
  } catch {
    return false;
  }
}
