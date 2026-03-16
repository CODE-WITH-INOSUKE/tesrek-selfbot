import musicManager from '../../functions/musicManager.js';
export default {
  name: 'nowplaying',
  aliases: ['np'],
  category: 'music',
  description: 'Show currently playing track',
  usage: 'nowplaying',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || !queue.nowPlaying) {
        return message.channel.send('```\n Nothing is playing.\n```');
      }
      const track = queue.nowPlaying;
      const progress = musicManager.createProgressBar(queue.position || 0, track.info.length, 20);
      let npMsg = '```\n';
      npMsg += `╔════════════════════════════════════╗\n`;
      npMsg += `║          NOW PLAYING               ║\n`;
      npMsg += `╚════════════════════════════════════╝\n\n`;
      npMsg += ` ${track.info.title}\n`;
      npMsg += ` ${track.info.author}\n`;
      npMsg += `️ ${musicManager.formatDuration(track.info.length)}\n`;
      npMsg += ` Requested by: ${track.requester}\n`;
      npMsg += ` ${progress}\n`;
      npMsg += ` Volume: ${queue.volume}%\n`;
      npMsg += ` Loop: ${queue.loop || 'off'}\n`;
      npMsg += '```';
      await message.channel.send(npMsg);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};