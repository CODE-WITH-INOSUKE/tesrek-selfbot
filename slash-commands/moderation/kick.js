import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default {
  data: new SlashCommandBuilder().setName('kick').setDescription('Kick a member from the server').addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason for the kick').setRequired(false)).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction, selfbot, bot) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await interaction.deferReply({
      ephemeral: config.slashEphemeral || true
    });
    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      if (!interaction.guild) {
        return await interaction.editReply(' This command can only be used in a server.');
      }
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return await interaction.editReply(' That user is not in this server.');
      }
      if (user.id === interaction.user.id) {
        return await interaction.editReply(' You cannot kick yourself.');
      }
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return await interaction.editReply(' You cannot kick this user due to role hierarchy.');
      }
      if (!member.kickable) {
        return await interaction.editReply(' I cannot kick this user. Check my permissions and role hierarchy.');
      }
      if (selfbot) {
        const channel = await selfbot.channels.fetch(interaction.channelId);
        await channel.send(` **${user.tag}** has been kicked by ${interaction.user.tag}\n Reason: ${reason}`);
      }
      await user.send(`You have been kicked from **${interaction.guild.name}**\nReason: ${reason}`).catch(() => {});
      await member.kick(reason);
      await interaction.editReply(` **${user.tag}** has been kicked.`);
    } catch (error) {
      console.error('Kick slash command error:', error);
      await interaction.editReply(' Failed to kick the user.');
    }
  }
};