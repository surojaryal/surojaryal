/* Haverton Recruitment public registration form.
   Uploads the CV to the private "cvs" bucket, then adds the application. The public key can only
   insert: it can never read, change or delete anything (see supabase/cv-database.sql). */
(function () {
  "use strict";
  const CFG = window.HAV_CLOUD || {};
  const PRIVACY_VERSION = "1.1 (September 2026)";
  const ROLES = ["Care Assistant", "Senior Care Assistant", "Support Worker", "Team Leader", "Field Care Supervisor", "Care Coordinator", "Deputy Manager", "Registered Manager", "Home Manager", "Quality Manager", "Compliance Manager", "Registered Nurse", "Clinical Lead", "Domestic or kitchen", "Other"];
  const QUALS = ["Care Certificate", "Level 2 Diploma in Adult Care (or NVQ 2)", "Level 3 Diploma in Adult Care (or NVQ 3)", "Level 4 or 5 Diploma in Leadership and Management",
    "Registered Nurse (NMC)", "Medication administration trained", "Moving and handling trained", "Dementia care", "Learning disability or autism", "Mental health",
    "Positive behaviour support", "End of life care", "Complex care (PEG, catheter, stoma)", "Supervising staff", "Care coordination or rotas", "CQC inspection experience"];
  const AVAIL = ["Full time", "Part time", "Days", "Nights", "Weekends", "Live-in", "Can start straight away"];
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const chips = (el, list, name) => { el.innerHTML = list.map(v => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(v)}"> ${esc(v)}</label>`).join(""); };

  $("#role").insertAdjacentHTML("beforeend", ROLES.map(r => `<option>${esc(r)}</option>`).join(""));
  chips($("#quals"), QUALS, "quals");
  chips($("#avail"), AVAIL, "avail");
  const src = new URLSearchParams(location.search).get("src");
  const srcTag = src ? String(src).replace(/[^a-z0-9 _-]/gi, "").slice(0, 30) : "";

  const form = $("#apply"), err = $("#err"), send = $("#send");
  const fail = msg => { err.textContent = msg; send.disabled = false; send.textContent = "Register"; };

  form.addEventListener("submit", async e => {
    e.preventDefault(); err.textContent = "";
    if (!CFG.url || !CFG.key) return fail("Registration is not available right now. Please email info@havertoncare.co.uk.");
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    if (fd.get("website")) { form.hidden = true; $("#done").hidden = false; return; } // likely a bot
    const email = String(fd.get("email")).trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Please check your email address.");
    const postcode = String(fd.get("postcode")).trim().toUpperCase();
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(postcode)) return fail("Please enter a full UK postcode, for example BR8 7AA.");
    const file = $("#cv").files[0];
    let ext = "";
    if (file) {
      ext = (file.name.match(/\.(pdf|docx?)$/i) || [])[1];
      if (!ext) return fail("Your CV must be a PDF or Word document.");
      if (file.size > 5 * 1024 * 1024) return fail("Your CV is larger than 5 MB. Please save a smaller copy, or register without it and email it to us.");
    }
    send.disabled = true; send.textContent = "Sending…";
    try {
      let cvPath = null;
      if (file) {
        const id = (crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));
        cvPath = `incoming/${id}.${ext.toLowerCase()}`;
        const type = ext.toLowerCase() === "pdf" ? "application/pdf" : ext.toLowerCase() === "doc" ? "application/msword" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const up = await fetch(`${CFG.url}/storage/v1/object/cvs/${cvPath}`, { method: "POST", headers: { apikey: CFG.key, "Content-Type": type, "x-upsert": "false" }, body: file });
        if (!up.ok) throw new Error("We could not upload your CV. Please try again, or register without it and email it to info@havertoncare.co.uk.");
      }
      const num = v => (v === null || v === "" ? null : Number(v));
      const body = {
        full_name: String(fd.get("full_name")).trim(), email, phone: String(fd.get("phone") || "").trim() || null, postcode,
        target_role: fd.get("target_role"), other_roles: String(fd.get("other_roles") || "").trim() || null, work_type: fd.get("work_type"),
        availability: fd.getAll("avail").join(", ") || null, travel_miles: num(fd.get("travel_miles")), drives: fd.get("drives") === "" ? null : fd.get("drives") === "true",
        right_to_work: fd.get("right_to_work"), experience_years: num(fd.get("experience_years")), quals: fd.getAll("quals"),
        about: String(fd.get("about") || "").trim() || null, cv_path: cvPath, privacy_version: PRIVACY_VERSION,
        marketing_consent: fd.get("marketing_consent") === "on", source: [fd.get("source"), srcTag && "link: " + srcTag].filter(Boolean).join(" | ") || null
      };
      const r = await fetch(`${CFG.url}/rest/v1/applications`, { method: "POST", headers: { apikey: CFG.key, "Content-Type": "application/json", "Content-Profile": "ops", Prefer: "return=minimal" }, body: JSON.stringify(body) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(/Too many|a lot of applications/.test(j.message || "") ? j.message : "Something went wrong. Please try again, or email info@havertoncare.co.uk.");
      }
      form.hidden = true; $("#done").hidden = false; window.scrollTo(0, 0);
    } catch (ex) { fail(ex.message); }
  });
})();
