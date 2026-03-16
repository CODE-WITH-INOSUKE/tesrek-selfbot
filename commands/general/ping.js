export default {
  name: 'ping',
  aliases: ['pong', 'latency'],
  description: 'Check bot latency',
  usage: 'ping',
  category: 'general',
  execute(message, args, selfbot, bot) {
    const latency = Date.now() - message.createdTimestamp;
    const apiLatency = Math.round(selfbot.ws.ping);
    message.channel.send(`**Pong!** \n` + ` Bot Latency: \`${latency}ms\`\n` + ` API Latency: \`${apiLatency}ms\``);
  }
};