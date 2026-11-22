// node crudo.mjs <carpeta con rotos.json> <salida>  (22-11-2026) texto CRUDO (pdftotext, UTF-8) de los libros rotos
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const [, , inDir, outDir] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const EXE = "C:/Program Files/Git/ucrt64/bin/pdftotext.exe";
const rotos = JSON.parse(fs.readFileSync(path.join(inDir, "rotos.json"), "utf8")).filter((x) => x.estado === "roto");
for (const b of rotos) {
  const out = execFileSync(EXE, ["-enc", "UTF-8", b.pdf, "-"], { maxBuffer: 1 << 29 });
  fs.writeFileSync(path.join(outDir, `${b.id}.txt`), out);
  console.log(b.id, (out.length / 1024).toFixed(0) + " KB");
}
