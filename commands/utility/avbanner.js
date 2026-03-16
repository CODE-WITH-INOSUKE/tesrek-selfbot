export default {
  name: 'avbanner',
  aliases: ['avb', 'userinfoimg'],
  description: 'Get both avatar and banner of a user',
  usage: 'avbanner [@user/user_id]',
  category: 'utility',
  async execute(message, args, selfbot, bot) {
    let user;
    if (args.length > 0) {
      user = message.mentions.users.first() || selfbot.users.cache.get(args[0]);
      if (!user) {
        try {
          user = await selfbot.users.fetch(args[0], {
            force: true
          });
        } catch {
          return message.channel.send(' User not found.');
        }
      }
    } else {
      user = message.author;
    }
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
    let response = `** User Info - ${user.tag}**\n\n`;
    response += `**Avatar:**\n${avatarURL}\n\n`;
    if (bannerURL) {
      response += `**Banner:**\n${bannerURL}`;
    } else {
      response += `*No banner found*`;
    }
    await message.channel.send(response);
  }
};