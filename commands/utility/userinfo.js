export default {
  name: 'userinfo',
  aliases: ['ui', 'whois'],
  description: 'Get user information',
  usage: 'userinfo [@user/user_id]',
  category: 'utility',
  async execute(message, args, selfbot, bot) {
    const user = message.mentions.users.first() || selfbot.users.cache.get(args[0]) || message.author;
    const member = message.guild?.members.cache.get(user.id);
    let info = `** User Info for ${user.tag}**\n`;
    info += ` ID: \`${user.id}\`\n`;
    info += ` Created: <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n`;
    info += ` Bot: ${user.bot ? ' Yes' : ' No'}\n`;
    if (member) {
      info += ` Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>\n`;
      info += ` Roles: ${member.roles.cache.size - 1}`;
    }
    message.channel.send(info);
  }
};