import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pause the current track'),
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
        return interaction.editReply(' No music is playing in any server.');
      }
      const queue = musicManager.getQueue(targetGuild.id);
      if (!queue || !queue.nowPlaying) {
        return interaction.editReply(' Nothing is playing.');
      }
      const paused = await musicManager.pause(targetGuild.id);
      if (paused) {
        await interaction.editReply(`️ **Paused** in **${targetGuild.name}**`);
      }
    } catch (error) {
      console.error('[Slash Pause Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};