import {
  AutocompleteInteraction,
  type CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { Piece, type PieceManagerHandler, PieceStore } from "./piece.js";
import type { Nico } from "./client.js";

export abstract class Command extends Piece {
  public abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> | void;
  public autocomplete(
    interaction: AutocompleteInteraction<CacheType>,
  ): Promise<void> | void {
    return;
  }
}

export class CommandManager implements PieceManagerHandler<Command> {
  public readonly directory: string = "commands";
  public readonly store: PieceStore<Command> = new PieceStore<Command>();

  public constructor(private readonly client: Nico) {}

  public initialize(): Promise<void> | void {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isChatInputCommand()) {
        const command = this.store.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
      }
      if (interaction.isAutocomplete()) {
        const command = this.store.get(interaction.commandName);
        if (!command) return;

        await command.autocomplete(interaction);
      }
      return;
    });
    console.log(`Initialized ${this.store.size} commands.`);
  }
}
