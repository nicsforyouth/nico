import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Piece, PieceManagerHandler, PieceStore } from "./piece";
import { Nico } from "./client";

export abstract class Command extends Piece {
  public abstract readonly data: SlashCommandBuilder;
  public abstract execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> | void;
}

export class CommandManager implements PieceManagerHandler<Command> {
  public readonly directory: string = "commands";
  public readonly store: PieceStore<Command> = new PieceStore<Command>();

  public constructor(private readonly client: Nico) {}

  public initialize(): Promise<void> | void {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.store.get(interaction.commandName);

      if (!command) return;

      await command.execute(interaction);
    });
    console.log(`Initialized ${this.store.size} commands.`);
  }
}
