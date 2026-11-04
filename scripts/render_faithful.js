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

function isInsideLetter(x, y) {
  if (x >= 95 && x <= 312 && y >= 315 && y <= 470) return true; // 'o'
  if (x >= 313 && x <= 445 && y >= 315 && y <= 590) return true; // 'p'
  if (x >= 580 && x <= 752 && y >= 295 && y <= 485) return true; // 'k'
  if (x >= 745 && x <= 785 && y >= 265 && y <= 485) return true; // 'i'
  if (x >= 780 && x <= 928 && y >= 320 && y <= 490) return true; // 'a'
  return false;
}

async function renderFaithful(isDark = false) {
  const inputPath = 'C:/Users/TECHNO/.gemini/antigravity/brain/b8850919-1f1d-4630-8df1-a8be7e886891/.user_uploaded/media_1793809899592_c70ce387.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const outBuf = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);
      const chroma = maxVal - minVal;
      const brightness = (r + g + b) / 3;

      // 1. Background detection:
      // White background threshold
      if (minVal > 246 && chroma < 12) {
        outBuf[idx] = 0;
        outBuf[idx + 1] = 0;
        outBuf[idx + 2] = 0;
        outBuf[idx + 3] = 0;
        continue;
      }

      // Smooth alpha based on departure from white:
      const departure = 255 - minVal;
      let alphaFloat = Math.min(1.0, Math.pow(departure / 210, 0.92));
      const alphaByte = Math.round(alphaFloat * 255);

      if (alphaByte <= 2) {
        outBuf[idx] = 0;
        outBuf[idx + 1] = 0;
        outBuf[idx + 2] = 0;
        outBuf[idx + 3] = 0;
        continue;
      }

      // 2. Black/White Text Letters ('op' and 'kia')
      const isMiddleArea = (x >= 450 && x <= 568 && y >= 280 && y <= 512);
      const isTextLetter = !isMiddleArea && isInsideLetter(x, y) && (chroma < 35 && brightness < 155);

      if (isTextLetter) {
        const textAlpha = Math.min(255, Math.max(0, Math.round((255 - brightness) * 1.65)));
        if (isDark) {
          outBuf[idx] = 255;
          outBuf[idx + 1] = 255;
          outBuf[idx + 2] = 255;
          outBuf[idx + 3] = textAlpha;
        } else {
          outBuf[idx] = 10;
          outBuf[idx + 1] = 14;
          outBuf[idx + 2] = 24;
          outBuf[idx + 3] = textAlpha;
        }
        continue;
      }

      // 3. Colored Pixels: Letter 'E' and Frequency Rings
      // De-blend from white background to recover authentic foreground color:
      const safeAlpha = Math.max(0.18, alphaFloat);
      const unR = Math.min(255, Math.max(0, (r - (1 - safeAlpha) * 255) / safeAlpha));
      const unG = Math.min(255, Math.max(0, (g - (1 - safeAlpha) * 255) / safeAlpha));
      const unB = Math.min(255, Math.max(0, (b - (1 - safeAlpha) * 255) / safeAlpha));

      // Keep 100% of authentic Hue:
      const [origH, origS, origL] = rgbToHsl(unR, unG, unB);

      // Enhance saturation slightly while PRESERVING EXACT HUE & TONE:
      // Boost authentic saturation by 35% so it's not washed out, but KEEP THE EXACT COLOR:
      const enhancedS = Math.min(1.0, origS * 1.35 + 0.12);
      
      // Preserve authentic lightness:
      const enhancedL = Math.max(0.40, Math.min(0.70, origL));

      const [finalR, finalG, finalB] = hslToRgb(origH, enhancedS, enhancedL);

      outBuf[idx] = finalR;
      outBuf[idx + 1] = finalG;
      outBuf[idx + 2] = finalB;
      outBuf[idx + 3] = Math.min(255, Math.round(alphaByte * 1.25));
    }
  }

  const publicDir = path.join(__dirname, '../public');
  const baseName = isDark ? 'logo-dark.png' : 'logo.png';
  const targetPath = path.join(publicDir, baseName);

  // Resize to 2048x1530 with Lanczos3 and apply subtle sharpening for micro-clarity
  await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .resize(2048, 1530, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .sharpen({ sigma: 0.8, m1: 1.0, m2: 2.0 })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(targetPath);

  console.log(`Rendered faithful high-DPI asset: ${baseName}`);

  if (isDark) {
    const cx = 512, cy = 382;
    await sharp(outBuf, { raw: { width, height, channels: 4 } })
      .extract({ left: cx - 360, top: cy - 360, width: 720, height: 720 })
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.8 })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(publicDir, 'logo-icon.png'));
    console.log('Rendered square 512x512 logo-icon.png');
  }
}

async function main() {
  await renderFaithful(false);
  await renderFaithful(true);
  console.log('Faithful authentic logo generated successfully!');
}

main().catch(console.error);
