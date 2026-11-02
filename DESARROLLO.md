# Gaudiya Vaisnavas DB — guía para continuar el proyecto

Documento para retomar el trabajo en el futuro (una persona o una sesión nueva de Claude).
Resume qué es la app, cómo está hecha, qué reglas no hay que romper y qué queda pendiente.
Última actualización: **31-10-2026** (versión **0.5.0**).

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
   `person_images`, `person_distinct`, `calendar_events`. Si cambia su estructura → subir `DATA_VERSION` en
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

## 5. Qué hace hoy (v0.8.1)

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

### Para la próxima sesión (después del 02-11-2026) — dónde nos quedamos
Publicada la **0.8.1** (DATA_VERSION 6, sin cambio de formato desde la 0.7.0). El 02-11-2026 se
publicaron 0.7.4 a 0.8.1 (ver «Hecho el 02-11-2026» abajo y §8). Ideas para las tarjetas: fuentes
(CC, Bhaktiratnākara…) aparte en cada tarjeta y «Hacer ficha propia» por tarjeta (usaría `move_text`).
Estado:
1. **Le toca a Whisper, con las herramientas nuevas**, en este orden:
   - Ajustes › Revisar › **Comprobar los datos** (casilla «Solo la Guru Paramparā») y arreglar lo que
     salga. En la copia del 02-11 salían, p. ej.: Nityānanda bajo Mādhavendra Purī en el árbol pero su
     ficha dice Īśvara Purī; Raghunātha Bhaṭṭa bajo Caitanya pero su ficha dice Gadādhara Paṇḍita;
     Ramahari dāsa bābājī (n. 1895) con Jagannātha dās Bābājī (desap. 1807 en la ficha); nombres-trozo
     «Bābājī Mahārāja: Two Beyond Duality:», «He translated Līlāmṛta-rāsa-pūra.». Los grupos largos
     («su guru no lo tiene en Discípulos», ~250) van al final.
   - **Fichas en rojo**: unirlas si son la misma persona; si no, X / «No son la misma persona» en la
     ficha o botón derecho › «No es una ficha repetida»; si es otra persona con el mismo nombre
     (Haridāsa, Jagannātha…), mandarla a **Homónimos** (0.7.7). Las 13 del 31-10 (Gaurāṅga/Caitanya,
     Kamalākṣa/Advaita…) no estaban guardadas como distintas: Whisper las irá quitando.
   - Revisar tipos de relación con los nuevos (Prabhupāda ← Keśava M. es **sannyāsa**, no dīkṣā;
     Viśvanātha ← Narottama **vāṇī**); añadir gurus de śikṣā que faltan (Bhaktisiddhānta ← Bhaktivinoda,
     Nārāyaṇa M. ← Prabhupāda y Vāmana M.…); decidir Lokanātha y Śrīvāsa (¿pārṣadas?).
   - Separar textos que mezclan personas del mismo nombre («Haridāsa», «Gopāla»…) con
     **Mover a otra ficha…** y luego **Unir sus textos en uno solo** donde sea la misma persona.
   - Después: Ajustes › Revisar › **Pasar la Guru Paramparā a las fichas** (primero muestra la lista).
2. **Rellenar fichas con IA** (qwen3.5:4b): iba por ~600 de 986; volver a pulsar «Leer todas las
   fichas» tras actualizar. Whisper revisa las propuestas y cuenta qué falla para afinar `ai.rs`.
3. **Ideas sin hacer**: OCR del único PDF escaneado; firma digital del .exe.
   Sigue sin poder deshacerse una unión de fichas (merge): solo con una copia de seguridad.
   Muchos textos tienen marcas de página de PDF como subtítulos («## p. 1») y el nombre repetido
   («## BALARĀMA DĀS» varias veces): limpiarlos sería otra mejora (con Reemplazar o una limpieza única).
4. Para probar la interfaz con la app de Whisper abierta: `WEBVIEW2_USER_DATA_FOLDER` (ver CLAUDE.md).
   La copia de pruebas del 02-11 está en el scratchpad de esa sesión (se borra); hacer otra copia.

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
