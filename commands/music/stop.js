import musicManager from '../../functions/musicManager.js';
export default {
  name: 'stop',
  aliases: ['leave', 'dc'],
  category: 'music',
  description: 'Stop playback and leave the voice channel',
  usage: 'stop',
  async execute(message, args, selfbot, bot) {
    if (!message.guild) {
      return message.channel.send('```\n This command can only be used in a server.\n```');
    }
    const vc = message.member?.voice?.channel;
    if (!vc) {
      return message.channel.send('```\n You must be in a voice channel.\n```');
    }
    try {
      await musicManager.stop(message.guild.id);
      await message.channel.send('```\n️ Stopped and left voice channel\n```');
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};