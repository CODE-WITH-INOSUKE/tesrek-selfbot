import musicManager from '../../functions/musicManager.js';
export default {
  name: 'seek',
  aliases: ['sk'],
  category: 'music',
  description: 'Seek to a position in the current track',
  usage: 'seek <seconds>',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    const vc = message.member?.voice?.channel;
    if (!vc) {
      return message.channel.send('```\n You must be in a voice channel.\n```');
    }
    if (!args.length) {
      return message.channel.send('```\n Please provide a time in seconds.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || !queue.nowPlaying) {
        return message.channel.send('```\n Nothing is playing.\n```');
      }
      const seconds = parseInt(args[0]);
      if (isNaN(seconds) || seconds < 0) {
        return message.channel.send('```\n Please provide a valid number of seconds.\n```');
      }
      const position = seconds * 1000;
      if (position > queue.nowPlaying.info.length) {
        return message.channel.send('```\n Cannot seek beyond track duration.\n```');
      }
      await musicManager.seek(message.guild.id, position);
      await message.channel.send(`\`\`\`\n Seeked to ${musicManager.formatDuration(position)}\n\`\`\``);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};