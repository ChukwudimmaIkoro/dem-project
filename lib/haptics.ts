import { Capacitor } from '@capacitor/core';

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

async function getPlugin() {
  const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
  return { Haptics, ImpactStyle, NotificationType };
}

/** Subtle tap — checkbox toggles, button presses */
export async function hapticLight(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await getPlugin();
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* ignore */ }
}

/** Medium tap — energy level confirm, treat consume */
export async function hapticMedium(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await getPlugin();
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* ignore */ }
}

/** Success pulse — day complete, subscription upgrade */
export async function hapticSuccess(): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await getPlugin();
    await Haptics.notification({ type: NotificationType.Success });
  } catch { /* ignore */ }
}
