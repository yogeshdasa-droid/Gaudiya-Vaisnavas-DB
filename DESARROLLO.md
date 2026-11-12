# Gaudiya Vaisnavas DB — guía para continuar el proyecto

Documento para retomar el trabajo en el futuro (una persona o una sesión nueva de Claude).
Resume qué es la app, cómo está hecha, qué reglas no hay que romper y qué queda pendiente.
Última actualización: **12-11-2026** (versión **0.14.3**).

> **Para retomar con Claude**, basta con abrir esta carpeta y decir algo como:
> «Lee `DESARROLLO.md` y continuamos con Gaudiya Vaisnavas DB: quiero cambiar…».

---

## 1. Qué es

Aplicación de escritorio para **Windows** con **biografías vaiṣṇavas**: una ficha por cada santo
o devoto, con todos los textos sobre esa persona y búsqueda instantánea.

- Hecha con **Tauri 2** (ventana WebView2), **Rust** (SQLite + búsqueda FTS5) y **React + TypeScript**.
- Repositorio: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB (público). Rama `main`.
- Hermana de **GaudiyaDB** (`G:\Whispers\W-DataBase`), de la que se copió la base del código,
  pero es un **proyecto independiente**: no se toca nada de esa carpeta desde aquí, y las dos
  apps pueden estar abiertas a la vez.

### La idea clave: la base de datos ES la biblioteca

Al importar, el texto, las portadas y los PDF / Word originales se copian **dentro** de la base
de datos. Después las carpetas de origen no se vuelven a leer ni se modifican: todo se edita en
la app. Un solo archivo lo contiene todo (y la copia de seguridad es ese archivo).

- Base de datos: `%APPDATA%\com.whispers.biodata\biodata.db` (≈ 240 MB).
- **Copias de seguridad**: automáticas (por defecto cada semana, se guardan las 3 últimas) en
  **`Documentos\Gaudiya Vaisnavas DB\Copias de seguridad\`** («Gaudiya Vaisnavas DB automática
  AAAA-MM-DD.db»), **fuera** de la carpeta de la app: desinstalar con «borrar los datos» no se las lleva
  (la 0.3.0 las ponía en `%APPDATA%\…\copias`, que también se lista). Ajustes › Copias de seguridad:
  hacer una ahora, cambiar la frecuencia, ver la lista, **restaurar** (antes de restaurar se guarda sola
  «… antes de restaurar …») y borrar. Las copias hechas antes de cambios grandes
  («biodata antes de …db», junto a la base de datos) también salen en esa lista.
- La base de datos **no** está en GitHub (es del usuario y es grande).

### Llevar la app a otro PC

El instalador trae **solo el programa, no los datos**. Los datos están en el archivo
`biodata.db`. Para tenerlo todo en otro PC:

1. En este PC: Ajustes › Copias de seguridad › **Guardar una copia en otro sitio…** (un pendrive, por ejemplo).
2. En el otro PC: instalar Gaudiya Vaisnavas DB, abrirlo y en Ajustes › Copias de seguridad › **Restaurar desde un
   archivo…** elegir esa copia.

Si no se restaura nada, la primera vez intenta importar las carpetas de `DEFAULT_SOURCES`
(`G:\Whispers\Data Bases\...`); si no existen, empieza vacía.

---

## 2. Reglas que no hay que romper

1. **Nunca borrar datos del usuario.** Tablas de datos: `persons`, `docs`, `sections`, `files`,
   `bookmarks`, `meta`, `person_photos`, `person_tree` y (formato 4) `history`, `person_tags`,
   `person_images`, `person_distinct`, `calendar_events`, (formato 6) `person_links`, (formato 7) `places`,
   `place_persons`, (formato 8) `place_photos`. Si cambia su estructura → subir `DATA_VERSION` en
   `src-tauri/src/db.rs` y escribir una migración que conserve todo. Un programa viejo se niega
   a abrir una base de datos de formato más nuevo (para no estropearla).
2. Tablas **derivadas** (se pueden reconstruir): `sections_fts`, `docs_fts`, `persons_fts`.
   Si cambian las reglas de búsqueda / plegado → subir `FTS_VERSION` (se reconstruyen solas al abrir).
3. `src-tauri/src/fold.rs` y `src/fold.ts` hacen **lo mismo** (quitar diacríticos y variantes:
   `krishna` = `krsna` = `kṛṣṇa`). Si se cambia uno, cambiar el otro igual.
4. Antes de un cambio masivo sobre los textos guardados, **hacer copia** de la base de datos
   (`VACUUM INTO`, como en `main.rs`) y dejarlo apuntado en `meta` para que se haga una sola vez.
5. Papelera = `docs.deleted` (no borra). «Borrar para siempre» solo desde Ajustes › Papelera.

---

## 3. Cómo trabajar

Requisitos: Node.js y Rust (en este equipo ya están). En PowerShell, si no encuentra las
herramientas, recargar el PATH:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
npm install            # solo la primera vez en un equipo nuevo
npm run app:dev        # abrir la app en modo pruebas (puerto 1421)
npx tsc --noEmit       # comprobar errores de TypeScript
cd src-tauri; cargo test   # pruebas automáticas de Rust (31)
npm run app:build      # generar el instalador
```

- El equipo es lento (Kaspersky): la primera compilación completa tarda ~6–10 min;
  después, tras cambiar solo nuestro código, entre segundos y 2 min.
- `npm run app:dev` usa **la misma base de datos real** que la app instalada: no tener las
  dos abiertas a la vez si se van a hacer cambios.
- Importación real a una base de datos de prueba (no toca la buena):
  `$env:BIO_DB = "C:\ruta\test.db"; cargo test real_import -- --ignored --nocapture`
- **Probar la app con una copia** (no toca la buena; imprescindible si se cambia `DATA_VERSION`,
  porque la versión instalada ya no abriría la base de datos): copiar `biodata.db` (+ `-wal`/`-shm`)
  a una carpeta y arrancar con `$env:BIO_DB = "C:\carpeta\biodata.db"; npm run app:dev`
  (`BIO_DB` solo funciona en modo pruebas). Las copias automáticas van entonces a `C:\carpeta\copias`.
- No lanzar `cargo test` mientras `app:dev` está compilando: a veces el enlazador falla
  («unresolved external symbol»); se arregla con `cargo clean -p gaudiya-vaisnavas-db` y volver a compilar.

### Probar la interfaz desde Claude (capturas y clics)

Arrancar la app con la depuración de WebView2 activada y manejarla por CDP con un script de Node
(`Runtime.evaluate` para pulsar / leer, `Page.captureScreenshot` para ver la pantalla):

```powershell
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=9333'
npm run app:dev
# luego: http://127.0.0.1:9333/json → webSocketDebuggerUrl de la página localhost:1421
```

Desde la página se puede llamar al backend con `window.__TAURI_INTERNALS__.invoke("comando", {...})`.
Para probar cosas que modifican datos, crear fichas de prueba (p. ej. «Zzprueba…») y borrarlas al final.

### Publicar una versión nueva

1. Subir el número de versión en `package.json`, `src-tauri/Cargo.toml` y `src-tauri/tauri.conf.json`.
2. `npm run app:build` (`scripts/build.mjs`) → en `src-tauri/target/release/bundle/nsis/`:
   `Gaudiya Vaisnavas DB_X.Y.Z_x64-setup.exe`, su firma `.sig` y **`latest.json`** (y el programa suelto
   en `src-tauri/target/release/gaudiya-vaisnavas-db.exe`).
   Firma con la clave privada **`%USERPROFILE%\.tauri\gaudiya-vaisnavas-db.key`** (sin contraseña;
   la pública está en `tauri.conf.json` › `plugins.updater.pubkey`). **Esa clave no está en GitHub:
   si se pierde, las apps instaladas ya no aceptarán actualizaciones** (habría que instalar a mano una
   versión con clave nueva). Guardar una copia en lugar seguro.
3. Commit + push, y luego la release en GitHub (instalador **con guiones**, como dice `latest.json`):
   `gh release create vX.Y.Z <Gaudiya-Vaisnavas-DB_X.Y.Z_x64-setup.exe> <exe renombrado> <latest.json> --target main --title "Gaudiya Vaisnavas DB X.Y.Z" --notes-file notas.md`
   Las apps buscan `releases/latest/download/latest.json`.

---

## 4. Estructura del código

```
src-tauri/src/                       (Rust: datos y lógica)
  main.rs     comandos que llama la interfaz; protocolo bio:// (portadas, PDF, fotos, imágenes);
              importación inicial (DEFAULT_SOURCES); trabajos en segundo plano; copia automática
              (20 s después de arrancar); limpiezas únicas al arrancar (notas, títulos, claves)
  db.rs       esquema de tablas, DATA_VERSION / FTS_VERSION
  replace.rs  buscar y reemplazar en toda la biblioteca (texto / regex / lista de palabras,
              respetando mayúsculas) y sugerencias de diacríticos (diccionario + lo aprendido
              de los textos que ya tienen IAST); store::replace_all escribe guardando versiones
  sanskrit.rs diccionario IAST de palabras gauḍīya (WORDS) y palabras inglesas que no se tocan (PLAIN)
  semantic.rs búsqueda por significado: trozos de ~1–1,6 KB → vectores de EmbeddingGemma por Ollama
              (http://127.0.0.1:11434, ureq), en su propio archivo «biodata-significado.db»
              junto a la base de datos (derivado: no va en las copias; se rehace solo)
  backup.rs   copias de seguridad: automáticas (meta backup_days/keep/last), lista, restaurar
  calendar.rs calendario vaiṣṇava: tithi y mes calculados (Sol y Luna al amanecer en Māyāpur,
              Meeus), lectura de fechas de las fichas («Bhadra Sukla Dvadasi», «8 October 1898»),
              calendario importado (.ics) con nombres → fichas, «hoy y próximos días», años para
              la línea de tiempo
  export.rs   exportar todo a Markdown (Fichas/ + Textos/, enlaces de Obsidian) y una ficha con sus textos
  store.rs    escritura: textos, secciones, fichas (person_key, unir, etiquetas), papelera, fotos
              y galería, versiones anteriores (history), clean_callouts, tidy_doc_titles,
              «Revisar» (textos vacíos, títulos dudosos), fichas distintas, rebuild_fts
  import.rs   importador: Calibre (opf + portada + pdf), notas de Obsidian en carpetas A–Z
              (= una ficha cada una), duplicados por huella, «Rupa - v.1» → ficha «Rupa…»
  extract.rs  md / txt / pdf / docx / html y .doc antiguos (texto legible del binario;
              Word por COM se cuelga con estos archivos); fuente Balaram → IAST
  search.rs   búsqueda: palabras (Y), "frase exacta" (también “ ” « »), pal*, -excluir, OR;
              fichas, enlaces [[...]], marcadores
  text.rs     decodificación, división en secciones (>24 KB se corta cada ~6–16 KB),
              fragmentos de resultados, strip_callouts
  fold.rs     plegado de letras (ver regla 3)

src/                                 (React: la interfaz)
  App.tsx           estado general, barra superior, atrás/adelante, menú contextual, diálogos
  api.ts            tipos y llamadas al backend; fileUrl() para bio://
  i18n.ts           todos los textos en español e inglés
  markdown.ts       renderMarkdown (estilos Literata/Inter) y renderSource (estilo «Editor»)
  personLinks.ts    nombres de fichas dentro de los textos → enlaces
  fold.ts           plegado (igual que fold.rs) para resaltar en el lector
  styles.css        todos los estilos (tema claro/oscuro con variables en :root)
  components/
    Sidebar.tsx     pestañas Personas / Biblioteca / Marcadores / Historial
    PersonView.tsx  la ficha: imagen, datos, textos (uno → se muestra dentro), parecidas
    Reader.tsx      lector de un texto (por secciones) y visor del PDF original; SectionView
    Dialogs.tsx     editar texto, ficha, unir fichas, importar, mandar a la papelera
    Settings.tsx    Ajustes: General (+ calendario, exportar), Copias de seguridad, Revisar,
                    Carpetas de origen, Papelera, Ayuda (+ buscar actualizaciones)
    Calendar.tsx    calendario de Inicio (hoy y próximos 30 días)
    Tools.tsx       pestañas Reemplazar (y Diacríticos sánscritos) y Significado
    Review.tsx      pestaña Revisar y ayudante de fichas repetidas (dupKey estricto)
    Timeline.tsx, TreeView.tsx   línea de tiempo y árbol dibujado de la Paramparā
    Home.tsx, Results.tsx, ContextMenu.tsx, ui.tsx
  update.ts         ¿hay versión nueva en GitHub? (una vez al día; aviso en la barra de estado)
```

Direcciones internas de archivos (las sirve `serve_file` en `main.rs`):
`http://bio.localhost/cover/<docId>`, `/original/<docId>`, `/photo/<personId>`, `/image/<imageId>`.

---

## 5. Qué hace hoy (v0.14.3)

### Novedades de la 0.14.3 (12-11-2026) — el árbol «De arriba abajo» ya no deja la ventana en blanco (formato 10 sin cambios)
- **Avisado por Whisper** («Ver en el árbol» → ventana en blanco, sin poder pinchar ni volver): con el árbol dibujado
  «De arriba abajo», dagre fallaba («Cannot read properties of undefined (reading 'dummy')») con 7 recuadros de grupo
  cuyas líneas cruzan entre ellos (Pañca-tattva, ramas de Advaita / Gadādhara / Nityānanda, discípulos de Mādhavendra
  Purī, seis Gosvāmīs, tres ācāryas), y el error tiraba toda la interfaz. `treeLayoutTB.ts`: si falla, se dibuja sin
  el recuadro de grupo más pequeño que lo resuelva (y, si ninguno basta, sin recuadros).
- `ViewGuard` (ui.tsx), alrededor de las vistas dibujadas en App.tsx (Línea de tiempo, Linaje, Panorama, Calendario,
  Paramparā Tree): si una falla, sale un aviso con «Volver al inicio» en vez de la ventana en blanco (`viewFailed*`).
- «Comprobar los datos»: entre homónimos con el mismo nombre («Ananta», «Rāmadāsa»…) toma el que el árbol une a esa
  ficha (`PersonIndex::same_name`, check.rs; test `namesakes_told_by_the_tree`); `without_kind` solo quita el
  paréntesis si todas sus palabras son de relación o años («Kṛṣṇadāsa Vāṇī (Vāṇī Kṛṣṇadāsa)» ya no se lee como
  «vāṇī» y no se escribe dos veces al completar). En la BD de Whisper: 781 → 434 cosas en la lista.

### Novedades de la 0.14.2 (11-11-2026) — el Paramparā Tree ya no se abre en blanco (formato 10 sin cambios)
- **Avisado por Whisper** («se queda en blank»): con un solo primer nivel (Lord Kṛṣṇa) el árbol dibujado de izquierda
  a derecha mide ~44.000 px de alto y Lord Kṛṣṇa queda a la mitad; la vista se abría en la esquina de arriba, vacía.
  Ahora (`TreeView.tsx`, efecto `startDone`) al abrir sin ficha que enseñar, o al cambiar Todo/Dīkṣā/Śikṣā o la
  dirección, la vista se coloca en el primer nivel (izquierda-derecha: a su altura; arriba-abajo: centrado en ancho).
- «Comprobar los datos» y «completar al revés» entienden los homónimos con paréntesis: `PersonIndex::find_whole`
  (calendar.rs: el nombre entero, «Govinda (disciple of Śyāmānanda)», si solo una ficha lo tiene) se mira antes del
  nombre corto en `check.rs`; `store.rs`: `without_kind()` quita «(śikṣā)» etc. del final, `names_record` mira primero
  el nombre entero, e `in_list` no parte por las comas que van dentro de un paréntesis. Test
  `check::tests::namesakes_in_brackets`.

### Novedades de la 0.14.1 (11-11-2026) — «Ver en linaje» con el clic derecho (formato 10 sin cambios)
- **Pedido por Whisper**: en el **Paramparā Tree dibujado** (y en el lateral y en Linaje) clic derecho en un nombre →
  **«Ver en linaje»**, que abre Linaje con esa persona en el centro (menú `person` de `App.tsx`; las cajas del árbol
  dibujado — también las filas de las cajas-lista — y las de Linaje llevan ahora `data-ctx="person"`, así que el
  árbol dibujado tiene por fin el menú de la persona). El botón de la ficha se llama **«Ver en linaje»** (antes «Ver
  linaje»), al lado de «Ver en el árbol».
- Datos de la sesión (sin cambio de programa): **todas las fichas fuera del árbol tienen ya Texto principal** (tandas
  31–47; las cortas de 15 en 15 con `gen-main.mjs`), salvo Koṭi Bābā #2168 y la Deidad #1305. Uniones 1369 → 1725
  Viśvarūpa, 814 → 281, 2022 → 2150, 703 → 893; fichas nuevas #2173–#2176 (entre ellas #2174 Siddha Caitanya dāsa
  Bābājī); 591 Janārdana Vipra movido bajo 758 Kṛṣṇadāsa Guñjamālī; borradas #955 y #487 (no eran personas).
  `tanda-arbol.mjs` hace también «move», «links» y líneas discutidas; `borrar-ficha.mjs <id> <nombre>`.

### Novedades de la 0.14.0 (11-11-2026) — «Linaje» y «Deidades» (sin cambio de formato: sigue el 10)
- **Pedido por Whisper** (2 ideas):
  1. **Vista «Linaje»** (`components/Lineage.tsx`), en el rail entre «Línea de tiempo» y «Panorama» (`RailView`
     «lineage», `Main {kind:"lineage", focus}`), y botón **«Ver linaje»** en la ficha (`PersonView.onShowLineage`).
     Buscador por nombre y aka (primero los del árbol con más relaciones); **hasta 5 generaciones arriba** (gurus) y
     **hasta 10 abajo** (discípulos); Todas / Dīkṣā / Śikṣā (`lineOfKind`). Relaciones = el sitio en el árbol
     (`tree.parent`) + los otros gurus (`links`), sin familia. Dibujo con **dagre** de arriba abajo (`minlen` = salto
     de generaciones), etiquetas ↑n / Centro / ↓n a la izquierda. **Dudas**: línea `disputed` con rayas largas y la
     caja del discípulo con borde discontinuo y «?»; cada línea con nota o discutida lleva un **número** en un círculo
     y su texto en el margen **«Notas y dudas»** (pasar el ratón ilumina los dos); casilla «Notas en las líneas».
     Clic = el linaje de esa persona; doble clic = su ficha; arrastrar y Ctrl+rueda como el Paramparā Tree. Tope 450
     personas (aviso). Preferencias en localStorage `bio.lineage*`. Estilos al final de `styles.css` («Linaje»).
  2. **Panel «Deidades»** entre Tīrthas y Biblioteca (Rail y pestañas del lateral, `DeityList` en `Sidebar.tsx`,
     icono Flower2): las fichas con la etiqueta fija **«Deidades»** (`DEITIES` / `isDeity` en `api.ts`) — una Deidad,
     no una persona (Śrī Rasikarāya #1305) —, fuera del Vaiṣṇava-maṇḍala; menú contextual «Llevar a / Sacar de
     «Deidades»»; abrir una Deidad lleva a su panel.
- Datos de la sesión (sin cambio de programa): Textos principales de 15 × 5 tandas de fichas fuera del árbol (tandas
  8–30, scripts `fN.json`, `fN/`, `fN-arbol.json`, `tanda-arbol.mjs`), separadas 1020, 1514, 893, 965, 1879; borradas
  las 7 fichas vacías de la importación y #545 (una secta).

### Novedades de la 0.13.0 (07-11-2026) — formato de BD 10: textos y galería de los tīrthas
- **Pedido por Whisper** (4 ideas + 1):
  1. El **texto de la ficha** (Texto principal o el único texto) sale **plegado**: solo su cabecera, con «Leer el texto»
     (o clic en el título / la flecha) para abrirlo. Se vuelve a plegar al cambiar de ficha (`textOpen` en `PersonView`).
  2. **Estrella** en la cabecera de ese texto: marcador sin abrir el lector (`onBookmark`, el mismo de `App.tsx`).
  3. **Textos de un tīrtha**: sección «Textos» en la página del lugar, cada uno con título y texto (Markdown, los
     nombres de sus personas enlazados), «Añadir texto…», lápiz y papelera. Tabla **`place_texts`**; van dentro de
     `PlaceFields.texts` (`Option`: `None` = no tocarlos, para scripts y versiones antiguas), así que se guardan con
     el lugar y entran en sus **versiones**.
  4. **Galería de un tīrtha** (más fotos, como la de las fichas): tabla **`place_images`**, `/placeimage/<id>`,
     «Usar como foto principal del lugar» (la anterior pasa a la galería).
  5. Lateral de la Guru Paramparā: un guru con **más de 4 discípulos de dīkṣā que tienen discípulos propios** los
     lleva a una carpeta **«Dīkṣā»** (además de «Discípulos» para los que no tienen). Bhaktisiddhānta: Discípulos 16,
     Dīkṣā 6. Arrastrar a la carpeta = discípulo de dīkṣā.
- **DATA_VERSION 10** (tablas nuevas vacías al abrir; un programa 0.12.x ya no abre la BD).

### Novedades de la 0.12.8 (06-11-2026) — apartado «Poetas» en el lateral de Vaiṣṇavas
- **Pedido por Whisper**: los poetas vaiṣṇavas (padakartās) sin guru claro llevan la etiqueta fija **«Poetas»**
  (`POETS` / `isPoet` en `api.ts`, como «Homónimos»). Fuera del árbol salen en su propio grupo **«Poetas»** del lateral,
  entre «Vaiṣṇava-maṇḍala» y los libros (cerrado al abrir la app), y no en el Vaiṣṇava-maṇḍala. Clic derecho en una
  ficha: «Llevar a “Poetas”» / «Sacar de “Poetas”». Si se coloca en el árbol, sale sola del grupo. Sin cambio de formato.
- Datos (scripts en `scripts/datos/`): tanda 1 de las fichas fuera del árbol, **336** colocadas bajo el guru o la rama
  que nombra su texto (`fuera-plan.mjs` + `colocar.mjs`: Rasikānanda, Narottama, Śrīnivāsa y su familia, Śyāmānanda,
  ramas de Caitanya, Nityānanda y Advaita); **79 poetas** con la etiqueta (`poetas-plan.mjs`, revisado a mano,
  `poetas.json`, `poetas.mjs`); grupo 7 (Madhva y Rāmānuja).

### Novedades de la 0.12.7 (06-11-2026) — elegir el guru en la ficha la coloca en el árbol
- **Pedido por Whisper**: una ficha fuera del árbol que ya tenía escrito su guru (p. ej. «Śrīnivāsa Ācārya») no se
  podía poner bajo él desde «Editar ficha»: al elegirlo de la lista no salía «Al guardar, … pasa a discípulo de …» ni
  el tipo de relación. Ahora el guru **elegido a mano** de la lista cuenta siempre (`guruPick` en `PersonDialog`,
  `Dialogs.tsx`), salvo que ya esté debajo de él.
- Datos (scripts en `scripts/datos/`): grupos 3 y 4 del Abhidhāna (Mādhavendra Purī y los sannyāsīs; Haridāsa Ṭhākura,
  Narahari Sarakāra, Śivānanda Sena, Vāsudeva Ghoṣa, Vakreśvara, Gopāla Guru, Vaṁśīvadana, Kavi Karṇapūra, Rāghava,
  Prabodhānanda); **125 fichas** fuera del árbol puestas bajo el guru que tenían escrito (`colocar-plan.mjs`,
  `colocar.mjs`); uniones: Vyāsatīrtha, Jayatīrtha, Govinda Ghoṣa, Devakīnandana, Kāśīśvara Paṇḍita.

### Novedades de la 0.12.6 (06-11-2026) — carpeta «Discípulos» en la Guru Paramparā
- **Pedido por Whisper**: en la Guru Paramparā lateral, un guru con **más de 4 discípulos** directos enseña los que
  **no tienen discípulos propios** dentro de una carpeta **«Discípulos»** (cerrada al principio, aparte de «Pārṣadas»
  y «Śikṣā»); los que tienen discípulos siguen a la vista bajo el guru. También en las vistas Dīkṣā / Śikṣā.
  «Expandir todo» y «Mostrar en el árbol» la abren; arrastrar a ella deja la relación (pārṣada / śikṣā → dīkṣā).
- Código: `Sidebar.tsx` (`MANY_DISCIPLES = 4`, `FolderKind` «disciples», en `walk` y en `expandAll`), textos
  `treeFolder.disciples` y `treeFolderHint.disciples` en `i18n.ts`.
- Datos (scripts en `scripts/datos/`, `grupo2*`): grupo 2 del Abhidhāna, la rama de Gadādhara Paṇḍita — 13 textos
  principales, 27 fichas de su rama puestas bajo él, Jayarāma Tarkālaṅkāra fuera (su maestro fue el lógico Gadādhara),
  Kavivallabha dāsa (#722, antes «Keśivallabha») bajo un Uddhava discípulo de Narahari, dos uniones de Vāṇīnātha.

### Novedades de la 0.12.5 (06-11-2026) — «Plegar hacia atrás» en la Guru Paramparā
- **Pedido por Whisper**: botón derecho sobre alguien de la Guru Paramparā lateral con dos o más gurus encima →
  **«Plegar hacia atrás»**: el árbol enseña el primero de la línea (Lord Kṛṣṇa), una fila «⋯ N más arriba ⋯» (al pasar
  el ratón, los nombres plegados) y debajo esa persona con sus discípulos. Un clic en «⋯» o en la flecha del primero,
  «Expandir/Plegar todo» o «Mostrar en el árbol» (de alguien que no está debajo) vuelven a todo el camino.
- Código: `App.tsx` (la opción solo sale si la fila tiene `data-back`; manda el evento `bio:tree-back`), `Sidebar.tsx`
  (estado `back`, guardado en localStorage `bio.sideTreeBack`; filas `type: "skip"`, clase `.tree-skip`), textos
  `collapseBack`, `treeSkipped`, `treeSkippedHint` en `i18n.ts`.
- **Datos (06-11, en la BD de Whisper):** rama nueva bajo Lord Kṛṣṇa «Other Vaiṣṇava lines (guru not in the
  Paramparā)» (#2027) y unos 40 «huérfanos» colocados bajo su guru (`otras-lineas*.json/.mjs`, `jagannatha-1828.mjs`:
  Jagannātha dāsa Bābājī — dīkṣā de Jagadānanda #2028, veśa de Madhusūdana #1848); uniones Jñāneśvara (622→1975) y
  Narahari Cakravartī (328→977); **grupo 1 del Abhidhāna** (Mahāprabhu y Nityānanda: texto principal, `grupo1*`; el
  libro de 383 KB que estaba dentro del texto de Nityānanda pasó a «Libros», doc 3411).

### Novedades de la 0.12.4 (06-11-2026) — enlaces a archivos en las notas
- **Pedido por Whisper** (para abrir el PDF de un libro desde la ficha): en las notas, una línea que sea una ruta del
  PC (`E:\…\libro.pdf`, `\\servidor\…`, `file:///…`, con o sin comillas) sale como enlace y se abre con su programa
  (`open_external` → `open_path`). También `[palabra](<ruta o web>)` y `[palabra](https://…)`: se ve solo la palabra.
  Código: `noteLinks` / `WebLinks` en `PersonView.tsx` (sirve también para las notas de los Tīrthas).
- En «Editar ficha», botón **«Enlazar…»** junto a «Notas» (`NotesEditor` en `Dialogs.tsx`): seleccionar la palabra,
  «Elegir archivo…» (o pegar la ruta / web) → «Crear enlace» escribe `[palabra](<ruta>)`. Textos `link*` y
  `notesHint` en `i18n.ts`; estilos `.notes-head`, `.link-maker`.
- **Datos (06-11, en la BD de Whisper):** Bhaktivinoda 3 y 4 (discípulos de Bhaktisiddhānta y de Keśava, con texto
  principal y fechas del calendario), libros recopilatorios repartidos en las fichas (`libros-saints.json`,
  `libros-acaryas.json` con `nit3-split.mjs`), `sindup.mjs --ficha` (quita lo que ya cuentan otros textos de la
  misma ficha), Sanatkumāra-saṁhitā pasada a libro, Raghunātha dāsa Gosvāmī sacado de la ficha #1207. Detalle en CONTINUAR.md.

### Novedades de la 0.12.3 (05-11-2026) — ir a una ficha por su número
- **Pedido por Whisper** (para ir a las fichas repetidas que Claude le nombra): en «Filtrar personas…», `#1139` (o
  `1139`) enseña solo esa ficha, sin mirar las etiquetas (`Sidebar.tsx`, en `shown`). La cabecera de cada ficha
  muestra su número en gris junto al nombre («Puruṣottama Ṭhākura #1139»; `PersonView.tsx`, `.record-number`,
  textos `recordNumberHint` / `filterPersonsHint`). Al hablar con Whisper: nombrar las fichas como «#1139».
- **Datos (05-11, en la BD de Whisper):** los doce gopālas y el círculo de Nityānanda con texto principal
  (`scripts/datos/nityananda1–4.json` + carpetas). Script nuevo `nit3-split.mjs <plan.json>`: corta trozos de un
  texto por el texto exacto (aunque estén en la misma línea) y los lleva a su ficha; separadas así Gaṅgā Devī,
  Mādhava Ācārya, Padmāvatī, otras Jāhnavās, Śrīdhara Svāmī (de Śrīdhara Brahmacārī). `tithi.mjs <puerto> fechas`
  da el mes y tithi de un día del calendario (comando `upcoming`). Fichas nuevas 1987–1996.

### Novedades de la 0.12.2 (05-11-2026) — las fichas primero en la búsqueda
- `search.rs` `order_by` (orden «Relevancia»): primero los textos de fichas del árbol (como antes), luego los de
  las demás fichas (`d.person_id IS NULL`) y al final los libros sin ficha, aunque coincidan más. Prueba
  `record_texts_before_books`.
- **Datos (05-11, en la BD de Whisper, no en el programa):** la Biblioteca tiene ahora las colecciones «Fichas»
  (todo texto con ficha; desaparecen «Obsidian Biografías» y «Calibre»), «Texto principal», «Libros» (17 textos
  sin ficha) y «Mis textos» (`scripts/datos/biblioteca-ordenar.mjs`); 9 copias exactas a la papelera. Fichas que
  mezclaban personas separadas con `govinda-split.mjs <plan.json>`: Govinda (420), Haridāsa (476), Jagadānanda
  Ṭhākura (525). Libros que eran fichas: `libros-sin-ficha.mjs`. Grupos Purī 1–3 con texto principal.

### Novedades de la 0.12.1 (05-11-2026) — la Guru Paramparā de la barra lateral, más ordenada
- **Carpetas «Pārṣadas» y «Śikṣā»** bajo cada guru (`Sidebar.tsx`: `FOLDERS`, `folderOf`, filas
  `type: "folder"`): sus asociados y sus discípulos de śikṣā/vāṇī **sin discípulos propios** (los que tienen
  rama siguen a la vista: Mahāprabhu es śikṣā de Lord Kṛṣṇa) van en una carpeta **justo debajo del guru**,
  cerrada al empezar (abiertas en localStorage `bio.treeFoldersOpen`). Solo es cómo se ve: nada en la BD.
  Soltar a alguien en una carpeta (o junto a uno de dentro) abre «¿Cómo se relacionan?» (`RelateDialog`, prop
  `as`) con esa relación marcada; mismo guru → sin «quitar del guru anterior». App `movePerson(id, place, as)`.
- **Interruptor «Todo / Dīkṣā / Śikṣā»** encima de la lista (`bio.sideTreeLine`): en Dīkṣā / Śikṣā cada uno va
  bajo su guru de esa línea (`arrange` exportado de `TreeView.tsx`), sin carpetas y sin arrastrar; «Ver en el
  árbol» de una ficha que no está en esa línea vuelve a «Todo».
- **«Expandir todo» / «Plegar todo»** (en «Todo» abre/cierra también las carpetas).

### Novedades de la 0.12.0 (04-11-2026, **publicada en GitHub**) — el árbol como un árbol impreso
- **Formato 9** (`DATA_VERSION 9`): `person_tree.grp` (grupo en que se dibuja: «Pañca-tattva»…),
  `person_tree.note/.disputed` y `person_links.note/.disputed` (palabra en la línea, «las fuentes no
  coinciden»); `person_links.kind` puede ser **`family`** (guru_id = el pariente mayor; note = cómo: «son»,
  «wife»). Las líneas de familia van aparte de los gurus: `store::set_family` (no las toca `set_links`,
  `relate` las ignora, `check.rs` las salta). Al mover una ficha bajo otro guru se borra la nota de la línea
  vieja. Comandos nuevos: `set_tree_group`, `set_line_info`, `set_family`, `save_tree_svg`. `api.listPersons`
  separa `links` (gurus) y `family`. Prueba `group_note_disputed_family` y `format_8_tree_gets_group_note_disputed`.
- **Paramparā Tree** (`TreeView.tsx`): botón **«De izquierda a derecha / De arriba abajo»** (localStorage
  `bio.treeDir`). De arriba abajo: `treeLayoutTB.ts` con **dagre 1.1.4** (npm, `@dagrejs/dagre`): grupos en un
  recuadro ajustado a sus miembros, los discípulos hoja de un guru (≥ 4, sin grupo ni otras líneas) en una
  **lista**, y las **cadenas** de un guru – un discípulo (Madhva → Padmanābha → …) en una caja. Líneas:
  continua dīkṣā, rayas śikṣā, **rayas largas + «?» discutida**, **verde de puntos familia**, palabras de las
  notas en la línea. Las líneas de los otros gurus se ven siempre (tenues, 35 %) y el deslizador las resalta.
  **«Exportar (SVG)»**: el dibujo tal cual, con los colores escritos (se abre en el navegador; PDF desde allí).
- **Ficha:** botón **«Ver en el árbol»** (App `main.focus`): abre el árbol dibujado con la ficha en el centro,
  resaltada 6 s (si no está en la vista de línea, pasa a «Todo»). **Al guardar una ficha**, los otros gurus
  escritos en «Guru» que están en el árbol se añaden como líneas (`gurusWithKind` en `Dialogs.tsx`: el
  paréntesis da el tipo — «(śikṣā)», «(dīkṣā)», «(sannyāsa)», «(veśa)», «(vāṇī)»; sin paréntesis:
  «discípulo sin especificar»), salvo los quitados a mano en «Otros gurus en el árbol».

### Novedades de la 0.11.4 (04-11-2026, **publicada en GitHub**) — «Texto principal»
- Colección **«Texto principal»**: si una ficha tiene un texto en ella, la ficha lo lee entero como libro y
  los demás textos van en «Otras versiones (N)». Los títulos largos del índice ya no se cortan.
- Sin cambio de formato (DATA_VERSION 8). Datos de los Seis Gosvāmīs: `scripts/datos/gosvamis*` +
  `scripts/datos/textoprincipal.mjs` (aplicar en la BD real tras instalar; ver CONTINUAR.md).

### Novedades de la 0.11.3 (04-11-2026, **publicada en GitHub**) — leer como un libro, satélite guardado en el PC
- Ficha de un solo texto: todo seguido como un libro (Literata 18 px, ~68ch, justificado, citas en cursiva,
  «❦ v.2 ❦» entre versiones) con índice «En este texto» a la izquierda; fuera tarjetas y «Leer todo».
- Mapa satélite: teselas guardadas en «biodata-mapa.db» (`tiles.rs`, protocolo `bio` asíncrono), sin
  parpadeo al acercar. Solo el estilo Windows 11. Detalle en §7 («✔ 1.º HECHO»). Formato 8 sin cambios.
- Enlazar un nombre a mano (`[[Nombre#ficha-ID|texto]]`), «Crear ficha con este texto» (el trozo a Notas y
  fuera del texto) y arreglo de `find_fragment` (cortaba desde una entrada anterior que empezaba igual).

### Novedades de la 0.11.0 (04-11-2026) — **Tīrthas**, satélite, Inicio nuevo — **DATA_VERSION 8**
- **Tīrthas** (lugares santos): tablas `places`, `place_persons` (formato 7) y `place_photos` (formato 8).
  Botón propio en el lateral; página de cada lugar (dónde está, qué hay, fuente, personas por relación
  —Śrīpāṭa, Samādhi, Āvirbhāva-sthāna, Vāsa-sthāna, Otros— con explicación al pasar el ratón; fichas que
  lo nombran en «Lugar»; **foto**); tarjeta «Tīrthas» en cada ficha. 50 lugares en la BD de Whisper
  (tandas 1–4 de `scripts/datos/lugares-N.json`, sacados del Abhidhāna); la tanda 5 (Purī) y la ficha de
  Kāśī Miśra (`kasi-misra.mjs`) se aplicaron tras actualizar Whisper a la 0.11.0 (copia «antes de Puri
  y Kasi Misra»): **62 tīrthas**, ficha 1952 Kāśī Miśra (sin discípulos: en la BD de Whisper aún hay tres
  Pratāparudra iguales —278, 1111, 1854—, sin unir ni marcadas como distintas).
- Mapa: «Dibujo / Satélite» (teselas Esri), mapa «Vraja de cerca», punto elegido en rojo, clic = acercar
  a los vecinos (≤10 km o pegados), doble clic = bajar a las fichas, zoom hasta ~1 km.
- Inicio: «Hoy», Seguir leyendo, Marcadores, «Del día»; cifras en Panorama › Estado. Lateral:
  «Paramparā Tree», «Vaiṣṇavas», «Tīrthas». Tarjetas de la ficha sin huecos.
- (0.10.0–0.10.6 fueron instaladores de prueba en el PC de Whisper, sin publicar.)

### Novedades de la 0.9.1 (03-11-2026) — foco en la **Guru Paramparā**, mapa con fondo
- **Mapa dibujado, sin internet** en Panorama › Mapa: tierra, mar, ríos (Gaṅgā, Yamunā…, con nombre),
  lagos, fronteras y estados de India/Bangladés (`components/mapData.ts`, generado de Natural Earth 10m
  con `scratchpad/geo/make.js`: simplificado, recortado a 72.5–95 E / 16.5–32 N, coordenadas en
  centésimas de grado codificadas por diferencias). **Zoom** con la rueda, doble clic y botones
  ＋ / − / encuadrar; arrastrar para moverse (`MAX_ZOOM` 10; nombres de lugares desde ×2.5).
- La app **se centra en la Guru Paramparā** sin quitar a nadie: Panorama empieza en «Guru Paramparā»;
  la búsqueda y el filtro ponen primero las fichas del árbol (`search.rs`: `IN_TREE`, columna `tree`
  en `Hit`/`PersonHit`) con un punto naranja; «Otros vaiṣṇavas» se abre plegado; sello
  «Guru Paramparā» encima del nombre en la ficha (lleva al árbol).
- «Sin tipo» en Discípulos → «Sin especificar».
- Arreglo: «Mover a otra ficha» fallaba con trozos de 7 a 11 palabras (`find_fragment`; con prueba).
- Sin cambios en el formato de la base de datos (DATA_VERSION 6).

### Novedades de la 0.9.0 (02-11-2026) — **Panorama**
- Vista nueva **Panorama** (barra de la izquierda y botón en Inicio; `Panorama.tsx`, datos de
  `overview.rs` → orden `overview`), con «Todas / Guru Paramparā / Vaiṣṇava-maṇḍala» y pestañas:
  - **Estado**: % de fichas con año, aparición, desaparición, día vaiṣṇava, guru, discípulos, lugar,
    obras, notas, texto, foto; cada barra abre la lista de las que lo tienen pendiente; fichas por siglo.
  - **Mapa**: lugares sagrados de la casilla «Lugar» (`PLACES`: ~40 con coordenadas y formas de
    escribirlos), mapa del norte de la India + «Bengala de cerca»; punto → quién; lista de lugares.
  - **Ramas**: guru con más discípulos directos, total debajo y generaciones.
  - **Año vaiṣṇava**: apariciones y desapariciones por mes vaiṣṇava, con su tithi. El día sale del
    **calendario .ics** de Whisper si lo tiene (`calendar::person_days` + `calendar::day`), si no del texto.
  - **Obras**: la casilla «Obras» por siglo.
- En cada ficha, **«Coincidieron en vida»**: las fichas de la Guru Paramparā cuya vida se cruza con la
  suya (de `timeline`; una vida con un solo año se toma de 60 años).
- En la copia de pruebas (Guru Paramparā, 262 fichas): 13 % con algún año, 98 % con guru, 55 % con
  lugar; 60 con día vaiṣṇava (37 sin el calendario). Ideas: más lugares en `PLACES`; rellenar años.

### Novedades de la 0.8.5 (02-11-2026)
- Ajustes › Revisar: al abrir una ficha o un texto desde Ajustes sale abajo **«← Volver a Ajustes ›
  Revisar»** (`backTo` en `App.tsx`; `onOpenPerson(id, tab)` en `Settings.tsx`), y la comprobación
  sigue como se dejó (`lastCheck` en `Review.tsx`: resultado, «solo árbol» y grupos abiertos); el
  botón dice «Comprobar otra vez».
- En «Su guru no lo tiene en Discípulos» / «Su discípulo no lo tiene en Guru», cada línea tiene
  **«＋ Escribirlo también en …»** (`store::complete_back(id, other)`: añade el nombre en la otra ficha,
  con su «(śikṣā)»… si lo llevaba; versión guardada). **Uno a uno a propósito**: hacerlo para todos de
  golpe se probó en una copia y metía errores (a Mahāprabhu le ponía como gurus a Gaṅgā Dāsa, Murāri
  Gupta…; a Narottama, Nārāyaṇī Dāsī, Vasanta Rāya…) porque los campos escritos a mano o por la IA no
  siempre son correctos.

### Novedades de la 0.8.4 (02-11-2026)
- Los nombres largos de guru / discípulos se parten dentro de su tarjeta (`.facts dd .name-link`
  tenía `white-space: nowrap`); medido de 1000 a 2000 px.

### Novedades de la 0.8.3 (02-11-2026)
- **Guru por tipo** en la ficha (idea de Whisper): «Guru de dīkṣā», «Guru de śikṣā», «Guru de sannyāsa»,
  «Guru por vāṇī», «Guru de bābājī veśa», «Asociado de», y «Guru» para lo escrito sin tipo. Salen del
  árbol (guru con el que cuelga + «otros gurus») y de lo escrito en la ficha («(śikṣā)»…), sin repetir
  (`looseName`: sin Śrī, sin la «a» final, dos primeras palabras). **Discípulos** en una fila ancha
  abajo, como Notas, agrupados por tipo con cuántos hay (del árbol: hijos y fichas que lo tienen como
  «otro guru»; y lo escrito). `splitList` parte por comas fuera de paréntesis. Solo forma de mostrar.
- La barra de arriba ya no esconde Ajustes en ventanas estrechas: el cuadro de búsqueda cede primero
  (`.topbar .searchbox { min-width: 140px }`, `.top-actions { flex-shrink: 0 }`); sin el nombre de la
  app por debajo de 1360 px; sin el orden de resultados ni el botón de idioma por debajo de 860 px.
  Medido de 640 a 1500 px (la ventana no baja de 900).

### Novedades de la 0.8.2 (02-11-2026)
- Filtro de Personas: primero las fichas que **se llaman** así; debajo, «Lo nombran en sus datos» (las
  que solo lo mencionan); la lista vuelve arriba al escribir.
- La comprobación de datos, el calendario y la línea de tiempo distinguen nombres que solo cambian en el
  título («Śrīnivāsa Ācārya» / «Śrīnivāsa Ṭhākura»): primero se busca el nombre completo exacto.

### Novedades de la 0.8.1 (02-11-2026)
- **Deshacer la unión** de fichas: aviso «Acabas de unir aquí: … · Deshacer la unión» durante una hora y,
  siempre, en el menú «⋯» de la ficha.
- «Otros vaiṣṇavas» y «Homónimos» son un solo grupo, **«Vaiṣṇava-maṇḍala»** (nombre elegido por
  Whisper), ordenado por nombre: los del mismo nombre van juntos con un subtítulo.

### Novedades de la 0.8.0 (02-11-2026)
- **Tarjetas** en el texto de la ficha: cuando el texto junta varias personas del mismo nombre
  (subtítulos «## BALARĀMA DĀS» repetidos) o varias partes unidas, cada entrada es una tarjeta, todas a
  la vista: 250 letras y «Leer todo» la abre ahí mismo; «Abrir todo / Cerrar todo»; lápiz por tarjeta;
  «igual que la entrada N» si el texto está repetido; papelera por tarjeta para borrar solo esa entrada.

### Novedades de la 0.7.9 (02-11-2026)
- La búsqueda principal busca también en los datos de las fichas (notas, fechas, lugar, obras…):
  arriba de los resultados, «Fichas que lo dicen» (5 a la vista, «Ver las N fichas», hasta 100).
  Es la preparación para pasar los textos cortos (≤ 500 B) a Notas sin perder la búsqueda.

### Novedades de la 0.7.8 (02-11-2026)
- Texto dentro de la ficha: la barra (título, partes) se queda fija arriba al leer; no salen las
  primeras líneas que solo repiten el nombre; botón «↑ Arriba»; índice de subtítulos al lado (solo si
  hay 3 o más de verdad: hoy casi ningún texto los tiene).
- «Homónimos» se ve siempre, aunque esté vacía.
- Ajustes › Revisar › «Marcadas como “No son la misma persona”»: deshacer la X con una flecha.

### Novedades de la 0.7.7 (02-11-2026)
- Carpeta **«Homónimos»** en el panel Personas (personas distintas con el mismo nombre: Haridāsa,
  Jagannātha, Govinda…), agrupada por nombre; cuadradito en cada ficha parecida, «Todas a Homónimos»
  y botón derecho › «Mandar a / Sacar de Homónimos». Ya no salen en rojo.
- Rojo de las fichas quizá repetidas también en el árbol dibujado.
- Al mover un trozo a otra ficha, el título propuesto es la primera línea del trozo.

### Novedades de la 0.7.6 (02-11-2026)
- Botón «Unir sus textos en uno solo» junto al título «Textos» de la ficha; X en cada ficha parecida.

### Novedades de la 0.7.5 (02-11-2026)
- «Mover a otra ficha…» un trozo de texto seleccionado; «No son la misma persona» en la ficha.

### Novedades de la 0.7.4 (02-11-2026)
- Árbol hondo: los nombres siempre a la vista; tipos śikṣā por vāṇī, sannyāsa y bābājī veśa; el árbol
  pasa a las fichas; fichas quizá repetidas en rojo; «Colorear su línea hasta arriba»; otros gurus
  fuera del árbol; «Comprobar los datos»; enlaces web en las notas (§7, «Hecho el 02-11-2026»).

### Novedades de la 0.7.3 (01-11-2026)
- Marcas de colores con doble clic en el árbol (§7, punto 10).
- Árbol dibujado: «Todo · Línea de dīkṣā · Línea de śikṣā» (§7, punto 11).

### Novedades de la 0.7.2 (01-11-2026)
- Árbol dibujado: acercar / alejar (botones, Ctrl + rueda), «Ver el árbol entero» y arrastrar el
  fondo para moverse; el árbol tiene su propio recuadro (§7, punto 9).

### Novedades de la 0.7.1 (01-11-2026)
- Árboles: primero los discípulos sin discípulos, después los que siguen la línea (§7, punto 7).
- Ficha: datos en tres columnas, Guru / Discípulos · Aparición / Desaparición · Lugar / Obras
  (§7, punto 8); los nombres largos del guru ya no se salen de la tarjeta.

### Novedades de la 0.7.0 (01-11-2026) — **DATA_VERSION 6**
- **Varios gurus en el árbol**: tabla `person_links` (gurus de śikṣā / asociados además del guru
  bajo el que está la ficha). Editar ficha › «Otros gurus en el árbol (śikṣā)»; «+ śikṣā» en el panel;
  líneas extra en el árbol dibujado con el **deslizador Dīkṣā ↔ Śikṣā** (idea de Whisper). Detalle
  en §7, punto 5. La 0.6.x no abre una base de datos de formato 6.

### Novedades de la 0.6.2 (01-11-2026)
- El tipo de relación se ve **siempre** (lo pidió Whisper): etiqueta «dīkṣā» / «śikṣā» / «pārṣada»
  junto a cada discípulo en el árbol del panel (śikṣā y pārṣada en el color de acento) y en el árbol
  dibujado (`TreeView.tsx`: etiqueta en el cuadro y línea de rayas / puntos como en el panel).
  Nota: el 01-11-2026 las 46 relaciones de la BD eran dīkṣā; no se había perdido nada.

### Novedades de la 0.6.1 (01-11-2026)
- «Rellenar fichas con IA»: **el modelo se elige** en Ajustes › Rellenar fichas (meta `ai_model`);
  por defecto **`qwen3.5:4b`** (el doble de rápido que `qwen2.5:7b` y sin inventar; ver §7).
  Al cambiar de modelo las fichas se vuelven a leer (el hash incluye el nombre del modelo).
- `ai::keep`: lugar, guru, discípulos y obras se aceptan sin frase de prueba si el nombre está
  en el texto; fechas y notas siguen necesitándola; una edad («106 years old») no es una fecha.

### Novedades de la 0.6.0 (01-11-2026; DATA_VERSION sigue en 5)
- **Estilo «Windows 11»** (`data-skin="fluent"`), inspirado en K-Desktop; **es el estilo por defecto**
  (al actualizar se cambia una vez, `bio.skinFluentOnce`; luego se respeta lo que elija el usuario).
  Acento amarillo `#f5c542` con letra oscura (`--on-accent`); «VS Code» y «Clásico» siguen en Ajustes.
- Barra de la izquierda (`components/Rail.tsx`): Inicio, Calendario, Guru Paramparā, Línea de tiempo;
  paneles Personas / Biblioteca / Marcadores / Historial; Ajustes y Ayuda abajo. Solo iconos con
  ventana < 1200 px.
- **Calendario** con página propia (90 días, todos los eventos).
- **Ajustes** a pantalla completa: secciones con icono y explicación, bloques con filas
  (`Card` / `Row` en `Settings.tsx`; en los otros estilos se ven como antes pero en filas).
- Ficha, lector, Inicio, resultados, menús y diálogos en tarjetas, títulos en letra normal.

### Novedades de la 0.5.2 (01-11-2026) — **DATA_VERSION 5**
- **Tipo de relación en el árbol** (`person_tree.kind`: `diksa` por defecto | `siksa` | `associate`;
  `db::init_schema` añade la columna a los archivos viejos; `store::set_tree_kind`, comando
  `set_tree_kind`). Editar ficha › «En el árbol, con su guru» (si la ficha está en el árbol o va a
  estarlo). En la barra lateral: línea continua / de rayas / de puntos hasta su guru y etiqueta
  «śikṣā» / «pārṣada» a la derecha. Mover la ficha conserva su tipo. Motivo: el usuario quiere que
  los asociados de Mahāprabhu (Śrīvāsa, Svarūpa Dāmodara…) no parezcan discípulos iniciados. **La
  colocación de cada uno la decide el usuario.** Pendiente: el árbol dibujado (TreeView.tsx) aún no
  distingue los tipos.
- **Guru ↔ discípulo en las dos fichas** (`store::relate`, comando `relate`): al soltar una ficha bajo
  otro guru (encima o antes/después de un discípulo de otro guru) sale `RelateDialog` (dīkṣā / śikṣā /
  asociado + «quitarlo de los discípulos de su guru anterior», marcada). Escribe el guru en la ficha
  del discípulo («X (dīkṣā)» si ya había otro, «X (śikṣā)»), el discípulo en «Discípulos» del guru
  («Y (śikṣā)»), y con la casilla quita a ambos lados al guru anterior. Un asociado no se escribe.
  Reconoce el nombre aunque esté escrito distinto (plegado o `PersonIndex::find`): no lo repite.
  Desde Editar ficha y «Paramparā…» solo **añade** en la otra ficha (no quita nada). Cada ficha guarda
  su versión anterior (`update_person`).
- **Cronologías de la biblioteca → línea de tiempo y Rellenar fichas** (`chronicle.rs`, comando
  `chronicle`). Se leen **del texto cada vez** (nada se copia; sin cambio de formato): un texto con ≥ 20
  entradas «1534 AD / 1456 S' Jaiṣṭha--…» o «1455 S Pansi … (1533 AD).» es una cronología (hoy solo el
  **Vaiṣṇava Digdarśanī**, texto 2155). Lo de antes de «--» (≤ 45 letras) es el día lunar. Si el año AD y
  el Śaka (+78) no cuadran, gana el que encaja con la entrada anterior (el libro tiene erratas en los
  dos). Nacimiento / desaparición: «Birth of X», «disappearance / passing of X», «X passes away / is
  born» al principio de la entrada; X → ficha con `find_person` (el principio más largo del nombre, o
  sin la primera palabra: «Gopāla Gaurīdāsa», «Yavana Haridāsa»). Repetidos (la lista y el relato del
  mismo suceso) → uno. En la copia: 757 sucesos, 244 nacimientos/desapariciones, 130 con ficha, < 1 s.
  Línea de tiempo: interruptor «Sucesos del Digdarśanī», año, día lunar, texto con nombres enlazados
  (`linkNames`), botón de la ficha y del libro (abre la sección). Rellenar fichas: fuente `chronicle`,
  valor «Jaiṣṭha, 1534 AD / 1456 Śaka (Digdarśanī)», solo si el campo está vacío; si el libro da dos
  fechas (Gopāla Bhaṭṭa: 1578 y 1585) salen las dos. Prueba real: `cargo test chronicle_real -- --ignored
  --nocapture` con `BIO_DB`.

### Novedades de la 0.5.1 (01-11-2026)
- **Líneas en el árbol de la Paramparā** (barra lateral): cada discípulo queda unido a su guru con
  ├ / └ y una línea │ baja por cada guru que tiene más discípulos debajo (`treeLines` en Sidebar.tsx,
  sangría `INDENT` = 16 px; estilos `.tree-lines` en styles.css).
- **Editar ficha › Guru / Discípulos vacíos**: se rellenan al abrir con los del árbol (antes la ficha
  los mostraba desde el árbol pero el campo estaba vacío y no se podían cambiar). Si se quita de la
  lista uno que está debajo en el árbol, avisa de que sigue ahí (para moverlo: ponerlo en los Discípulos
  de su guru, o arrastrarlo).
- **Editar ficha › Guru y Discípulos con la lista de fichas** (`NamesInput` en Dialogs.tsx): al
  escribir o pinchar en el campo sale la lista de todas las fichas (las de la Paramparā con el icono del
  árbol), filtrada por el nombre que se está escribiendo (lo que hay entre comas / punto y coma).
  En Discípulos se pueden elegir varios seguidos. Debajo avisa de lo que pasará al guardar, y al
  guardar: si **el primer guru** es una ficha y es nuevo, la ficha pasa en el árbol a su último
  discípulo (si el guru no estaba en la Paramparā, se añade al final); y cada **discípulo nuevo** que sea
  una ficha pasa a discípulo de esta (si esta no estaba en la Paramparā, se añade al final). Luego la
  marca en la barra lateral. Un nombre cuenta como ficha si se eligió de la lista o si es exactamente el
  nombre de una sola ficha. No cambia los campos de la otra ficha (el guru no recibe al discípulo en su
  campo «Discípulos»).
- **Rellenar fichas con IA local** (`ai.rs`, panel «Con IA local» en `components/Fill.tsx`): modelo
  **`qwen2.5:7b`** de Ollama (4,7 GB, cabe entero en la RTX 3050; descargado el 01-11-2026). Por cada ficha
  con texto (≥ 250 letras) y algún campo vacío manda sus textos (los más cortos primero, hasta 16.000
  letras; contexto 8192, respuesta ≤ 900 tokens, temperatura 0) con un esquema JSON de los campos vacíos
  `{value, evidence}`. Se descarta lo que dice «unknown / not mentioned…», lo que tiene una prueba
  (`evidence`) cuyas palabras no están en el texto (≥ 80 %), y lugar / guru / discípulos / obras cuyos
  nombres no están en el texto. Lo demás va a `fill::add(…, "ai", …)` (con `guru_id` si el guru es una
  ficha). Recuerda lo ya leído en la tabla `ai_read` de `biodata-propuestas.db` (hash de modelo + texto +
  campos pedidos): se puede parar y seguir. Comandos `ai_status / ai_start(limit) / ai_stop / ai_pull`,
  eventos `ai-progress / ai-done / ai-error / ai-pull / ai-pull-done`. Botones «Probar con 10 fichas» y
  «Leer todas las fichas» (991 fichas en la copia del 01-11-2026). Prueba suelta de una ficha:
  `cargo test ai_real -- --ignored --nocapture` con `BIO_DB=<copia>` y `BIO_ID=<id>` (sin `BIO_ID` lista
  candidatas).

### Novedades de la 0.5.0 (31-10-2026)
- **Biblioteca › botón derecho en una carpeta › «Mandar a la papelera…»**: todos sus textos (y los de
  sus subcarpetas) van a la Papelera (`store::trash_folder`, comando `trash_folder`); se recuperan
  en Ajustes › Papelera.
- **Buscar en el árbol**: cuadro «Buscar en el árbol…» arriba de la Biblioteca (carpetas y títulos;
  deja solo las ramas que coinciden, abiertas). Y **«Mostrar en el árbol»** en el botón derecho de un
  texto o una ficha: quita el filtro, abre las carpetas / los gurus de la Paramparā, baja hasta la
  fila y la hace parpadear (`Reveal` en Sidebar.tsx).
- **Ficha › «Paramparā…»** (también en el botón derecho de una ficha: «Lugar en la Guru Paramparā…»):
  dice dónde está ahora, sugiere los gurus escritos en su campo «guru» y permite elegir uno
  escribiendo su nombre → pasa a ser su último discípulo (`GuruDialog` en Dialogs.tsx). Si el guru no
  está en la Paramparā, se añade antes al final. También «Quitar de la Paramparā». Al terminar la
  marca en la barra lateral. Botón con la diana (al lado) = «Mostrar en el árbol» para arrastrarla.
- **Ajustes › Rellenar fichas** (`fill.rs`, `components/Fill.tsx`): propuestas para campos vacíos,
  que el usuario acepta (✓) o descarta (✕) una a una o «Aceptar las N que se ven». Fuentes:
  **calendario** (`calendar::person_days`: día lunar de la fecha del .ics, escrito «Viṣṇu Kṛṣṇa Aṣṭamī
  (Gauḍīya calendar)», que `parse_day` vuelve a leer) y **discípulos** (los nombres del campo
  «Discípulos» de las fichas de la Paramparā → guru de esas fichas; al aceptar, la ficha pasa al árbol
  bajo ese guru). Se guardan en **`biodata-propuestas.db`** junto a la BD (no es dato de la biblioteca;
  no va en copias): lo descartado no vuelve. Al aceptar, solo campos vacíos, con `update_person`
  (versión anterior). En una copia: 93 propuestas (88 fechas, 5 gurus).
  **Siguiente paso (pendiente, lo lanza el usuario):** fuente «ia» con un modelo local de Ollama que
  lea los textos de cada ficha y proponga fechas, lugar, guru, obras… con la frase de donde lo saca.
- **Ficha con un texto de varios apartados** (textos unidos): se ve como en el lector, un apartado
  cada vez con la barra ◀ lista ▶ «1 / 3»; el lápiz edita el apartado que se ve.
- 31-10-2026: **unidos los textos de la biblioteca real** a petición del usuario (166 fichas, 476
  textos, 12 repetidos fuera; 2.920 → 2.610 textos). Copia previa: «Gaudiya Vaisnavas DB antes de unir
  textos 2026-10-31 2324.db» en Documentos.
- Ajustes › Copias: ya no lista «biodata-significado.db» ni «biodata-propuestas.db» como copias.
- **Editar texto › Colección**: lista desplegable con las colecciones que hay + «Nueva colección…».
- **Ajustes › Copias de seguridad › Versiones anteriores**: cuántas hay y cuánto ocupan, y botón
  «Vaciar las versiones anteriores» (`store::clear_versions` + VACUUM, en segundo plano, con copia
  «… antes de vaciar versiones …»).
- **Actualizar sin bajar el instalador**: plugins `tauri-plugin-updater` y `tauri-plugin-process`.
  Si la release tiene `latest.json`, el aviso de la barra de estado y Ayuda › Buscar actualizaciones
  ofrecen «Actualizar ahora»: descarga el instalador firmado, lo instala en modo pasivo (sin preguntas)
  y vuelve a abrir la app. Si no (releases antiguas), como antes: abrir la descarga.
  La 0.4.2 instalada no tiene esto: **la 0.5.0 hay que instalarla a mano**; desde ella, las siguientes se
  instalan solas.
- **Arreglo importante: las confirmaciones no esperaban la respuesta.** El plugin de diálogos de Tauri
  cambia `window.confirm` por una función que devuelve una promesa; `if (!window.confirm(…)) return`
  la tomaba siempre por «sí» y hacía la acción antes de contestar (borrar ficha, vaciar la papelera,
  restaurar copia, reemplazar todo…). Ahora todas usan **`await ask(…)`** (`components/ui.tsx`).
  **No usar `window.confirm` directamente nunca.** (`window.prompt` sí es el normal y espera.)

### Novedades de la 0.4.2 (31-10-2026)
- **Un texto por ficha** (Ajustes › Copias de seguridad, y menú «…» de cada ficha: «Unir sus textos en uno
  solo»): `store::join_person_texts`, comando `join_texts` (con copia previa si es para todas). Cada
  ficha con ≥2 textos pasa a tener uno, título = nombre de la ficha, colección «Fichas»; cada texto
  anterior es un apartado `# título` y sus trozos se llaman «título · 2», «· 3» en el índice. PDF →
  `pdf_markdown`; un texto cuyas palabras ya están en otro apartado se deja fuera. Los anteriores van a
  la Papelera; los marcadores pasan al texto nuevo; la primera portada pasa a ser la foto de la ficha
  si no tenía. **Solo toca textos con ficha: Goswami Grantha (103, sin ficha) no se toca** — el
  usuario quiere revisarlo él (hay libros por capítulos). En una copia: 164 fichas, 472 textos, 3,7 s.

### Novedades de la 0.4.1 (31-10-2026)
- **Personas**: tras «Otros vaiṣṇavas», un grupo plegable por cada colección cuyos textos no son de
  ninguna ficha (p. ej. «BHAJAMS & KIRTANS», «Goswami Grantha»), con sus textos (`topics` en Sidebar.tsx;
  empiezan plegados: en `personGroups` se guarda la clave `col:…` al abrirlos).
- **Importar › «Guardar solo el texto (como nota Markdown)»** (marcado por defecto): no guarda el PDF
  ni la portada; el texto pasa por `extract::pdf_markdown` (quita «## p. N», las líneas repetidas en
  muchas páginas y los números de página; une párrafos cortados por el salto de página) y queda
  con kind `md`. La huella para duplicados se calcula antes de limpiar.
- **Ajustes › Copias de seguridad › Ocupar menos espacio** (`store::slim_library`, comando
  `slim_library`, en segundo plano con copia «… antes de ocupar menos …»): portadas a miniaturas
  JPEG de 480 px (crate `image`), texto de los PDF a Markdown (con versión anterior, kind → `md`) y
  quitar los PDF originales salvo los que no tienen texto (size < 200) y los de la papelera; luego
  VACUUM. Los Word originales se quedan. En una copia: 240 MB → 146 MB en 27 s (380 PDF; quedan
  54 MB de «versiones anteriores»).

### Novedades de la 0.4.0 (31-10-2026; DATA_VERSION sigue en 4)
- **Ajustes › Reemplazar › Buscar y reemplazar**: en textos, títulos y/o fichas; palabra completa,
  distinguir mayúsculas (si no, respeta las del texto: sri→Śrī, SRI→ŚRĪ), expresión regular ($1).
  «Ver los cambios» enseña los 300 primeros; «Reemplazar todo» hace antes una copia
  («Gaudiya Vaisnavas DB antes de reemplazar …db» en la carpeta de copias) y guarda la versión
  anterior de cada texto/ficha cambiados. Trabajo en segundo plano (fase «replace»).
- **Ajustes › Reemplazar › Diacríticos sánscritos**: lista las palabras sin diacríticos que tienen
  forma IAST conocida (Krishna/Krsna→Kṛṣṇa, Thakur→Ṭhākur, Vaishnavas→Vaiṣṇavas,
  Krsnadasa→Kṛṣṇadāsa). Las de «Diccionario» (sanskrit.rs) salen marcadas; las de «Biblioteca»
  (aprendidas de los textos con IAST, solo letras IAST válidas) sin marcar. Se pueden corregir.
  En la copia de prueba: 2.027 palabras, 1.957 marcadas → 332.836 cambios en ~20 s. La búsqueda no
  cambia (el plegado ignora los diacríticos) y los nombres de fichas siguen enlazando.
- **Búsqueda por significado** (botón «Significado» en la barra de búsqueda, Ajustes › Significado):
  necesita **Ollama** instalado (`winget install Ollama.Ollama`) y el modelo `embeddinggemma`
  (botón «Descargar el modelo» o `ollama pull embeddinggemma`). Prompts de EmbeddingGemma:
  documentos «title: … | text: …», preguntas «task: search result | query: …». ~21.000 trozos;
  con la RTX 3050 ~9 min la primera vez; luego solo lo nuevo (hash FNV de cada trozo). Se pone al
  día 60 s después de arrancar (si ya se preparó y Ollama responde) y después de cada reemplazo.
  Resultados: el mejor trozo de cada texto, 100 como mucho, con los mismos filtros.


La 0.3.1 solo cambia el nombre a **Gaudiya Vaisnavas DB** y lleva las copias automáticas a
Documentos (ver Historial). Novedades de la 0.3.0 (formato de base de datos 4):
- **Copias de seguridad** automáticas y **restaurar** desde Ajustes (ver punto 1).
- **Versiones anteriores** de cada texto y ficha (menú «…» del lector y de la ficha, y botón derecho):
  se guarda cómo estaba antes de cada cambio (una versión cada 10 min como mucho, las 30 últimas);
  volver a una versión también se puede deshacer.
- **Calendario vaiṣṇava** en Inicio: hoy y los próximos 30 días. El usuario sigue un calendario
  Gauḍīya que exporta en **.ics** (`gaudiya_calendar.ics`): se importa en Ajustes › General o
  arrastrándolo a la ventana, y **sus fechas mandan** (Ekādaśī, Pāraṇa, festivales, Āvirbhāva /
  Tirobhāva enlazados con las fichas por el nombre; si hay fichas repetidas, gana la de la Paramparā).
  Lo que no está en él se calcula (marcado ≈): tithi al amanecer en Māyāpur, leído de los campos
  Aparición / Desaparición. Ajustes muestra los nombres del calendario que no tienen ficha.
- **Ficha**: día lunar bajo las fechas; guru y discípulos como enlaces (también «Rupa Gosvami (diksa);…»),
  y si el campo está vacío, los de la Paramparā; **etiquetas** (filtro en la barra lateral);
  **galería de imágenes** (ampliar, usar como principal, quitar); exportar con sus textos; imprimir.
- **Ajustes › Revisar**: ayudante de **fichas repetidas** (57 grupos; uno a uno: unir / son distintas /
  saltar; nunca marca nada solo), **títulos dudosos** (renombrar ahí mismo) y **textos vacíos**.
  Los títulos «ÃTHE…» y en fuente Balaram se arreglan solos al abrir.
- **Línea de tiempo** y **árbol dibujado** de la Paramparā (botones en Inicio).
- Búsqueda: filtros **Solo Guru Paramparā** y **Notas / PDF / Word**.
- **Exportar todo a Markdown** (Ajustes › General): carpetas Fichas/ y Textos/ para Obsidian.
- **Aviso de versión nueva** (GitHub, una vez al día) y botón en Ayuda; abre la descarga del instalador.

Lo de antes:

- **Fichas**: nombre, otros nombres, aparición, desaparición, lugar, guru, discípulos, obras,
  notas y **una imagen** (pinchar en el cuadro grande; se guarda en `person_photos`).
- **Personas en dos grupos**: **Guru Paramparā** (árbol guru → discípulos, plegable) y
  **Otros vaiṣṇavas** (por orden alfabético). Se ordena **arrastrando con el ratón**: encima de una
  ficha = su discípulo; en el borde de arriba / abajo = antes / después; a «Otros vaiṣṇavas» = sacarla
  (sus discípulos suben a su lugar). También en el menú del botón derecho. Tabla `person_tree`
  (DATA_VERSION 3); al unir o borrar fichas el árbol se mantiene. La primera vez se rellena sola con
  la línea habitual desde Śrī Caitanya (`PARAMPARA` en `store.rs`, meta `parampara_seeded`;
  `seed_parampara_once` en `main.rs`, al arrancar y al terminar una importación, solo si ya hay fichas).
  El arrastre está hecho a mano (mousedown/mousemove): el arrastre del navegador no funciona porque
  Tauri lo usa para importar archivos.
- **Estilo de la app** (Ajustes › General): **«VS Code» por defecto** (colores Dark/Light Modern de
  VS Code, letra Segoe UI, esquinas rectas, sin degradados) o «Clásico (anterior)». Es solo CSS:
  bloque `data-skin="vscode"` al final de `styles.css`; `index.html` lo aplica antes de pintar.
- **Una ficha con un solo texto** lo muestra directamente; con varios, tarjetas.
- **Unir fichas** (sugiere nombres parecidos; nunca marca nada solo). Al unir, los textos y la
  imagen pasan a la ficha que queda y los nombres van a «otros nombres».
- **Nombres como enlaces**: si un texto menciona a alguien con ficha, el nombre se subraya y
  lleva a su ficha. Solo nombres de **2 o más palabras** (los de una, como «Yamuna» o «Rupa»,
  darían enlaces falsos), la primera vez que aparecen, y nunca la propia ficha del texto.
- **Lector** con tres estilos (Ajustes): **«Editor» por defecto** (Markdown visible como en
  VS Code: letra de ancho fijo, `##` azul, `código` naranja), Literata e Inter.
  Resaltado de la búsqueda, marcadores, índice de secciones, visor del **PDF original**.
- **Atrás / Adelante**: flechas de la barra superior, `Alt+←/→` y botones laterales del ratón;
  al volver a un texto se abre en la sección que se estaba leyendo.
- **Notas de Obsidian limpias**: sin `> [!example]` ni `>` (`text::strip_callouts`): el título del
  callout pasa a `## NOMBRE`. Se aplica al importar y se aplicó una vez a todo lo ya importado.
- **Importar** carpetas o archivos (también arrastrando a la ventana), **editar** textos y datos,
  **papelera**, **copia de seguridad**, español / inglés, tema claro / oscuro, ventana estrecha.

### Datos importados la primera vez (en este orden)
`Obsidian\Biografias` (1.810 notas en carpetas A–Z), `Vaisnava's Biographies` (Calibre, 388 PDF),
`Calibre\Yogi Library\Vaisnava's Biographies` (6), `Obsidian\Goswami Grantha\BIOGRAPH` (103 .DOC).
Resultado: 2.301 textos, 1.883 fichas, 7 duplicados omitidos, 0 fallos.

---

## 6. El usuario y cómo trabajar con él

- Habla **español** y **no es programador**: explicar en lenguaje claro, sin jerga.
- Le gusta leer el texto **tal como se ve en VS Code** (estilo «Editor») y **evitar clics**
  innecesarios (por eso la ficha con un texto lo muestra directamente).
- **No subir a GitHub hasta que lo haya revisado.** Commit / push / release solo cuando lo pida.
- Prueba la app a la vez que se trabaja: si se automatiza la interfaz, puede haber clics suyos
  mezclados; avisarle.

---

### Rellenar fichas a partir de los textos (cómo se hizo, para repetirlo)

Se hizo el 26-10-2026 con las 33 fichas de la Guru Paramparā. Los textos son prosa libre
(«was born in 1426 Saka…», «disciple of…»), así que no sirven reglas automáticas: **Claude lee
los textos** y escribe los datos. Pasos:

1. **Exportar** (solo lectura): un test temporal `#[ignore]` en Rust abre
   `%APPDATA%\com.whispers.biodata\biodata.db` en modo lectura y escribe, por ficha, un archivo
   `p<id>.txt` con sus textos (primero las notas de Obsidian, luego Goswami Grantha, luego Calibre;
   hasta ~25.000 letras por texto) y un `index.tsv` (id, nombre, padre en el árbol, campos actuales).
   Fichas de la Paramparā: `SELECT … FROM person_tree t JOIN persons p ON p.id = t.person_id`.
2. **Resumir**: un script de Node deja de cada ficha el comienzo (~3.500 letras) + las frases con
   palabras clave (born, appear, disappear, departed, initiat, disciple, guru, father, mother,
   village, wrote, Saka, A.D., tithi, manjari…). Unas 7.000 letras por ficha.
3. **Leer y anotar** en JSON: `{id, name, aka, appearance, disappearance, place, guru, disciples,
   works, notes}`. Criterios: en inglés como los textos; solo lo que dicen los textos (si no
   aparece, vacío); si las fuentes difieren, las dos («1500 (otra fuente: 1503)»); dīkṣā / śikṣā /
   sannyāsa indicados; en notas: padres, hermanos, identidad en Kṛṣṇa-līlā y hechos principales;
   avisar en notas si un texto es de otra persona con el mismo nombre. No poner en «otros
   nombres» palabras genéricas (Avadhuta, Namacarya…): ese campo se usa para unir textos.
4. **Guardar**: otro test temporal hace primero `VACUUM INTO "biodata antes de rellenar fichas.db"`,
   comprueba que el nombre de cada id coincide, **solo rellena campos vacíos** y guarda con
   `store::update_person` (así se actualiza también la búsqueda `persons_fts`).
5. Borrar los tests temporales (`git checkout src-tauri/src/search.rs`) y avisar al usuario de que
   reabra la app (si edita una ficha que tenía abierta podría pisar los datos nuevos).

Para «Otros vaiṣṇavas» (~1.850 fichas, 1.539 con menos de 2.000 letras) el usuario prefirió no
hacerlo de momento por el tiempo y el uso de Claude; si se hace, por tandas y con ayudantes en paralelo.

---

## 7. Pendientes e ideas

### ▶▶▶ Para la próxima sesión (después del 07-11-2026) — LEER CONTINUAR.md
**Terminados los Textos principales de las 38 fichas del árbol** que no lo tenían (tandas 1–10, scripts `tp*.json`,
`tp*/`, `tp*-arbol.mjs`, `tp-unir.json`, `tp-separar.json`, `tp9-separar.json`). Quedan para preguntar a Whisper: las
fichas vacías desde la importación (119, 412, 1301, 1556, 1558, 1616, 1957 — la 1956 Rādhikāvilāsa ya **no** se
borra: es el guru de Ramahari #1860), la propuesta 1776 (Kānāi Ṭhākura #665 ¿= Kānu #677?) y las líneas del árbol
marcadas «discutidas» el 07-11 (332, 522, 308, 160, 1956). Siguiente trabajo posible: Textos principales de las
fichas más largas **fuera** del árbol, o las ~600 del Vaiṣṇava-maṇḍala por fuentes. Detalle en `CONTINUAR.md` (local).

### ▶▶ (antiguo) Para la próxima sesión (después del 05-11-2026) — LEER CONTINUAR.md
Publicada la **0.12.3** (ir a una ficha por «#número»). Biografías por grupos: hechos Purī 1–3 y el círculo de
Nityānanda (doce gopālas, familia); siguiente, **los asociados de Advaita**. Fichas repetidas pendientes de que
Whisper las una: #5/#6, #207/#208/#1814, #1139/#1129, #576/#574, #1703/#1880/#1701, #664/#677, #1437/#1833.
Detalle en `CONTINUAR.md` (local).

### ▶ Para la próxima sesión (después del 04-11-2026) — dónde nos quedamos
- **Publicada la 0.11.0** en GitHub (Tīrthas, satélite, Inicio nuevo; formato 8). Whisper actualiza desde
  la app (actualizador). La 0.11.1 (puntos de distrito en el mapa + arreglo de «Abiertos recientemente»)
  se prepara al final del 04-11: comprobar si quedó publicada (`gh release list`).
- **Tīrthas en la BD de Whisper: 86** (tandas 1–8 de `scripts/datos/lugares-N.json`). Versión publicada:
  **0.11.2**. Cómo se hace una
  tanda: leer el Abhidhāna (`C:\Users\Yoges\Desktop\BIOGRAPHYS\Abhidhana_Part4_Tirthas_Bengali.txt`; scripts
  en `scripts/datos` `heads2.mjs` (cabeceras), `look.mjs`, `ctx.mjs` (líneas alrededor), `grepnear.mjs`
  (términos con contexto)) → buscar ids de fichas en la app de
  pruebas → escribir `lugares-N.json` en **inglés** (solo lo que dice el libro; coordenadas aproximadas
  puestas por Claude) → ensayo en la copia (2 pasadas) → tabla resumida a Whisper → Whisper cierra la app →
  copia «antes de …» (`backup.mjs`: VACUUM INTO en Documentos › … › Copias de seguridad) → abrir su app con
  `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9334` → `node scripts/datos/lugares.mjs
  <json> 9334` (2 pasadas) → recargar.
- **✔ 1.º HECHO (04-11, sin publicar): cómo se leen los textos en la ficha.** Se le enseñaron 3 propuestas
  (página HTML con el texto de Śrīvāsa: A libro Literata, B editor más pequeño, C libro con índice) y eligió
  **«A con la C»**: en la ficha de un solo texto, todo seguido (fuera tarjetas y «Leer todo»), Literata
  18 px fijos, ~68ch, justificado con guiones (`lang="en"`), títulos en versalitas de color, párrafos que
  son una cita entera en cursiva con sangría (`SectionView book` → `p.quote`), adorno «❦ v.2 ❦» entre
  versiones (los trozos «v.3 · 2» siguen sin adorno), índice «En este texto» a la izquierda (`.book-nav`;
  versiones o, si no hay, los títulos), lápiz/papelera de cada versión al pasar el ratón; personas del mismo
  nombre numeradas («Isana 1, 2, 3»). El lector completo sigue con su estilo de Ajustes. Código:
  `PersonView.tsx` (`cardLabels`), `Reader.tsx` (`book`), CSS `.book-layout/.book-orn` (sustituye a
  `.entry-card*` e `.inline-outline`).
  **También (Whisper):** fuera los estilos de app «VS Code» y «Clásico»: solo **Windows 11** (`skin`
  fijo `"fluent"` en `App.tsx`, quitada la fila de Ajustes y el CSS `data-skin="vscode"`).
  **Mapa satélite más fluido (Whisper: «al hacer zoom va lento y petea, ¿una caché?»):** las teselas van
  por la app: `http://bio.localhost/tile/z/x/y` → `tiles.rs` las busca en **«biodata-mapa.db»** (junto a la
  BD; derivado, no va en copias, se puede borrar) y si no están las baja de Esri (ureq con feature `tls`) y
  las guarda; solo las que se ven, nada por adelantado. El protocolo `bio` es ahora asíncrono (un hilo por
  petición). En `Panorama.tsx` las teselas siguen la vista 140 ms después de parar la rueda (`tileView`) y
  las anteriores quedan debajo (`layers.under`) hasta que llegan las nuevas: sin huecos ni parpadeo.
  Medido: 1.ª vez ~210 ms, desde el disco ~4 ms; sin internet salen las ya vistas.
  **Enlazar un nombre a mano (pedido por Whisper, después de hacer el instalador 0.11.3):** texto seleccionado
  (≤ 80 letras) en la ficha o el lector → botón derecho «Enlazar con una ficha…» / «Crear ficha «X»…» →
  `LinkNameDialog` (`Dialogs.tsx`): escribe en ese sitio `[[Nombre#ficha-ID|texto]]` (`findSpot` busca la
  aparición cuyo texto alrededor se parece más a lo visto; salta las que ya son enlace; `saveSection` guarda
  versión). Whisper eligió: por defecto solo ahí, con casilla «Enlazar también en todos los textos» (añade el
  nombre a «otros nombres»; los de una palabra no se enlazan solos, `personLinks.ts`). `markdown.ts` (`FICHA`)
  convierte `#ficha-ID` en `data-person` (abre esa ficha aunque haya un texto o una persona del mismo
  nombre); en Obsidian es un enlace normal. Probado en la copia: «Śacīdevī» → Śacī Devī (1336).
  Pendiente menor: tras enlazar, la ficha vuelve arriba del texto.
  **«Crear ficha con este texto» (Whisper: «cortar y borrarlo del sitio, así iría organizando»):** trozo largo
  seleccionado (no parece un nombre) → menú «Crear ficha con este texto…»; y botón 👤+ en cada entrada de la
  ficha (junto al lápiz). Abre el formulario normal de ficha nueva (`PersonDialog` con `prefill` {nombre del
  texto, notas = el trozo} y `from`), con la casilla «Quitar este trozo del texto de X» marcada: al guardar,
  `cut_text` (`store::cut_text`/`take_fragment`, versión anterior guardada) lo saca del texto.
  **Arreglado un fallo de `find_fragment`** (también afectaba a «Mover a otra ficha»): buscaba por las 6
  primeras palabras y en Govinda («GOVINDA He was a disciple of…» ×9) cortaba desde la entrada anterior.
  Ahora busca el trozo entero palabra por palabra y, si no está tal cual, por el principio (6) y el final
  (3) eligiendo el tramo de largo más parecido. Prueba `a_piece_is_found_whole_not_by_its_start`.
- **✔ 2.º, grupo 1 HECHO EN LA COPIA (04-11, sin aplicar en la BD de Whisper): los Seis Gosvāmīs.**
  Decisión técnica: el texto principal es un doc más de la ficha en la colección **«Texto principal»**
  (`MAIN_TEXT` en `api.ts`), SIN cambio de formato. `PersonView`: si la ficha tiene uno, se lee él (como libro,
  todas sus partes seguidas, sin tarjetas ni barra de partes, sin quitar títulos) y los demás textos van
  debajo en `<details>` «Otras versiones (N)». Textos en `scripts/datos/gosvamis/main-<id>.md`; cambios de
  campos en `scripts/datos/gosvamis.json`; se aplican con `node scripts/datos/textoprincipal.mjs
  gosvamis.json gosvamis [puerto]` (comprueba nombres; 2 pasadas = la 2.ª no cambia nada; ojo: un texto
  > 24 KB se guarda en varias partes: el script compara todo y al reemplazar vacía antes las partes viejas).
  **Regla nueva de Whisper (04-11): el Abhidhāna manda** — su versión va al campo y al texto, la otra se anota
  con su fuente, y se corrige sin preguntar (memoria `abhidhana-source`). Cambios de campos del grupo 1:
  Jīva fechas 1433–1518 Śaka y discípulos (fuera Gopāla Bhaṭṭa, era un error de lectura); Rūpa aka Dabira Khāsa
  (no Sakara Mallika) y fechas de la tabla del Abhidhāna 1392–1476 Śaka; Sanātana aka Sākara Mallika; Raghunātha
  Bhaṭṭa aka Bhaṭṭa Raghunātha; Raghunātha dāsa guru dīkṣā Yadunandana Ācārya (Abhidhāna) y fecha 1428 Śaka;
  Gopāla Bhaṭṭa desaparición Āṣāḍha **Śukla** Pañcamī 1507 Śaka y discípulo Gopīnātha Pūjārī. El Abhidhāna
  se contradice: título de Sanātana (entrada Jīva: Sākara Mallika; entrada Sanātana: su puesto era «Dabir Khās»)
  y fecha de Sanātana (entrada ~1410 Śaka; tabla 1383): se usó la entrada y se anotó lo otro.
  Para aplicarlo en la BD de Whisper hace falta antes la versión con la vista del texto principal (0.11.4).
- **✔ Grupo 1 aplicado en la BD de Whisper (04-11, tras instalar la 0.11.4).** **Grupo 2 (círculo de los
  Gosvāmīs) HECHO EN LA COPIA:** Anupama 56, Kumaradeva 808, Lokanātha 844, Kṛṣṇadāsa Kavirāja 759,
  Bhūgarbha 150, Gopīnātha Pūjārī 386 (`circulo.json` + `circulo/`). Del Abhidhāna: Lokanātha n. ~1405 Śaka,
  salió de casa Agrahāyaṇa 1431, m. 1510 Śaka, guru Mahāprabhu (Prema-vilāsa 20; la ficha tenía Sanātana),
  4 hermanos; Bhūgarbha = tío paterno de Lokanātha; Kavirāja n. 1428 Śaka, discípulos Mukunda dāsa y
  Viṣṇudāsa (fuera Mīnaketana Rāmadāsa: era sirviente de Nityānanda); Kumudānanda (o Mukundānanda).
  El último texto de Lokanātha lleva pegada la biografía de Locana dāsa (ya está en la ficha 1845).
- **▶ 2.º «Texto principal» por ficha + Abhidhāna, JUNTOS y por grupos (Whisper: «Junto, por grupos»),
  primero los Seis Gosvāmīs.** Fichas como Śrīvāsa tienen varias versiones que repiten lo mismo (v.1, v.2,
  v.3, v.3·2). Plan acordado: Claude (no la IA local: qwen 4B se inventa cosas) lee todas las versiones y
  escribe UN texto principal en inglés, ordenado (vida, familia, guru y discípulos, obras, identidad en
  Kṛṣṇa-līlā), sin repetir y sin perder datos; si las versiones discrepan, las dos con su fuente; añade lo
  del Abhidhāna. La ficha muestra ese texto directamente; **las versiones originales NO se borran**: quedan
  tras «Otras versiones (N)» y la búsqueda las sigue encontrando. Hace falta en la app: marcar un texto
  como principal (¿campo nuevo → DATA_VERSION 9, o una etiqueta/colección «Texto principal» sin cambiar el
  formato? decidir) y la vista «Otras versiones». Por grupo: Whisper revisa → copia → guardar.
- **▶ 3.º el Abhidhāna de BIOGRAFÍAS** (dentro del 2.º) (`Abhidhana_Part3_Biographies_Bengali.txt`,
  ~130.000 líneas para los scripts; OCR a dos columnas). Whisper da por terminados los lugares (Part4).
  Método acordado: **por grupos, empezando por los Seis Gosvāmīs** (Rūpa 1325, Sanātana 1353, Jīva 618,
  Raghunātha Bhaṭṭa 1202, Raghunātha dāsa 1206, Gopāla Bhaṭṭa 343) y su círculo (Anupama 56, Kumāra,
  Śrī Vallabha, Lokanātha 844, Kṛṣṇadāsa Kavirāja 759…). Por persona: sacar su entrada (OJO: las de los
  grandes son ensayos largos repartidos; buscar la cabecera «Nombre—» con `heads2.mjs` cambiando el archivo
  a Part3, y `grepnear.mjs`), comparar con la ficha (fechas, guru, discípulos, lugar, obras, familia) →
  tabla a Whisper: «lo que añade» (solo campos vacíos, en inglés, con la fuente «Gauḍīya Vaiṣṇava
  Abhidhāna») y «dónde no coincide» (solo avisar: el Abhidhāna NO corrige a B. V. Tīrtha ni a la
  Gaura-gaṇoddeśa-dīpikā; si es conflicto real, las dos versiones en notas con su fuente) → Whisper
  decide → script en `scripts/datos/` (2 pasadas) con copia antes, en su app (puerto 9334).
- **Lo siguiente en lugares** (más adelante): (1) más pueblos de Bengala de las fichas sin punto (lista con
  `unmapped.mjs`: Talakhaḍi (ilegible en el OCR), Guptipāḍā, Teṅga-Vaidyapura, Khālihāṭi, Sandvīpa…);
  (2) sitios de toda la India donde estuvo Mahāprabhu (Vārāṇasī, Prayāga, Gayā, viaje al sur: Śrī Raṅgam,
  Uḍupī, Paṇḍharapura…); (3) Navadvīpa: Śrīvāsāṅgana y otros sitios disputados (anotar las dos versiones).
- **Pendiente de Whisper (unir o no):** Jayakṛṣṇa dāsa Bābājī 606/1830 (samādhi en Kāmyavana sin enlazar),
  Śaṅkarāraṇya 1368/1369 (Cātarā), Rāmāi 1242/1268/1859, Viṣṇupriyā 1715/1881, Śacī 1336/1864, Gaura Kiśora
  1819/314, Sārvabhauma 1381/1657, Sāraṅga 1378/1379, Narahari 979/980, Anupama 55/56, Gadādhara dāsa
  272/1815, Bhāgavata Ācārya 105/1791, Jayadeva 597/598. Nārāyaṇī (1006/1007) sin enlazar en Māmagāchi.
- **Criterios de Whisper** (memoria `conflicting-sources`): fuentes que no coinciden → la versión más
  aceptada en el campo y la otra en notas con su fuente; si la ficha mezcla varias personas → separar.
- Recordar: el número de un punto del mapa son **fichas**, no lugares. Un clic acerca, doble clic baja.

### Hecho el 04-11-2026 (sin publicar): **Lugares**, DATA_VERSION 7
- Whisper eligió «apartado propio». Tablas nuevas `places` (name, aka, region, location, about, source,
  lat, lon) y `place_persons` (place_id, person_id, role ∈ sripata|samadhi|birth|lived|other).
  Código: `src-tauri/src/places.rs` (+3 pruebas), `src/places.ts` (reconocer un lugar escrito de varias
  formas: palabras sin «a» final y sin espacios), `components/PlaceView.tsx`, `PlaceDialog` en `Dialogs.tsx`.
- Uniones / deshacer unión / borrar ficha llevan también sus lugares (`MergeUndo.places`, con
  `serde(default)` para uniones viejas). Versiones: `history.kind = 'place'` (borrar un lugar se deshace
  desde «Versiones anteriores»). `restore_version` ya no trata un tipo desconocido como ficha.
- Barra lateral: grupo «Lugares» (con +) debajo de «Vaiṣṇava-maṇḍala»; el filtro busca también en lugares.
  Ficha: tarjeta «Lugares» (los que la listan + los que nombra su campo «Lugar»). Mapa: los lugares con
  coordenadas se suman a `PLACES` (o ocupan su punto); «Ver en el mapa» / «Abrir el lugar».
- Ficha: las tarjetas cortas fluyen en columnas (`.facts-flow`, CSS `columns`): sin huecos (lo pidió Whisper).
- Mapa: zoom hasta ×40; desde ×2 los puntos no crecen (los pueblos cercanos se separan).
- Después de instalar la 0.10.0 (sin instalador aún): al pulsar un punto del mapa la página baja lo justo
  para ver sus personas (`.map-picked`, `scrollIntoView` «nearest»); antes quedaba fuera de la pantalla.
- Probado en una copia (scratchpad) con app:dev. Versión **0.10.0** (instalador hecho el 04-11, sin publicar).
- **Lugares, tanda 1** (Whisper la revisó: «sí, así»; textos en **inglés**): `scripts/datos/lugares-1.json`
  (12 lugares: Jājigrāma, Kāñcanagaḍiyā, Āṭapura, Budhurī, Saptagrāma, Māliháṭi, Varāhanagara, Khānākula,
  Jhāmaṭapura ×2, Kenduli, Khaḍadaha) + `scripts/datos/lugares.mjs <json> [puerto]` (por nombre; dos
  pasadas = la segunda no cambia nada). **Aplicada en la app de Whisper** (0.10.0 instalada el 04-11
  con «Do not uninstall»; copia «antes de la 0.10.0» en Documentos).
  Búsqueda en el libro: scripts del scratchpad `look.mjs` (cabeceras), `ctx.mjs` (líneas alrededor).
- **Datos cambiados en la BD de Whisper (04-11, copia «antes de Jayadeva y Ravi Raya»)**, script
  `scripts/datos/jayadeva-ravi.mjs`: 598 Jayadeva (el poeta, s. XII) sin guru y fuera de la Paramparā
  (estaba bajo Śrīnivāsa: imposible; venía del *Jayadeva-caritra* de Vanamālī dāsa, discípulo de
  Śrīnivāsa; no hay un Jayadeva discípulo de Śrīnivāsa en las fuentes; sí un Jayadeva dāsa discípulo de
  Rasikānanda, sin ficha); 597 Jayadeva Gosvāmī sin guru «Lakṣmaṇ Sen» (era su rey); 1317 Ravi Rāya guru =
  Narottama + en notas la variante del Abhidhāna (Śrīnivāsa) — Whisper: registrar las dos con su fuente.
- **Hecho (sin instalador aún):** punto elegido en rojo con aro y encima de los demás; lista «Lugares»
  ordenada sin diacríticos; **modo satélite** (`tilesFor` en `Panorama.tsx`: teselas Esri por sus cuatro
  esquinas, capa gruesa (nivel −2) debajo de la fina, ≤60 teselas, zoom hasta ×400; sin internet → aviso y
  dibujo; `localStorage bio.mapStyle`). CSP es `null`: no hizo falta tocar `tauri.conf.json`.
  Probado: a ×400 se ve Jājigrāma junto a la vía Kāṭwā–Bardhamān.
- **Lugares, tanda 2** (Whisper: «vale»): `scripts/datos/lugares-2.json`, 12 lugares grandes de Bengala
  (Ekacakrā, Kheturī, Pānihāṭi, Kumārahaṭṭa, Kulīnagrāma, Śrīkhaṇḍa, Kāṭwā, Ambikā-Kālnā, Śāntipura,
  Rāmakeli, Gopīvallabhapura, Viṣṇupura). Va con la **0.10.1** (satélite + rojo + lista ordenada).
  Avisado sin tocar: repetidas? Narahari 979/980, Anupama 55/56, Gadādhara dāsa 272/1815; Rāmadāsa 1264
  guru Bhūgarbha vs Abhidhāna «discípulo de Śrīnivāsa»; Vṛndāvana dāsa nació en Nati (Abhidhāna) vs Māmagāchi.
  Siguiente: Navadvīpa–Māyāpur (entrada enorme) y luego Vraja / Purī.
- **Aplicado en la BD de Whisper (0.10.1 instalada; copia «antes de Ramadasa y lugares-2»)**:
  tanda 2 de lugares + `scripts/datos/ramadasa.mjs`: 1264 «Rāmadāsa» mezclaba 10 entradas → se queda
  el discípulo de Bhūgarbha (está bajo él en la Paramparā); nuevas 1948 R. (disciple of Śrīnivāsa,
  Viṣṇupura), 1949 R. (son of Śivānanda Sen), 1950 R. (Kuraṅgākṣī), 1951 R. (disciple of Rasikānanda,
  Janhagram; con las 3 citas del Rasika-maṅgala, decidido por Whisper); la entrada «sakhā de Caitanya,
  ver Abhirāma» → Abhirāma Ṭhākura (6) con aka «Rāmadāsa». 1740 Vṛndāvana dāsa: Lugar = Māmagāchi + nota
  «según el Abhidhāna, nació en Nati» (en Kumārahaṭṭa enlazado como «other»). `lugares.mjs` acepta
  también el nombre exacto de la ficha en lugar del id.
- **0.10.2 (04-11):** Inicio nuevo (Whisper eligió «Hoy + leer + del día»): línea «Hoy» (`Calendar`
  con `onOpen`: solo hoy + botón al calendario), Seguir leyendo, Marcadores, «Del día» (una ficha de la
  Paramparā y un lugar con texto, `ofTheDay` por fecha); fuera las cifras (→ Panorama › Estado,
  `StatTiles`), «fichas con más textos» y colecciones. Lateral y árbol: «Paramparā Tree». Mapa: un punto
  de `PLACES` solo lo ocupa el lugar que nombra su **primera** clave (Godrumadvīpa no se queda Navadvīpa).
- **Lugares, tanda 3 (Navadvīpa, 13)**: `scripts/datos/lugares-3.json` (Whisper: «sí, así»). **Aplicada**
  en la BD de Whisper con la 0.10.2 instalada (copia «antes de lugares-3 Navadvipa»): 37 lugares en total.
  Siguiente: Vraja (Vṛndāvana, Rādhā-kuṇḍa, Govardhana…) y Purī / Orissa.
- **0.10.3 (04-11)**: lo de abajo + en «Qué hay allí» los nombres enlazan también sin «Śrī/Śrīla/Śrīmatī»
  y sin importar mayúsculas. **Lugares, tanda 4 (Vraja, 13)**: `scripts/datos/lugares-4.json` (Whisper: «sí»):
  Vṛndāvana, templos de Govindajī, Madana-mohana, Rādhā-Dāmodara, Rādhā-ramaṇa, Gokulānanda, Gopīnātha,
  Śyāmasundara (con sus samādhis), Dhīra-samīra, Kāliya-daha, Keśī-ghāṭa, Rādhā-kuṇḍa, Govardhana.
  Coordenadas de los templos aproximadas (comprobar con satélite). **Aplicada** con la 0.10.5 instalada
  (copia «antes de lugares-4 Vraja»): **50 lugares** en la BD de Whisper. Siguiente: Mathurā, Nandagrāma,
  Varṣāṇā, Gokula…; luego Purī / Orissa.
- **0.10.5** (la 0.10.3 y la 0.10.4 se compilaron pero no se instalaron): además, en el mapa **un clic**
  selecciona y, si hay otros puntos pegados (a menos de 40 px), **acerca el mapa al grupo** (`zoomReq`;
  otro clic, más cerca); **doble clic** baja a sus personas; «Ver en el mapa» también acerca. Zoom máximo
  ≈ 1 km de lado en cualquier mapa (`(e − w) / 0.01`), también en el dibujo. Probado: dos clics en
  Vṛndāvana enseñan los templos separados.
- **Lugares, tanda 5 (Purī y Orissa, 12)**: `scripts/datos/lugares-5.json` (ensayada en la copia; falta el
  visto bueno de Whisper). Jagannātha Purī (fiestas, maṭhas gauḍīyas, tīrthas), Gambhīrā, samādhi de
  Haridāsa, Ṭoṭā-gopīnātha, Guṇḍicā, Narendra-sarovara, Ālālanātha, Beṇṭapura (Rāmānanda Rāya), Kaṭaka,
  Sākṣi-gopāla, Remuṇā (samādhi de Mādhavendra Purī), Jājapura. Kāśī Miśra no tiene ficha.
- **Después de publicar la 0.11.0 (04-11), aplicado en la BD de Whisper:** 278 Gajapati Pratāparudra Deva
  (Whisper unió las tres) ↔ Kāśī Miśra guru/discípulo (`prataparudra.mjs`) y enlazado a Jagannātha Purī;
  **tanda 6** (Vraja II: Mathurā, Madhuvana, Mahāvana-Gokula, Nandagrāma, Jāvaṭa, Varṣāṇā, Kāmyavana) y
  **tanda 7** (Bengala: Cākundi, Agradvīpa, Bāghnāpāḍā, Phuliyā, Kāñcrāpāḍā, Buḍhan, Cātarā, Cāṁpāhāṭi):
  **77 tīrthas**. Avisado: Jayakṛṣṇa dāsa Bābājī 606/1830 vacías, Śaṅkarāraṇya 1368/1369, Rāmāi
  1242/1268/1859; padre de Haridāsa «Smṛti/Sumati» (OCR); Talakhaḍi ilegible.
  `unmapped.mjs` (scratchpad): de 386 fichas con «Lugar», 176 sin punto en el mapa (muchos distritos:
  Faridpur, Pabna, Barisal, Noakhali, Chittagong…; y pueblos sueltos de toda la India).
- **0.11.1 (04-11, publicada en GitHub):** «Abiertos recientemente» olvida los textos que ya no existen
  (daban «Query returned no rows»); **puntos de distrito/región** en el mapa (`DISTRICTS` en
  `Panorama.tsx`, gris azulado, leyenda): una ficha cae en su distrito solo si ningún lugar santo la
  reconoce. Con ellos el mapa pasa de 242 a 319 de las 386 fichas con «Lugar».
- **0.11.2 (04-11, publicada en GitHub):** tipo de relación nuevo **«Discípulo, sin especificar»**
  (`disciple` en `store::TREE_KINDS` y `api.ts`; línea gris en el árbol; no entra en las vistas «solo
  dīkṣā / solo śikṣā»; «(discípulo)» / «(disciple)» tras un nombre lo marca). Lo pidió Whisper: las fuentes
  a veces solo dicen «disciple». Sin cambio de formato. **Tanda 8** (viajes de Mahāprabhu: Gayā,
  Vārāṇasī, Prayāga, Kūrmasthāna, Jiyaḍa-nṛsiṁha, Śrī Raṅgam, Uḍupī, Paṇḍharapura, Rāmeśvara)
  **aplicada** en la BD de Whisper con la 0.11.2 (copia «antes de lugares-8 viajes»): **86 tīrthas**.
- **0.10.6:** tercer mapa **«Vraja de cerca»** (`VRAJA` en `Panorama.tsx`), con su recuadro en el mapa
  grande (`frames`), como el de Bengala (lo pidió Whisper). El clic en un punto enseña primero los lugares a menos de ~10 km (si el mapa muestra mucho
  más que ellos: Navadvīpa y sus islas), y después los que están pegados (< 40 px). Recordar a Whisper:
  el número de un punto son **fichas** (personas), no lugares.
- **(En la 0.10.5)** botón **«Tīrthas»** (lugares) en el lateral y en las
  pestañas de la barra lateral, debajo de «Vaiṣṇavas» (antes «Personas/People»); Whisper eligió estos
  nombres. Los lugares salen ya solo ahí (`PlaceList` en `Sidebar.tsx`: por letras, su filtro, «Nuevo
  lugar»); el grupo «Lugares» de la lista de personas se quitó. Sello y tarjeta de la ficha: «Tīrthas».
- Relaciones con un lugar en sánscrito: Śrīpāṭa, Samādhi, **Āvirbhāva-sthāna**
  (antes «Nació aquí»), **Vāsa-sthāna** (antes «Vivió aquí»), Otros; con su explicación al pasar el ratón
  (`placeRoleHints` en i18n; la de Śrīpāṭa es el texto que pidió Whisper). Los valores guardados no
  cambian (`birth`, `lived`…): solo los nombres que se ven.
  Avisado sin tocar: repetidas? Viṣṇupriyā 1715/1881, Śacī 1336/1864, Gaura Kiśora 1819/314, Sārvabhauma
  1381/1657, Sāraṅga 1378/1379; Nārāyaṇī (1006 nodriza / 1007 vacía) sin enlazar; Mādhava dāsa 860 dice
  Phuliyā (no Kuliyā); el samādhi de Gaura Kiśora: el Abhidhāna lo pone en la ciudad de Navadvīpa.
- **Criterio de Whisper para fuentes que no coinciden:** no «corregir» una con otra; dejar lo más
  aceptado y anotar la otra versión con su fuente. Antes, mirar si la ficha mezcla personas distintas
  (entonces se separa, no es un conflicto).
- (Plan que se siguió) **mapa en modo satélite.** Interruptor «Dibujo / Satélite» en
  Panorama › Mapa; teselas de Esri World Imagery (con su atribución), necesita internet (sin conexión,
  el dibujo); zoom mucho mayor para comprobar las coordenadas de los lugares. Ojo: las teselas son
  Mercator y nuestro mapa es lineal en latitud → o se reproyecta o se usa Leaflet; permitir la URL en la
  CSP de `tauri.conf.json`. Hacerlo después de aplicar los lugares.
- Avisado, sin tocar: 597 y 598 parecen la misma persona; Bhāgavata Ācārya 105 = 1791? (las une Whisper).
- ⚠ Kaspersky bloqueó `bash.exe` (PDM:Exploit.Win32.Generic) por un `node -e` largo: usar PowerShell +
  scripts en archivos.

### Para el 04-11-2026: el **Abhidhāna** en bengalí y la sección «Lugares»
Whisper dejó en `C:\Users\Yoges\Desktop\BIOGRAPHYS\` el *Śrī Śrī Gauḍīya Vaiṣṇava Abhidhāna* (Haridāsa Dāsa)
en texto: `Abhidhana_Part3_Biographies_Bengali.txt` (5,7 MB, biografías) y `Abhidhana_Part4_Tirthas_Bengali.txt`
(2 MB, lugares). Es OCR: columnas mezcladas y letras mal leídas → **no se importa tal cual**, se consulta
entrada por entrada. **Si el Abhidhāna no coincide con una ficha, solo avisar a Whisper** (no cambiar).
Para buscar en él: plegar con NFD, quitar el nukta (়), ī→i, ū→u, quitar ঁ; las entradas empiezan por
«Nombre__distrito…» (o `_`, `-`). Scripts de prueba del 03-11 en el scratchpad (`places.mjs`, `look2.mjs`).

**Plan pedido por Whisper (03-11, noche):**
1. **Sección nueva «Lugares» en el árbol, debajo de «Otros vaiṣṇavas»**: una entrada por sitio con
   **dónde está y qué hay allí**, sacado del Abhidhāna. Ejemplo que dio Whisper:
   - Jājigrāma: en Bardhamān, a 2 millas de la estación de Kāṭwā; es el śrīpāṭa de Śrīnivāsa Ācārya.
   - Kāñcanagaḍiyā: en Murshidabad, a una milla de la estación de Bājārsāhu; es el śrīpāṭa de Dvija
     Haridāsa y de sus hijos Śrīdāsa y Gokula Dāsa, y allí está su samādhi.
   - Āṭapura: en Hugli; es el śrīpāṭa de Parameśvara Dāsa Ṭhākura.
   - Budhurī: en Murshidabad, cerca de la estación de Bhagavāngolā; es el śrīpāṭa de Rāmacandra Kavirāja.
   Por decidir al empezar: cómo guardarlos (¿fichas de un tipo «lugar»? ¿tabla nueva → DATA_VERSION 7 +
   migración?), enlazar cada lugar con las fichas que viven/tienen śrīpāṭa allí, y con el mapa.
2. **Mapa** (`PLACES` en `Panorama.tsx`): de 382 fichas con «Lugar», solo 174 salen en el mapa
   (60 de las 208 que faltan son de la Guru Paramparā). Añadir formas de escribir («Śrī Khaṇḍa», «Kuliā»,
   «Katoa», «Vishnupura», «Khaḍadaha») y lugares nuevos (Khaḍadaha, Saptagrāma, Jājigrāma, Kāñcanagaḍiyā,
   Māliháṭi, Budhurī, Jhāmaṭapura, Bodhakhānā, Āṭapura, Varāhanagara, Kenduli, Khānākula…). Las
   coordenadas no vienen en el libro: las pone Claude (aproximadas) y el libro confirma el sitio.
3. Luego, **los seis Gosvāmīs** (abajo) usando también las biografías del Abhidhāna.

### Para la próxima sesión (después del 03-11-2026) — dónde nos quedamos
Publicada la **0.9.1** (§5). El 03-11-2026 se trabajaron los **datos** de Whisper por grupos, leyendo
notas y textos de cada ficha (detalle en §8, entradas «datos» del 03-11): libros de B. V. Tīrtha y
*Gaura-gaṇoddeśa-dīpikā* (Whisper confía en ambos: si dicen otra cosa, se corrige la ficha), círculos de
Gadādhara, Advaita, Nityānanda y Śrīnivāsa–Narottama–Śyāmānanda, y **15 fichas mezcladas separadas**
(25 nuevas). Cada ronda: copia «antes de …» en Documentos › … › Copias de seguridad.

**Método por grupos (repetirlo igual):** leer en una copia (`node:sqlite`, solo lectura) las fichas
del grupo (nombre, guru, discípulos, notas, textos, sitio en el árbol) → script de CDP que (a) pone en
Guru/Discípulos los **nombres exactos** de las fichas, (b) escribe la familia en Notas con nombres
exactos («Father: …. Son: ….»), (c) quita «discípulos» que eran familia, (d) da un apellido entre
paréntesis a los homónimos para que cada enlace vaya a quien toca («Vīrabhadra (disciple of
Śyāmānanda)») → **ensayo** en otra copia con `npm run app:dev` (dos pasadas: la segunda no debe
cambiar nada) → Whisper cierra → copia → se aplica en su app (puerto 9334). Uniones: se proponen
con tabla «Quedarse con / Unir en ella»; **las hace Whisper**. Fichas que mezclan personas (entradas
«1. 2. 3.» del diccionario): la ficha conserva a quien ya apuntan el árbol o las notas; las demás,
ficha nueva con apellido (Whisper: «sí, todas», aunque sean de una línea). Scripts en
[scripts/datos/](scripts/datos/) (`adv.js`, `nit.js`, `sri.js`, `split.js`, ayudantes y LEEME.md).
⚠ Para cerrar la app de pruebas, matar el proceso por **ruta** (`…\src-tauri\target\…`), nunca por
nombre: `taskkill /IM gaudiya-vaisnavas-db.exe` cierra también la app de Whisper (pasó el 03-11).

**Uniones pendientes que tiene que hacer Whisper** (se las di en tablas):
Kamalākṣa → Śrī Advaita Ācārya Prabhu; Vīrabhadra Gosvāmī + Vīracandra → Vīracandra (Vīrabhadra
Gosvāmī); Duhkhini Kṛṣṇa Dāsa → Śyāmānanda Paṇḍita; Jāhnavā Matta → Jāhnavā Devī (Mātā); Abhirāma Gopāl
Ṭhākura → Abhirāma Ṭhākura; Dhananjaya Paṇḍita,Śrī + Dhananjaya Paṇḍit → Dhananjaya; Paramesvari → Parameśvara
Dāsa Ṭhākura; Kholāvecā → Kholāvecā Śrīdhara; Kāla-Kṛṣṇa → Kālīya Kṛṣṇa Dāsa Ṭhākura; Rāmacandra (Ramai
Gosāi) → Rāmacandra Gosvāmī (Ramai). Comprobar al empezar cuáles hizo (`SELECT id,name FROM persons WHERE id IN (…)`).
⚠ **Śrīnivāsa Ṭhākura (1465) ≠ Śrīnivāsa Ācārya (1466)**: lo decidió Whisper el 02-11. El 03-11 propuse
por error unirlas (el texto de la 1465 cuenta la vida de Śrīnivāsa Ācārya: padres Gaṅgādhara y
Lakṣmīpriyā). Retirada la propuesta: preguntar a Whisper si ese **texto** se mueve a la 1466 y qué
persona es la 1465 (guru: Mahāprabhu).

**Lo siguiente (orden que pidió Whisper):**
1. **Los seis Gosvāmīs de Vraja** (Rūpa, Sanātana, Jīva, Raghunātha Bhaṭṭa, Raghunātha dāsa, Gopāla
   Bhaṭṭa) y su círculo: familias (Kumāra, Anupama/Vallabha, Govardhana Majumdar…), discípulos, homónimos.
2. **Los devotos de Navadvīpa** (Śrīvāsa y sus hermanos, Murāri Gupta, Mukunda Datta, Gaṅgādāsa,
   Candraśekhara, Jagannātha Miśra/Śacī, Viṣṇupriyā…). Por mirar ya anotado: Vāṇīnātha 1641/1638/265,
   Gopāla 365 vs Gopāla Miśra 358, Bholanātha 147/148.
3. **El resto**: otros grupos (asociados de Purī, de Orissa, la línea de Viśvanātha/Baladeva, los del
   siglo XIX–XX), y luego lo de abajo (revisar, años, mapa).

### Antes: para la sesión después del 02-11-2026, noche
Publicada la **0.9.0** (DATA_VERSION 6, sin cambio de formato desde la 0.7.0). El 02-11-2026 fue un
día largo: se publicaron de la 0.7.4 a la 0.9.0 (§5 «Novedades», §8 «Historial») y se arreglaron
muchos datos de Whisper con su app (§8, entradas «datos»). Whisper dice: «ya estamos casi».

**Hecho hoy, en resumen.** Programa: Homónimos → «Vaiṣṇava-maṇḍala» (un grupo por nombre); tarjetas
en el texto de la ficha (una por persona/entrada, «Leer todo», papelera por tarjeta); barra fija y
«Arriba»; búsqueda en notas/datos de las fichas; deshacer «No son la misma persona» y **deshacer la
unión**; filtro de Personas con el nombre primero; guru **por tipo** y discípulos agrupados en la
ficha; Ajustes siempre visible; volver a Revisar sin perder la comprobación y «＋ Escribirlo también
en…» por línea; **Panorama** (Estado, Mapa, Ramas, Año vaiṣṇava, Obras) y «Coincidieron en vida».
Datos (con copia antes de cada cambio en Documentos › … › Copias de seguridad): fechas de 20 fichas;
1.227 textos cortos → Notas y 7 fichas nuevas; deshecha a mano la unión de Nārāyaṇa; otros nombres
de gurus; nombres raros unidos; árbol corregido (Mādhavendra, Keśava Bhāratī = sannyāsa, Prabhupāda,
Sāraṅga Gosvāmī, 15 asociados de Mahāprabhu, Nityānanda con las dos versiones); «Por verificar».

**Decisiones de Whisper que hay que respetar:**
- Śrīnivāsa Ācārya (1466, de Gopāla Bhaṭṭa) y **Śrīnivāsa Ṭhākura** (1465, de Caitanya) son personas
  distintas (Whisper las renombró así); también los tres Vīrabhadra y los dos Vṛndāvana dāsa.
- Nityānanda: Mādhavendra Purī como línea principal + Lakṣmīpati Tīrtha como «otro guru» (dīkṣā
  según el Bhakti-ratnākara), con nota. Ramahari ← Jagannātha dās Bābājī y Gaura dāsa bābājī
  (Nandagrāma) ← Sanātana: etiqueta «Por verificar» hasta tener la fuente.
- Las fichas repetidas las une Whisper (ahora con «Deshacer la unión»). Nunca unirlas Claude sin
  que lo pida.

**Lo siguiente (orden propuesto):**
1. **Whisper revisa** con la 0.9.0: Ajustes › Revisar › Comprobar los datos, línea a línea con
   «＋ Escribirlo también en…» (los dos grupos grandes: «Su guru no lo tiene en Discípulos» ~290 y
   «Su discípulo no lo tiene en Guru» ~107). **No hay botón para todos a propósito**: probado en una
   copia, metía errores de los campos (Gaṅgā Dāsa como guru de Mahāprabhu, etc.).
2. Después, **Pasar la Guru Paramparā a las fichas** (copia el árbol, ya revisado, a las fichas). Si
   Whisper pega la lista que enseña, revisarla antes como el 02-11 (errores del árbol → corregir el
   árbol primero; el botón es todo o nada).
3. **Años**: Panorama › Estado muestra que solo ~13 % de la Guru Paramparā tiene algún año (98 %
   tiene guru, 55 % lugar). Es lo que más falta; con años mejoran «Coincidieron en vida», la línea de
   tiempo y el Año vaiṣṇava. Se puede hacer como las 20 fechas del 02-11 (Whisper da una lista
   verificada → Claude la aplica con versión) o con la IA de Rellenar fichas.
4. **Mapa**: de 144 fichas con «Lugar», 85 salen en el mapa; añadir lugares a `PLACES` en
   `Panorama.tsx` (mirar qué escriben las que no salen).
5. Ideas pendientes: en las tarjetas, fuentes (CC, Bhakti-ratnākara…) aparte y «Hacer ficha propia»
   por tarjeta (con `move_text`); limpiar subtítulos «## p. 1» de los PDF; Rellenar fichas con IA
   (iba por ~600 de 986); OCR del único PDF escaneado; firma digital del .exe.

**Cómo se cambiaron los datos de Whisper (para repetirlo):** Whisper cierra su app → copia de
`%APPDATA%\com.whispers.biodata\biodata.db*` a Documentos › Gaudiya Vaisnavas DB › Copias de
seguridad › «antes de …» → se abre **su** app instalada con
`$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--remote-debugging-port=9334'; Start-Process
"$env:LOCALAPPDATA\Gaudiya Vaisnavas DB\gaudiya-vaisnavas-db.exe"` → un script por CDP llama a las
órdenes de la app (`update_person`, `set_links`, `set_tree_kind`, `new_person`, `merge_persons`…;
cada ficha guarda su versión) **comprobando antes** que cada ficha es la esperada → se comprueba →
Whisper cierra y vuelve a abrir la app normalmente. Siempre ensayar antes en una copia con
`BIO_DB` + `npm run app:dev`. Para leer sin app: `node:sqlite` (Node 24) sobre una copia, solo lectura.

### Hecho el 02-11-2026, publicado en la 0.8.2
1. `Sidebar.tsx`: el filtro separa `shown` (nombre / otros nombres) y `mentions` (solo `searchPersons`
   por sus campos), con el título `t.filterMentions`; `listRoot` sube la lista al cambiar el filtro.
2. `calendar::PersonIndex` guarda también `whole` (la clave entera, con títulos) y `find` la prueba antes
   que `loose_words` si un solo registro la tiene. Prueba en `calendar.rs` (Śrīnivāsa Ācārya / Ṭhākura).
   Con los nombres nuevos de Whisper los avisos de la comprobación bajaron de 559 a 471.

### Hecho el 02-11-2026, publicado en la 0.8.1
1. **Deshacer la unión** (`store::merge_snapshot`, `list_merges`, `undo_merge`): antes de unir se guarda
   en `history` (kind `merge`, target = la que se queda) un `MergeUndo` en JSON: campos de la que se
   queda, y de cada ficha que se va sus campos, textos, imágenes, foto (hex), parejas distintas; y las
   filas de `person_tree` alrededor (ellas, sus discípulos y sus hermanos) y sus `person_links`. Deshacer
   vuelve a crear las fichas **con su mismo número**, devuelve todo y la que se queda vuelve a sus campos
   (lo de ahora como versión). Prueba `a_merge_can_be_undone`. Sin cambio de DATA_VERSION (solo filas de
   `history`). Las uniones hechas antes de la 0.8.1 no se pueden deshacer así.
2. **Vaiṣṇava-maṇḍala** (`Sidebar.tsx`, `mandala`): todas las fichas fuera del árbol agrupadas por
   `namesakeKey`; grupos de 2 o más con subtítulo (`.namesake-group`). La etiqueta «Homónimos» ya solo
   significa «otra persona con el mismo nombre: sin rojo» (textos `toNamesakes…` cambiados).

### Hecho el 02-11-2026, publicado en la 0.8.0
1. **Tarjetas** (`PersonView.tsx`, idea de Whisper con Balarāma Dās): si el texto tiene partes unidas
   (≤ `MAX_CARD_PARTS` = 40, y no son páginas «p. N» de un PDF) se cargan todas; `entriesOf` las corta
   otra vez donde un subtítulo solo repite el nombre de la ficha o de la parte. Con 2 o más entradas
   (`cards`) se ven como tarjetas en vez del desplegable de partes. Vista previa de `CARD_PREVIEW` = 250
   letras en texto plano (`plainText`); las cortas (≤ 310) se ven enteras. `same`: misma frase de inicio
   que una tarjeta anterior → «igual que la entrada N» (en Balarāma Dās, la 4 y la 5 están repetidas en
   los datos). El índice lateral no sale con tarjetas. Papelera por tarjeta (idea de Whisper):
   `deleteCard` quita sus líneas [`from`, `to`) de la parte y la guarda con `save_section` (guarda la
   versión anterior); `store::save_section` ahora **quita la parte si queda vacía** (y hay más de una).

### Hecho el 02-11-2026, publicado en la 0.7.9
1. `search::search` devuelve también `persons: Vec<PersonHit>` (id, nombre, fragmento de sus campos)
   desde `persons_fts`, solo en la primera página de una búsqueda de texto sin filtros de colección,
   carpeta, texto, ficha o tipo (con «Guru Paramparā» filtra por el árbol). `Results.tsx` las muestra
   arriba («Fichas que lo dicen»). La búsqueda por significado no las da (`persons: vec![]`).
2. **Textos cortos → Notas** (datos, con un script por CDP en la app de Whisper, no es código de la
   app): fichas con un solo texto Markdown de ≤ 500 B; se quitan las líneas que repiten el nombre, varias
   entradas del mismo nombre van numeradas («1. … 2. …»), se añaden a las notas que hubiera (salvo si ya
   lo decían) y el texto va a la Papelera. 5 textos mezclaban a otra persona: se crearon fichas nuevas
   (Amulyadhana Rāya Bhaṭṭa, Bālaka, Bālakadāsa Vairāgī, Balarāma Oḍra, Bhīmalocana Sānyāl, Rādhākṛṣṇa
   Ācārya (Gosvāmī) y (Ṭhākura)); en esas 5 las notas de la IA (que mezclaban) se sustituyeron.
   En la copia de pruebas: 1.227 fichas, 7 nuevas. Los PDF cortos (5) no se tocaron.
   **Aplicado en los datos de Whisper el 02-11-2026** con la 0.7.9 instalada: 1.227 fichas, 7 nuevas,
   sin errores (1.880 fichas; 613 con texto). Copia previa en Documentos › … › Copias de seguridad ›
   «antes de textos cortos a notas 2026-11-02».

### Hecho el 02-11-2026, publicado en la 0.7.8
1. **Texto dentro de la ficha** (`PersonView.tsx`): `.inline-sticky` (cabecera + barra de partes) con
   `position: sticky`; por eso `.inline-doc` usa `overflow: clip` (con `hidden` no funciona).
   `withoutRepeatedTitles`: quita las primeras líneas cuyo `coreName` es el de la ficha, el título o la
   parte (solo al mostrar, el texto no cambia). Botón `.to-top` cuando se ha bajado más de 900 px.
   Índice `.inline-outline` (columna de 210 px, `@container` lo esconde si la tarjeta mide < 680 px):
   solo con ≥ 3 subtítulos que no sean «p. N» ni el nombre; en 70 textos largos de la copia, ninguno.
   Al cambiar de parte, la tarjeta vuelve a su principio.
2. «Homónimos» siempre a la vista (vacía, con `t.namesakesEmpty`).
3. **Deshacer «No son la misma persona»**: Ajustes › Revisar › «Marcadas como “No son la misma
   persona”», parejas con flecha (`store::unmark_distinct`, orden `unmark_distinct`) → vuelven en rojo.

### Hecho el 02-11-2026, publicado en la 0.7.7
1. **Homónimos** (idea de Whisper): muchos Haridāsa, Kṛṣṇadāsa, Govinda, Jagannātha… que son personas
   distintas de otras épocas. Es la etiqueta fija `NAMESAKES = "Homónimos"` (`api.ts`, `isNamesake`;
   **sin cambio de DATA_VERSION**), puesta con `store::set_tag` (orden `set_tag`). En el panel, grupo
   «Homónimos» entre la Guru Paramparā y Otros vaiṣṇavas, con un subtítulo por nombre (`namesakeKey` /
   `namesakeLabel` en `Sidebar.tsx`: el primer nombre sin títulos, con su «dāsa» — «Kṛṣṇa dāsa» =
   «Kṛṣṇadāsa»; los Jagannātha juntos y los Jagannātha Dāsa aparte). Salen de Otros vaiṣṇavas (si
   están en el árbol, siguen también en él). Nunca salen en rojo ni como repetidas (`duplicateGroups`,
   `possibleRepeats`, «¿La misma persona?»). Para mandarlas: cuadradito (icono de personas) junto a cada
   ficha parecida, «Todas a Homónimos» (esta y las parecidas), y botón derecho › «Mandar a Homónimos» /
   «Sacar de Homónimos». También se quita borrando la etiqueta al editar la ficha.
2. Rojo de las repetidas también en el árbol dibujado (`TreeView` usa `possibleRepeats`, clase
   `.tree-node.repeated`; el título dice a cuál se parece). En la copia: 22 de 261.
3. Al mover un trozo, título propuesto = su primera línea sin marcas Markdown (`firstLine` en
   `Dialogs.tsx`, máx. 80 letras).

### Hecho el 02-11-2026, publicado en la 0.7.6
1. «Unir sus textos en uno solo» (ya existía en el menú «⋯», `join_person_texts`) sale también como botón
   a la derecha del título «Textos» cuando la ficha tiene más de uno (`joinMe` en `PersonView.tsx`).
2. «¿La misma persona?»: una X en cada ficha parecida (`notSame([s])`) para quitarla sola.

### Hecho el 02-11-2026, publicado en la 0.7.5
1. **Mover un trozo de texto a otra ficha** (idea de Whisper, para textos como «Haridāsa» que juntan
   a varias personas del mismo nombre): seleccionar en el lector o en el texto de la ficha › botón
   derecho › «Mover a otra ficha…» (`MoveTextDialog`): ficha existente o nueva. `store::move_text`
   busca el trozo por sus palabras (`find_fragment`: primeras y últimas 6, líneas enteras; las marcas
   Markdown no importan), lo quita (el texto guarda su versión) y crea un texto nuevo para la otra ficha
   en la misma carpeta. Probado en la copia: Haridāsa → Haridāsa Dvija.
2. Ficha › «¿La misma persona?» › **«No son la misma persona»**: guarda cada pareja en `person_distinct`;
   la sección deja de proponerlas y el rojo del panel se quita (`PersonView` lee `listDistinct`).

### Hecho el 02-11-2026 (publicado en la 0.7.4)
1. **Árbol hondo en el panel** (`Sidebar.tsx`): la sangría por nivel baja de 16 a 6 px según lo hondo
   del árbol abierto y el ancho del panel (`INDENT`, `MIN_INDENT`, `NAME_ROOM`, ResizeObserver); si aun
   así no cabe, el árbol se desliza (margen negativo `shift`, `.parampara { overflow: hidden }`) hasta
   la fila pulsada o la rama abierta. El nombre tiene `min-width: 7em`.
2. **Tipos de relación nuevos**: `vani` (śikṣā por vāṇī: sin trato en vida — Narottama → Viśvanātha;
   Whisper eligió el nombre), `sannyasa`, `vesa` (bābājī veśa). Solo valores de `kind`
   (`store::TREE_KINDS`, `api.ts TREE_KINDS / lineOfKind`): **sin cambio de DATA_VERSION**. vāṇī va en
   la «Línea de śikṣā»; sannyāsa y veśa en ninguna línea (solo árbol completo / deslizador). Color
   `--saffron` para sannyāsa (continua) y veśa (rayas); vāṇī de rayas tenue.
3. **Árbol → fichas**: `store::Pending` (lee cada ficha una vez, cambia en memoria y escribe al final)
   lo usan `relate`, `unrelate` (nuevo: al sacar a alguien del árbol o subirlo al primer nivel, la app
   pregunta si quitarlo también de las fichas) y `sync_tree` (nuevo: Ajustes › Revisar › «Pasar la
   Guru Paramparā a las fichas», primero muestra la lista y luego escribe; solo añade). Nombres con
   coma se escriben dados la vuelta (`in_list`: «Nityānanda Prabhu, Śrīla» → «Śrīla Nityānanda Prabhu»).
   En la copia de pruebas: 46 fichas, 200 discípulos y 24 gurus. **Antes de pulsarlo** conviene que
   Whisper una las fichas repetidas (saldrían dos veces: «Bhakti Dayita Mādhava» y «Dayita Mādhava
   Gosvāmī Mahārāja»…) y revise tipos (Prabhupāda está como dīkṣā de Keśava: debería ser sannyāsa).
4. **Fichas quizá repetidas en rojo** en el panel Personas (`Review.tsx possibleRepeats`: los grupos de
   `duplicateGroups` y, en el árbol, mismo nombre sin títulos `looseKey`); el título dice a cuál se
   parece. Botón derecho › «No es una ficha repetida» guarda cada pareja en `person_distinct`
   (`markDistinct([id, otro])`). En la copia: 136 en rojo, 45 en el árbol; ninguna pareja estaba
   guardada como distinta (las 13 del 31-10 vuelven a salir hasta que Whisper las marque).
5. Botón derecho › **«Colorear su línea hasta arriba»** (`markLine` en `App.tsx`): la ficha y todos sus
   gurus del árbol con su color (verde si no tiene).
6. **Otros gurus fuera del árbol**: en «Otros gurus» se puede elegir cualquier ficha; `store::set_links`
   mete en el primer nivel del árbol al guru que no estaba (para dibujar p. ej. Bipin Bihārī → Bhaktivinoda).
7. **Comprobar los datos** (`check.rs`, Ajustes › Revisar): solo lee. Tipos en `check::KINDS` (textos en
   `t.checkGroup` / `t.checkItem`): nombres-trozo, gurus distintos árbol/ficha, gurus o discípulos de la
   ficha no unidos en el árbol, vidas que no coinciden (salvo vāṇī / asociado), fechas imposibles, gurus
   sin ficha, y (al final, largos) relaciones que solo dice una de las dos fichas. Las listas se parten
   por comas fuera de paréntesis. En la copia: ~400 avisos, casi todos del árbol.
8. **Enlaces web en Notas** (`WebLinks` en `PersonView.tsx`): https://… se abre en el navegador.

### Hecho el 01-11-2026 (tarde)
1. Whisper actualiza a la 0.5.2 (comprueba que la actualización automática desde la 0.5.1 funciona) y la
   revisa: árbol con tipos de relación, arrastrar bajo otro guru, Digdarśanī en la línea de tiempo,
   propuestas del Digdarśanī en Rellenar fichas.
2. **Comparar dos modelos para «Rellenar fichas con IA»**: `qwen2.5:7b` (el actual, 4,7 GB, ~14 s por
   ficha) y **`qwen3.5:4b`** (más pequeño y más nuevo; comprobar el nombre exacto en Ollama antes de
   descargarlo). Pasar **las mismas fichas** por los dos (p. ej. 974, 332, 556, 1089 con `ai_real`,
   en una copia) y comparar aciertos, errores (fechas confundidas, discípulos inventados) y tiempo.
   Whisper elige. Hacer el modelo **elegible en Ajustes** en vez de la constante `ai::MODEL`.
   Con la RTX 3050 (8 GB): hasta ~8B cabe entero; 12–14B no cabe y con el i5-7500 sería muy lento.
   **Hecho el 01-11-2026 (publicado en la 0.6.1; Whisper eligió qwen3.5:4b):** el modelo se elige en Ajustes › Rellenar fichas (meta
   `ai_model`, por defecto `qwen3.5:4b` desde la 0.6.1; `ai::SUGGESTED`; `"think": false` para los qwen3).
   Comparación (BIO_MODEL en `ai_real`): qwen2.5:7b ~13 s/ficha, copia párrafos enteros como prueba,
   inventó discípulos en 1089 (Bhakta y Menaka solo vivían en el templo), puso la misma fecha de
   aparición y desaparición, y en 332 la respuesta se cortó (JSON roto). qwen3.5:4b ~6 s/ficha,
   respuestas cortas y correctas (332 muy bien), sin inventar discípulos, pero a menudo deja la
   prueba («evidence») vacía y entonces el filtro descarta el dato; en 1089 puso «106 years old»
   como desaparición (una edad, no una fecha).
3. Luego Whisper lanza «Probar con 10 fichas» y, si le convence, «Leer todas las fichas».
4. **Estilo «Windows 11»** (publicado en la 0.6.0): tercer estilo de la app
   (`data-skin="fluent"`, junto a «VS Code» y «Clásico»), inspirado en K-Desktop
   (github.com/Kobayashi82/K-Desktop, C#/WPF: solo se copia el aspecto). Acento amarillo `#f5c542`
   con letra oscura (`--on-accent`). Hecho: Ajustes ocupa la ventana; columna de secciones con icono
   en cuadro y una línea de explicación (`t.settingsHints`); bloques (`Card`) con filas (`Row`:
   nombre + explicación a la izquierda, control a la derecha) en `Settings.tsx`; CSS al final de
   `styles.css`. Whisper lo aprobó. Hecho también: barra de la izquierda (`components/Rail.tsx`,
   solo en este estilo): Inicio / Guru Paramparā / Línea de tiempo, luego los paneles Personas /
   Biblioteca / Marcadores / Historial (pulsar el abierto lo cierra) y abajo Ajustes / Ayuda;
   solo iconos si la ventana mide menos de 1200 px (`railW` en `App.tsx` resta su ancho al
   repartir los paneles). En este estilo se ocultan las pestañas de la barra lateral y el logo
   de arriba. Hecho también: «Calendario» en la barra (vista `main.kind = "calendar"`: el mismo
   `Calendar.tsx` con `page`, 90 días y todos los eventos); ficha y lector en tarjetas sobre el
   fondo gris (títulos de apartado grandes, foto vacía en amarillo suave, títulos Markdown del
   estilo «Editor» en amarillo). Whisper lo aprobó. Hecho también: Inicio, resultados, menú
   contextual y diálogos (títulos en letra normal en vez de versalitas, esquinas de 6–8 px, sin
   sombras ni brillos; resultado elegido con raya amarilla). El estilo «Windows 11» cubre ya toda
   la app y es el estilo por defecto desde la 0.6.0. **Siguiente:** que Whisper lo use y diga qué
   retocar.
5. **Varios gurus en el árbol — HECHO y publicado en la 0.7.0 (DATA_VERSION 6).** Tabla
   `person_links`, `store::set_links` (sustituye la lista; ignora al guru del árbol), al unir fichas
   pasan a la que queda, al borrar se quitan; `PersonListItem.links`; Editar ficha › «Otros gurus en
   el árbol (śikṣā)» (componente `MoreGurus`, solo personas del árbol); panel: «+ śikṣā» con los
   nombres al pasar el ratón; árbol dibujado: líneas extra y **deslizador Dīkṣā ↔ Śikṣā** (`mix`):
   la Paramparā de dīkṣā y los cuadros que no están en una relación de śikṣā se aclaran; si el guru
   está en la misma columna o más a la derecha, la curva va por la izquierda. Probado en una copia
   (Nārāyaṇa Mahārāja 1809 ← Prabhupāda 125 y Vāmana 1810). Publicado en la 0.7.0 (Whisper lo pidió
   con la IA en 600 de 986 fichas). Texto original de la idea:
   **Idea aplazada (Whisper: «todavía no», 01-11-2026): varios gurus en el árbol.** Hoy cada ficha
   está bajo un solo guru (`person_tree`). Ejemplo: Śrī Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja
   (1809): dīkṣā de Bhakti Prajñāna Keśava, śikṣā de Bhaktivedānta Svāmī Prabhupāda (125) y de
   Vāmana Mahārāja. Propuesta: tabla nueva `person_links(person_id, guru_id, kind)` (DATA_VERSION 6
   + migración), apartado «Gurus de śikṣā en el árbol» en Editar ficha (elegir de la lista) y/o
   menú contextual; línea de rayas extra en `TreeView.tsx`, «+ śikṣā» con los nombres al pasar el
   ratón en el panel. Opcional: proponer los śikṣā leyendo el campo «Guru» (es prosa libre:
   «śikṣā: A and B», «(śikṣā guru)», «studied under…»), que Whisper acepte uno a uno.
   **Idea de Whisper para mostrarlo:** en el árbol dibujado, un **deslizador** (como el de volumen o
   brillo): a la izquierda solo la Paramparā de dīkṣā; al moverlo, el árbol de dīkṣā se aclara
   (opacidad) y van apareciendo las líneas de śikṣā (de rayas, en color de acento) hasta quedar
   resaltadas. En el centro se ven las dos.
7. **Orden en los árboles — publicado en la 0.7.1** (idea de Whisper): primero los
   discípulos sin discípulos y después los que tienen (sus ramas siguen debajo); dentro de cada grupo,
   el orden de arrastrar. Solo cambia cómo se muestra (`sortDisciples` en `api.ts`, usado por
   `Sidebar.tsx` y `TreeView.tsx`); no toca `person_tree.pos`.
8. **Datos de la ficha en tres columnas — publicado en la 0.7.1** (lo pidió Whisper):
   Guru / Discípulos · Aparición / Desaparición · Lugar / Obras; Notas a lo ancho debajo
   (`PersonView.tsx`: `facts` por columnas, clases `.facts-col` y `.fact`). Los nombres largos del
   guru ya no se salen de su tarjeta (`.facts dd .chip` con salto de línea).
9. **Acercar / alejar el árbol dibujado — publicado en la 0.7.2** (lo pidió Whisper):
   botones − % + y «Ver el árbol entero», Ctrl + rueda (acerca donde está el ratón; listener no
   pasivo), arrastrar el fondo para moverse; el árbol tiene su propio recuadro que llena la pantalla
   (`.tree-page`); el tamaño se recuerda (`bio.treeZoom`).
10. **Marcas de colores — publicado en la 0.7.3** (idea de Whisper): doble clic en un nombre
   (panel o árbol dibujado): amarillo → verde → azul → sin color. Se guardan en `meta` «tree_marks»
    (JSON {id: color}; comandos `tree_marks` / `set_tree_marks`): no cambia el formato.
11. **Tres vistas del árbol dibujado — publicado en la 0.7.3** (idea de Whisper): «Todo» (con
    el deslizador) · «Línea de dīkṣā» (cada uno bajo su guru de dīkṣā: su sitio si es dīkṣā o un
    «otro guru» dīkṣā; sin guru de dīkṣā en el árbol = rama propia) · «Línea de śikṣā» (solo quien
    está en una relación de śikṣā y los gurus que llevan hasta ellos, subiendo por el árbol para que la
    línea no se corte). `arrange()` en `TreeView.tsx`; la vista se recuerda (`bio.treeLine`). Para
    alargar la línea de śikṣā hay que añadir las relaciones que faltan (p. ej. Narottama ← Kṛṣṇadāsa
    Kavirāja, Viśvanātha ← Narottama, Bhaktisiddhānta ← Bhaktivinoda).
12. **Árbol corregido en los datos de Whisper (01-11-2026)**, con `fixtree.cjs` (scratchpad) y copia
    previa «Gaudiya Vaisnavas DB antes de corregir el árbol 2026-11-01.db»: 14 tipos (Caitanya dīkṣā de
    Īśvara Purī; Sanātana, Gopāla Bhaṭṭa, Raghunātha Bhaṭṭa, Raghunātha dāsa, Kṛṣṇadāsa Kavirāja,
    Śyāmānanda, Baladeva, Jagannātha dāsa, Bhaktivinoda, Gaura Kiśora → śikṣā; Svarūpa, Rāmānanda,
    Haridāsa → pārṣada) y 10 discípulos de Narottama movidos de Lokanātha a Narottama. Quedan para
    Whisper: Lokanātha y Śrīvāsa (¿pārṣadas de Caitanya?), fichas repetidas y campos raros.
6. **Fichas repetidas de la misma persona** (Whisper, 01-11-2026): 1809 / 995 (Nārāyaṇa Gosvāmī
   Mahārāja) y 125 / 1516 (Prabhupāda) son la misma persona; **las une Whisper**. Idea para más
   adelante: marcar en otro color las fichas que podrían estar repetidas (p. ej. «Apellido, Nombre»
   al revés de otra) para que Whisper las examine y las una. Nunca unir sin que lo decida Whisper
   (ver las 13 «uniones claras» rechazadas el 31-10-2026).

### Plan acordado el 31-10-2026
1. **Probar la actualización automática** (01-11-2026: publicada la 0.5.1 para ello). El usuario instala la 0.5.0 a mano (la 0.4.2 no sabe
   actualizarse; al desinstalar, **no marcar «Borrar los datos»**). Para probar que se actualiza sola
   hace falta publicar después una 0.5.1 (con `npm run app:build` y subir `latest.json`): la 0.5.0
   instalada debería ofrecer «Actualizar ahora» en la barra de estado.
2. **Rellenar fichas con IA local** (fuente «ai» en `fill.rs`): un modelo de Ollama (p. ej. gemma3 o
   qwen2.5 pequeño, que quepa en la RTX 3050) lee el texto de cada ficha de «Otros vaiṣṇavas» y
   devuelve JSON {appearance, disappearance, place, guru, disciples, works, notes} + la frase de donde
   sale cada dato (`evidence`); solo lo que diga el texto, en inglés como los textos. Va con
   `fill::add(..., "ai", evidence, guru_id)` y sale en Ajustes › Rellenar fichas para aceptar/descartar.
   En segundo plano, con progreso y botón de parar (como Significado), y retomable. **Lo lanza el
   usuario, no Claude.** Fichas con textos muy cortos: saltarlas o juntarlas.
3. Revisar en Ajustes › Rellenar fichas las 93 propuestas (88 fechas del calendario, 5 gurus; ojo con
   «Mādhava ← Vāmana Gosvāmī», nombre corto, puede ser otra persona).

- Repasar en Ajustes › Revisar: 57 grupos de fichas repetidas, 10 títulos dudosos, 15 textos vacíos.
  31-10-2026: Claude propuso 13 uniones; **el usuario dice que NO son la misma persona: no unirlas**
  (ni proponerlas otra vez). Se movieron a su ficha 16 PDF que estaban en una ficha equivocada
  (Lokanatha dasa v.1–3 → Lokanātha Gosvāmī, Sanatana v.2–4 → Sanātana Gosvāmī, Vrindavana dasa
  v.1–5 → Vṛndāvana dāsa Ṭhākura, y Radhamohana, Radhavallabha, Sundarananda, Jagadananda, Damodara);
  copia previa «biodata antes de mover PDF.db». Lo demás queda como estaba, para que lo revise él.
- OCR del único PDF escaneado («Krishna dasa babaji - v.1»): no se metió un motor de OCR en la app
  por un solo archivo; se podría transcribir aparte.
- Firma digital del .exe (quita el aviso de Windows): cuesta un certificado anual; no se ha hecho.
- Rellenar las fichas (fechas, guru, discípulos…) a partir de los textos: **hecho para las 33 de la
  Guru Paramparā** (26-10-2026, leyendo Claude los textos; solo campos vacíos, en inglés como los
  textos). Quedan las de «Otros vaiṣṇavas».
- Enlaces de nombres: ahora se calculan en la pantalla cada vez; si algún día va lento con textos
  muy largos, se podría calcular en Rust.

---

## 8. Historial

- **12-11-2026 — v0.14.3**: el Paramparā Tree «De arriba abajo» ya no deja la ventana en blanco; aviso con «Volver al
  inicio» si una vista falla; «Comprobar los datos» distingue mejor los homónimos.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.14.3

- **11-11-2026 — v0.14.2**: el Paramparā Tree dibujado se abre en Lord Kṛṣṇa (antes salía en blanco) y «Comprobar
  los datos» reconoce los homónimos con paréntesis.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.14.2

- **11-11-2026 — v0.14.1**: «Ver en linaje» en el clic derecho (también en el Paramparā Tree dibujado) y en el botón
  de la ficha. Datos: Textos principales de todas las fichas fuera del árbol (tandas 31–47).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.14.1

- **11-11-2026 — v0.14.0**: vista **«Linaje»** (hasta 5 generaciones arriba y 10 abajo, dudas y notas al margen) y
  panel **«Deidades»**. Datos: Textos principales de las fichas largas fuera del árbol, tandas 8–30 (todas las de más
  de 1.200 letras), 7 fichas vacías y #545 borradas, nuevas #2158–#2172, 429 → 430 Guṇarāja Khān.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.14.0

- **07-11-2026 (noche, después) — Textos principales de fichas FUERA del árbol, tandas 1–7 (sin versión nueva)**:
  23 fichas con texto (Gaura Kiśora Śiromaṇi, Vaṁśī dāsa Bābājī, Haribolānanda, Jayadeva, Guṇarāja Khān, Jagadbandhu,
  Atula Campati, Haridāsa Sādhu, Gauragovindānanda, Rādhāramaṇa Ghoṣa, Keśava Kāśmīrī, Bilvamaṅgala, Advaita dāsa
  Bābājī, Lalitāsakhī, Vijayakṛṣṇa Gosvāmī, Vrajabālā, Mahānidhi Svāmī, Haridāsa dāsa —el autor del Abhidhāna—,
  Rādhikānātha, Mādhava dāsa, Premānanda de Śṛṅgāra-vaṭa…) y casi todas **colocadas en el árbol** (bajo su guru, en
  la rama «Other Vaiṣṇava lines» #2027, o en la rama nueva **#2151 «Other sampradāyas (outside the Gauḍīya line)»**
  con Yāmuna, Nimbārka, Viṣṇusvāmī, Śrīdhara Svāmī, Jñāneśvara, Nāmadeva, Tukārāma, Śaṅkara). Uniones: 1782 → 1781,
  597 → 598, 1688 → 156. Separadas: 837 (#2152–2154), 1115 (#2155–2156). Scripts `f1`–`f7`, `otras-*`,
  `fuera-largas.mjs` (lista de las que faltan), `primer-nivel.mjs` (⚠️ `set_links`/`set_family` meten a la otra
  persona en el primer nivel del árbol si no estaba: comprobar que solo quede Lord Kṛṣṇa). Quedan 19 (CONTINUAR.md).
- **07-11-2026 (tarde-noche) — Textos principales, tandas 2–10 (sin versión nueva)**: 36 fichas con «Texto principal»
  en inglés (In short / vida / Sources, solo lo que dicen sus textos, comprobado con el Abhidhāna): compañeros de
  Mahāprabhu y Nityānanda (Raghunandana, Gadādhara dāsa, Jagadīśa Paṇḍita, los Ghoṣa, Devānanda, Nandana Ācārya,
  Jagāi-Mādhāi, Tapana Miśra, Veṅkaṭa Bhaṭṭa, Sāraṅga, Nṛsiṁhānanda, Kāśīśvara, Bijalī Khān), ācāryas y poetas
  (Vīrabhadra, Jñānadāsa, Yadunandana, los Pañcasakhās Acyutānanda y Balarāma, Rūpacandra), bābājīs (Jagadīśa,
  Giridhārī ×2, Govinda dāsa, Dharma dāsa, Manohara, Jagadānanda, Rāmadāsa, Gaura dāsa, Ramahari, Brahmānanda) y
  Gauḍīya Maṭha (Bodhāyana, Sundarānanda, Bhaktiratna Sādhu, Bhakti Bhāvana Viṣṇu). De paso: **3 uniones** (1866→1378,
  1097→1060, 157→1880), **9 fichas mezcladas separadas** (534, 972, 692, 81, 332, 1860, 291, 554 → fichas nuevas
  #2138–#2150), Rāmadāsa Bābājī #1858 bajo su guru real (Rādhāramaṇa-caraṇa dāsa #1168), 5 líneas del árbol
  marcadas «discutidas» con nota, ~20 líneas de familia, `sindup` en 19 textos. Herramienta nueva de comprobación:
  `pieces.mjs <copia.db> <plan.json>` mira en una copia que cada trozo de `separar.mjs` se encuentra una sola vez.
  1.922 personas · árbol 1.173.
- **07-11-2026 (noche, después) — más scripts de datos (sin versión nueva)**: `fuera9-10` (campo guru, «received dīkṣā
  from…»), uniones de repetidas y de fichas que eran otro nombre (`uniones3-6`, `limpieza1`), arreglos de textos
  pegados (`arreglos1-2`), nombres limpios (`nombres1-2`) y **diacríticos en 453 nombres** (`diacriticos-plan` +
  `diacriticos1-3`, aplicador `renombrar.mjs`), **63 líneas de familia** (`familia-plan`, `familia`, `familia2`),
  **fechas** (propuestas del Digdarśanī revisadas: 51 sí, 31 homónimos rechazados — `fechas1`; 39 años de los propios
  textos — `fechas-plan`, `fechas2`), **16 tīrthas** nuevos (`tirthas1`, 102 en total) y **Textos principales** de 3 en 3
  (`tp1`: Vṛndāvana dāsa, Locana dāsa, Lakṣmīpriyā; faltan 35, lista en CONTINUAR.md). 1.912 personas, árbol 1.168.
- **07-11-2026 (noche) — scripts de datos (sin versión nueva)**: `separar.mjs` (separa fichas mezcladas: notas, trozos
  «## NOMBRE», o `cut` dentro de un párrafo; coloca y etiqueta «Poetas»), `mezcladas1-5` (71 fichas → 82 nuevas),
  `fuera2-8` (unas 200 fichas del Vaiṣṇava-maṇḍala bajo su guru o rama: CC Ādi 10-12, Rasikamaṅgala, Karṇānanda,
  Prema-vilāsa, «disciple of X», devotos y contemporáneos de Mahāprabhu; 18 poetas más), uniones (10 repetidas, entre
  ellas Ācāryaratna = Candraśekhara y Gokulānanda Sena = Vaiṣṇava dāsa). Árbol: 859 → 1.143.
- **07-11-2026 — v0.13.0** (formato 10): texto de la ficha plegado, estrella de marcador en la ficha, textos y galería
  de los tīrthas, carpeta «Dīkṣā» en la Paramparā lateral. Datos: uniones (1591/1210 → 1597, 491 → 1723, 55 → 56) y
  la sakhā de Raghunandana Ṭhākura (`uniones1-unir.json`, `raghunandana.mjs`).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.13.0
- **06-11-2026 — v0.12.8**: apartado «Poetas» en el lateral de Vaiṣṇavas (etiqueta fija). Datos: tanda 1 fuera del
  árbol (336 colocadas), 79 poetas etiquetados.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.8
- **06-11-2026 — scripts de datos (sin versión nueva)**: grupos 5 y 6 del Abhidhāna (Viśvanātha, Baladeva, Narahari
  Cakravartī, Rādhāmohana; los bābājīs de los siglos XVIII–XX: Gaṅgāmātā, Siddha Kṛṣṇadāsa de Govardhana y su línea,
  Nityānanda dāsa y Madhusūdana dāsa fuera de «Other Vaiṣṇava lines»); Lakṣmīpriyā Mātā pārṣada de Mahāprabhu;
  Giridhārī dāsa con veśa de Siddha Kṛṣṇadāsa (`grupo5*`, `grupo6*`).
- **06-11-2026 — v0.12.7**: elegir de la lista el guru que ya ponía la ficha la coloca en el árbol. Datos: grupos 3 y 4
  del Abhidhāna; 125 fichas colocadas bajo su guru; cinco uniones.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.7
- **06-11-2026 — v0.12.6**: carpeta «Discípulos» en la Guru Paramparā lateral (gurus con más de 4 discípulos). Datos:
  grupo 2 del Abhidhāna (rama de Gadādhara Paṇḍita).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.6
- **06-11-2026 — v0.12.5**: «Plegar hacia atrás» en la Guru Paramparā lateral. Datos del día: rama «Other Vaiṣṇava
  lines», huérfanos colocados bajo su guru, grupo 1 del Abhidhāna (Mahāprabhu y Nityānanda).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.5
- **06-11-2026 — v0.12.4**: enlaces a archivos del PC en las notas (rutas sueltas y «Enlazar…» en el editor). Datos
  del día: Bhaktivinoda 3–4, libros «Vaiṣṇava Saints» y «Gauḍīya Vaiṣṇava Ācāryas» repartidos en las fichas.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.4
- **05-11-2026 — v0.12.3**: «#1139» en «Filtrar personas…» va a esa ficha; el número se ve en la cabecera. Datos
  del día: los doce gopālas y el círculo de Nityānanda (texto principal; Sundarānanda, Puruṣottama Nāgara, Gaṅgā
  Devī, Mādhava Ācārya, Padmāvatī, Raghunātha Vaidya y Śrīdhara Brahmacārī separados).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.3
- **05-11-2026 — v0.12.2**: en la búsqueda, los textos de las fichas antes que los libros sin ficha. Datos del día:
  Biblioteca ordenada (Fichas / Libros), Govinda, Haridāsa y Jagadānanda Ṭhākura separados, grupos Purī 1–3.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.2
- **05-11-2026 — v0.12.1**: carpetas «Pārṣadas» / «Śikṣā» en la Guru Paramparā de la barra lateral, interruptor
  Todo / Dīkṣā / Śikṣā, Expandir / Plegar todo. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.1
- **05-11-2026 — datos**: grupos «Navadvīpa 3» (Gaṅgādāsa 289, Śrīrāma Paṇḍita 1961, Śrīpati Paṇḍita 1962 nueva,
  Rāmāi 1268, Sudarsana 1477) y «Purī 1» (Svarūpa Dāmodara 1513, Rāmānanda Rāya 1283, Sārvabhauma 1381,
  Gopīnātha Ācārya 383, Kāśī Miśra 1952) con texto principal, en la BD real (copias «antes de Navadvipa 3» y
  «antes de Puri 1»). `textoprincipal.mjs` acepta `new`, `fields.name`, `main` opcional y `move`.
- **04-11-2026 — v0.12.0 (formato 9)**: árbol de arriba abajo con grupos, listas y cadenas (dagre), líneas de
  familia / discutidas / notas, exportar SVG, «Ver en el árbol», gurus del campo Guru → líneas del árbol.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.12.0
- **04-11-2026 — datos (Paramparā del archivo de Whisper)**: `gaudiya_sampradaya.json` (copia en
  `scripts/datos/`) aplicado con `parampara-json.mjs` en la BD real (copia «antes de Parampara del archivo»):
  las 112 relaciones no familiares iguales al archivo; 12 gopālas como asociados; Prabhupāda dīkṣā de BSS;
  fichas nuevas 1958–1960. Antes, el mismo día: grupos 2 (círculo de los Gosvāmīs), 3a y 3b (Navadvīpa) con
  «Texto principal» (`circulo*`, `navadvipa1*`, `navadvipa2*`); Lokanātha y Śrīvāsa bajo Mahāprabhu.
- **04-11-2026 — v0.11.4**: colección «Texto principal»; Seis Gosvāmīs aplicados.

- **03-11-2026 — v0.9.1**: mapa dibujado con zoom, la Guru Paramparā primero (búsqueda, filtro, Panorama,
  sello en la ficha, «Otros vaiṣṇavas» plegado), «Sin especificar», arreglo de «Mover a otra ficha».
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.9.1

- **03-11-2026 — datos (fichas separadas)**: 15 fichas que mezclaban personas del diccionario (entradas
  «1. 2. 3.») → 25 fichas nuevas, ids 1922-1946 (copia «antes de separar fichas»). Regla: la ficha conserva
  el nombre de la persona a la que ya apuntan el árbol o las notas; las demás llevan un apellido entre
  paréntesis. Puruṣottama Paṇḍita (1136) pasa a asociado de Nityānanda en el árbol y su sitio bajo Narottama
  lo ocupa «Puruṣottama (disciple of Narottama)»; Abhirāma Dāsa (poeta) sale del árbol; textos movidos a
  Gaurī Dāsa Paṇḍit, Abhirāma Ṭhākura y Lakṣmīpriyā Mātā. Uniones para Whisper: Kamalākṣa → Advaita;
  Vīrabhadra Gosvāmī + Vīracandra → Vīracandra (Vīrabhadra Gosvāmī). **Código (sin publicar):**
  `find_fragment` (mover texto) fallaba con trozos de 7–11 palabras; arreglado, con prueba.

- **03-11-2026 — datos (Śrīnivāsa, Narottama, Śyāmānanda)**: 35 fichas (copia «antes de circulo de
  Srinivasa»). Guru de Narottama: Lokanātha (dīkṣā), Jīva y Kṛṣṇadāsa Kavirāja (śikṣā); de Śyāmānanda:
  Hridayacaitanya (dīkṣā), Jīva (śikṣā); Hridayacaitanya ← Gaurī Dāsa Paṇḍit. Familias de los tres en notas
  con nombres exactos (Datta de Kheturī; padres de Śyāmānanda; esposas, suegros, hijos e hijas de
  Śrīnivāsa; Vīra Hamvira y su familia); quitados «discípulos» que eran familia (Nārāyaṇī Dāsī, Gopāla
  Cakravartī). Renombrado «Santosa Rāya (brother of Chānd Rāya)». Uniones para Whisper: «Śrīnivāsa  Ṭhākura»
  → Śrīnivāsa Ācārya; «Duhkhini Kṛṣṇa Dāsa» → Śyāmānanda Paṇḍita. Por separar: Nārāyaṇī Dāsī 1006,
  Hemalatā Devī 497, Gopāla Cakravartī 348, Lakṣmīpriyā 834.

- **03-11-2026 — datos (círculo de Nityānanda)**: 29 fichas (copia «antes de circulo de Nityananda»).
  Decisiones de Whisper: Acyutānanda nació en 1428 Śaka (1506), según B. V. Tīrtha; Kṛṣṇadāsa Miśra ≠
  Kṛṣṇamiśra (marcados distintos; «Kārttikeya» solo en Kṛṣṇamiśra). Familia de Nityānanda en notas con
  nombres exactos; los doce gopālas (GGD 126-132) en su ficha y en la de cada uno; Maheśa y Kālīya Kṛṣṇa
  Dāsa con Guru «Śrī Nityānanda»; Jāhnavā guru de Vīrabhadra Gosvāmī. Renombradas: «Vīrabhadra (disciple
  of Śyāmānanda)», «Vīracandra Gosvāmī (Madograma, 19th c.)», «Suryadasa (son of Harivaṁśa)»,
  «Sundarānanda (disciple of Śyāmānanda)», «Sundarānanda Paṇḍit (disciple of Abhirāma)». Uniones para
  Whisper: Vīracandra + Vīrabhadra Gosvāmī → «Vīracandra (Vīrabhadra Gosvāmī)» (antes, mover el texto de
  1858 a la de Madograma), Jāhnavā Matta, Abhirāma Gopāl Ṭhākura, Dhananjaya ×2, Paramesvari, Kholāvecā,
  Kāla-Kṛṣṇa, Rāmacandra (Ramai Gosāi). Por separar: Gaurī Dāsa 326, Abhirāma Dāsa 4.

- **03-11-2026 — datos (círculo de Advaita)**: 36 fichas (copia «antes de circulo de Advaita»). La ficha 14
  vacía era Acyutānanda, hijo mayor de Advaita (lo dice su texto) → «Acyutānanda (son of Advaita)»; familia
  de Advaita en notas con nombres exactos; 16 discípulos de la rama de Advaita (CC 1.12) con Guru y en sus
  Discípulos; Kuvera ya no lo tiene como «discípulo»; renombradas «Sītā Devī (mother of Lokanātha)» y
  «Gopāla Miśra (disciple of Sanātana)». Uniones para Whisper: Sītā Thakurni→Sītā Ṭhākurāṇī, Kṛṣṇadāsa
  Miśra→Kṛṣṇamiśra, Bhagavān Kar→Bhavanatha Kar. Pendiente: año de Acyutānanda (1492 vs 1504) y fichas que
  mezclan personas (Haridāsa Brahmacārī, Murāri Paṇḍit, Raghunātha, Srikanta, Kamalākṣa).

- **03-11-2026 — datos (prueba «círculo de Gadādhara»)**: 20 fichas (copia «antes de circulo de Gadadhara»).
  Leyendo notas y textos: el padre de Gadādhara es la ficha 864 (renombrada «Mādhava Miśra (father of
  Gadādhara)»), la 863 es otro («(son of Kālidāsa)»); la 560 no es el padre del Señor («Jagannātha Miśra
  (teacher of Rasikānanda)», se le quitó «Nanda»); 10 discípulos con «Gadādhara Paṇḍit Gosvāmī» en Guru y
  añadidos a sus Discípulos; familia en notas con nombres exactos. Uniones propuestas a Whisper (las hace
  él): 277→274 (Gadādhara), 1850→1028 (Nayanānanda); Vāṇīnātha (1641/1638/265) por mirar juntos.
  Método útil para seguir por grupos (asociados de Mahāprabhu).

- **03-11-2026 — datos (libros de Whisper)**: con la 0.9.0 instalada (copia previa en Documentos › … ›
  «antes de libros Tirtha y GGD 2026-11-03»), 103 fichas: fechas/lugares vacíos rellenados con B. V. Tīrtha,
  *Sri Chaitanya: His Associates* (28 datos), 7 correcciones donde el libro dice otra cosa (Gopāla Bhaṭṭa,
  Gadādhara 1535, Lokanātha, Kāśīśvara, Abhirāma nº 6, Devānanda nº 203, Jayadeva) y en las notas la
  identidad en Kṛṣṇa-līlā según la *Gaura-gaṇoddeśa-dīpikā* (con nº de verso). Whisper confía en ambos
  libros. No se tocaron homónimos dudosos. Sin publicar aún (código): mapa con fondo y zoom
  (`mapData.ts`, Natural Earth), Paramparā primero en búsqueda y filtro, «Otros vaiṣṇavas» plegado al
  abrir, sello «Guru Paramparā» en la ficha y punto naranja en resultados.

- **02-11-2026 — v0.9.0**: Panorama (Estado, Mapa, Ramas, Año vaiṣṇava, Obras) y «Coincidieron en vida».
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.9.0

- **02-11-2026 — v0.8.5**: volver a Revisar sin perder la comprobación; «Escribirlo también en …» por línea.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.5

- **02-11-2026 — v0.8.4**: los nombres largos ya no se salen de las tarjetas de la ficha.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.4

- **02-11-2026 — v0.8.3**: guru por tipo y discípulos agrupados en la ficha; Ajustes siempre a la vista.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.3

- **02-11-2026 — v0.8.2**: filtro de Personas con el nombre primero; nombres que solo cambian en el título.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.2
- **02-11-2026 — datos, árbol** (antes de «Pasar la Guru Paramparā a las fichas», que Whisper pegó para
  revisar): Mādhavendra Purī ← Lakṣmīpati Tīrtha **dīkṣā** y fuera el enlace absurdo a Vṛndāvana dāsa
  Ṭhākura; Mahāprabhu ← Keśava Bhāratī **sannyāsa**; Prabhupāda ← Bhaktisiddhānta **dīkṣā**, ← Keśava
  Mahārāja **sannyāsa**; Bhakti Sāraṅga Gosvāmī bajo **Bhaktisiddhānta** (estaba bajo Śrīdhara M.).
  Copia previa: «antes de corregir el arbol 2026-11-02». Pendiente de Whisper antes de pulsar el botón:
  fichas repetidas en el árbol (Nityānanda 1047/1851, Śrīdhara 1227/1802, Kṛṣṇadāsa Kavirāja 759/1836),
  guru de Nityānanda (¿Mādhavendra o Lakṣmīpati?), Ramahari ← Jagannātha dās Bābājī, Gaura dāsa bābājī
  (Nandagrāma) ← Sanātana, y asociados de Mahāprabhu puestos como dīkṣā.
  Después (Whisper): repetidas ya unidas; Nityānanda (1851) sigue bajo Mādhavendra y tiene además
  Lakṣmīpati Tīrtha como «otro guru» (dīkṣā, según el Bhakti-ratnākara) con una nota que explica las dos
  versiones; los 15 «dīkṣā» de Mahāprabhu (Anupama, Dāmodara Paṇḍit, Prabodhānanda…) pasan a **asociado**.
  Ramahari ← Jagannātha dās Bābājī y Gaura dāsa bābājī (Nandagrāma) ← Sanātana: etiqueta **«Por
  verificar»** y una nota (el árbol sin cambiar), hasta tener la fuente (decisión de Whisper).
  Copia previa: «antes de asociados y Nityananda 2026-11-02».

- **02-11-2026 — datos, «Comprobar los datos» (540 avisos)**, decisiones de Whisper: Śrīnivāsa Ācārya (1466,
  de Gopāla Bhaṭṭa) ≠ Śrīnivāsa Ācārya Ṭhākura (1465, de Caitanya) — ojo: sus notas parecen del mismo
  Śrīnivāsa, se lo dije —; Vīrabhadra 1701/1702/1703 y Vṛndāvana dāsa 1740/1746 distintos. Otros nombres:
  Bhaktisiddhānta (124) + «Bhaktisiddhānta Sarasvatī Ṭhākura», «Śrīla Bhaktisiddhānta Sarasvatī Mahārāja»;
  Advaita (15) + «Śrī Advaita Prabhu»; Mahāprabhu (164) + «Caitanya». Fichas nuevas: «Śrīla Bhagavat dāsa
  Bābājī», «Rasikānanda Dāsa». Unidas (con deshacer): «Bābājī Mahārāja: Two Beyond Duality:» → Gaura Kiśora
  (1819); «The Qualification for Seeing God» → Bhakti Dayita Mādhava (1794); «He translated Līlāmṛta-rāsa-pūra.»
  → Rasikānanda Prabhu (1908). Jagannātha dās Bābājī ← Baladeva: vāṇī. Quedan 559 avisos: ~80 por los dos
  Śrīnivāsa (nombre ambiguo; idea: que `check.rs` prefiera el nombre exacto), «Rādhikāvilāsa Ṭhākura» sin
  ficha, y ~475 que arregla «Pasar la Guru Paramparā a las fichas» (Whisper: «lo hacemos después»).
  Copia previa: «antes de revisar los datos 2026-11-02».

- **02-11-2026 — v0.8.1**: deshacer la unión de fichas; «Vaiṣṇava-maṇḍala» (un solo grupo por nombre).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.1

- **02-11-2026 — datos**: Whisper unió por error en «Nārāyaṇa» (1005) a Nārāyaṇa Dāsa Kavirāja, Nārāyaṇa
  Dāsa Ṭhākura y Nārāyaṇa Paṇḍit. Deshecho a mano (no hay botón): 1005 a su versión anterior a la unión;
  las 3 fichas creadas de nuevo (ids 1917–1919) con sus datos de la copia + el paso a Notas, y sus textos
  de la Papelera reasignados. Copia previa: «antes de deshacer la union de Narayana 2026-11-02».
  Idea: un «Deshacer la unión» de verdad (guardar la ficha borrada en `history` antes de unir).

- **02-11-2026 — v0.8.0**: tarjetas en el texto de la ficha (varias personas del mismo nombre / partes
  unidas, todas a la vista, «Leer todo» en el sitio).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.8.0

- **02-11-2026 — v0.7.9**: la búsqueda principal encuentra también las fichas por sus notas y datos.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.9

- **02-11-2026 — datos (no programa)**: fechas de 20 fichas según la lista de Whisper (convenciones del
  Gauḍīya Maṭha: Mahāprabhu 1533, Jīva 1533–1618), con `update_person` en su app (cada ficha guarda su
  versión anterior). Copia previa en Documentos › … › Copias de seguridad › «antes de las fechas 2026-11-02».
  Sin año de aparición fiable: Uddhāraṇa Datta, Govardhana Dāsa, Rāmahari, Saranga Gosvāmī.

- **02-11-2026 — v0.7.8**: barra fija y «Arriba» en el texto de la ficha, sin títulos repetidos;
  Homónimos siempre a la vista; deshacer «No son la misma persona».
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.8

- **02-11-2026 — v0.7.7**: carpeta «Homónimos»; rojo de las repetidas en el árbol dibujado; título
  del trozo movido = su primera línea.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.7

- **02-11-2026 — v0.7.6**: botón «Unir sus textos en uno solo» a la vista; X en cada ficha parecida.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.6
- **02-11-2026 — v0.7.5**: mover un trozo de texto a otra ficha; «No son la misma persona».
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.5
- **02-11-2026 — v0.7.4**: árbol hondo legible; tipos vāṇī / sannyāsa / veśa; árbol → fichas;
  repetidas en rojo; colorear la línea; otros gurus fuera del árbol; comprobar los datos; enlaces web.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.4
- **01-11-2026 — v0.7.3**: marcas de colores; vistas Todo / Línea de dīkṣā / Línea de śikṣā.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.3
- **01-11-2026 — v0.7.2**: acercar / alejar y mover el árbol dibujado.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.2
- **01-11-2026 — v0.7.1**: orden de los árboles (hojas primero) y ficha en tres columnas.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.1
- **01-11-2026 — v0.7.0** (DATA_VERSION 6): varios gurus en el árbol (`person_links`), deslizador
  Dīkṣā ↔ Śikṣā en el árbol dibujado. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.7.0
- **01-11-2026 — v0.6.2**: etiqueta del tipo de relación siempre visible, también en el árbol dibujado.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.6.2
- **01-11-2026 — v0.6.1**: modelo de IA elegible (por defecto qwen3.5:4b); nombres sin frase de
  prueba aceptados si están en el texto. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.6.1
- **01-11-2026 — v0.6.0**: estilo «Windows 11» (por defecto) con barra de la izquierda, página del
  calendario y Ajustes a pantalla completa.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.6.0
- **01-11-2026 — v0.5.2** (DATA_VERSION 5): tipo de relación en el árbol (dīkṣā / śikṣā / asociado);
  arrastrar bajo otro guru escribe guru y discípulo en las dos fichas; sucesos del Digdarśanī en la
  línea de tiempo y como propuestas de fecha en Rellenar fichas.
- **01-11-2026 — v0.5.1**: líneas guru → discípulos en el árbol; Guru y Discípulos con la lista de
  fichas al editar (y la ficha se coloca sola en el árbol); panel «Con IA local» en Rellenar fichas
  (qwen2.5:7b; aún sin lanzar sobre la biblioteca real). Primera versión para probar la
  actualización automática desde la 0.5.0.
- **31-10-2026 — v0.5.0**: actualizar desde la app (updater firmado + `latest.json`); carpeta a la
  papelera; buscar en el árbol y «Mostrar en el árbol»; «Paramparā…» (poner como discípulo de…);
  colección como lista al editar; vaciar versiones anteriores; Ajustes › Rellenar fichas (calendario,
  discípulos); barra de apartados en la ficha; **arreglo de todas las confirmaciones** (`ask()`).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.5.0

- **31-10-2026 — v0.4.2**: «Un texto por ficha» (unir los textos de cada ficha en uno, con índice por
  fuente). Goswami Grantha no se toca. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.4.2

- **31-10-2026 — v0.4.1**: importar «solo el texto» (nota Markdown limpia, sin PDF ni portada);
  Ajustes › Copias de seguridad › «Ocupar menos espacio» (portadas pequeñas, PDF a Markdown, quitar
  los PDF originales); colecciones sin fichas (Bhajans…) también en la pestaña Personas. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.4.1

- **31-10-2026 — v0.4.0**: buscar y reemplazar en toda la biblioteca; diacríticos sánscritos;
  búsqueda por significado con EmbeddingGemma (Ollama). Probado con una copia (`BIO_DB`).
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.4.0

- **26-10-2026 — v0.3.1**: la app pasa a llamarse **Gaudiya Vaisnavas DB** (antes Bio-Data): ventana,
  instalador, programa (`gaudiya-vaisnavas-db`), repositorio de GitHub (renombrado; los enlaces
  antiguos redirigen). El identificador `com.whispers.biodata` **no cambia**: así la base de datos y
  los ajustes siguen en el mismo sitio. Las copias automáticas pasan a Documentos.
  Motivo: al instalar la 0.3.0 se desinstaló la 0.2.1 con «borrar los datos de la aplicación»; la
  carpeta `%APPDATA%\com.whispers.biodata` quedó vacía y la app reimportó todo desde cero (sin las
  fichas rellenadas). Se recuperó con la copia de prueba de esa mañana; lo reimportado quedó en
  `copias\antes de recuperar 2026-10-26`. **Al desinstalar, no marcar «borrar los datos».**
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.3.1

- **26-10-2026 — v0.3.0**: copias automáticas y restaurar; versiones anteriores;
  calendario vaiṣṇava (calculado + importado de .ics); etiquetas; galería; guru/discípulos enlazados;
  Revisar (repetidas, títulos, vacíos); línea de tiempo; árbol dibujado; filtros Paramparā y tipo;
  exportar a Markdown; aviso de versión nueva. DATA_VERSION 4 (solo tablas nuevas, vacías).
  Probado con una copia de la base de datos (`BIO_DB`); 22 pruebas automáticas. GIF de novedades en
  `docs/novedades-0.3.0.gif` (capturas por CDP + gifenc). Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.3.0

- **26-10-2026**: rellenadas a mano (Claude leyó sus textos) las 33 fichas de la Guru Paramparā:
  aparición, desaparición, lugar, guru, discípulos, obras, otros nombres y notas (padres, identidad
  en Kṛṣṇa-līlā…). Solo campos vacíos. Copia previa: `biodata antes de rellenar fichas.db`.

- **26-10-2026 — v0.2.1**: arreglo: en una instalación nueva la Guru Paramparā salía vacía
  (se rellenaba antes de la importación inicial, cuando aún no había fichas).

- **26-10-2026 — v0.2.0**: estilo de la app «VS Code» (por defecto; el anterior sigue en Ajustes).
  Personas en «Guru Paramparā» (árbol, arrastrar y soltar) y «Otros vaiṣṇavas».
  DATA_VERSION 3 (tabla `person_tree`). Copia previa: `biodata antes de parampara.db`.
  La v0.1.0 ya no abre esta base de datos (formato 3): instalar la 0.2.0.
  Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.2.0

- **25-10-2026 — v0.1.0**: primera versión publicada. Revisión completa de la interfaz;
  estilo «Editor»; texto único dentro de la ficha; atrás/adelante; imagen de ficha
  (DATA_VERSION 2); limpieza de callouts de Obsidian; nombres como enlaces; arreglos de ventana
  estrecha, pestañas y filtro. Release: https://github.com/yogeshdasa-droid/Gaudiya-Vaisnavas-DB/releases/tag/v0.1.0
