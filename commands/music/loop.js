import musicManager from '../../functions/musicManager.js';
export default {
  name: 'loop',
  aliases: ['repeat'],
  category: 'music',
  description: 'Toggle loop mode (off/single/all)',
  usage: 'loop [off/single/all]',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue) {
        return message.channel.send('```\n No active music session.\n```');
      }
      if (!args.length) {
        return message.channel.send(`\`\`\`\n Current loop mode: ${queue.loop || 'off'}\n\`\`\``);
      }
      const mode = args[0].toLowerCase();
      if (!['off', 'single', 'all'].includes(mode)) {
        return message.channel.send('```\n Invalid mode. Use: off, single, all\n```');
      }
      queue.loop = mode;
      await message.channel.send(`\`\`\`\n Loop mode set to: ${mode}\n\`\`\``);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};