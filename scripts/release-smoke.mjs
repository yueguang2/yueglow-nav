import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const serverPath = path.join(rootDir, ".next", "standalone", "server.js");
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "yueglow-nav-release-"));
const port = await getFreePort();
const baseUrl = `http://127.0.0.1:${port}`;
const adminLeakMarkers = ["内容控制台", "内容管理", "分类概览", "分类管理", "站点管理", "主题设置", "本地密码", "csrfToken"];

if (!fs.existsSync(serverPath)) {
  fail(`missing standalone server: ${path.relative(rootDir, serverPath)}. Run npm run build first.`);
}

const child = spawn(process.execPath, [serverPath], {
  cwd: path.dirname(serverPath),
  env: {
    ...process.env,
    NODE_ENV: "production",
    HOSTNAME: "127.0.0.1",
    PORT: String(port),
    DATA_DIR: dataDir,
    APP_COOKIE_SECURE: "false",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let logs = "";
const childExit = new Promise((resolve) => child.once("exit", resolve));
child.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

try {
  await waitForServer(`${baseUrl}/`);
  await expectOk("/");
  await expectOk("/admin/login");
  await expectOk("/api/sites/1/resolve");

  for (const pathname of ["/admin", "/admin/categories", "/admin/sites", "/admin/themes"]) {
    await expectAdminRedirectIsClean(pathname);
    await expectAdminRedirectIsClean(`${pathname}?_rsc=release-smoke`, { RSC: "1" });
  }
} finally {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await childExit;
  }

  fs.rmSync(dataDir, { recursive: true, force: true });
}

function fail(message) {
  console.error(`[release-smoke] ${message}`);
  process.exit(1);
}

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
        } else {
          reject(new Error("could not allocate a port"));
        }
      });
    });
    server.on("error", reject);
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      fail(`server exited early with code ${child.exitCode}\n${logs}`);
    }

    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  fail(`server did not become ready\n${logs}`);
}

async function expectOk(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) {
    fail(`${pathname} returned ${response.status}`);
  }
}

async function expectAdminRedirectIsClean(pathname, headers = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: "manual", headers });
  const body = await response.text();

  if (![302, 303, 307, 308].includes(response.status)) {
    fail(`${pathname} should redirect unauthenticated users, got ${response.status}`);
  }

  const leaked = adminLeakMarkers.find((marker) => body.includes(marker));
  if (leaked) {
    fail(`${pathname} leaked admin marker: ${leaked}`);
  }
}
