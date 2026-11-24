import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { execSync } from "node:child_process";

const scrypt = promisify(scryptCallback);
if (!process.stdin.isTTY) {
  process.stderr.write("Run this helper from a private interactive terminal.\n");
  process.exit(1);
}
process.stderr.write("Admin password: ");
try { execSync("stty -echo", { stdio: "inherit" }); } catch {
  process.stderr.write("Unable to disable terminal echo.\n");
  process.exit(1);
}
let password = "";
for await (const chunk of process.stdin) password += chunk.toString();
try { execSync("stty echo", { stdio: "inherit" }); } catch { /* terminal restoration is best-effort */ }
process.stderr.write("\n");
if (password.trim().length < 12) {
  process.stderr.write("Use a password of at least 12 characters.\n");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = await scrypt(password.trim(), salt, 64);
process.stdout.write(`scrypt$${salt.toString("base64url")}$${Buffer.from(hash).toString("base64url")}\n`);
password = "";
