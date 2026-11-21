// node pdfpeek.mjs <pdf> <from> <to>  — the plain text of some pages of a PDF (pdf.js), to see how its verses come out
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(new URL("../anthology/extraer/package.json", import.meta.url));
const { pathToFileURL } = await import("node:url");
const { getDocument } = await import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);
const [file, from = "1", to = "3"] = process.argv.slice(2);
const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise;
console.log("páginas:", doc.numPages);
for (let n = +from; n <= Math.min(+to, doc.numPages); n++) {
  const page = await doc.getPage(n);
  const tc = await page.getTextContent();
  let out = "", lastY = null;
  for (const it of tc.items) {
    const y = Math.round(it.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 2) out += "\n";
    out += it.str;
    lastY = y;
  }
  console.log(`--- página ${n} ---\n${out.slice(0, 1800)}`);
}
