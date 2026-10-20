import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src/assets');
const outputRoot = path.join(root, '.generated/legacy-assets');
const catalog = JSON.parse(await readFile(path.join(sourceRoot, 'catalog/asset-paths.json'), 'utf8'));
function inside(base, key) {
  const resolved = path.resolve(base, key);
  if (!resolved.startsWith(base + path.sep)) throw new Error(`Asset path outside its directory: ${key}`);
  return resolved;
}
await mkdir(outputRoot, { recursive: true });
for (const [legacy, canonical] of Object.entries(catalog.aliases)) {
  const source = inside(sourceRoot, canonical);
  const destination = inside(outputRoot, legacy);
  // The four formerly missing PNG fallbacks now resolve to SVG through the catalog.
  // Do not serve SVG bytes under .png; compatibility copies preserve the original format.
  if (path.extname(source) !== path.extname(destination)) continue;
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
console.log('Prepared legacy image URL aliases from the asset catalog.');
