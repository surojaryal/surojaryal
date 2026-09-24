(function () {
  "use strict";
  const f = document.getElementById("f"), p = document.getElementById("p"), b = document.getElementById("b"), e = document.getElementById("e");
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  let payload;

  async function getPayload() {
    if (!payload) { const r = await fetch("payload.json", { cache: "no-store" }); if (!r.ok) throw new Error("Could not load site data"); payload = await r.json(); }
    return payload;
  }
  async function deriveKey(pass, pl) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass.normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(pl.salt), iterations: pl.iterations, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }
  async function open(key, pl) {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(pl.iv) }, key, b64(pl.data));
    const html = new TextDecoder().decode(plain);
    try { sessionStorage.setItem("hav-k", JSON.stringify(await crypto.subtle.exportKey("jwk", key))); } catch (_) { }
    document.open(); document.write(html); document.close();
  }
  async function resume() {
    try {
      const jwk = sessionStorage.getItem("hav-k"); if (!jwk) return;
      const pl = await getPayload();
      const key = await crypto.subtle.importKey("jwk", JSON.parse(jwk), { name: "AES-GCM" }, true, ["decrypt"]);
      await open(key, pl);
    } catch (_) { try { sessionStorage.removeItem("hav-k"); } catch (__) { } }
  }
  f.addEventListener("submit", async ev => {
    ev.preventDefault(); e.textContent = ""; b.disabled = true; b.textContent = "Unlocking…";
    try {
      const pl = await getPayload();
      const key = await deriveKey(p.value, pl);
      await open(key, pl);
    } catch (err) {
      e.textContent = err.message === "Could not load site data" ? err.message : "Incorrect passphrase.";
      b.disabled = false; b.textContent = "Unlock"; p.select();
    }
  });
  if (!window.isSecureContext || !crypto.subtle) e.textContent = "This page must be opened over https.";
  else resume();
})();
