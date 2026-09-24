/* Builds dist/ : an encrypted copy of the site that any static host can serve.
   The host only ever stores ciphertext; the passphrase unlocks it in the browser.
   Usage: node scripts/build-encrypted.js "<passphrase>"  */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const pass = process.argv[2];
if (!pass || pass.length < 12) { console.error("Passphrase of at least 12 characters required"); process.exit(1); }
const read = f => fs.readFileSync(path.join(root, f), "utf8");

/* 1. Inline everything into one HTML document */
let html = read("index.html");
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");
html = html.replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read("assets/img/favicon.svg")).toString("base64")}">`);
const font = f => `data:font/woff2;base64,${fs.readFileSync(path.join(root, "assets/fonts", f)).toString("base64")}`;
const css = read("assets/css/styles.css").replace(/url\("\.\.\/fonts\/([^"]+)"\)/g, (_, f) => `url("${font(f)}")`);
html = html.replace(/<link rel="stylesheet" href="assets\/css\/styles.css">/, () => `<style>${css}</style>`);
html = html.replace(/<script src="assets\/js\/data.js"><\/script>\s*<script src="assets\/js\/procedures.js"><\/script>\s*<script src="assets\/js\/app.js"><\/script>/,
  `<script>${read("assets/js/data.js")}\n${read("assets/js/procedures.js")}\n${read("assets/js/app.js")}</script>`);
if (/src="assets\//.test(html) || /href="assets\//.test(html)) throw new Error("Unresolved asset reference");

/* 2. Encrypt: PBKDF2-SHA256 (1,000,000 iterations) -> AES-256-GCM */
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), iterations = 1000000;
const key = crypto.pbkdf2Sync(pass.normalize("NFKC"), salt, iterations, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([cipher.update(html, "utf8"), cipher.final(), cipher.getAuthTag()]);
const payload = { v: 1, kdf: "PBKDF2-SHA256", iterations, salt: salt.toString("base64"), iv: iv.toString("base64"), data: ct.toString("base64") };

/* 3. Write dist */
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist);
fs.writeFileSync(path.join(dist, "payload.json"), JSON.stringify(payload));

/* Source code backup: git archive of HEAD, encrypted with the same key and a fresh IV */
const srcZip = require("child_process").execFileSync("git", ["archive", "--format=zip", "HEAD"], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
const srcIv = crypto.randomBytes(12), srcCipher = crypto.createCipheriv("aes-256-gcm", key, srcIv);
const srcCt = Buffer.concat([srcCipher.update(srcZip), srcCipher.final(), srcCipher.getAuthTag()]);
fs.writeFileSync(path.join(dist, "source.json"), JSON.stringify({ v: 1, iv: srcIv.toString("base64"), data: srcCt.toString("base64") }));
fs.copyFileSync(path.join(root, "unlock", "unlock.js"), path.join(dist, "unlock.js"));
const unlockFonts = [["Playfair Display", 700, "playfair-display-latin-700-normal.woff2"], ["Manrope", 400, "manrope-latin-400-normal.woff2"], ["Manrope", 700, "manrope-latin-700-normal.woff2"]]
  .map(([fam, w, f]) => `@font-face { font-family: "${fam}"; src: url("${font(f)}") format("woff2"); font-weight: ${w}; font-display: swap; }`).join("\n    ");
fs.writeFileSync(path.join(dist, "index.html"), read("unlock/index.html").replace("/*FONTS*/", () => unlockFonts));
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
fs.writeFileSync(path.join(dist, "_headers"), `/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: no-referrer\n  Cache-Control: no-store\n  Content-Security-Policy: default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src data:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'\n`);
console.log(`dist/ built: ${(ct.length / 1024).toFixed(0)} KB encrypted payload`);
