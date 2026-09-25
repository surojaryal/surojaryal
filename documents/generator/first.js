const fs = require("fs");
const { P, H1, H2, bullets, numbered, table, form, box, titleBlock, build } = require("./lib");
const W = JSON.parse(fs.readFileSync(__dirname + "/../week.json", "utf8"));
const SIG = ["Kind regards,", "**Suroj Aryal**", "Founder and Director, Haverton Recruitment And Staffing", "01322 879778 | info@havertoncare.co.uk | havertoncare.co.uk",
  "_Haverton Care Limited, registered in England and Wales, company number 17025493. Registered office: 128 City Road, London, EC1V 2NX._",
  "_I found your name and your service's details on the public CQC website. We hold only your business contact details, to offer our recruitment services, under our legitimate interests. You can ask what we hold, or ask us to delete it, at any time. If you would rather not hear from me, just reply \"no thanks\" and I will not contact you again._"];
const who = "I am a former CQC Registered Manager with around 15 years in adult social care, and I have set up Haverton Recruitment, a specialist recruitment agency for care providers across England, based in Kent.";
const BRAND = { "Radfield Home Care Bromley, Orpington & Beckenham": "Radfield Home Care Bromley, Orpington & Beckenham", "Lauriem White Oak Court (EC)": "Lauriem at White Oak Court", "Home Instead": "Home Instead (Dartford Home Care Ltd)", "SAP Care Services Limited": "SAP Care Services", "Homesdale Supported Living": "Homesdale Supported Living" };
function body(o) {
  const svc = o.name.replace(/ Limited$| Ltd\.?$| - Head Office$| \(EC\)$/, "");
  const where = o.vtown || o.town;
  if (o.tier === "A") return {
    subject: `Your ${o.role} vacancy in ${where}`,
    lines: [`I noticed ${BRAND[o.name] || o.name} is recruiting for a ${o.role} in ${where}.`, who,
      o.role === "Registered Manager"
        ? "Having done the job myself, I assess manager candidates on how they have actually run a service: safeguarding, medication governance, audits, staffing and working with CQC, not just their CV."
        : `I screen every candidate by interview and check work history, references and qualifications before I introduce them, and I only send a CV when the candidate has agreed to be put forward for your ${o.role} role.`,
      "You pay nothing unless you hire someone I introduce, and our terms include a free replacement if they leave in the first 30 days.",
      "Would a 15-minute call this week be useful? I am happy to share what I am seeing locally for this role, whether or not you use us."] };
  if (o.norm) return {
    subject: `Registered Manager recruitment for ${svc}`,
    lines: [who, `I understand ${svc} may be looking to appoint a Registered Manager. If that is right, I would be glad to help.`,
      "Having done the job myself, I assess manager candidates on how they have actually run a service: safeguarding, medication governance, audits, staffing and working with CQC, not just their CV.",
      "You pay nothing unless you appoint someone I introduce, and our terms include a free replacement if they leave in the first 30 days.",
      "Could we speak for 15 minutes this week? If I have got this wrong, please accept my apologies."] };
  const homeLine = /Nursing/.test(o.type)
    ? "From my own time as a Registered Manager, I know senior carers, deputy managers and nurse leaders are often the hardest roles to fill. If any of those are open now or coming up, I would be glad to help."
    : /Residential/.test(o.type)
    ? (/Learning/.test(o.spec) ? "I know how important it is to find support staff and seniors who understand positive behaviour support and person-centred practice for people with learning disabilities. If you have roles like that now or coming up, I would be glad to help."
       : "If you have care, senior or management roles that are hard to fill, now or in the next few months, I would be glad to help.")
    : "In my experience, reliable care workers who drive, care coordinators and field care supervisors are often the hardest home care roles to fill. If any of those are open now or coming up, I would be glad to help.";
  return {
    subject: `Care recruitment for ${svc}`,
    lines: [who, `I am contacting a small number of providers close to Swanley, including ${svc} in ${where}.`, homeLine,
      "I screen every candidate by interview and check work history, references and qualifications before any introduction. You pay only if you hire someone I introduce.",
      "Could we speak for 15 minutes in the next week or two?"] };
}
module.exports = (root) => [
build(`${root}/8 First Client/This Week Emails.docx`, [
  ...titleBlock("This Week Emails", "20 personal first emails, one per provider on your call sheet", [
    ["Send from", "info@havertoncare.co.uk"], ["When", "Straight after your call, or if nobody answers"], ["Before sending", "Names are the Registered Manager or Nominated Individual shown on each CQC page on 25 September 2026. Confirm the name on your call. For Priority A, check the advert is still live."]
  ]),
  ...box("Rules", ["Emails to limited companies are allowed without prior consent under PECR, as long as you say who you are and include the opt-out line (already in each email). Honour every opt-out straight away and mark the provider \"Do Not Supply\" in the CRM.",
    "Do not attach anything to a first email. Send terms only after they show interest.",
    "Do not mention their CQC rating or report."]),
  ...W.flatMap((o, i) => { const b = body(o); return [
    H1(`${i + 1}. ${o.name}`),
    P(`_${o.type}, ${o.town} ${o.pc} | Priority ${o.tier} | To: ${o.contact || "the manager"} | ${o.email ? "Email: " + o.email : "Email: ask on the call or use their website contact form"}_`),
    P(`**Subject:** ${b.subject}`), P(`${o.salute || "Dear Manager"},`), ...b.lines.map(l => P(l)), ...SIG.map(l => P(l))
  ]; }),
  H1("Follow-up email (send on Monday 5 October to anyone who has not replied)"),
  P("**Subject:** Re: [original subject]"), P("Dear [Name],"),
  P("I know how busy things are, so just a short follow-up. If you have any care, senior or management roles open now or coming up, I would be glad to help, and you pay nothing unless you hire someone I introduce."),
  P("If now is not the right time, I will not chase again, but you are welcome to get in touch whenever it suits."), ...SIG.map(l => P(l))
], { footer: "This Week Emails | September 2026" }),

build(`${root}/8 First Client/First Client Playbook.docx`, [
  ...titleBlock("First Client Playbook", "Every step from the first call to the first paid invoice, in order", [
    ["Owner", "Suroj Aryal"], ["Use with", "This Week 20 Providers, This Week Emails, Client Terms Of Business, Fee Proposal Letter, Client Vacancy Brief, Consent To Represent, Candidate File Checklist"]
  ]),
  ...box("Legal requirement or good practice?", [
    "**Legal requirements** are marked. They come from the Conduct of Employment Agencies and Employment Businesses Regulations 2003 (checked on legislation.gov.uk, September 2026) and other law.",
    "**Signed client terms are not a legal requirement for permanent recruitment**, but without them you cannot reliably enforce your fee or guarantee. Never start searching without them."
  ]),
  H1("Step 1. The call"),
  ...numbered([
    "Check the number on the TPS website (Corporate TPS) first. If it is registered, email instead of calling. **Legal requirement (PECR).**",
    "Ask for the Registered Manager or owner. Say who you are in one sentence: \"I'm Suroj, a former Registered Manager. I've set up a local care recruitment agency and wanted to ask how recruitment is going for you.\"",
    "Ask, then listen: \"Which roles are hardest to fill right now?\" and \"Do you use agencies at the moment? What works and what doesn't?\"",
    "Aim for one thing: a 20-minute discovery call or visit with a date in the diary.",
    "Log the outcome in the call sheet and the CRM straight away. Send the email for that provider the same day."
  ]),
  ...table(["They say", "You say or do"], [
    ["\"We already use agencies.\"", "\"That makes sense. What would you change about them?\" Offer to help with the one role they struggle with."],
    ["\"Just send me some information.\"", "Agree, send the email that day, and ask: \"Is there a role I should keep in mind?\" Follow up in 5 to 7 days."],
    ["\"We have no vacancies.\"", "\"Great to hear. Could I check back in two months?\" Set a follow-up in the CRM."],
    ["\"What are your fees?\"", "\"Between 12.5% and 20% of first-year salary depending on the role, only if you hire someone I introduce, with a free replacement in the first 30 days.\""],
    ["\"Can you do temporary cover?\"", "\"Not yet. We are preparing temporary staffing and I will let you know when it is ready.\" Note it in the CRM as a future temporary client."],
    ["\"Please don't contact us again.\"", "Apologise, stop, and mark them \"Do Not Supply\" in the CRM so they are never contacted again. **Legal requirement (UK GDPR right to object; PECR).**"]
  ], [3, 6]),
  H1("Step 2. The discovery call (20 minutes)"),
  P("Use the script in **5 Sales, Client Emails And Call Script**, section 5. Fill in the **Client Vacancy Brief** as you talk. The law says you must have this information before you introduce anyone:"),
  ...table(["Information you must get from the client", "Legal basis"], [
    ["Who they are and what their business is", "Legal requirement: reg 18(a)"],
    ["When they need someone to start, and whether the role is permanent", "Legal requirement: reg 18(b)"],
    ["The role: duties, location, hours, and any known health and safety risks with how they are controlled", "Legal requirement: reg 18(c)"],
    ["Experience, training, qualifications and registrations needed (including any required by law or a professional body)", "Legal requirement: reg 18(d)"],
    ["Any expenses payable to or by the candidate", "Legal requirement: reg 18(e)"],
    ["Minimum pay and other benefits, how often they pay, and notice periods", "Legal requirement: reg 18(f)"],
    ["Why the role is open, what good looks like at 90 days, interview dates, who decides", "Good practice"]
  ], [6, 3]),
  H1("Step 3. Terms signed"),
  ...numbered([
    "Within 24 hours, send the **Client Terms Of Business** and the **Fee Proposal Letter** as PDFs, with the correct fee band filled in.",
    "Ask them to sign and return the terms. Free ways to sign: print, sign and scan; or use the free Fill and Sign tool in Adobe Acrobat Reader. Keep the signed copy in the client's folder.",
    "**Solicitor review:** your terms are drafts. Book a fixed-fee review now. If your first client is ready before the review is done, you can still use the drafts, but you carry the risk of any gaps until they are reviewed.",
    "Do a simple free credit check on Companies House: accounts filed on time, no overdue confirmation statement, no insolvency notices on The Gazette.",
    "In the CRM, open the client and set: Client Status \"Active Client\", Terms Signed \"Yes\", Terms Date, Payment Terms Days \"14\". Tick the Action Plan item \"First signed client terms\"."
  ], "numbers2"),
  H1("Step 4. The vacancy goes live"),
  ...numbered([
    "Create the vacancy in the CRM (Vacancies, New). Attach the completed Vacancy Brief to the client folder.",
    "Now you may advertise that specific role, because you have its details and the client's authority. **Legal requirement: reg 27(2).** Use Advert 4 (Live Vacancy Template). Do not name the client without their permission.",
    "Post it free on Indeed and DWP Find a Job, and share it on Facebook and LinkedIn. Search your candidate pool and ask for referrals."
  ], "numbers3"),
  H1("Step 5. Before you introduce any candidate"),
  P("For care roles, the candidate will be working with vulnerable people, so all of these apply. **All are legal requirements** unless marked."),
  ...table(["Step", "Legal basis"], [
    ["Tell the candidate your service is free (Candidate Terms and privacy notice given at registration)", "Reg 13; UK GDPR articles 13 and 14"],
    ["Screening interview, with notes and a scoring sheet", "Good practice; supports reg 20"],
    ["Confirm the candidate's identity", "Reg 19(2)(a)"],
    ["Confirm they have the experience, training, qualifications and registrations the client needs", "Reg 19(2)(b)"],
    ["Get copies of relevant qualifications, and offer copies to the client", "Reg 22(2)(a)"],
    ["Get two references from people who are not relatives and who agree the reference can go to the client; offer copies to the client", "Reg 22(2)(b)"],
    ["Take all other reasonably practicable steps to confirm they are suitable (for example, full work history with gaps explained)", "Reg 22(2)(c) and reg 20(1)(b)"],
    ["Make sure the candidate and client both know any legal requirements for the role (for example the client's right to work and DBS checks)", "Reg 20(1)(a)"],
    ["Confirm the candidate is willing to work in this role, and get signed **Consent To Represent** for this vacancy", "Reg 19(3); UK GDPR"],
    ["If you cannot get something (for example a second reference), tell the client exactly what steps you took", "Reg 22(3)"]
  ], [6, 3]),
  H1("Step 6. Introduction, interview and offer"),
  ...bullets([
    "When you send the CV, give the client everything you know about the checks in Step 5. **Legal requirement: reg 21(1)(a).**",
    "When the client offers the job, give the candidate the vacancy information from Step 2. **Legal requirement: reg 21(1)(b).** If you tell them by phone, confirm it in writing (email) within 3 business days. **Legal requirement: reg 21(2).**",
    "The client, as employer, does the right to work check and DBS check before the person starts. Remind them in writing.",
    "Record each stage in the CRM (Submissions, then Placements when the offer is accepted)."
  ]),
  H1("Step 7. Start, invoice and after-care"),
  ...bullets([
    "Invoice on the start date, payable within 14 days. The invoice must show Haverton Care Limited, company number 17025493 and the registered office. Add VAT only if you are VAT registered.",
    "Record the invoice in the CRM (Invoices). Chase on day 15 if it is unpaid.",
    "Check in with the client and the new starter at days 7, 30, 60 and 90 using the Placement Check In Record.",
    "For 3 months after the introduction, if you learn anything suggesting the person may be unsuitable, tell the client without delay. **Legal requirement: reg 20(5) and (6).**",
    "Keep all records for the placement. **Legal requirement: reg 29.**"
  ]),
  ...box("Your first-client checklist", [
    "☐ Call made and logged   ☐ Discovery call held   ☐ Vacancy Brief complete   ☐ Terms signed   ☐ Credit check done",
    "☐ Vacancy in CRM and advert live   ☐ Candidates screened and checked (Step 5)   ☐ Consent To Represent signed   ☐ CV sent with check information",
    "☐ Offer: vacancy information confirmed to candidate in writing   ☐ Start date confirmed   ☐ Invoice sent   ☐ Paid   ☐ Day 7 check-in"
  ])
], { footer: "First Client Playbook | Version 1.0 | September 2026" })
];
