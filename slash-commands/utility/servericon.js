import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('servericon').setDescription('Get the server icon').addStringOption(option => option.setName('guild_id').setDescription('Server ID (optional, auto-detects if not provided)').setRequired(false)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const guildId = interaction.options.getString('guild_id') || interaction.guildId;
    if (!guildId) {
      return interaction.editReply(' Please provide a server ID or use this command in a server.');
    }
    const guild = selfbot.guilds.cache.get(guildId);
    if (!guild) {
      return interaction.editReply(' Selfbot is not in that server.');
    }
    const iconURL = guild.iconURL({
      size: 4096,
      dynamic: true
    });
    if (!iconURL) {
      return interaction.editReply(' This server does not have an icon.');
    }
    const iconPNG = guild.iconURL({
      format: 'png',
      size: 4096
    });
    const iconJPG = guild.iconURL({
      format: 'jpg',
      size: 4096
    });
    const iconWEBP = guild.iconURL({
      format: 'webp',
      size: 4096
    });
    const iconGIF = guild.iconURL({
      format: 'gif',
      size: 4096,
      dynamic: true
    });
    const response = `**️ Server Icon - ${guild.name}**\n\n` + `[PNG](${iconPNG}) • [JPG](${iconJPG}) • [WEBP](${iconWEBP})${guild.icon?.startsWith('a_') ? ' • [GIF](' + iconGIF + ')' : ''}\n\n` + `${iconURL}`;
    await interaction.editReply(response);
  }
};