//! A web page inside the window (13-11-2026, Whisper: «que las webs se abran como nuestros vídeos… no puedo hacer clic en
//! los enlaces… en YouTube solo 1 vídeo, sería como ir al canal y elegir»). A frame (iframe) is not enough: many sites
//! refuse to be framed (YouTube's channel pages, Facebook…) and open their links «in a new tab», which a frame cannot
//! do. So the page gets a browser view of its own (a child webview of the main window), laid exactly over the place the
//! page keeps for it (WebPage.tsx tells where, and again when the window changes size); links that want a new tab open
//! in that same view. The page's own address cannot call the app (the app's permissions are only for its own pages).
use tauri::webview::{NewWindowResponse, PageLoadEvent, WebviewBuilder};
use tauri::{AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Url, WebviewUrl};

pub const LABEL: &str = "webpage";

/// Run in every page of the view: links and window.open that want a new tab or window go on in this same view (the
/// view has no tabs; WebView2 does not hand those requests to `on_new_window` reliably).
const SAME_TAB: &str = r#"(() => {
  if (window.top !== window) return;
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    const t = (a.getAttribute("target") || "").toLowerCase();
    if (!t || t === "_self" || t === "_top" || t === "_parent") return;
    if (!/^https?:/i.test(a.href)) return;
    e.preventDefault();
    location.href = a.href;
  }, true);
  const open = window.open;
  window.open = function (u, name, features) {
    if (u) { try { location.href = new URL(u, location.href).href; return window; } catch (_) {} }
    return open.apply(window, arguments);
  };
})();"#;

fn parse(url: &str) -> Result<Url, String> {
    let u: Url = url.parse().map_err(|e| format!("Dirección no válida: {e}"))?;
    if !matches!(u.scheme(), "http" | "https") {
        return Err("Solo páginas web (http/https)".into());
    }
    Ok(u)
}

fn place(wv: &tauri::Webview, x: f64, y: f64, w: f64, h: f64) -> Result<(), String> {
    wv.set_position(LogicalPosition::new(x, y)).map_err(|e| e.to_string())?;
    wv.set_size(LogicalSize::new(w.max(1.0), h.max(1.0))).map_err(|e| e.to_string())
}

/// Shows `url` in the page's browser view at that place (made the first time).
pub fn open(app: &AppHandle, url: &str, x: f64, y: f64, w: f64, h: f64) -> Result<(), String> {
    let u = parse(url)?;
    if let Some(wv) = app.get_webview(LABEL) {
        wv.navigate(u).map_err(|e| e.to_string())?;
        place(&wv, x, y, w, h)?;
        return wv.show().map_err(|e| e.to_string());
    }
    let window = app.get_window("main").ok_or("No hay ventana")?;
    let (h1, h2) = (app.clone(), app.clone());
    let builder = WebviewBuilder::new(LABEL, WebviewUrl::External(u))
        .initialization_script(SAME_TAB)
        // «open in a new tab» that still gets here: in this same view
        .on_new_window(move |to, _| {
            #[cfg(debug_assertions)]
            eprintln!("web: new window {to}");
            let h = h1.clone();
            std::thread::spawn(move || {
                if let Some(wv) = h.get_webview(LABEL) {
                    let _ = wv.navigate(to);
                }
            });
            NewWindowResponse::Deny
        })
        // the address it is at now, for «Open in the browser» and the title bar
        .on_page_load(move |wv, p| {
            if matches!(p.event(), PageLoadEvent::Finished) {
                let _ = h2.emit("web-page", wv.url().map(|u| u.to_string()).unwrap_or_default());
            }
        });
    window.add_child(builder, LogicalPosition::new(x, y), LogicalSize::new(w.max(1.0), h.max(1.0))).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn bounds(app: &AppHandle, x: f64, y: f64, w: f64, h: f64) -> Result<(), String> {
    match app.get_webview(LABEL) {
        Some(wv) => place(&wv, x, y, w, h),
        None => Ok(()),
    }
}

/// Out of sight (the page left, or a dialog over it); it keeps its place in the history of the view.
pub fn hide(app: &AppHandle) -> Result<(), String> {
    match app.get_webview(LABEL) {
        Some(wv) => wv.hide().map_err(|e| e.to_string()),
        None => Ok(()),
    }
}

pub fn show(app: &AppHandle) -> Result<(), String> {
    match app.get_webview(LABEL) {
        Some(wv) => wv.show().map_err(|e| e.to_string()),
        None => Ok(()),
    }
}

/// «back», «fwd» or «reload» inside the page.
pub fn go(app: &AppHandle, dir: &str) -> Result<(), String> {
    let Some(wv) = app.get_webview(LABEL) else { return Ok(()) };
    match dir {
        "back" => wv.eval("history.back()"),
        "fwd" => wv.eval("history.forward()"),
        _ => wv.reload(),
    }
    .map_err(|e| e.to_string())
}

/// The address the view is at now.
pub fn current(app: &AppHandle) -> Option<String> {
    app.get_webview(LABEL).and_then(|wv| wv.url().ok()).map(|u| u.to_string())
}
