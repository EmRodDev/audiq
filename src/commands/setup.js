const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const { getString } = require("../helpers/dictionary");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(getString("commands.setup.description"))
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(getString("commands.setup.options.channel.description"))
        .setRequired(true)
    ),
  async execute(interaction, client) {

    if(!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      await interaction.reply(getString("commands.setup.errors.no_permission"));
      return;
    }

    const channel = await interaction.options.getChannel("channel");

    if(!fs.existsSync(path.join(__dirname, "..", "config", "data.json"))) {
      fs.writeFileSync(path.join(__dirname, "..", "config", "data.json"), JSON.stringify({ channelId: channel.id }, null, 2));
    }
    else{
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config", "data.json")));
      data.channelId = channel.id;
      fs.writeFileSync(path.join(__dirname, "..", "config", "data.json"), JSON.stringify(data, null, 2));
    }

    await interaction.reply(getString("commands.setup.success"));
  }
};
