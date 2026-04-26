const { SlashCommandBuilder } = require("discord.js");

const { getString } = require("../helpers/dictionary");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(getString("commands.help.description")),

  async execute(interaction, client) {
    const commandList = client.commands
      .map((command) => `/${command.data.name} - ${command.data.description}`)
      .join("\n");

    await interaction.reply({
      content: `${getString("commands.help.replies.available_commands")}\n${commandList}`,
      ephemeral: true
    });
  }
};
