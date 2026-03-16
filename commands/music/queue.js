import musicManager from '../../functions/musicManager.js';
export default {
  name: 'queue',
  aliases: ['q'],
  category: 'music',
  description: 'Show the current music queue',
  usage: 'queue [page]',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || queue.songs.length === 0 && !queue.nowPlaying) {
        return message.channel.send('```\n Queue is empty.\n```');
      }
      const page = parseInt(args[0]) || 1;
      const itemsPerPage = 10;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const totalPages = Math.ceil(queue.songs.length / itemsPerPage) || 1;
      let queueMsg = '```\n';
      queueMsg += `╔════════════════════════════════════╗\n`;
      queueMsg += `║           MUSIC QUEUE              ║\n`;
      queueMsg += `╚════════════════════════════════════╝\n\n`;
      if (queue.nowPlaying) {
        queueMsg += ` Now Playing:\n`;
        queueMsg += `┌─ ${queue.nowPlaying.info.title}\n`;
        queueMsg += `├─  ${queue.nowPlaying.info.author}\n`;
        queueMsg += `├─ ️ ${musicManager.formatDuration(queue.nowPlaying.info.length)}\n`;
        queueMsg += `├─  Requested by: ${queue.nowPlaying.requester}\n`;
        queueMsg += `├─  Position: ${queue.position ? musicManager.formatDuration(queue.position) : '0:00'}\n`;
        queueMsg += `╰──────────────────────────────────\n\n`;
      }
      if (queue.songs.length > 0) {
        queueMsg += ` Up Next (Page ${page}/${totalPages}):\n`;
        const pageSongs = queue.songs.slice(start, end);
        pageSongs.forEach((song, index) => {
          const position = start + index + 1;
          queueMsg += `${position}. ${song.info.title}\n`;
          queueMsg += `   ├─  ${song.info.author}\n`;
          queueMsg += `   ├─ ️ ${musicManager.formatDuration(song.info.length)}\n`;
          queueMsg += `   ╰─  Requested by: ${song.requester}\n\n`;
        });
        queueMsg += ` Total: ${queue.songs.length} songs | `;
        queueMsg += `Total Duration: ${musicManager.formatDuration(queue.songs.reduce((acc, song) => acc + song.info.length, 0))}\n`;
      }
      queueMsg += '```';
      if (queueMsg.length > 2000) {
        const chunks = queueMsg.match(/[\s\S]{1,1900}/g) || [];
        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      } else {
        await message.channel.send(queueMsg);
      }
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};