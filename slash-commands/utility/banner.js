import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('banner').setDescription('Get a user\'s banner').addUserOption(option => option.setName('user').setDescription('The user to get banner from').setRequired(false)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const user = interaction.options.getUser('user') || interaction.user;
    const fetchedUser = await selfbot.users.fetch(user.id, {
      force: true
    });
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
    const bannerGIF = fetchedUser.bannerURL({
      format: 'gif',
      size: 4096,
      dynamic: true
    });
    const response = `** Banner - ${fetchedUser.tag}**\n\n` + `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP})${fetchedUser.banner?.startsWith('a_') ? ' • [GIF](' + bannerGIF + ')' : ''}\n\n` + `${bannerURL}`;
    await interaction.editReply(response);
  }
};