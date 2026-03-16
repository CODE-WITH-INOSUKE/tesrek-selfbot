import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('settings').setDescription('Configure bot settings').addSubcommand(subcommand => subcommand.setName('view').setDescription('View current settings')).addSubcommand(subcommand => subcommand.setName('ephemeral').setDescription('Toggle ephemeral messages').addBooleanOption(option => option.setName('enabled').setDescription('Enable/disable ephemeral messages').setRequired(true))).addSubcommand(subcommand => subcommand.setName('selfbot').setDescription('Toggle selfbot responses').addBooleanOption(option => option.setName('enabled').setDescription('Enable/disable selfbot responses').setRequired(true))),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply({
      ephemeral: true
    });
    try {
      if (!selfbot) {
        return await interaction.editReply({
          content: ' Selfbot not connected!'
        });
      }
      const channel = await selfbot.channels.fetch(interaction.channelId);
      if (subcommand === 'view') {
        const settings = `**️ Current Settings**\n` + ` Ephemeral Messages: \`${config.slashEphemeral ? ' Enabled' : ' Disabled'}\`\n` + ` Selfbot Responses: \`${config.selfbotResponses ? ' Enabled' : ' Disabled'}\`\n` + ` Embed Style: \`${config.slashEmbedStyle || 'Default'}\`\n` + ` Allowed Users: \`${config.allowedUsers?.length || 0}\` users`;
        await channel.send(settings);
        await interaction.editReply({
          content: ' Settings displayed in channel!'
        });
      } else if (subcommand === 'ephemeral') {
        const enabled = interaction.options.getBoolean('enabled');
        config.slashEphemeral = enabled;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        await channel.send(` Ephemeral messages ${enabled ? 'enabled' : 'disabled'} by ${interaction.user.tag}`);
        await interaction.editReply({
          content: ` Ephemeral messages ${enabled ? 'enabled' : 'disabled'}!`
        });
      } else if (subcommand === 'selfbot') {
        const enabled = interaction.options.getBoolean('enabled');
        config.selfbotResponses = enabled;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        await channel.send(` Selfbot responses ${enabled ? 'enabled' : 'disabled'} by ${interaction.user.tag}`);
        await interaction.editReply({
          content: ` Selfbot responses ${enabled ? 'enabled' : 'disabled'}!`
        });
      }
    } catch (error) {
      console.error('Error in settings command:', error);
      await interaction.editReply({
        content: ' Failed to execute settings command.'
      });
    }
  }
};