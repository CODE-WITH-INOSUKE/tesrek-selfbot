import { Client as SelfbotClient } from 'discord.js-selfbot-v13';
import { Client as BotClient, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import http from 'http';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const selfbot = new SelfbotClient();
const bot = new BotClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates]
});
selfbot.voiceData = new Map();
selfbot.voicePromises = new Map();
selfbot.on('raw', packet => {
  if (!packet) return;
  if (packet.t === 'VOICE_SERVER_UPDATE') {
    const guildId = packet.d.guild_id;
    console.log(`[Voice] Received VOICE_SERVER_UPDATE for guild ${guildId}`);
    if (!selfbot.voiceData.has(guildId)) {
      selfbot.voiceData.set(guildId, {});
    }
    const data = selfbot.voiceData.get(guildId);
    data.serverUpdate = packet.d;
    selfbot.voiceData.set(guildId, data);
    if (data.stateUpdate) {
      const promise = selfbot.voicePromises.get(guildId);
      if (promise) {
        clearTimeout(promise.timeout);
        promise.resolve({
          server: data.serverUpdate,
          state: data.stateUpdate
        });
        selfbot.voicePromises.delete(guildId);
      }
    }
  }
  if (packet.t === 'VOICE_STATE_UPDATE') {
    if (packet.d.user_id !== selfbot.user?.id) return;
    const guildId = packet.d.guild_id;
    console.log(`[Voice] Received VOICE_STATE_UPDATE for guild ${guildId} - Session: ${packet.d.session_id}`);
    if (!selfbot.voiceData.has(guildId)) {
      selfbot.voiceData.set(guildId, {});
    }
    const data = selfbot.voiceData.get(guildId);
    data.stateUpdate = packet.d;
    selfbot.voiceData.set(guildId, data);
    if (data.serverUpdate) {
      const promise = selfbot.voicePromises.get(guildId);
      if (promise) {
        clearTimeout(promise.timeout);
        promise.resolve({
          server: data.serverUpdate,
          state: data.stateUpdate
        });
        selfbot.voicePromises.delete(guildId);
      }
    }
  }
});
global.selfbot = selfbot;
global.bot = bot;
selfbot.commands = new Map();
selfbot.aliases = new Map();
bot.slashCommands = new Map();
bot.slashCategories = new Map();
selfbot.config = JSON.parse(fs.readFileSync('./data/config.json', 'utf8'));
import { loadCommands } from './functions/commandLoader.js';
import { loadEvents } from './functions/eventLoader.js';
import { loadFunctions } from './functions/functionLoader.js';
import { loadSlashCommands } from './functions/slashCommandLoader.js';
await loadCommands();
await loadEvents();
await loadFunctions();
await loadSlashCommands();
const rest = new REST({
  version: '10'
}).setToken(process.env.BOT_TOKEN);
try {
  console.log('Registering slash commands...');
  const commands = [];
  for (const [name, command] of bot.slashCommands) {
    commands.push(command.data.toJSON());
  }
  await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), {
    body: commands
  });
  console.log(` Registered ${commands.length} slash commands`);
} catch (error) {
  console.error(' Failed to register slash commands:', error);
}
const app = express();
const server = http.createServer(app);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'dashboard-secret-key-change-this',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'dashboard/views'));
app.use((req, res, next) => {
  res.locals.selfbot = selfbot.user;
  res.locals.bot = bot.user;
  res.locals.config = selfbot.config;
  res.locals.user = selfbot.user;
  next();
});
import dashboardRoutes from './dashboard/routes.js';
app.use('/', dashboardRoutes);
selfbot.login(process.env.SELFBOT_TOKEN);
bot.login(process.env.BOT_TOKEN);
server.listen(process.env.DASHBOARD_PORT || 3000, () => {
  console.log(` Dashboard running on port ${process.env.DASHBOARD_PORT || 3000}`);
  console.log(` Selfbot: ${selfbot.user?.tag || 'Not logged in'}`);
  console.log(` Bot: ${bot.user?.tag || 'Not logged in'}`);
});
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  for (const [guildId, connection] of musicManager.connections) {
    await musicManager.stop(guildId);
  }
  process.exit(0);
});