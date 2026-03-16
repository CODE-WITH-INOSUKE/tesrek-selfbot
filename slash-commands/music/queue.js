import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('queue').setDescription('Show the current music queue').addIntegerOption(option => option.setName('page').setDescription('Page number').setMinValue(1).setRequired(false)),
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
        return interaction.editReply(' No active queue in any server.');
      }
      const queue = musicManager.getQueue(targetGuild.id);
      const page = interaction.options.getInteger('page') || 1;
      const itemsPerPage = 10;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const totalPages = Math.ceil(queue.songs.length / itemsPerPage) || 1;
      let queueMsg = `** Music Queue - ${targetGuild.name}**\n`;
      queueMsg += `Page ${page}/${totalPages}\n\n`;
      if (queue.nowPlaying) {
        queueMsg += `**Now Playing:**\n`;
        queueMsg += `┗━ **${queue.nowPlaying.info.title}** - ${musicManager.formatDuration(queue.nowPlaying.info.length)}\n`;
        queueMsg += `┗━ Requested by: ${queue.nowPlaying.requester}\n\n`;
      }
      if (queue.songs.length > 0) {
        queueMsg += `**Up Next:**\n`;
        const pageSongs = queue.songs.slice(start, end);
        pageSongs.forEach((song, index) => {
          const position = start + index + 1;
          queueMsg += `${position}. **${song.info.title}** - ${musicManager.formatDuration(song.info.length)}\n`;
          queueMsg += `   ┗━ Requested by: ${song.requester}\n`;
        });
        queueMsg += `\n Total: ${queue.songs.length} songs | Total Duration: ${musicManager.formatDuration(queue.songs.reduce((acc, s) => acc + s.info.length, 0))}`;
      } else {
        queueMsg += `No songs in queue.`;
      }
      await interaction.editReply(queueMsg);
    } catch (error) {
      console.error('[Slash Queue Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};