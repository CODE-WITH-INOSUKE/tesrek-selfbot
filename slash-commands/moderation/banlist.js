import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('banlist').setDescription('List all banned users in the server').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      if (!interaction.guild) {
        return await interaction.editReply(' This command can only be used in a server.');
      }
      const bans = await interaction.guild.bans.fetch();
      if (bans.size === 0) {
        return await interaction.editReply(' No banned users in this server.');
      }
      let banList = `** Ban List (${bans.size})**\n\n`;
      bans.forEach(ban => {
        banList += `**${ban.user.tag}** (\`${ban.user.id}\`)\n`;
        if (ban.reason) banList += `┗━ Reason: ${ban.reason}\n`;
      });
      if (selfbot && config.selfbotResponses) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        if (banList.length > 2000) {
          const chunks = banList.match(/[\s\S]{1,1900}/g) || [];
          for (const chunk of chunks) {
            await channel.send(chunk);
          }
        } else {
          await channel.send(banList);
        }
        await interaction.editReply(' Ban list sent to channel!');
      } else {
        if (banList.length > 2000) {
          const chunks = banList.match(/[\s\S]{1,1900}/g) || [];
          for (const chunk of chunks) {
            await interaction.followUp({
              content: chunk,
              ephemeral: false
            });
          }
          await interaction.editReply(' Ban list displayed above.');
        } else {
          await interaction.editReply(banList);
        }
      }
    } catch (error) {
      console.error('Banlist slash command error:', error);
      await interaction.editReply(' Failed to fetch ban list.');
    }
  }
};