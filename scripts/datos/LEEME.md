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
