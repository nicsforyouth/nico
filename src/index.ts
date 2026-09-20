import { Nico } from "./core/client.js";

const client = new Nico();
await client.init(import.meta.dirname);
