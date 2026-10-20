import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'src/assets');
const catalog = JSON.parse(await readFile(path.join(assets, 'catalog/asset-paths.json'), 'utf8'));
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(name));
    else result.push(name);
  }
  return result;
}
const keys = new Set((await files(assets)).map(file => path.relative(assets, file).split(path.sep).join('/')));
const errors = [];
function verify(key, source) {
  const canonical = catalog.aliases[key] ?? key;
  if (!keys.has(canonical)) errors.push(`${source}: missing or case-mismatched ${key} -> ${canonical}`);
}
for (const [oldKey, newKey] of Object.entries(catalog.aliases)) {
  if (catalog.aliases[newKey]) errors.push(`Alias chains are not supported: ${oldKey}`);
  verify(newKey, 'asset catalog');
}
for (const key of Object.values(catalog.placeholders)) verify(key, 'placeholder');
const backend = path.join(root, '../Services/HRKGAME/GAME.Application');
const backendPresent = await stat(backend).then(() => true).catch(error => {
  if (error.code === 'ENOENT') return false;
  throw error;
});
const sources = [...await files(path.join(root, 'src/app')), ...await files(path.join(root, 'src/libs')),
  ...(backendPresent ? await files(backend) : []),
  path.join(assets, 'images/dcs-game/equipments/equipment-v2.manifest.json')];
let checked = 0;
for (const file of sources) {
  if (!/\.(ts|html|scss|json|cs)$/.test(file) || file.endsWith('.spec.ts') || /[/\\](bin|obj)[/\\]/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/(?:\/?assets\/)?((?:images|svgs|icons|loading)\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|gif|webp|svg))/g)) {
    checked++;
    verify(match[1], path.relative(root, file));
  }
}
if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  process.exitCode = 1;
} else console.log(`Verified ${checked} literal game image references, ${Object.keys(catalog.aliases).length} aliases and all placeholders.`);
