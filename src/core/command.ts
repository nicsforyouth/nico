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
  public category: string | null = null;
  public abstract usage: string;

  public abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  public abstract execute(
    interaction: ChatInputCommandInteraction,
    client: Nico,
  ): Promise<void> | void;

  public autocomplete(
    interaction: AutocompleteInteraction<CacheType>,
    client: Nico,
  ): Promise<void> | void {
    return;
  }

  public override onLoad(file: string): void {
    const cat = file.split("/").at(-2) ?? null;
    this.category = cat !== "commands" ? cat : null;
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

        await command.execute(interaction, this.client);
      }
      if (interaction.isAutocomplete()) {
        const command = this.store.get(interaction.commandName);
        if (!command) return;

        await command.autocomplete(interaction, this.client);
      }
      return;
    });
    console.log(`Initialized ${this.store.size} commands.`);
  }
}
