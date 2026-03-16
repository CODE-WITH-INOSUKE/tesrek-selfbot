import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('volume').setDescription('Set or view the volume (0-1000)').addIntegerOption(option => option.setName('level').setDescription('Volume level (0-1000)').setMinValue(0).setMaxValue(1000).setRequired(false)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const volume = interaction.options.getInteger('level');
    try {
      let targetGuild = null;
      const selfbotGuilds = selfbot.guilds.cache;
      for (const [guildId, guild] of selfbotGuilds) {
        const queue = musicManager.getQueue(guildId);
        if (queue) {
          targetGuild = guild;
          break;
        }
      }
      if (!targetGuild) {
        return interaction.editReply(' No active music session in any server.');
      }
      const queue = musicManager.getQueue(targetGuild.id);
      if (!queue) {
        return interaction.editReply(' No active music session.');
      }
      if (volume === null) {
        return interaction.editReply(` **Current volume** in **${targetGuild.name}**: ${queue.volume}%`);
      }
      await musicManager.setVolume(targetGuild.id, volume);
      await interaction.editReply(` **Volume set to ${volume}%** in **${targetGuild.name}**`);
    } catch (error) {
      console.error('[Slash Volume Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};