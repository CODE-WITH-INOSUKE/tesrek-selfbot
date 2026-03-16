import musicManager from '../../functions/musicManager.js';
export default {
  name: 'previous',
  aliases: ['prev', 'back'],
  description: 'Go back to the previous track',
  usage: 'previous',
  category: 'music',
  async execute(message, args, selfbot, bot) {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      return message.channel.send(' You must be in a voice channel to use this command.');
    }
    try {
      const queue = musicManager.getQueue(message.guild.id);
      if (!queue || !queue.nowPlaying) {
        return message.channel.send(' Nothing is playing.');
      }
      await musicManager.previous(message.guild.id);
      message.channel.send('️ **Playing previous track**');
    } catch (error) {
      message.channel.send(` Error: ${error.message}`);
    }
  }
};