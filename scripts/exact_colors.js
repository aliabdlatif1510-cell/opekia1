const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function isInsideLetter(x, y) {
  if (x >= 95 && x <= 312 && y >= 315 && y <= 470) return true; // 'o'
  if (x >= 313 && x <= 445 && y >= 315 && y <= 590) return true; // 'p'
  if (x >= 580 && x <= 752 && y >= 295 && y <= 485) return true; // 'k'
  if (x >= 745 && x <= 785 && y >= 265 && y <= 485) return true; // 'i'
  if (x >= 780 && x <= 928 && y >= 320 && y <= 490) return true; // 'a'
  return false;
}

async function renderExact(isDark = false) {
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

      // 1. Pure White Background -> Fully Transparent
      if (minVal > 248 && chroma < 10) {
        outBuf[idx] = 0;
        outBuf[idx + 1] = 0;
        outBuf[idx + 2] = 0;
        outBuf[idx + 3] = 0;
        continue;
      }

      // Calculate clean alpha:
      const departure = 255 - minVal;
      const alpha = Math.min(255, Math.max(0, Math.round(departure * 1.35)));

      if (alpha <= 3) {
        outBuf[idx] = 0;
        outBuf[idx + 1] = 0;
        outBuf[idx + 2] = 0;
        outBuf[idx + 3] = 0;
        continue;
      }

      // 2. Text letters ('op' and 'kia')
      const isMiddleArea = (x >= 450 && x <= 568 && y >= 280 && y <= 512);
      const isTextLetter = !isMiddleArea && isInsideLetter(x, y) && (chroma < 35 && brightness < 155);

      if (isDark && isTextLetter) {
        // Pure white for dark mode
        outBuf[idx] = 255;
        outBuf[idx + 1] = 255;
        outBuf[idx + 2] = 255;
        outBuf[idx + 3] = Math.min(255, Math.round((255 - brightness) * 1.6));
        continue;
      }

      // 3. For ALL other pixels (Letter E and frequency rings):
      // Keep 100% EXACT original RGB values sent by user!
      outBuf[idx] = r;
      outBuf[idx + 1] = g;
      outBuf[idx + 2] = b;
      outBuf[idx + 3] = alpha;
    }
  }

  const publicDir = path.join(__dirname, '../public');
  const baseName = isDark ? 'logo-dark.png' : 'logo.png';
  const targetPath = path.join(publicDir, baseName);

  // Resize with Lanczos3 for crisp retina presentation
  await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .resize(2048, 1530, {
      kernel: sharp.kernel.lanczos3,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(targetPath);

  console.log(`Saved exact colors high-DPI asset: ${baseName}`);

  if (isDark) {
    const cx = 512, cy = 382;
    await sharp(outBuf, { raw: { width, height, channels: 4 } })
      .extract({ left: cx - 360, top: cy - 360, width: 720, height: 720 })
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(publicDir, 'logo-icon.png'));
    console.log('Saved square 512x512 logo-icon.png');
  }
}

async function main() {
  await renderExact(false);
  await renderExact(true);
  console.log('Finished rendering exact original colors.');
}

main().catch(console.error);
