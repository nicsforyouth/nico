import { Client } from "discord.js";
import { Listener } from "../core/listener.js";

export default class ReadyListener extends Listener<"clientReady"> {
  public event: "clientReady" = "clientReady";
  public name: string = "clientReady";
  public once: boolean = false;

  public execute(client: Client<true>): Promise<void> | void {
    console.log(`Logged in as ${client.user.username}`);
  }
}
