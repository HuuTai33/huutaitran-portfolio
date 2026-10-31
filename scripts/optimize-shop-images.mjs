// Generates lightweight versions of the shop images with sharp:
//   <category>/web/     max 1600px — product pages
//   <category>/thumbs/  max 800px  — shop grid, carousel thumbnails, cart, loader
// Source: public/images/products/<category>/converted_webp. Only missing or outdated files are regenerated.
// Usage: npm run optimize:images
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../public/images/products');
const CATEGORIES = ['books', 'frames'];
const VARIANTS = [
  { dir: 'web', size: 1600, quality: 80 },
  { dir: 'thumbs', size: 800, quality: 75 },
];

async function isUpToDate(source, target) {
  try {
    const [s, t] = await Promise.all([stat(source), stat(target)]);
    return t.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

let generated = 0;
for (const category of CATEGORIES) {
  const sourceDir = path.join(ROOT, category, 'converted_webp');
  const files = (await readdir(sourceDir)).filter((f) => f.toLowerCase().endsWith('.webp'));

  for (const { dir, size, quality } of VARIANTS) {
    const targetDir = path.join(ROOT, category, dir);
    await mkdir(targetDir, { recursive: true });

    for (const file of files) {
      const source = path.join(sourceDir, file);
      const target = path.join(targetDir, file);
      if (await isUpToDate(source, target)) continue;

      await sharp(source)
        .rotate()
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toFile(target);
      generated++;
      console.log(`✔ ${category}/${dir}/${file}`);
    }
  }
}
console.log(generated ? `${generated} image(s) generated.` : 'All images are up to date.');
