import musicManager from '../../functions/musicManager.js';
export default {
  name: 'volume',
  aliases: ['vol'],
  category: 'music',
  description: 'Set or view the volume (0-1000)',
  usage: 'volume [0-1000]',
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
      if (!queue) {
        return message.channel.send('```\n No active music session.\n```');
      }
      if (!args.length) {
        return message.channel.send(`\`\`\`\n Current volume: ${queue.volume}%\n\`\`\``);
      }
      const volume = parseInt(args[0]);
      if (isNaN(volume) || volume < 0 || volume > 1000) {
        return message.channel.send('```\n Volume must be between 0 and 1000.\n```');
      }
      await musicManager.setVolume(message.guild.id, volume);
      await message.channel.send(`\`\`\`\n Volume set to ${volume}%\n\`\`\``);
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};