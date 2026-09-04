import { Client, Collection, GatewayIntentBits } from "discord.js";
import { join } from "path";
import { env } from "../config/env";
import { PieceManager } from "./piece";
import { CommandManager } from "./command";
import { ListenerManager } from "./listener";

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

  public async init(): Promise<void> {
    this.pieces.load(join(import.meta.dirname, ".."));
    await this.login(env.discordBotToken);
  }
}
