import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('userinfo').setDescription('Get user information').addUserOption(option => option.setName('user').setDescription('The user to get info about').setRequired(false)),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      if (selfbot) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        const info = `** User Info for ${targetUser.tag}**\n` + ` ID: \`${targetUser.id}\`\n` + ` Created: <t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>\n` + ` Bot: ${targetUser.bot ? ' Yes' : ' No'}`;
        await channel.send(info);
        await interaction.editReply({
          content: ' Userinfo command executed! Check the channel for response.'
        });
      } else {
        await interaction.editReply({
          content: ' Selfbot not connected!'
        });
      }
    } catch (error) {
      console.error('Error in userinfo command:', error);
      await interaction.editReply({
        content: ' Failed to execute userinfo command.'
      });
    }
  }
};