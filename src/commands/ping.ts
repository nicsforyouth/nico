import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../core/command.js";
import { uptime } from "node:process";

export default class PingCommand extends Command {
  public name: string = "ping";
  public data: SlashCommandBuilder = new SlashCommandBuilder().setDescription(
    "Check whether the bot is alive",
  );

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const replied = Date.now();

    await interaction.reply("🏓 Measuring latency...");

    const botLatency = Date.now() - replied;
    const apiLatency = interaction.client.ws.ping;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏓 Pong!")
          .setColor("#0da79d")
          .setThumbnail(interaction.client.user.avatarURL())
          .setFields([
            {
              name: "Bot Latency",
              value: botLatency + "ms",
              inline: true,
            },
            {
              name: "API Latency",
              value: apiLatency + "ms",
              inline: true,
            },
          ])
          .setFooter({
            text: `Up for ${formatUptime(uptime())}`,
          }),
      ],
    });
  }
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);

  return `${days}d ${hours}h ${minutes}m`;
}
