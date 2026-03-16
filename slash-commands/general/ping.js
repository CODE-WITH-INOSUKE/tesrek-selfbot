import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency'),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      if (selfbot) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        const latency = Date.now() - interaction.createdTimestamp;
        await channel.send(`**Pong!** \n Latency: \`${latency}ms\``);
        await interaction.editReply({
          content: ' Ping command executed! Check the channel for response.'
        });
      } else {
        await interaction.editReply({
          content: ' Selfbot not connected!'
        });
      }
    } catch (error) {
      console.error('Error in ping command:', error);
      await interaction.editReply({
        content: ' Failed to execute ping command.'
      });
    }
  }
};