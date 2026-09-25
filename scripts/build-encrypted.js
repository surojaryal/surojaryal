/* Builds dist/ : an encrypted copy of the site that any static host can serve.
   The host only ever stores ciphertext. The 256-bit content key lives in the
   Supabase table ops.site_secret and is released only to invited, signed-in users.

   Usage:
     HAV_CONTENT_KEY=<base64 32-byte key> node scripts/build-encrypted.js
     node scripts/build-encrypted.js --new-key      (generates a key and prints it once)
   Cloud settings (public URL and publishable key) are read from supabase/config.json. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");

let keyB64 = process.env.HAV_CONTENT_KEY || "";
if (process.argv.includes("--new-key")) { keyB64 = crypto.randomBytes(32).toString("base64"); console.log("NEW CONTENT KEY (store it in ops.site_secret, never in git): " + keyB64); }
const key = Buffer.from(keyB64, "base64");
if (key.length !== 32) { console.error("Set HAV_CONTENT_KEY to a base64 32-byte key, or pass --new-key"); process.exit(1); }
const cloud = process.env.HAV_TEST_CLOUD ? JSON.parse(process.env.HAV_TEST_CLOUD) : JSON.parse(read("supabase/config.json"));
if (!process.env.HAV_TEST_CLOUD && (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(cloud.url) || !cloud.key)) { console.error("supabase/config.json needs url and key"); process.exit(1); }
const cloudConfig = `window.HAV_CLOUD = ${JSON.stringify({ url: cloud.url, key: cloud.key })};`;

/* 1. Inline everything into one HTML document */
let html = read("index.html");
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
html = html.replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read("assets/img/favicon.svg")).toString("base64")}">`);
const font = f => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "assets/fonts", f)).toString("base64")}`;
const css = read("assets/css/styles.css").replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (_, f) => `url("${font(f)}")`);
html = html.replace(/<link rel="stylesheet" href="assets\/css\/styles.css">/, () => `<style>${css}</style>`);
html = html.replace(/<script src="assets\/js\/cloud.js"><\/script>\s*<script src="assets\/js\/data.js"><\/script>\s*<script src="assets\/js\/procedures.js"><\/script>\s*<script src="assets\/js\/targets.js"><\/script>\s*<script src="assets\/js\/app.js"><\/script>/,
  () => `<script>${cloudConfig}\n${read("assets/js/cloud.js")}\n${read("assets/js/data.js")}\n${read("assets/js/procedures.js")}\n${read("assets/js/targets.js")}\n${read("assets/js/app.js")}</script>`);
if (/src="assets\//.test(html) || /href="assets\//.test(html)) throw new Error("Unresolved asset reference");

/* 2. Encrypt with AES-256-GCM */
const enc = buf => { const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", key, iv); return { v: 2, iv: iv.toString("base64"), data: Buffer.concat([c.update(buf), c.final(), c.getAuthTag()]).toString("base64") }; };
const payload = enc(Buffer.from(html, "utf8"));

/* 3. Write dist */
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist);
fs.writeFileSync(path.join(dist, "payload.json"), JSON.stringify(payload));
/* Source code backup: git archive of HEAD, same key, fresh IV */
const srcZip = require("child_process").execFileSync("git", ["archive", "--format=zip", "HEAD"], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
fs.writeFileSync(path.join(dist, "source.json"), JSON.stringify(enc(srcZip)));
fs.writeFileSync(path.join(dist, "cloud-config.js"), cloudConfig + "\n");
fs.copyFileSync(path.join(root, "assets", "js", "cloud.js"), path.join(dist, "cloud.js"));
fs.copyFileSync(path.join(root, "unlock", "unlock.js"), path.join(dist, "unlock.js"));
const unlockFonts = [["Playfair Display", 700, "playfair-display-latin-700-normal.woff2"], ["Manrope", 400, "manrope-latin-400-normal.woff2"], ["Manrope", 700, "manrope-latin-700-normal.woff2"]]
  .map(([fam, w, f]) => `@font-face { font-family: "${fam}"; src: url("${font(f)}") format("woff2"); font-weight: ${w}; font-display: swap; }`).join("\n    ");
fs.writeFileSync(path.join(dist, "index.html"), read("unlock/index.html").replace("/*FONTS*/", () => unlockFonts));
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log(`dist/ built: ${(payload.data.length * 0.75 / 1024).toFixed(0)} KB encrypted payload`);
