import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = import.meta.dirname;
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'app'), resolve(output, 'app'), { recursive: true });
if (existsSync(resolve(root, 'screenshots'))) {
  cpSync(resolve(root, 'screenshots'), resolve(output, 'screenshots'), { recursive: true });
} else {
  // buildDossier requires an image even during the pre-capture packaging check.
  mkdirSync(resolve(output, 'screenshots'), { recursive: true });
  writeFileSync(resolve(output, 'screenshots/00-pending.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jzZkAAAAASUVORK5CYII=', 'base64'));
}
writeFileSync(resolve(output, 'dossier.json'), buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
}));
