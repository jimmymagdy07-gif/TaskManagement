import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const projectRoot = path.join(serverDir, '..');

const envCandidates = [
  path.join(projectRoot, '.env'),
  path.join(serverDir, '.env'),
  path.join(projectRoot, '.env.example'),
];

let loadedFrom = null;

for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) continue;
  dotenv.config({ path: envPath, override: false });
  if (process.env.DATABASE_URL) {
    loadedFrom = envPath;
    break;
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    [
      'DATABASE_URL is not set.',
      '',
      'Create a .env file in the taskflow folder:',
      '  cp .env.example .env',
      '',
      'Then set DATABASE_URL to your PostgreSQL connection string.',
    ].join('\n')
  );
} else if (loadedFrom?.endsWith('.env.example')) {
  console.warn(
    `Using ${path.relative(projectRoot, loadedFrom)} — copy it to .env and customize for production.`
  );
}

export { projectRoot, serverDir, loadedFrom };
