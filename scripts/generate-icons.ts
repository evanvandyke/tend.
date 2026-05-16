/**
 * Generate PWA icons for Tend.
 *
 * Creates SVG-based PNG placeholders using a simple canvas approach.
 * Run with: npx tsx scripts/generate-icons.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const PARCHMENT = '#F2E8CF';
const FOREST = '#2D5235';
const BORDEAUX = '#7A2E1F';

function generateSvg(size: number, maskable: boolean = false): string {
  // For maskable icons, content should be within the safe zone (80% of icon)
  const padding = maskable ? size * 0.1 : 0;
  const contentSize = size - padding * 2;
  const fontSize = contentSize * 0.55;
  const periodSize = contentSize * 0.12;

  // Position the "T" and "."
  const textX = size / 2 - fontSize * 0.15;
  const textY = size / 2 + fontSize * 0.35;
  const periodX = textX + fontSize * 0.35;
  const periodY = textY;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PARCHMENT}"/>
  <text x="${textX}" y="${textY}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="bold" fill="${FOREST}" text-anchor="middle" dominant-baseline="middle">T</text>
  <circle cx="${periodX}" cy="${periodY + fontSize * 0.2}" r="${periodSize}" fill="${BORDEAUX}"/>
</svg>`;
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Write SVGs (these will serve as fallbacks and source files)
const icons = [
  { name: 'icon-192.svg', size: 192, maskable: false },
  { name: 'icon-512.svg', size: 512, maskable: false },
  { name: 'icon-maskable-512.svg', size: 512, maskable: true },
];

for (const icon of icons) {
  const svg = generateSvg(icon.size, icon.maskable);
  fs.writeFileSync(path.join(iconsDir, icon.name), svg);
  console.log(`Generated ${icon.name}`);
}

// Also create PNG placeholder files using SVG data URIs encoded as minimal valid PNGs
// For a real build, you'd use sharp or canvas to convert SVG -> PNG
// For now, we'll create the SVG files and also copy them as .png with SVG content
// (browsers will still render them from the manifest in many cases)

// Actually let's create minimal valid 1x1 PNGs as true placeholders
// and document that they should be regenerated with a proper tool

// Minimal valid PNG (1x1 pixel, parchment color) - this is a proper PNG header
// For real icons, run: npx sharp-cli --input public/icons/icon-192.svg --output public/icons/icon-192.png --resize 192
const minimalPngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // 8-bit RGB
  0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
  0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82, // IEND chunk
]);

// Write placeholder PNGs
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), minimalPngHeader);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), minimalPngHeader);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), minimalPngHeader);

console.log('\nPlaceholder PNGs created. For production-quality icons, convert the SVGs:');
console.log('  npx sharp --input public/icons/icon-192.svg --output public/icons/icon-192.png resize 192 192');
console.log('  npx sharp --input public/icons/icon-512.svg --output public/icons/icon-512.png resize 512 512');
console.log('  npx sharp --input public/icons/icon-maskable-512.svg --output public/icons/icon-maskable-512.png resize 512 512');
