import Queue from './queue.js';
import Lavalink from './lavalink.js';
import { EventEmitter } from 'events';
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
class MusicManager extends EventEmitter {
  constructor() {
    super();
    this.lavalink = null;
    this.initialized = false;
    this.connections = new Map();
  }
  async init() {
    if (this.initialized) return;
    this.lavalink = new Lavalink({
      restHost: process.env.LAVALINK_REST_HOST,
      wsHost: process.env.LAVALINK_WS_HOST,
      password: process.env.LAVALINK_PASSWORD,
      clientName: process.env.LAVALINK_CLIENT_NAME
    });
    this.lavalink.on('ready', data => {
      console.log('[Music] Lavalink ready');
    });
    this.lavalink.on('playerUpdate', data => {
      this.handlePlayerUpdate(data);
    });
    this.lavalink.on('event', data => {
      this.handlePlayerEvent(data);
    });
    this.initialized = true;
  }
  async connect(guildId, userId) {
    if (!this.lavalink) await this.init();
    await this.lavalink.connect(userId);
    if (!Queue.get(guildId)) {
      Queue.create(guildId);
    }
    return Queue.get(guildId);
  }
  createVoiceIdentifier(query) {
    return /^(https?:\/\/|www\.)/i.test(query) ? query : `ytmsearch:${query}`;
  }
  async joinVoiceChannel(guildId, channelId, selfbot) {
    const guild = selfbot.guilds.cache.get(guildId);
    if (!guild) throw new Error('Guild not found');
    const channel = guild.channels.cache.get(channelId);
    if (!channel || channel.type !== 'GUILD_VOICE') {
      throw new Error('Invalid voice channel');
    }
    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });
      this.connections.set(guildId, connection);
      await entersState(connection, VoiceConnectionStatus.Ready, 20000);
      const voiceData = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          selfbot.voicePromises.delete(guildId);
          reject(new Error('Timeout waiting for voice events'));
        }, 20000);
        selfbot.voicePromises.set(guildId, {
          resolve: data => {
            clearTimeout(timeout);
            resolve(data);
          },
          reject,
          timeout
        });
        const existingData = selfbot.voiceData.get(guildId);
        if (existingData?.serverUpdate && existingData?.stateUpdate) {
          clearTimeout(timeout);
          selfbot.voicePromises.delete(guildId);
          resolve({
            server: existingData.serverUpdate,
            state: existingData.stateUpdate
          });
        }
      });
      return {
        token: voiceData.server.token,
        endpoint: voiceData.server.endpoint,
        sessionId: voiceData.state.session_id,
        channelId: channelId
      };
    } catch (error) {
      throw error;
    }
  }
  async getVoiceChannels(guildId, selfbot) {
    const guild = selfbot.guilds.cache.get(guildId);
    if (!guild) return [];
    return guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').map(channel => ({
      id: channel.id,
      name: channel.name,
      userCount: channel.members.size,
      bitrate: channel.bitrate
    }));
  }
  async play(guildId, query, requester, voiceState) {
    const queue = Queue.get(guildId);
    if (!queue) throw new Error('Queue not found');
    const identifier = this.createVoiceIdentifier(query);
    const result = await this.lavalink.loadTracks(identifier);
    if (result.loadType === 'empty') {
      throw new Error('No tracks found');
    }
    if (result.loadType === 'error') {
      throw new Error(`Lavalink error: ${result.data.message}`);
    }
    let tracks = [];
    if (result.loadType === 'playlist') {
      tracks = result.data.tracks;
    } else if (result.loadType === 'track') {
      tracks = [result.data];
    } else if (result.loadType === 'search') {
      tracks = [result.data[0]];
    }
    if (tracks.length === 0) {
      throw new Error('No tracks found');
    }
    for (const track of tracks) {
      Queue.addSong(guildId, {
        ...track,
        requester,
        query,
        requestedAt: Date.now()
      });
    }
    if (!queue.nowPlaying && voiceState) {
      await this.playNext(guildId, voiceState);
    }
    return tracks;
  }
  async playNext(guildId, voiceState) {
    const queue = Queue.get(guildId);
    if (!queue) return null;
    const nextTrack = Queue.getNext(guildId);
    if (!nextTrack) {
      queue.nowPlaying = null;
      queue.position = 0;
      this.emit('queueEnd', guildId);
      return null;
    }
    queue.nowPlaying = nextTrack;
    queue.position = 0;
    try {
      await this.lavalink.updatePlayer(guildId, nextTrack, voiceState, {
        volume: queue.volume
      });
      this.emit('trackStart', guildId, nextTrack);
      return nextTrack;
    } catch (error) {
      return null;
    }
  }
  async pause(guildId) {
    const queue = Queue.get(guildId);
    if (!queue || !queue.nowPlaying) return false;
    await this.lavalink.updatePlayerProperties(guildId, {
      paused: true
    });
    return true;
  }
  async resume(guildId) {
    const queue = Queue.get(guildId);
    if (!queue || !queue.nowPlaying) return false;
    await this.lavalink.updatePlayerProperties(guildId, {
      paused: false
    });
    return true;
  }
  async skip(guildId, voiceState) {
    const queue = Queue.get(guildId);
    if (!queue) return false;
    await this.playNext(guildId, voiceState);
    return true;
  }
  async stop(guildId) {
    const queue = Queue.get(guildId);
    if (!queue) return false;
    Queue.clear(guildId);
    queue.nowPlaying = null;
    await this.lavalink.destroyPlayer(guildId);
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }
    global.selfbot.voiceData.delete(guildId);
    global.selfbot.voicePromises?.delete(guildId);
    return true;
  }
  async setVolume(guildId, volume) {
    const queue = Queue.get(guildId);
    if (!queue) return false;
    queue.volume = Math.max(0, Math.min(1000, volume));
    await this.lavalink.updatePlayerProperties(guildId, {
      volume: queue.volume
    });
    return true;
  }
  async seek(guildId, position) {
    const queue = Queue.get(guildId);
    if (!queue || !queue.nowPlaying) return false;
    await this.lavalink.updatePlayerProperties(guildId, {
      position
    });
    return true;
  }
  async previous(guildId, voiceState) {
    const queue = Queue.get(guildId);
    if (!queue) return false;
    const previousTrack = Queue.getPrevious(guildId);
    if (previousTrack) {
      queue.nowPlaying = previousTrack;
      if (voiceState) {
        await this.lavalink.updatePlayer(guildId, previousTrack, voiceState, {
          volume: queue.volume
        });
      }
      return true;
    }
    return false;
  }
  handlePlayerUpdate(data) {
    const {
      guildId,
      state
    } = data;
    const queue = Queue.get(guildId);
    if (queue) {
      queue.position = state.position || 0;
    }
    this.emit('playerUpdate', guildId, state);
  }
  handlePlayerEvent(data) {
    const {
      guildId,
      type
    } = data;
    switch (type) {
      case 'TrackEndEvent':
        if (data.reason !== 'REPLACED') {
          const voiceData = global.selfbot?.voiceData?.get(guildId);
          if (voiceData?.serverUpdate && voiceData?.stateUpdate) {
            const voiceState = {
              token: voiceData.serverUpdate.token,
              endpoint: voiceData.serverUpdate.endpoint,
              sessionId: voiceData.stateUpdate.session_id,
              channelId: voiceData.stateUpdate.channel_id
            };
            this.playNext(guildId, voiceState);
          }
        }
        break;
      case 'TrackExceptionEvent':
      case 'TrackStuckEvent':
      case 'WebSocketClosedEvent':
        break;
    }
  }
  getQueue(guildId) {
    return Queue.get(guildId);
  }
  getNowPlaying(guildId) {
    const queue = Queue.get(guildId);
    return queue ? queue.nowPlaying : null;
  }
  formatDuration(ms) {
    if (!ms || ms < 0) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  createProgressBar(current, total, size = 20) {
    if (!current || !total || total === 0) return ' Playing...';
    const percentage = current / total;
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;
    const progressText = '▇'.repeat(progress);
    const emptyProgressText = '—'.repeat(emptyProgress);
    return `${progressText}${emptyProgressText} ${this.formatDuration(current)}/${this.formatDuration(total)}`;
  }
}
export default new MusicManager();