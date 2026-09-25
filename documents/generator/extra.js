const fs = require("fs"), vm = require("vm");
const { P, H1, H2, bullets, table, form, box, titleBlock, build } = require("./lib");
const ctx = { window: {} }; ctx.window.HAV = undefined; vm.createContext(ctx);
vm.runInContext(fs.readFileSync("/home/user/surojaryal/assets/js/data.js", "utf8").replace(/^window\.HAV = window\.HAV \|\| \{\};/m, "var HAV = window.HAV = {};"), ctx);
const PLAN = ctx.window.HAV.actionPlan;
const B = "☐";

module.exports = (root) => [
build(`${root}/1 Start Here/Action Plan.docx`, [
  ...titleBlock("Action Plan", "Tick each box when done, write the date, and note where the evidence is", [
    ["How to use it", "Write the start date below. Day numbers count from that date. The same plan is in Haverton Operations (Action Plan page), where due dates and overdue alerts are automatic."],
    ["Start date (day 1)", ""], ["Owner", "Suroj Aryal"]
  ]),
  ...box("Legal requirement or good practice?", "Items that are a legal requirement say so in the Launch Checklist. Everything here is either needed to start lawfully or is recommended practice for a safe, well-run agency."),
  ...[...new Set(PLAN.map(p => p[1]))].flatMap(phase => [
    H1(phase),
    ...table(["Day", "Action", "Deliverable", "Done", "Date done", "Evidence kept where"],
      PLAN.filter(p => p[1] === phase).map(([day, , task, del]) => [String(day), task, del, B, "", ""]), [0.85, 3.8, 2.2, 0.95, 1.3, 1.9])
  ]),
  H1("Every week"),
  ...table(["Weekly routine", "Target", "Wk 1", "Wk 2", "Wk 3", "Wk 4"], [
    ["Research target providers", "20", B, B, B, B], ["Tailored first emails", "10 to 15", B, B, B, B], ["Follow-up calls", "15 to 20", B, B, B, B],
    ["Discovery meetings", "3", B, B, B, B], ["Candidate screening conversations", "5 or more", B, B, B, B], ["Consented submissions (when real vacancies exist)", "2", B, B, B, B],
    ["Every active record has an owner and next action", "All", B, B, B, B], ["Friday review: pipeline, cash, compliance; no red item without an owner", "Done", B, B, B, B]
  ], [4, 1.4, 0.8, 0.8, 0.8, 0.8]),
  H1("Every month"),
  ...table(["Monthly check", "Done", "Date", "Notes"], [
    ["Audit a sample of candidate and client files (record in Audits register)", B, "", ""],
    ["Check right to work, registration and DBS follow-up dates", B, "", ""],
    ["Review complaints, safeguarding concerns and incidents for trends", B, "", ""],
    ["Management accounts: revenue, gross profit, cash, VAT", B, "", ""],
    ["Export a backup from Haverton Operations (Data page)", B, "", ""],
    ["Review this Action Plan and add next month’s actions", B, "", ""]
  ], [5, 0.8, 1.4, 2.5]),
  H1("Every quarter"),
  ...table(["Quarterly check", "Done", "Date", "Notes"], [
    ["Check GOV.UK, ICO, Fair Work Agency and HMRC guidance for changes", B, "", ""],
    ["Review pricing, margins and client concentration", B, "", ""],
    ["Review the business plan targets against actual results", B, "", ""]
  ], [5, 0.8, 1.4, 2.5])
], { footer: "Action Plan | Version 1.1 | September 2026" }),

build(`${root}/3 Legal/Insurance Broker Brief.docx`, [
  ...titleBlock("Insurance Broker Brief", "Send this to 2 or 3 brokers to get comparable quotes"),
  H1("About us"),
  ...form([["Business", "Haverton Care Limited (company 17025493), trading as Haverton Recruitment And Staffing"], ["Contact", "Suroj Aryal, Director | info@havertoncare.co.uk | 01322 879778"],
    ["What we do now", "Permanent recruitment for adult social care providers (employment agency). We introduce candidates; clients employ them."],
    ["What we plan", "From around month 5 to 7: temporary supply of non-registered care staff (Care Assistants, Senior Care Assistants, Support Workers, Healthcare Assistants, night staff, domestic and kitchen staff) to CQC-registered care homes, nursing homes, supported living and home care providers (employment business). No nurses or clinicians at first."],
    ["Area", "Permanent recruitment: clients across England. Temporary supply: pilot in Kent and South East London first, then region by region"], ["Expected Year 1 turnover", "£98,000 (cautious) to £545,050 (target)"], ["Staff", "Director only at launch; temporary workers from the pilot"]], 2, 5),
  H1("Cover we are asking about"),
  ...table(["Cover", "Level to quote", "Needed from"], [
    ["Professional indemnity (recruitment, including negligent vetting and advice)", "£1m and £2m", "Now"],
    ["Employers’ liability", "At least £5m (legal minimum); quote £10m", "Before we employ anyone, including temporary workers"],
    ["Public liability", "£5m and £10m", "Before temporary supply"],
    ["Cyber and data breach", "£250,000 and £500,000", "Now, if affordable"],
    ["Directors and officers; legal expenses; crime and fidelity", "As you recommend", "Optional"]
  ], [5, 3, 3]),
  H1("Please confirm the policy covers"),
  ...bullets(["Temporary healthcare and social care staffing", "Care homes, nursing homes, supported living and workers visiting people’s homes (home care)", "Worker negligence and abuse or safeguarding allegations", "Night shifts", "Workers giving medication support under the client’s procedures", "Workers travelling between community visits", "Cyber incidents and personal data breaches", "Employment disputes", "Any exclusions for overseas workers, clinical tasks or specific settings", "Whether cover would extend to registered nurses in future, and on what conditions"]),
  ...box("Important", "Do not accept ordinary office insurance. Ask for a policy designed for healthcare recruitment and staffing, and read the exclusions before buying.")
], { footer: "Version 1.1 | September 2026" }),

build(`${root}/4 Forms/Candidate File Checklist.docx`, [
  ...titleBlock("Candidate File Checklist", "What each file must contain, and when to collect it"),
  ...box("Three rules that keep us lawful", [
    "**No health questions before a job offer**, except about adjustments for interview (Equality Act 2010, section 60).",
    "**Do not keep copies of DBS certificates.** Record the level, date, outcome and any risk assessment.",
    "**Bank details and payroll forms only for temporary workers we pay**, collected at onboarding and stored outside the CRM."
  ]),
  H1("Permanent candidates (we introduce; the client employs)"),
  ...table(["Item", "When", "Done", "Date", "Checked by"], [
    ["Registration form and CV", "Registration", B, "", ""], ["Candidate Terms signed and privacy notice given", "Registration", B, "", ""],
    ["Interview notes and scoring sheet", "Screening", B, "", ""], ["Full employment history with gaps explained", "Before submission", B, "", ""],
    ["Consent to represent for each role", "Before each submission", B, "", ""], ["Identity seen; right to work status noted (client does statutory check)", "Before submission", B, "", ""],
    ["Qualifications and certificates (copies)", "Before submission (vulnerable roles)", B, "", ""], ["Two references from non-relatives", "Before submission (vulnerable roles)", B, "", ""],
    ["Professional registration check (NMC, HCPC, Social Work England) where relevant", "Before submission", B, "", ""],
    ["Driving licence and business insurance for community roles", "Before submission", B, "", ""], ["Safeguarding declaration", "Before submission", B, "", ""],
    ["Equality monitoring (optional, stored separately)", "Any time", B, "", ""]
  ], [5, 3, 0.8, 1.2, 1.5]),
  H1("Temporary workers (we employ or engage and supply)"),
  P("Everything above, plus:"),
  ...table(["Item", "When", "Done", "Date", "Checked by"], [
    ["Right to work check by Haverton using the prescribed method; follow-up date set", "Before first shift", B, "", ""],
    ["DBS at the correct level: outcome, date and risk assessment recorded", "Before first shift", B, "", ""],
    ["Mandatory training evidence and competence sign-off for the role", "Before first shift", B, "", ""],
    ["Key Information Document issued", "Before agreeing terms", B, "", ""], ["Temporary Worker Terms signed", "Before first shift", B, "", ""],
    ["Post-offer health questionnaire (only what the role needs), stored separately", "After offer", B, "", ""],
    ["Bank details and PAYE starter information (outside the CRM)", "Onboarding", B, "", ""], ["Emergency contact", "Onboarding", B, "", ""],
    ["Availability record", "Onboarding", B, "", ""], ["Complaints and whistleblowing information given", "Onboarding", B, "", ""],
    ["AWR qualifying start date recorded for each assignment", "Each assignment", B, "", ""]
  ], [5, 3, 0.8, 1.2, 1.5]),
  P("Record the status of each item in the Compliance register of Haverton Operations. Keep the documents themselves in restricted folders.")
], { footer: "Checklist | Version 1.1 | September 2026" })
];
