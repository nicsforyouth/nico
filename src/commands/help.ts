import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  type CacheType,
} from "discord.js";
import { Command } from "../core/command.js";
import type { Nico } from "../core/client.js";

export default class HelpCommand extends Command {
  public override name = "help";
  public override usage = "/help";
  public override data = new SlashCommandBuilder()
    .setDescription("Help menu for Nico")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Get further information about a specific command.")
        .setAutocomplete(true)
        .setRequired(false),
    );

  public override async execute(
    interaction: ChatInputCommandInteraction,
    client: Nico,
  ): Promise<void> {
    await interaction.deferReply();

    const targetCommand = interaction.options.getString("command");

    if (targetCommand) {
      const command = client.pieces.get("commands").store.get(targetCommand);

      if (!command) {
        await interaction.editReply("Command not found.");
        return;
      }

      /* TODO:
      *
      const options = [...command.data.options.values()].map((option) => {
        console.log(option);
        return option.toJSON();
      });

      let optionsText = "";

      options.forEach((option) => {
        optionsText += `**${option.name}\n**`;
        optionsText += `${option.description}`;
        if ("choices" in options) {
          optionsText += options.choices;
        }
      });

      */
      const embed = new EmbedBuilder().setDescription(
        `### ${command.name}\n${command.data.description}\n**Category:** ${command.category}\n**Usage:** ${command.usage}`,
      );

      await interaction.editReply({ embeds: [embed] });

      return;
    }

    const commands = [...client.pieces.get("commands").store];

    const categorizedCommands: Record<string, Command[]> = {
      miscellaneous: [],
    };

    commands.forEach((command) => {
      if (!command.category) {
        categorizedCommands.miscellaneous?.push(command);
        return;
      }
      if (!categorizedCommands[command.category]) {
        categorizedCommands[command.category] = [];
      }
      categorizedCommands[command.category]?.push(command);
    });

    let description = "";

    Object.keys(categorizedCommands).forEach((category) => {
      if (categorizedCommands[category]?.length === 0) return;

      description += `### ${category[0]?.toUpperCase() + category.replaceAll("-", " ").slice(1, Infinity)}\n`;

      categorizedCommands[category]?.forEach((command) => {
        description += `\`${command.name}\`, `;
      });

      description = description.slice(0, -2) + "\n";
    });

    const embed = new EmbedBuilder().setDescription(description);

    await interaction.editReply({ embeds: [embed] });
  }

  public override async autocomplete(
    interaction: AutocompleteInteraction<CacheType>,
    client: Nico,
  ): Promise<void> {
    const focused = interaction.options.getFocused();

    const commands = [...client.pieces.get("commands").store.values()]
      .filter(
        (c) => c.name.includes(focused) || c.data.description.includes(focused),
      )
      .map(({ name }) => ({ name, value: name }));

    await interaction.respond(commands);
  }
}
