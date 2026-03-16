import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async function (selfbot, bot, message) {
  if (message.author.bot) return;
  try {
    const configPath = path.join(__dirname, '../data/config.json');
    let config = {
      prefix: '!'
    };
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    const envAllowedUsers = process.env.ALLOWED_USERS ? process.env.ALLOWED_USERS.split(',').map(id => id.trim()) : [];
    const configAllowedUsers = config.allowedUsers || [];
    const allAllowedUsers = [...new Set([...envAllowedUsers, ...configAllowedUsers])];
    const isAllowed = allAllowedUsers.length === 0 || allAllowedUsers.includes(message.author.id);
    if (isAllowed && config.autoKoutube) {
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      const matches = message.content.match(youtubeRegex);
      if (matches) {
        for (const match of matches) {
          let videoId = '';
          if (match.includes('youtube.com/watch?v=')) {
            videoId = match.split('v=')[1]?.split('&')[0];
          } else if (match.includes('youtu.be/')) {
            videoId = match.split('youtu.be/')[1]?.split('?')[0];
          }
          if (videoId && videoId.length === 11) {
            await message.channel.send(`[+](https://koutube.com/${videoId})`);
            await message.react('');
          }
        }
      }
    }
    const prefix = config.prefix || process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = selfbot.commands.get(commandName) || selfbot.commands.get(selfbot.aliases.get(commandName));
    if (!command) return;
    if (allAllowedUsers.length > 0 && !isAllowed) {
      console.log(`[SECURITY] Blocked command from unauthorized user: ${message.author.id} (${message.author.tag})`);
      return;
    }
    console.log(`[COMMAND] ${message.author.tag} (${message.author.id}) executed: ${commandName} ${args.join(' ')}`);
    await command.execute(message, args, selfbot, bot);
  } catch (error) {
    console.error('Error in messageCreate event:', error);
  }
}