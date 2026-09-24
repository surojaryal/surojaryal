# Haverton Operations

Internal operations site for **Haverton Recruitment And Staffing**, a trading division of Haverton Care Limited (company number 17025493). Intended address: `operation.havertoncare.co.uk`.

It turns the Haverton Recruitment Master Operating System v2.0 (21 September 2026) into a working tool:

| Area | What it does |
| --- | --- |
| Dashboard | Live counts, alerts (overdue follow ups, right to work and registration expiries, AWR week 10 and 12, placement check ins at weeks 1, 4 and 12, high risk cases, critical audit failures, overdue invoices), temporary staffing status and the weekly founder scoreboard |
| CRM | Record pages linking every related client, candidate, vacancy, submission, placement, invoice and follow up; activity log with automatic follow ups; local change history; drag and drop pipeline board (submissions, clients, vacancies) that still enforces consent; search across everything; reports (funnel, conversion, time to fill, retention, fees by client, concentration, weekly activity against targets, cash); CSV import from the Excel CRM; follow ups to calendar (.ics); duplicate warnings; alerts for records without a next action |
| Registers | Clients, Candidates, Vacancies, Submissions, Placements, Assignments, Compliance, AWR Tracker, Follow Ups, Invoices, Complaints And Incidents, Audits. Field lists match the CRM And KPI Dashboard workbook. Each register exports to CSV |
| Temp Go Live Gate | The 19 point sign off checklist plus the Director decision. Assignments and AWR stay locked until every item has evidence, a signatory and a date and the Director records GO |
| Built in controls | No submission beyond Draft without consent. No Planned or Live assignment without KID, assignment information and client H&S information. GP under £5.50 per hour or 20% margin needs a recorded Director exception. No case closed without outcome and learning. Compliance RAG and blocking reasons are calculated |
| Procedures | All 20 SOPs from the Compliance And Procedures Pack, searchable and printable |
| Strategy, sales, KPIs, risks, plans | Positioning, client tiers, fee guide, pipeline, discovery questions, candidate journey, checks by route, KPIs, governance rhythm, risk register, 90 day and 12 month plans, hiring roadmap |
| Finance | Three year base case and Year 1 monthly plan, recalculated from the Financial Model assumptions, plus scenarios and pricing calculators |
| Sources | Legal framework and official source register with review dates |

## How data is stored

- Register entries are saved **only in the browser on the device being used** (localStorage). Nothing is sent to a server. The site makes no network calls (`connect-src 'none'`).
- Data does not sync between devices or people. Clearing browser data deletes it. Use **Data, Backup And Privacy → Export full backup** at least weekly and keep the file in Haverton's access controlled storage.
- Do not enter identity document details, DBS certificate content, health, bank or payroll data, equality monitoring data or anything about people receiving care. Record status, reference and date only.
- This is a single user tool. Before anyone else uses it, move to a system with user accounts, permissions and an audit log (see the CRM migration trigger on the KPIs page).

## Deploying to operation.havertoncare.co.uk

It is a static site with no build step. Any static host works.

**Access control is essential.** The operating system is marked confidential and includes pricing, credit rules and financial targets. `noindex` and `robots.txt` stop search engines listing it, but they do not stop anyone who has the address from opening it. Put a login in front of the site before pointing the domain at it. For example, Cloudflare Pages with Cloudflare Access (email one time code restricted to `@havertoncare.co.uk`), or Netlify with password protection.

Example using Cloudflare Pages:

1. Create a Pages project from this repository (build command: none, output directory: `/`).
2. In Cloudflare Zero Trust, add an Access application for `operation.havertoncare.co.uk` with a policy allowing only named Haverton email addresses.
3. Add the custom domain `operation.havertoncare.co.uk` to the Pages project. At your DNS provider, create a `CNAME` record for `operation` pointing at the `*.pages.dev` address Cloudflare gives you.
4. Open the site and confirm you are asked to log in before any content appears.

`CNAME` in this repository supports GitHub Pages. GitHub Pages has no login, and on a free plan it only serves public repositories, so it is not suitable for this confidential content.

## Updating content

- `assets/js/data.js`: strategy, controls, KPIs, risks, plans, finance assumptions, source register and register field definitions.
- `assets/js/procedures.js`: the 20 procedures (generated from the Compliance And Procedures Pack).
- `assets/js/app.js`: pages, calculations and storage.

Review the legal and rate content before temporary staffing launch and at least quarterly, in line with the source register.

## Encrypted build for hosts without a login

`node scripts/build-encrypted.js "<passphrase>"` writes `dist/`: an unlock page, `unlock.js` and `payload.json` holding the whole site encrypted with AES-256-GCM (key derived from the passphrase with PBKDF2-SHA256, 600,000 iterations). It also writes `source.json`, the git archive of the source encrypted with the same key, which the unlocked site offers as a download on the Data page. The host only stores ciphertext, so the site can sit on a free static host such as Netlify or Cloudflare Pages without server-side password protection. The passphrase never leaves the browser. To change the passphrase, rebuild and redeploy. Register data is still held in the browser's localStorage on the unlocked page.
