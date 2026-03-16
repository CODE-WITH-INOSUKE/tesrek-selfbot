import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function loadFunctions() {
  const functionFiles = fs.readdirSync(path.join(__dirname, '../functions')).filter(file => file.endsWith('.js') && !file.includes('Loader'));
  for (const file of functionFiles) {
    await import(`../functions/${file}`);
  }
}