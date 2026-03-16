import express from 'express';
import musicManager from '../../functions/musicManager.js';
import { loadData } from '../../functions/helpers.js';
const router = express.Router();
function checkAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}
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
router.get('/api/music/status/:guildId', checkAuth, async (req, res) => {
  const {
    guildId
  } = req.params;
  const queue = musicManager.getQueue(guildId);
  if (!queue) {
    return res.json({
      active: false
    });
  }
  res.json({
    active: true,
    nowPlaying: queue.nowPlaying,
    queueLength: queue.songs.length,
    volume: queue.volume,
    position: queue.position || 0,
    loop: queue.loop || 'off'
  });
});
router.post('/api/music/control', checkAuth, async (req, res) => {
  const {
    guildId,
    action,
    value
  } = req.body;
  try {
    let result;
    switch (action) {
      case 'play':
        break;
      case 'pause':
        result = await musicManager.pause(guildId);
        break;
      case 'resume':
        result = await musicManager.resume(guildId);
        break;
      case 'skip':
        result = await musicManager.skip(guildId);
        break;
      case 'previous':
        result = await musicManager.previous(guildId);
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
export default router;