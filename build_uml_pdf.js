const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { marked } = require("marked");

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error("Usage: node build_uml_pdf.js <input.md> <output.pdf>");
  process.exit(1);
}

let md = fs.readFileSync(input, "utf8");

// Extraire les blocs mermaid AVANT marked pour préserver leur contenu brut.
const mermaidBlocks = [];
md = md.replace(/```mermaid\s*([\s\S]*?)```/g, (_, code) => {
  const token = `MERMAIDBLOCK${mermaidBlocks.length}TOKEN`;
  mermaidBlocks.push(code.trim());
  return token;
});

let body = marked.parse(md);

// Réinjecter les diagrammes mermaid (marked a pu les emballer dans un <p>).
mermaidBlocks.forEach((code, i) => {
  const re = new RegExp(`(<p>)?MERMAIDBLOCK${i}TOKEN(</p>)?`, "g");
  body = body.replace(re, `<pre class="mermaid">\n${code}\n</pre>`);
});

const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<style>
  @page { margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a1f2b; font-size: 12.5px; line-height: 1.6; }
  h1 { font-size: 25px; color: #0f6b3b; border-bottom: 3px solid #16a34a; padding-bottom: 8px; margin: 0 0 16px; }
  h2 { font-size: 18px; color: #0f6b3b; margin: 24px 0 10px; border-left: 4px solid #16a34a; padding-left: 10px; page-break-after: avoid; }
  h3 { font-size: 14px; color: #1a1f2b; margin: 16px 0 6px; }
  p { margin: 0 0 9px; }
  ul { margin: 0 0 9px; padding-left: 22px; }
  li { margin: 3px 0; }
  strong { color: #0f6b3b; }
  code { background: #eef2f0; padding: 1px 5px; border-radius: 4px; font-size: 11.5px; }
  blockquote { margin: 12px 0; padding: 10px 14px; background: #f0fdf4; border-left: 4px solid #16a34a; color: #14532d; border-radius: 0 6px 6px 0; }
  blockquote p { margin: 0; }
  hr { border: none; border-top: 1px solid #d8e0da; margin: 20px 0; }
  pre.mermaid { text-align: center; background: #fff; margin: 14px 0 18px; page-break-inside: avoid; }
  pre.mermaid svg { max-width: 100%; height: auto; }
</style></head><body>
${body}
<script>
  mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: {
    primaryColor: "#e9f7ef", primaryBorderColor: "#16a34a", primaryTextColor: "#14532d",
    lineColor: "#0f6b3b", fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "14px"
  }, flowchart: { curve: "basis" } });
</script>
</body></html>`;

const tmpHtml = path.join(path.dirname(output), ".uml_tmp.html");
fs.writeFileSync(tmpHtml, html, "utf8");

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const edge = edgeCandidates.find((p) => fs.existsSync(p));
if (!edge) {
  console.error("Microsoft Edge introuvable.");
  process.exit(1);
}

execFileSync(edge, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--virtual-time-budget=12000",
  `--print-to-pdf=${output}`,
  "file:///" + tmpHtml.replace(/\\/g, "/"),
], { stdio: "inherit" });

fs.unlinkSync(tmpHtml);
console.log("PDF généré :", output);
