import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('seek').setDescription('Seek to a position in the current track').addIntegerOption(option => option.setName('seconds').setDescription('Position in seconds').setMinValue(0).setRequired(true)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const seconds = interaction.options.getInteger('seconds');
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
      const position = seconds * 1000;
      if (position > queue.nowPlaying.info.length) {
        return interaction.editReply(' Cannot seek beyond track duration.');
      }
      await musicManager.seek(targetGuild.id, position);
      await interaction.editReply(` **Seeked to ${musicManager.formatDuration(position)}** in **${targetGuild.name}**`);
    } catch (error) {
      console.error('[Slash Seek Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};