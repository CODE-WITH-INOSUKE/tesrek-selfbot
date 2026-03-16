export default {
  name: 'banlist',
  aliases: ['bl', 'bans'],
  description: 'List all banned users in the server',
  usage: 'banlist',
  category: 'moderation',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    if (!message.member.permissions.has('BanMembers')) {
      return message.channel.send(' You need Ban Members permission to use this command.');
    }
    try {
      const bans = await message.guild.bans.fetch();
      if (bans.size === 0) {
        return message.channel.send(' No banned users in this server.');
      }
      let banList = `** Ban List (${bans.size})**\n\n`;
      bans.forEach(ban => {
        banList += `**${ban.user.tag}** (\`${ban.user.id}\`)\n`;
        if (ban.reason) banList += `┗━ Reason: ${ban.reason}\n`;
      });
      if (banList.length > 2000) {
        const chunks = banList.match(/[\s\S]{1,1900}/g) || [];
        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      } else {
        await message.channel.send(banList);
      }
    } catch (error) {
      console.error('Banlist error:', error);
      message.channel.send(' Failed to fetch ban list.');
    }
  }
};