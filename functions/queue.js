class Queue {
  constructor() {
    this.queues = new Map();
  }
  get(guildId) {
    return this.queues.get(guildId);
  }
  create(guildId) {
    const queue = {
      songs: [],
      nowPlaying: null,
      volume: 100,
      filters: {},
      textChannel: null,
      position: 0,
      loop: 'off',
      history: [],
      autoPlay: true
    };
    this.queues.set(guildId, queue);
    return queue;
  }
  delete(guildId) {
    this.queues.delete(guildId);
  }
  addSong(guildId, song) {
    const queue = this.get(guildId);
    if (queue) {
      queue.songs.push(song);
    }
  }
  getNext(guildId) {
    const queue = this.get(guildId);
    if (!queue) return null;
    if (queue.songs.length > 0) {
      if (queue.loop === 'single' && queue.nowPlaying) {
        return queue.nowPlaying;
      } else if (queue.loop === 'all' && queue.nowPlaying) {
        const nextSong = queue.songs.shift();
        if (queue.nowPlaying) {
          queue.songs.push(queue.nowPlaying);
          queue.history.push(queue.nowPlaying);
        }
        return nextSong;
      } else {
        const nextSong = queue.songs.shift();
        if (queue.nowPlaying) {
          queue.history.push(queue.nowPlaying);
        }
        if (queue.history.length > 50) {
          queue.history.shift();
        }
        return nextSong;
      }
    }
    return null;
  }
  getPrevious(guildId) {
    const queue = this.get(guildId);
    if (!queue || queue.history.length === 0) return null;
    const previousTrack = queue.history.pop();
    if (queue.nowPlaying) {
      queue.songs.unshift(queue.nowPlaying);
    }
    return previousTrack;
  }
  remove(guildId, index) {
    const queue = this.get(guildId);
    if (queue && queue.songs.length > index) {
      return queue.songs.splice(index, 1)[0];
    }
    return null;
  }
  clear(guildId) {
    const queue = this.get(guildId);
    if (queue) {
      queue.songs = [];
      queue.history = [];
    }
  }
  shuffle(guildId) {
    const queue = this.get(guildId);
    if (queue && queue.songs.length > 1) {
      for (let i = queue.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
      }
      return true;
    }
    return false;
  }
  setLoop(guildId, mode) {
    const queue = this.get(guildId);
    if (queue) {
      queue.loop = mode;
      return true;
    }
    return false;
  }
  setVolume(guildId, volume) {
    const queue = this.get(guildId);
    if (queue) {
      queue.volume = Math.max(0, Math.min(1000, volume));
      return true;
    }
    return false;
  }
  getQueueLength(guildId) {
    const queue = this.get(guildId);
    return queue ? queue.songs.length : 0;
  }
  getAllQueues() {
    const allQueues = [];
    for (const [guildId, queue] of this.queues.entries()) {
      allQueues.push({
        guildId,
        ...queue
      });
    }
    return allQueues;
  }
  cleanup() {
    for (const [guildId, queue] of this.queues.entries()) {
      if (queue.songs.length === 0 && !queue.nowPlaying) {
        this.delete(guildId);
      }
    }
  }
}
export default new Queue();