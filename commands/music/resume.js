import musicManager from '../../functions/musicManager.js';
export default {
  name: 'resume',
  aliases: ['r'],
  category: 'music',
  description: 'Resume the paused track',
  usage: 'resume',
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
      const resumed = await musicManager.resume(message.guild.id);
      if (resumed) {
        await message.channel.send('```\n️ Resumed\n```');
      }
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};