export default {
  name: 'unban',
  aliases: ['ub'],
  description: 'Unban a user from the server',
  usage: 'unban <user_id>',
  category: 'moderation',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    if (!message.member.permissions.has('BanMembers')) {
      return message.channel.send(' You need Ban Members permission to use this command.');
    }
    if (args.length === 0) {
      return message.channel.send(' Please provide a user ID to unban.\nUsage: `!unban <user_id>`');
    }
    const userId = args[0];
    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.get(userId);
      if (!bannedUser) {
        return message.channel.send(' This user is not banned from the server.');
      }
      await message.guild.members.unban(userId, `Unbanned by ${message.author.tag}`);
      message.channel.send(` **${bannedUser.user.tag}** has been unbanned.`);
    } catch (error) {
      console.error('Unban error:', error);
      message.channel.send(' Failed to unban the user. Check the user ID.');
    }
  }
};