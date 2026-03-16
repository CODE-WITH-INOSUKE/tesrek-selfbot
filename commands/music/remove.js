import musicManager from '../../functions/musicManager.js';
export default {
  name: 'remove',
  aliases: ['rm'],
  category: 'music',
  description: 'Remove a song from the queue',
  usage: 'remove <position>',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    if (!args.length) {
      return message.channel.send('```\n Please provide the queue position to remove.\n```');
    }
    const position = parseInt(args[0]) - 1;
    if (isNaN(position) || position < 0) {
      return message.channel.send('```\n Please provide a valid position.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || queue.songs.length === 0) {
        return message.channel.send('```\n Queue is empty.\n```');
      }
      if (position >= queue.songs.length) {
        return message.channel.send('```\n Invalid queue position.\n```');
      }
      const removed = queue.songs.splice(position, 1)[0];
      await message.channel.send(`\`\`\`\n Removed: ${removed.info.title}\n\`\`\``);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};