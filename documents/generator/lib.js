/* Shared document builder for the Haverton Recruitment pack.
   House style: Arial 12, navy headings, gold rules, plain tables, A4. */
const fs = require("fs");
const path = require("path");
const d = require("docx");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, Header, Footer, PageNumber, LevelFormat, PageBreak,
  TableOfContents, VerticalAlign
} = d;

const NAVY = "1B2B45", GOLD = "B8914A", GREY = "4A5A66", LIGHT = "F3EFE6", LINE = "D9D2C3";
const FONT = "Arial";
const PAGE_W = 11906, MARGIN = 1134; // A4, 2cm margins
const CONTENT_W = PAGE_W - MARGIN * 2; // 9638

/* Inline markup: **bold** and _italic_ */
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0, m;
  const s = String(text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(new TextRun({ text: s.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < s.length) out.push(new TextRun({ text: s.slice(last), ...base }));
  return out.length ? out : [new TextRun({ text: "", ...base })];
}

const P = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run || {}), spacing: { after: 140, line: 300 }, alignment: opts.align, keepNext: opts.keepNext, indent: opts.indent });
const H1 = text => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], pageBreakBefore: false });
const H2 = text => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)], keepNext: true });
const H3 = text => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)], keepNext: true });
const BR = () => new Paragraph({ children: [new PageBreak()] });
const bullets = items => items.map(t => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: runs(t), spacing: { after: 80, line: 290 } }));
const numbered = (items, ref = "numbers") => items.map(t => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 90, line: 290 } }));
/* Numbered legal clauses: [["1.1", "text"], ...] rendered with a hanging indent */
const clauses = items => items.map(([n, t]) => new Paragraph({
  children: /^\d+$/.test(n) ? [new TextRun({ text: n + "\t" + t, bold: true, color: NAVY })] : [new TextRun({ text: n + "\t" }), ...runs(t)],
  tabStops: [{ type: "left", position: 720 }], indent: { left: 720, hanging: 720 }, spacing: { after: 120, line: 290 }
}));

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
function cell(text, width, opts = {}) {
  const paras = (Array.isArray(text) ? text : [text]).map(t => new Paragraph({ children: runs(t, opts.head ? { bold: true, color: NAVY } : opts.bold ? { bold: true } : {}), spacing: { after: 40, line: 270 } }));
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, verticalAlign: VerticalAlign.TOP,
    shading: opts.head ? { fill: LIGHT, type: ShadingType.CLEAR, color: "auto" } : opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 80, bottom: 80, left: 110, right: 110 }, children: paras
  });
}
/* table(headers, rows, weights) – weights are relative column widths */
function table(headers, rows, weights) {
  const n = (headers || rows[0]).length;
  const w = weights || Array(n).fill(1);
  const total = w.reduce((a, b) => a + b, 0);
  const cols = w.map(x => Math.floor(CONTENT_W * x / total));
  cols[cols.length - 1] += CONTENT_W - cols.reduce((a, b) => a + b, 0);
  const trs = [];
  if (headers) trs.push(new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, cols[i], { head: true })) }));
  rows.forEach(r => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, cols[i], { bold: i === 0 && headers === null })) })));
  return [new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: cols, rows: trs }), new Paragraph({ spacing: { after: 120 }, children: [] })];
}
/* Two-column "label | answer box" form table */
function form(fields, labelWeight = 2, valueWeight = 3) {
  return table(null, fields.map(f => Array.isArray(f) ? f : [f, ""]), [labelWeight, valueWeight]);
}
/* Shaded note box */
function box(title, lines, fill = "FBF6EA") {
  const paras = [];
  if (title) paras.push(new Paragraph({ children: [new TextRun({ text: title, bold: true, color: NAVY })], spacing: { after: 60 } }));
  (Array.isArray(lines) ? lines : [lines]).forEach(l => paras.push(new Paragraph({ children: runs(l), spacing: { after: 60, line: 280 } })));
  return [new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR, color: "auto" },
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD }, bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD }, left: { style: BorderStyle.SINGLE, size: 18, color: GOLD }, right: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
      margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: paras })] })]
  }), new Paragraph({ spacing: { after: 160 }, children: [] })];
}
const sign = (parties) => table(null, parties.flatMap(p => [[`**Signed for ${p}**`, ""], ["Name", ""], ["Position", ""], ["Date", ""]]), [2, 3]);

/* Title block used at the top of every document */
function titleBlock(title, subtitle, meta) {
  const out = [
    new Paragraph({ children: [new TextRun({ text: "HAVERTON CARE LIMITED", bold: true, color: GOLD, size: 18, characterSpacing: 40 })], spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: title, bold: true, color: NAVY, size: 40 })], spacing: { after: 80 } })
  ];
  if (subtitle) out.push(new Paragraph({ children: [new TextRun({ text: subtitle, color: GREY, size: 24 })], spacing: { after: 160 } }));
  out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 4 } }, spacing: { after: 200 }, children: [] }));
  if (meta) out.push(...table(null, meta, [2, 5]));
  return out;
}

function build(file, children, opts = {}) {
  const status = opts.status || "Version 1.1 | September 2026";
  const doc = new Document({
    creator: "Haverton Care Limited", title: opts.title || path.basename(file, ".docx"),
    styles: {
      default: { document: { run: { font: FONT, size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: FONT, color: NAVY }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0, keepNext: true } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 27, bold: true, font: FONT, color: NAVY }, paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 1, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: FONT, color: GOLD }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2, keepNext: true } }
      ]
    },
    numbering: { config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
      { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
      { reference: "numbers3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] }
    ] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Haverton Care Limited | Haverton Recruitment And Staffing", size: 16, color: GREY })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: (opts.footer || status) + " | Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY }),
        new TextRun({ text: " of ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GREY })] })] }) },
      children
    }]
  });
  return Packer.toBuffer(doc).then(buf => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf); return file; });
}

const toc = () => [new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }), BR()];
const DRAFT_LEGAL = ["This is a **draft prepared for review by a qualified solicitor** before it is used. It is written in plain English on purpose. It is not legal advice, and the law and regulator guidance can change.", "Check every item marked **[confirm]** before use."];

module.exports = { P, H1, H2, H3, BR, bullets, numbered, clauses, table, form, box, sign, titleBlock, build, toc, runs, DRAFT_LEGAL, NAVY, GOLD };
