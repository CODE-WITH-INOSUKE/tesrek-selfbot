export default {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Get a user\'s avatar link',
  usage: 'avatar [@user/user_id]',
  category: 'utility',
  async execute(message, args, selfbot, bot) {
    let user;
    if (args.length > 0) {
      user = message.mentions.users.first() || selfbot.users.cache.get(args[0]);
      if (!user) {
        try {
          user = await selfbot.users.fetch(args[0]);
        } catch {
          return message.channel.send(' User not found.');
        }
      }
    } else {
      user = message.author;
    }
    const avatarURL = user.displayAvatarURL({
      size: 4096,
      dynamic: true
    });
    await message.channel.send(avatarURL);
  }
};