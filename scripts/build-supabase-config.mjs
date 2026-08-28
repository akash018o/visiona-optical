import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const target = join(root, "public", "config", "supabase.js");

async function localEnvironment() {
  try {
    const raw = await readFile(join(root, ".env"), "utf8");
    return Object.fromEntries(raw.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#") && line.includes("=")).map(line => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
    }));
  } catch { return {}; }
}

const local = await localEnvironment();
const config = {
  url: process.env.SUPABASE_URL || local.SUPABASE_URL || "",
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || local.SUPABASE_PUBLISHABLE_KEY || ""
};

await mkdir(dirname(target), { recursive: true });
await writeFile(target, `// Generated at build time. This file contains only Supabase's browser-safe connection settings.\nexport const SUPABASE_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`, "utf8");
