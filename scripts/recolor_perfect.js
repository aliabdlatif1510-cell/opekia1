const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
  }
  return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360;
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Bounding box check for text letters 'o', 'p', 'k', 'i', 'a'
function isInsideLetter(x, y) {
  // 'o':
  if (x >= 95 && x <= 312 && y >= 315 && y <= 470) return true;
  // 'p':
  if (x >= 313 && x <= 445 && y >= 315 && y <= 590) return true;
  // 'k':
  if (x >= 580 && x <= 752 && y >= 295 && y <= 485) return true;
  // 'i' (stem & dot):
  if (x >= 745 && x <= 785 && y >= 265 && y <= 485) return true;
  // 'a':
  if (x >= 780 && x <= 928 && y >= 320 && y <= 490) return true;
  return false;
}

// Compute pure radiant jewel color for letter E based on position
function getPureLetterEColor(x, y) {
  // Normalize inside bounding box of letter E: x in [455, 560], y in [290, 500]
  const nx = (x - 455) / 105;
  const ny = (y - 290) / 210;

  let h, s = 0.98, l = 0.54;

  if (ny < 0.45) {
    // Upper loop:
    // nx: 0 (left: golden yellow, h=52) -> 0.45 (crest: orange, h=28) -> 1.0 (right: hot ruby pink, h=335)
    if (nx < 0.45) {
      h = 52 - (nx / 0.45) * 24; // 52 down to 28
      l = 0.58;
    } else {
      const t = (nx - 0.45) / 0.55;
      h = 28 - t * 50; // 28 down through 0 to 338
      if (h < 0) h += 360;
      l = 0.54;
    }
  } else if (ny >= 0.45 && ny < 0.56) {
    // Crossbar: vibrant glowing crimson ruby
    const t = nx;
    h = 346 + t * 8;
    l = 0.51;
  } else if (nx < 0.38 && ny >= 0.56 && ny < 0.82) {
    // Lower left stem: electric cyan into sapphire blue
    const t = (ny - 0.56) / 0.26;
    h = 188 + t * 34; // 188 (cyan) to 222 (royal blue)
    l = 0.52;
  } else {
    // Lower bowl sweep: neon emerald into amber gold into hot coral
    if (nx < 0.56) {
      const t = Math.max(0, (nx - 0.25) / 0.31);
      h = 145 - t * 95; // 145 (emerald) down to 50 (gold)
      l = 0.53;
    } else {
      const t = (nx - 0.56) / 0.38;
      h = 50 - t * 35; // 50 (gold) down to 15 (coral/flame)
      l = 0.55;
    }
  }

  return hslToRgb(h, s, l);
}

// Compute pure radiant color for frequency rings based on radius and angle
function getPureRingColor(radius, angleDeg, origH) {
  // Radius range from 65px (inner) to 345px (outer)
  const nr = Math.max(0, Math.min(1, (radius - 65) / 280));

  let baseH;
  if (nr < 0.25) {
    baseH = (348 + (nr / 0.25) * 60) % 360; // 348 (crimson) -> 48 (amber)
  } else if (nr < 0.50) {
    baseH = 48 + ((nr - 0.25) / 0.25) * 97; // 48 (amber) -> 145 (emerald)
  } else if (nr < 0.75) {
    baseH = 145 + ((nr - 0.50) / 0.25) * 72; // 145 (emerald) -> 217 (azure blue)
  } else {
    baseH = 217 + ((nr - 0.75) / 0.25) * 85; // 217 (blue) -> 302 (magenta)
  }

  // If original hue is present and not completely gray, blend 35% towards it
  let h = baseH;
  if (origH !== null) {
    let diff = ((origH - baseH + 180) % 360) - 180;
    if (Math.abs(diff) < 70) {
      h = baseH + diff * 0.35;
    }
  }

  return hslToRgb(h, 0.96, 0.54);
}

async function renderLogo(isDark = false) {
  const inputPath = 'C:/Users/TECHNO/.gemini/antigravity/brain/b8850919-1f1d-4630-8df1-a8be7e886891/.user_uploaded/media_1793809899592_c70ce387.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const outBuf = Buffer.alloc(width * height * 4);
  const cx = 512, cy = 382;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const chroma = maxVal - minVal;
      const brightness = (r + g + b) / 3;

      // 1. Transparent background (near white, low chroma)
      if (minVal > 240 && chroma < 16) {
        outBuf[idx] = 0;
        outBuf[idx + 1] = 0;
        outBuf[idx + 2] = 0;
        outBuf[idx + 3] = 0;
        continue;
      }

      // Middle letter area: x in [452, 565], y in [285, 508]
      const isMiddleArea = (x >= 452 && x <= 565 && y >= 285 && y <= 508);

      // 2. Black/White Text Letters ('op' and 'kia')
      // Must be strictly INSIDE the letter bounding box, dark, and low chroma
      const isTextLetter = !isMiddleArea && isInsideLetter(x, y) && (chroma < 35 && brightness < 155);

      if (isTextLetter) {
        const alpha = Math.min(255, Math.max(0, Math.round((255 - brightness) * 1.6)));
        if (isDark) {
          outBuf[idx] = 255;
          outBuf[idx + 1] = 255;
          outBuf[idx + 2] = 255;
          outBuf[idx + 3] = alpha;
        } else {
          outBuf[idx] = 11;
          outBuf[idx + 1] = 15;
          outBuf[idx + 2] = 25;
          outBuf[idx + 3] = alpha;
        }
        continue;
      }

      // 3. Middle stylized letter 'E'
      if (isMiddleArea) {
        const [pureR, pureG, pureB] = getPureLetterEColor(x, y);
        const departureFromWhite = 255 - minVal;
        const alpha = Math.min(255, Math.max(0, Math.round(departureFromWhite * 1.55)));

        outBuf[idx] = pureR;
        outBuf[idx + 1] = pureG;
        outBuf[idx + 2] = pureB;
        outBuf[idx + 3] = alpha;
        continue;
      }

      // 4. Frequency Rings (concentric circular soundwaves)
      const dx = x - cx;
      const dy = y - cy;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

      let origH = null;
      if (chroma > 15) {
        origH = rgbToHsl(r, g, b)[0];
      }

      const [pureR, pureG, pureB] = getPureRingColor(radius, angleDeg, origH);
      const departureFromWhite = 255 - minVal;
      const alpha = Math.min(255, Math.max(0, Math.round(departureFromWhite * 1.55)));

      outBuf[idx] = pureR;
      outBuf[idx + 1] = pureG;
      outBuf[idx + 2] = pureB;
      outBuf[idx + 3] = alpha;
    }
  }

  const publicDir = path.join(__dirname, '../public');
  const baseName = isDark ? 'logo-dark.png' : 'logo.png';
  const targetPath = path.join(publicDir, baseName);

  // Resize with Lanczos3 to 2048x1530 for Retina/4K high-density pixels
  await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .resize(2048, 1530, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(targetPath);

  console.log(`Rendered 2048x1530 Retina asset: ${baseName}`);

  // Also render icon for dark mode
  if (isDark) {
    await sharp(outBuf, { raw: { width, height, channels: 4 } })
      .extract({ left: cx - 360, top: cy - 360, width: 720, height: 720 })
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(publicDir, 'logo-icon.png'));
    console.log('Rendered square 512x512 logo-icon.png');
  }
}

async function main() {
  await renderLogo(false);
  await renderLogo(true);
  console.log('All logo assets updated successfully!');
}

main().catch(console.error);
