const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Read scratch_letters.svg
const lettersSvg = fs.readFileSync(path.join(__dirname, '../scratch_letters.svg'), 'utf8');
const matchL = lettersSvg.match(/<path\s+d="([^"]+)"/);
const rawLettersPath = matchL ? matchL[1] : '';

// 2. Read scratch_middle.svg
const middleSvg = fs.readFileSync(path.join(__dirname, '../scratch_middle.svg'), 'utf8');
const matchM = middleSvg.match(/<path\s+d="([^"]+)"/);
const rawMiddlePath = matchM ? matchM[1] : '';

// Clean subpaths
function extractCleanSubpaths(rawPath, minSize = 10) {
  const subpaths = rawPath.split(/(?=M\s+)/);
  return subpaths.filter(sp => {
    const nums = sp.match(/[-+]?\d*\.?\d+/g);
    if (!nums || nums.length < 4) return false;
    let xs = [], ys = [];
    for (let j = 0; j < nums.length; j += 2) {
      xs.push(Number(nums[j]));
      if (j + 1 < nums.length) ys.push(Number(nums[j + 1]));
    }
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    return width >= minSize && height >= minSize;
  });
}

const cleanLetters = extractCleanSubpaths(rawLettersPath, 15).join(' ');
const cleanMiddleSubpaths = extractCleanSubpaths(rawMiddlePath, 30);
const cleanMiddle = cleanMiddleSubpaths.join(' ');

console.log('Clean letters subpath count:', extractCleanSubpaths(rawLettersPath, 15).length);
console.log('Clean middle subpath count:', cleanMiddleSubpaths.length);

// Concentric ring parameters
const cx = 512;
const cy = 382;

// 16 high-definition, brilliant frequency rings with vibrant, glossy gradients
const ringConfigs = [
  { r: 70, stroke: 3.5, start: '#FF1361', end: '#FF6000' },
  { r: 86, stroke: 3.6, start: '#FF2A4D', end: '#FFA000' },
  { r: 102, stroke: 3.8, start: '#FF5E00', end: '#FFD600' },
  { r: 118, stroke: 4.0, start: '#FF9500', end: '#FFEA00' },
  { r: 135, stroke: 4.2, start: '#FFC800', end: '#76FF03' },
  { r: 152, stroke: 4.2, start: '#A6FF00', end: '#00E676' },
  { r: 170, stroke: 4.4, start: '#00F59B', end: '#00F0FF' },
  { r: 188, stroke: 4.5, start: '#00E5FF', end: '#0084FF' },
  { r: 207, stroke: 4.5, start: '#00A2FF', end: '#3D5AFE' },
  { r: 226, stroke: 4.3, start: '#2979FF', end: '#651FFF' },
  { r: 246, stroke: 4.2, start: '#6200EA', end: '#9C27B0' },
  { r: 266, stroke: 4.0, start: '#7C3AED', end: '#D946EF' },
  { r: 286, stroke: 3.8, start: '#A855F7', end: '#EC4899' },
  { r: 306, stroke: 3.6, start: '#D946EF', end: '#F43F5E' },
  { r: 326, stroke: 3.4, start: '#F43F5E', end: '#FF5E00' },
  { r: 346, stroke: 3.2, start: '#FF3366', end: '#FFB800' }
];

function generateSVG(isDark = false) {
  const textColor = isDark ? '#FFFFFF' : '#0B0F19';
  
  // Gradients for each ring
  let defs = `
    <defs>
      <!-- Specular glow / lustrous bloom -->
      <filter id="bloom" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Glossy 3D reflection highlight for middle letter -->
      <linearGradient id="glossSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75" />
        <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.25" />
        <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0" />
      </linearGradient>

      <!-- Master jewel multi-stop glossy gradient for middle letter -->
      <linearGradient id="jewelGrad" x1="20%" y1="5%" x2="80%" y2="95%">
        <stop offset="0%" stop-color="#FF007F" />
        <stop offset="22%" stop-color="#FF3366" />
        <stop offset="42%" stop-color="#FF6A00" />
        <stop offset="58%" stop-color="#FFC107" />
        <stop offset="75%" stop-color="#00E676" />
        <stop offset="88%" stop-color="#00B0FF" />
        <stop offset="100%" stop-color="#7C3AED" />
      </linearGradient>

      <!-- Secondary glossy radial sheen -->
      <radialGradient id="jewelRadial" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
  `;

  // Ring gradients
  ringConfigs.forEach((cfg, idx) => {
    defs += `
      <linearGradient id="ringGrad${idx}" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stop-color="${cfg.start}" />
        <stop offset="100%" stop-color="${cfg.end}" />
      </linearGradient>
    `;
  });

  defs += `</defs>`;

  // Draw concentric rings with smooth anti-aliased circles
  let ringsSvg = `<g id="frequency-rings" filter="url(#bloom)">`;
  ringConfigs.forEach((cfg, idx) => {
    ringsSvg += `
      <circle 
        cx="${cx}" 
        cy="${cy}" 
        r="${cfg.r}" 
        fill="none" 
        stroke="url(#ringGrad${idx})" 
        stroke-width="${cfg.stroke}" 
        stroke-linecap="round" 
        opacity="0.94" 
      />
    `;
  });
  ringsSvg += `</g>`;

  // Middle letter with glossy jewel gradient and specular highlight
  const middleSvgLayer = `
    <g id="middle-letter" filter="url(#bloom)">
      <!-- Main jewel body -->
      <path 
        d="${cleanMiddle}" 
        fill="url(#jewelGrad)" 
        fill-rule="evenodd" 
      />
      <!-- Glossy 3D glass highlight overlay -->
      <path 
        d="${cleanMiddle}" 
        fill="url(#jewelRadial)" 
        fill-rule="evenodd" 
        mix-blend-mode="overlay" 
      />
      <path 
        d="${cleanMiddle}" 
        fill="url(#glossSheen)" 
        fill-rule="evenodd" 
        opacity="0.4" 
      />
    </g>
  `;

  // Surrounding letters 'op' and 'kia'
  const lettersSvgLayer = `
    <g id="brand-text">
      <path 
        d="${cleanLetters}" 
        fill="${textColor}" 
        fill-rule="evenodd" 
      />
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 765" width="1024" height="765">
  ${defs}
  <!-- Layer 1: Frequency Rings -->
  ${ringsSvg}
  <!-- Layer 2: Black/White Main Typography -->
  ${lettersSvgLayer}
  <!-- Layer 3: Central Glossy Jewel Letter -->
  ${middleSvgLayer}
</svg>`;
}

async function build() {
  const publicDir = path.join(__dirname, '../public');

  // 1. Generate SVGs
  const lightSvg = generateSVG(false);
  const darkSvg = generateSVG(true);

  fs.writeFileSync(path.join(publicDir, 'logo.svg'), lightSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'logo-dark.svg'), darkSvg, 'utf8');
  console.log('Generated logo.svg and logo-dark.svg successfully!');

  // 2. Render Ultra-High-Definition PNGs at 2048 x 1530 (2x retina)
  await sharp(Buffer.from(lightSvg), { density: 144 })
    .resize(2048, 1530)
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('Rendered high-res public/logo.png');

  await sharp(Buffer.from(darkSvg), { density: 144 })
    .resize(2048, 1530)
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(path.join(publicDir, 'logo-dark.png'));
  console.log('Rendered high-res public/logo-dark.png');

  // 3. Render icon (centered on the jewel letter & rings)
  await sharp(Buffer.from(darkSvg), { density: 144 })
    .extract({ left: Math.round((512 - 360) * 2), top: Math.round((382 - 360) * 2), width: 720 * 2, height: 720 * 2 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-icon.png'));
  console.log('Rendered square public/logo-icon.png');
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
