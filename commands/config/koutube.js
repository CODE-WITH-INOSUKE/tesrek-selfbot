import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  name: 'koutube',
  aliases: ['ytconvert', 'autokoutube'],
  description: 'Toggle automatic YouTube to Koutube link conversion',
  usage: 'koutube [on/off]',
  category: 'config',
  execute(message, args, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (args.length === 0) {
      const status = config.autoKoutube ? ' ON' : ' OFF';
      return message.channel.send(` **Auto Koutube Conversion:** ${status}\nUse \`${config.prefix}koutube on\` or \`${config.prefix}koutube off\` to change.\nFormat: \`[+](https://koutube.com/VIDEO_ID)\``);
    }
    const setting = args[0].toLowerCase();
    if (setting === 'on' || setting === 'true' || setting === 'enable') {
      config.autoKoutube = true;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      selfbot.config = config;
      message.channel.send(' **Auto Koutube Conversion ENABLED**\nYouTube links will now be converted to: `[+](https://koutube.com/VIDEO_ID)`');
    } else if (setting === 'off' || setting === 'false' || setting === 'disable') {
      config.autoKoutube = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      selfbot.config = config;
      message.channel.send(' **Auto Koutube Conversion DISABLED**\nYouTube links will not be converted.');
    } else {
      message.channel.send('Invalid option. Use `on` or `off`.');
    }
  }
};