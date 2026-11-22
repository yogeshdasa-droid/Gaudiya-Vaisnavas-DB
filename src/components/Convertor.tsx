import { useEffect, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { AlertCircle, BookOpen, CheckCircle2, Download, Upload } from "lucide-react";
import { api, PdfConvertResult } from "../api";
import { T } from "../i18n";

/** Ajustes › Convertor PDF: drag a PDF, convert Balaram→IAST, add to library or export. */
export function ConvertorPane({ t, onToast }: { t: T; onToast: (msg: string) => void }) {
  const [path, setPath] = useState<string | null>(null);
  const [result, setResult] = useState<PdfConvertResult | null>(null);
  const [applyBalaram, setApplyBalaram] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [collection, setCollection] = useState("Libros");
  const [splitMode, setSplitMode] = useState<"one" | "page">("one");
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const loadPdf = async (p: string, bal = applyBalaram) => {
    setBusy(true);
    try {
      const r = await api.convertPdf(p, bal);
      setPath(p);
      setResult(r);
      if (!title) {
        const name = p.replace(/\\/g, "/").split("/").pop()?.replace(/\.pdf$/i, "") ?? "";
        setTitle(name);
      }
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };

  // Tauri file-drop events
  useEffect(() => {
    const up = listen<{ paths: string[] }>("tauri://drag-drop", (e) => {
      setDragging(false);
      const pdf = e.payload.paths.find((p) => p.toLowerCase().endsWith(".pdf"));
      if (pdf) loadPdf(pdf);
    });
    const over = listen("tauri://drag-over", () => setDragging(true));
    const leave = listen("tauri://drag-leave", () => setDragging(false));
    return () => {
      up.then((f) => f());
      over.then((f) => f());
      leave.then((f) => f());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pickFile = async () => {
    const p = await open({ multiple: false, filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (typeof p === "string") loadPdf(p);
  };

  const toggleBalaram = (val: boolean) => {
    setApplyBalaram(val);
    if (path) loadPdf(path, val);
  };

  const addToLibrary = async () => {
    if (!result || !title.trim()) {
      onToast(t.convertorNeedTitle);
      return;
    }
    const { text } = result;
    let sections;
    if (splitMode === "page") {
      sections = text
        .split("\x0c")
        .map((p, i) => ({ heading: `${t.convertorPage} ${i + 1}`, text: p.trim() }))
        .filter((s) => s.text);
    } else {
      const clean = text.replace(/\x0c/g, "\n\n").trim();
      sections = [{ heading: null as null, text: clean }];
    }
    try {
      setBusy(true);
      const id = await api.putBook({
        collection,
        dir: collection,
        title: title.trim(),
        date: null,
        source: `pdf:${path}`,
        sections,
        cover: null,
      });
      onToast(t.convertorAdded(title.trim(), id));
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };

  const exportTxt = async () => {
    if (!result) return;
    const p = await save({
      defaultPath: title + ".txt",
      filters: [{ name: "Text", extensions: ["txt"] }],
    });
    if (!p) return;
    try {
      const clean = result.text.replace(/\x0c/g, "\n---\n");
      await api.writeTextFile(p, clean);
      onToast(t.convertorExported(p));
    } catch (e) {
      onToast(String(e));
    }
  };

  const preview = result?.text
    .slice(0, 1800)
    .replace(/\x0c/g, "\n── pág. ──\n");

  return (
    <div className="conv-pane">
      {/* Drop zone */}
      <div
        ref={dropRef}
        className={`conv-drop${dragging ? " drag-over" : ""}${busy ? " busy" : ""}`}
        onClick={pickFile}
      >
        {busy ? <span className="spinner lg" /> : <Upload size={28} />}
        <span className="conv-drop-name">
          {path ? path.replace(/\\/g, "/").split("/").pop() : t.convertorDrop}
        </span>
        {!path && <small className="muted">{t.convertorDropHint}</small>}
      </div>

      {result && (
        <>
          {/* Encoding badge */}
          <div className="conv-badge">
            {result.is_balaram ? (
              <CheckCircle2 size={14} className="conv-ok" />
            ) : (
              <AlertCircle size={14} className="conv-warn" />
            )}
            <span>
              {result.is_balaram ? t.convertorBalaram : t.convertorNotBalaram}
            </span>
            <span className="muted">{t.convertorPages(result.pages)}</span>
            {result.is_balaram && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={applyBalaram}
                  onChange={(e) => toggleBalaram(e.target.checked)}
                />
                {t.convertorApply}
              </label>
            )}
          </div>

          {/* Text preview */}
          <div className="conv-preview">
            {preview}
            {(result.text.length ?? 0) > 1800 && (
              <span className="muted"> …{t.convertorPages(result.pages)} {t.convertorPreviewMore}</span>
            )}
          </div>

          {/* Options */}
          <div className="conv-form">
            <label className="conv-label">{t.convertorTitle}</label>
            <input
              className="inp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.convertorTitleHint}
            />

            <label className="conv-label">{t.convertorCollection}</label>
            <input
              className="inp"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              list="conv-colls"
            />
            <datalist id="conv-colls">
              <option value="Libros" />
              <option value="Mis textos" />
              <option value="Versos" />
            </datalist>

            <label className="conv-label">{t.convertorSplit}</label>
            <div className="seg small">
              <button
                className={splitMode === "one" ? "on" : ""}
                onClick={() => setSplitMode("one")}
              >
                {t.convertorSplitOne}
              </button>
              <button
                className={splitMode === "page" ? "on" : ""}
                onClick={() => setSplitMode("page")}
              >
                {t.convertorSplitPage}
              </button>
            </div>
          </div>

          <div className="btn-row">
            <button
              className="btn"
              disabled={busy || !title.trim()}
              onClick={addToLibrary}
            >
              <BookOpen size={15} /> {t.convertorAddBtn}
            </button>
            <button className="btn ghost" onClick={exportTxt} disabled={busy}>
              <Download size={15} /> {t.convertorExportBtn}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
