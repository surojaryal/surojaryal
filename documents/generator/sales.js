const { P, H1, H2, bullets, numbered, table, form, box, titleBlock, build, clauses, sign, DRAFT_LEGAL } = require("./lib");
const S = "Sales | Version 1.1 | September 2026";
const T = "NOT FOR USE until the Go Live Gate is signed | Draft for solicitor review | Version 1.1";
const HOLD = ["**Do not use yet.** Temporary staffing stays off until every item in the Go Live Gate is evidenced and the Director has signed it.", "This is a draft for review by a qualified solicitor and your payroll adviser. It is not legal advice."];

module.exports = (root) => [

build(`${root}/5 Sales/Client Emails And Call Script.docx`, [
  ...titleBlock("Client Emails And Call Script", "Ready-to-use words for winning care provider clients"),
  ...box("Rules for every message", ["Personal, short and useful. Mention something real about their service.", "Never use fear of CQC to sell. Never promise inspection results or guaranteed hires.", "B2B email is allowed without prior consent (PECR, corporate subscribers), but always include an easy opt-out and honour it at once."]),
  H1("1. First email: manager vacancy"),
  P("**Subject:** Your Registered Manager vacancy in [town]"),
  P("Dear [Name],"),
  P("I noticed [Service] is recruiting a Registered Manager. I was a CQC Registered Manager myself, and I now run Haverton Recruitment, a specialist agency for adult social care in Kent and South East London."),
  P("I focus on managers and senior staff, and I check more than CVs: safeguarding practice, medication governance and how someone has actually improved a service. I only put forward people who have agreed to be introduced for your role."),
  P("Would a 15-minute call this week help? I can share what we are seeing in the local market for this role, whether or not you use us."),
  P("Kind regards,"),
  P("Suroj Aryal | Founder and Director | Haverton Recruitment And Staffing | 01322 879778"),
  P("_If you would rather not hear from me, just reply “no thanks” and I will not contact you again._"),
  H1("2. First email: general introduction"),
  P("**Subject:** Care recruitment that understands care"),
  P("Dear [Name], I help care providers in [area] fill senior and care roles with people who have been properly checked and genuinely fit the service. I am a former Registered Manager, so I know what the role really needs. If you have any hard-to-fill roles now or coming up, I would be glad to help. Could we speak for 15 minutes? Kind regards, Suroj"),
  H1("3. Follow-up (5 to 7 days later)"),
  P("**Subject:** Re: [original subject]"),
  P("Dear [Name], I know how busy things get. One useful point on [role]: [one genuine local insight, for example typical salary range or time to fill]. Happy to talk whenever suits. Kind regards, Suroj"),
  H1("4. Candidate-led introduction (anonymised)"),
  P("Dear [Name], I am working with an experienced [Deputy Manager] who lives near [area], has [X years] in [service type] and is interested in services like yours. They have agreed that I can share an anonymised profile. Would you like to see it? I would not share their identity until you and they both want to meet."),
  H1("5. Discovery call script (20 minutes)"),
  ...numbered([
    "**Open:** thank them, confirm time, say you will ask some questions then explain how you work.",
    "**Why the role is open:** growth, leaver, new registration, performance?",
    "**What success looks like** in the first 90 and 180 days.",
    "**Must-haves versus trainable** skills.",
    "**Real salary, hours, travel and reporting line.**",
    "**Why the last person left** and what will make the next one stay.",
    "**Checks** that genuinely apply (DBS level, registration, driving).",
    "**Who decides and when:** interview stages and dates.",
    "**Other agencies involved** and what is not working.",
    "**Close:** explain fee band and terms; agree next step and date; send terms and vacancy brief the same day."
  ]),
  H1("6. After the call"),
  ...bullets(["Send Client Terms Of Business and the Client Vacancy Brief within 24 hours.", "Log the activity in the operations system with a next action and date.", "Do not start searching until the terms are signed and the brief is complete."]),
  H1("7. LinkedIn post ideas"),
  ...bullets(["Five things I looked for when hiring a deputy manager, as a Registered Manager.", "Why a great CV can still be the wrong hire for a turnaround service.", "What the first 90 days should look like for a new manager.", "How to keep new carers past week 12: lessons from exit conversations.", "Safer recruitment is more than a DBS: references, gaps and real competence."])
], { footer: S }),

build(`${root}/5 Sales/Fee Proposal Letter.docx`, [
  ...titleBlock("Fee Proposal Letter", "Send with the Client Terms Of Business"),
  P("[Date]"), P("[Name], [Job title]"), P("[Organisation], [Address]"),
  P("Dear [Name],"),
  P("**Proposal: recruitment of [Job title] for [Service]**"),
  P("Thank you for your time on [date]. As agreed, here is how we will help, and our fee."),
  H2("What we will do"),
  ...bullets(["Search our network, adverts and referrals for suitable candidates in [area].", "Screen each candidate on experience, values, safeguarding practice and the essentials you told us.", "Carry out the checks required for roles working with vulnerable people, and tell you clearly what we have and have not verified.", "Send only candidates who have agreed to be introduced for this role.", "Support interviews and the offer, and check in at days 7, 30, 60 and 90 after the start."]),
  H2("Fee"),
  ...table(["Item", "Detail"], [["Fee", "[12.5% / 15% / 17.5% / 20% / 22.5%, by role band] of first-year basic salary plus guaranteed payments, plus VAT if applicable"], ["Example", "At £[salary], the fee would be £[amount] plus VAT"], ["When payable", "Only if you employ a candidate we introduced. Invoiced on the start date, payable within 14 days."], ["If they leave early", "Free replacement in days 0 to 30; 50% credit in days 31 to 60; 25% credit in days 61 to 90, as set out in our terms"]], [2, 5]),
  H2("Next steps"),
  ...numbered(["Sign and return the enclosed Client Terms Of Business.", "Complete the Client Vacancy Brief, or I can complete it with you by phone.", "We will send the first profiles within [X] working days of receiving both."], "numbers2"),
  P("Kind regards,"),
  P("Suroj Aryal, Founder and Director, Haverton Recruitment And Staffing"),
  P("_Haverton Care Limited, company number 17025493, registered office 128 City Road, London, EC1V 2NX_")
], { footer: S }),

/* ---------------------------------------------------------------- TEMPORARY STAFFING DRAFTS */
build(`${root}/6 Temporary Staffing Drafts/Temporary Worker Terms.docx`, [
  ...titleBlock("Temporary Worker Terms", "Terms for agency workers supplied by Haverton (employment business)"),
  ...box("Before you use this document", HOLD, "FBE9E7"),
  H1("Key points"),
  ...bullets(["You will be engaged and **paid by Haverton Care Limited** through PAYE when you work assignments for our clients. [confirm: employee or worker status with solicitor]", "You will receive a **Key Information Document** before you agree these terms.", "We will never charge you a fee for finding you work, or make deductions that take your pay below the National Minimum Wage.", "After 12 weeks in the same role with the same client, you are entitled to the same basic pay and conditions as if the client had recruited you directly (Agency Workers Regulations 2010)."]),
  H1("Terms"),
  ...clauses([
    ["1", "Who we are"],
    ["1.1", "Haverton Care Limited (company number 17025493), 128 City Road, London, EC1V 2NX, trading as Haverton Recruitment And Staffing, acts as an **employment business** under the Conduct of Employment Agencies and Employment Businesses Regulations 2003 when supplying you to clients."],
    ["2", "Assignments"],
    ["2.1", "We will offer you assignments that match your skills and checks. You can accept or decline any assignment. There is no guarantee of work. [confirm]"],
    ["2.2", "Before each assignment we will confirm in writing: the client, start date and likely length, role and duties, location, hours, pay rate, any health and safety risks and how they are managed, and any experience, training or qualifications needed."],
    ["2.3", "You must not start an assignment until we confirm your checks are complete for that role."],
    ["3", "Pay"],
    ["3.1", "Your hourly pay rate for each assignment is confirmed in writing before it starts. You will be paid [weekly] in arrears through PAYE, based on hours shown on an approved timesheet. We will not withhold pay because a client has not approved or paid for a timesheet; we will investigate and pay for work you actually did."],
    ["3.2", "Holiday: you are entitled to paid holiday under the Working Time Regulations 1998. [confirm method, including any rolled-up holiday pay rules for irregular-hours workers, with payroll adviser]"],
    ["3.3", "We will assess you for workplace pension auto-enrolment and enrol you if you are eligible."],
    ["4", "Agency Workers Regulations"],
    ["4.1", "From day one you can use the client’s shared facilities (for example staff room, canteen, parking) and be told about the client’s job vacancies."],
    ["4.2", "After 12 qualifying weeks in the same role with the same client, you are entitled to the same basic working and employment conditions (including pay) as a comparable direct recruit."],
    ["5", "Your responsibilities"],
    ["5.1", "Work safely, follow the client’s reasonable instructions and policies, keep confidential information confidential, and report safeguarding concerns, incidents and near misses straight away."],
    ["5.2", "Tell us immediately if your right to work, professional registration, DBS status or health affects your ability to work safely."],
    ["6", "Ending an assignment or these terms"],
    ["6.1", "Either of us may end an assignment or these terms by giving notice as set out in your Key Information Document and written statement of terms. [confirm notice periods]"],
    ["7", "Concerns"],
    ["7.1", "Contact the Director on 01322 879778 or info@havertoncare.co.uk. For immediate danger call 999."],
    ["8", "Law"],
    ["8.1", "These terms are governed by the law of England and Wales."]
  ]),
  ...sign(["the Worker", "Haverton Care Limited"])
], { footer: T }),

build(`${root}/6 Temporary Staffing Drafts/Client Terms For Temporary Supply.docx`, [
  ...titleBlock("Client Terms For Temporary Supply", "Supplying temporary care workers (employment business)"),
  ...box("Before you use this document", HOLD, "FBE9E7"),
  H1("Main terms"),
  ...clauses([
    ["1", "Supply"],
    ["1.1", "We supply temporary workers who remain engaged and paid by us. You direct their day-to-day work and are responsible for induction, supervision and a safe place of work."],
    ["1.2", "Before we supply anyone, you must give us the information required by the Conduct Regulations (regulation 18), including your identity, the role, location, hours, start date and duration, experience and qualifications needed, and any health and safety risks and how they are controlled."],
    ["2", "Charges"],
    ["2.1", "You pay our agreed hourly charge rate for hours on approved timesheets, plus VAT. Charge rates reflect pay, holiday pay, employer National Insurance, pension, insurance, compliance and our margin, and may change if statutory pay or costs change."],
    ["2.2", "Timesheets must be approved within [48 hours] of the end of each week. We invoice **weekly** and invoices are payable within **7 days**. We will not supply any shift while an invoice is overdue or your credit limit is reached."],
    ["2.3", "Night, weekend and bank holiday shifts are charged at the separate rates in the rate schedule. Mileage between community visits is charged at [45p] a mile where agreed in the booking. [confirm]"],
    ["2.4", "We pay workers for work done even if you have not yet paid us. Late payment interest applies under the Late Payment of Commercial Debts (Interest) Act 1998."],
    ["3", "Agency Workers Regulations"],
    ["3.1", "You must give workers day-one access to facilities and vacancies, and give us comparator pay and conditions information by week 10 of an assignment so we can provide equal treatment from week 12."],
    ["4", "If you want to hire a worker directly (transfer fee)"],
    ["4.1", "If you employ a worker we supplied, directly or through another business, within the later of **14 weeks** from the start of their first assignment with you or **8 weeks** from the end of their last assignment, you must either pay a transfer fee of [X]% of first-year remuneration, or choose instead an **extended period of hire** of [X] weeks at the normal charge rate, after which no fee is due. This follows regulation 10 of the Conduct Regulations."],
    ["5", "Cancellations and safety"],
    ["5.1", "Shift cancellations with less than [24 hours] notice are chargeable at [X] hours. You must tell us immediately about any incident, complaint or safeguarding concern involving a worker."],
    ["6", "Liability, data protection, law"],
    ["6.1", "As in our Client Terms Of Business (clauses 9, 10 and 12), adapted by a solicitor for temporary supply."]
  ]),
  ...sign(["the Client", "Haverton Care Limited"])
], { footer: T }),

build(`${root}/6 Temporary Staffing Drafts/Assignment Confirmation.docx`, [
  ...titleBlock("Assignment Confirmation", "Written confirmation to the worker and the client before each assignment"),
  ...box("Before you use this document", HOLD, "FBE9E7"),
  ...form(["Worker name and ID", "Client (legal name and service)", "Service address", "Role and main duties", "Start date and time", "Likely length of assignment", "Hours and shift pattern", "Worker pay rate (per hour, before tax)", "Charge rate to client (per hour, ex VAT)", "Experience, training and qualifications required", "Known health and safety risks and controls", "Who to report to on arrival", "Timesheet approver", "AWR qualifying start date", "Emergency and out-of-hours contact"]),
  ...form([["Worker checks complete for this role", "☐ Yes (do not supply if No)"], ["Client within credit limit", "☐ Yes"], ["Key Information Document issued", "☐ Yes, date:"], ["Confirmed by (name, date)", ""]])
], { footer: T }),

build(`${root}/6 Temporary Staffing Drafts/Go Live Checklist.docx`, [
  ...titleBlock("Temporary Staffing Go Live Checklist", "Every item must be evidenced, signed and dated before the first worker is supplied"),
  ...box("The rule", "If any item is not green, temporary supply stays off. A client asking urgently for cover is not a reason to skip a step."),
  ...table(["Control", "Evidence (where kept)", "Signed", "Date"], [
    ["Client temporary supply terms reviewed by solicitor", "", "", ""],
    ["Worker terms and Key Information Document process approved", "", "", ""],
    ["Employment business and employers’ liability insurance confirmed", "", "", ""],
    ["PAYE and RTI payroll tested end to end", "", "", ""],
    ["Pension auto-enrolment set up", "", "", ""],
    ["Holiday pay method confirmed", "", "", ""],
    ["Right to work process trained and tested", "", "", ""],
    ["DBS eligibility and handling process approved", "", "", ""],
    ["Professional registration checks live", "", "", ""],
    ["Candidate compliance status and secure folders live", "", "", ""],
    ["Hirer information (reg 18) and assignment confirmation process live", "", "", ""],
    ["AWR tracker and week 10 and 12 reviews live", "", "", ""],
    ["Timesheet and booking process tested", "", "", ""],
    ["Credit checks, limits and stop-supply rule live", "", "", ""],
    ["13-week cash-flow forecast and funding approved", "", "", ""],
    ["VAT, PAYE and pension payment dates in cash plan", "", "", ""],
    ["Safeguarding, incident and out-of-hours process live", "", "", ""],
    ["Data protection controls live", "", "", ""],
    ["Pilot limits agreed (workers, clients, payroll exposure)", "", "", ""],
    ["**Director final GO decision**", "", "", ""]
  ], [5, 3, 1, 1]),
  P("Record the same sign-off in the Temp Go Live Gate page of the operations system.")
], { footer: "Checklist | Version 1.1 | September 2026" })
];
