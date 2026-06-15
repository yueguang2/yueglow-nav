import fs from "node:fs";
import path from "node:path";

const bundledDataDir = path.join(process.cwd(), ".next", "standalone", "data");

fs.rmSync(bundledDataDir, { recursive: true, force: true });
