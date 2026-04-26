const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");

async function deployCommands() {
  const { DISCORD_TOKEN, CLIENT_ID } = process.env;

  if (!DISCORD_TOKEN || !CLIENT_ID) {
    console.warn("Skipping command deployment: DISCORD_TOKEN or CLIENT_ID not set.");
    return;
  }

  try {
    const commands = [];
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST().setToken(DISCORD_TOKEN);

    console.log(`Deploying ${commands.length} application (/) commands...`);

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands
    });

    console.log(`Successfully deployed ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
}

module.exports = { deployCommands };
