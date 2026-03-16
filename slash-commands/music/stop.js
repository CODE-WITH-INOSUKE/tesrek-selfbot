import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop playback and leave the voice channel'),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    try {
      let targetGuild = null;
      const selfbotGuilds = selfbot.guilds.cache;
      for (const [guildId, guild] of selfbotGuilds) {
        const queue = musicManager.getQueue(guildId);
        if (queue && (queue.nowPlaying || queue.songs.length > 0)) {
          targetGuild = guild;
          break;
        }
      }
      if (!targetGuild) {
        return interaction.editReply(' No active music session in any server.');
      }
      await musicManager.stop(targetGuild.id);
      await interaction.editReply(`️ **Stopped and left voice channel** in **${targetGuild.name}**`);
    } catch (error) {
      console.error('[Slash Stop Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};