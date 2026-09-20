import type { PieceTypeMap } from "../lib/types/pieces.js";
import { readdir } from "fs/promises";
import { join } from "path";
import { pathToFileURL } from "url";

export abstract class Piece {
  public abstract name: string;
}

export interface PieceManagerHandler<T extends Piece> {
  readonly store: PieceStore<T>;
  readonly directory: string;
  initialize(): Promise<void> | void;
}

export class PieceManager {
  public readonly loader = new PieceLoader();
  // public readonly registry = new PieceRegistry();
  // public readonly listeners = this.registry.registerType("listeners");
  // public readonly commands = this.registry.registerType("commands");
  // public readonly listenerManager: ListenerManager;

  // public constructor(client: Client) {
  //   this.listenerManager = new ListenerManager(client);
  // }

  public async loadType<K extends keyof PieceTypeMap>(
    type: K,
    baseDirectory: string,
  ): Promise<void> {
    const handler = this.get(type);

    await this.loader.load(
      join(baseDirectory, handler.directory),
      handler.store,
    );
  }

  public async initializeType<K extends keyof PieceTypeMap>(
    type: K,
  ): Promise<void> {
    const handler = this.get(type);

    await handler.initialize();
  }

  public async load(baseDirectory: string): Promise<void> {
    for (const type of this.handlers.keys()) {
      await this.loadType(type, baseDirectory);

      // await this.loader.load(
      //   join(baseDirectory, handler.directory),
      //   handler.store,
      // );
    }

    for (const type of this.handlers.keys()) {
      await this.initializeType(type);
    }
  }

  private readonly handlers = new Map<
    keyof PieceTypeMap,
    PieceManagerHandler<any>
  >();

  public register<K extends keyof PieceTypeMap>(
    type: K,
    handler: PieceManagerHandler<PieceTypeMap[K]>,
  ): void {
    if (this.handlers.has(type)) {
      throw new Error(`A handler for "${String(type)}" is already registered.`);
    }

    this.handlers.set(type, handler as PieceManagerHandler<Piece>);
  }

  public get<K extends keyof PieceTypeMap>(
    type: K,
  ): PieceManagerHandler<PieceTypeMap[K]> {
    const handler = this.handlers.get(type);

    if (!handler) {
      throw new Error(`No handler registered for "${String(type)}"`);
    }

    return handler as PieceManagerHandler<PieceTypeMap[K]>;
  }
}

export class PieceStore<T extends Piece> {
  private readonly pieces = new Map<string, T>();

  public register(piece: T) {
    if (this.pieces.has(piece.name)) {
      throw new Error(`A piece named "${piece.name}" is already registered.`);
    }

    this.pieces.set(piece.name, piece);
  }

  public get(name: string): T | undefined {
    return this.pieces.get(name) as T | undefined;
  }

  public remove(name: string) {
    this.pieces.delete(name);
  }

  public values() {
    return this.pieces.values();
  }
  public get size() {
    return this.pieces.size;
  }
}

export class PieceRegistry {
  private readonly stores = new Map<keyof PieceTypeMap, PieceStore<Piece>>();

  public registerType<T extends keyof PieceTypeMap>(
    name: T,
  ): PieceStore<PieceTypeMap[T]> {
    if (this.stores.has(name)) {
      throw new Error(`A piece type named "${name}" is already registered.`);
    }

    const store = new PieceStore<PieceTypeMap[T]>();

    this.stores.set(name, store as unknown as PieceStore<Piece>);

    return store;
  }

  public getType<T extends keyof PieceTypeMap>(
    name: T,
  ): PieceStore<PieceTypeMap[T]> | undefined {
    const store = this.stores.get(name);
    if (!store) {
      throw new Error(`Piece type "${String(name)}" has not been registered.`);
    }

    return store as unknown as PieceStore<PieceTypeMap[T]>;
  }
}

type PieceConstructor<T extends Piece> = new () => T;

export interface PieceLoadResult<T extends Piece> {
  piece: T;
  file: string;
  duration: number;
}

export class PieceLoader {
  public async load<T extends Piece>(
    directory: string,
    store: PieceStore<T>,
  ): Promise<void> {
    const start = performance.now();

    const files = await this.getFiles(directory);
    const loaded: PieceLoadResult<T>[] = [];

    for (const file of files) {
      const mod = await import(pathToFileURL(file).href);

      const PieceClass = mod.default as PieceConstructor<T> | undefined;

      if (!PieceClass) {
        throw new Error(`Piece file "${file}" does not have a default export.`);
      }

      if (!(PieceClass.prototype instanceof Piece)) {
        throw new Error(`Default export from "${file}" is not a Piece.`);
      }

      const piece = new PieceClass();

      try {
        store.register(piece);
      } catch (error) {
        throw new Error(
          `Failed to register piece "${piece.name}" from "${file}".\nCause: ${error}`,
        );
      }

      loaded.push({ piece, file, duration: performance.now() - start });

      console.log(`Loaded piece: ${piece.name}`);
    }
  }

  private async getFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, {
      withFileTypes: true,
    });

    const files: string[] = [];

    for (const entry of entries) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.getFiles(path)));
        continue;
      }

      if (!entry.name.endsWith(".js") && !entry.name.endsWith(".ts")) continue;
      if (entry.name.endsWith(".d.ts")) continue;

      files.push(path);
    }
    return files;
  }
}
