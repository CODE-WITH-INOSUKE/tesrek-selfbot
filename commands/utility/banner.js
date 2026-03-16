export default {
  name: 'banner',
  aliases: ['bn'],
  description: 'Get a user\'s banner',
  usage: 'banner [@user/user_id]',
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
    const bannerURL = fetchedUser.bannerURL({
      size: 4096,
      dynamic: true
    });
    if (!bannerURL) {
      return message.channel.send(` **${user.tag}** does not have a banner.`);
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
    const response = `** Banner - ${user.tag}**\n\n` + `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP})${user.banner?.startsWith('a_') ? ' • [GIF](' + bannerGIF + ')' : ''}\n\n` + `${bannerURL}`;
    await message.channel.send(response);
  }
};