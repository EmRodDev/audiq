const { SlashCommandBuilder } = require("discord.js");

const { getString } = require("../helpers/dictionary");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(getString("commands.ping.description")),

  async execute(interaction, client) {
    const apiLatency = Math.round(client.ws.ping);
    await interaction.reply(getString("commands.ping.replies.pong", { latency: apiLatency }));
  }
};
