import musicManager from '../../functions/musicManager.js';
export default {
  name: 'shuffle',
  aliases: ['sh'],
  category: 'music',
  description: 'Shuffle the music queue',
  usage: 'shuffle',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || queue.songs.length < 2) {
        return message.channel.send('```\n Not enough songs in queue to shuffle.\n```');
      }
      for (let i = queue.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
      }
      await message.channel.send('```\n Queue shuffled!\n```');
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};