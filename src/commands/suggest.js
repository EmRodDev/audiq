const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const { createCard } = require("../helpers/songInfoHandler");
const { getString } = require("../helpers/dictionary");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription(getString("commands.suggest.description"))
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription(getString("commands.suggest.options.link.description"))
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("vote")
        .setDescription(getString("commands.suggest.options.vote.description"))
        .setRequired(false)
    ),
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const configPath = path.join(__dirname, "..", "config", "data.json");

      if (!fs.existsSync(configPath)) {
        await interaction.followUp(getString("commands.suggest.errors.config_not_found"));
        return;
      }

      const data = JSON.parse(fs.readFileSync(configPath, "utf8"));

      if (!data.channelId) {
        await interaction.followUp(getString("commands.suggest.errors.channel_id_not_found"));
        return;
      }

      const link = interaction.options.getString("link");

      try { const url = new URL(link) } catch (error) {
        await interaction.followUp(getString("commands.suggest.errors.invalid_url"));
        return;
      }

      const card = await createCard(link, interaction.member.displayAvatarURL(), interaction.member.displayName);

      if (typeof card === "string") {
        await interaction.followUp({
          content: getString("commands.suggest.errors.processing_error", { error: card })
        });
        return;
      }

      const channel = await client.channels.fetch(data.channelId);

      const button = new ButtonBuilder()
        .setLabel(`🎧${getString("commands.suggest.listen")}`)
        .setStyle(ButtonStyle.Link)
        .setURL(link);

      const row = new ActionRowBuilder().addComponents(button);

      const msg = await channel.send({
        files: [
          {
            attachment: card,
            name: 'image.png'
          }
        ],
        components: [row]
      });

      const vote = interaction.options.getBoolean("vote") ?? true;

      if(vote) {
        await msg.react("💎");
      }

      await interaction.followUp({
        content: getString("commands.suggest.success")
      });

    } catch (error) {
      console.error("Error in suggest command:", error);
      await interaction.followUp({
        content: getString("commands.suggest.errors.generic_error")
      });
    }
  }
};
