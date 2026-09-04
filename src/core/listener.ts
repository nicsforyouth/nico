import type { ClientEvents } from "discord.js";
import { Piece, PieceManagerHandler, PieceStore } from "./piece";
import { Nico } from "./client";

export abstract class Listener<T extends keyof ClientEvents> extends Piece {
  public abstract readonly event: T;
  public abstract readonly once: boolean;

  public abstract execute(...args: ClientEvents[T]): Promise<void> | void;
}

export class ListenerManager implements PieceManagerHandler<
  Listener<keyof ClientEvents>
> {
  public readonly directory: string = "listeners";

  public readonly store = new PieceStore<Listener<keyof ClientEvents>>();

  public constructor(private readonly client: Nico) {}

  public initialize(): void {
    for (const listener of this.store.values()) {
      this.register(listener);
    }
  }

  public register(listener: Listener<keyof ClientEvents>): void {
    if (listener.once || listener.event === "ready") {
      this.client.once(listener.event, (...args) => listener.execute(...args));

      return;
    }
    this.client.on(listener.event, (...args) => listener.execute(...args));
  }
}
