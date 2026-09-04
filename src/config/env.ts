import "dotenv/config";

const envTable = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordGuildId: process.env.DISCORD_GUILD_ID,
} as const;

for (const item of Object.keys(envTable)) {
  if (envTable[item as keyof typeof envTable] === undefined) {
    throw new Error(`Couldn't find envionment variable ${item}`);
  }
}

export const env = envTable;
