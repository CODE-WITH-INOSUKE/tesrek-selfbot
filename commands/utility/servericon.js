export default {
  name: 'servericon',
  aliases: ['sav', 'guildicon', 'gav'],
  description: 'Get the server icon',
  usage: 'servericon',
  category: 'utility',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    const guild = message.guild;
    const iconURL = guild.iconURL({
      size: 4096,
      dynamic: true
    });
    if (!iconURL) {
      return message.channel.send(' This server does not have an icon.');
    }
    const iconPNG = guild.iconURL({
      format: 'png',
      size: 4096
    });
    const iconJPG = guild.iconURL({
      format: 'jpg',
      size: 4096
    });
    const iconWEBP = guild.iconURL({
      format: 'webp',
      size: 4096
    });
    const iconGIF = guild.iconURL({
      format: 'gif',
      size: 4096,
      dynamic: true
    });
    const response = `**️ Server Icon - ${guild.name}**\n\n` + `[PNG](${iconPNG}) • [JPG](${iconJPG}) • [WEBP](${iconWEBP})${guild.icon?.startsWith('a_') ? ' • [GIF](' + iconGIF + ')' : ''}\n\n` + `${iconURL}`;
    await message.channel.send(response);
  }
};