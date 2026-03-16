import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('unban').setDescription('Unban a user from the server').addStringOption(option => option.setName('user_id').setDescription('The ID of the user to unban').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      const userId = interaction.options.getString('user_id');
      if (!interaction.guild) {
        return await interaction.editReply(' This command can only be used in a server.');
      }
      const bans = await interaction.guild.bans.fetch();
      const bannedUser = bans.get(userId);
      if (!bannedUser) {
        return await interaction.editReply(' This user is not banned from the server.');
      }
      if (selfbot) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        await channel.send(` **${bannedUser.user.tag}** has been unbanned by ${interaction.user.tag}`);
      }
      await interaction.guild.members.unban(userId, `Unbanned by ${interaction.user.tag}`);
      await interaction.editReply(` **${bannedUser.user.tag}** has been unbanned.`);
    } catch (error) {
      console.error('Unban slash command error:', error);
      await interaction.editReply(' Failed to unban the user.');
    }
  }
};