import "dotenv/config";

import { REST, Routes } from "discord.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Nico } from "../core/client";
import { env } from "../config/env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDirectory = join(__dirname, "..");

const client = new Nico();

await client.pieces.loadType("commands", sourceDirectory);

const commands = [...client.pieces.get("commands").store.values()].map(
  (command) => command.data.toJSON(),
);

const rest = new REST().setToken(env.discordBotToken!);

console.log(`Deploying ${commands.length} command(s)...`);

// await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), {
//   body: commands,
// });
await rest.put(
  Routes.applicationGuildCommands(env.discordClientId!, env.discordGuildId!),
  {
    body: commands,
  },
);

console.log("Successfully deployed commands.");
