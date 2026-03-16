import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Show currently playing track'),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    try {
      let targetGuild = null;
      const selfbotGuilds = selfbot.guilds.cache;
      for (const [guildId, guild] of selfbotGuilds) {
        const queue = musicManager.getQueue(guildId);
        if (queue && queue.nowPlaying) {
          targetGuild = guild;
          break;
        }
      }
      if (!targetGuild) {
        return interaction.editReply(' Nothing is playing in any server.');
      }
      const queue = musicManager.getQueue(targetGuild.id);
      const track = queue.nowPlaying;
      const progress = musicManager.createProgressBar(queue.position || 0, track.info.length, 20);
      const npMsg = `** Now Playing in ${targetGuild.name}**\n` + `**${track.info.title}**\n` + `┗━ Artist: ${track.info.author}\n` + `┗━ Duration: ${musicManager.formatDuration(track.info.length)}\n` + `┗━ Requested by: ${track.requester}\n` + `┗━ ${progress}\n` + `┗━ Volume: ${queue.volume}% | Loop: ${queue.loop || 'off'}`;
      await interaction.editReply(npMsg);
    } catch (error) {
      console.error('[Slash Nowplaying Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};