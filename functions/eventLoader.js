import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function loadEvents() {
  const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = await import(`../events/${file}`);
    const eventName = file.split('.')[0];
    global.selfbot.on(eventName, event.default.bind(null, global.selfbot, global.bot));
    global.bot.on(eventName, event.default.bind(null, global.bot, global.selfbot));
  }
}