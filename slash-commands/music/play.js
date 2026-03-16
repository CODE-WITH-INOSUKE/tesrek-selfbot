import { SlashCommandBuilder } from 'discord.js';
import musicManager from '../../functions/musicManager.js';
export default {
  data: new SlashCommandBuilder().setName('play').setDescription('Play a song from YouTube or search query').addStringOption(option => option.setName('query').setDescription('Song name or URL').setRequired(true)),
  async execute(interaction, selfbot, bot) {
    await interaction.deferReply({
      ephemeral: true
    });
    const query = interaction.options.getString('query');
    try {
      await interaction.editReply(' Finding your voice channel...');
      let targetGuild = null;
      let targetVoiceChannel = null;
      const selfbotGuilds = selfbot.guilds.cache;
      for (const [guildId, guild] of selfbotGuilds) {
        try {
          const member = guild.members.cache.get(interaction.user.id);
          if (member && member.voice && member.voice.channel) {
            targetGuild = guild;
            targetVoiceChannel = member.voice.channel;
            console.log(`[Music] Found user in ${guild.name} - ${member.voice.channel.name}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      if (!targetGuild) {
        for (const [guildId, guild] of selfbotGuilds) {
          try {
            const member = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (member && member.voice && member.voice.channel) {
              targetGuild = guild;
              targetVoiceChannel = member.voice.channel;
              console.log(`[Music] Found user in ${guild.name} - ${member.voice.channel.name} (via fetch)`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
      if (!targetGuild || !targetVoiceChannel) {
        return interaction.editReply(' Could not find you in any voice channel.\n\n' + 'Make sure:\n' + '1. You are in a voice channel in any server\n' + '2. The selfbot is in that server\n' + '3. The selfbot can see that voice channel');
      }
      const guildId = targetGuild.id;
      const voiceChannel = targetVoiceChannel;
      await interaction.editReply(` Found you in **${targetGuild.name}** - **${voiceChannel.name}**`);
      await musicManager.init();
      let queue = musicManager.getQueue(guildId);
      if (!queue) {
        await musicManager.connect(guildId, selfbot.user.id);
        queue = musicManager.getQueue(guildId);
        queue.textChannel = interaction.channel;
      }
      let voiceState = null;
      const voiceData = selfbot.voiceData?.get(guildId);
      if (!voiceData?.serverUpdate || !voiceData?.stateUpdate) {
        await interaction.editReply(` Selfbot connecting to voice channel...`);
        voiceState = await musicManager.joinVoiceChannel(guildId, voiceChannel.id, selfbot);
      } else {
        voiceState = {
          token: voiceData.serverUpdate.token,
          endpoint: voiceData.serverUpdate.endpoint,
          sessionId: voiceData.stateUpdate.session_id,
          channelId: voiceChannel.id
        };
      }
      await interaction.editReply(' Searching for track...');
      const tracks = await musicManager.play(guildId, query, interaction.user.tag, voiceState);
      let response = '';
      if (tracks.length === 1) {
        const track = tracks[0];
        if (queue.nowPlaying && queue.nowPlaying.info.title === track.info.title) {
          response = ` **Now Playing**\n**${track.info.title}** - ${track.info.author} (${musicManager.formatDuration(track.info.length)})`;
        } else if (queue.nowPlaying) {
          response = ` **Added to Queue**\n**${track.info.title}** - ${track.info.author} (${musicManager.formatDuration(track.info.length)})\n Position: ${queue.songs.length}`;
        } else {
          response = ` **Now Playing**\n**${track.info.title}** - ${track.info.author} (${musicManager.formatDuration(track.info.length)})`;
        }
      } else {
        response = ` **Added Playlist**\n${tracks.length} songs added to queue\n Total in queue: ${queue.songs.length}`;
      }
      response += `\n Server: **${targetGuild.name}** | Channel: **${voiceChannel.name}**`;
      await interaction.editReply(response);
    } catch (error) {
      console.error('[Slash Play Error]:', error);
      await interaction.editReply(` Error: ${error.message}\n\n` + `Make sure:\n` + `1. Selfbot is online\n` + `2. You are in a voice channel\n` + `3. Selfbot is in that server\n` + `4. Selfbot has permission to join the channel`);
    }
  }
};