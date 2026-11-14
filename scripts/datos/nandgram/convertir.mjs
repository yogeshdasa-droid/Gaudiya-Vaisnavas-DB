// node convertir.mjs — raw/<slug>.html → md/<slug>.md (clean Markdown) and datos.json (title, url, the facts tables)
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
fs.mkdirSync(dir + "md", { recursive: true });

const ent = (s) =>
  s
    .replace(/&#0?39;|&#8217;|&rsquo;|&#x27;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&quot;|&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const plain = (s) => ent(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function toMd(html) {
  const a = html.indexOf("ach-article");
  const b = html.indexOf("</article>", a);
  if (a < 0 || b < 0) return null;
  let s = html.slice(html.lastIndexOf("<", a), b);
  s = s
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<button[\s\S]*?<\/button>/g, "")
    // pictures and their captions go; the verses (also in <figure>) stay
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/g, (f) => (/<img\b/.test(f) ? "" : f.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g, (_, c) => `\n\n— ${c}\n\n`)))
    .replace(/<nav[\s\S]*?<\/nav>/g, "")
    .replace(/<i[^>]*class="fa[^"]*"[^>]*>\s*<\/i>/g, "")
    .replace(/<p[^>]*class="[^"]*(ach-totop|ach-complete-meta|ach-pastime-kicker)[^"]*"[\s\S]*?<\/p>/g, "")
    .replace(/<a[^>]*class="[^"]*(anchor|heading-anchor|ach-anchor)[^"]*"[^>]*>[\s\S]*?<\/a>/g, "")
    // facts tables: «- **Father:** Kumaradeva»
    .replace(/<tr[^>]*>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<\/tr>/g, (_, k, v) => `\n- **${plain(k)}:** ${plain(v)}\n`)
    .replace(/<summary[^>]*>([\s\S]*?)<\/summary>/g, (_, t) => `\n\n**${plain(t)}**\n\n`)
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, (_, t) => `\n\n# ${plain(t)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, t) => `\n\n## ${plain(t)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_, t) => `\n\n### ${plain(t)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/g, (_, t) => `\n\n#### ${plain(t)}\n\n`)
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/g, (_, __, t) => (plain(t) ? `**${plain(t)}**` : ""))
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/g, (_, __, t) => (plain(t) ? `*${plain(t)}*` : ""))
    .replace(/<li[^>]*>/g, "\n- ")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<blockquote[^>]*>/g, "\n\n")
    .replace(/<p[^>]*class="[^"]*verse[^"]*"[^>]*>/g, "\n\n> ")
    .replace(/<\/(p|div|li|blockquote|tr|dd|dt|section|ul|ol|table|details)>/g, "\n")
    .replace(/<[^>]+>/g, "");
  s = ent(s)
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").replace(/\s*#$/, "").trim())
    .filter(
      (l) =>
        !/^(\*\*)?\s*(Open as a separate page|Back to top|Reading tools|A A\+ ?Listen|Print \/ save as PDF|Main biography page|English ?हिन्दी|\d+ min read|\d+ chapters|Chapter \d+)\s*(\*\*)?$/i.test(l) &&
        l !== "**" &&
        l !== "*",
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  s = s.replace(/## Contents[\s\S]*?(?=## Introduction)/, "");
  s = s.replace(/\n(About This Biography|Verified\b|\*\*About This Biography)[\s\S]*$/, "");
  return s;
}

/** the first facts table (the introduction's) as {label: value} */
function facts(html) {
  const a = html.indexOf("ach-table--facts");
  if (a < 0) return {};
  const t = html.slice(a, html.indexOf("</table>", a));
  const out = {};
  for (const m of t.matchAll(/<tr[^>]*>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)) out[plain(m[1])] = plain(m[2]);
  return out;
}

const datos = {};
for (const f of fs.readdirSync(dir + "raw")) {
  const slug = f.replace(/\.html$/, "");
  const html = fs.readFileSync(dir + "raw/" + f, "utf8");
  const md = toMd(html);
  if (!md) {
    console.log(slug, "sin artículo");
    continue;
  }
  const title = plain((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? slug);
  const sub = plain((html.match(/<p[^>]*class="[^"]*ach-pastime-lead[^"]*"[^>]*>([\s\S]*?)<\/p>/) ?? [])[1] ?? "");
  fs.writeFileSync(`${dir}md/${slug}.md`, md);
  datos[slug] = { title, sub, url: `https://nandgramdham.org/acharyas/${slug}/`, facts: facts(html), words: md.split(/\s+/).length };
}
fs.writeFileSync(dir + "datos.json", JSON.stringify(datos, null, 1));
console.log("convertidas:", Object.keys(datos).length);
