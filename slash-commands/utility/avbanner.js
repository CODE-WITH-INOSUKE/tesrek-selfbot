import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('avbanner').setDescription('Get both avatar and banner of a user').addUserOption(option => option.setName('user').setDescription('The user to get info from').setRequired(false)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const user = interaction.options.getUser('user') || interaction.user;
    const fetchedUser = await selfbot.users.fetch(user.id, {
      force: true
    });
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
};