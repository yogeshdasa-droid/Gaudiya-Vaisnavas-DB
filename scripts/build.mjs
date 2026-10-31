// npm run app:build — builds the installer, signs it for the updater and
// writes latest.json (what the installed programs read to update themselves).
// The private key stays on this computer: %USERPROFILE%\.tauri\gaudiya-vaisnavas-db.key
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const REPO = "yogeshdasa-droid/Gaudiya-Vaisnavas-DB";
const key = process.env.TAURI_SIGNING_PRIVATE_KEY || join(homedir(), ".tauri", "gaudiya-vaisnavas-db.key");
if (!process.env.TAURI_SIGNING_PRIVATE_KEY && !existsSync(key)) {
  console.error(`No está la clave para firmar las actualizaciones: ${key}`);
  process.exit(1);
}

const version = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8")).version;
execSync("npx tauri build", {
  stdio: "inherit",
  env: { ...process.env, TAURI_SIGNING_PRIVATE_KEY: key, TAURI_SIGNING_PRIVATE_KEY_PASSWORD: process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? "" },
});

const dir = "src-tauri/target/release/bundle/nsis";
const sig = readFileSync(join(dir, `Gaudiya Vaisnavas DB_${version}_x64-setup.exe.sig`), "utf8").trim();
// the release gets the installer with dashes (GitHub changes the spaces)
const latest = {
  version,
  notes: `Gaudiya Vaisnavas DB ${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature: sig,
      url: `https://github.com/${REPO}/releases/download/v${version}/Gaudiya-Vaisnavas-DB_${version}_x64-setup.exe`,
    },
  },
};
writeFileSync(join(dir, "latest.json"), JSON.stringify(latest, null, 2) + "\n");
console.log(`\nlatest.json → ${join(dir, "latest.json")} (subirlo a la release v${version} junto al instalador)`);
