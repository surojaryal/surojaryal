/* Haverton Operations: single-page app. No build step, no external calls.
   Register data is held in this browser only (localStorage) and can be exported. */
(function () {
  "use strict";

  const STORE_KEY = "haverton-ops-v1";
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
  function blank() { const s = { records: {}, seq: {}, golive: { items: {}, director: {} }, scoreboard: {}, updated: null }; HAV.registers.forEach(r => { s.records[r.key] = []; s.seq[r.key] = 0; }); return s; }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return blank();
      const s = Object.assign(blank(), JSON.parse(raw));
      HAV.registers.forEach(r => { s.records[r.key] = s.records[r.key] || []; s.seq[r.key] = s.seq[r.key] || 0; });
      return s;
    } catch (e) { return blank(); }
  }
  let storageOk = true;
  function save() {
    state.updated = new Date().toISOString();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOk = true; }
    catch (e) { storageOk = false; toast("Could not save in this browser. Export your data now."); }
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
    ["Overview", [["#/", "Dashboard"], ["#/golive", "Temp Go Live Gate"], ["#/controls", "Controls And Authority"]]],
    ["Registers", HAV.registers.map(r => ["#/r/" + r.key, r.title, r.temp])],
    ["Operating System", [["#/procedures", "Procedures (SOPs)"], ["#/strategy", "Strategy And Services"], ["#/sales", "Sales And Candidates"], ["#/kpis", "KPIs And Governance"], ["#/risks", "Risk Register"], ["#/plan", "90 Day And 12 Month Plan"]]],
    ["Finance", [["#/finance", "Financial Model"], ["#/calculators", "Pricing Calculators"]]],
    ["Reference", [["#/sources", "Legal And Source Register"], ["#/data", "Data, Backup And Privacy"]]]
  ];
  function renderNav() {
    const cur = location.hash || "#/";
    $("#nav").innerHTML = NAV.map(([g, items]) =>
      `<div class="nav-group"><div class="nav-label">${g}</div>` +
      items.map(([href, label, temp]) => {
        const active = cur === href || (href !== "#/" && cur.startsWith(href + "/"));
        const lock = temp && !tempLive() ? `<span class="lock" title="Temporary staffing is off">off</span>` : "";
        return `<a href="${href}" class="${active ? "active" : ""}">${esc(label)}${lock}</a>`;
      }).join("") + `</div>`).join("");
    $("#temp-pill").className = "pill " + (tempLive() ? "go" : "off");
    $("#temp-pill").innerHTML = `<span class="pl-long">Temporary staffing</span><span class="pl-short">Temp</span>: ${tempLive() ? "GO" : "OFF"}`;
  }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 3500); }
  function badge(v) {
    if (!v) return "";
    const map = {
      green: ["Green", "Yes", "Active Client", "Expansion", "Verified", "Clear", "Update Service Verified", "Two Complete", "Complete", "Placed", "Completed", "Filled", "Paid", "Within Terms", "GO", "Closed", "Started", "Live", "Low"],
      amber: ["Amber", "Pending", "Requested", "One Complete", "Qualified", "Terms Sent", "Prospect", "Screening", "Due Soon", "In Progress", "On Hold", "Interview", "Offer", "Offered", "Submitted", "Planned", "Guarantee Period", "Overdue", "Medium", "Low-Med", "CONDITIONAL", "Content Reviewed", "Equal Treatment Due", "Open"],
      red: ["Red", "No", "Expired", "Issue", "Do Not Supply", "Do Not Contact", "Rejected", "Withdrawn", "Cancelled", "Stop Supply", "High", "Critical", "Early Leaver", "RESTRICTED"]
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
      ["Open complaints / incidents", count("cases", r => r["Status"] !== "Closed"), "#/r/cases"]
    ];

    const alerts = [];
    R.followups.filter(r => r["Status"] !== "Closed" && r["Due Date"] && r["Due Date"] < t).forEach(r => alerts.push(["r", `Follow up overdue: ${r["Action"]} (${r["Organisation / Candidate"]})`, "#/r/followups", r["Due Date"]]));
    R.candidates.filter(r => r["RTW Expiry / Follow Up"] && r["RTW Expiry / Follow Up"] <= in30 && !["Inactive", "Do Not Contact"].includes(r["Current Stage"])).forEach(r => alerts.push([r["RTW Expiry / Follow Up"] < t ? "r" : "a", `Right to work follow up: ${r["Full Name"]} (${r.id})`, "#/r/candidates", r["RTW Expiry / Follow Up"]]));
    R.compliance.filter(r => r["Registration Expiry"] && r["Registration Expiry"] <= in30).forEach(r => alerts.push(["a", `Professional registration expiry: ${r["Candidate ID"]}`, "#/r/compliance", r["Registration Expiry"]]));
    R.submissions.filter(r => r["Stage"] !== "Draft" && r["Consent Confirmed"] !== "Yes").forEach(r => alerts.push(["r", `Submission without recorded consent: ${r.id}`, "#/r/submissions", ""]));
    R.awr.filter(r => { const w = addDays(r["Qualifying Start"], 84); return w && w <= in14 && r["Equal Treatment Review"] !== "Completed"; }).forEach(r => alerts.push(["r", `AWR week 12 due: ${r["Worker ID"]} at ${r["Client ID"]}`, "#/r/awr", addDays(r["Qualifying Start"], 84)]));
    R.awr.filter(r => { const w = addDays(r["Qualifying Start"], 70); return w && w <= t && r["Comparator Information Requested"] !== "Yes"; }).forEach(r => alerts.push(["a", `AWR week 10: request comparator information for ${r["Worker ID"]}`, "#/r/awr", ""]));
    R.placements.filter(r => r["Start Date"] && r["Status"] !== "Cancelled").forEach(r => {
      [[7, "week 1"], [28, "week 4"], [84, "week 12"]].forEach(([d, l]) => { const due = addDays(r["Start Date"], d); if (due >= addDays(t, -3) && due <= addDays(t, 7)) alerts.push(["a", `Placement ${l} check in: ${r["Job Title"]} (${r.id})`, "#/r/placements", due]); });
    });
    R.cases.filter(r => r["Status"] !== "Closed" && ["High", "Critical"].includes(r["Immediate Risk"])).forEach(r => alerts.push(["r", `${r["Immediate Risk"]} risk case open: ${r.id} (${r["Type"]})`, "#/r/cases", r["Target Date"]]));
    R.cases.filter(r => r["Status"] !== "Closed" && r["Target Date"] && r["Target Date"] < t).forEach(r => alerts.push(["r", `Case past target date: ${r.id}`, "#/r/cases", r["Target Date"]]));
    R.audits.filter(r => r["Critical Failure"] === "Yes" && r["Status"] !== "Closed").forEach(r => alerts.push(["r", `Unresolved critical audit failure: ${r["Audit Area"]} (${r.id})`, "#/r/audits", r["Due Date"]]));
    overdue14.forEach(r => alerts.push(["r", `Invoice ${r.id} is ${daysOverdue(r)} days overdue (${r["Client ID"]})`, "#/r/invoices", r["Due Date"]]));
    R.clients.filter(r => r["Last Review"] && r["Last Review"] < addDays(t, -365) && ["Active Client", "Expansion"].includes(r["Client Status"])).forEach(r => alerts.push(["a", `Annual client file review due: ${r["Legal Entity"]}`, "#/r/clients", ""]));
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
        <span class="spacer"></span>
        <button class="btn ghost" id="csv">Export CSV</button>
        <button class="btn" id="add" ${locked ? "disabled" : ""}>Add record</button>
      </div>
      <div id="reg-table"></div>`;
  }
  function drawRegisterTable(key) {
    const reg = regByKey(key), q = ($("#q").value || "").toLowerCase(), sf = $("#sf").value;
    let rows = state.records[key].filter(r => {
      if (sf && String(valueOf(reg, r, reg.status)) !== sf) return false;
      if (!q) return true;
      return (r.id + " " + reg.fields.map(f => valueOf(reg, r, f[0])).join(" ")).toLowerCase().includes(q);
    });
    if (!state.records[key].length) { $("#reg-table").innerHTML = `<div class="empty">No records yet. Use <strong>Add record</strong> to start the ${esc(reg.title.toLowerCase())} register.</div>`; return; }
    const cols = ["ID"].concat(reg.list);
    $("#reg-table").innerHTML = table(cols.concat([""]), rows.map(r => {
      return [`<code>${esc(r.id)}</code>`].concat(reg.list.map(c => {
        const t = fieldType(reg, c), v = valueOf(reg, r, c);
        const f = reg.fields.find(f => f[0] === c);
        if (/Critical Failure|Safeguarding Concern/.test(c)) return v === "Yes" ? `<span class="badge r">Yes</span>` : v === "No" ? `<span class="badge g">No</span>` : "";
        if (t === "select" || (t === "derived" && /Status|Retained/.test(c))) return badge(v);
        if (t === "derived") return fmt(v, f[2].fmt);
        if (t === "ref") return esc(v);
        return fmt(v, t);
      })).concat([`<button class="link" data-edit="${esc(r.id)}">Open</button>`]);
    }), "reg");
  }

  function openForm(key, id) {
    const reg = regByKey(key);
    const rec = id ? state.records[key].find(r => r.id === id) : {};
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
      if (id) Object.assign(rec, data, { modified: new Date().toISOString() });
      else { state.seq[key]++; state.records[key].push(Object.assign({ id: reg.prefix + String(state.seq[key]).padStart(4, "0"), created: new Date().toISOString() }, data)); }
      save(); dlg.close(); route(); toast("Saved");
    });
    dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
    const del = $("#del");
    if (del) del.addEventListener("click", () => {
      if (!confirm(`Delete ${id}? This cannot be undone. Check retention obligations before deleting.`)) return;
      state.records[key] = state.records[key].filter(r => r.id !== id); save(); dlg.close(); route(); toast("Deleted");
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
      <h3>Account management</h3><p>After every start, check in with candidate and client at week 1, week 4 and week 12. For temporary clients, run a monthly account review covering fill rate, cancellations, timesheet accuracy, worker feedback, incidents, AWR, invoice ageing and forecast demand.</p></section></div>
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
          <label class="fld"><span>Role band</span><select name="band"><option value="12.5">Care and support roles (12.5%)</option><option value="15">Senior / coordinator (15%)</option><option value="17.5" selected>Deputy / Registered Manager / Quality (17.5%)</option><option value="20">Executive / retained (20%)</option></select></label>
          <label class="fld"><span>Agreed fee %</span><input type="number" step="0.5" name="fee" value="17.5"></label>
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
      callout("Where your data lives", "Register entries are saved only in this browser on this device. They are not sent to any server, not shared between devices or users, and are lost if browser data is cleared. Export a backup at least weekly and store it in Haverton’s access-controlled storage.", "warn") +
      `<div class="grid2"><section class="card"><h2>Backup And Restore</h2>
        <p>Last saved: ${state.updated ? new Date(state.updated).toLocaleString("en-GB") : "never"}${storageOk ? "" : " <strong>(saving failed)</strong>"}</p>
        <div class="btn-row"><button class="btn" id="exp">Export full backup (JSON)</button><label class="btn ghost file">Import backup<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
        <p class="muted small">Import replaces everything currently stored in this browser.</p>
        <h3>Records held</h3>${table(["Register", "Records"], counts, "compact")}
        <button class="btn danger ghost" id="wipe">Erase all data in this browser</button>
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
      $("#add").addEventListener("click", () => openForm(key));
      $("#csv").addEventListener("click", () => csvFor(key));
      $("#reg-table").addEventListener("click", e => { const b = e.target.closest("[data-edit]"); if (b) openForm(key, b.dataset.edit); });
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
            if (!confirm("Replace all data in this browser with the imported backup?")) return;
            state = Object.assign(blank(), s); HAV.registers.forEach(r => { state.records[r.key] = state.records[r.key] || []; state.seq[r.key] = state.seq[r.key] || 0; });
            save(); route(); toast("Backup imported");
          } catch (err) { toast("Import failed: " + err.message); }
        };
        rd.readAsText(f);
      });
      $("#wipe").addEventListener("click", () => {
        if (!confirm("Erase every record in this browser? Export a backup first. This cannot be undone.")) return;
        state = blank(); save(); route(); toast("All local data erased");
      });
    }
  }

  $("#menu").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  window.addEventListener("hashchange", route);
  route();
})();
