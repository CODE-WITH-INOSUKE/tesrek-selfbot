import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('clear').setDescription('Clear messages in the channel').addIntegerOption(option => option.setName('amount').setDescription('Number of messages to clear').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      if (!selfbot) {
        return await interaction.editReply({
          content: ' Selfbot not connected!'
        });
      }
      const amount = interaction.options.getInteger('amount');
      const channel = await selfbot.channels.fetch(interaction.channelId);
      const messages = await channel.messages.fetch({
        limit: amount
      });
      await channel.bulkDelete(messages);
      await channel.send(` Cleared ${amount} messages (requested by ${interaction.user.tag})`);
      await interaction.editReply({
        content: ` Cleared ${amount} messages!`
      });
    } catch (error) {
      console.error('Error in clear command:', error);
      await interaction.editReply({
        content: ' Failed to clear messages. Make sure selfbot has permission.'
      });
    }
  }
};