/**
 * Generates app icon PNGs for all 3 energy variants (low/medium/high).
 * Run: node scripts/generate-icons.mjs
 *
 * Outputs:
 *   resources/icon.png          — default (medium/high energy, green) for @capacitor/assets
 *   resources/icon-low.png      — low energy (blue)
 *   resources/icon-high.png     — high energy (green) — same as default
 *   resources/splash.png        — splash screen (2732x2732)
 *
 * After running, use @capacitor/assets to distribute into native projects:
 *   npx @capacitor/assets generate --assetPath resources --ios --android
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('resources', { recursive: true });

const VARIANTS = {
  // default / medium shown as high-energy green (primary brand color)
  default: { bg: '#16a34a', accent: '#22c55e' },
  low:     { bg: '#1d4ed8', accent: '#3b82f6' },
  high:    { bg: '#16a34a', accent: '#22c55e' },
};

function iconSvg(bg, accent, size = 1024) {
  const r = Math.round(size * 0.214);   // corner radius ~220/1024
  const cx = size / 2;
  const bodyR = Math.round(size * 0.31); // mascot body circle radius
  const eyeR  = Math.round(size * 0.044);
  const eyeOffX = Math.round(size * 0.09);
  const eyeOffY = Math.round(size * 0.05);
  const smileY1 = Math.round(cx + size * 0.05);
  const smileY2 = Math.round(cx + size * 0.14);
  const smileX1 = Math.round(cx - size * 0.13);
  const smileX2 = Math.round(cx + size * 0.13);
  const sw = Math.round(size * 0.035);

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <!-- subtle inner glow ring -->
  <circle cx="${cx}" cy="${cx}" r="${bodyR + Math.round(size*0.04)}" fill="${accent}" opacity="0.25"/>
  <!-- mascot body -->
  <circle cx="${cx}" cy="${cx}" r="${bodyR}" fill="white"/>
  <!-- left eye -->
  <circle cx="${cx - eyeOffX}" cy="${cx - eyeOffY}" r="${eyeR}" fill="#1e293b"/>
  <circle cx="${cx - eyeOffX + Math.round(eyeR*0.3)}" cy="${cx - eyeOffY - Math.round(eyeR*0.3)}" r="${Math.round(eyeR*0.3)}" fill="white" opacity="0.7"/>
  <!-- right eye -->
  <circle cx="${cx + eyeOffX}" cy="${cx - eyeOffY}" r="${eyeR}" fill="#1e293b"/>
  <circle cx="${cx + eyeOffX + Math.round(eyeR*0.3)}" cy="${cx - eyeOffY - Math.round(eyeR*0.3)}" r="${Math.round(eyeR*0.3)}" fill="white" opacity="0.7"/>
  <!-- smile -->
  <path d="M${smileX1} ${smileY1} Q${cx} ${smileY2} ${smileX2} ${smileY1}"
    stroke="#1e293b" stroke-width="${sw}" fill="none" stroke-linecap="round"/>
</svg>`;
}

function splashSvg(size = 2732) {
  const cx = size / 2;
  const bodyR = Math.round(size * 0.12);
  const eyeR  = Math.round(size * 0.017);
  const eyeOffX = Math.round(size * 0.035);
  const eyeOffY = Math.round(size * 0.019);
  const smileY1 = Math.round(cx + size * 0.019);
  const smileY2 = Math.round(cx + size * 0.054);
  const smileX1 = Math.round(cx - size * 0.05);
  const smileX2 = Math.round(cx + size * 0.05);
  const sw = Math.round(size * 0.013);

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#f0fdf4"/>
  <circle cx="${cx}" cy="${cx}" r="${bodyR + Math.round(size*0.015)}" fill="#22c55e" opacity="0.18"/>
  <circle cx="${cx}" cy="${cx}" r="${bodyR}" fill="white"/>
  <circle cx="${cx}" cy="${cx}" r="${bodyR}" fill="none" stroke="#22c55e" stroke-width="${Math.round(size*0.004)}" opacity="0.4"/>
  <circle cx="${cx - eyeOffX}" cy="${cx - eyeOffY}" r="${eyeR}" fill="#1e293b"/>
  <circle cx="${cx + eyeOffX}" cy="${cx - eyeOffY}" r="${eyeR}" fill="#1e293b"/>
  <path d="M${smileX1} ${smileY1} Q${cx} ${smileY2} ${smileX2} ${smileY1}"
    stroke="#1e293b" stroke-width="${sw}" fill="none" stroke-linecap="round"/>
</svg>`;
}

async function generate() {
  const { default: accent, low, high } = VARIANTS;

  // Main icon (default / medium = green)
  await sharp(Buffer.from(iconSvg(accent.bg, accent.accent)))
    .resize(1024, 1024).png().toFile('resources/icon.png');
  console.log('✓ resources/icon.png');

  // Low energy (blue)
  await sharp(Buffer.from(iconSvg(low.bg, low.accent)))
    .resize(1024, 1024).png().toFile('resources/icon-low.png');
  console.log('✓ resources/icon-low.png');

  // High energy (green — same as default, used as named alternate)
  await sharp(Buffer.from(iconSvg(high.bg, high.accent)))
    .resize(1024, 1024).png().toFile('resources/icon-high.png');
  console.log('✓ resources/icon-high.png');

  // Splash screen
  await sharp(Buffer.from(splashSvg()))
    .resize(2732, 2732).png().toFile('resources/splash.png');
  console.log('✓ resources/splash.png');

  console.log('\nDone! Next: npx @capacitor/assets generate --assetPath resources --android');
}

generate().catch(err => { console.error(err); process.exit(1); });
