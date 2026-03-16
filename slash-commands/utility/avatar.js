import { SlashCommandBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('avatar').setDescription('Get a user\'s avatar').addUserOption(option => option.setName('user').setDescription('The user to get avatar from').setRequired(false)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const user = interaction.options.getUser('user') || interaction.user;
    const fetchedUser = await selfbot.users.fetch(user.id, {
      force: true
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
    const avatarGIF = fetchedUser.displayAvatarURL({
      format: 'gif',
      size: 4096,
      dynamic: true
    });
    const avatarDynamic = fetchedUser.displayAvatarURL({
      size: 4096,
      dynamic: true
    });
    const response = `**️ Avatar - ${fetchedUser.tag}**\n\n` + `[PNG](${avatarPNG}) • [JPG](${avatarJPG}) • [WEBP](${avatarWEBP})${fetchedUser.avatar?.startsWith('a_') ? ' • [GIF](' + avatarGIF + ')' : ''}\n\n` + `${avatarDynamic}`;
    await interaction.editReply(response);
  }
};