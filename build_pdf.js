const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { marked } = require("marked");

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error("Usage: node build_pdf.js <input.md> <output.pdf>");
  process.exit(1);
}

const md = fs.readFileSync(input, "utf8");
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<style>
  @page { margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a1f2b; font-size: 12.5px; line-height: 1.6; }
  h1 { font-size: 26px; color: #0f6b3b; border-bottom: 3px solid #16a34a; padding-bottom: 8px; margin: 0 0 18px; }
  h2 { font-size: 18px; color: #0f6b3b; margin: 26px 0 10px; border-left: 4px solid #16a34a; padding-left: 10px; }
  h3 { font-size: 14.5px; color: #1a1f2b; margin: 18px 0 6px; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 10px; padding-left: 22px; }
  li { margin: 3px 0; }
  strong { color: #0f6b3b; }
  code { background: #eef2f0; padding: 1px 5px; border-radius: 4px; font-size: 11.5px; }
  blockquote { margin: 12px 0; padding: 10px 14px; background: #f0fdf4; border-left: 4px solid #16a34a; color: #14532d; border-radius: 0 6px 6px 0; }
  blockquote p { margin: 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 11.5px; }
  th { background: #16a34a; color: #fff; text-align: left; padding: 7px 9px; }
  td { border: 1px solid #d8e0da; padding: 6px 9px; vertical-align: top; }
  tr:nth-child(even) td { background: #f6faf7; }
  hr { border: none; border-top: 1px solid #d8e0da; margin: 22px 0; }
  h2, h3 { page-break-after: avoid; }
  table, blockquote { page-break-inside: avoid; }
</style></head><body>
${body}
</body></html>`;

const tmpHtml = path.join(path.dirname(output), ".build_tmp.html");
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
  "--headless",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${output}`,
  "file:///" + tmpHtml.replace(/\\/g, "/"),
]);

fs.unlinkSync(tmpHtml);
console.log("PDF généré :", output);
