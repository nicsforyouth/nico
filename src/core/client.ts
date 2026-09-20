import { Client, Collection, GatewayIntentBits } from "discord.js";
import { join } from "path";
import { env } from "../config/env.js";
import { PieceManager } from "./piece.js";
import { CommandManager } from "./command.js";
import { ListenerManager } from "./listener.js";

export class Nico<Ready extends boolean = boolean> extends Client<Ready> {
  public readonly pieces: PieceManager;
  public commands = new Collection<string, unknown>();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.pieces = new PieceManager();

    const listeners = new ListenerManager(this);
    const commands = new CommandManager(this);

    this.pieces.register("listeners", listeners);
    this.pieces.register("commands", commands);
  }

  public async init(baseDirectory: string): Promise<void> {
    this.pieces.load(baseDirectory);
    await this.login(env.discordBotToken);
  }
}
