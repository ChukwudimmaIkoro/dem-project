/**
 * Dynamic app icon — swaps the launcher icon based on the user's energy level.
 *
 * DEFERRED: requires native project configuration + @capacitor-community/app-icon.
 * Wire-up steps for store submission sprint:
 *   1. npm install @capacitor-community/app-icon
 *   2. Register alternate icons in iOS Info.plist (CFBundleAlternateIcons)
 *   3. Add activity-aliases in Android AndroidManifest.xml
 *   4. Uncomment the implementation below and delete the stub.
 */
export async function setEnergyIcon(_energy: 'low' | 'medium' | 'high'): Promise<void> {
  // no-op until @capacitor-community/app-icon is installed and native projects are configured
}
