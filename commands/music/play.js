import musicManager from '../../functions/musicManager.js';
export default {
  name: 'play',
  aliases: ['p'],
  category: 'music',
  description: 'Play a song from YouTube or search query',
  usage: 'play <song name or URL>',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    const vc = message.member?.voice?.channel;
    if (!vc) {
      return message.channel.send('```\n You must be in a voice channel.\n```');
    }
    if (!args.length) {
      return message.channel.send('```\n Please provide a song name or URL.\n```');
    }
    const query = args.join(' ');
    const statusMsg = await message.channel.send('```\n Searching...\n```');
    try {
      await musicManager.init();
      let queue = musicManager.getQueue(message.guild.id);
      if (!queue) {
        await musicManager.connect(message.guild.id, selfbot.user.id);
        queue = musicManager.getQueue(message.guild.id);
        queue.textChannel = message.channel;
      }
      let voiceState = null;
      const voiceData = selfbot.voiceData?.get(message.guild.id);
      if (!voiceData?.serverUpdate || !voiceData?.stateUpdate) {
        await statusMsg.edit('```\n Connecting to voice channel...\n```');
        voiceState = await musicManager.joinVoiceChannel(message.guild.id, vc.id, selfbot);
      } else {
        voiceState = {
          token: voiceData.serverUpdate.token,
          endpoint: voiceData.serverUpdate.endpoint,
          sessionId: voiceData.stateUpdate.session_id,
          channelId: vc.id
        };
      }
      await statusMsg.edit('```\n Loading track...\n```');
      const tracks = await musicManager.play(message.guild.id, query, message.author.tag, voiceState);
      let response = '```\n';
      if (tracks.length === 1) {
        const track = tracks[0];
        if (queue.nowPlaying && queue.nowPlaying.info.title === track.info.title) {
          response += `   Now Playing\n`;
          response += `  ${track.info.title}\n`;
          response += `   ${track.info.author}\n`;
          response += `  ️ ${musicManager.formatDuration(track.info.length)}\n`;
        } else if (queue.nowPlaying) {
          response += `   Added to Queue\n`;
          response += `  ${track.info.title}\n`;
          response += `   ${track.info.author}\n`;
          response += `  ️ ${musicManager.formatDuration(track.info.length)}\n`;
          response += `   Position: ${queue.songs.length}\n`;
        } else {
          response += `   Now Playing\n`;
          response += `  ${track.info.title}\n`;
          response += `   ${track.info.author}\n`;
          response += `  ️ ${musicManager.formatDuration(track.info.length)}\n`;
        }
      } else {
        response += `   Added Playlist\n`;
        response += `  ${tracks.length} songs added to queue\n`;
        response += `   Total in queue: ${queue.songs.length}\n`;
      }
      response += '\n╰──────────────────────────────────╯\n```';
      await statusMsg.edit(response);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await statusMsg.edit(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};