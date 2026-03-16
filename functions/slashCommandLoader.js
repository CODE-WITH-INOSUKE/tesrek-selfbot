import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function loadSlashCommands() {
  const categories = ['moderation', 'utility', 'general', 'config', 'music'];
  for (const category of categories) {
    const categoryPath = path.join(__dirname, '../slash-commands', category);
    if (!fs.existsSync(categoryPath)) continue;
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = await import(`../slash-commands/${category}/${file}`);
      const cmd = command.default;
      if (cmd.data && cmd.execute) {
        global.bot.slashCommands.set(cmd.data.name, {
          ...cmd,
          category
        });
        if (!global.bot.slashCategories.has(category)) {
          global.bot.slashCategories.set(category, []);
        }
        global.bot.slashCategories.get(category).push(cmd.data.name);
      }
    }
  }
}