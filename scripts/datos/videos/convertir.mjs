// Convierte los .wmv de «Por escucha» a .mp4 (h264_nvenc, calidad alta) AL LADO de cada WMV.
// No borra nada. Se puede parar (crear parar.txt junto a este script) y relanzar: salta los ya hechos.
// Uso: node convertir.mjs
import { spawnSync } from "node:child_process";
import { readdirSync, statSync, existsSync, appendFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = "O:\\Gaudiya Vaisnavas DB\\Biblioteca\\Srila Gurudeva Videos\\Por escucha";
const FF_DIR = "O:\\Whispers\\idioma-mp3\\ffmpeg\\ffmpeg-n8.1-latest-win64-gpl-shared-8.1\\bin";
const FF = join(FF_DIR, "ffmpeg.exe"), FP = join(FF_DIR, "ffprobe.exe");
const AQUI = dirname(fileURLToPath(import.meta.url));
const LOG = join(AQUI, "convertir.log"), PARAR = join(AQUI, "parar.txt"), ESTADO = join(AQUI, "estado.txt");
const log = (s) => appendFileSync(LOG, new Date().toLocaleString("es-ES") + " " + s + "\n");

function wmvs(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) wmvs(p, out);
    else if (e.name.toLowerCase().endsWith(".wmv")) out.push(p);
  }
  return out;
}
function dur(f) {
  const r = spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  return parseFloat(r.stdout);
}

const lista = wmvs(RAIZ);
let hechos = 0, saltados = 0, fallos = 0;
log(`empieza: ${lista.length} WMV`);
for (let i = 0; i < lista.length; i++) {
  if (existsSync(PARAR)) { log("parado (parar.txt)"); break; }
  const src = lista[i], dst = src.replace(/\.wmv$/i, ".mp4"), tmp = dst + ".tmp.mp4";
  if (existsSync(dst)) { saltados++; continue; }
  writeFileSync(ESTADO, `${new Date().toLocaleString("es-ES")}\n${i + 1} de ${lista.length} (hechos ${hechos}, saltados ${saltados}, fallos ${fallos})\nAhora: ${src}\n`);
  if (existsSync(tmp)) unlinkSync(tmp);
  const r = spawnSync(FF, ["-y", "-loglevel", "error", "-i", src, "-c:v", "h264_nvenc", "-preset", "p5", "-cq", "26",
    "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", tmp], { encoding: "utf8" });
  const d1 = dur(src), d2 = existsSync(tmp) ? dur(tmp) : NaN;
  if (r.status === 0 && d2 > 0 && (!(d1 > 0) || Math.abs(d1 - d2) < Math.max(2, d1 * 0.01))) {
    renameSync(tmp, dst); hechos++;
    log(`ok ${src} (${Math.round(d1)}s)`);
  } else {
    fallos++; if (existsSync(tmp)) unlinkSync(tmp);
    log(`FALLO ${src} dur ${d1} -> ${d2} ${(r.stderr || "").slice(0, 200)}`);
  }
}
log(`fin: hechos ${hechos}, saltados ${saltados}, fallos ${fallos}`);
writeFileSync(ESTADO, `${new Date().toLocaleString("es-ES")}\nTerminado o parado: hechos ${hechos}, saltados ${saltados}, fallos ${fallos}\n`);
