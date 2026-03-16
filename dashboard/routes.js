import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { loadData, saveData } from '../functions/helpers.js';
import musicManager from '../functions/musicManager.js';
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function checkAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}
router.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.render('login', {
    error: null
  });
});
router.post('/login', (req, res) => {
  const {
    username,
    password
  } = req.body;
  if (username === process.env.DASHBOARD_USER && password === process.env.DASHBOARD_PASS) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.render('login', {
      error: 'Invalid username or password'
    });
  }
});
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
router.get('/', checkAuth, (req, res) => {
  const config = loadData('config');
  res.render('index', {
    currentPage: 'home',
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    guilds: global.selfbot?.guilds.cache.size || 0,
    users: global.selfbot?.users.cache.size || 0,
    channels: global.selfbot?.channels.cache.size || 0,
    uptime: process.uptime(),
    commandsCount: global.selfbot?.commands.size || 0,
    slashCommandsCount: global.bot?.slashCommands.size || 0,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/settings', checkAuth, (req, res) => {
  const config = loadData('config');
  res.render('settings', {
    currentPage: 'settings',
    config,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.post('/settings', checkAuth, (req, res) => {
  const {
    prefix,
    status,
    activity,
    activityType
  } = req.body;
  const config = loadData('config');
  config.prefix = prefix || config.prefix || '!';
  config.status = status || config.status || 'online';
  config.activity = activity || config.activity || '';
  config.activityType = activityType || config.activityType || 'PLAYING';
  saveData('config', config);
  global.selfbot.config = config;
  if (config.activity) {
    const activities = [{
      name: config.activity,
      type: config.activityType.toUpperCase()
    }];
    global.selfbot.user.setPresence({
      activities,
      status: config.status
    });
  } else {
    global.selfbot.user.setPresence({
      status: config.status
    });
  }
  res.redirect('/settings');
});
router.get('/bot-settings', checkAuth, (req, res) => {
  const config = loadData('config');
  res.render('bot-settings', {
    currentPage: 'bot-settings',
    config,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.post('/bot-settings', checkAuth, (req, res) => {
  const {
    slashEphemeral,
    selfbotResponses,
    slashEmbedStyle,
    botStatus,
    botActivity,
    autoKoutube
  } = req.body;
  const config = loadData('config');
  config.slashEphemeral = slashEphemeral === 'on';
  config.selfbotResponses = selfbotResponses === 'on';
  config.slashEmbedStyle = slashEmbedStyle || 'default';
  config.botStatus = botStatus || 'online';
  config.botActivity = botActivity || '';
  config.autoKoutube = autoKoutube === 'on';
  saveData('config', config);
  if (global.bot?.user) {
    global.bot.user.setPresence({
      activities: config.botActivity ? [{
        name: config.botActivity,
        type: 0
      }] : [],
      status: config.botStatus
    });
  }
  res.redirect('/bot-settings');
});
router.get('/users', checkAuth, (req, res) => {
  const config = loadData('config');
  res.render('users', {
    currentPage: 'users',
    allowedUsers: config.allowedUsers || [],
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null
  });
});
router.post('/users/add', checkAuth, (req, res) => {
  const {
    userId
  } = req.body;
  const config = loadData('config');
  if (!config.allowedUsers) config.allowedUsers = [];
  if (userId && !config.allowedUsers.includes(userId)) {
    config.allowedUsers.push(userId);
    saveData('config', config);
  }
  res.redirect('/users');
});
router.post('/users/remove', checkAuth, (req, res) => {
  const {
    userId
  } = req.body;
  const config = loadData('config');
  if (config.allowedUsers) {
    config.allowedUsers = config.allowedUsers.filter(id => id !== userId);
    saveData('config', config);
  }
  res.redirect('/users');
});
router.post('/settings/background', checkAuth, (req, res) => {
  const {
    backgroundUrl
  } = req.body;
  const config = loadData('config');
  config.background = backgroundUrl || null;
  saveData('config', config);
  res.redirect('/settings');
});
router.get('/guilds', checkAuth, (req, res) => {
  const config = loadData('config');
  const guilds = global.selfbot?.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({
      dynamic: true,
      size: 1024
    }),
    memberCount: guild.memberCount,
    channelCount: guild.channels.cache.size,
    roleCount: guild.roles.cache.size,
    ownerId: guild.ownerId,
    createdAt: guild.createdAt,
    verificationLevel: guild.verificationLevel,
    banner: guild.bannerURL({
      size: 1024
    })
  })) || [];
  res.render('guilds', {
    currentPage: 'guilds',
    guilds,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/commands', checkAuth, (req, res) => {
  const config = loadData('config');
  const commands = {};
  if (global.selfbot?.commands) {
    for (const [name, cmd] of global.selfbot.commands) {
      if (!commands[cmd.category]) commands[cmd.category] = [];
      commands[cmd.category].push({
        name: cmd.name,
        aliases: cmd.aliases || [],
        description: cmd.description || 'No description',
        usage: cmd.usage || 'No usage info',
        category: cmd.category
      });
    }
  }
  res.render('commands', {
    currentPage: 'commands',
    commands,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/slash-commands', checkAuth, (req, res) => {
  const config = loadData('config');
  const commands = {};
  if (global.bot?.slashCommands) {
    for (const [name, cmd] of global.bot.slashCommands) {
      if (!commands[cmd.category]) commands[cmd.category] = [];
      commands[cmd.category].push({
        name: cmd.data.name,
        description: cmd.data.description,
        category: cmd.category
      });
    }
  }
  res.render('slash-commands', {
    currentPage: 'slash-commands',
    commands,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/stats', checkAuth, (req, res) => {
  const config = loadData('config');
  const memory = process.memoryUsage();
  res.render('stats', {
    currentPage: 'stats',
    memory,
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/music', checkAuth, async (req, res) => {
  const config = loadData('config');
  const guilds = global.selfbot?.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({
      dynamic: true,
      size: 256
    }),
    memberCount: guild.memberCount
  })) || [];
  res.render('music', {
    currentPage: 'music',
    guilds,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || []
  });
});
router.get('/api/music/voice-channels/:guildId', checkAuth, async (req, res) => {
  const {
    guildId
  } = req.params;
  try {
    const channels = await musicManager.getVoiceChannels(guildId, global.selfbot);
    res.json({
      success: true,
      channels
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.post('/api/music/join', checkAuth, async (req, res) => {
  const {
    guildId,
    channelId
  } = req.body;
  try {
    await musicManager.init();
    await musicManager.connect(guildId, global.selfbot.user.id);
    const voiceState = await musicManager.joinVoiceChannel(guildId, channelId, global.selfbot);
    res.json({
      success: true,
      voiceState
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.get('/api/music/search/:query', checkAuth, async (req, res) => {
  const {
    query
  } = req.params;
  const {
    guildId
  } = req.query;
  try {
    await musicManager.init();
    const identifier = musicManager.createVoiceIdentifier(query);
    const result = await musicManager.lavalink.loadTracks(identifier);
    let tracks = [];
    if (result.loadType === 'search') {
      tracks = result.data;
    } else if (result.loadType === 'track') {
      tracks = [result.data];
    } else if (result.loadType === 'playlist') {
      tracks = result.data.tracks;
    }
    res.json({
      success: true,
      tracks
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.post('/api/music/play', checkAuth, async (req, res) => {
  const {
    guildId,
    query
  } = req.body;
  try {
    await musicManager.init();
    const voiceData = global.selfbot?.voiceData?.get(guildId);
    if (!voiceData?.serverUpdate || !voiceData?.stateUpdate) {
      return res.json({
        success: false,
        error: 'Not connected to voice channel'
      });
    }
    const voiceState = {
      token: voiceData.serverUpdate.token,
      endpoint: voiceData.serverUpdate.endpoint,
      sessionId: voiceData.stateUpdate.session_id,
      channelId: voiceData.stateUpdate.channel_id
    };
    const tracks = await musicManager.play(guildId, query, 'Dashboard User', voiceState);
    res.json({
      success: true,
      tracks
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.get('/api/music/status/:guildId', checkAuth, async (req, res) => {
  const {
    guildId
  } = req.params;
  try {
    const queue = musicManager.getQueue(guildId);
    if (!queue) {
      return res.json({
        active: false
      });
    }
    res.json({
      active: true,
      nowPlaying: queue.nowPlaying,
      queue: queue.songs,
      queueLength: queue.songs.length,
      volume: queue.volume,
      position: queue.position || 0,
      loop: queue.loop || 'off'
    });
  } catch (error) {
    res.json({
      active: false,
      error: error.message
    });
  }
});
router.post('/api/music/control', checkAuth, async (req, res) => {
  const {
    guildId,
    action,
    value
  } = req.body;
  try {
    let result;
    const voiceData = global.selfbot?.voiceData?.get(guildId);
    const voiceState = voiceData?.serverUpdate && voiceData?.stateUpdate ? {
      token: voiceData.serverUpdate.token,
      endpoint: voiceData.serverUpdate.endpoint,
      sessionId: voiceData.stateUpdate.session_id,
      channelId: voiceData.stateUpdate.channel_id
    } : null;
    switch (action) {
      case 'pause':
        result = await musicManager.pause(guildId);
        break;
      case 'resume':
        result = await musicManager.resume(guildId);
        break;
      case 'skip':
        result = await musicManager.skip(guildId, voiceState);
        break;
      case 'previous':
        result = await musicManager.previous(guildId, voiceState);
        break;
      case 'stop':
        result = await musicManager.stop(guildId);
        break;
      case 'volume':
        result = await musicManager.setVolume(guildId, parseInt(value));
        break;
      case 'seek':
        result = await musicManager.seek(guildId, parseInt(value));
        break;
      case 'shuffle':
        const queue = musicManager.getQueue(guildId);
        if (queue && queue.songs.length > 0) {
          for (let i = queue.songs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
          }
          result = true;
        }
        break;
      case 'loop':
        const q = musicManager.getQueue(guildId);
        if (q) {
          q.loop = value;
          result = true;
        }
        break;
      case 'remove':
        const queueObj = musicManager.getQueue(guildId);
        if (queueObj && queueObj.songs.length > value) {
          queueObj.songs.splice(value, 1);
          result = true;
        }
        break;
    }
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.get('/api/stats', checkAuth, (req, res) => {
  res.json({
    selfbot: {
      guilds: global.selfbot?.guilds.cache.size || 0,
      users: global.selfbot?.users.cache.size || 0,
      channels: global.selfbot?.channels.cache.size || 0,
      commands: global.selfbot?.commands.size || 0
    },
    bot: {
      guilds: global.bot?.guilds.cache.size || 0,
      users: global.bot?.users.cache.size || 0,
      commands: global.bot?.slashCommands.size || 0
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
router.get('/api/guilds/:guildId/details', checkAuth, async (req, res) => {
  const {
    guildId
  } = req.params;
  try {
    const guild = global.selfbot.guilds.cache.get(guildId);
    if (!guild) {
      return res.json({
        success: false,
        error: 'Guild not found'
      });
    }
    const channels = guild.channels.cache.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      position: channel.position,
      userCount: channel.members?.size || 0
    }));
    const roles = guild.roles.cache.map(role => ({
      id: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      hoist: role.hoist,
      mentionable: role.mentionable
    }));
    const members = guild.members.cache.map(member => ({
      id: member.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      nickname: member.nickname,
      roles: member.roles.cache.map(r => r.id)
    }));
    const emojis = guild.emojis.cache.map(emoji => ({
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated
    }));
    res.json({
      success: true,
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL({
          dynamic: true,
          size: 1024
        }),
        banner: guild.bannerURL({
          dynamic: true,
          size: 1024
        }),
        ownerId: guild.ownerId,
        createdAt: guild.createdAt,
        memberCount: guild.memberCount,
        verificationLevel: guild.verificationLevel
      },
      channels,
      roles,
      members,
      emojis
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.post('/api/guilds/leave', checkAuth, async (req, res) => {
  const {
    guildId
  } = req.body;
  try {
    const guild = global.selfbot.guilds.cache.get(guildId);
    if (!guild) {
      return res.json({
        success: false,
        error: 'Guild not found'
      });
    }
    await guild.leave();
    res.json({
      success: true
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.get('/rpc', checkAuth, async (req, res) => {
  const config = loadData('config');
  const guilds = global.selfbot?.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({
      dynamic: true,
      size: 256
    }),
    channels: guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' || c.type === 0).map(c => ({
      id: c.id,
      name: c.name
    }))
  })) || [];
  res.render('rpc', {
    currentPage: 'rpc',
    config,
    guilds,
    selfbot: global.selfbot,
    bot: global.bot,
    selfbotUser: global.selfbot?.user,
    botUser: global.bot?.user,
    background: config.background || null,
    allowedUsers: config.allowedUsers || [],
    rpcConfig: config.rpc || {
      enabled: false,
      details: 'Playing on SelfBot',
      state: 'Dashboard Connected',
      largeImageKey: 'logo',
      largeImageText: 'SelfBot v3',
      smallImageKey: 'online',
      smallImageText: 'Online',
      buttons: [],
      partySize: 0,
      partyMax: 0,
      joinSecret: null,
      matchSecret: null,
      spectateSecret: null,
      instance: false,
      timestamps: 'none',
      startTime: null,
      endTime: null
    }
  });
});
router.post('/rpc/update', checkAuth, async (req, res) => {
  const config = loadData('config');
  const {
    enabled,
    details,
    state,
    largeImageKey,
    largeImageText,
    smallImageKey,
    smallImageText,
    button1Label,
    button1Url,
    button2Label,
    button2Url,
    partySize,
    partyMax,
    joinSecret,
    matchSecret,
    spectateSecret,
    instance,
    timestamps,
    customStartTime,
    customEndTime
  } = req.body;
  if (!config.rpc) config.rpc = {};
  config.rpc.enabled = enabled === 'on';
  config.rpc.details = details || 'Playing on SelfBot';
  config.rpc.state = state || 'Dashboard Connected';
  config.rpc.largeImageKey = largeImageKey || 'logo';
  config.rpc.largeImageText = largeImageText || 'SelfBot v3';
  config.rpc.smallImageKey = smallImageKey || 'online';
  config.rpc.smallImageText = smallImageText || 'Online';
  config.rpc.buttons = [];
  if (button1Label && button1Url) {
    config.rpc.buttons.push({
      label: button1Label,
      url: button1Url
    });
  }
  if (button2Label && button2Url) {
    config.rpc.buttons.push({
      label: button2Label,
      url: button2Url
    });
  }
  config.rpc.partySize = parseInt(partySize) || 0;
  config.rpc.partyMax = parseInt(partyMax) || 0;
  config.rpc.joinSecret = joinSecret || null;
  config.rpc.matchSecret = matchSecret || null;
  config.rpc.spectateSecret = spectateSecret || null;
  config.rpc.instance = instance === 'on';
  config.rpc.timestamps = timestamps || 'none';
  if (timestamps === 'custom') {
    config.rpc.startTime = customStartTime ? new Date(customStartTime).getTime() : null;
    config.rpc.endTime = customEndTime ? new Date(customEndTime).getTime() : null;
  } else if (timestamps === 'start') {
    config.rpc.startTime = Date.now();
    config.rpc.endTime = null;
  } else {
    config.rpc.startTime = null;
    config.rpc.endTime = null;
  }
  saveData('config', config);
  if (config.rpc.enabled && global.selfbot?.user) {
    updateRPC(config.rpc);
  } else {
    if (global.selfbot?.user) {
      global.selfbot.user.setActivity(null);
    }
  }
  res.redirect('/rpc');
});
router.post('/rpc/test', checkAuth, async (req, res) => {
  const config = loadData('config');
  const rpcConfig = config.rpc || {};
  try {
    if (!global.selfbot?.user) {
      return res.json({
        success: false,
        error: 'Selfbot not connected'
      });
    }
    await updateRPC(rpcConfig);
    res.json({
      success: true
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
router.post('/rpc/clear', checkAuth, async (req, res) => {
  try {
    if (global.selfbot?.user) {
      await global.selfbot.user.setActivity(null);
    }
    res.json({
      success: true
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
async function updateRPC(rpcConfig) {
  if (!rpcConfig.enabled || !global.selfbot?.user) return;
  const activity = {
    name: rpcConfig.details || 'SelfBot',
    type: 0,
    details: rpcConfig.details,
    state: rpcConfig.state
  };
  if (rpcConfig.timestamps === 'start' && rpcConfig.startTime) {
    activity.startTimestamp = rpcConfig.startTime;
  } else if (rpcConfig.timestamps === 'custom') {
    if (rpcConfig.startTime) activity.startTimestamp = rpcConfig.startTime;
    if (rpcConfig.endTime) activity.endTimestamp = rpcConfig.endTime;
  }
  if (rpcConfig.partySize > 0 && rpcConfig.partyMax > 0) {
    activity.party = {
      id: `party-${Date.now()}`,
      size: [rpcConfig.partySize, rpcConfig.partyMax]
    };
  }
  if (rpcConfig.joinSecret) {
    if (!activity.secrets) activity.secrets = {};
    activity.secrets.join = rpcConfig.joinSecret;
  }
  if (rpcConfig.matchSecret) {
    if (!activity.secrets) activity.secrets = {};
    activity.secrets.match = rpcConfig.matchSecret;
  }
  if (rpcConfig.spectateSecret) {
    if (!activity.secrets) activity.secrets = {};
    activity.secrets.spectate = rpcConfig.spectateSecret;
  }
  if (rpcConfig.instance) {
    activity.instance = true;
  }
  if (rpcConfig.buttons && rpcConfig.buttons.length > 0) {
    activity.buttons = rpcConfig.buttons.slice(0, 2).map(b => ({
      label: b.label,
      url: b.url
    }));
  }
  activity.assets = {};
  if (rpcConfig.largeImageKey) {
    activity.assets.largeImage = rpcConfig.largeImageKey;
    if (rpcConfig.largeImageText) {
      activity.assets.largeText = rpcConfig.largeImageText;
    }
  }
  if (rpcConfig.smallImageKey) {
    activity.assets.smallImage = rpcConfig.smallImageKey;
    if (rpcConfig.smallImageText) {
      activity.assets.smallText = rpcConfig.smallImageText;
    }
  }
  try {
    await global.selfbot.user.setActivity(activity);
    console.log('[RPC] Updated successfully');
  } catch (error) {
    console.error('[RPC] Update failed:', error);
  }
}
export default router;