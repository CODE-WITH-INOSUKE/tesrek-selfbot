export default {
  name: 'kick',
  aliases: ['k'],
  description: 'Kick a member from the server',
  usage: 'kick <@user> [reason]',
  category: 'moderation',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    if (!message.member.permissions.has('KickMembers')) {
      return message.channel.send(' You need Kick Members permission to use this command.');
    }
    const user = message.mentions.users.first();
    if (!user) {
      return message.channel.send(' Please mention a user to kick.\nUsage: `!kick @user [reason]`');
    }
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.channel.send(' That user is not in this server.');
    }
    if (user.id === message.author.id) {
      return message.channel.send(' You cannot kick yourself.');
    }
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.channel.send(' You cannot kick this user due to role hierarchy.');
    }
    if (!member.kickable) {
      return message.channel.send(' I cannot kick this user. Check my permissions and role hierarchy.');
    }
    const reason = args.slice(1).join(' ') || 'No reason provided';
    try {
      await user.send(`You have been kicked from **${message.guild.name}**\nReason: ${reason}`).catch(() => {});
      await member.kick(reason);
      message.channel.send(` **${user.tag}** has been kicked.\n Reason: ${reason}`);
    } catch (error) {
      console.error('Kick error:', error);
      message.channel.send(' Failed to kick the user. Check my permissions.');
    }
  }
};