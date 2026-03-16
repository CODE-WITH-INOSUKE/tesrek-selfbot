import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('loop').setDescription('Set loop mode').addStringOption(option => option.setName('mode').setDescription('Loop mode').setRequired(true).addChoices({
    name: 'Off',
    value: 'off'
  }, {
    name: 'Single',
    value: 'single'
  }, {
    name: 'All',
    value: 'all'
  })),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const mode = interaction.options.getString('mode');
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
      queue.loop = mode;
      await interaction.editReply(` **Loop mode set to ${mode}** in **${targetGuild.name}**`);
    } catch (error) {
      console.error('[Slash Loop Error]:', error);
      await interaction.editReply(` Error: ${error.message}`);
    }
  }
};