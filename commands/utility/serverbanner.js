export default {
  name: 'serverbanner',
  aliases: ['sbanner', 'guildbanner', 'gb'],
  description: 'Get the server banner',
  usage: 'serverbanner',
  category: 'utility',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send(' This command can only be used in a server.');
    }
    const guild = message.guild;
    const bannerURL = guild.bannerURL({
      size: 4096,
      dynamic: true
    });
    if (!bannerURL) {
      return message.channel.send(' This server does not have a banner.');
    }
    const bannerPNG = guild.bannerURL({
      format: 'png',
      size: 4096
    });
    const bannerJPG = guild.bannerURL({
      format: 'jpg',
      size: 4096
    });
    const bannerWEBP = guild.bannerURL({
      format: 'webp',
      size: 4096
    });
    const response = `** Server Banner - ${guild.name}**\n\n` + `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP})\n\n` + `${bannerURL}`;
    await message.channel.send(response);
  }
};