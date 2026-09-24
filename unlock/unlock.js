/* Sign-in gate: authenticate with Supabase, fetch the content key (released by the
   database only to invited members), then decrypt and open the site in this tab. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const forms = ["f-signin", "f-reset", "f-setpw"];
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  let pendingSession = null;

  function show(id) { forms.forEach(f => { $(f).hidden = f !== id; }); $("busy").hidden = true; }
  function busy(text) { forms.forEach(f => { $(f).hidden = true; }); $("busy").hidden = false; $("busy-t").textContent = text; }
  function err(msg) { $("e").textContent = msg || ""; if (msg) $("m").textContent = ""; }
  function ok(msg) { $("m").textContent = msg || ""; if (msg) $("e").textContent = ""; }
  function friendly(e) {
    const m = String((e && e.message) || e || "");
    if (/invalid login credentials/i.test(m)) return "Email or password is incorrect.";
    if (/email not confirmed/i.test(m)) return "Please accept your invitation email first.";
    if (/rate limit|too many/i.test(m)) return "Too many attempts. Please wait a few minutes and try again.";
    if (/failed to fetch|network/i.test(m)) return "Cannot reach the server. Check your internet connection.";
    return m || "Something went wrong. Please try again.";
  }

  async function openSite() {
    busy("Opening Haverton Operations…");
    const rows = await HAVCloud.api("GET", "site_secret?select=content_key");
    if (!rows || !rows.length) {
      await HAVCloud.signOut();
      throw new Error("This account is not authorised for Haverton Operations. Ask the Director to add you.");
    }
    const key = await crypto.subtle.importKey("raw", b64(rows[0].content_key), { name: "AES-GCM" }, true, ["decrypt"]);
    const r = await fetch("payload.json", { cache: "no-store" });
    if (!r.ok) throw new Error("Could not load the site. Please refresh.");
    const pl = await r.json();
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(pl.iv) }, key, b64(pl.data));
    try { sessionStorage.setItem("hav-k", JSON.stringify(await crypto.subtle.exportKey("jwk", key))); } catch (_) { }
    const html = new TextDecoder().decode(plain);
    document.open(); document.write(html); document.close();
  }

  async function start() {
    if (!window.isSecureContext || !window.crypto || !crypto.subtle) { show("f-signin"); err("This page must be opened over https."); return; }
    if (!window.HAVCloud || !HAVCloud.enabled) { show("f-signin"); err("Sign-in is not configured."); return; }
    const link = HAVCloud.sessionFromUrl();
    if (link) {
      pendingSession = link.session;
      $("setpw-intro").textContent = link.type === "recovery" ? "Set a new password for your Haverton account." : "Welcome. Choose a password for your Haverton account.";
      show("f-setpw"); $("np1").focus(); return;
    }
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    if (params.get("error_description")) { show("f-signin"); err(params.get("error_description").replace(/\+/g, " ") + ". Ask for a new link."); history.replaceState(null, "", location.pathname); return; }
    if (HAVCloud.readSession()) {
      try { await HAVCloud.session(); await openSite(); return; }
      catch (e) { show("f-signin"); if (e.status !== 401) err(friendly(e)); }
    } else show("f-signin");
    const last = (() => { try { return localStorage.getItem("hav-last-email") || ""; } catch (_) { return ""; } })();
    if (last) { $("em").value = last; $("pw").focus(); } else $("em").focus();
  }

  $("f-signin").addEventListener("submit", async ev => {
    ev.preventDefault(); err("");
    const email = $("em").value.trim();
    busy("Signing in…");
    try {
      await HAVCloud.signIn(email, $("pw").value);
      try { localStorage.setItem("hav-last-email", email.toLowerCase()); } catch (_) { }
      await openSite();
    } catch (e) { show("f-signin"); err(friendly(e)); $("pw").select(); }
  });
  $("f-reset").addEventListener("submit", async ev => {
    ev.preventDefault(); err("");
    busy("Sending…");
    try { await HAVCloud.requestReset($("em2").value); show("f-reset"); ok("If that email has an account, a reset link is on its way. Check your inbox and spam folder."); }
    catch (e) { show("f-reset"); err(friendly(e)); }
  });
  $("f-setpw").addEventListener("submit", async ev => {
    ev.preventDefault(); err("");
    const a = $("np1").value, b = $("np2").value;
    if (a.length < 12) { err("Use at least 12 characters."); return; }
    if (a !== b) { err("The two passwords do not match."); return; }
    busy("Saving password…");
    try {
      const s = await HAVCloud.setPassword(pendingSession, a);
      try { localStorage.setItem("hav-last-email", (s.email || "").toLowerCase()); } catch (_) { }
      await openSite();
    } catch (e) { show("f-setpw"); err(friendly(e)); }
  });
  $("to-reset").addEventListener("click", () => { err(""); ok(""); $("em2").value = $("em").value; show("f-reset"); $("em2").focus(); });
  $("to-signin").addEventListener("click", () => { err(""); ok(""); show("f-signin"); $("em").focus(); });

  start().catch(e => { show("f-signin"); err(friendly(e)); });
})();
