const { P, H1, H2, bullets, numbered, table, box, titleBlock, build } = require("./lib");

module.exports = (root) => [
build(`${root}/1 Start Here/Read Me First.docx`, [
  ...titleBlock("Read Me First", "Your Haverton Recruitment pack: what is here and what to do next", [
    ["Prepared for", "Suroj Aryal, Founder and Director"], ["Date", "September 2026"], ["Status", "Fresh pack. Replaces earlier recruitment documents."]
  ]),
  H1("What is in this pack"),
  ...table(["Folder", "Files", "Use it for"], [
    ["1 Start Here", "Read Me First, Action Plan, Action Plan Tracker (spreadsheet), Launch Checklist", "Knowing what to do, in order, and ticking it off"],
    ["2 Business Plan", "Haverton Recruitment Business Plan, Haverton Recruitment Forecast (spreadsheet)", "Strategy, targets, money, risks; showing banks, funders or partners"],
    ["3 Legal", "Client Terms Of Business, Candidate Terms, Recruitment Privacy Notice, Data Protection Record, Insurance Broker Brief", "The documents you need before you place anyone. **Have a solicitor review the first three.**"],
    ["4 Forms", "Candidate File Checklist, Candidate Registration Form, Consent To Represent, Client Vacancy Brief, Interview Scoring Sheet, Reference Request, Placement Check In Record", "Everyday recruitment work"],
    ["5 Sales", "Client Emails And Call Script, Fee Proposal Letter", "Winning clients"],
    ["6 Temporary Staffing Drafts", "Temporary Worker Terms, Client Terms For Temporary Supply, Assignment Confirmation, Go Live Checklist", "Getting ready for temporary staffing. **Not for use** until the Go Live Gate is signed."],
    ["7 Launch Kit", "Target Providers (your local area, with manager names), Target Providers England (30,186 services by region), Target Providers Import, Candidates Import Template, Job Adverts, Recruitment Page, Temporary Staffing Cash Flow (spreadsheet)", "Starting now: who to contact, adverts to post, website wording, and the cash you need for temporary staffing"],
    ["8 First Client", "This Week 20 Providers (spreadsheet), This Week Emails, First Client Playbook, Follow Ups Import", "Your first week of calls and emails, and every step from first call to first paid invoice"]
  ], [2, 4, 4]),
  H1("Track your progress in three ways"),
  ...bullets([
    "**Haverton Operations → Action Plan** (recommended): click **Load 30-day launch plan**, choose your start date, then tick each action as you finish it. Due dates, overdue alerts and your progress bar update automatically and sync to every device you sign in on.",
    "**Action Plan.docx**: the same plan to print and tick by hand.",
    "**Action Plan Tracker.xlsx**: the same plan as a spreadsheet with a status drop-down and automatic overdue flags."
  ]),
  H1("What changed in version 1.1"),
  ...bullets([
    "Fee bands: 12.5%, 15%, 17.5%, 20% (Registered Managers) and 22.5% (senior operations, quality and retained search).",
    "Guarantee: free replacement in days 0 to 30; 50% credit in days 31 to 60; 25% credit in days 61 to 90.",
    "Check-ins at days 7, 30, 60 and 90.",
    "Temporary clients: weekly invoices on 7-day terms, separate night, weekend and bank holiday rates.",
    "New: Action Plan, Insurance Broker Brief and Candidate File Checklist (no health questions before offer; no DBS certificate copies; bank details only for temporary workers)."
  ]),
  H1("Start permanent recruitment: your first steps"),
  ...numbered([
    "Send the **Client Terms Of Business**, **Candidate Terms** and **Recruitment Privacy Notice** to a solicitor for review. Ask for a fixed fee.",
    "Get a **professional indemnity** insurance quote for recruitment from a broker.",
    "Check the **ICO data protection fee** is paid for Haverton Care Limited and note the registration number in the privacy notice.",
    "In Supabase, accept the **data processing agreement** (organisation settings, legal documents).",
    "Put the privacy notice and a candidate registration route on the website Recruitment page.",
    "Import **7 Launch Kit/Target Providers Import.csv** into Haverton Operations (Clients, Import CSV): 442 CQC-registered services in your priority area, ready to contact.",
    "Start the weekly routine: 20 target providers, 10 to 15 emails, 15 to 20 calls, 3 discovery meetings. Use the Sales templates.",
    "For every vacancy: signed terms, completed Vacancy Brief, then search. For every candidate: registration, then consent before any CV is sent."
  ]),
  H1("Temporary staffing: what we can do now"),
  P("You asked to start both. Permanent recruitment can start as soon as the steps above are done. Temporary staffing can be **prepared** now but must not **start** until the Go Live Gate is complete, because it makes Haverton the employer of the workers, with payroll, pension, holiday pay, insurance and cash-flow duties."),
  ...bullets([
    "**Now:** ask your accountant about payroll and a 13-week cash-flow forecast; get quotes for employment business and employers’ liability insurance; send the temporary drafts to the solicitor with the permanent documents to save cost.",
    "**Month 5 to 6:** complete each Go Live item and record evidence.",
    "**Month 7 at the earliest:** a small pilot with one or two trusted clients, then audit before growing."
  ]),
  H1("Words you will see"),
  ...table(["Word", "Meaning"], [
    ["Employment agency", "Introduces candidates who are employed directly by the client (permanent recruitment)."],
    ["Employment business", "Employs or engages workers and supplies them to clients (temporary staffing)."],
    ["Conduct Regulations", "The Conduct of Employment Agencies and Employment Businesses Regulations 2003, the main rulebook for agencies."],
    ["Fair Work Agency", "The government body that enforces agency rules from April 2026."],
    ["AWR", "Agency Workers Regulations 2010: equal pay and conditions after 12 weeks."],
    ["KID", "Key Information Document, given to temporary workers before they agree terms."],
    ["[confirm]", "A point to check with a professional or an official source before relying on it."]
  ], [2, 5]),
  ...box("Important", "These documents are carefully prepared drafts in plain English. They are not legal, tax or financial advice. Have the legal documents reviewed by a solicitor, and the forecast and VAT points by your accountant, before relying on them.")
], { footer: "Version 1.1 | September 2026" }),

build(`${root}/1 Start Here/Launch Checklist.docx`, [
  ...titleBlock("Launch Checklist", "Tick each item when it is done and evidenced"),
  H1("Before the first permanent placement"),
  ...table(["Item", "Why", "Done", "Date"], [
    ["Client Terms Of Business reviewed by solicitor", "Commercial necessity: makes your fee and guarantee enforceable (no statutory rule for permanent recruitment since 2016)", "☐", ""],
    ["Candidate Terms reviewed and in use", "Legal requirement: tell candidates the service is free (Conduct Regulations reg 13). Written worker terms are required for temporary work (reg 14)", "☐", ""],
    ["Recruitment Privacy Notice published", "Legal requirement: UK GDPR articles 13 and 14", "☐", ""],
    ["ICO data protection fee paid; number added to privacy notice", "Legal requirement for most organisations", "☐", ""],
    ["Supabase data processing agreement accepted", "Legal requirement: UK GDPR article 28", "☐", ""],
    ["Professional indemnity insurance in place", "Commercial protection; clients often require it", "☐", ""],
    ["Invoice template shows company name, number and registered office", "Companies Act disclosure requirement", "☐", ""],
    ["Business bank details and accountant confirmed", "Getting paid and staying compliant", "☐", ""],
    ["Website Recruitment page separate from home care", "Accuracy: home care is not yet CQC registered", "☐", ""],
    ["Operations system: own password set; Supabase token deleted", "Security", "☐", ""]
  ], [4, 5, 1, 2]),
  H1("First 30 days"),
  ...table(["Item", "Done", "Date"], [
    ["100 target providers researched and entered", "☐", ""], ["First 15 tailored emails sent", "☐", ""], ["First 3 discovery meetings held", "☐", ""],
    ["First signed client terms", "☐", ""], ["First 10 candidates registered with consent records", "☐", ""], ["First file audit completed", "☐", ""],
    ["SIC code 78109 noted for next confirmation statement", "☐", ""]
  ], [7, 1, 2]),
  H1("Temporary staffing readiness (do not supply yet)"),
  ...table(["Item", "Done", "Date"], [
    ["Accountant: payroll, pension, holiday pay and 13-week cash-flow advice", "☐", ""], ["Insurance quotes: employment business and employers’ liability", "☐", ""],
    ["Solicitor review of temporary drafts", "☐", ""], ["Funding option agreed (for example invoice finance)", "☐", ""], ["Go Live Checklist fully signed", "☐", ""]
  ], [7, 1, 2])
], { footer: "Checklist | Version 1.1 | September 2026" })
];
