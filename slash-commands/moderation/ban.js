import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('ban').setDescription('Ban a member from the server').addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false)).addIntegerOption(option => option.setName('days').setDescription('Days of messages to delete (0-7)').setRequired(false).setMinValue(0).setMaxValue(7)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const deleteDays = interaction.options.getInteger('days') || 0;
      if (!interaction.guild) {
        return await interaction.editReply(' This command can only be used in a server.');
      }
      if (user.id === interaction.user.id) {
        return await interaction.editReply(' You cannot ban yourself.');
      }
      let member = null;
      try {
        member = await interaction.guild.members.fetch(user.id);
      } catch {}
      if (member) {
        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
          return await interaction.editReply(' You cannot ban this user due to role hierarchy.');
        }
      }
      if (selfbot) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        await channel.send(` **${user.tag}** has been banned by ${interaction.user.tag}\n Reason: ${reason}${deleteDays > 0 ? `\n️ Deleted ${deleteDays} days of messages` : ''}`);
      }
      if (member) {
        await user.send(`You have been banned from **${interaction.guild.name}**\nReason: ${reason}`).catch(() => {});
      }
      await interaction.guild.members.ban(user.id, {
        reason,
        deleteMessageDays: deleteDays
      });
      await interaction.editReply(` **${user.tag}** has been banned.`);
    } catch (error) {
      console.error('Ban slash command error:', error);
      await interaction.editReply(' Failed to ban the user.');
    }
  }
};