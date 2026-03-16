import WebSocket from 'ws';
import fetch from 'node-fetch';
class Lavalink {
  constructor({
    restHost,
    wsHost,
    password,
    clientName
  }) {
    this.restHost = restHost.replace(/\/$/, '');
    this.wsHost = wsHost;
    this.password = password;
    this.clientName = clientName;
    this.sessionId = null;
    this.ws = null;
    this.userId = null;
    this.listeners = new Map();
  }
  async connect(userId) {
    this.userId = userId;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    const headers = {
      Authorization: this.password,
      'User-Id': userId,
      'Client-Name': this.clientName
    };
    if (this.sessionId) {
      headers['Session-Id'] = this.sessionId;
    }
    this.ws = new WebSocket(this.wsHost, {
      headers
    });
    this.ws.on('open', () => console.log('[Lavalink] Connected'));
    this.ws.on('close', (code, reason) => console.log(`[Lavalink] Closed: ${code} - ${reason}`));
    this.ws.on('error', error => console.error('[Lavalink] Error:', error));
    this.ws.on('message', msg => {
      try {
        const data = JSON.parse(msg);
        this.handlePayload(data);
      } catch (err) {
        console.error('[Lavalink] Parse error:', err);
      }
    });
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Lavalink connection timeout'));
      }, 10000);
      this.on('ready', data => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
  }
  handlePayload(payload) {
    switch (payload.op) {
      case 'ready':
        this.sessionId = payload.sessionId;
        console.log('[Lavalink] Session:', this.sessionId);
        this.emit('ready', payload);
        break;
      case 'playerUpdate':
        this.emit('playerUpdate', payload);
        break;
      case 'event':
        this.emit('event', payload);
        break;
      case 'stats':
        this.emit('stats', payload);
        break;
    }
  }
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
  async loadTracks(identifier) {
    if (!this.sessionId) throw new Error('Session ID not set. Connect first.');
    const url = `${this.restHost}/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    return await res.json();
  }
  async decodeTrack(encodedTrack) {
    const url = `${this.restHost}/v4/decodetrack?encodedTrack=${encodeURIComponent(encodedTrack)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async getPlayers() {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}/players`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async getPlayer(guildId) {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}/players/${guildId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async updatePlayer(guildId, track, voiceState, options = {}) {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}/players/${guildId}?noReplace=${options.noReplace || false}`;
    const payload = {};
    if (track) {
      payload.track = {
        encoded: track.encoded || track
      };
      if (options.userData) {
        payload.track.userData = options.userData;
      }
    }
    if (voiceState) {
      payload.voice = {
        token: voiceState.token,
        endpoint: voiceState.endpoint,
        sessionId: voiceState.sessionId,
        channelId: voiceState.channelId
      };
    }
    if (options.volume !== undefined) payload.volume = options.volume;
    if (options.paused !== undefined) payload.paused = options.paused;
    if (options.position !== undefined) payload.position = options.position;
    if (options.filters !== undefined) payload.filters = options.filters;
    if (options.endTime !== undefined) payload.endTime = options.endTime;
    console.log('[Lavalink] Update Player Payload (DAVE compliant):', {
      guildId,
      hasTrack: !!track,
      hasVoice: !!voiceState,
      channelId: voiceState?.channelId
    });
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: this.password,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Lavalink] Update Player Error Response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return await res.json();
  }
  async updatePlayerProperties(guildId, properties = {}) {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}/players/${guildId}`;
    const payload = {};
    if (properties.volume !== undefined) payload.volume = properties.volume;
    if (properties.paused !== undefined) payload.paused = properties.paused;
    if (properties.position !== undefined) payload.position = properties.position;
    if (properties.filters !== undefined) payload.filters = properties.filters;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: this.password,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return await res.json();
  }
  async destroyPlayer(guildId) {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}/players/${guildId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: this.password
      }
    });
    return res.status === 204;
  }
  async updateSession(options = {}) {
    if (!this.sessionId) throw new Error('Session ID not set');
    const url = `${this.restHost}/v4/sessions/${this.sessionId}`;
    const payload = {};
    if (options.resuming !== undefined) payload.resuming = options.resuming;
    if (options.timeout !== undefined) payload.timeout = options.timeout;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: this.password,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async getInfo() {
    const url = `${this.restHost}/v4/info`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async getStats() {
    const url = `${this.restHost}/v4/stats`;
    const res = await fetch(url, {
      headers: {
        Authorization: this.password
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
  async getVersion() {
    const url = `${this.restHost}/version`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }
}
export default Lavalink;