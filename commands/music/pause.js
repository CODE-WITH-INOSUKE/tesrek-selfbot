import musicManager from '../../functions/musicManager.js';
export default {
  name: 'pause',
  aliases: ['pa'],
  category: 'music',
  description: 'Pause the current track',
  usage: 'pause',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    const vc = message.member?.voice?.channel;
    if (!vc) {
      return message.channel.send('```\n You must be in a voice channel.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || !queue.nowPlaying) {
        return message.channel.send('```\n Nothing is playing.\n```');
      }
      const paused = await musicManager.pause(message.guild.id);
      if (paused) {
        await message.channel.send('```\n️ Paused\n```');
      }
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};