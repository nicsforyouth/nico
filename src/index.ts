import { Nico } from "./core/client.js";
import { initExpress } from "./express.js";

const client = new Nico();

initExpress();

await client.init(import.meta.dirname);
