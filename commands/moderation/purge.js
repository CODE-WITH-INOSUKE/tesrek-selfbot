export default {
  name: 'clear',
  aliases: ['purge', 'delete'],
  description: 'Clear messages',
  usage: 'clear [amount]',
  category: 'moderation',
  async execute(message, args, selfbot, bot) {
    const amount = parseInt(args[0]) || 10;
    if (amount > 100) {
      return message.channel.send(' Cannot delete more than 100 messages at once.');
    }
    if (amount < 1) {
      return message.channel.send(' Please specify a valid number of messages to delete.');
    }
    try {
      const messages = await message.channel.messages.fetch({
        limit: amount
      });
      await message.channel.bulkDelete(messages);
      message.channel.send(` Cleared ${amount} messages.`).then(msg => setTimeout(() => msg.delete(), 3000));
    } catch (error) {
      message.channel.send(' Failed to delete messages. Make sure I have permission.');
    }
  }
};