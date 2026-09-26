/* Haverton Operations: single-page app. No build step.
   Local mode: register data is held in this browser only (localStorage).
   Cloud mode (signed in): data syncs to Supabase; the browser keeps a cache for speed and offline use. */
(function () {
  "use strict";

  const LEGACY_KEY = "haverton-ops-v1";
  const CLOUD = !!(window.HAVCloud && HAVCloud.enabled && HAVCloud.readSession());
  const USER = CLOUD ? (HAVCloud.readSession().email || "") : "";
  const STORE_KEY = CLOUD ? "haverton-ops-cloud:" + USER : LEGACY_KEY;
  const SNAP_KEY = "haverton-ops-snap:" + USER;
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");

  /* ---------------- helpers (also used by data.js calculations) ---------------- */
  window.num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  window.loadedCost = pay => pay ? pay * (1 + HAV.loads.holiday + HAV.loads.ni + HAV.loads.pension) + HAV.loads.other : 0;
  window.addDays = (d, n) => { if (!d) return ""; const t = new Date(d + "T00:00:00"); if (isNaN(t)) return ""; t.setDate(t.getDate() + n); return iso(t); };
  window.daysOverdue = r => {
    if (!r["Due Date"]) return 0;
    const outstanding = num(r["Net"]) * (1 + num(r["VAT Rate %"]) / 100) - num(r["Paid"]);
    if (outstanding <= 0.005) return 0;
    return Math.max(0, Math.floor((today() - new Date(r["Due Date"] + "T00:00:00")) / 864e5));
  };
  window.complianceBlock = r => {
    const b = [];
    if (r["Consent"] !== "Yes") b.push("No consent to represent");
    if (r["Privacy Notice"] !== "Yes") b.push("Privacy notice not recorded");
    if (["Expired", "Issue"].includes(r["RTW"])) b.push("Right to work " + r["RTW"].toLowerCase());
    if (r["RTW Expiry"] && r["RTW Expiry"] < iso(today())) b.push("RTW follow-up date passed");
    if (["Expired", "Issue"].includes(r["DBS"])) b.push("DBS " + r["DBS"].toLowerCase());
    if (r["Reg Required"] === "Yes" && ["Expired", "Issue", "Pending", "", undefined].includes(r["Registration"])) b.push("Registration not verified");
    if (r["Registration Expiry"] && r["Registration Expiry"] < iso(today())) b.push("Registration expired");
    if (r["References"] === "Issue") b.push("Reference issue");
    if (r["Employment History"] === "Issue") b.push("Employment history issue");
    if (r["Training / Competence"] === "Issue") b.push("Training / competence issue");
    return b.join("; ");
  };
  window.complianceRag = r => {
    const block = complianceBlock(r);
    const hard = /expired|issue|passed|No consent/i.test(block);
    if (hard) return "Red";
    const pending = [r["RTW"], r["DBS"], r["Registration"], r["Training / Competence"]].some(v => v === "Pending")
      || !["Two Complete"].includes(r["References"]) || r["Employment History"] !== "Complete" || block;
    return pending ? "Amber" : "Green";
  };
  function today() { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
  const gbp2 = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = s => { if (!s) return ""; const d = new Date(s + "T00:00:00"); return isNaN(d) ? esc(s) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  function fmt(v, type) {
    if (v === "" || v == null) return "";
    switch (type) {
      case "money": return gbp2.format(num(v));
      case "pct": return num(v).toFixed(1) + "%";
      case "int": return String(Math.round(num(v)));
      case "date": return fmtDate(v);
      default: return esc(v);
    }
  }

  /* ---------------- storage ---------------- */
  let state = load();
  function blank() { const s = { records: {}, seq: {}, golive: { items: {}, director: {} }, scoreboard: {}, activity: [], audit: [], actSeq: 0, updated: null }; HAV.registers.forEach(r => { s.records[r.key] = []; s.seq[r.key] = 0; }); return s; }
  function normalise(s) {
    s = Object.assign(blank(), s);
    HAV.registers.forEach(r => { s.records[r.key] = s.records[r.key] || []; s.seq[r.key] = s.seq[r.key] || 0; });
    s.activity = Array.isArray(s.activity) ? s.activity : []; s.audit = Array.isArray(s.audit) ? s.audit : []; s.actSeq = s.actSeq || 0;
    return s;
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? normalise(JSON.parse(raw)) : blank();
    } catch (e) { return blank(); }
  }
  /* Local change log: who/when is this browser's user; kept to the last 3,000 entries */
  function logChange(key, id, action, fields) {
    state.audit.push({ ts: new Date().toISOString(), key, id, action, fields: fields || [] });
    if (state.audit.length > 3000) state.audit.splice(0, state.audit.length - 3000);
  }
  let storageOk = true;
  function save() {
    state.updated = new Date().toISOString();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOk = true; }
    catch (e) { storageOk = false; toast(CLOUD ? "Could not cache on this device; cloud sync continues." : "Could not save in this browser. Export your data now."); }
    if (CLOUD) Sync.schedule();
  }

  /* ---------------- cloud sync ----------------
     snap holds the JSON last agreed with the server for each item, so we can tell
     local edits (dirty) from remote edits. Last write wins for simultaneous edits. */
  const Sync = {
    snap: new Map(), lastPull: null, timer: null, running: null, status: "idle", error: "", ready: false,
    loadSnap() { try { const s = JSON.parse(localStorage.getItem(SNAP_KEY) || "null"); if (s) { this.snap = new Map(s.snap); this.lastPull = s.lastPull; } } catch (_) { } },
    saveSnap() { try { localStorage.setItem(SNAP_KEY, JSON.stringify({ snap: [...this.snap], lastPull: this.lastPull })); } catch (_) { } },
    setStatus(st, err) { this.status = st; this.error = err || ""; renderSync(); },
    schedule(ms) { clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), ms == null ? 700 : ms); this.setStatus("pending"); },
    local() {
      const m = new Map();
      HAV.registers.forEach(reg => state.records[reg.key].forEach(r => {
        const data = Object.assign({}, r); delete data.id;
        m.set(`r|${reg.key}|${r.id}`, { table: "records", row: { register: reg.key, id: r.id, data } });
      }));
      state.activity.forEach(a => m.set(`a|${a.id}`, { table: "activity", row: { id: a.id, register: a.key, rec_id: a.recId, data: { type: a.type, date: a.date, text: a.text, by: a.by || "" } } }));
      m.set("s|golive", { table: "settings", row: { key: "golive", data: state.golive } });
      m.set("s|scoreboard", { table: "settings", row: { key: "scoreboard", data: state.scoreboard } });
      m.forEach(v => { v.json = JSON.stringify(v.row.data) + (v.table === "activity" ? "|" + v.row.register + "|" + v.row.rec_id : ""); });
      return m;
    },
    async push() {
      if (!this.ready) return;
      if (this.running) { await this.running.catch(() => { }); }
      this.running = (async () => {
        this.setStatus("saving");
        const cur = this.local();
        const up = { records: [], activity: [], settings: [] }, upKeys = [];
        cur.forEach((v, k) => { if (this.snap.get(k) !== v.json) { up[v.table].push(v.row); upKeys.push([k, v.json]); } });
        const gone = [...this.snap.keys()].filter(k => !cur.has(k) && !k.startsWith("s|"));
        const conflict = { records: "register,id", activity: "id", settings: "key" };
        for (const t of Object.keys(up)) {
          for (let i = 0; i < up[t].length; i += 200) {
            await HAVCloud.api("POST", `${t}?on_conflict=${conflict[t]}`, up[t].slice(i, i + 200), { Prefer: "resolution=merge-duplicates,return=minimal" });
          }
        }
        for (const k of gone) {
          const [kind, a, b] = k.split("|");
          if (kind === "r") {
            await HAVCloud.api("DELETE", `records?register=eq.${encodeURIComponent(a)}&id=eq.${encodeURIComponent(b)}`, undefined, { Prefer: "return=minimal" });
            await HAVCloud.api("POST", "deletions?on_conflict=kind,register,id", [{ kind: "record", register: a, id: b }], { Prefer: "resolution=merge-duplicates,return=minimal" });
          } else if (kind === "a") {
            await HAVCloud.api("DELETE", `activity?id=eq.${encodeURIComponent(a)}`, undefined, { Prefer: "return=minimal" });
            await HAVCloud.api("POST", "deletions?on_conflict=kind,register,id", [{ kind: "activity", register: "", id: a }], { Prefer: "resolution=merge-duplicates,return=minimal" });
          }
          this.snap.delete(k);
        }
        upKeys.forEach(([k, j]) => this.snap.set(k, j));
        this.saveSnap();
      })();
      try { await this.running; this.setStatus("synced"); }
      catch (e) { this.setStatus(e.status === 401 ? "signedout" : "offline", e.message); clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), 30000); }
      finally { this.running = null; }
    },
    async pull() {
      const since = this.lastPull ? `updated_at=gt.${encodeURIComponent(this.lastPull)}&` : "";
      const [recs, acts, sets, dels] = await Promise.all([
        HAVCloud.all("records", since + "select=register,id,data,updated_at&order=updated_at"),
        HAVCloud.all("activity", since + "select=id,register,rec_id,data,updated_at&order=updated_at"),
        HAVCloud.all("settings", since + "select=key,data,updated_at"),
        this.lastPull ? HAVCloud.all("deletions", `deleted_at=gt.${encodeURIComponent(this.lastPull)}&select=kind,register,id,deleted_at`) : Promise.resolve([])
      ]);
      const full = !this.lastPull;
      const cur = this.local();
      const dirty = k => cur.has(k) && this.snap.get(k) !== cur.get(k).json;
      let latest = this.lastPull, changed = 0;
      const seen = new Set();
      const note = t => { if (t && (!latest || new Date(t) > new Date(latest))) latest = t; };
      recs.forEach(row => {
        note(row.updated_at);
        const reg = regByKey(row.register); if (!reg) return;
        const k = `r|${row.register}|${row.id}`; seen.add(k);
        const json = JSON.stringify(row.data);
        if (!dirty(k)) {
          const list = state.records[row.register], i = list.findIndex(r => r.id === row.id), rec = Object.assign({ id: row.id }, row.data);
          if (i >= 0) { if (JSON.stringify(Object.assign({}, list[i], { id: undefined })) !== JSON.stringify(Object.assign({}, rec, { id: undefined }))) { list[i] = rec; changed++; } } else { list.push(rec); changed++; }
        }
        this.snap.set(k, json);
      });
      acts.forEach(row => {
        note(row.updated_at);
        const k = `a|${row.id}`; seen.add(k);
        const json = JSON.stringify(row.data) + "|" + row.register + "|" + row.rec_id;
        if (!dirty(k)) {
          const a = { id: row.id, key: row.register, recId: row.rec_id, type: row.data.type, date: row.data.date, text: row.data.text, by: row.data.by };
          const i = state.activity.findIndex(x => x.id === row.id);
          if (i >= 0) state.activity[i] = a; else state.activity.push(a);
          changed++;
        }
        this.snap.set(k, json);
      });
      sets.forEach(row => {
        note(row.updated_at);
        const k = `s|${row.key}`;
        if (!dirty(k) && (row.key === "golive" || row.key === "scoreboard")) { state[row.key] = row.data || state[row.key]; changed++; }
        this.snap.set(k, JSON.stringify(row.data));
      });
      dels.forEach(d => {
        note(d.deleted_at);
        const k = d.kind === "record" ? `r|${d.register}|${d.id}` : `a|${d.id}`;
        if (dirty(k) && cur.has(k)) return;
        if (d.kind === "record" && state.records[d.register]) state.records[d.register] = state.records[d.register].filter(r => r.id !== d.id);
        if (d.kind === "activity") state.activity = state.activity.filter(a => a.id !== d.id);
        this.snap.delete(k); changed++;
      });
      if (full) {
        /* Anything we previously synced that the server no longer has was deleted elsewhere */
        [...this.snap.keys()].filter(k => !k.startsWith("s|") && !seen.has(k)).forEach(k => {
          const [kind, a, b] = k.split("|");
          if (kind === "r" && state.records[a] && !dirty(k)) state.records[a] = state.records[a].filter(r => r.id !== b);
          if (kind === "a" && !dirty(k)) state.activity = state.activity.filter(x => x.id !== a);
          this.snap.delete(k); changed++;
        });
      }
      /* Keep ID counters ahead of every ID in use, whichever device created it */
      HAV.registers.forEach(reg => state.records[reg.key].forEach(r => { const n = parseInt(String(r.id).slice(reg.prefix.length), 10); if (n > (state.seq[reg.key] || 0)) state.seq[reg.key] = n; }));
      this.lastPull = latest; this.saveSnap();
      if (changed) { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { } }
      return changed;
    },
    async start() {
      this.loadSnap();
      this.setStatus("saving");
      try {
        const serverHasData = (await HAVCloud.api("GET", "records?select=id&limit=1")).length > 0;
        this.lastPull = serverHasData ? this.lastPull : null;
        if (!serverHasData) this.snap.clear();
        await this.pull();
        this.ready = true;
        /* One-off move of data created before cloud sync, from this browser's local store */
        let legacy = null; try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null"); } catch (_) { }
        const legacyCount = legacy && legacy.records ? Object.values(legacy.records).reduce((a, l) => a + (l || []).length, 0) : 0;
        if (!serverHasData && legacyCount && confirm(`This browser holds ${legacyCount} record(s) from before cloud sync. Upload them to the cloud now?`)) {
          state = normalise(legacy); save();
          try { localStorage.setItem(LEGACY_KEY + ":uploaded", new Date().toISOString()); localStorage.removeItem(LEGACY_KEY); } catch (_) { }
        }
        await this.push();
        route();
      } catch (e) {
        this.ready = true;
        this.setStatus(e.status === 401 ? "signedout" : "offline", e.message);
      }
      setInterval(() => { if (!document.hidden) this.refresh(); }, 60000);
      window.addEventListener("focus", () => this.refresh());
      window.addEventListener("online", () => this.schedule(0));
    },
    async refresh() {
      if (!this.ready || this.running) return;
      try { const n = await this.pull(); if (this.status !== "pending") this.setStatus("synced"); if (n && !$("dialog[open]")) route(); if (this.local && [...this.local()].some(([k, v]) => this.snap.get(k) !== v.json)) this.schedule(0); }
      catch (e) { this.setStatus(e.status === 401 ? "signedout" : "offline", e.message); }
    }
  };
  function renderSync() {
    const el = $("#sync-pill"); if (!el) return;
    if (!CLOUD) { el.hidden = true; return; }
    const map = { idle: ["", "Connecting…"], pending: ["busy", "Saving…"], saving: ["busy", "Syncing…"], synced: ["ok", "Synced"], offline: ["warn", "Offline: saved on this device"], signedout: ["warn", "Signed out: sign in again"] };
    const [cls, label] = map[Sync.status] || map.idle;
    el.hidden = false; el.className = "sync " + cls; el.textContent = label; el.title = Sync.error || label;
  }

  /* ---------------- derived state ---------------- */
  const regByKey = k => HAV.registers.find(r => r.key === k);
  function fieldType(reg, name) { const f = reg.fields.find(f => f[0] === name); return f ? f[1] : "text"; }
  function valueOf(reg, rec, name) {
    const f = reg.fields.find(f => f[0] === name);
    if (f && f[1] === "derived") return f[2].calc(rec);
    return rec[name];
  }
  function tempLive() {
    const g = state.golive;
    const allItems = HAV.goLive.every((_, i) => { const it = g.items[i] || {}; return it.done && it.evidence && it.by && it.date; });
    return allItems && g.director.decision === "GO" && g.director.name && g.director.date;
  }
  function goLiveProgress() { return HAV.goLive.filter((_, i) => { const it = state.golive.items[i] || {}; return it.done && it.evidence && it.by && it.date; }).length; }

  /* ---------------- UI chrome ---------------- */
  const NAV = [
    ["Overview", [["#/", "Dashboard"], ["#/actions", "Action Plan"], ["#/pipeline", "Pipeline Board"], ["#/reports", "Reports"], ["#/golive", "Temp Go Live Gate"], ["#/controls", "Controls And Authority"]]],
    ["Registers", (l => { l.splice(2, 0, ["#/applications", "CV Database"]); return l; })(HAV.registers.filter(r => r.nav !== false).map(r => ["#/r/" + r.key, r.title, r.temp]))],
    ["Operating System", [["#/procedures", "Procedures (SOPs)"], ["#/strategy", "Strategy And Services"], ["#/sales", "Sales And Candidates"], ["#/kpis", "KPIs And Governance"], ["#/risks", "Risk Register"], ["#/plan", "90 Day And 12 Month Plan"]]],
    ["Finance", [["#/finance", "Financial Model"], ["#/calculators", "Pricing Calculators"]]],
    ["Reference", [["#/sources", "Legal And Source Register"], ["#/data", "Data, Backup And Privacy"]]],
    ["Haverton Websites", [
      ["https://operation.havertoncare.co.uk/apply/?src=preview", "Registration Page ↗"],
      ["https://operation.havertoncare.co.uk/finance/", "Finance Tool ↗"],
      ["https://operation.havertoncare.co.uk/care-costs/", "Family Cost Of Care Guide ↗"],
      ["https://havertoncare.co.uk/future-home-care/", "Home Care ↗"],
      ["https://havertoncarehub.co.uk", "Haverton Care Hub ↗"],
      ["https://shop.havertoncarehub.co.uk", "Care Hub Shop ↗"]
    ]]
  ];
  function renderNav() {
    const cur = location.hash || "#/";
    const viewKey = (cur.match(/^#\/view\/([^/]+)/) || [])[1];
    $("#nav").innerHTML = (CLOUD ? `<div class="nav-account"><span title="Signed in">${esc(USER)}</span><span class="nav-acts"><button type="button" class="link" id="chpw">Password</button><button type="button" class="link" id="signout">Sign out</button></span></div>` : "") + `<form class="nav-search" id="navsearch" role="search"><input type="search" id="navq" placeholder="Search everything" aria-label="Search everything"></form>` + NAV.map(([g, items]) =>
      `<div class="nav-group"><div class="nav-label">${g}</div>` +
      items.map(([href, label, temp]) => {
        const active = cur === href || (href !== "#/" && cur.startsWith(href + "/")) || (viewKey && href === "#/r/" + viewKey);
        const lock = temp && !tempLive() ? `<span class="lock" title="Temporary staffing is off">off</span>` : "";
        const ext = /^https?:/.test(href);
        return `<a href="${href}" class="${active ? "active" : ""}"${ext ? ` target="_blank" rel="noopener"` : ""}>${esc(label)}${lock}</a>`;
      }).join("") + `</div>`).join("");
    const so = $("#signout");
    if (so) so.addEventListener("click", async () => {
      if (Sync.status === "pending" || Sync.status === "saving" || Sync.status === "offline") {
        if (!confirm("Some changes have not reached the cloud yet. Sign out anyway? Unsynced changes on this device will be lost.")) return;
      }
      try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(SNAP_KEY); sessionStorage.clear(); } catch (_) { }
      await HAVCloud.signOut(); location.replace(location.pathname);
    });
    const cp = $("#chpw");
    if (cp) cp.addEventListener("click", openChangePassword);
    renderSync();
    $("#navsearch").addEventListener("submit", e => { e.preventDefault(); const q = $("#navq").value.trim(); if (q) location.hash = "#/search/" + encodeURIComponent(q); });
    $("#temp-pill").className = "pill " + (tempLive() ? "go" : "off");
    $("#temp-pill").innerHTML = `<span class="pl-long">Temporary staffing</span><span class="pl-short">Temp</span>: ${tempLive() ? "GO" : "OFF"}`;
  }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 3500); }
  /* Colour-coded care setting, so home care, nursing, residential and supported living stand apart */
  const SERVICE_TAG = { "Domiciliary Care": ["Home Care", "hc"], "Nursing Home": ["Nursing Home", "nh"], "Residential Care": ["Residential Home", "rh"], "Supported Living": ["Supported Living", "sl"], "Learning Disability": ["Learning Disability", "ld"], "Mental Health": ["Mental Health", "mh"] };
  function serviceTag(v) {
    if (!v) return "";
    const [label, cls] = SERVICE_TAG[v] || [v, "ot"];
    return `<span class="stag ${cls}">${esc(label)}</span>`;
  }
  function badge(v) {
    if (!v) return "";
    const map = {
      green: ["Done", "Green", "Yes", "Active Client", "Expansion", "Verified", "Clear", "Update Service Verified", "Two Complete", "Complete", "Placed", "Completed", "Filled", "Paid", "Within Terms", "GO", "Closed", "Started", "Live", "Low"],
      amber: ["Amber", "Pending", "Requested", "One Complete", "Qualified", "Terms Sent", "Prospect", "Screening", "Due Soon", "In Progress", "On Hold", "Interview", "Offer", "Offered", "Submitted", "Planned", "Guarantee Period", "Overdue", "Medium", "Low-Med", "CONDITIONAL", "Content Reviewed", "Equal Treatment Due", "Open"],
      red: ["Blocked", "Red", "No", "Expired", "Issue", "Do Not Supply", "Do Not Contact", "Rejected", "Withdrawn", "Cancelled", "Stop Supply", "High", "Critical", "Early Leaver", "RESTRICTED"]
    };
    const cls = map.green.includes(v) ? "g" : map.red.includes(v) ? "r" : map.amber.includes(v) ? "a" : "n";
    return `<span class="badge ${cls}">${esc(v)}</span>`;
  }
  const table = (head, rows, cls = "") => `<div class="tbl-wrap"><table class="${cls}"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const plain = rows => rows.map(r => r.map(c => esc(c)));
  const callout = (title, text, kind = "info") => `<div class="callout ${kind}"><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`;
  const header = (title, sub) => `<header class="page-head"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</header>`;

  /* ---------------- pages ---------------- */
  function pageDashboard() {
    const R = state.records, t = iso(today()), in30 = addDays(t, 30), in14 = addDays(t, 14);
    const count = (k, fn) => R[k].filter(fn).length;
    const invReg = regByKey("invoices"), compReg = regByKey("compliance");
    const outstanding = R.invoices.reduce((a, r) => a + valueOf(invReg, r, "Outstanding"), 0);
    const overdue14 = R.invoices.filter(r => daysOverdue(r) > 14);
    const tiles = [
      ["Active clients", count("clients", r => ["Active Client", "Expansion"].includes(r["Client Status"])), "#/r/clients"],
      ["Qualified prospects", count("clients", r => ["Qualified", "Terms Sent"].includes(r["Client Status"])), "#/r/clients"],
      ["Open vacancies", count("vacancies", r => r["Vacancy Status"] === "Open"), "#/r/vacancies"],
      ["Active candidates", count("candidates", r => !["Inactive", "Do Not Contact", "Placed"].includes(r["Current Stage"])), "#/r/candidates"],
      ["Compliance green", R.compliance.filter(r => complianceRag(r) === "Green").length, "#/r/compliance"],
      ["Compliance red", R.compliance.filter(r => complianceRag(r) === "Red").length, "#/r/compliance", "red"],
      ["Permanent placements", R.placements.length, "#/r/placements"],
      ["Live temp assignments", count("assignments", r => r["Status"] === "Live"), "#/r/assignments"],
      ["Open follow ups", count("followups", r => r["Status"] !== "Closed"), "#/r/followups"],
      ["Outstanding invoices", gbp.format(outstanding), "#/r/invoices"],
      ["Overdue over 14 days", overdue14.length, "#/r/invoices", overdue14.length ? "red" : ""],
      ["Open complaints / incidents", count("cases", r => r["Status"] !== "Closed"), "#/r/cases"],
      ["Actions done", R.actions.filter(r => r["Status"] === "Done").length + " / " + R.actions.filter(r => r["Status"] !== "Not needed").length, "#/actions"],
      ["Actions overdue", R.actions.filter(r => actOpen(r) && r["Due Date"] && r["Due Date"] < t).length, "#/actions", R.actions.some(r => actOpen(r) && r["Due Date"] && r["Due Date"] < t) ? "red" : ""]
    ];

    const alerts = [];
    R.followups.filter(r => r["Status"] !== "Closed" && r["Due Date"] && r["Due Date"] < t).forEach(r => alerts.push(["r", `Follow up overdue: ${r["Action"]} (${r["Organisation / Candidate"]})`, `#/view/followups/${encodeURIComponent(r.id)}`, r["Due Date"]]));
    R.candidates.filter(r => r["RTW Expiry / Follow Up"] && r["RTW Expiry / Follow Up"] <= in30 && !["Inactive", "Do Not Contact"].includes(r["Current Stage"])).forEach(r => alerts.push([r["RTW Expiry / Follow Up"] < t ? "r" : "a", `Right to work follow up: ${r["Full Name"]} (${r.id})`, `#/view/candidates/${encodeURIComponent(r.id)}`, r["RTW Expiry / Follow Up"]]));
    R.compliance.filter(r => r["Registration Expiry"] && r["Registration Expiry"] <= in30).forEach(r => alerts.push(["a", `Professional registration expiry: ${r["Candidate ID"]}`, "#/r/compliance", r["Registration Expiry"]]));
    R.submissions.filter(r => r["Stage"] !== "Draft" && r["Consent Confirmed"] !== "Yes").forEach(r => alerts.push(["r", `Submission without recorded consent: ${r.id}`, `#/view/submissions/${encodeURIComponent(r.id)}`, ""]));
    R.awr.filter(r => { const w = addDays(r["Qualifying Start"], 84); return w && w <= in14 && r["Equal Treatment Review"] !== "Completed"; }).forEach(r => alerts.push(["r", `AWR week 12 due: ${r["Worker ID"]} at ${r["Client ID"]}`, "#/r/awr", addDays(r["Qualifying Start"], 84)]));
    R.awr.filter(r => { const w = addDays(r["Qualifying Start"], 70); return w && w <= t && r["Comparator Information Requested"] !== "Yes"; }).forEach(r => alerts.push(["a", `AWR week 10: request comparator information for ${r["Worker ID"]}`, "#/r/awr", ""]));
    R.placements.filter(r => r["Start Date"] && r["Status"] !== "Cancelled").forEach(r => {
      [[7, "day 7"], [30, "day 30"], [60, "day 60"], [90, "day 90"]].forEach(([d, l]) => { const due = addDays(r["Start Date"], d); if (due >= addDays(t, -3) && due <= addDays(t, 7)) alerts.push(["a", `Placement ${l} check in: ${r["Job Title"]} (${r.id})`, `#/view/placements/${encodeURIComponent(r.id)}`, due]); });
    });
    R.cases.filter(r => r["Status"] !== "Closed" && ["High", "Critical"].includes(r["Immediate Risk"])).forEach(r => alerts.push(["r", `${r["Immediate Risk"]} risk case open: ${r.id} (${r["Type"]})`, `#/view/cases/${encodeURIComponent(r.id)}`, r["Target Date"]]));
    R.cases.filter(r => r["Status"] !== "Closed" && r["Target Date"] && r["Target Date"] < t).forEach(r => alerts.push(["r", `Case past target date: ${r.id}`, "#/r/cases", r["Target Date"]]));
    R.audits.filter(r => r["Critical Failure"] === "Yes" && r["Status"] !== "Closed").forEach(r => alerts.push(["r", `Unresolved critical audit failure: ${r["Audit Area"]} (${r.id})`, "#/r/audits", r["Due Date"]]));
    overdue14.forEach(r => alerts.push(["r", `Invoice ${r.id} is ${daysOverdue(r)} days overdue (${r["Client ID"]})`, `#/view/invoices/${encodeURIComponent(r.id)}`, r["Due Date"]]));
    R.clients.filter(r => r["Last Review"] && r["Last Review"] < addDays(t, -365) && ["Active Client", "Expansion"].includes(r["Client Status"])).forEach(r => alerts.push(["a", `Annual client file review due: ${r["Legal Entity"]}`, `#/view/clients/${encodeURIComponent(r.id)}`, ""]));
    R.actions.filter(r => actOpen(r) && r["Due Date"] && r["Due Date"] <= addDays(t, 2)).forEach(r => alerts.push([r["Due Date"] < t ? "r" : "a", `${r["Due Date"] < t ? "Action overdue" : "Action due"}: ${r["Task"]}`, "#/actions", r["Due Date"]]));
    /* Operating standard: every active sales or candidate record has an owner and a next action */
    const openFu = new Set(R.followups.filter(f => f["Status"] !== "Closed").map(f => f["Related ID"]));
    R.clients.filter(r => ["Lead", "Prospect", "Qualified", "Terms Sent", "Active Client", "Expansion"].includes(r["Client Status"]) && !openFu.has(r.id)).forEach(r => alerts.push(["a", `No next action: ${r["Legal Entity"] || r.id}`, `#/view/clients/${encodeURIComponent(r.id)}`, ""]));
    R.candidates.filter(r => !["Placed", "Inactive", "Do Not Contact"].includes(r["Current Stage"]) && !r["Next Action Date"] && !openFu.has(r.id)).forEach(r => alerts.push(["a", `No next action: ${r["Full Name"] || r.id}`, `#/view/candidates/${encodeURIComponent(r.id)}`, ""]));
    alerts.sort((a, b) => (a[0] === b[0] ? 0 : a[0] === "r" ? -1 : 1));

    const wk = weekKey(), sb = state.scoreboard[wk] || {};
    const prog = goLiveProgress();
    return header("Operations Dashboard", "Haverton Recruitment And Staffing, a trading division of Haverton Care Limited. Weekly review recommended.") +
      `<section class="tiles">${tiles.map(([l, v, h, c]) => `<a class="tile ${c || ""}" href="${h}"><span class="tile-v">${v}</span><span class="tile-l">${esc(l)}</span></a>`).join("")}</section>
      <div class="grid2">
        <section class="card"><h2>Alerts And Actions <span class="count">${alerts.length}</span></h2>
          ${alerts.length ? `<ul class="alerts">${alerts.slice(0, 40).map(([k, m, h, d]) => `<li class="${k}"><a href="${h}">${esc(m)}</a>${d ? `<span>${fmtDate(d)}</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted">No alerts. Alerts appear here for overdue follow ups, right to work and registration expiries, AWR week 10 and 12, placement check ins, open high risk cases, critical audit failures and overdue invoices.</p>`}
        </section>
        <section class="card">
          <h2>Temporary Staffing Status</h2>
          <div class="status-big ${tempLive() ? "go" : "off"}">${tempLive() ? "GO: Director approval recorded" : "OFF: Go Live Gate not signed"}</div>
          <div class="progress"><div style="width:${Math.round(prog / HAV.goLive.length * 100)}%"></div></div>
          <p class="muted">${prog} of ${HAV.goLive.length} go-live controls evidenced and signed. “In progress” is not a pass. A client asking urgently for cover is not a reason to bypass the gate.</p>
          <a class="btn" href="#/golive">Open Go Live Gate</a>
          <h3>Scale Gates</h3>
          ${table(["Area", "Status"], HAV.scaleGates.map(([a, s]) => [esc(a), badge(a === "Temporary staffing" && tempLive() ? "GO" : s)]), "compact")}
        </section>
      </div>
      <section class="card"><h2>Weekly Founder Scoreboard <span class="muted small">week commencing ${fmtDate(wk)}</span></h2>
        <ul class="checklist">${HAV.scoreboard.map((s, i) => `<li><label><input type="checkbox" data-sb="${i}" ${sb[i] ? "checked" : ""}> ${esc(s)}</label></li>`).join("")}</ul>
      </section>`;
  }
  function weekKey() { const d = today(); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return iso(d); }

  function pageRegister(key) {
    const reg = regByKey(key);
    if (!reg) return pageNotFound();
    const rows = state.records[key];
    const locked = reg.temp && !tempLive();
    const statuses = [...new Set(rows.map(r => String(valueOf(reg, r, reg.status) || "")).filter(Boolean))];
    return header(reg.title, reg.intro) +
      (locked ? callout("Temporary staffing is OFF", "New records cannot be added until every Temp Go Live control is evidenced and the Director records a GO decision. Existing records remain viewable.", "danger") : "") +
      (reg.rule ? callout("Escalation / stop rule", reg.rule, "warn") : "") +
      `<div class="toolbar">
        <input type="search" id="q" placeholder="Search ${esc(reg.title.toLowerCase())}" aria-label="Search">
        <select id="sf" aria-label="Filter by status"><option value="">All statuses</option>${statuses.map(s => `<option>${esc(s)}</option>`).join("")}</select>
        ${reg.typeFilter ? (() => { const n = {}; rows.forEach(r => { const t = r[reg.typeFilter]; if (t) n[t] = (n[t] || 0) + 1; }); return `<select id="tf" aria-label="Filter by service type"><option value="">All service types</option>${Object.keys(n).sort().map(t => `<option value="${esc(t)}">${esc((SERVICE_TAG[t] || [t])[0])} (${n[t]})</option>`).join("")}</select>`; })() : ""}
        <span class="spacer"></span>
        ${key === "followups" ? `<button class="btn ghost" id="ics" title="Download open follow ups as calendar events">Add to calendar</button>` : ""}
        ${key === "followups" && HAV.weekOneFollowUps ? `<button class="btn ghost" id="fuload" title="Add this week's planned calls and reviews">Load week 1 follow ups</button>` : ""}
        ${key === "vacancies" && HAV.vacancyLeads ? `<button class="btn ghost" id="vleads" title="Add advertised vacancies from local providers as leads">Load vacancy leads</button>` : ""}
        ${key === "clients" && HAV.cqcProviders ? `<button class="btn ghost" id="cqcload" title="Add or refresh CQC-registered providers in your priority area">Load CQC providers</button>` : ""}
        <label class="btn ghost file ${locked ? "is-disabled" : ""}">Import CSV<input type="file" id="csvin" accept=".csv,text/csv" hidden ${locked ? "disabled" : ""}></label>
        <button class="btn ghost" id="csv">Export CSV</button>
        <button class="btn" id="add" ${locked ? "disabled" : ""}>Add record</button>
      </div>
      <div id="reg-table"></div>`;
  }
  function drawRegisterTable(key) {
    const reg = regByKey(key), q = ($("#q").value || "").toLowerCase(), sf = $("#sf").value, tf = $("#tf") ? $("#tf").value : "";
    let rows = state.records[key].filter(r => {
      if (sf && String(valueOf(reg, r, reg.status)) !== sf) return false;
      if (tf && String(r[reg.typeFilter] || "") !== tf) return false;
      if (!q) return true;
      return (r.id + " " + reg.fields.map(f => valueOf(reg, r, f[0])).join(" ")).toLowerCase().includes(q);
    });
    if (!state.records[key].length) { $("#reg-table").innerHTML = `<div class="empty">No records yet. Use <strong>Add record</strong> to start the ${esc(reg.title.toLowerCase())} register.</div>`; return; }
    const cols = ["ID"].concat(reg.list);
    $("#reg-table").innerHTML = table(cols.concat([""]), rows.map(r => {
      return [`<a class="rid" href="#/view/${key}/${encodeURIComponent(r.id)}">${esc(r.id)}</a>`].concat(reg.list.map((c, i) => {
        const t = fieldType(reg, c), v = valueOf(reg, r, c);
        const f = reg.fields.find(f => f[0] === c);
        if (c === "Service Type") return serviceTag(v);
        if (/Critical Failure|Safeguarding Concern/.test(c)) return v === "Yes" ? `<span class="badge r">Yes</span>` : v === "No" ? `<span class="badge g">No</span>` : "";
        if (t === "select" || (t === "derived" && /Status|Retained/.test(c))) return badge(v);
        if (t === "derived") return fmt(v, f[2].fmt);
        if (t === "ref") return refLink(f[2].ref, v);
        if (i === 0) return `<a class="rname" href="#/view/${key}/${encodeURIComponent(r.id)}">${fmt(v, t)}</a>`;
        return fmt(v, t);
      })).concat([`<a class="link" href="#/view/${key}/${encodeURIComponent(r.id)}">Open</a>`]);
    }), "reg");
  }

  function findDuplicate(key, data, id) {
    const others = state.records[key].filter(r => r.id !== id), low = v => String(v || "").trim().toLowerCase();
    if (key === "candidates") return others.find(r => (data["Email"] && low(r["Email"]) === low(data["Email"])) || (data["Phone"] && low(r["Phone"]).replace(/\s/g, "") === low(data["Phone"]).replace(/\s/g, "")) || (low(r["Full Name"]) === low(data["Full Name"]) && data["Postcode"] && low(r["Postcode"]) === low(data["Postcode"])));
    if (key === "clients") return others.find(r => low(r["Legal Entity"]) === low(data["Legal Entity"]));
    return null;
  }
  function newId(key) { const reg = regByKey(key); state.seq[key]++; return reg.prefix + String(state.seq[key]).padStart(4, "0"); }

  function openForm(key, id, prefill) {
    const reg = regByKey(key);
    const rec = id ? state.records[key].find(r => r.id === id) : Object.assign({}, prefill || {});
    const dlg = $("#dlg");
    const input = (f) => {
      const [name, type, o = {}] = f, v = rec[name] != null ? rec[name] : (o.def != null ? o.def : "");
      const nm = `name="${esc(name)}"`, req = o.required ? "required" : "";
      let el;
      if (type === "derived") { const dv = rec.id || Object.keys(rec).length ? o.calc(rec) : ""; el = `<output data-derived="${esc(name)}">${fmt(dv, o.fmt) || "—"}</output>`; }
      else if (type === "select") { const opts = Array.isArray(o.list) ? o.list : HAV.lists[o.list]; el = `<select ${nm} ${req}><option value=""></option>${opts.map(x => `<option ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>`; }
      else if (type === "ref") { const src = state.records[o.ref]; const r2 = regByKey(o.ref); el = `<input list="dl-${esc(o.ref)}" ${nm} value="${esc(v)}" ${req} autocomplete="off"><datalist id="dl-${esc(o.ref)}">${src.map(x => `<option value="${esc(x.id)}">${esc(x[r2.list[0]] || "")}</option>`).join("")}</datalist>`; }
      else if (type === "textarea") el = `<textarea ${nm} rows="3" ${req}>${esc(v)}</textarea>`;
      else { const ht = { money: "number", pct: "number", number: "number", date: "date", email: "email", tel: "tel" }[type] || "text"; el = `<input type="${ht}" ${nm} value="${esc(v)}" ${req} ${["money", "pct", "number"].includes(type) ? 'step="any"' : ""}>`; }
      const wide = type === "textarea" ? "wide" : "";
      return `<label class="fld ${wide}"><span>${esc(name)}${o.required ? " *" : ""}${type === "money" ? " (£)" : ""}${type === "pct" ? " (%)" : ""}</span>${el}${o.hint ? `<small>${esc(o.hint)}</small>` : ""}</label>`;
    };
    dlg.innerHTML = `<form method="dialog" id="rec-form">
      <div class="dlg-head"><h2>${id ? esc(id) : "New " + esc(reg.title.replace(/s$/, "").toLowerCase()) + " record"}</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body">${callout("Minimum necessary data", "Do not enter passport scans, DBS certificate content, medical details, bank details or information about people receiving care. Record status, reference and date only.", "info")}
      <div class="form-grid">${reg.fields.map(input).join("")}</div><p class="form-err" id="ferr" role="alert"></p></div>
      <div class="dlg-foot">${id ? `<button type="button" class="btn danger ghost" id="del">Delete</button>` : ""}<span class="spacer"></span><button type="button" class="btn ghost" data-close>Cancel</button><button type="submit" class="btn">Save</button></div>
    </form>`;
    const form = $("#rec-form");
    const collect = () => { const o = {}; new FormData(form).forEach((v, k) => { o[k] = String(v).trim(); }); return o; };
    form.addEventListener("input", () => {
      const cur = collect();
      reg.fields.filter(f => f[1] === "derived").forEach(f => { const out = form.querySelector(`[data-derived="${CSS.escape(f[0])}"]`); if (out) out.textContent = fmt(f[2].calc(cur), f[2].fmt) || "—"; });
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = collect();
      const err = reg.validate && reg.validate(data);
      if (err) { $("#ferr").textContent = err; return; }
      if (reg.temp && !tempLive() && !id) { $("#ferr").textContent = "Temporary staffing is OFF."; return; }
      const dup = findDuplicate(key, data, id);
      if (dup && !confirm(`This looks like a duplicate of ${dup.id} (${dup[reg.list[0]] || ""}). Save anyway?`)) return;
      if (id) {
        const changed = Object.keys(data).filter(k => String(rec[k] || "") !== data[k]);
        Object.assign(rec, data, { modified: new Date().toISOString() });
        if (changed.length) logChange(key, id, "updated", changed);
      } else {
        const nid = newId(key);
        state.records[key].push(Object.assign({ id: nid, created: new Date().toISOString() }, data));
        logChange(key, nid, "created");
      }
      save(); dlg.close(); route(); toast("Saved");
    });
    dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
    const del = $("#del");
    if (del) del.addEventListener("click", () => {
      if (!confirm(`Delete ${id}? This cannot be undone. Check retention obligations before deleting.`)) return;
      state.records[key] = state.records[key].filter(r => r.id !== id); logChange(key, id, "deleted"); save(); dlg.close();
      if (location.hash.startsWith("#/view/")) location.hash = "#/r/" + key; else route();
      toast("Deleted");
    });
    dlg.showModal();
  }

  function csvFor(key) {
    const reg = regByKey(key), cols = ["ID"].concat(reg.fields.map(f => f[0]));
    const q = v => { const s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [cols.map(q).join(",")].concat(state.records[key].map(r => [r.id].concat(reg.fields.map(f => { const v = valueOf(reg, r, f[0]); return f[1] === "derived" && typeof v === "number" ? v.toFixed(2) : v; })).map(q).join(",")));
    download(`Haverton ${reg.title} ${iso(today())}.csv`, lines.join("\n"), "text/csv");
  }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

  /* ---------------- linked records ---------------- */
  function findRec(key, id) { return (state.records[key] || []).find(r => r.id === id); }
  function recLabel(key, rec) {
    if (!rec) return "";
    const reg = regByKey(key);
    const main = { vacancies: "Job Title", submissions: "Candidate ID", placements: "Job Title", assignments: "Role", compliance: "Candidate ID", awr: "Worker ID", followups: "Action", invoices: "Invoice Type", cases: "Type", audits: "Audit Area" }[key] || reg.list[0];
    let v = rec[main] || "";
    if (key === "compliance" || key === "submissions") { const c = findRec("candidates", rec["Candidate ID"]); v = c ? c["Full Name"] : v; }
    if (key === "awr") { const c = findRec("candidates", rec["Worker ID"]); v = c ? c["Full Name"] : v; }
    return v;
  }
  function refLink(key, id) {
    if (!id) return "";
    const r = findRec(key, id);
    if (!r) return `${esc(id)} <span class="muted small">(not found)</span>`;
    return `<a href="#/view/${key}/${encodeURIComponent(id)}">${esc(id)}</a> <span class="muted small">${esc(recLabel(key, r))}</span>`;
  }
  /* Every record in any register that points at this one */
  function relatedTo(key, id) {
    const out = [];
    HAV.registers.forEach(reg => {
      const refFields = reg.fields.filter(f => f[1] === "ref" && f[2].ref === key).map(f => f[0]);
      const extra = ["followups", "cases"].includes(reg.key) ? ["Related ID"] : reg.key === "invoices" ? ["Placement / Assignment ID"] : [];
      const fields = refFields.concat(extra);
      if (!fields.length) return;
      const rows = state.records[reg.key].filter(r => fields.some(f => r[f] === id));
      if (rows.length) out.push([reg, rows]);
    });
    return out;
  }
  function activityFor(key, id) { return state.activity.filter(a => a.key === key && a.recId === id); }

  function pageView(key, id) {
    const reg = regByKey(key), rec = reg && findRec(key, id);
    if (!rec) return pageNotFound();
    const statusV = valueOf(reg, rec, reg.status);
    const details = reg.fields.map(f => {
      const [name, type, o = {}] = f, v = valueOf(reg, rec, name);
      if (v === "" || v == null || (type === "derived" && !v && v !== 0)) return "";
      let shown;
      if (type === "ref") shown = refLink(o.ref, v);
      else if (type === "select" || (type === "derived" && /Status/.test(name))) shown = badge(v);
      else if (type === "derived") shown = fmt(v, o.fmt);
      else if (type === "email") shown = `<a href="mailto:${esc(v)}">${esc(v)}</a>`;
      else if (type === "tel") shown = `<a href="tel:${esc(String(v).replace(/\s/g, ""))}">${esc(v)}</a>`;
      else if (type === "textarea") shown = esc(v).replace(/\n/g, "<br>");
      else shown = fmt(v, type);
      return `<div class="kv ${type === "textarea" ? "wide" : ""}"><dt>${esc(name)}</dt><dd>${shown}</dd></div>`;
    }).join("");
    const rel = relatedTo(key, id);
    const relHtml = rel.length ? rel.map(([r2, rows]) => `<h3>${esc(r2.title)} <span class="count">${rows.length}</span></h3>` +
      table(["ID", "Name", r2.status], rows.map(x => [`<a href="#/view/${r2.key}/${encodeURIComponent(x.id)}">${esc(x.id)}</a>`, esc(recLabel(r2.key, x) || ""), badge(valueOf(r2, x, r2.status))]), "compact")).join("")
      : `<p class="muted">Nothing is linked to this record yet.</p>`;

    let summary = "";
    if (key === "clients") {
      const fees = state.records.placements.filter(p => p["Client ID"] === id).reduce((a, p) => a + num(p["Salary"]) * num(p["Fee %"]) / 100, 0);
      const invReg = regByKey("invoices"), inv = state.records.invoices.filter(i => i["Client ID"] === id);
      const outst = inv.reduce((a, i) => a + valueOf(invReg, i, "Outstanding"), 0);
      const openV = state.records.vacancies.filter(v => v["Client ID"] === id && v["Vacancy Status"] === "Open").length;
      const limit = num(rec["Credit Limit"]);
      summary = `<section class="tiles mini">
        <div class="tile"><span class="tile-v">${openV}</span><span class="tile-l">Open vacancies</span></div>
        <div class="tile"><span class="tile-v">${gbp.format(fees)}</span><span class="tile-l">Placement fees</span></div>
        <div class="tile ${limit && outst > limit ? "red" : ""}"><span class="tile-v">${gbp.format(outst)}</span><span class="tile-l">Outstanding${limit ? " of " + gbp.format(limit) + " limit" : ""}</span></div></section>`;
    }
    let matches = "";
    if (key === "candidates" && !["Do Not Contact", "Inactive", "Placed"].includes(rec["Current Stage"])) {
      const comp = state.records.compliance.find(c => c["Candidate ID"] === id);
      const role = String(rec["Target Role"] || "").toLowerCase();
      const open = state.records.vacancies.filter(v => v["Vacancy Status"] === "Open" && role && String(v["Job Title"] || "").toLowerCase().includes(role.split(" ").slice(-1)[0]));
      matches = `<section class="card"><h2>Matching Open Vacancies</h2>
        <p class="muted small">Matched on target role. Compliance: ${comp ? badge(complianceRag(comp)) : `<span class="badge n">No compliance record</span>`}. Only submit with recorded consent for the specific vacancy.</p>
        ${open.length ? table(["Vacancy", "Client", "Location", "Salary / Rate", ""], open.map(v => [`<a href="#/view/vacancies/${encodeURIComponent(v.id)}">${esc(v["Job Title"])}</a>`, refLink("clients", v["Client ID"]), esc(v["Location"] || ""), v["Salary / Charge Rate"] ? gbp.format(num(v["Salary / Charge Rate"])) : "", `<button class="link" data-submit="${esc(v.id)}">Create submission</button>`]), "compact") : `<p class="muted">No open vacancies match this candidate’s target role.</p>`}</section>`;
    }
    const acts = activityFor(key, id).map(a => ({ ts: a.date + "T12:00", html: `<span class="badge n">${esc(a.type)}</span> ${esc(a.text)}${a.by ? ` <span class="muted small">by ${esc(a.by)}</span>` : ""}`, date: a.date, del: a.id }))
      .concat((CLOUD ? [] : state.audit).filter(a => a.key === key && a.id === id).map(a => ({ ts: a.ts, html: `<span class="muted">Record ${esc(a.action)}${a.fields.length ? ": " + esc(a.fields.slice(0, 6).join(", ")) + (a.fields.length > 6 ? "…" : "") : ""}</span>`, date: a.ts.slice(0, 10) })))
      .sort((a, b) => b.ts.localeCompare(a.ts));
    return `<p class="crumb"><a href="#/r/${key}">${esc(reg.title)}</a> / ${esc(id)}</p>` +
      `<header class="page-head"><h1>${esc(recLabel(key, rec) || id)} ${badge(statusV)}</h1><p>${esc(reg.title.replace(/s$/, ""))} record <code>${esc(id)}</code>${rec.created ? " · created " + fmtDate(rec.created.slice(0, 10)) : ""}${rec.modified ? " · updated " + fmtDate(rec.modified.slice(0, 10)) : ""}</p></header>
      <div class="btn-row"><button class="btn" id="v-edit">Edit</button><button class="btn ghost" id="v-note">Log activity</button><button class="btn ghost" id="v-fu">Add follow up</button>${CLOUD && rec["CV File"] ? `<button class="btn ghost" id="v-cv">Open CV</button>` : ""}</div>
      ${summary}
      <div class="grid2 view"><section class="card"><h2>Details</h2><dl class="kvs">${details}</dl></section>
      <div><section class="card"><h2>Linked Records</h2>${relHtml}</section>${matches}</div></div>
      <section class="card"><h2>Activity And History <span class="count">${acts.length}</span></h2>
        ${acts.length || CLOUD ? `<ul class="timeline" id="timeline">${acts.map(a => `<li data-ts="${esc(a.ts)}"><time>${fmtDate(a.date)}</time><div>${a.html}${a.del ? ` <button class="link small" data-delact="${a.del}">remove</button>` : ""}</div></li>`).join("")}</ul>` : `<p class="muted">No activity yet. Use <strong>Log activity</strong> to record calls, emails, meetings and notes.</p>`}
      </section>`;
  }

  async function loadServerHistory(key, id) {
    try {
      const rows = await HAVCloud.api("GET", `audit_log?kind=eq.records&register=eq.${encodeURIComponent(key)}&id=eq.${encodeURIComponent(id)}&select=at,actor,action,fields&order=seq.desc&limit=100`);
      const tl = $("#timeline"); if (!tl || !location.hash.includes("/" + encodeURIComponent(id))) return;
      const items = rows.map(a => `<li data-ts="${esc(a.at)}"><time>${fmtDate(a.at.slice(0, 10))}</time><div><span class="muted">${esc(a.action === "insert" ? "Created" : a.action === "delete" ? "Deleted" : "Updated")} by ${esc(a.actor)}${a.fields && a.fields.length ? ": " + esc(a.fields.slice(0, 6).join(", ")) + (a.fields.length > 6 ? "…" : "") : ""} · ${new Date(a.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div></li>`);
      tl.insertAdjacentHTML("beforeend", items.join(""));
      [...tl.children].sort((x, y) => new Date(y.dataset.ts) - new Date(x.dataset.ts)).forEach(li => tl.appendChild(li));
      const c = tl.closest(".card").querySelector(".count"); if (c) c.textContent = tl.children.length;
      if (!tl.children.length) tl.insertAdjacentHTML("afterend", `<p class="muted">No activity yet. Use <strong>Log activity</strong> to record calls, emails, meetings and notes.</p>`);
    } catch (_) { /* history is optional; the page works without it */ }
  }

  function openChangePassword() {
    const dlg = $("#dlg");
    dlg.innerHTML = `<form method="dialog" id="pw-form">
      <div class="dlg-head"><h2>Change password</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body"><div class="form-grid">
        <label class="fld"><span>New password *</span><input type="password" name="p1" minlength="12" autocomplete="new-password" required></label>
        <label class="fld"><span>Confirm password *</span><input type="password" name="p2" minlength="12" autocomplete="new-password" required></label>
      </div><p class="muted small">At least 12 characters. A few unrelated words with a number works well. Other devices stay signed in.</p><p class="form-err" id="ferr" role="alert"></p></div>
      <div class="dlg-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Cancel</button><button type="submit" class="btn">Save password</button></div></form>`;
    const form = $("#pw-form");
    form.addEventListener("submit", async e => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const p1 = form.p1.value, p2 = form.p2.value;
      if (p1 !== p2) { $("#ferr").textContent = "The two passwords do not match."; return; }
      try { const s = await HAVCloud.session(); await HAVCloud.setPassword(s, p1); dlg.close(); toast("Password changed"); }
      catch (err) { $("#ferr").textContent = err.message || "Could not change password."; }
    });
    dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
    dlg.showModal();
  }

  function openActivity(key, id) {
    const dlg = $("#dlg");
    dlg.innerHTML = `<form method="dialog" id="act-form">
      <div class="dlg-head"><h2>Log activity · ${esc(id)}</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body"><div class="form-grid">
        <label class="fld"><span>Type *</span><select name="type" required>${["Call", "Email", "Meeting", "Interview", "Reference Check", "Note"].map(t => `<option>${t}</option>`).join("")}</select></label>
        <label class="fld"><span>Date *</span><input type="date" name="date" required value="${iso(today())}"></label>
        <label class="fld"><span>By</span><input name="by" value="${esc(state.lastBy || "")}" placeholder="Your name"></label>
        <label class="fld wide"><span>Summary *</span><textarea name="text" rows="3" required></textarea><small>Facts only, minimum necessary. No health, DBS or bank details, and nothing about people receiving care.</small></label>
        <label class="fld wide"><span>Next action (optional)</span><input name="next" placeholder="For example: call back with interview feedback"></label>
        <label class="fld"><span>Next action due</span><input type="date" name="due"></label>
      </div><p class="form-err" id="ferr" role="alert"></p></div>
      <div class="dlg-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Cancel</button><button type="submit" class="btn">Save</button></div></form>`;
    const form = $("#act-form");
    form.addEventListener("submit", e => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const d = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
      if (d.next && !d.due) { $("#ferr").textContent = "Add a due date for the next action."; return; }
      state.actSeq++; state.activity.push({ id: "AC" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), key, recId: id, type: d.type, date: d.date, text: d.text, by: d.by });
      if (d.by) state.lastBy = d.by;
      if (d.next) {
        const rec = findRec(key, id), nid = newId("followups");
        state.records.followups.push({ id: nid, created: new Date().toISOString(), "Type": ({ clients: "Client", candidates: "Candidate", vacancies: "Vacancy", placements: "Placement", assignments: "Assignment" })[key] || "Internal", "Related ID": id, "Organisation / Candidate": recLabel(key, rec), "Action": d.next, "Due Date": d.due, "Owner": d.by || "Director", "Status": "Open" });
        logChange("followups", nid, "created");
      }
      save(); dlg.close(); route(); toast(d.next ? "Activity and follow up saved" : "Activity saved");
    });
    dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
    dlg.showModal();
  }

  /* ---------------- pipeline board ---------------- */
  const BOARDS = {
    submissions: { title: "Candidate Submissions", key: "submissions", field: "Stage", cols: ["Draft", "Submitted", "Interview", "Offer", "Placed", "Rejected", "Withdrawn"] },
    clients: { title: "Client Pipeline", key: "clients", field: "Client Status", cols: ["Lead", "Prospect", "Qualified", "Terms Sent", "Active Client", "Expansion", "Dormant", "Do Not Supply"] },
    vacancies: { title: "Vacancies", key: "vacancies", field: "Vacancy Status", cols: ["Lead (advert seen)", "Open", "On Hold", "Filled", "Closed"] }
  };
  function pagePipeline(which) {
    const b = BOARDS[which] || BOARDS.submissions, reg = regByKey(b.key);
    const tabs = Object.entries(BOARDS).map(([k, x]) => `<a class="tab ${x === b ? "on" : ""}" href="#/pipeline/${k}">${esc(x.title)}</a>`).join("");
    const card = r => {
      let sub = "";
      if (b.key === "submissions") sub = `${esc(recLabel("vacancies", findRec("vacancies", r["Vacancy ID"])) || r["Vacancy ID"] || "")}${r["Client ID"] ? " · " + esc(recLabel("clients", findRec("clients", r["Client ID"]))) : ""}`;
      if (b.key === "clients") sub = esc(r["Service Type"] || "");
      if (b.key === "vacancies") sub = `${esc(recLabel("clients", findRec("clients", r["Client ID"])) || "")}${r["Target Fill Date"] ? " · fill by " + fmtDate(r["Target Fill Date"]) : ""}`;
      const fu = state.records.followups.filter(f => f["Related ID"] === r.id && f["Status"] !== "Closed").sort((x, y) => String(x["Due Date"]).localeCompare(String(y["Due Date"])))[0];
      const over = fu && fu["Due Date"] < iso(today());
      return `<article class="kcard" draggable="true" data-id="${esc(r.id)}">
        <a href="#/view/${b.key}/${encodeURIComponent(r.id)}"><strong>${esc(recLabel(b.key, r) || r.id)}</strong></a>
        <span class="muted small">${sub}</span>
        ${b.key === "submissions" && r["Consent Confirmed"] !== "Yes" ? `<span class="badge r">No consent</span>` : ""}
        ${fu ? `<span class="kfu ${over ? "over" : ""}">Next: ${esc(fu["Action"])} · ${fmtDate(fu["Due Date"])}</span>` : ""}
        <select class="kmove" aria-label="Move ${esc(r.id)}">${b.cols.map(c => `<option ${c === r[b.field] ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      </article>`;
    };
    const rows = state.records[b.key];
    const unassigned = rows.filter(r => !b.cols.includes(r[b.field]));
    return header("Pipeline Board", "Drag cards between columns, or use the menu on each card. Rules still apply: a submission cannot move past Draft without recorded consent.") +
      `<nav class="tabs">${tabs}</nav>` +
      (rows.length ? `<div class="kanban" data-board="${which in BOARDS ? which : "submissions"}">${b.cols.map(c => {
        const items = rows.filter(r => r[b.field] === c);
        return `<section class="kcol" data-col="${esc(c)}"><header>${badge(c)} <span class="count">${items.length}</span></header><div class="kdrop">${items.map(card).join("")}</div></section>`;
      }).join("")}</div>` : `<div class="empty">No ${esc(reg.title.toLowerCase())} yet. <a href="#/r/${b.key}">Add the first record</a>.</div>`) +
      (unassigned.length ? callout("Records without a status", `${unassigned.length} record(s) have no ${b.field.toLowerCase()} and are not shown: ${unassigned.map(r => r.id).join(", ")}.`, "warn") : "");
  }
  function moveCard(which, id, col) {
    const b = BOARDS[which], reg = regByKey(b.key), rec = findRec(b.key, id);
    if (!rec || rec[b.field] === col) return;
    const trial = Object.assign({}, rec, { [b.field]: col });
    const err = reg.validate && reg.validate(trial);
    if (err) { toast(err); route(); return; }
    rec[b.field] = col; rec.modified = new Date().toISOString();
    if (b.key === "submissions" && col === "Submitted" && !rec["Submitted Date"]) rec["Submitted Date"] = iso(today());
    if (b.key === "submissions" && col === "Offer" && !rec["Offer Date"]) rec["Offer Date"] = iso(today());
    if (b.key === "submissions" && ["Placed", "Rejected", "Withdrawn"].includes(col) && !rec["Outcome Date"]) rec["Outcome Date"] = iso(today());
    logChange(b.key, id, "updated", [b.field]); save(); route(); toast(`${id} moved to ${col}`);
  }

  /* ---------------- action plan ---------------- */
  const actOpen = r => !["Done", "Not needed"].includes(r["Status"]);
  function pageActions() {
    const rows = state.records.actions, t = iso(today());
    const total = rows.filter(r => r["Status"] !== "Not needed").length, done = rows.filter(r => r["Status"] === "Done").length;
    const overdue = rows.filter(r => actOpen(r) && r["Due Date"] && r["Due Date"] < t).length;
    const dueWeek = rows.filter(r => actOpen(r) && r["Due Date"] && r["Due Date"] >= t && r["Due Date"] <= addDays(t, 7)).length;
    const f = actions_filter;
    const phases = HAV.lists.actionPhase.filter(ph => rows.some(r => r["Phase"] === ph)).concat(rows.some(r => !HAV.lists.actionPhase.includes(r["Phase"])) ? ["Other"] : []);
    const show = r => f === "all" || (f === "open" && actOpen(r)) || (f === "overdue" && actOpen(r) && r["Due Date"] && r["Due Date"] < t) || (f === "done" && r["Status"] === "Done");
    const row = r => {
      const over = actOpen(r) && r["Due Date"] && r["Due Date"] < t;
      return `<li class="act ${r["Status"] === "Done" ? "done" : ""} ${over ? "over" : ""}">
        <label class="act-tick" title="Mark as done"><input type="checkbox" data-act="${esc(r.id)}" ${r["Status"] === "Done" ? "checked" : ""} aria-label="Done: ${esc(r["Task"])}"></label>
        <div class="act-main"><a href="#/view/actions/${encodeURIComponent(r.id)}">${esc(r["Task"])}</a>
          <span class="act-meta">${r["Deliverable"] ? esc(r["Deliverable"]) + " · " : ""}${r["Owner"] ? esc(r["Owner"]) + " · " : ""}${r["Status"] === "Done" ? "Done " + fmtDate(r["Done Date"]) : r["Due Date"] ? (over ? "<strong>Overdue</strong> · due " : "Due ") + fmtDate(r["Due Date"]) : "No due date"}${r["Evidence / Notes"] ? " · evidence recorded" : ""}</span></div>
        <span class="act-status">${badge(r["Status"])}</span></li>`;
    };
    const groups = phases.map(ph => {
      const items = rows.filter(r => (ph === "Other" ? !HAV.lists.actionPhase.includes(r["Phase"]) : r["Phase"] === ph)).sort((a, b) => String(a["Due Date"] || "9").localeCompare(String(b["Due Date"] || "9")));
      const vis = items.filter(show); if (!vis.length) return "";
      const d = items.filter(r => r["Status"] === "Done").length;
      return `<section class="card"><h2>${esc(ph)} <span class="count">${d} of ${items.length} done</span></h2><ul class="acts">${vis.map(row).join("")}</ul></section>`;
    }).join("");
    return header("Action Plan", "Tick each action when it is done. Open an action to record the date, owner and where the evidence is kept. Overdue actions also appear on the dashboard.") +
      `<section class="tiles mini">
        <div class="tile"><span class="tile-v">${done} / ${total}</span><span class="tile-l">Actions done</span></div>
        <div class="tile ${overdue ? "red" : ""}"><span class="tile-v">${overdue}</span><span class="tile-l">Overdue</span></div>
        <div class="tile"><span class="tile-v">${dueWeek}</span><span class="tile-l">Due in the next 7 days</span></div>
      </section>
      <div class="progress big"><div style="width:${total ? Math.round(done / total * 100) : 0}%"></div></div>
      <div class="toolbar">
        <nav class="tabs">${[["open", "Open"], ["overdue", "Overdue"], ["done", "Done"], ["all", "All"]].map(([k, l]) => `<button type="button" class="tab ${f === k ? "on" : ""}" data-af="${k}">${l}</button>`).join("")}</nav>
        <span class="spacer"></span>
        <a class="btn ghost" href="#/r/actions">Table view and CSV</a>
        <button class="btn ghost" id="seed">Load 30-day launch plan</button>
        <button class="btn" id="addact">Add action</button>
      </div>
      ${rows.length ? (groups || `<div class="empty">Nothing to show for this filter.</div>`) : `<div class="empty">No actions yet. Click <strong>Load 30-day launch plan</strong> to add the ${HAV.actionPlan.length} launch actions with due dates, or add your own.</div>`}`;
  }
  let actions_filter = "open";
  function seedActions() {
    const dlg = $("#dlg");
    dlg.innerHTML = `<form method="dialog" id="seed-form">
      <div class="dlg-head"><h2>Load 30-day launch plan</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body"><p>This adds ${HAV.actionPlan.length} actions: 30 launch days plus the temporary staffing readiness steps. Due dates count from the start date you choose. Actions already in your plan with the same name are skipped.</p>
      <div class="form-grid"><label class="fld"><span>Start date (day 1)</span><input type="date" name="start" value="${iso(today())}" required></label>
      <label class="fld"><span>Owner</span><input name="owner" value="${esc(state.lastBy || "Suroj Aryal")}"></label></div></div>
      <div class="dlg-foot"><span class="spacer"></span><button type="button" class="btn ghost" data-close>Cancel</button><button type="submit" class="btn">Add actions</button></div></form>`;
    const form = $("#seed-form");
    form.addEventListener("submit", e => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const start = form.start.value, owner = form.owner.value.trim();
      const have = new Set(state.records.actions.map(r => String(r["Task"]).toLowerCase()));
      let n = 0;
      HAV.actionPlan.forEach(([day, phase, task, deliverable]) => {
        if (have.has(task.toLowerCase())) return;
        const id = newId("actions");
        state.records.actions.push({ id, created: new Date().toISOString(), "Task": task, "Phase": phase, "Deliverable": deliverable, "Due Date": addDays(start, day - 1), "Owner": owner, "Status": "Not started" });
        logChange("actions", id, "created"); n++;
      });
      save(); dlg.close(); route(); toast(n ? `${n} actions added` : "All launch actions are already in your plan");
    });
    dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
    dlg.showModal();
  }
  function tickAction(id, on) {
    const r = findRec("actions", id); if (!r) return;
    if (on) { r["Status"] = "Done"; r["Done Date"] = r["Done Date"] || iso(today()); }
    else { r["Status"] = "In progress"; r["Done Date"] = ""; }
    r.modified = new Date().toISOString(); logChange("actions", id, "updated", ["Status", "Done Date"]); save(); route();
    toast(on ? "Marked as done. Open it to add evidence." : "Marked as not done");
  }

  /* ---------------- search ---------------- */
  function pageSearch(q) {
    q = (q || "").trim();
    const ql = q.toLowerCase();
    const groups = q.length < 2 ? [] : HAV.registers.map(reg => [reg, state.records[reg.key].filter(r => (r.id + " " + reg.fields.map(f => valueOf(reg, r, f[0])).join(" ")).toLowerCase().includes(ql))]).filter(g => g[1].length);
    const acts = q.length < 2 ? [] : state.activity.filter(a => a.text.toLowerCase().includes(ql));
    return header("Search", q ? `Results for “${q}” across every register and activity note.` : "Type at least two characters in the search box.") +
      `<form class="toolbar" id="sform"><input type="search" id="sq" value="${esc(q)}" placeholder="Name, email, postcode, ID, job title…" aria-label="Search everything"><button class="btn">Search</button></form>` +
      (q.length >= 2 && !groups.length && !acts.length ? `<div class="empty">Nothing found for “${esc(q)}”.</div>` : "") +
      groups.map(([reg, rows]) => `<section class="card"><h2>${esc(reg.title)} <span class="count">${rows.length}</span></h2>${table(["ID", reg.list[0], reg.status], rows.slice(0, 50).map(r => [`<a href="#/view/${reg.key}/${encodeURIComponent(r.id)}">${esc(r.id)}</a>`, esc(recLabel(reg.key, r)), badge(valueOf(reg, r, reg.status))]), "compact")}</section>`).join("") +
      (acts.length ? `<section class="card"><h2>Activity Notes <span class="count">${acts.length}</span></h2>${table(["Date", "Record", "Note"], acts.slice(0, 50).map(a => [fmtDate(a.date), `<a href="#/view/${a.key}/${encodeURIComponent(a.recId)}">${esc(a.recId)}</a>`, esc(a.text)]), "compact")}</section>` : "");
  }

  /* ---------------- reports ---------------- */
  function bars(rows, fmtV, opts = {}) {
    const max = Math.max(1, ...rows.map(r => r[1]));
    return `<div class="bars" role="table">${rows.map(([label, v, note, goal]) => `<div class="bar-row" role="row" title="${esc(label)}: ${esc(fmtV(v))}${note ? " (" + esc(note) + ")" : ""}">
      <span class="bar-l" role="cell">${esc(label)}${note ? `<small>${esc(note)}</small>` : ""}</span>
      <span class="bar-t" role="cell"><span class="bar-f" style="width:${Math.min(100, Math.max(v ? 2 : 0, v / (goal || max) * 100)).toFixed(1)}%"></span></span>
      <span class="bar-v" role="cell">${esc(fmtV(v))}</span></div>`).join("")}</div>`;
  }
  const pct = (a, b) => b ? Math.round(a / b * 100) : null;
  function pageReports() {
    const R = state.records, t = iso(today());
    const subs = R.submissions;
    const reached = s => {
      const st = s["Stage"];
      return {
        submitted: st && st !== "Draft",
        interview: !!s["Interview Date"] || ["Interview", "Offer", "Placed"].includes(st),
        offer: !!s["Offer Date"] || ["Offer", "Placed"].includes(st),
        placed: st === "Placed"
      };
    };
    const f = { submitted: 0, interview: 0, offer: 0, placed: 0 };
    subs.forEach(s => { const r = reached(s); Object.keys(f).forEach(k => { if (r[k]) f[k]++; }); });
    const cvI = pct(f.interview, f.submitted), iO = pct(f.offer, f.interview), oS = pct(f.placed, f.offer);

    const ttf = R.placements.map(p => { const v = findRec("vacancies", p["Vacancy ID"]); if (!v || !v["Open Date"] || !p["Start Date"]) return null; return Math.round((new Date(p["Start Date"]) - new Date(v["Open Date"])) / 864e5); }).filter(x => x != null && x >= 0).sort((a, b) => a - b);
    const median = ttf.length ? (ttf.length % 2 ? ttf[(ttf.length - 1) / 2] : Math.round((ttf[ttf.length / 2 - 1] + ttf[ttf.length / 2]) / 2)) : null;

    const feeBy = {};
    R.placements.forEach(p => { const k = p["Client ID"] || "Unassigned"; feeBy[k] = (feeBy[k] || 0) + num(p["Salary"]) * num(p["Fee %"]) / 100; });
    const invReg = regByKey("invoices");
    R.invoices.filter(i => i["Invoice Type"] === "Temporary Supply").forEach(i => { const k = i["Client ID"] || "Unassigned"; feeBy[k] = (feeBy[k] || 0) + num(i["Net"]); });
    const feeRows = Object.entries(feeBy).sort((a, b) => b[1] - a[1]);
    const feeTotal = feeRows.reduce((a, r) => a + r[1], 0);
    const topShare = feeRows.length ? pct(feeRows[0][1], feeTotal) : null;

    const due12 = R.placements.filter(p => p["Start Date"] && addDays(p["Start Date"], 84) <= t && p["Status"] !== "Cancelled");
    const ret12 = pct(due12.filter(p => p["12 Week Retained"] === "Yes").length, due12.length);

    const outstanding = R.invoices.reduce((a, i) => a + valueOf(invReg, i, "Outstanding"), 0);
    const overdue = R.invoices.filter(i => daysOverdue(i) > 0);
    const avgOver = overdue.length ? Math.round(overdue.reduce((a, i) => a + daysOverdue(i), 0) / overdue.length) : 0;

    const wk = weekKey(), wkEnd = addDays(wk, 7);
    const thisWeek = state.activity.filter(a => a.date >= wk && a.date < wkEnd);
    const cnt = ty => thisWeek.filter(a => a.type === ty).length;
    const newClients = R.clients.filter(c => (c.created || "").slice(0, 10) >= wk).length;

    const sources = {};
    R.candidates.forEach(c => { const k = (c["Source Of Data"] || "Not recorded").trim() || "Not recorded"; sources[k] = (sources[k] || 0) + 1; });
    const stages = HAV.lists.clientStatus.map(s => [s, R.clients.filter(c => c["Client Status"] === s).length]);

    const kpi = (label, val, target, ok) => `<div class="tile ${ok === false ? "red" : ""}"><span class="tile-v">${val == null ? "—" : val}</span><span class="tile-l">${esc(label)}</span>${target ? `<span class="tile-t">${esc(target)}</span>` : ""}</div>`;
    return header("Reports", "Live figures calculated from your registers and activity log. Figures describe your records, not verified business results.") +
      `<section class="tiles">
        ${kpi("CV to interview", cvI == null ? null : cvI + "%", "Investigate if under 20%", cvI == null ? null : cvI >= 20)}
        ${kpi("Interview to offer", iO == null ? null : iO + "%", "Trend by client")}
        ${kpi("Offer to start", oS == null ? null : oS + "%", "Target over 80%", oS == null ? null : oS > 80)}
        ${kpi("12 week retention", ret12 == null ? null : ret12 + "%", "Target over 85%", ret12 == null ? null : ret12 > 85)}
        ${kpi("Median time to fill", median == null ? null : median + " days", "Vacancy open to start")}
        ${kpi("Top client share", topShare == null ? null : topShare + "%", "Review if over 25%", topShare == null ? null : topShare <= 25)}
      </section>
      <div class="grid2">
        <section class="card"><h2>Recruitment Funnel</h2>${bars([["Submitted", f.submitted], ["Interview", f.interview], ["Offer", f.offer], ["Placed", f.placed]], v => String(v))}
          <p class="muted small">Counts submissions that reached each stage. A submission is only counted after it leaves Draft.</p></section>
        <section class="card"><h2>This Week’s Activity</h2>${bars([["Follow-up calls", cnt("Call"), "target 15–20", 15], ["Emails", cnt("Email"), "target 10–15", 10], ["Meetings", cnt("Meeting"), "target 3", 3], ["Interviews", cnt("Interview"), "", 5], ["New client records", newClients, "target 20 researched", 20]], v => String(v))}
          <p class="muted small">Bars show progress towards each weekly target, from activity logged since ${fmtDate(wk)}. Targets are the founder launch rhythm in the operating system.</p></section>
        <section class="card"><h2>Fees By Client</h2>${feeRows.length ? bars(feeRows.slice(0, 10).map(([k, v]) => [recLabel("clients", findRec("clients", k)) || k, v]), v => gbp.format(v)) + `<p class="muted small">Permanent fees (salary × fee %) plus temporary supply invoices, ex VAT. Total ${gbp.format(feeTotal)}.</p>` : `<p class="muted">No placements or temporary invoices yet.</p>`}</section>
        <section class="card"><h2>Client Pipeline</h2>${bars(stages, v => String(v))}</section>
        <section class="card"><h2>Candidate Sources</h2>${Object.keys(sources).length ? bars(Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 10), v => String(v)) : `<p class="muted">No candidates yet.</p>`}</section>
        <section class="card"><h2>Cash Position</h2>${table(["Measure", "Value"], [["Outstanding invoices (inc VAT)", gbp.format(outstanding)], ["Invoices overdue", String(overdue.length)], ["Average days overdue", overdue.length ? avgOver + " days" : "—"], ["Rule", "Freeze new exposure if debtor days exceed 45"]].map(r => r.map(esc)), "compact")}</section>
      </div>`;
  }

  /* ---------------- CSV import and calendar export ---------------- */
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(c => c.trim() !== ""));
  }
  function toIsoDate(v) {
    v = String(v || "").trim(); if (!v) return "";
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (m) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
    return v;
  }
  function importCSV(key, text, opts) {
    const keep = (opts && opts.keep) || [];
    const reg = regByKey(key), rows = parseCSV(text);
    if (rows.length < 2) throw new Error("No data rows found");
    const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
    let hi = rows.findIndex(r => r.some(c => norm(c) === "id" || /id$/.test(norm(c)) && reg.fields.some(f => norm(f[0]) === norm(c)) || reg.fields.some(f => norm(f[0]) === norm(c))));
    if (hi < 0) throw new Error("No matching column headings. Use the headings from the Export CSV file.");
    const head = rows[hi].map(norm), idCol = head.findIndex((h, i) => h === "id" || (h.endsWith("id") && h === norm(reg.title.replace(/s$/, "") + " ID")) || (i === 0 && h.endsWith("id") && !reg.fields.some(f => norm(f[0]) === h)));
    const map = reg.fields.filter(f => f[1] !== "derived").map(f => [f, head.indexOf(norm(f[0]))]).filter(x => x[1] >= 0);
    if (!map.length) throw new Error("No matching column headings. Use the headings from the Export CSV file.");
    const existing = new Set(state.records[key].map(r => r.id));
    const recs = rows.slice(hi + 1).map(r => {
      const o = {};
      map.forEach(([f, i]) => { let v = (r[i] || "").trim(); if (f[1] === "date") v = toIsoDate(v); if (["money", "number", "pct"].includes(f[1])) v = v.replace(/[£,%\s]/g, ""); o[f[0]] = v; });
      const wanted = idCol >= 0 ? (r[idCol] || "").trim() : "";
      return [wanted, o];
    }).filter(([, o]) => Object.values(o).some(v => v));
    if (!recs.length) throw new Error("No data rows found");
    /* Rows that match an existing record (same ID, or the register's import key such as
       the CQC location ID) update that record's non-empty fields instead of duplicating it. */
    const keyOf = reg.importKey || (() => "");
    const byKey = new Map();
    state.records[key].forEach(r => { const k = keyOf(r); if (k) byKey.set(k, r); });
    const byId = new Map(state.records[key].map(r => [r.id, r]));
    const target = ([wanted, o]) => (wanted && byId.get(wanted)) || (keyOf(o) && byKey.get(keyOf(o))) || null;
    const nUpd = recs.filter(target).length, nNew = recs.length - nUpd;
    if (!confirm(`${reg.title}: add ${nNew} new record(s)${nUpd ? ` and update ${nUpd} existing record(s)` : ""}? ${map.length} column(s) matched: ${map.map(m => m[0][0]).slice(0, 8).join(", ")}${map.length > 8 ? "…" : ""}`)) return 0;
    recs.forEach(([wanted, o]) => {
      const hit = target([wanted, o]);
      if (hit) {
        const changed = Object.keys(o).filter(k => o[k] && !(keep.includes(k) && hit[k]) && String(hit[k] || "") !== o[k]);
        if (changed.length) { changed.forEach(k => { hit[k] = o[k]; }); hit.modified = new Date().toISOString(); logChange(key, hit.id, "updated", changed); }
        return;
      }
      let id = wanted && !existing.has(wanted) && new RegExp("^" + reg.prefix + "\\d+$").test(wanted) ? wanted : "";
      if (id) { const n = parseInt(id.slice(reg.prefix.length), 10); if (n > state.seq[key]) state.seq[key] = n; } else id = newId(key);
      existing.add(id);
      state.records[key].push(Object.assign({ id, created: new Date().toISOString() }, o));
      logChange(key, id, "imported");
    });
    save(); return recs.length;
  }
  /* Adds advertised vacancies as leads, creating the client first if it is not in the CRM yet.
     Safe to run again: clients match on CQC location ID, vacancies on their advert link. */
  function loadVacancyLeads() {
    const cReg = regByKey("clients"), vReg = regByKey("vacancies"), items = HAV.vacancyLeads.items;
    const findClient = c => { const k = cReg.importKey(c); return (k && state.records.clients.find(r => cReg.importKey(r) === k)) || state.records.clients.find(r => r["Trading Name / Service"] === c["Trading Name / Service"]); };
    const findVac = v => state.records.vacancies.find(r => vReg.importKey(r) === vReg.importKey(v));
    const newVac = items.filter(x => !findVac(x.vac)).length;
    const newCl = new Set(items.filter(x => !findClient(x.client)).map(x => x.client["Trading Name / Service"])).size;
    if (!newVac) { toast("All vacancy leads are already in the CRM"); return; }
    if (!confirm(`Add ${newVac} vacancy lead(s) seen on ${HAV.vacancyLeads.checked}${newCl ? ` and ${newCl} new client(s)` : ""}? They are marked "Lead (advert seen)" until the client signs terms.`)) return;
    items.forEach(({ client, vac }) => {
      if (findVac(vac)) return;
      let cl = findClient(client);
      if (!cl) { cl = Object.assign({ id: newId("clients"), created: new Date().toISOString() }, client); state.records.clients.push(cl); logChange("clients", cl.id, "created"); }
      const id = newId("vacancies");
      state.records.vacancies.push(Object.assign({ id, created: new Date().toISOString(), "Client ID": cl.id }, vac));
      logChange("vacancies", id, "created");
    });
    save(); route(); toast(`${newVac} vacancy lead(s) added`);
  }
  /* Adds the planned week 1 calls, linked to the client by CQC location ID when it is in the CRM.
     Safe to run again: an identical organisation, action and due date is never added twice. */
  function loadWeekOneFollowUps() {
    const cReg = regByKey("clients"), src = HAV.weekOneFollowUps;
    const exists = x => state.records.followups.some(f => f["Organisation / Candidate"] === x.org && f["Action"] === x.action && f["Due Date"] === x.due);
    const todo = src.items.filter(x => !exists(x));
    if (!todo.length) { toast("Week 1 follow ups are already in the CRM"); return; }
    if (!confirm(`Add ${todo.length} follow up(s) for ${src.label}?`)) return;
    todo.forEach(x => {
      const cl = x.cqc ? state.records.clients.find(r => cReg.importKey(r) === x.cqc) : null;
      const id = newId("followups");
      state.records.followups.push({ id, created: new Date().toISOString(), "Type": x.type || "Client", "Related ID": cl ? cl.id : "", "Organisation / Candidate": x.org, "Contact": x.contact, "Action": x.action, "Due Date": x.due, "Owner": "Suroj Aryal", "Status": "Open", "Next Action": x.next });
      logChange("followups", id, "created");
    });
    save(); route(); toast(`${todo.length} follow up(s) added`);
  }
  /* ---------------- CV database: online applications (cloud only) ---------------- */
  const APPS = { rows: null, error: "", f: { q: "", status: "active", role: "", quals: [], drives: false, area: "", work: "" } };
  const APP_STATUS = ["New", "Reviewed", "Added", "Not suitable", "Withdrawn"];
  function pageApplications() {
    const intro = "Candidates who registered through your public page. Search the pool, open CVs securely, and add suitable people to Candidates.";
    if (!CLOUD) return header("CV Database", intro) + callout("Sign in needed", "The CV database lives in the cloud. Sign in at operation.havertoncare.co.uk to use it.", "warn");
    const link = "https://operation.havertoncare.co.uk/apply/";
    return header("CV Database", intro) +
      `<div class="card cv-share"><div><strong>Your registration page</strong><br><a href="${link}" target="_blank" rel="noopener">${link}</a><br><span class="muted small">Put this link in every advert, post and email signature. Add <code>?src=facebook</code> (or linkedin, indeed, referral) to see where people came from.</span></div><button class="btn ghost" id="cv-copy">Copy link</button></div>
      <div id="apps"><p class="muted">Loading applications…</p></div>`;
  }
  async function loadApplications(force) {
    const box = $("#apps"); if (!box) return;
    if (!APPS.rows || force) {
      try { APPS.rows = await HAVCloud.all("applications", "select=*&order=created_at.desc"); APPS.error = ""; }
      catch (e) { APPS.rows = null; APPS.error = /applications|relation|schema cache|404/i.test(e.message) ? "The CV database is not switched on yet. Run supabase/cv-database.sql in the Supabase SQL Editor." : e.message; }
    }
    drawApplications();
  }
  function appMatches(a) {
    const f = APPS.f;
    if (f.status === "active" && !["New", "Reviewed"].includes(a.status)) return false;
    if (f.status !== "active" && f.status !== "all" && a.status !== f.status) return false;
    if (f.role && a.target_role !== f.role && !String(a.other_roles || "").includes(f.role)) return false;
    if (f.quals.length && !f.quals.every(q => (a.quals || []).includes(q))) return false;
    if (f.drives && !a.drives) return false;
    if (f.work && a.work_type !== f.work && a.work_type !== "Both") return false;
    if (f.area) { const pcs = f.area.toUpperCase().split(/[\s,]+/).filter(Boolean), pc = String(a.postcode || "").toUpperCase().replace(/\s+/g, ""); if (!pcs.some(p => pc.startsWith(p.replace(/\s+/g, "")))) return false; }
    if (f.q) { const hay = [a.full_name, a.email, a.phone, a.postcode, a.target_role, a.other_roles, a.availability, a.about, (a.quals || []).join(" "), a.source].join(" ").toLowerCase(); if (!f.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false; }
    return true;
  }
  function drawApplications() {
    const box = $("#apps"); if (!box) return;
    if (APPS.error) { box.innerHTML = callout("CV database unavailable", APPS.error, "warn"); return; }
    const rows = APPS.rows || [], f = APPS.f, hits = rows.filter(appMatches);
    const newN = rows.filter(a => a.status === "New").length;
    const old = rows.filter(a => a.status !== "Added" && (Date.now() - new Date(a.created_at)) > 730 * 864e5).length;
    const opt = (v, l, sel) => `<option value="${esc(v)}" ${sel ? "selected" : ""}>${esc(l)}</option>`;
    box.innerHTML = `
      <div class="tiles">${[["New applications", newN], ["In the pool", rows.filter(a => ["New", "Reviewed"].includes(a.status)).length], ["Added to Candidates", rows.filter(a => a.status === "Added").length], ["Matching your search", hits.length]].map(([l, n]) => `<div class="tile"><span class="tile-v">${n}</span><span class="tile-l">${l}</span></div>`).join("")}</div>
      ${old ? callout("Retention review due", `${old} application(s) are over 2 years old and were never added to Candidates. Your privacy notice says these are deleted after 2 years unless the person asks to stay.`, "warn") : ""}
      <div class="toolbar cv-filters">
        <input type="search" id="aq" placeholder="Search name, skills, availability…" value="${esc(f.q)}" aria-label="Search applications">
        <select id="ast" aria-label="Status">${opt("active", "New and reviewed", f.status === "active")}${opt("all", "All statuses", f.status === "all")}${APP_STATUS.map(s => opt(s, s, f.status === s)).join("")}</select>
        <select id="arole" aria-label="Role"><option value="">Any role</option>${HAV.cvRoles.map(r => opt(r, r, f.role === r)).join("")}</select>
        <select id="awork" aria-label="Work type"><option value="">Permanent or temporary</option>${["Permanent", "Temporary when available"].map(w => opt(w, w, f.work === w)).join("")}</select>
        <input id="aarea" placeholder="Area, e.g. BR8, DA1, DA14" value="${esc(f.area)}" aria-label="Postcode areas">
        <label class="chk"><input type="checkbox" id="adrv" ${f.drives ? "checked" : ""}> Drives</label>
        <span class="spacer"></span><button class="btn ghost" id="arefresh">Refresh</button>
      </div>
      <details class="cv-qf" ${f.quals.length ? "open" : ""}><summary>Must have (${f.quals.length ? f.quals.length + " selected" : "any"})</summary><div class="chips">${HAV.cvQuals.map(q => `<label class="chip"><input type="checkbox" value="${esc(q)}" ${f.quals.includes(q) ? "checked" : ""}> ${esc(q)}</label>`).join("")}</div></details>
      ${hits.length ? table(["Received", "Name", "Role", "Area", "Skills", "Drives", "Right to work", "Status", ""], hits.map(a => [
        fmtDate(String(a.created_at).slice(0, 10)), `<button class="link rname" data-app="${esc(a.id)}">${esc(a.full_name)}</button>`, esc(a.target_role || ""), esc(String(a.postcode || "").toUpperCase().split(" ")[0]),
        (a.quals || []).slice(0, 3).map(q => `<span class="badge n">${esc(q.replace(/ \(.*\)$/, ""))}</span>`).join(" ") + ((a.quals || []).length > 3 ? ` <span class="muted small">+${a.quals.length - 3}</span>` : ""),
        a.drives ? "Yes" : "No", esc(a.right_to_work || ""), badge(a.status === "Added" ? "Complete" : a.status === "New" ? "Pending" : a.status === "Not suitable" || a.status === "Withdrawn" ? "Closed" : "Open").replace(/>[^<]*</, `>${esc(a.status)}<`),
        `<button class="link" data-app="${esc(a.id)}">Open</button>`]), "reg") : `<div class="empty">${rows.length ? "No applications match these filters." : "No applications yet. Share your registration page link to start building your CV database."}</div>`}`;
    const redraw = () => { f.q = $("#aq").value.trim(); f.status = $("#ast").value; f.role = $("#arole").value; f.work = $("#awork").value; f.area = $("#aarea").value.trim(); f.drives = $("#adrv").checked; f.quals = [...box.querySelectorAll(".cv-qf input:checked")].map(i => i.value); const pos = $("#aq").selectionStart, focus = document.activeElement && document.activeElement.id; drawApplications(); if (focus && $("#" + focus)) { $("#" + focus).focus(); if (focus === "aq") $("#aq").setSelectionRange(pos, pos); } };
    ["#aq", "#aarea"].forEach(s => $(s).addEventListener("input", redraw));
    ["#ast", "#arole", "#awork", "#adrv"].forEach(s => $(s).addEventListener("change", redraw));
    box.querySelectorAll(".cv-qf input").forEach(i => i.addEventListener("change", redraw));
    $("#arefresh").addEventListener("click", () => loadApplications(true));
    box.querySelectorAll("[data-app]").forEach(b => b.addEventListener("click", () => openApplication(b.dataset.app)));
  }
  async function openCv(path) {
    const w = window.open("about:blank", "_blank");
    try { const u = await HAVCloud.cvLink(path); if (w) w.location = u; else location.href = u; }
    catch (e) { if (w) w.close(); toast("Could not open CV: " + e.message); }
  }
  function openApplication(appId) {
    const a = (APPS.rows || []).find(x => x.id === appId); if (!a) return;
    const dlg = $("#dlg"), row = (k, v) => v || v === 0 ? `<dt>${esc(k)}</dt><dd>${v}</dd>` : "";
    const cand = a.candidate_id && findRec("candidates", a.candidate_id);
    dlg.innerHTML = `<div class="dlg-head"><h2>${esc(a.full_name)} · ${esc(a.target_role || "")}</h2><button type="button" class="x" data-close aria-label="Close">×</button></div>
      <div class="dlg-body"><dl class="kvs">
        ${row("Received", esc(new Date(a.created_at).toLocaleString("en-GB")))}${row("Status", esc(a.status) + (a.reviewed_by ? ` <span class="muted small">by ${esc(a.reviewed_by)}</span>` : ""))}
        ${row("Email", `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>`)}${row("Phone", a.phone ? `<a href="tel:${esc(a.phone)}">${esc(a.phone)}</a>` : "")}${row("Postcode", esc(a.postcode || ""))}
        ${row("Also interested in", esc(a.other_roles || ""))}${row("Work type", esc(a.work_type || ""))}${row("Availability", esc(a.availability || ""))}
        ${row("Experience", a.experience_years != null ? esc(a.experience_years + " year(s)") : "")}${row("Drives", a.drives ? "Yes" : "No")}${row("Will travel", a.travel_miles != null ? esc(a.travel_miles + " miles") : "")}
        ${row("Right to work (their answer)", esc(a.right_to_work || ""))}${row("Qualifications and skills", (a.quals || []).map(q => `<span class="badge n">${esc(q)}</span>`).join(" "))}
        ${row("About them", esc(a.about || "").replace(/\n/g, "<br>"))}${row("Heard about us", esc(a.source || ""))}${row("Job alerts by email", a.marketing_consent ? "Yes, consented" : "No")}
        ${row("Privacy notice seen", esc("Version " + a.privacy_version))}${row("Candidate record", cand ? `<a href="#/view/candidates/${encodeURIComponent(cand.id)}" data-close>${esc(cand.id)}</a>` : a.candidate_id ? esc(a.candidate_id) : "")}
      </dl>
      <label class="fld wide"><span>Review note (optional)</span><textarea id="anote" rows="2" maxlength="1000">${esc(a.review_note || "")}</textarea></label>
      <p class="muted small">Right to work is the candidate's own answer, not a check. Collect identity, qualifications and two references before any introduction.</p></div>
      <div class="dlg-foot">${a.cv_path ? `<button class="btn ghost" id="a-cv">Open CV</button>` : `<span class="muted small">No CV uploaded</span>`}
        <button class="btn ghost danger" id="a-del" title="Delete the application and CV (for example on request)">Delete</button><span class="spacer"></span>
        <select id="a-st" aria-label="Status">${APP_STATUS.filter(s => s !== "Added" || a.status === "Added").map(s => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}</select>
        <button class="btn ghost" id="a-save">Save</button>${a.status !== "Added" ? `<button class="btn" id="a-add">Add to Candidates</button>` : ""}</div>`;
    dlg.showModal();
    const patch = async body => { await HAVCloud.api("PATCH", `applications?id=eq.${encodeURIComponent(a.id)}`, body, { Prefer: "return=minimal" }); Object.assign(a, body); };
    if (a.cv_path) $("#a-cv").addEventListener("click", () => openCv(a.cv_path));
    $("#a-save").addEventListener("click", async () => {
      try { await patch({ status: $("#a-st").value, review_note: $("#anote").value.trim() || null }); dlg.close(); drawApplications(); toast("Application updated"); } catch (e) { toast("Could not save: " + e.message); }
    });
    const add = $("#a-add"); if (add) add.addEventListener("click", async () => {
      const dup = state.records.candidates.find(c => c["Email"] && String(c["Email"]).toLowerCase() === a.email);
      if (dup && !confirm(`${dup.id} ${dup["Full Name"] || ""} already has this email address. Add a new candidate record anyway?`)) return;
      const role = HAV.lists.role.includes(a.target_role) ? a.target_role : "Other";
      const nid = newId("candidates"), due = new Date(Date.now() + 2 * 864e5);
      state.records.candidates.push({ id: nid, created: new Date().toISOString(), "Full Name": a.full_name, "Email": a.email, "Phone": a.phone || "", "Postcode": String(a.postcode || "").toUpperCase(),
        "Target Role": role, "Candidate Route": a.work_type === "Both" ? "Both" : a.work_type === "Temporary when available" ? "Temporary Supply" : "Permanent Introduction", "Current Stage": "New",
        "Source Of Data": "Online application" + (a.source ? " (" + a.source + ")" : ""), "Privacy Notice Given": "Yes", "Privacy Notice Version / Date": `Version ${a.privacy_version}, online form ${String(a.created_at).slice(0, 10)}`,
        "Consent To Represent": "No", "Availability": [a.availability, a.travel_miles != null ? `travels up to ${a.travel_miles} miles` : ""].filter(Boolean).join("; "),
        "Qualifications / Skills": (a.quals || []).join("; ") + (a.experience_years != null ? `; ${a.experience_years} year(s) experience` : "") + (role === "Other" ? `; wants: ${a.target_role}` : ""),
        "Drives": a.drives ? "Yes" : "No", "Application ID": a.id, "CV File": a.cv_path || "", "Marketing / Contact Preference": a.marketing_consent ? "Job alerts by email: consented" : "Contact about roles only",
        "Last Contact": "", "Next Action Date": iso(due) });
      logChange("candidates", nid, "created"); save();
      try { await patch({ status: "Added", candidate_id: nid, review_note: $("#anote").value.trim() || null }); } catch (e) { toast("Candidate added, but the application status did not update: " + e.message); }
      dlg.close(); location.hash = "#/view/candidates/" + encodeURIComponent(nid); toast(`Added as ${nid}. Next: screening call.`);
    });
    $("#a-del").addEventListener("click", async () => {
      if (!confirm(`Permanently delete ${a.full_name}'s application${a.cv_path ? " and CV" : ""}? Use this when someone asks to be removed or the retention period has passed. It cannot be undone.`)) return;
      try { if (a.cv_path) await HAVCloud.cvDelete(a.cv_path); await HAVCloud.api("DELETE", `applications?id=eq.${encodeURIComponent(a.id)}`, undefined, { Prefer: "return=minimal" });
        APPS.rows = APPS.rows.filter(x => x.id !== a.id); dlg.close(); drawApplications(); toast("Application and CV deleted"); }
      catch (e) { toast("Could not delete: " + e.message); }
    });
  }
  function exportICS() {
    const open = state.records.followups.filter(f => f["Status"] !== "Closed" && /^\d{4}-\d{2}-\d{2}$/.test(f["Due Date"] || ""));
    if (!open.length) { toast("No open follow ups with a due date"); return; }
    const escI = s => String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, m => "\\" + m).replace(/\n/g, "\\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const ev = open.map(f => { const d = f["Due Date"].replace(/-/g, ""), n = addDays(f["Due Date"], 1).replace(/-/g, "");
      return ["BEGIN:VEVENT", `UID:${f.id}@operation.havertoncare.co.uk`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${n}`, `SUMMARY:${escI(f["Action"] + (f["Organisation / Candidate"] ? " – " + f["Organisation / Candidate"] : ""))}`, `DESCRIPTION:${escI("Haverton follow up " + f.id + (f["Owner"] ? " · owner " + f["Owner"] : ""))}`, "BEGIN:VALARM", "TRIGGER:PT9H", "ACTION:DISPLAY", "DESCRIPTION:Follow up due", "END:VALARM", "END:VEVENT"].join("\r\n"); });
    download(`Haverton Follow Ups ${iso(today())}.ics`, ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Haverton Care Limited//Operations//EN", "CALSCALE:GREGORIAN"].concat(ev, ["END:VCALENDAR"]).join("\r\n"), "text/calendar");
  }

  function pageGoLive() {
    const g = state.golive, live = tempLive();
    return header("Temporary Staffing Go Live Gate", "Complete before Haverton supplies its first temporary worker. Every item must be evidenced, signed and dated. “In progress” is not a pass.") +
      callout("No-go rule", "If any gate is red, temporary supply stays off. Repeat this sign-off after a material change in payroll model, insurance, umbrella use, worker category or operating territory.", "danger") +
      `<section class="card"><h2>Company Level Gates</h2>${table(["Gate", "Evidence required", "Authority"], plain(HAV.companyGates))}</section>
      <section class="card"><h2>Sign Off Checklist <span class="count">${goLiveProgress()} / ${HAV.goLive.length}</span></h2>
      <div class="tbl-wrap"><table class="golive"><thead><tr><th>Control</th><th>Done</th><th>Evidence location / reference</th><th>Signed by</th><th>Date</th></tr></thead><tbody>
      ${HAV.goLive.map((c, i) => { const it = g.items[i] || {}; const ok = it.done && it.evidence && it.by && it.date; return `<tr class="${ok ? "ok" : ""}"><td>${esc(c)}</td><td><input type="checkbox" data-gl="${i}" data-k="done" ${it.done ? "checked" : ""} aria-label="Done"></td><td><input data-gl="${i}" data-k="evidence" value="${esc(it.evidence || "")}" aria-label="Evidence"></td><td><input data-gl="${i}" data-k="by" value="${esc(it.by || "")}" aria-label="Signed by"></td><td><input type="date" data-gl="${i}" data-k="date" value="${esc(it.date || "")}" aria-label="Date"></td></tr>`; }).join("")}
      </tbody></table></div></section>
      <section class="card"><h2>Director Final Approval</h2>
        <p>Temporary staffing remains disabled until the Director records a final GO decision. The GO option is only available once every control above is evidenced and signed.</p>
        <div class="form-grid">
          <label class="fld"><span>Decision</span><select id="dir-decision"><option value="">Not decided</option><option ${g.director.decision === "NO GO" ? "selected" : ""}>NO GO</option><option ${g.director.decision === "GO" ? "selected" : ""} ${goLiveProgress() < HAV.goLive.length ? "disabled" : ""}>GO</option></select></label>
          <label class="fld"><span>Director name</span><input id="dir-name" value="${esc(g.director.name || "")}"></label>
          <label class="fld"><span>Date</span><input type="date" id="dir-date" value="${esc(g.director.date || "")}"></label>
          <label class="fld wide"><span>Pilot cap and conditions</span><textarea id="dir-notes" rows="2">${esc(g.director.notes || "")}</textarea></label>
        </div>
        <div class="status-big ${live ? "go" : "off"}">${live ? "Temporary staffing: GO" : "Temporary staffing: OFF"}</div>
      </section>`;
  }

  function pageControls() {
    return header("Controls And Authority", "Scale gates, growth kill switches and the decision rights matrix.") +
      `<section class="card"><h2>Non Negotiable Scale Gates</h2>${table(["Area", "Status", "Control requirement"], HAV.scaleGates.map(([a, s, c]) => [esc(a), badge(s), esc(c)]))}</section>
      <section class="card"><h2>Growth Kill Switches</h2>${table(["Trigger", "Required action"], plain(HAV.killSwitches))}</section>
      <section class="card"><h2>Decision Rights And Approval Matrix</h2>${table(["Decision", "Default authority", "Escalation / rule"], plain(HAV.decisionRights))}</section>
      ${callout("Compliance ownership", "The Director owns the compliance framework at launch. Individual tasks can be delegated; legal accountability and go-live authority cannot be delegated by assumption.", "info")}
      <section class="card"><h2>Compliance Hierarchy</h2><ol class="steps"><li>Law and binding regulation.</li><li>Regulator / statutory guidance and codes.</li><li>Signed client / worker contracts and role-specific requirements.</li><li>Haverton policy and procedure.</li><li>Operational checklist and CRM status.</li></ol>
      <p>Where a client requirement conflicts with law or Haverton safety standards, the request is not followed merely because the client asked for it. The issue is escalated and the service is paused if necessary.</p></section>`;
  }

  function pageProcedures(n) {
    if (n) {
      const p = HAV.procedures.find(x => String(x.n) === n);
      if (!p) return pageNotFound();
      const prev = HAV.procedures.find(x => x.n === p.n - 1), next = HAV.procedures.find(x => x.n === p.n + 1);
      return `<p class="crumb"><a href="#/procedures">Procedures</a> / SOP ${p.n}</p>` + header(`${p.n}. ${p.title}`, p.purpose) +
        `<section class="card"><h2>Scope</h2><p>${esc(p.scope)}</p></section>
        <section class="card"><h2>Procedure</h2><ol class="steps">${p.procedure.map(s => `<li>${esc(s)}</li>`).join("")}</ol></section>
        <div class="grid2"><section class="card"><h2>Required Records</h2><ul>${p.records.map(s => `<li>${esc(s)}</li>`).join("")}</ul></section>
        <section class="card"><h2>Quality Controls</h2><ul>${p.controls.map(s => `<li>${esc(s)}</li>`).join("")}</ul></section></div>
        ${p.stop ? callout("Escalation / stop rule", p.stop, "danger") : ""}
        <nav class="pager">${prev ? `<a href="#/procedures/${prev.n}">← ${prev.n}. ${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a href="#/procedures/${next.n}">${next.n}. ${esc(next.title)} →</a>` : ""}</nav>
        <p class="muted small">Source: Haverton Recruitment Compliance And Procedures Pack v2.0, 21 September 2026. Internal operating standard; does not replace role-specific legal advice or current regulator guidance. <button class="link" data-print>Print this procedure</button></p>`;
    }
    return header("Procedures", "Controlled standard operating procedures. Reviewed at least annually and immediately after material legal or regulatory change, serious incident, audit failure or operating-model change.") +
      `<div class="toolbar"><input type="search" id="pq" placeholder="Search procedures" aria-label="Search procedures"></div>
      <div class="sop-grid" id="sop-grid">${sopCards("")}</div>
      <section class="card"><h2>Core File Structure</h2><p>The legacy “Staff Personnel File Contents” list is not adopted as-is: it contains outdated CRB / P46 terminology and mixes categories that should be separated for privacy and access control.</p>${table(["File", "Minimum content"], plain(HAV.fileStructure))}</section>`;
  }
  function sopCards(q) {
    q = q.toLowerCase();
    return HAV.procedures.filter(p => !q || JSON.stringify(p).toLowerCase().includes(q)).map(p => `<a class="sop" href="#/procedures/${p.n}"><span class="sop-n">${p.n}</span><strong>${esc(p.title)}</strong><span>${esc(p.purpose)}</span></a>`).join("") || `<div class="empty">No procedure matches.</div>`;
  }

  function pageStrategy() {
    const S = HAV.strategy;
    return header("Strategy And Services", "Haverton Recruitment And Staffing: a specialist care-sector recruitment company with two operating engines, permanent and retained search now, controlled temporary staffing only after the gate.") +
      callout("Strategic verdict", S.verdict, "info") +
      `<div class="grid2"><section class="card"><h2>Mission</h2><p>${esc(S.mission)}</p><h3>Positioning rule</h3><p>${esc(S.positioning)}</p></section>
      <section class="card"><h2>Brand Promise</h2><ul>${S.promise.map(p => `<li>${esc(p)}</li>`).join("")}</ul></section></div>
      <section class="card"><h2>Legal And Trading Structure</h2>${table(["Item", "Position"], plain(S.identity))}
      <p class="muted small">Recruitment is a separate business activity from Haverton Home Care (planned domiciliary care, preparing for CQC registration) and Haverton Care Hub (consultancy and training). Companies House incorporation is not CQC registration.</p></section>
      <section class="card"><h2>Ideal Client Profile</h2>${table(["Tier", "Profile", "Problems Haverton solves", "Commercial approach"], plain(S.icp))}</section>
      <section class="card"><h2>Initial Role Niches</h2>${table(["Lane", "Launch priority", "Roles"], plain(S.lanes))}</section>
      <section class="card"><h2>What Not To Do</h2><ul>${S.dont.map(p => `<li>${esc(p)}</li>`).join("")}</ul></section>
      <section class="card"><h2>Permanent And Retained Fee Guide</h2>${table(["Role band", "Launch fee guide", "Commercial control"], plain(S.fees))}
      <h3>Compliance-assisted recruitment</h3><p>Sold as a separate professional service (recruitment-file audits, safer recruitment process design, interview packs, onboarding controls, training-matrix setup, staff-file quality reviews), never as a disguised guarantee that a provider will pass CQC inspection.</p></section>
      <section class="card"><h2>Temporary Staffing Pricing Controls</h2>${callout("Rate formula", "Charge rate must cover basic pay + holiday pay + employer NI + pension + payroll + training / compliance allocation + insurance + administration + bad debt / leakage + target operating contribution. Quote from the fully loaded cost upward, never from a competitor’s advertised charge rate downward.", "info")}
      ${table(["Control", "Launch minimum / rule", "Why"], plain(S.tempControls))}</section>`;
  }

  function pageSales() {
    const S = HAV.strategy;
    return header("Sales And Candidate Operating System", "Pipeline stages, discovery framework, outbound rhythm, candidate journey and route-based checks.") +
      `<section class="card"><h2>Client Pipeline Stages</h2>${table(["Stage", "Exit condition", "Required evidence"], plain(S.pipeline))}</section>
      <div class="grid2"><section class="card"><h2>Discovery Framework</h2><ol class="steps">${S.discovery.map(p => `<li>${esc(p)}</li>`).join("")}</ol></section>
      <section class="card"><h2>Weekly Outbound Rhythm</h2>${table(["Activity", "Target", "Quality standard"], plain(S.outbound), "compact")}
      ${callout("Sales principle", "Never solve a cash-flow problem by selling to a weak-credit client. Revenue from an invoice that is not collected is not growth.", "warn")}
      <h3>Account management</h3><p>After every start, check in with candidate and client at day 7, day 30, day 60 and day 90. For temporary clients, run a monthly account review covering fill rate, cancellations, timesheet accuracy, worker feedback, incidents, AWR, invoice ageing and forecast demand.</p></section></div>
      <section class="card"><h2>Candidate Journey</h2><ol class="steps">${S.journey.map(p => `<li>${esc(p)}</li>`).join("")}</ol>
      <h3>Values-based screening</h3><p>Interviews test judgement, not memorised care jargon. Use consistent evidence-based questions on safeguarding, dignity, boundaries, documentation, escalation, teamwork, learning from mistakes and person-centred decision-making, scored against defined behavioural indicators. For managers, add governance, staffing, complaints, medication / clinical risk where relevant, culture, commercial discipline and regulatory leadership.</p></section>
      <section class="card"><h2>Checks By Route</h2>${table(["Domain", "Permanent introduction", "Temporary supply"], plain(S.checksMatrix))}</section>`;
  }

  function pageKpis() {
    return header("KPIs And Governance", "Turnover is never the primary measure of business health. Gross profit, cash conversion, debtor days, payroll exposure and client concentration matter more.") +
      `<section class="card"><h2>Commercial KPIs</h2>${table(["KPI", "Why it matters", "Early target / control"], plain(HAV.kpis))}</section>
      <section class="card"><h2>Quality And Compliance KPIs</h2>${table(["Measure", "Target"], plain(HAV.qualityKpis))}</section>
      <section class="card"><h2>Governance Rhythm</h2>${table(["Frequency", "Meeting", "Core agenda"], plain(HAV.cadence))}</section>
      <section class="card"><h2>CRM Migration Trigger</h2><p>Move from this register to a dedicated ATS / CRM when any two of the following are true:</p><ul>${HAV.migrationTrigger.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>`;
  }

  function pageRisks() {
    return header("Risk Register", "Primary risks, impact, likelihood, controls and owners.") +
      `<section class="card">${table(["Risk", "Impact", "Likelihood", "Primary controls", "Owner"], HAV.risks.map(([r, i, l, c, o]) => [esc(r), badge(i), badge(l), esc(c), esc(o)]))}</section>`;
  }

  function pagePlan() {
    return header("90 Day And 12 Month Plan", "Year 1 runs October 2026 to September 2027. Permanent recruitment first; temporary staffing begins only after the gate.") +
      `<section class="card"><h2>First 90 Days</h2>${table(["Period", "Priority", "Actions", "Exit criteria"], plain(HAV.plan90))}</section>
      <section class="card"><h2>Twelve Month Execution Plan</h2>${table(["Month", "Commercial objective", "Operating objective"], plain(HAV.plan12))}</section>
      <section class="card"><h2>Organisation And Hiring Roadmap</h2><p>Hiring decisions are made from gross-profit capacity and service risk, not turnover. Commission plans reward collected gross profit, quality / retention and compliance rather than revenue alone.</p>${table(["Stage", "Indicative team", "Founder focus", "Hire trigger"], plain(HAV.orgRoadmap))}</section>`;
  }

  /* ---------- finance ---------- */
  function tempGpHr(charge, pay, other) { return charge - (pay * (1 + HAV.loads.holiday + HAV.loads.ni + HAV.loads.pension) + other) - charge * HAV.loads.badDebt; }
  function yearModel(y) {
    const A = HAV.finance.assumptions;
    let tempRev, tempGp;
    if (y === 0) {
      const workerMonths = HAV.finance.y1Monthly.reduce((a, m) => a + m[4], 0);
      const hrs = workerMonths * A.hours[0] * A.weeksPerMonth;
      tempRev = hrs * A.charge[0]; tempGp = hrs * tempGpHr(A.charge[0], A.pay[0], A.other[0]);
    } else {
      const hrs = A.tempWorkers[y] * A.hours[y] * 52;
      tempRev = hrs * A.charge[y]; tempGp = hrs * tempGpHr(A.charge[y], A.pay[y], A.other[y]);
    }
    const perm = A.perm[y] * A.permFee[y], ret = A.retained[y] * A.retainedFee[y], proj = A.projects[y] * A.projectFee[y];
    const rev = perm + ret + proj + tempRev;
    const gp = perm * (1 - A.permCost) + ret * (1 - A.retainedCost) + proj * (1 - A.projectCost) + tempGp;
    return { perm, ret, proj, tempRev, rev, gp, opex: A.opex[y], ebitda: gp - A.opex[y] };
  }
  function pageFinance() {
    const Y = [0, 1, 2].map(yearModel), A = HAV.finance.assumptions;
    const rowY = (label, k, pct) => [esc(label)].concat(Y.map(y => pct ? (y[k] / y.rev * 100).toFixed(1) + "%" : gbp.format(y[k])));
    const monthly = HAV.finance.y1Monthly.map(([m, p, r, c, w, opex]) => {
      const tr = w * A.hours[0] * A.weeksPerMonth * A.charge[0];
      const tg = w * A.hours[0] * A.weeksPerMonth * tempGpHr(A.charge[0], A.pay[0], A.other[0]);
      const rev = p * A.permFee[0] + r * A.retainedFee[0] + c * A.projectFee[0] + tr;
      const gp = p * A.permFee[0] * (1 - A.permCost) + r * A.retainedFee[0] * (1 - A.retainedCost) + c * A.projectFee[0] * (1 - A.projectCost) + tg;
      return [m, p, r, c, w, gbp.format(rev), gbp.format(gp), gbp.format(opex), gbp.format(gp - opex)];
    });
    return header("Financial Model", "Base case target trajectory. Values exclude VAT. These figures are operating targets, not promises or verified results.") +
      callout("Finance principle", "Haverton can be profitable on paper and still run out of cash. Temporary staffing is scaled according to funded payroll capacity, not client demand alone.", "warn") +
      `<section class="card"><h2>Three Year Base Case</h2>${table(["Metric", "Year 1", "Year 2", "Year 3"], [
        rowY("Permanent revenue", "perm"), rowY("Retained search revenue", "ret"), rowY("Compliance project revenue", "proj"), rowY("Temporary staffing revenue", "tempRev"),
        rowY("Total revenue", "rev"), rowY("Gross profit", "gp"), rowY("Gross margin", "gp", true), rowY("Operating expenses", "opex"), rowY("EBITDA", "ebitda")
      ], "num")}
      <p class="muted small">Recalculated from the Financial Model assumptions; totals reproduce the workbook within rounding (Year 1 revenue £545,050; Year 2 £2.56m; Year 3 £5.41m). Year 2 and 3 turnover is driven mainly by temporary billings.</p></section>
      <section class="card"><h2>Year 1 Monthly Plan</h2>${table(["Month", "Perm", "Retained", "Projects", "Temp workers", "Revenue", "Gross profit", "Opex", "EBITDA"], monthly, "num")}</section>
      <section class="card"><h2>Scenarios</h2>${table(["Scenario", "Volume", "Price", "Year 1", "Year 2", "Year 3", "Interpretation"], HAV.finance.scenarios.map(([n, v, p, i]) => [esc(n), v, p].concat(Y.map(y => gbp.format(y.rev * v * p))).concat([esc(i)])), "compact")}
      <p class="muted small">Scenarios change commercial volume, not compliance standards.</p></section>
      <section class="card"><h2>Working Capital</h2><p>With 45 debtor days and a simplified seven-day payroll lag, the Year 1 model estimates a peak buffer of about <strong>£85,000</strong> at planned exit scale. This is a directional proxy, not a funding facility amount.</p><p>Before temp launch, replace it with a weekly rolling 13-week cash-flow forecast including PAYE payment dates, pensions, VAT, holiday accrual, supplier costs, bad debt, late timesheets and individual client terms.</p></section>
      <section class="card"><h2>2026 Position To Recheck Before Relying On It</h2><ul>${HAV.finance.facts2026.map(f => `<li>${esc(f)}</li>`).join("")}</ul><p class="muted small">Recorded in the operating system dated 21 September 2026. Confirm against GOV.UK and with your accountant before pricing or payroll decisions.</p></section>`;
  }
  function pageCalculators() {
    return header("Pricing Calculators", "Use before approving prices. Margin discipline is a control, not a sales preference.") +
      `<div class="grid2"><section class="card"><h2>Temporary Assignment GP Check</h2>
        <div class="form-grid calc" id="tcalc">
          <label class="fld"><span>Charge rate £/hr (ex VAT)</span><input type="number" step="0.01" name="charge" value="26"></label>
          <label class="fld"><span>Basic pay £/hr</span><input type="number" step="0.01" name="pay" value="14.50"></label>
          <label class="fld"><span>Hours per week</span><input type="number" step="1" name="hours" value="30"></label>
          <label class="fld"><span>Worker age band</span><select name="age"><option value="12.71">21 and over (£12.71)</option><option value="10.85">18 to 20 (£10.85)</option><option value="8.00">Under 18 / apprentice (£8.00)</option></select></label>
        </div><div id="tcalc-out"></div>
        <p class="muted small">Planning loads: holiday 12.07%, employer NI 10.5% blended, pension 2.5% blended, other direct £0.75/hr, bad debt 1%. These are model proxies; actual payroll must use statutory calculations.</p></section>
      <section class="card"><h2>Permanent Placement Fee</h2>
        <div class="form-grid calc" id="pcalc">
          <label class="fld"><span>First-year basic salary £</span><input type="number" step="100" name="salary" value="45000"></label>
          <label class="fld"><span>Role band</span><select name="band"><option value="12.5">Care Assistants and Support Workers (12.5%)</option><option value="15">Senior Carers and Team Leaders (15%)</option><option value="17.5">Deputy Managers and Coordinators (17.5%)</option><option value="20" selected>Registered Managers and Clinical Leads (20%)</option><option value="22.5">Senior operations, quality, retained (22.5%)</option></select></label>
          <label class="fld"><span>Agreed fee %</span><input type="number" step="0.5" name="fee" value="20"></label>
        </div><div id="pcalc-out"></div></section></div>`;
  }
  function drawCalcs() {
    const t = $("#tcalc"); if (!t) return;
    const v = n => num(t.querySelector(`[name=${n}]`).value);
    const charge = v("charge"), pay = v("pay"), hours = v("hours"), nlw = v("age");
    const loaded = loadedCost(pay), gp = tempGpHr(charge, pay, HAV.loads.other), margin = charge ? gp / charge : 0;
    const checks = [
      [pay >= nlw, `Pay at or above applicable minimum (£${nlw.toFixed(2)})`],
      [gp >= HAV.loads.gpFloor, `GP/hour at or above £5.50 floor`],
      [margin >= HAV.loads.marginFloor, `Gross margin at or above 20%`]
    ];
    $("#tcalc-out").innerHTML = `<dl class="calc-out"><div><dt>Loaded cost / hr</dt><dd>${gbp2.format(loaded)}</dd></div><div><dt>GP / hr after bad debt</dt><dd>${gbp2.format(gp)}</dd></div><div><dt>Gross margin</dt><dd>${(margin * 100).toFixed(1)}%</dd></div><div><dt>Weekly GP</dt><dd>${gbp2.format(gp * hours)}</dd></div><div><dt>Annual GP (52 wks)</dt><dd>${gbp.format(gp * hours * 52)}</dd></div></dl>
      <ul class="checks">${checks.map(([ok, l]) => `<li class="${ok ? "ok" : "bad"}">${ok ? "Pass" : "Fail"}: ${esc(l)}</li>`).join("")}</ul>
      ${checks.every(c => c[0]) ? "" : callout("Not approvable as priced", "Re-price, or record a documented Director strategic exception with cash impact. Never accept a shift whose economics require underpayment.", "danger")}`;
    const p = $("#pcalc"), pv = n => num(p.querySelector(`[name=${n}]`).value);
    const fee = pv("salary") * pv("fee") / 100, band = pv("band");
    $("#pcalc-out").innerHTML = `<dl class="calc-out"><div><dt>Placement fee (ex VAT)</dt><dd>${gbp2.format(fee)}</dd></div><div><dt>Direct sourcing cost (8%)</dt><dd>${gbp2.format(fee * 0.08)}</dd></div><div><dt>Gross contribution</dt><dd>${gbp2.format(fee * 0.92)}</dd></div><div><dt>VAT at 20%</dt><dd>${gbp2.format(fee * 0.2)}</dd></div></dl>
      ${pv("fee") < band ? callout("Below standard band", "Discounting below the standard band requires Director approval with a written commercial rationale.", "warn") : ""}`;
  }

  function pageSources() {
    return header("Legal And Source Register", "Recheck before temporary staffing launch and at least quarterly. Never rely on this site as a frozen statement of law.") +
      `<section class="card"><h2>Legal Architecture</h2>${table(["Framework", "Operational requirement"], plain(HAV.legal))}</section>
      <section class="card"><h2>Official Sources And Review Dates</h2>${table(["Topic", "Source", "Link", "Review"], HAV.sources.map(([t, s, u, r]) => [esc(t), esc(s), `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open</a>`, esc(r)]))}</section>
      <p class="muted small">The QCS recruitment toolkit supplied as source material was treated as copyrighted reference; its text and templates are not reproduced here.</p>`;
  }

  function pageData() {
    const counts = HAV.registers.map(r => [esc(r.title), state.records[r.key].length]);
    return header("Data, Backup And Privacy", "How this operations site stores information and what must never be entered.") +
      (CLOUD ? callout("Where your data lives", "Signed in as " + USER + ". Records sync to Haverton’s private cloud database (Supabase, London region) and are available on any device you sign in on. This device keeps a working copy for speed and offline use, which is cleared when you sign out. Every change is recorded in a server-side audit trail. The free database tier has no automatic backups, so export a backup at least weekly.", "info")
        : callout("Where your data lives", "Register entries are saved only in this browser on this device. They are not sent to any server, not shared between devices or users, and are lost if browser data is cleared. Export a backup at least weekly and store it in Haverton’s access-controlled storage.", "warn")) +
      `<div class="grid2"><section class="card"><h2>Backup And Restore</h2>
        <p>Last saved: ${state.updated ? new Date(state.updated).toLocaleString("en-GB") : "never"}${storageOk ? "" : " <strong>(saving failed)</strong>"}</p>
        <div class="btn-row"><button class="btn" id="exp">Export full backup (JSON)</button><label class="btn ghost file">Import backup<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
        <p class="muted small">${CLOUD ? "Import replaces everything in the cloud database for every user. Use it only to restore from a backup." : "Import replaces everything currently stored in this browser."}</p>
        <h3>Records held</h3>${table(["Register", "Records"], counts, "compact")}
        <button class="btn danger ghost" id="wipe">${CLOUD ? "Clear this device’s copy" : "Erase all data in this browser"}</button>
        <h3>Site source code</h3>
        <p>The full source code of this site is stored alongside it, encrypted with the same passphrase. Download it to make changes or to rebuild the site elsewhere.</p>
        <button class="btn ghost" id="src">Download source code (zip)</button></section>
      <section class="card"><h2>Never Enter Here</h2><ul>
        <li>Passport, visa or identity document images or numbers</li><li>DBS certificate content or criminal-offence details</li><li>Health, disability or medical information</li><li>Bank, payroll or National Insurance details</li><li>Names or details of people receiving care</li><li>Equality monitoring data (keep separate from selection decisions)</li></ul>
        <p>Record status, reference and date only. Source evidence stays in restricted folders with least-privilege access and MFA.</p>
        <h3>Before sharing this site</h3><p>This is a single-user tool. When more than one person needs access, or when the CRM migration trigger is met, move to a system with user accounts, permissions and an audit log, and complete a data protection impact screening first.</p></section></div>`;
  }
  function pageNotFound() { return header("Page not found", "") + `<p><a href="#/">Return to the dashboard</a></p>`; }

  /* ---------------- router ---------------- */
  function route() {
    const h = location.hash || "#/";
    const parts = h.replace(/^#\//, "").split("/");
    let html;
    switch (parts[0]) {
      case "": html = pageDashboard(); break;
      case "r": html = pageRegister(parts[1]); break;
      case "view": html = pageView(parts[1], decodeURIComponent(parts.slice(2).join("/"))); break;
      case "pipeline": html = pagePipeline(parts[1]); break;
      case "search": html = pageSearch(decodeURIComponent(parts.slice(1).join("/"))); break;
      case "reports": html = pageReports(); break;
      case "actions": html = pageActions(); break;
      case "applications": html = pageApplications(); break;
      case "golive": html = pageGoLive(); break;
      case "controls": html = pageControls(); break;
      case "procedures": html = pageProcedures(parts[1]); break;
      case "strategy": html = pageStrategy(); break;
      case "sales": html = pageSales(); break;
      case "kpis": html = pageKpis(); break;
      case "risks": html = pageRisks(); break;
      case "plan": html = pagePlan(); break;
      case "finance": html = pageFinance(); break;
      case "calculators": html = pageCalculators(); break;
      case "sources": html = pageSources(); break;
      case "data": html = pageData(); break;
      default: html = pageNotFound();
    }
    app.innerHTML = html;
    renderNav();
    bind(parts);
    document.body.classList.remove("nav-open");
    if (route._last !== h) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); route._last = h; }
  }

  function bind(parts) {
    if (parts[0] === "r" && regByKey(parts[1])) {
      const key = parts[1];
      drawRegisterTable(key);
      $("#q").addEventListener("input", () => drawRegisterTable(key));
      $("#sf").addEventListener("change", () => drawRegisterTable(key));
      const tf = $("#tf"); if (tf) tf.addEventListener("change", () => drawRegisterTable(key));
      $("#add").addEventListener("click", () => openForm(key));
      $("#csv").addEventListener("click", () => csvFor(key));
      const ics = $("#ics"); if (ics) ics.addEventListener("click", exportICS);
      const vl = $("#vleads"); if (vl) vl.addEventListener("click", loadVacancyLeads);
      const fl = $("#fuload"); if (fl) fl.addEventListener("click", loadWeekOneFollowUps);
      const cqc = $("#cqcload"); if (cqc) cqc.addEventListener("click", () => {
        /* Safe to run again: matches on CQC location ID, refreshes contacts, never resets a client's status */
        try { const n = importCSV("clients", HAV.cqcProviders.csv, { keep: ["Client Status"] }); if (n) { route(); toast(`CQC providers loaded: ${n} added or refreshed`); } } catch (err) { toast("Load failed: " + err.message); }
      });
      $("#csvin").addEventListener("change", e => {
        const file = e.target.files[0]; if (!file) return;
        const rd = new FileReader();
        rd.onload = () => { try { const n = importCSV(key, String(rd.result)); if (n) { route(); toast(`Import done: ${n} row(s) added or updated`); } } catch (err) { toast("Import failed: " + err.message); } e.target.value = ""; };
        rd.readAsText(file);
      });
    }
    if (parts[0] === "applications" && CLOUD) {
      loadApplications();
      $("#cv-copy").addEventListener("click", async () => { try { await navigator.clipboard.writeText("https://operation.havertoncare.co.uk/apply/"); toast("Link copied"); } catch (_) { toast("Copy failed: select the link and copy it"); } });
    }
    if (parts[0] === "view") {
      const key = parts[1], id = decodeURIComponent(parts.slice(2).join("/")), rec = findRec(key, id);
      if (rec && CLOUD) loadServerHistory(key, id);
      if (rec) {
        $("#v-edit").addEventListener("click", () => openForm(key, id));
        $("#v-note").addEventListener("click", () => openActivity(key, id));
        const vcv = $("#v-cv"); if (vcv) vcv.addEventListener("click", () => openCv(rec["CV File"]));
        $("#v-fu").addEventListener("click", () => openForm("followups", null, { "Type": ({ clients: "Client", candidates: "Candidate", vacancies: "Vacancy", placements: "Placement", assignments: "Assignment" })[key] || "Internal", "Related ID": id, "Organisation / Candidate": recLabel(key, rec), "Status": "Open", "Owner": state.lastBy || "" }));
      }
    }
    if (parts[0] === "pipeline") {
      const board = app.querySelector(".kanban");
      if (board) {
        const which = board.dataset.board;
        let dragId = null;
        board.addEventListener("dragstart", e => { const c = e.target.closest(".kcard"); if (!c) return; dragId = c.dataset.id; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", dragId); c.classList.add("dragging"); });
        board.addEventListener("dragend", e => { const c = e.target.closest(".kcard"); if (c) c.classList.remove("dragging"); board.querySelectorAll(".kcol.over").forEach(x => x.classList.remove("over")); });
        board.addEventListener("dragover", e => { const col = e.target.closest(".kcol"); if (!col) return; e.preventDefault(); board.querySelectorAll(".kcol.over").forEach(x => x !== col && x.classList.remove("over")); col.classList.add("over"); });
        board.addEventListener("drop", e => { const col = e.target.closest(".kcol"); if (!col) return; e.preventDefault(); const id = dragId || e.dataTransfer.getData("text/plain"); dragId = null; moveCard(which, id, col.dataset.col); });
        board.addEventListener("change", e => { const s = e.target.closest(".kmove"); if (s) moveCard(which, s.closest(".kcard").dataset.id, s.value); });
      }
    }
    if (parts[0] === "actions") {
      $("#seed").addEventListener("click", seedActions);
      $("#addact").addEventListener("click", () => openForm("actions", null, { "Status": "Not started", "Owner": state.lastBy || "" }));
      app.querySelectorAll("[data-af]").forEach(b => b.addEventListener("click", () => { actions_filter = b.dataset.af; route(); }));
      app.querySelectorAll("[data-act]").forEach(cb => cb.addEventListener("change", () => tickAction(cb.dataset.act, cb.checked)));
    }
    if (parts[0] === "search") {
      $("#sform").addEventListener("submit", e => { e.preventDefault(); const q = $("#sq").value.trim(); location.hash = "#/search/" + encodeURIComponent(q); });
      if (!parts[1]) $("#sq").focus();
    }
    if (parts[0] === "") app.querySelectorAll("[data-sb]").forEach(cb => cb.addEventListener("change", () => {
      const wk = weekKey(); state.scoreboard[wk] = state.scoreboard[wk] || {}; state.scoreboard[wk][cb.dataset.sb] = cb.checked; save();
    }));
    if (parts[0] === "golive") {
      app.querySelectorAll("[data-gl]").forEach(el => el.addEventListener("change", () => {
        const i = el.dataset.gl, k = el.dataset.k; state.golive.items[i] = state.golive.items[i] || {};
        state.golive.items[i][k] = el.type === "checkbox" ? el.checked : el.value.trim();
        if (goLiveProgress() < HAV.goLive.length && state.golive.director.decision === "GO") { state.golive.director.decision = "NO GO"; toast("A control is incomplete, so the decision has reverted to NO GO."); }
        save(); route();
      }));
      [["dir-decision", "decision"], ["dir-name", "name"], ["dir-date", "date"], ["dir-notes", "notes"]].forEach(([id, k]) => $("#" + id).addEventListener("change", e => { state.golive.director[k] = e.target.value.trim(); save(); route(); }));
    }
    const pr = $("[data-print]", app); if (pr) pr.addEventListener("click", () => window.print());
    if (parts[0] === "procedures" && !parts[1]) $("#pq").addEventListener("input", e => { $("#sop-grid").innerHTML = sopCards(e.target.value); });
    if (parts[0] === "calculators") {
      drawCalcs();
      ["#tcalc", "#pcalc"].forEach(sel => { $(sel).addEventListener("input", drawCalcs); $(sel).addEventListener("change", e => { if (e.target.name === "band") $("#pcalc [name=fee]").value = e.target.value; drawCalcs(); }); });
    }
    if (parts[0] === "data") {
      $("#src").addEventListener("click", async () => {
        try {
          const jwk = sessionStorage.getItem("hav-k");
          if (!jwk || !window.crypto || !crypto.subtle) throw new Error("Only available on the live site after unlocking");
          const r = await fetch("source.json", { cache: "no-store" });
          if (!r.ok) throw new Error("Source file not found");
          const s = await r.json(), b64 = x => Uint8Array.from(atob(x), c => c.charCodeAt(0));
          const key = await crypto.subtle.importKey("jwk", JSON.parse(jwk), { name: "AES-GCM" }, false, ["decrypt"]);
          const zip = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(s.iv) }, key, b64(s.data));
          const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
          a.download = "Haverton Operations Source.zip"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        } catch (err) { toast("Source download failed: " + err.message); }
      });
      $("#exp").addEventListener("click", () => download(`Haverton Operations Backup ${iso(today())}.json`, JSON.stringify(state, null, 1), "application/json"));
      $("#imp").addEventListener("change", e => {
        const f = e.target.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            const s = JSON.parse(rd.result);
            if (!s || typeof s !== "object" || !s.records) throw new Error("Not a Haverton backup");
            if (!confirm(CLOUD ? "Replace ALL cloud data, for every user, with this backup? Records not in the backup will be deleted from the cloud." : "Replace all data in this browser with the imported backup?")) return;
            state = normalise(s);
            save(); route(); toast("Backup imported");
          } catch (err) { toast("Import failed: " + err.message); }
        };
        rd.readAsText(f);
      });
      $("#wipe").addEventListener("click", () => {
        if (CLOUD) {
          if (!confirm("Clear this device’s copy and reload it from the cloud? Cloud data is not affected.")) return;
          try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(SNAP_KEY); } catch (_) { }
          location.reload(); return;
        }
        if (!confirm("Erase every record in this browser? Export a backup first. This cannot be undone.")) return;
        state = blank(); save(); route(); toast("All local data erased");
      });
    }
  }

  /* One delegated listener for buttons rendered inside record pages */
  app.addEventListener("click", e => {
    const m = (location.hash || "").match(/^#\/view\/([^/]+)\/(.+)$/);
    if (!m) return;
    const id = decodeURIComponent(m[2]);
    const d = e.target.closest("[data-delact]");
    if (d && confirm("Remove this activity note?")) { state.activity = state.activity.filter(a => a.id !== d.dataset.delact); save(); route(); }
    const s = e.target.closest("[data-submit]");
    if (s) { const v = findRec("vacancies", s.dataset.submit); openForm("submissions", null, { "Vacancy ID": s.dataset.submit, "Candidate ID": id, "Client ID": v ? v["Client ID"] : "", "Stage": "Draft" }); }
  });
  $("#menu").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  window.addEventListener("hashchange", route);
  route();
  if (CLOUD) Sync.start(); else renderSync();
})();
