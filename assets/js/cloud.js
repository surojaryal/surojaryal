/* Haverton Operations: Supabase sign-in and data API, dependency free.
   Used by the sign-in page (before the site is decrypted) and by the app itself.
   Config comes from window.HAV_CLOUD = { url, key } (the key is the public anon/publishable key). */
(function () {
  "use strict";
  const CFG = window.HAV_CLOUD || {};
  const AUTH_KEY = "hav-auth";
  const enabled = !!(CFG.url && CFG.key);

  function readSession() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (_) { return null; } }
  function writeSession(s) { try { s ? localStorage.setItem(AUTH_KEY, JSON.stringify(s)) : localStorage.removeItem(AUTH_KEY); } catch (_) { } }
  function fromToken(t) {
    return { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (t.expires_in || 3600), email: (t.user && t.user.email) || "" };
  }
  async function authFetch(path, body, token) {
    const r = await fetch(CFG.url + "/auth/v1" + path, {
      method: body === undefined ? "GET" : (body && body._method) || "POST",
      headers: Object.assign({ apikey: CFG.key, "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
      body: body === undefined ? undefined : JSON.stringify(Object.assign({}, body, { _method: undefined }))
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = j.error_description || j.msg || j.message || j.error || ("Request failed (" + r.status + ")");
      const e = new Error(msg); e.status = r.status; throw e;
    }
    return j;
  }
  async function signIn(email, password) {
    const t = await authFetch("/token?grant_type=password", { email: email.trim().toLowerCase(), password });
    const s = fromToken(t); writeSession(s); return s;
  }
  async function refresh(s) {
    const t = await authFetch("/token?grant_type=refresh_token", { refresh_token: s.refresh_token });
    const n = fromToken(t); if (!n.email) n.email = s.email; writeSession(n); return n;
  }
  let refreshing = null;
  async function session() {
    let s = readSession();
    if (!s) return null;
    if (s.expires_at - 60 < Date.now() / 1000) {
      refreshing = refreshing || refresh(s).finally(() => { refreshing = null; });
      try { s = await refreshing; } catch (e) { if (e.status && e.status < 500) writeSession(null); throw e; }
    }
    return s;
  }
  async function signOut() {
    const s = readSession();
    writeSession(null);
    if (s) { try { await authFetch("/logout", {}, s.access_token); } catch (_) { } }
  }
  async function requestReset(email) {
    await authFetch("/recover", { email: email.trim().toLowerCase() });
  }
  /* Invite and recovery links land on the site with tokens in the URL fragment */
  function sessionFromUrl() {
    const h = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    if (!h.get("access_token")) return null;
    const s = { access_token: h.get("access_token"), refresh_token: h.get("refresh_token"), expires_at: Math.floor(Date.now() / 1000) + Number(h.get("expires_in") || 3600), email: "" };
    history.replaceState(null, "", location.pathname + location.search);
    return { session: s, type: h.get("type") || "" };
  }
  async function setPassword(s, password) {
    const u = await authFetch("/user", { password, data: { must_change_password: false }, _method: "PUT" }, s.access_token);
    s.email = u.email || s.email; writeSession(s); return s;
  }
  async function getUser(s) { return authFetch("/user", undefined, s.access_token); }

  /* PostgREST on the ops schema */
  async function api(method, path, body, extraHeaders) {
    let s = await session();
    if (!s) { const e = new Error("Not signed in"); e.status = 401; throw e; }
    const go = tok => fetch(CFG.url + "/rest/v1/" + path, {
      method,
      headers: Object.assign({ apikey: CFG.key, Authorization: "Bearer " + tok, "Accept-Profile": "ops", "Content-Profile": "ops", "Content-Type": "application/json" }, extraHeaders || {}),
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let r = await go(s.access_token);
    if (r.status === 401) { s = await refresh(s); r = await go(s.access_token); }
    const text = await r.text();
    let j = null; try { j = text ? JSON.parse(text) : null; } catch (_) { j = text; }
    if (!r.ok) { const e = new Error((j && (j.message || j.hint)) || ("Request failed (" + r.status + ")")); e.status = r.status; e.code = j && j.code; throw e; }
    return j;
  }
  /* Fetch every row of a table in pages of 1,000 */
  async function all(table, query) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const rows = await api("GET", table + "?" + (query || "select=*"), undefined, { Range: `${from}-${from + 999}`, "Range-Unit": "items" });
      out.push(...rows);
      if (rows.length < 1000) return out;
    }
  }

  window.HAVCloud = { enabled, config: CFG, readSession, session, signIn, signOut, requestReset, sessionFromUrl, setPassword, getUser, api, all };
})();
