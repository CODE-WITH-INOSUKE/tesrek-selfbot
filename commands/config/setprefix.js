import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  name: 'setprefix',
  aliases: ['prefix'],
  description: 'Change bot prefix',
  usage: 'setprefix <new_prefix>',
  category: 'config',
  execute(message, args, selfbot, bot) {
    if (!args[0]) return message.channel.send(' Please provide a new prefix.');
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.prefix = args[0];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    selfbot.config = config;
    message.channel.send(` Prefix changed to \`${args[0]}\``);
  }
};