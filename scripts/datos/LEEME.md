# Scripts para cambiar los datos de Whisper (por grupos)

Ver DESARROLLO.md §7 «Método por grupos». Nunca sobre la BD real sin copia previa.

- Leer (solo lectura, sobre una COPIA; `BIO_COPY=<copia>\biodata.db`, Node 24):
  `node q.mjs <copia> "SQL"`, `node find.mjs "nombre" …`, `node notes.mjs <ids>`, `node full.mjs <ids>`.
- Ensayar: app de pruebas (`BIO_DB=<copia>` + `npm run app:dev`, puerto 9333) → `node cdp.mjs - @sri.js`.
- Aplicar: app instalada de Whisper en modo especial (puerto 9334) → `node cdp2.mjs - @sri.js`.
- Ejemplos de rondas: `adv.js` (Advaita), `nit.js` (Nityānanda), `sri.js` (Śrīnivāsa–Narottama–
  Śyāmānanda), `split.js` (separar fichas que mezclan personas). Todas comprueban el nombre de cada
  ficha antes de tocarla y no cambian nada si se ejecutan dos veces.
- `mapa-make.js`: genera `src/components/mapData.ts` a partir de Natural Earth 10m.

## Tīrthas (lugares), desde el 04-11-2026
- `lugares-N.json` + `node lugares.mjs <json> [puerto]`: guarda lugares por nombre (2 pasadas = nada nuevo).
  Personas como `[id, rol]` o `["nombre exacto", rol]`; roles: sripata, samadhi, birth, lived, other.
- Abhidhāna (Desktop\BIOGRAPHYS): `heads2.mjs <out> términos…` (cabeceras), `look.mjs`, `ctx.mjs <out> antes después líneas…`,
  `grepnear.mjs <out> desde hasta antes después términos…`.
- `backup.mjs "<motivo>"`: copia comprobada de la BD real (VACUUM INTO) en Documentos › … › Copias de seguridad.
- `unmapped.mjs <copia.db> <out>`: fichas cuyo «Lugar» no sale en el mapa.
- `cdpfull.mjs <out> @script.js` (puerto 9333) y `reload9334.mjs` (recargar la app de Whisper).
- Cambios de datos del 04-11: `jayadeva-ravi.mjs`, `ramadasa.mjs`, `kasi-misra.mjs`, `prataparudra.mjs`.
