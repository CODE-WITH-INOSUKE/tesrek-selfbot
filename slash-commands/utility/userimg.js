import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('userimg').setDescription('Get user images (avatar/banner)').addSubcommand(subcommand => subcommand.setName('avatar').setDescription('Get user avatar').addUserOption(option => option.setName('user').setDescription('The user').setRequired(false))).addSubcommand(subcommand => subcommand.setName('banner').setDescription('Get user banner').addUserOption(option => option.setName('user').setDescription('The user').setRequired(false))).addSubcommand(subcommand => subcommand.setName('both').setDescription('Get both avatar and banner').addUserOption(option => option.setName('user').setDescription('The user').setRequired(false))),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') || interaction.user;
    const fetchedUser = await selfbot.users.fetch(user.id, {
      force: true
    });
    if (subcommand === 'avatar') {
      const avatarURL = fetchedUser.displayAvatarURL({
        size: 4096,
        dynamic: true
      });
      const avatarPNG = fetchedUser.displayAvatarURL({
        format: 'png',
        size: 4096
      });
      const avatarJPG = fetchedUser.displayAvatarURL({
        format: 'jpg',
        size: 4096
      });
      const avatarWEBP = fetchedUser.displayAvatarURL({
        format: 'webp',
        size: 4096
      });
      let response = `**️ Avatar - ${fetchedUser.tag}**\n\n`;
      response += `[PNG](${avatarPNG}) • [JPG](${avatarJPG}) • [WEBP](${avatarWEBP})\n\n`;
      response += `${avatarURL}`;
      await interaction.editReply(response);
    } else if (subcommand === 'banner') {
      const bannerURL = fetchedUser.bannerURL({
        size: 4096,
        dynamic: true
      });
      if (!bannerURL) {
        return interaction.editReply(` **${fetchedUser.tag}** does not have a banner.`);
      }
      const bannerPNG = fetchedUser.bannerURL({
        format: 'png',
        size: 4096
      });
      const bannerJPG = fetchedUser.bannerURL({
        format: 'jpg',
        size: 4096
      });
      const bannerWEBP = fetchedUser.bannerURL({
        format: 'webp',
        size: 4096
      });
      let response = `** Banner - ${fetchedUser.tag}**\n\n`;
      response += `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP})\n\n`;
      response += `${bannerURL}`;
      await interaction.editReply(response);
    } else if (subcommand === 'both') {
      const avatarURL = fetchedUser.displayAvatarURL({
        size: 4096,
        dynamic: true
      });
      const bannerURL = fetchedUser.bannerURL({
        size: 4096,
        dynamic: true
      });
      let response = `** User Info - ${fetchedUser.tag}**\n\n`;
      response += `**Avatar:**\n${avatarURL}\n\n`;
      if (bannerURL) {
        response += `**Banner:**\n${bannerURL}`;
      } else {
        response += `*No banner found*`;
      }
      await interaction.editReply(response);
    }
  }
};