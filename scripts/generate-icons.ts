// scripts/generate-icons.ts
import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const ICONS_DIR = join(process.cwd(), "public", "icons");

mkdirSync(ICONS_DIR, { recursive: true });

const createIcon = async (
  size: number,
  filename: string,
  padding: number = 0,
) => {
  const iconSize = size - padding * 2;
  const fontSize = Math.round(iconSize * 0.35);
  const textY = Math.round(size / 2 + fontSize * 0.35);

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#0a0a0a" rx="0"/>
      ${padding > 0 ? `<rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" fill="#0a0a0a" rx="${Math.round(iconSize * 0.1)}"/>` : ""}
      <text
        x="${size / 2}"
        y="${textY}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="#f97316"
        text-anchor="middle"
      >FC</text>
      <text
        x="${size / 2}"
        y="${textY + fontSize * 0.85}"
        font-family="Arial, sans-serif"
        font-size="${Math.round(fontSize * 0.35)}"
        fill="#a3a3a3"
        text-anchor="middle"
      >FITNESS COACH</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(ICONS_DIR, filename));

  console.log(`✅ Generated ${filename} (${size}x${size})`);
};

const main = async () => {
  // Regular icons
  await createIcon(192, "icon-192.png");
  await createIcon(512, "icon-512.png");

  // Maskable icons (with safe zone padding ~10%)
  await createIcon(192, "icon-maskable-192.png", 19);
  await createIcon(512, "icon-maskable-512.png", 51);

  console.log("\n🎉 All PWA icons generated in public/icons/");
};

main().catch(console.error);
