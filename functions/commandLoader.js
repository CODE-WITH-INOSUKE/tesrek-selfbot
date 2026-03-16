import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function loadCommands() {
  const categories = ['moderation', 'utility', 'general', 'config', 'music'];
  for (const category of categories) {
    const categoryPath = path.join(__dirname, '../commands', category);
    if (!fs.existsSync(categoryPath)) continue;
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = await import(`../commands/${category}/${file}`);
      const cmd = command.default;
      if (cmd.name) {
        global.selfbot.commands.set(cmd.name, {
          ...cmd,
          category
        });
        if (cmd.aliases && Array.isArray(cmd.aliases)) {
          cmd.aliases.forEach(alias => {
            global.selfbot.aliases.set(alias, cmd.name);
          });
        }
      }
    }
  }
}