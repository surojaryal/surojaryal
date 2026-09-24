/* Haverton Recruitment And Staffing: Master Operating System content.
   Source: Haverton Recruitment Master Operating System v2.0 (21 September 2026),
   Compliance And Procedures Pack v2.0, CRM And KPI Dashboard and Financial Model. */

window.HAV = window.HAV || {};

HAV.meta = {
  entity: "Haverton Care Limited",
  companyNumber: "17025493",
  division: "Haverton Recruitment And Staffing",
  version: "2.0",
  date: "21 September 2026",
  owner: "Director, Haverton Care Limited",
  classification: "Confidential business document",
  strapline: "Care Expertise. Safer Recruitment. Stronger Teams."
};

/* ---------- Controlled lists (from CRM Lists sheet) ---------- */
HAV.lists = {
  yesNo: ["Yes", "No"],
  clientStatus: ["Lead", "Prospect", "Qualified", "Terms Sent", "Active Client", "Expansion", "Dormant", "Do Not Supply"],
  route: ["Permanent Introduction", "Temporary Supply", "Both"],
  candidateStage: ["New", "Screening", "Compliant", "Marketed", "Interview", "Offered", "Placed", "Inactive", "Do Not Contact"],
  vacancyStatus: ["Open", "On Hold", "Filled", "Closed"],
  rag: ["Green", "Amber", "Red"],
  checkStatus: ["Not Required", "Pending", "Verified", "Expired", "Issue"],
  dbsStatus: ["Not Required", "Pending", "Clear", "Content Reviewed", "Update Service Verified", "Expired", "Issue"],
  references: ["Not Started", "Requested", "One Complete", "Two Complete", "Issue"],
  history: ["Not Checked", "Complete", "Issue"],
  submissionStage: ["Draft", "Submitted", "Interview", "Rejected", "Offer", "Placed", "Withdrawn"],
  assignmentStatus: ["Planned", "Live", "Completed", "Cancelled"],
  awrStatus: ["Not Due", "Due Soon", "Equal Treatment Due", "Completed", "Issue"],
  openStatus: ["Open", "In Progress", "Closed"],
  risk: ["Low", "Medium", "High", "Critical"],
  serviceOffer: ["Permanent", "Retained", "Temp To Perm", "Temporary", "Compliance Project"],
  serviceType: ["Residential Care", "Nursing Home", "Domiciliary Care", "Supported Living", "Learning Disability", "Mental Health", "Community Care", "Specialist Care", "NHS", "Private Healthcare", "Other"],
  role: ["Care Assistant", "Senior Care Assistant", "Support Worker", "Team Leader", "Field Care Supervisor", "Care Coordinator", "Deputy Manager", "Registered Manager", "Home Manager", "Quality Manager", "Compliance Manager", "Operations Manager", "Registered Nurse", "Clinical Lead", "Other"],
  paymentRoute: ["PAYE Haverton", "PAYE Umbrella Approved", "Permanent Client Payroll"],
  dbsRequired: ["Not Required", "Eligible", "Not Eligible", "Update Service", "In Progress"],
  youngWorker: ["No", "Yes - risk assessed and approved"],
  priority: ["Low", "Medium", "High", "Urgent"],
  followUpType: ["Client", "Candidate", "Vacancy", "Placement", "Assignment", "Internal"],
  invoiceType: ["Permanent Fee", "Retained Stage", "Compliance Project", "Temporary Supply"],
  creditStatus: ["Within Terms", "Overdue", "Stop Supply", "Paid"],
  caseType: ["Complaint", "Safeguarding", "Incident", "Whistleblowing", "Data Protection"],
  actionPhase: ["Week 1: Foundations", "Week 2: Legal And Compliance", "Week 3: Market", "Week 4: First Business", "Temporary Staffing Readiness", "Ongoing"],
  actionStatus: ["Not started", "In progress", "Done", "Blocked", "Not needed"],
  auditArea: ["Candidate Files", "Right To Work", "DBS Eligibility", "References", "Consent", "Client Terms", "Assignments", "AWR", "Invoices", "Incidents", "Data Protection"]
};

/* ---------- Register (CRM) definitions ---------- */
/* type: text | date | number | money | pct | select | textarea | email | tel
   derived fields are computed and read only. */
HAV.registers = [
  {
    key: "clients", title: "Clients", prefix: "CL", group: "Commercial",
    intro: "One row per legal client entity or service. Complete due diligence before accepting vacancies or shifts.",
    rule: "Do not supply where legal identity is unclear, terms are unsigned, safety information is withheld, payment risk is unacceptable or the client asks Haverton to bypass safer recruitment or worker rights.",
    list: ["Legal Entity", "Service Type", "Primary Contact", "Client Status", "Terms Signed", "Credit Limit", "Last Review"],
    status: "Client Status",
    fields: [
      ["Legal Entity", "text", { required: true }], ["Trading Name / Service", "text"], ["Service Type", "select", { list: "serviceType" }],
      ["CQC Regulated?", "select", { list: "yesNo" }], ["CQC Location ID / Note", "text", { hint: "Verify on the CQC website, not from client statements." }],
      ["Primary Contact", "text"], ["Role", "text"], ["Email", "email"], ["Phone", "tel"], ["Postcode", "text"],
      ["Client Status", "select", { list: "clientStatus", required: true }], ["Terms Signed", "select", { list: "yesNo" }], ["Terms Date", "date"],
      ["Credit Approved", "select", { list: "yesNo" }], ["Credit Limit", "money"], ["Payment Terms Days", "number"], ["Last Review", "date"],
      ["Conflict Of Interest Note", "textarea", { hint: "Where Haverton Care Hub also provides consultancy or training to this client." }]
    ]
  },
  {
    key: "candidates", title: "Candidates", prefix: "CA", group: "Delivery",
    intro: "Record recruitment data and status only. Sensitive evidence (passport scans, DBS certificates, health or bank details) stays in secure candidate folders, never here.",
    rule: "Identifiable CV or profile requires recorded permission to represent before it is sent to any client.",
    list: ["Full Name", "Target Role", "Candidate Route", "Current Stage", "Consent To Represent", "RTW Status", "Next Action Date"],
    status: "Current Stage",
    fields: [
      ["Full Name", "text", { required: true }], ["Email", "email"], ["Phone", "tel"], ["Postcode", "text"],
      ["Target Role", "select", { list: "role" }], ["Candidate Route", "select", { list: "route" }], ["Current Stage", "select", { list: "candidateStage", required: true }],
      ["Source Of Data", "text"], ["Privacy Notice Given", "select", { list: "yesNo" }], ["Privacy Notice Version / Date", "text"],
      ["Consent To Represent", "select", { list: "yesNo" }], ["Consent Date", "date"], ["Consent Scope", "text", { hint: "Specific vacancy or agreed category of roles." }],
      ["RTW Status", "select", { list: "checkStatus" }], ["RTW Check Date", "date"], ["RTW Expiry / Follow Up", "date"],
      ["DBS Required", "select", { list: "dbsRequired" }], ["DBS Status", "select", { list: "dbsStatus" }],
      ["Professional Registration Required", "select", { list: "yesNo" }], ["Registration Status", "select", { list: "checkStatus" }],
      ["References", "select", { list: "references" }], ["Employment History / Gaps", "select", { list: "history" }],
      ["Training / Competence", "select", { list: "checkStatus" }], ["Young Worker 16-17", "select", { list: "youngWorker" }],
      ["Availability", "text"], ["Marketing / Contact Preference", "text"], ["Last Contact", "date"], ["Next Action Date", "date"], ["Retention Review Date", "date"]
    ]
  },
  {
    key: "vacancies", title: "Vacancies", prefix: "VA", group: "Commercial",
    intro: "No vacancy goes live until role, pay, location, working pattern, required checks, risks and client authority are confirmed.",
    rule: "Pause the vacancy if the client refuses to provide material role or safety information or requests an unlawful selection criterion. No fake vacancies.",
    list: ["Job Title", "Client ID", "Service Offer", "Location", "Target Fill Date", "Vacancy Status", "Priority"],
    status: "Vacancy Status",
    fields: [
      ["Client ID", "ref", { ref: "clients", required: true }], ["Service", "text"], ["Service Type", "select", { list: "serviceType" }],
      ["Service Offer", "select", { list: "serviceOffer" }], ["Job Title", "text", { required: true }], ["Location", "text"],
      ["Salary / Charge Rate", "money"], ["Pay Rate If Temp", "money"], ["Hours / Pattern", "text"], ["Open Date", "date"], ["Target Fill Date", "date"],
      ["Required DBS", "select", { list: "dbsRequired" }], ["Required Registration", "text"], ["Required Training / Skills", "text"],
      ["Known H&S Risks Confirmed", "select", { list: "yesNo" }], ["Hiring Contact", "text"], ["Vacancy Status", "select", { list: "vacancyStatus", required: true }],
      ["Priority", "select", { list: "priority" }], ["Recruiter", "text"], ["Fee % / GP Target", "text"], ["Notes", "textarea"]
    ]
  },
  {
    key: "submissions", title: "Submissions", prefix: "SU", group: "Delivery",
    intro: "Each identifiable submission must have candidate consent and an audit trail.",
    rule: "Withdraw or correct a submission immediately if material information is discovered to be inaccurate.",
    list: ["Vacancy ID", "Candidate ID", "Consent Confirmed", "Submitted Date", "Stage", "Next Action"],
    status: "Stage",
    fields: [
      ["Vacancy ID", "ref", { ref: "vacancies", required: true }], ["Candidate ID", "ref", { ref: "candidates", required: true }], ["Client ID", "ref", { ref: "clients" }],
      ["Consent Confirmed", "select", { list: "yesNo", required: true }], ["Submitted Date", "date"], ["Stage", "select", { list: "submissionStage", required: true }],
      ["Interview Date", "date"], ["Offer Date", "date"], ["Outcome Date", "date"], ["Fee Expected", "money"], ["Recruiter", "text"],
      ["Feedback / Reason", "textarea"], ["Next Action", "text"]
    ],
    validate: r => (r["Stage"] && r["Stage"] !== "Draft" && r["Consent Confirmed"] !== "Yes")
      ? "A submission cannot move beyond Draft without recorded candidate consent." : null
  },
  {
    key: "placements", title: "Placements", prefix: "PL", group: "Commercial",
    intro: "Permanent and retained placements. Record fee trigger, guarantee period and retention outcome. Check in at day 7, day 30, day 60 and day 90.",
    list: ["Job Title", "Client ID", "Candidate ID", "Fee Value", "Start Date", "12 Week Retained", "Status"],
    status: "Status",
    fields: [
      ["Vacancy ID", "ref", { ref: "vacancies" }], ["Client ID", "ref", { ref: "clients", required: true }], ["Candidate ID", "ref", { ref: "candidates", required: true }],
      ["Service Offer", "select", { list: "serviceOffer" }], ["Job Title", "text", { required: true }], ["Salary", "money"], ["Fee %", "pct"],
      ["Fee Value", "derived", { calc: r => num(r["Salary"]) * num(r["Fee %"]) / 100, fmt: "money" }],
      ["Start Date", "date"], ["Invoice Date", "date"], ["Invoice Due", "date"], ["Paid Date", "date"], ["Guarantee End", "date"],
      ["4 Week Retained", "select", { list: "yesNo" }], ["12 Week Retained", "select", { list: "yesNo" }],
      ["Status", "select", { list: ["Offer Accepted", "Started", "Guarantee Period", "Complete", "Early Leaver", "Cancelled"] }], ["Notes", "textarea"]
    ]
  },
  {
    key: "assignments", title: "Assignments", prefix: "AS", group: "Temporary Staffing", temp: true,
    intro: "Temporary supply is a payroll and credit business. Every booking must pass margin, assignment information, KID and compliance controls.",
    rule: "No assignment when worker compliance is red, KID or terms are missing, or client exposure exceeds the credit limit.",
    list: ["Role", "Client ID", "Candidate ID", "Start Date", "GP / Hr", "GP %", "Status"],
    status: "Status",
    fields: [
      ["Client ID", "ref", { ref: "clients", required: true }], ["Candidate ID", "ref", { ref: "candidates", required: true }], ["Vacancy ID", "ref", { ref: "vacancies" }],
      ["Role", "select", { list: "role" }], ["Site", "text"], ["Start Date", "date"], ["Expected End", "date"], ["Hours / Week", "number"],
      ["Charge Rate", "money"], ["Pay Rate", "money"],
      ["Estimated Loaded Cost / Hr", "derived", { calc: r => loadedCost(num(r["Pay Rate"])), fmt: "money" }],
      ["GP / Hr", "derived", { calc: r => num(r["Charge Rate"]) ? num(r["Charge Rate"]) - loadedCost(num(r["Pay Rate"])) : 0, fmt: "money" }],
      ["GP %", "derived", { calc: r => num(r["Charge Rate"]) ? (num(r["Charge Rate"]) - loadedCost(num(r["Pay Rate"]))) / num(r["Charge Rate"]) * 100 : 0, fmt: "pct" }],
      ["KID Issued", "select", { list: "yesNo" }], ["Assignment Info Issued", "select", { list: "yesNo" }], ["Client H&S Info Confirmed", "select", { list: "yesNo" }],
      ["AWR Start Date", "date"], ["AWR Week 12 Date", "derived", { calc: r => addDays(r["AWR Start Date"], 7 * 12), fmt: "date" }],
      ["Payment Route", "select", { list: "paymentRoute" }], ["Timesheet Approver", "text"], ["Status", "select", { list: "assignmentStatus", required: true }],
      ["Director GP Exception", "textarea", { hint: "Required if GP/hour is below £5.50 or GP % below 20%." }],
      ["Credit Control Note", "text"], ["Next Review", "date"]
    ],
    validate: r => {
      if (r["Status"] === "Live" || r["Status"] === "Planned") {
        if (r["KID Issued"] !== "Yes" || r["Assignment Info Issued"] !== "Yes" || r["Client H&S Info Confirmed"] !== "Yes")
          return "KID, assignment information and client H&S information must all be confirmed before a booking is Planned or Live.";
        const cr = num(r["Charge Rate"]), gp = cr - loadedCost(num(r["Pay Rate"]));
        if (cr && (gp < 5.5 || gp / cr < 0.2) && !(r["Director GP Exception"] || "").trim())
          return "GP/hour is below the £5.50 floor or 20% margin. Record a documented Director exception or re-price.";
      }
      return null;
    }
  },
  {
    key: "compliance", title: "Compliance", prefix: "CO", group: "Delivery",
    intro: "A candidate can be marketed only with consent and accurate status. Temporary supply requires all role-applicable checks and company-level Temp Go Live authority.",
    rule: "Expired or unverified right to work, lapsed registration or an unresolved safeguarding concern blocks supply. There is no routine override.",
    list: ["Candidate ID", "Route", "RTW", "DBS", "References", "Overall Status", "Blocking Reason"],
    status: "Overall Status",
    fields: [
      ["Candidate ID", "ref", { ref: "candidates", required: true }], ["Route", "select", { list: "route" }],
      ["RTW", "select", { list: "checkStatus" }], ["DBS Required", "select", { list: "dbsRequired" }], ["DBS", "select", { list: "dbsStatus" }],
      ["Reg Required", "select", { list: "yesNo" }], ["Registration", "select", { list: "checkStatus" }], ["References", "select", { list: "references" }],
      ["Employment History", "select", { list: "history" }], ["Consent", "select", { list: "yesNo" }], ["Privacy Notice", "select", { list: "yesNo" }],
      ["Training / Competence", "select", { list: "checkStatus" }], ["RTW Expiry", "date"], ["Registration Expiry", "date"],
      ["Overall Status", "derived", { calc: r => complianceRag(r), fmt: "text" }],
      ["Blocking Reason", "derived", { calc: r => complianceBlock(r), fmt: "text" }],
      ["Reviewed By", "text"], ["Review Date", "date"]
    ]
  },
  {
    key: "awr", title: "AWR Tracker", prefix: "AW", group: "Temporary Staffing", temp: true,
    intro: "Track qualifying weeks for the same worker in the same role with the same hirer. Complex breaks or role changes require case review. Request comparator information by week 10.",
    rule: "Do not structure artificial breaks or role changes to avoid the Agency Workers Regulations.",
    list: ["Worker ID", "Client ID", "Qualifying Start", "Projected Week 12", "Current Qualifying Weeks", "AWR Status"],
    status: "AWR Status",
    fields: [
      ["Worker ID", "ref", { ref: "candidates", required: true }], ["Client ID", "ref", { ref: "clients", required: true }], ["Role", "select", { list: "role" }],
      ["Assignment ID", "ref", { ref: "assignments" }], ["Qualifying Start", "date"],
      ["Projected Week 12", "derived", { calc: r => addDays(r["Qualifying Start"], 84), fmt: "date" }],
      ["Current Qualifying Weeks", "number", { hint: "Enter manually where breaks apply; do not rely on calendar time alone." }],
      ["Day 1 Rights Confirmed", "select", { list: "yesNo" }], ["Comparator Information Requested", "select", { list: "yesNo" }],
      ["Equal Treatment Review", "select", { list: ["Not Due", "Scheduled", "Completed"] }], ["AWR Status", "select", { list: "awrStatus" }], ["Review Notes", "textarea"]
    ]
  },
  {
    key: "followups", title: "Follow Ups", prefix: "FU", group: "Commercial",
    intro: "Every next step should have an owner and date. A CRM without next actions is an address book.",
    list: ["Type", "Organisation / Candidate", "Action", "Due Date", "Owner", "Status"],
    status: "Status",
    fields: [
      ["Type", "select", { list: "followUpType" }], ["Related ID", "text"], ["Organisation / Candidate", "text", { required: true }], ["Contact", "text"],
      ["Action", "text", { required: true }], ["Due Date", "date", { required: true }], ["Owner", "text", { required: true }],
      ["Status", "select", { list: "openStatus", required: true }], ["Outcome", "textarea"], ["Next Action", "text"]
    ]
  },
  {
    key: "invoices", title: "Invoices", prefix: "IN", group: "Finance",
    intro: "Cash collection is a core control. Escalate overdue debt before increasing worker exposure. Values exclude VAT unless stated.",
    rule: "Stop increasing exposure to clients with unresolved material overdue debt unless the Director records a funded exception.",
    list: ["Client ID", "Invoice Type", "Due Date", "Gross", "Outstanding", "Days Overdue", "Credit Status"],
    status: "Credit Status",
    fields: [
      ["Client ID", "ref", { ref: "clients", required: true }], ["Placement / Assignment ID", "text"], ["Invoice Type", "select", { list: "invoiceType" }],
      ["Invoice Date", "date"], ["Due Date", "date"], ["Net", "money"], ["VAT Rate %", "pct", { def: 20 }],
      ["VAT", "derived", { calc: r => num(r["Net"]) * num(r["VAT Rate %"]) / 100, fmt: "money" }],
      ["Gross", "derived", { calc: r => num(r["Net"]) * (1 + num(r["VAT Rate %"]) / 100), fmt: "money" }],
      ["Paid", "money"], ["Paid Date", "date"],
      ["Outstanding", "derived", { calc: r => Math.max(0, num(r["Net"]) * (1 + num(r["VAT Rate %"]) / 100) - num(r["Paid"])), fmt: "money" }],
      ["Days Overdue", "derived", { calc: r => daysOverdue(r), fmt: "int" }],
      ["Credit Status", "select", { list: "creditStatus" }], ["Action", "text"]
    ]
  },
  {
    key: "cases", title: "Complaints And Incidents", prefix: "CS", group: "Governance",
    intro: "Log concerns promptly, triage safeguarding risk first and keep investigation evidence in the restricted case file, not here. Haverton does not replace the care provider's own safeguarding duties.",
    rule: "Safety overrides commercial pressure. For immediate danger contact emergency services. High or critical concerns are escalated immediately.",
    list: ["Type", "Date Received", "Summary", "Immediate Risk", "Owner", "Target Date", "Status"],
    status: "Status",
    fields: [
      ["Type", "select", { list: "caseType", required: true }], ["Date Received", "date", { required: true }], ["Client / Worker", "text"], ["Related ID", "text"],
      ["Summary", "textarea", { required: true, hint: "Factual, minimum necessary. Do not record names of people receiving care." }],
      ["Immediate Risk", "select", { list: "risk", required: true }], ["Safeguarding Concern", "select", { list: "yesNo" }],
      ["External Referral / Notification", "text", { hint: "Local authority safeguarding, police, professional regulator, ICO or client notification as applicable." }],
      ["Escalated To", "text"], ["Owner", "text"], ["Target Date", "date"], ["Status", "select", { list: "openStatus", required: true }],
      ["Outcome / Learning", "textarea"], ["Client Notified", "select", { list: "yesNo" }], ["Closed Date", "date"]
    ],
    validate: r => (r["Status"] === "Closed" && !(r["Outcome / Learning"] || "").trim())
      ? "No complaint or incident is closed without a recorded outcome and learning." : null
  },
  {
    key: "actions", title: "Action Plan", prefix: "AP", group: "Overview", nav: false,
    intro: "Every launch task with a due date, who owns it, when it was done and where the evidence is.",
    list: ["Task", "Phase", "Due Date", "Status", "Done Date"],
    status: "Status",
    fields: [
      ["Task", "text", { required: true }], ["Phase", "select", { list: "actionPhase", required: true }], ["Deliverable", "text"],
      ["Due Date", "date"], ["Owner", "text"], ["Status", "select", { list: "actionStatus", required: true }], ["Done Date", "date"],
      ["Evidence / Notes", "textarea", { hint: "Where the proof is kept, for example the folder, file name or email." }]
    ]
  },
  {
    key: "audits", title: "Audits", prefix: "AU", group: "Governance",
    intro: "Sample evidence monthly. A dashboard is not assurance unless the underlying files are checked. Verify corrective actions through evidence, not verbal assurance.",
    list: ["Audit Area", "Period", "Score %", "Critical Failure", "Owner", "Due Date", "Status"],
    status: "Status",
    fields: [
      ["Audit Area", "select", { list: "auditArea", required: true }], ["Period", "text"], ["Sample Size", "number"], ["Score %", "pct"],
      ["Critical Failure", "select", { list: "yesNo" }], ["Findings", "textarea"], ["Actions", "textarea"], ["Owner", "text"], ["Due Date", "date"],
      ["Status", "select", { list: "openStatus" }], ["Closed Date", "date"], ["Evidence Link / Location", "text"]
    ]
  }
];

/* ---------- Temporary staffing unit-cost planning loads (Financial Model Y1) ---------- */
HAV.loads = { holiday: 0.1207, ni: 0.105, pension: 0.025, other: 0.75, badDebt: 0.01, gpFloor: 5.5, marginFloor: 0.2 };

/* ---------- Temp Go Live gate (Compliance Pack section 21) ---------- */
HAV.goLive = [
  "Employment business client terms solicitor-reviewed",
  "Worker terms and KID process approved",
  "Recruitment / employment business insurance confirmed for intended worker categories",
  "PAYE / RTI payroll tested end-to-end",
  "Pension auto-enrolment process confirmed",
  "Holiday pay method confirmed",
  "Right-to-work process trained and tested",
  "DBS eligibility and criminal-record handling process approved",
  "Professional-registration verification process live",
  "Candidate compliance status and secure evidence folders live",
  "Assignment intake (Reg 18) and worker information (Reg 21) process live",
  "AWR tracker and week 10 / 12 review process live",
  "Timesheet and booking confirmation process tested",
  "Client credit check, limit and stop-supply rules live",
  "Rolling 13-week cash-flow and payroll facility approved",
  "VAT, PAYE and pension payment timetable included in cash plan",
  "Safeguarding, incident and out-of-hours process live",
  "Data-protection retention, access and breach controls live",
  "Pilot cap agreed (workers, clients, payroll exposure)"
];

HAV.companyGates = [
  ["Legal terms", "Solicitor-reviewed client terms, worker terms and assignment documentation suitable for employment business activity.", "Director"],
  ["Insurance", "Recruitment / employment business cover confirmed for supplied worker categories and activities.", "Director"],
  ["Payroll", "PAYE / RTI process, pension auto-enrolment, holiday method, payslip controls and payroll provider tested.", "Director + accountant / payroll"],
  ["KID / Conduct", "Key Information Document process, hirer information capture and worker assignment information process tested.", "Director"],
  ["AWR", "Tracker and client comparator / equal-treatment process tested.", "Director"],
  ["Right to work", "Prescribed check and follow-up process, trained checker and audit trail.", "Director"],
  ["Candidate compliance", "Role-based ready-to-work checklist and evidence storage live.", "Director"],
  ["Working capital", "13-week weekly cash-flow forecast; peak payroll gap funded plus contingency.", "Director"],
  ["Credit control", "Credit check, credit limit, invoice / timesheet process, escalation and stop-supply rule.", "Director"],
  ["On-call / incidents", "Booking escalation, safeguarding, health and safety, no-show and out-of-hours process.", "Director"],
  ["Systems", "CRM, timesheets, payroll data flow and document access tested.", "Director"],
  ["Pilot", "Small controlled pilot, post-pilot audit and corrective actions closed.", "Director"]
];

HAV.scaleGates = [
  ["Permanent recruitment", "GO", "Terms signed, candidate consent, role verification, right-to-work process and data controls in place."],
  ["Retained search", "GO", "Use written scope, staged fee, exclusivity period and milestone reporting."],
  ["Temporary staffing", "CONDITIONAL", "Only after payroll, insurance, KID, AWR, assignment information, credit control, working capital and on-call controls are signed off."],
  ["Umbrella companies", "RESTRICTED", "Use only after tax / compliance due diligence. From 6 April 2026 PAYE liability can transfer to the agency or client in the labour chain."],
  ["Clinical / regulated professional supply", "CONDITIONAL", "Profession-specific registration, competence and indemnity verification plus client-specific clinical governance requirements."],
  ["16 and 17 year olds", "RESTRICTED", "Young-worker risk assessment, hours / rest controls, learning support, supervision / competency and care-setting safeguards required."]
];

HAV.killSwitches = [
  ["Debtor days > 45 or material overdue debt", "Freeze additional exposure to affected clients; Director credit review."],
  ["GP / hour falls below floor", "Stop accepting low-rate shifts unless a documented strategic exception exists."],
  ["Compliance audit critical failure", "Pause affected worker / client stream until corrected."],
  ["Payroll funding cover inadequate", "Cap or reduce active temp workers."],
  ["Client concentration > 25% of gross profit", "Director risk review and diversification plan."],
  ["Complaints / safeguarding trend worsens", "Root-cause review, retraining / redeployment and client / worker controls before growth resumes."],
  ["Founder is sole approval bottleneck", "Hire or delegate controlled second-line management before further scale."]
];

HAV.decisionRights = [
  ["Accept permanent client", "Director / delegated manager", "Terms + due diligence complete."],
  ["Discount permanent fee below standard band", "Director", "Written commercial rationale."],
  ["Accept temp assignment below GP floor", "Director only", "Documented strategic exception and cash impact."],
  ["Override candidate compliance blocker", "No routine override", "Only if the requirement is not legally / contractually applicable; reason documented."],
  ["Start temporary staffing", "Director", "All company-level go-live gates green."],
  ["Increase client credit limit", "Director", "Review payment history, exposure and funding."],
  ["Use umbrella company", "Director + accountant / tax review", "Approved supplier due diligence; 2026 PAYE exposure considered."],
  ["Close safeguarding concern", "Designated safeguarding lead / Director", "Evidence and external referrals documented."],
  ["Delete / suppress candidate data", "Data owner / Director", "Retention / lawful obligations checked; marketing suppression preserved where needed."]
];

/* ---------- Strategy ---------- */
HAV.strategy = {
  verdict: "The strongest route to a multi-million-pound business is permanent and retained search first, then temporary staffing at controlled gross profit per hour. The dangerous route is the reverse: winning low-margin shifts before Haverton can fund payroll, monitor AWR and right-to-work, manage client credit and evidence worker compliance.",
  mission: "Help care providers build safer, stronger and more stable teams by combining specialist recruitment capability with care-sector operational knowledge, transparent communication and disciplined compliance.",
  positioning: "Do not compete primarily on being the cheapest agency. Compete on reduced hiring risk, speed with evidence, sector fluency, ethical candidate treatment and repeatable outcomes.",
  promise: [
    "We understand the operational reality of adult social care, not just job titles.",
    "We verify the vacancy before we market it and verify candidate suitability before we introduce or supply.",
    "We do not invent vacancies, inflate candidate availability or send CVs without consent.",
    "We communicate clearly on pay, location, shifts, checks, timelines and fees.",
    "We design every process to leave an auditable trail without turning compliance into bureaucracy for its own sake."
  ],
  identity: [
    ["Legal entity", "Haverton Care Limited (company number 17025493)"],
    ["Trading division", "Haverton Recruitment And Staffing"],
    ["Initial operating role", "Employment agency for permanent introductions and retained search."],
    ["Later operating role", "Employment business for temporary supply only after the Temp Go Live Gate."],
    ["Initial geography", "Swanley, Dartford, Gravesham, Sevenoaks, Bexley, Bromley, Medway and South East London, then wider Kent / London / Surrey / Essex / East Sussex."],
    ["Sponsorship vacancies", "Not accepted as a core launch proposition. Haverton does not provide immigration advice. Any future immigration-related activity requires separate legal and operational review."],
    ["Candidate fees", "No work-finding fees are charged to candidates."],
    ["Authorised decision maker", "Director or formally delegated manager for client approval, pricing exceptions and candidate introduction authority."]
  ],
  icp: [
    ["A", "Independent groups and multi-site providers with recurring vacancies.", "Manager vacancies, turnover, poor agency reliability, inconsistent safer recruitment, growth hiring.", "Account-based selling; multi-vacancy or retained agreements; quarterly workforce reviews."],
    ["B", "Single-site care homes and established home care / supported living providers.", "Urgent vacancies, weak local candidate reach, compliance workload, hard-to-fill senior roles.", "Permanent recruitment, retained search and later controlled temp supply."],
    ["C", "Turnaround / start-up providers and newly registered services.", "Need leadership, recruitment systems, staffing plans and evidence-ready onboarding.", "Bundle recruitment with clearly separated consultancy support; written scope and conflicts managed."],
    ["D", "Large national chains / NHS / private healthcare.", "Volume and framework requirements, procurement, stringent supplier governance.", "Pursue only when operational capacity, insurance and financial strength match procurement demands."]
  ],
  lanes: [
    ["Leadership search", "Highest", "Registered Manager, Home Manager, Deputy Manager, Operations Manager, Quality / Compliance Manager, Clinical Lead where appropriate."],
    ["Operational care management", "High", "Care Coordinator, Field Care Supervisor, Team Leader, Senior Care Assistant."],
    ["Care workforce permanent", "Selective", "Care Assistants, Support Workers, Domiciliary Care Workers, Live-in Care Workers."],
    ["Temporary care workforce", "Later", "Lower-risk non-registered roles only after temp go-live: Care Assistants, Senior Care Assistants, Support Workers, Healthcare Assistants, Night Care Staff, Activity Coordinators, Kitchen and Domestic Staff. Supply only to CQC-registered providers, not directly to private individuals, unless advised otherwise."],
    ["Clinical and regulated professionals", "Controlled later phase", "Registered Nurses and other professionals only where registration, competence, indemnity and client governance controls are robust."]
  ],
  dont: [
    "Do not enter every health and care niche at launch. Concentration beats breadth.",
    "Do not use unverified market-size claims in investor or client material unless a dated source and methodology are recorded.",
    "Do not advertise jobs without a genuine vacancy or a transparent talent-pooling purpose.",
    "Do not win temporary work by underpricing payroll cost, holiday, employer NI, pension, insurance, bad debt and administration.",
    "Do not allow consultancy relationships to become implied guarantees of recruitment outcomes or CQC outcomes."
  ],
  fees: [
    ["Care Assistants and Support Workers", "12.5% of first-year remuneration", "Use only where sourcing economics remain attractive."],
    ["Senior Carers and Team Leaders", "15%", "Default mid-market permanent fee."],
    ["Deputy Managers, Care Coordinators, Field Care Supervisors", "17.5%", "Specialist fee reflecting sector expertise."],
    ["Registered Managers, Home Managers, Clinical Leads", "20%", "Search-intensive leadership roles."],
    ["Senior operations, quality and compliance roles; retained search", "22.5% or staged fixed fee", "Written retained terms, milestones and exclusivity. One third on instruction, one third on shortlist, one third on accepted offer."],
    ["Early-leaver guarantee", "Days 0–30 free replacement; days 31–60 50% credit; days 61–90 25% credit", "Only if the invoice was paid on time, the leaver was not dismissed unfairly or made redundant, and Haverton ran the whole process."]
  ],
  tempControls: [
    ["Gross profit per hour", "At least £5.50 per hour unless Director approves a documented strategic exception.", "Creates room for non-payroll operating cost and credit risk."],
    ["Gross margin", "At least 20% at assignment level.", "Prevents high-turnover, low-quality billings."],
    ["Payment terms", "Weekly timesheets, weekly invoices, 7-day payment for first temporary clients; longer only with funding and strong credit.", "Workers must be paid even if the client has not paid (Conduct Regulations)."],
    ["Charge rate build-up", "Pay + holiday + employer NI + pension + payroll + DBS and training + insurance + margin. Night, weekend and bank holiday rates quoted separately.", "Never quote a flat mark-up."],
    ["Credit limit", "Set per legal client and service group.", "Caps cash exposure."],
    ["Rate review", "At least annually and whenever statutory wage / on-costs change.", "Protects margin as labour costs rise."]
  ],
  pipeline: [
    ["Lead", "Named provider / service and decision-maker identified.", "CRM record with source and fit hypothesis."],
    ["Prospect", "Initial contact attempted; staffing need or trigger identified.", "Contact log and next action."],
    ["Qualified", "Need, role type, decision process, budget / rate range, urgency and supplier position understood.", "Discovery notes."],
    ["Terms Sent", "Commercial proposition issued to authorised contact.", "Version-controlled terms / proposal."],
    ["Active Client", "Terms signed and credit / compliance onboarding complete.", "Client due-diligence record."],
    ["Expansion", "Repeat vacancy, additional service or multi-site opportunity.", "Account plan."],
    ["Dormant / Do Not Supply", "No current demand or unacceptable legal / credit / ethical risk.", "Reason and review date."]
  ],
  discovery: [
    "What has created the vacancy: growth, turnover, performance issue, sickness, new registration, acquisition or internal promotion?",
    "What outcomes must the person achieve in the first 90 and 180 days?",
    "What is non-negotiable versus trainable?",
    "What is the real salary / rate, shift pattern, travel expectation and reporting line?",
    "Why did the previous person leave and what will make a strong candidate stay?",
    "What checks, registration, training or occupational requirements genuinely apply?",
    "Who decides, who interviews and what is the timetable?",
    "Which agencies are already instructed, and what is not working?",
    "For temporary supply: known H&S risks, induction arrangements, timesheet approver, payment process, day-one rights and AWR comparator process?"
  ],
  outbound: [
    ["New researched target accounts", "20 per week", "ICP fit and named decision-maker, not scraped volume."],
    ["Personalised outbound emails", "10 to 15 per week", "Reference a real role, service or workforce issue."],
    ["Follow-up calls", "15 to 20 per week", "Purposeful follow-up with a specific value point."],
    ["Discovery meetings", "3 per week", "Structured notes and next action."],
    ["Anonymised candidate-led introductions", "Up to 2 per week", "Candidate consent and no identity disclosure until agreed."],
    ["Useful LinkedIn / sector content", "1 to 2 per week", "Evidence-led recruitment / compliance insight, not generic promotion."]
  ],
  journey: [
    "Attract through genuine job advertising, referrals, local networks, professional communities and useful career content.",
    "Register core contact, role, location, work preference and lawful privacy information.",
    "Screen for values, role competence, employment history, availability, pay expectations and realistic travel.",
    "Obtain explicit permission before sending an identifiable CV or profile to a client.",
    "Complete role- and route-specific checks. Permanent introduction and temporary supply are not treated as identical compliance pathways.",
    "Match candidate to an evidenced vacancy, not to a vague opportunity.",
    "Prepare candidate for interview without scripting dishonest answers.",
    "Manage offer, notice, counter-offer risk and start date.",
    "Follow up at day 7, day 30, day 60 and day 90; capture reasons for early attrition.",
    "Re-engage good candidates ethically and respect opt-out / do-not-contact requests."
  ],
  checksMatrix: [
    ["Identity / right to work", "Verify according to operating model and client agreement; never imply a statutory excuse belongs to another employer without clarity.", "Haverton must complete the prescribed right-to-work process before employment / supply where Haverton is employer / responsible agency."],
    ["Employment history / gaps", "Full history and material gaps explored for care roles.", "Mandatory documented review before ready-to-work."],
    ["References", "Target two suitable references, including recent employment where possible.", "Two verified suitable references as standard before supply, subject to role / risk and documented exceptions policy."],
    ["DBS", "Check eligibility and client requirement; client may remain responsible as employer.", "Correct DBS level / barred-list check where legally eligible and role requires; status, identity and decision recorded."],
    ["Professional registration", "Verify when relevant.", "Verify before supply and monitor expiry / conditions."],
    ["Training / competence", "Assess against vacancy; distinguish certificate from competence.", "Current role-required training plus client induction and competency sign-off where required."],
    ["Health / adjustments", "Do not use broad pre-selection health screening. Handle reasonable adjustments lawfully.", "Post-selection health information only where lawful, necessary and proportionate; sensitive details stored separately."],
    ["Consent / data", "Permission to represent and privacy information.", "Worker terms, KID, privacy information and assignment information in addition to consent controls."]
  ]
};

/* ---------- KPIs and governance ---------- */
HAV.kpis = [
  ["Qualified client meetings", "Measures real sales conversations.", "3 per week at founder-led launch."],
  ["New terms signed", "Measures conversion to usable clients.", "1 to 2 per month initially."],
  ["Vacancy-to-submission time", "Speed without random CV sending.", "Role-dependent; track median."],
  ["CV-to-interview ratio", "Signal of shortlist quality.", "Investigate persistent < 20%."],
  ["Interview-to-offer ratio", "Role / client / candidate fit.", "Trend by client and recruiter."],
  ["Offer-to-start ratio", "Counter-offer and expectation management.", "> 80% once data is stable."],
  ["12-week placement retention", "Quality of fit / onboarding.", "> 85%; investigate causes, not just percentage."],
  ["Temp fill rate", "Operational reliability.", "Only after go-live; accepted shifts filled."],
  ["GP per temp hour", "Unit economics.", ">= £5.50 unless approved exception."],
  ["Debtor days", "Cash survival metric.", "Aim <= 30; escalate beyond terms."],
  ["Client concentration", "Resilience.", "No one client dominating GP without deliberate risk acceptance."]
];
HAV.qualityKpis = [
  ["Temporary worker files green before supply", "100%"],
  ["Expired right-to-work or professional registrations in active supply", "0"],
  ["Candidate submissions without consent", "0"],
  ["Open safeguarding cases beyond target date without escalation", "0"],
  ["AWR week-12 reviews overdue", "0"],
  ["Payroll / timesheet errors", "Track root cause and repeat errors"],
  ["Audit critical failures", "0 unresolved"],
  ["Data breaches and subject-rights deadlines", "Track severity, timeliness and lessons"]
];
HAV.cadence = [
  ["Daily", "15-minute operations check", "Urgent starts / shifts, interviews, compliance blockers, incidents, cash-critical issues."],
  ["Weekly", "Commercial and delivery review", "Pipeline, vacancies, submissions, placements, candidate supply, GP, outstanding actions."],
  ["Weekly", "Credit review (once temp is live)", "Invoices, debtor days, client limits, stop-supply decisions, payroll exposure."],
  ["Monthly", "Quality and compliance review", "File audits, RTW / DBS / registration expiries, AWR, complaints, safeguarding, payroll errors, data protection."],
  ["Monthly", "Management accounts review", "Revenue, GP, OPEX, EBITDA, cash, VAT / PAYE / pension liabilities, forecast."],
  ["Quarterly", "Strategy review", "Territory, niches, pricing, hiring capacity, client concentration, technology and risk appetite."]
];
HAV.scoreboard = [
  "20 researched target accounts",
  "10 to 15 tailored first contacts",
  "15 to 20 follow-up calls",
  "3 discovery meetings",
  "5 quality candidate screening conversations",
  "At least 2 consented candidate submissions when genuine vacancies exist",
  "All active records have owner and next action",
  "Friday: pipeline, cash and compliance review; no red item rolls forward without an owner"
];

HAV.risks = [
  ["Payroll liquidity", "High", "Medium", "Weekly 13-week cash flow; client limits; funding headroom; stop-supply triggers.", "Director"],
  ["Client bad debt", "High", "Medium", "Credit checks, deposits / short terms where appropriate, invoice discipline, concentration caps.", "Director"],
  ["Right-to-work failure", "Critical", "Low", "Trained checker, prescribed process, follow-up alerts, audit sample.", "Director"],
  ["Unsafe / unsuitable worker", "Critical", "Medium", "Role-based checks, verified references, competence, feedback, incident escalation.", "Operations"],
  ["DBS misuse or over-checking", "High", "Low", "Eligibility decision by role; documented level / barred-list basis; data minimisation.", "Compliance"],
  ["AWR breach", "High", "Medium", "Qualifying-week tracker, client comparator process, week-10 alert.", "Staffing"],
  ["Umbrella PAYE exposure", "Critical", "Medium", "Prefer direct PAYE; approved supplier due diligence; tax contractual controls; accountant review.", "Director"],
  ["Data breach", "High", "Medium", "Least privilege, MFA, controlled folders, breach plan, retention and processor due diligence.", "Director"],
  ["Unlawful discrimination", "High", "Low-Med", "Structured criteria, consistent interview, adjustment process, equality-monitoring separation.", "Recruitment"],
  ["Margin erosion", "High", "Medium", "Rate card, GP / hour approval floor, annual / statutory rate reviews.", "Director"],
  ["Founder dependency", "Medium", "High", "Documented SOPs, dashboard, delegated authority matrix, staged hiring.", "Director"],
  ["Reputation / candidate experience", "High", "Medium", "No ghosting, accurate jobs / pay, complaint route, feedback and consent controls.", "All"],
  ["Regulatory change", "High", "Medium", "Quarterly legal horizon scan and source register update.", "Director"]
];

HAV.plan90 = [
  ["Days 1 to 14", "Foundation", "Approve brand / service scope; solicitor review of permanent terms; privacy / data map; insurance; bank / accounting / VAT planning; CRM setup; first 100 target accounts; candidate pack.", "Permanent recruitment can operate lawfully and consistently."],
  ["Days 15 to 30", "Market entry", "Founder outreach; discovery meetings; genuine vacancies; candidate registration; first shortlists; publish useful content; build referral channels.", "At least 3 qualified active clients / vacancies and measurable pipeline."],
  ["Days 31 to 60", "Conversion", "Close first placements; track ratios; refine scripts / pricing; request structured feedback; audit candidate / client files; build retained search proposition.", "First paid / fee-trigger placements and clean file audit."],
  ["Days 61 to 90", "Repeatability", "Secure repeat work; management pack; client segmentation; recruiter-capacity decision; build temp readiness project but do not switch it on automatically.", "Repeat client, stable pipeline and documented temp gap analysis."]
];
HAV.plan12 = [
  [1, "Positioning, target list, first discovery calls.", "Permanent-only controls, terms, insurance, CRM, privacy."],
  [2, "First live vacancies and candidate shortlists.", "File audit and conversion dashboard."],
  [3, "First placements and references / testimonials with consent.", "Close process gaps; management accounts."],
  [4, "Build repeat clients and leadership search pipeline.", "Recruiter capacity and job-board ROI review."],
  [5, "Introduce retained search deliberately.", "Temp readiness legal / insurance / payroll design."],
  [6, "Strengthen referral and account-based sales.", "13-week temp cash-flow model; funding options."],
  [7, "If all gates green, limited temp pilot.", "Pilot audit after first payroll / invoice cycle."],
  [8, "Expand only successful temp client / worker combinations.", "AWR / credit / on-call controls reviewed."],
  [9, "Increase account penetration.", "ATS / CRM migration decision against trigger."],
  [10, "Target multi-site / group opportunities.", "Pricing and margin review."],
  [11, "Plan Year 2 hiring / territory.", "Client concentration and insurance renewal review."],
  [12, "Annual strategic review and Year 2 budget.", "Full compliance audit, retention analysis and risk reset."]
];
HAV.orgRoadmap = [
  ["Launch", "Founder / Director + outsourced accountant / payroll / legal support", "Sales, senior recruitment, compliance, delivery design.", "Permanent workflow consistently exceeds founder capacity."],
  ["Early growth", "Add recruiter / resourcer; part-time admin / compliance support", "Client acquisition, retained search, quality governance.", "15 to 20 live roles or follow-up service levels slipping."],
  ["Temp pilot", "Add staffing coordinator / on-call cover as demand justifies", "Commercial control, client relationships, go-live assurance.", "10 to 20 active temp workers and out-of-hours demand."],
  ["Year 2", "Recruitment consultant(s), staffing coordinator, compliance / operations lead, finance / admin support", "Strategic accounts, hiring, margin, governance.", "Multi-desk revenue and 30 to 50 active workers."],
  ["Year 3", "Desk leads, recruiters / resourcers, operations / compliance manager, finance / credit control, on-call structure", "Leadership, partnerships, capital allocation and culture.", "Sustained multi-million turnover and > 75 active workers."]
];
HAV.migrationTrigger = [
  "More than two active recruiters need simultaneous editing",
  "More than 1,000 active candidates",
  "More than 50 live temporary workers",
  "Compliance reminders require automation",
  "Duplicate records become a recurring issue",
  "Permissions cannot be adequately separated",
  "Reporting takes more than two hours per week to reconcile"
];

/* ---------- Finance (Financial Model base case) ---------- */
HAV.finance = {
  assumptions: {
    permFee: [7500, 8000, 8500], retainedFee: [12000, 13000, 14000], projectFee: [1500, 1800, 2000],
    perm: [26, 48, 72], retained: [6, 12, 20], projects: [21, 36, 48], tempWorkers: [null, 45, 95],
    hours: [30, 31, 32], charge: [26, 27, 28], pay: [14.5, 15.25, 16], other: [0.75, 0.8, 0.85],
    opex: [168500, 370000, 760000], permCost: 0.08, retainedCost: 0.06, projectCost: 0.10, weeksPerMonth: 4.33
  },
  y1Monthly: [
    ["Oct 26", 0, 0, 0, 0, 4500], ["Nov 26", 1, 0, 1, 0, 5000], ["Dec 26", 1, 0, 1, 0, 5500], ["Jan 27", 1, 0, 1, 0, 7500],
    ["Feb 27", 2, 0.5, 1, 0, 10000], ["Mar 27", 2, 0.5, 2, 0, 11500], ["Apr 27", 2, 0.5, 2, 3, 14500], ["May 27", 3, 0.5, 2, 6, 17000],
    ["Jun 27", 3, 1, 2, 10, 19500], ["Jul 27", 3, 1, 3, 14, 22000], ["Aug 27", 4, 1, 3, 18, 24500], ["Sep 27", 4, 1, 3, 22, 27000]
  ],
  scenarios: [["Downside", 0.7, 0.98, "Slower client conversion; temp ramp delayed"], ["Base", 1, 1, "Execution target case"], ["Stretch", 1.3, 1.03, "Requires stronger sales capacity, candidate supply and working capital"]],
  facts2026: [
    "Fair Work Agency began operating on 7 April 2026 as the state regulator for employment agencies and businesses in Great Britain.",
    "From 6 April 2026, HMRC rules create PAYE exposure in labour supply chains using umbrella companies; an umbrella supplier is not a transfer of tax risk.",
    "National Living Wage is £12.71 (21+) from 1 April 2026; £10.85 (18 to 20); £8.00 (under 18 / apprentice).",
    "Standard employer secondary Class 1 NIC is 15% above the secondary threshold for 2026/27. The model uses a blended planning load, not the statutory calculation.",
    "Compulsory VAT registration threshold is £90,000 taxable turnover. Price and forecast ex VAT from the outset; VAT collected is not operating cash."
  ]
};

/* ---------- Source register ---------- */
HAV.sources = [
  ["Fair Work Agency / Conduct Regulations", "GOV.UK", "https://www.gov.uk/government/publications/conduct-regulations-2003-guidance-for-employment-agencies-and-employment-businesses", "Quarterly / before temp launch"],
  ["Regulation 18 hirer information", "GOV.UK", "https://www.gov.uk/government/publications/conduct-regulations-2003-guidance-for-employment-agencies-and-employment-businesses/the-conduct-regulations-regulation-18-web-version", "Before temp launch"],
  ["Regulation 21 worker / hirer information", "GOV.UK", "https://www.gov.uk/government/publications/conduct-regulations-2003-guidance-for-employment-agencies-and-employment-businesses/the-conduct-regulations-regulation-21-web-version", "Before temp launch"],
  ["AWR guidance", "GOV.UK", "https://www.gov.uk/government/publications/agency-workers-regulations-2010-guidance-for-recruiters", "Quarterly"],
  ["KID guidance", "GOV.UK", "https://www.gov.uk/government/publications/providing-a-key-information-document-for-agency-workers-guidance-for-employment-businesses", "Before temp launch / quarterly"],
  ["Right to work employer guide", "GOV.UK / Home Office", "https://www.gov.uk/government/publications/right-to-work-checks-employers-guide", "Before every process revision"],
  ["Recruitment data protection", "ICO", "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/recruitment-and-selection/", "Quarterly; guidance noted as under review"],
  ["Recruitment discrimination", "Acas", "https://www.acas.org.uk/recruitment/follow-discrimination-law", "Quarterly"],
  ["Employer rates / NMW / NI 2026 to 2027", "GOV.UK", "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027", "At each tax-year / rate change"],
  ["Umbrella PAYE from 6 April 2026", "HMRC / GOV.UK", "https://www.gov.uk/guidance/paye-rules-for-labour-supply-chains-that-include-umbrella-companies-from-6-april-2026", "Before any umbrella use"],
  ["VAT registration", "HMRC / GOV.UK", "https://www.gov.uk/register-for-vat", "Monthly turnover monitoring"],
  ["Modern slavery statement threshold", "GOV.UK", "https://www.gov.uk/guidance/publish-an-annual-modern-slavery-statement", "Annual / growth event"]
];

HAV.legal = [
  ["Employment Agencies Act 1973 and Conduct Regulations 2003", "Correctly distinguish employment agency from employment business; provide terms / information; obtain required hirer information; maintain records; do not charge prohibited work-finding fees."],
  ["Fair Work Agency", "State regulator for employment agencies / businesses in Great Britain from 7 April 2026; maintain inspection-ready records."],
  ["Agency Workers Regulations 2010", "Day-one facility / vacancy rights and 12-week equal-treatment process for qualifying agency workers; monitor breaks and role / hirer continuity."],
  ["Right to work", "Current Home Office prescribed process before employment where Haverton is employer; record follow-up for time-limited permission."],
  ["Equality Act 2010", "Objective selection, reasonable adjustments, lawful occupational requirements only, separation of equality monitoring, restrictions on pre-offer health questions."],
  ["UK GDPR / Data Protection Act 2018", "Lawful basis, transparency, minimisation, retention, security, data subject rights, special-category safeguards and processor / controller governance."],
  ["DBS and safeguarding", "Check DBS / barred-list eligibility rather than defaulting every role to the highest check; risk-assess disclosures and maintain safeguarding escalation."],
  ["Working Time / holiday / NMW", "Roster, rest, holiday-pay and minimum-wage compliance; special restrictions for young workers."],
  ["PAYE / NI / pension", "Accurate payroll, RTI, employer NIC and auto-enrolment controls for temporary workers."],
  ["Umbrella labour chains", "From 6 April 2026, agency / client PAYE exposure can arise if an umbrella company fails; due diligence and contractual controls are mandatory."],
  ["Health and safety", "Obtain assignment risk information from the hirer and communicate it to workers; investigate incidents and unsafe placements."],
  ["Modern slavery", "Anti-exploitation controls apply regardless of the £36m statement threshold; the statement obligation is threshold-dependent."]
];

HAV.fileStructure = [
  ["Candidate master file", "Registration / application, CV / history, consent, screening, privacy record, RTW status / evidence reference, references / gaps, role checks, submission / placement records."],
  ["Temporary worker file", "Candidate file plus worker terms, KID, payroll / pension / holiday onboarding, DBS / registration / training / competence as applicable, assignment records, timesheets and review history."],
  ["Client file", "Legal entity, contacts, terms, credit, service due diligence, vacancies / assignments, H&S / induction information, AWR / comparator, invoices, complaints and account reviews."],
  ["Placement file", "Vacancy, submission consent, interviews, offer, fee trigger, invoice, guarantee / retention follow-ups."],
  ["Incident / safeguarding file", "Restricted case chronology, evidence, referrals / notifications, decisions, learning."],
  ["Governance file", "Audits, KPI packs, management accounts, risk register, horizon scan, corrective actions, document control."]
];

/* ---------- 30 day launch action plan (seeded into the Action Plan register) ---------- */
/* [day offset from start, phase, task, deliverable] */
HAV.actionPlan = [
  [1, "Week 1: Foundations", "Confirm niche, roles and service area", "Written service model"],
  [2, "Week 1: Foundations", "Confirm permanent first, temporary readiness in parallel", "Business plan agreed"],
  [3, "Week 1: Foundations", "Add SIC code 78109 to the Companies House action list", "Note for next confirmation statement"],
  [4, "Week 1: Foundations", "Open or confirm the business bank account for recruitment income", "Account details for invoices"],
  [5, "Week 1: Foundations", "Choose an accountant and a payroll provider with recruitment experience", "Payroll proposal"],
  [6, "Week 1: Foundations", "Get 2 to 3 insurance quotes using the Insurance Broker Brief", "Insurance comparison"],
  [7, "Week 1: Foundations", "Buy professional indemnity insurance (employers’ liability before any temporary worker)", "Insurance certificates"],
  [8, "Week 1: Foundations", "Confirm ICO fee is paid and publish the Recruitment Privacy Notice", "ICO number; notice on website"],
  [9, "Week 1: Foundations", "Accept the Supabase data processing agreement; set own password; delete the setup token", "Screenshot or note of acceptance"],
  [10, "Week 1: Foundations", "Publish a Recruitment page on the website, separate from home care", "Live page"],
  [11, "Week 2: Legal And Compliance", "Solicitor review: Client Terms Of Business (permanent)", "Signed-off terms"],
  [12, "Week 2: Legal And Compliance", "Solicitor review: Client Terms For Temporary Supply", "Signed-off draft (not in use yet)"],
  [13, "Week 2: Legal And Compliance", "Solicitor review: Candidate Terms, Temporary Worker Terms and Key Information Document", "Signed-off candidate pack"],
  [14, "Week 2: Legal And Compliance", "Adopt the Candidate File Checklist and set up restricted folders", "Folder structure"],
  [15, "Week 2: Legal And Compliance", "Register with a DBS umbrella body", "Account confirmed"],
  [16, "Week 2: Legal And Compliance", "Start using the Interview Scoring Sheet for every interview", "First completed sheets"],
  [17, "Week 2: Legal And Compliance", "Confirm safeguarding, complaints and whistleblowing procedure (SOP 17)", "Procedure read and dated"],
  [18, "Week 3: Market", "Enter 150 local care providers in the Clients register", "150 client records"],
  [19, "Week 3: Market", "Map decision-makers: owners, HR leads, Registered Managers", "Contacts recorded"],
  [20, "Week 3: Market", "Create LinkedIn company page and update founder profile", "Live pages"],
  [21, "Week 3: Market", "Start candidate sourcing: aim for 100 conversations this month", "Candidates registered"],
  [22, "Week 3: Market", "Screen the first 20 candidates with consent records", "20 screened candidates"],
  [23, "Week 3: Market", "Client calling campaign: 30 conversations", "Activity logged"],
  [24, "Week 3: Market", "Send tailored introduction emails", "Emails logged"],
  [25, "Week 3: Market", "Book 5 discovery meetings", "Meetings in diary"],
  [26, "Week 4: First Business", "Win the first live permanent vacancy with signed terms", "Signed terms and Vacancy Brief"],
  [27, "Week 4: First Business", "Check temporary rates for each role in the Pricing Calculators", "Rate card (not in use yet)"],
  [28, "Week 4: First Business", "Credit-check possible temporary clients (no supply yet)", "Approved client list and limits"],
  [29, "Week 4: First Business", "Audit documents and systems; record it in the Audits register", "Audit record"],
  [30, "Week 4: First Business", "Review the pipeline and set the 90-day plan", "Monthly report"],
  [45, "Temporary Staffing Readiness", "Payroll provider set up; PAYE, pension and holiday pay tested", "Test payroll run"],
  [50, "Temporary Staffing Readiness", "Employers’ liability (at least £5 million) and temporary staffing cover in place", "Certificates"],
  [55, "Temporary Staffing Readiness", "13-week cash-flow forecast and funding (for example invoice finance) agreed", "Forecast and facility letter"],
  [60, "Temporary Staffing Readiness", "Credit limits, weekly invoicing, 7-day terms and stop-supply rule agreed", "Client credit file"],
  [75, "Temporary Staffing Readiness", "Director signs every item in the Temp Go Live Gate", "Gate showing GO"],
  [90, "Temporary Staffing Readiness", "Pilot with 1 to 2 trusted clients, then audit after the first payroll", "Pilot audit"]
];
