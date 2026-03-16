import musicManager from '../../functions/musicManager.js';
export default {
  name: 'skip',
  aliases: ['s'],
  category: 'music',
  description: 'Skip the current track',
  usage: 'skip',
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
      const voiceData = selfbot.voiceData?.get(message.guild.id);
      if (!voiceData?.serverUpdate || !voiceData?.stateUpdate) {
        return message.channel.send('```\n Not connected to voice.\n```');
      }
      const voiceState = {
        token: voiceData.serverUpdate.token,
        endpoint: voiceData.serverUpdate.endpoint,
        sessionId: voiceData.stateUpdate.session_id,
        channelId: vc.id
      };
      await musicManager.skip(message.guild.id, voiceState);
      await message.channel.send('```\n️ Skipped\n```');
      if (message.deletable) {
        await message.delete().catch(() => {});
      }
    } catch (error) {
      await message.channel.send(`\`\`\`js\n Error: ${error.message}\n\`\`\``);
    }
  }
};