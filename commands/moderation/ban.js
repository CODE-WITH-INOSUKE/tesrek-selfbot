export default {
  name: 'ban',
  aliases: ['b', 'hackban'],
  description: 'Ban a member from the server',
  usage: 'ban <@user/user_id> [reason] [days]',
  category: 'moderation',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    if (!message.member.permissions.has('BanMembers')) {
      return message.channel.send(' You need Ban Members permission to use this command.');
    }
    if (args.length === 0) {
      return message.channel.send(' Please mention a user or provide a user ID.\nUsage: `!ban @user [reason] [days]`');
    }
    let userId;
    let user;
    let member;
    const mention = message.mentions.users.first();
    if (mention) {
      user = mention;
      userId = user.id;
      member = message.guild.members.cache.get(userId);
    } else {
      userId = args[0];
      try {
        user = await bot.users.fetch(userId);
      } catch {
        return message.channel.send(' Invalid user ID or mention.');
      }
    }
    if (userId === message.author.id) {
      return message.channel.send(' You cannot ban yourself.');
    }
    if (member) {
      if (member.roles.highest.position >= message.member.roles.highest.position) {
        return message.channel.send(' You cannot ban this user due to role hierarchy.');
      }
    }
    let reason = 'No reason provided';
    let deleteDays = 0;
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg) && parseInt(lastArg) <= 7) {
      deleteDays = parseInt(lastArg);
      reason = args.slice(1, -1).join(' ') || 'No reason provided';
    } else {
      reason = args.slice(1).join(' ') || 'No reason provided';
    }
    try {
      if (member) {
        await user.send(`You have been banned from **${message.guild.name}**\nReason: ${reason}`).catch(() => {});
      }
      await message.guild.members.ban(userId, {
        reason,
        deleteMessageDays: deleteDays
      });
      message.channel.send(` **${user.tag}** has been banned.\n Reason: ${reason}${deleteDays > 0 ? `\n️ Deleted ${deleteDays} days of messages` : ''}`);
    } catch (error) {
      console.error('Ban error:', error);
      message.channel.send(' Failed to ban the user. Check my permissions and user ID.');
    }
  }
};