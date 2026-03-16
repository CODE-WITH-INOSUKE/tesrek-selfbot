import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async function (bot, selfbot, interaction) {
  if (!interaction.isCommand()) return;
  const command = bot.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    const configPath = path.join(__dirname, '../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const envAllowedUsers = process.env.ALLOWED_USERS ? process.env.ALLOWED_USERS.split(',').map(id => id.trim()) : [];
    const configAllowedUsers = config.allowedUsers || [];
    const allAllowedUsers = [...new Set([...envAllowedUsers, ...configAllowedUsers])];
    if (allAllowedUsers.length > 0 && !allAllowedUsers.includes(interaction.user.id)) {
      return interaction.reply({
        content: ' You are not authorized to use this bot.',
        ephemeral: config.slashEphemeral || true
      });
    }
    await command.execute(interaction, selfbot, bot);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error executing this command.',
      ephemeral: true
    }).catch(() => {});
  }
}