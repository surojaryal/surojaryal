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
html = html.replace(/<link rel="stylesheet" href="assets\/css\/styles.css">/, `<style>${read("assets/css/styles.css")}</style>`);
html = html.replace(/<script src="assets\/js\/data.js"><\/script>\s*<script src="assets\/js\/procedures.js"><\/script>\s*<script src="assets\/js\/app.js"><\/script>/,
  `<script>${read("assets/js/data.js")}\n${read("assets/js/procedures.js")}\n${read("assets/js/app.js")}</script>`);
if (/src="assets\//.test(html) || /href="assets\//.test(html)) throw new Error("Unresolved asset reference");

/* 2. Encrypt: PBKDF2-SHA256 (600k) -> AES-256-GCM */
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), iterations = 1000000;
const key = crypto.pbkdf2Sync(pass.normalize("NFKC"), salt, iterations, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([cipher.update(html, "utf8"), cipher.final(), cipher.getAuthTag()]);
const payload = { v: 1, kdf: "PBKDF2-SHA256", iterations, salt: salt.toString("base64"), iv: iv.toString("base64"), data: ct.toString("base64") };

/* 3. Write dist */
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist);
fs.writeFileSync(path.join(dist, "payload.json"), JSON.stringify(payload));
fs.copyFileSync(path.join(root, "unlock", "unlock.js"), path.join(dist, "unlock.js"));
fs.writeFileSync(path.join(dist, "index.html"), read("unlock/index.html"));
fs.writeFileSync(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
fs.writeFileSync(path.join(dist, "_headers"), `/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: no-referrer\n  Cache-Control: no-store\n  Content-Security-Policy: default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'\n`);
console.log(`dist/ built: ${(ct.length / 1024).toFixed(0)} KB encrypted payload`);
