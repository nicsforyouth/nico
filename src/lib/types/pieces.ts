import type { ClientEvents } from "discord.js";
import type { Command } from "../../core/command.js";
import type { Listener } from "../../core/listener.js";

export const PIECE_TYPES = {
  listeners: "listeners",
  commands: "commands",
} as const;

export interface PieceTypeMap {
  listeners: Listener<keyof ClientEvents>;
  commands: Command;
}
