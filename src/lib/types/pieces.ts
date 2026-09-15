import type { ClientEvents } from "discord.js";
import type { Command } from "../../core/command";
import type { Listener } from "../../core/listener";

export const PIECE_TYPES = {
  listeners: "listeners",
  commands: "commands",
} as const;

export interface PieceTypeMap {
  listeners: Listener<keyof ClientEvents>;
  commands: Command;
}
