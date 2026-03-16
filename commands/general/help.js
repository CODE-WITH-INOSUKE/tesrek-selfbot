export default {
  name: 'help',
  aliases: ['h', 'commands', 'cmds'],
  description: 'Show all available commands by category',
  usage: 'help [category]',
  async execute(message, args, selfbot, bot) {
    const config = selfbot.config;
    const prefix = config.prefix || '!';
    if (args.length > 0) {
      const categoryName = args[0].toLowerCase();
      const categories = ['moderation', 'utility', 'general', 'config', 'music'];
      if (!categories.includes(categoryName)) {
        return message.channel.send(`\`\`\`diff\n- Invalid category: ${categoryName}\n\nAvailable categories: ${categories.join(', ')}\n\`\`\``);
      }
      const categoryCommands = [];
      for (const [name, cmd] of selfbot.commands) {
        if (cmd.category === categoryName) {
          categoryCommands.push({
            name: cmd.name,
            description: cmd.description || 'No description',
            usage: cmd.usage || cmd.name,
            aliases: cmd.aliases || []
          });
        }
      }
      if (categoryCommands.length === 0) {
        return message.channel.send(`\`\`\`fix\nNo commands found in ${categoryName} category\`\`\``);
      }
      categoryCommands.sort((a, b) => a.name.localeCompare(b.name));
      let helpMsg = `╔════════════════════════════════════╗\n`;
      helpMsg += `║      ${categoryName.toUpperCase()} COMMANDS     ║\n`;
      helpMsg += `╚════════════════════════════════════╝\n\n`;
      const maxNameLength = Math.max(...categoryCommands.map(c => c.name.length)) + 2;
      for (const cmd of categoryCommands) {
        const padding = ' '.repeat(maxNameLength - cmd.name.length);
        helpMsg += `┌─ ${prefix}${cmd.name}${padding} ${cmd.description}\n`;
        if (cmd.aliases.length > 0) {
          helpMsg += `│  ╰─ Aliases: ${cmd.aliases.map(a => `\`${a}\``).join(', ')}\n`;
        }
        helpMsg += `│  ╰─ Usage: \`${prefix}${cmd.usage}\`\n`;
        helpMsg += `│\n`;
      }
      helpMsg += `╰────────────────────────────────────\n`;
      helpMsg += `\n Total: ${categoryCommands.length} commands`;
      return message.channel.send(`\`\`\`asciidoc\n${helpMsg}\n\`\`\``);
    }
    const categories = {};
    let totalCommands = 0;
    for (const [name, cmd] of selfbot.commands) {
      const category = cmd.category || 'general';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
      totalCommands++;
    }
    let helpMsg = `╔════════════════════════════════════╗\n`;
    helpMsg += `║      SELFBOT COMMAND MENU       ║\n`;
    helpMsg += `╚════════════════════════════════════╝\n\n`;
    helpMsg += ` Total Commands: ${totalCommands}\n`;
    helpMsg += ` Prefix: ${prefix}\n`;
    helpMsg += ` Use: ${prefix}help <category> for specific commands\n\n`;
    helpMsg += `╔════════════════════════════════════╗\n`;
    helpMsg += `║            CATEGORIES            ║\n`;
    helpMsg += `╚════════════════════════════════════╝\n\n`;
    const icons = {
      moderation: '🛠',
      utility: '⚙',
      general: '📁',
      config: '🔌',
      music: '🎵'
    };
    const sortedCategories = Object.keys(categories).sort();
    for (const category of sortedCategories) {
      const icon = icons[category] || '';
      const count = categories[category];
      const padding = ' '.repeat(15 - category.length - count.toString().length);
      helpMsg += `${icon}  ${category.toUpperCase()}${padding} [${count} commands]\n`;
    }
    helpMsg += `\n╔════════════════════════════════════╗\n`;
    helpMsg += `║          HOW TO USE             ║\n`;
    helpMsg += `╚════════════════════════════════════╝\n\n`;
    helpMsg += `• ${prefix}help              - Show this menu\n`;
    helpMsg += `• ${prefix}help moderation   - Show moderation commands\n`;
    helpMsg += `• ${prefix}help utility      - Show utility commands\n`;
    helpMsg += `• ${prefix}help general      - Show general commands\n`;
    helpMsg += `• ${prefix}help config       - Show config commands\n`;
    helpMsg += `• ${prefix}help music        - Show music commands\n`;
    helpMsg += `• ${prefix}help <command>    - Show specific command details\n`;
    message.channel.send(`\`\`\`asciidoc\n${helpMsg}\n\`\`\``);
  }
};