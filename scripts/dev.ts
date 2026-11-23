import { type ChildProcess, spawn } from "node:child_process";

const isWindows = process.platform === "win32";

const api: ChildProcess = spawn("bun", ["--watch", "apps/api/src/index.ts"], {
  stdio: "inherit",
  shell: isWindows,
});

const web: ChildProcess = spawn("bun", ["run", "--cwd", "apps/web", "dev"], {
  stdio: "inherit",
  shell: isWindows,
});

function handleExit() {
  if (api.pid) api.kill();
  if (web.pid) web.kill();
  process.exit(0);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
process.on("exit", handleExit);
