import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('serverbanner').setDescription('Get the server banner').addStringOption(option => option.setName('guild_id').setDescription('Server ID (optional, auto-detects if not provided)').setRequired(false)),
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
    const bannerURL = guild.bannerURL({
      size: 4096,
      dynamic: true
    });
    if (!bannerURL) {
      return interaction.editReply(' This server does not have a banner.');
    }
    const bannerPNG = guild.bannerURL({
      format: 'png',
      size: 4096
    });
    const bannerJPG = guild.bannerURL({
      format: 'jpg',
      size: 4096
    });
    const bannerWEBP = guild.bannerURL({
      format: 'webp',
      size: 4096
    });
    const response = `** Server Banner - ${guild.name}**\n\n` + `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP})\n\n` + `${bannerURL}`;
    await interaction.editReply(response);
  }
};