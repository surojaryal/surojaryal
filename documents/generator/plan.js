const { P, H1, H2, H3, BR, bullets, numbered, table, box, titleBlock, build, toc } = require("./lib");
const gbp = n => "£" + Math.round(n).toLocaleString("en-GB");

module.exports = (root) => [build(`${root}/2 Business Plan/Haverton Recruitment Business Plan.docx`, [
  ...titleBlock("Haverton Recruitment Business Plan", "Specialist recruitment for adult social care providers across England", [
    ["Legal entity", "Haverton Care Limited, company number 17025493"],
    ["Trading name", "Haverton Recruitment And Staffing"],
    ["Registered office", "128 City Road, London, EC1V 2NX"],
    ["Founder and Director", "Suroj Aryal"],
    ["Contact", "info@havertoncare.co.uk | 01322 879778 | havertoncare.co.uk"],
    ["Version", "1.1, September 2026 (replaces earlier recruitment plans)"],
    ["Status", "Confidential business document"]
  ]),
  ...box("How to read this plan", [
    "Plain English on purpose. Each section starts with the point, then the detail.",
    "**Facts** are marked as facts. **Targets** and **forecasts** are our best estimates, not promises. Anything marked **[confirm]** must be checked before it is relied on.",
    "Haverton Recruitment is separate from Haverton Home Care (a planned home care service still preparing for CQC registration) and from Haverton Care Hub (consultancy and training). Registration at Companies House is not CQC registration."
  ]),
  H1("Contents"),
  ...table(null, [
    ["1. Summary", "9. People"], ["2. The business", "10. Money: what it costs to start"], ["3. The market", "11. Forecast"],
    ["4. Services and prices", "12. Risks and how we control them"], ["5. How we win clients", "13. First 90 days"],
    ["6. How we work with candidates", "14. How we measure success"], ["7. Legal and compliance", "15. Decisions only the Director makes"], ["8. Systems", "16. Sources to check"]
  ], [1, 1]),
  BR(),

  H1("1. Summary"),
  P("**What we are.** A specialist recruitment agency for adult social care. We find care managers, nurses, senior carers and care staff for care homes, nursing homes, home care agencies and supported living services **across England**. Permanent recruitment is England-wide from the start. Temporary staffing begins with a small pilot near our Kent base and expands region by region only when the controls are proven."),
  P("**Why we will win.** Most agencies can send a CV. Few understand what makes a Registered Manager succeed in a struggling service, how safeguarding culture or medication practice affects the right hire, or what evidence a provider needs for CQC. Our founder has around 15 years in adult social care, including as a CQC Registered Manager who achieved a Good rating. That experience is our advantage."),
  ...box("Our statement", "Haverton Recruitment And Staffing provides permanent and, in time, temporary staff for care homes, home care and supported living providers. Led by an experienced former Registered Manager, we understand CQC expectations, safer recruitment, safeguarding, staffing pressures and person-centred care. We do not simply send CVs. We introduce carefully screened people who understand dignity, safety, accountability and quality care."),
  P("**How we will grow, safely.**"),
  ...numbered([
    "**Now:** permanent recruitment and retained search. Low cost, low risk, paid by the client on success.",
    "**Next (months 5 to 7):** prepare temporary staffing, but only switch it on when payroll, insurance, cash, legal documents and compliance checks are all proven (the **Go Live Gate**).",
    "**Later:** grow a small team and focus areas once the model is proven and cash allows."
  ]),
  ...table(["The plan in numbers (base case targets)", "Year 1", "Year 2", "Year 3"], [
    ["Revenue", "£545,050", "£2,563,380", "£5,414,240"],
    ["Gross profit", "£340,432", "£1,055,634", "£1,996,879"],
    ["Permanent placements", "26", "48", "72"],
    ["Average active temporary workers", "Up to 22 by year end", "45", "95"]
  ], [3, 2, 2, 2]),
  P("_Source: Haverton Recruitment Financial Model v2.0. These are stretch targets. A cautious, founder-only case is in section 11 and is the one we plan cash around._"),
  ...box("The one rule that protects the business", "Never grow temporary staffing faster than we can pay workers, check them properly and collect our invoices. Revenue that is not collected is not growth."),

  H1("2. The business"),
  ...table(["Item", "Position"], [
    ["Legal entity", "Haverton Care Limited (private limited company, incorporated in England and Wales)"],
    ["Trading name for recruitment", "Haverton Recruitment And Staffing"],
    ["What we are legally", "An **employment agency** for permanent introductions. Later, an **employment business** for temporary supply, only after the Go Live Gate."],
    ["Regulator", "The **Fair Work Agency** enforces the rules for agencies in Great Britain (from 7 April 2026). CQC does not regulate recruitment agencies."],
    ["Where we work", "**Permanent recruitment and retained search: all of England.** Clients are briefed by phone or video, candidates are interviewed by video, and we visit sites where it adds value. **Temporary staffing: a local pilot first** (Kent and South East London, near our base), then region by region. Temporary supply needs local on-call cover, fast replacement of workers and local compliance checks, so it cannot safely start everywhere at once."],
    ["What we will not do", "Charge candidates fees. Give immigration advice. Promise visa sponsorship. Recruit overseas in the first year (it needs the Code of Practice for international recruitment and ethical recruiter standards). Advertise jobs that do not exist. Guarantee CQC outcomes. Chase NHS framework work before we have a strong independent care track record."],
    ["CQC boundary", "Supplying staff to registered providers does not make us a CQC provider. Supplying carers **directly to private individuals** in their homes could, so we supply only to registered providers unless we take advice. We never describe the recruitment business as CQC registered."],
    ["SIC codes", "Registered: 70229, 78200, 85590, 88100. **Add 78109** (employment placement agencies) at the next confirmation statement."]
  ], [2, 5]),
  H2("Mission"),
  P("Help care providers build safer, stronger and more stable teams by combining specialist recruitment with real care-sector knowledge, honest communication and careful checks."),
  H2("Our promise"),
  ...bullets([
    "We understand the reality of adult social care, not just job titles.",
    "We check the vacancy is real before we advertise it, and check the candidate before we introduce them.",
    "We never invent vacancies, exaggerate candidate availability, or send a CV without consent.",
    "We are clear about pay, location, shifts, checks, timescales and fees.",
    "Every step leaves a record, without turning compliance into box-ticking."
  ]),

  H1("3. The market"),
  P("**Fact:** adult social care in England has long-standing recruitment and retention pressure. Skills for Care publishes the official workforce figures each year in _The State of the Adult Social Care Sector and Workforce in England_. **[confirm the latest vacancy and turnover figures from that report before quoting them to clients or funders]**"),
  P("**Verified market size (CQC care directory, 23 September 2026):** there are **30,186 CQC-registered care services in England** of the types we recruit for: 14,464 home care agencies, 10,418 residential homes, 5,029 supported living services and 4,532 nursing homes (a service can be more than one type)."),
  ...table(["Region", "Care services", "Region", "Care services"], [
    ["South East", "5,520", "South West", "3,246"], ["London", "3,891", "East Midlands", "2,957"], ["North West", "3,611", "Yorkshire and Humber", "2,765"],
    ["East of England", "3,554", "North East", "1,205"], ["West Midlands", "3,437", "England total", "30,186"]
  ], [3, 2, 3, 2]),
  P("**How we cover England as a small business:** we focus first on roles where the client will pay for expertise and distance does not matter: Registered and Deputy Managers, nurses and clinical leads, and senior or hard-to-fill roles. Candidates for these roles relocate or travel, and interviews work well by video. Care assistant roles are filled by advertising in the client's own town."),
  P("**What this means for providers:** unfilled manager and senior roles put care quality, CQC ratings and income at risk. Agency costs and poor hires are expensive. Providers need recruiters who can judge care competence, not just match keywords."),
  H2("Who we sell to"),
  ...table(["Tier", "Who", "Their problem", "How we sell"], [
    ["A", "Independent groups and multi-site providers", "Manager gaps, turnover, unreliable agencies, inconsistent safer recruitment", "Account plans, repeat or retained work, quarterly workforce reviews"],
    ["B", "Single care homes and established home care or supported living services", "Urgent vacancies, weak local reach, hard-to-fill senior roles", "Permanent and retained search; temporary cover later"],
    ["C", "New and turnaround services", "Need a manager, a recruitment system and evidence-ready onboarding", "Recruitment plus clearly separate Care Hub consultancy"],
    ["D", "Large national chains, NHS, private hospitals", "Framework and procurement rules", "Only when our size, insurance and systems match what they need"]
  ], [1, 3, 4, 4]),
  H2("Which roles first"),
  ...table(["Priority", "Roles"], [
    ["Highest", "Registered Manager, Home Manager, Deputy Manager, Operations Manager, Quality and Compliance roles"],
    ["High", "Care Coordinator, Field Care Supervisor, Team Leader, Senior Care Assistant"],
    ["Selective", "Care Assistants, Support Workers, Domiciliary and Live-in Care Workers"],
    ["Temporary, after go-live", "Lower-risk non-registered roles: Care Assistants, Senior Care Assistants, Support Workers, Healthcare Assistants, Night Care Staff, Activity Coordinators, Kitchen and Domestic Staff"],
    ["Not at the start (temporary supply only)", "Temporary Registered Nurses, agency Clinical Leads, doctors and specialist clinicians, until compliance is audited and clinical advice is in place. Permanent nurse and clinical lead recruitment is included from the start."]
  ], [2, 6]),
  H2("Competition"),
  P("We compete with national care staffing agencies, regional care recruitment agencies, general recruitment agencies, job boards, and providers hiring directly. **[Complete a named local competitor table before launch: name, services, fees if public, reviews.]**"),
  P("**We do not compete on being cheapest.** We compete on lower hiring risk, speed with evidence, sector knowledge, fair treatment of candidates and repeat results."),

  H1("4. Services and prices"),
  ...table(["Service", "What the client gets", "Price"], [
    ["Permanent recruitment", "Vacancy briefing, search, screening, consented shortlist, interview and offer support, check-ins at days 7, 30, 60 and 90", "12.5% to 20% of first-year salary by role band"],
    ["Retained search", "A dedicated search for senior or hard roles, with milestones and exclusivity", "22.5% or a fixed fee, paid in thirds"],
    ["Recruitment compliance support (via Haverton Care Hub)", "Recruitment file audits, safer recruitment process design, interview packs, onboarding controls", "Fixed project fee, around £1,500 [confirm per scope]"],
    ["Temporary staffing (later)", "Checked care staff for shifts and cover; weekly timesheets and invoices, 7-day payment", "Charge rate built up from full cost (pay, holiday, NI, pension, payroll, checks, insurance, margin), with separate night, weekend and bank holiday rates; never below £5.50 gross profit per hour or 20% margin"]
  ], [2, 4, 3]),
  ...table(["Role band", "Fee", "Example salary", "Example fee"], [
    ["Care Assistants and Support Workers", "12.5%", gbp(25000), gbp(3125)],
    ["Senior Carers and Team Leaders", "15%", gbp(28000), gbp(4200)],
    ["Deputy Managers and Care Coordinators", "17.5%", gbp(35000), gbp(6125)],
    ["Registered Managers and Clinical Leads", "20%", gbp(45000), gbp(9000)],
    ["Senior operations and quality roles; retained search", "22.5%", gbp(55000), gbp(12375)]
  ], [4, 1, 2, 2]),
  P("Fees exclude VAT. Example salaries are illustrations, not market data."),
  P("**Guarantee:** days 0 to 30 free replacement; days 31 to 60 a 50% credit; days 61 to 90 a 25% credit. Only if the invoice was paid on time, the leaver was not made redundant or dismissed unfairly, and we ran the whole process."),

  H1("5. How we win clients"),
  H2("Weekly founder routine"),
  ...table(["Activity", "Target each week", "Quality rule"], [
    ["Research target providers", "20", "Named decision-maker, real fit, not bulk lists"],
    ["Tailored first emails", "10 to 15", "Mention a real role, service or workforce issue"],
    ["Follow-up calls", "15 to 20", "Each call adds something useful"],
    ["Discovery meetings", "3", "Notes and a next step recorded"],
    ["Candidate-led introductions", "Up to 2", "Candidate consent; no identity shared until agreed"],
    ["Useful LinkedIn posts", "1 to 2", "Practical insight, never scare tactics about CQC"]
  ], [3, 2, 4]),
  H2("Our service standards"),
  ...bullets([
    "Reply to client calls within 30 minutes during working hours.",
    "A credible shortlist within 24 to 48 hours where the market allows, never padded with weak CVs.",
    "Interview every candidate properly, and never send a CV without the candidate’s permission.",
    "Never send an unverified worker into a setting with vulnerable people.",
    "Check in after every first temporary shift, and at days 7, 30, 60 and 90 for permanent placements.",
    "Record why people leave, and give honest market advice, including when a client’s pay rate is too low."
  ]),
  H2("Free channels first"),
  ...bullets([
    "**LinkedIn:** founder profile and posts; one free job post at a time.",
    "**Website:** a clear Recruitment page on havertoncare.co.uk, separate from home care, with candidate registration and a client enquiry form.",
    "**Google Business Profile and Google for Jobs:** free listing; job adverts marked up so Google can show them.",
    "**DWP Find a Job and Indeed free listings** for genuine vacancies.",
    "**Networks across England:** registered manager networks (Skills for Care), local authority provider forums and regional care associations in each region we target.",
    "**Referrals:** ask every placed candidate and satisfied client for one introduction."
  ]),
  H2("Sales stages"),
  ...table(["Stage", "Move on when"], [
    ["Lead", "We know the provider and the decision-maker"],
    ["Prospect", "We have made contact and know they have a need"],
    ["Qualified", "We understand the role, budget, timescale and who decides"],
    ["Terms sent", "Our terms and fee proposal are with the right person"],
    ["Active client", "Terms signed and checks done"],
    ["Expansion", "Repeat vacancies or more services"]
  ], [2, 6]),

  H1("6. How we work with candidates"),
  ...numbered([
    "Attract through genuine adverts, referrals and local networks.",
    "Register: contact details, role, location, availability, and our privacy notice and candidate terms.",
    "Screen for values, competence, work history and gaps, pay and travel.",
    "Get **written consent** before sending a CV to any client, for that role.",
    "Carry out checks that match the role. For work with vulnerable people, seek two non-family references and copies of qualifications (Conduct Regulations, regulation 22).",
    "Match to a real vacancy, prepare the candidate honestly, and manage the offer.",
    "Check in at days 7, 30, 60 and 90, and record why anyone leaves early."
  ], "numbers2"),
  P("Interviews test judgement, not memorised jargon: safeguarding, dignity, boundaries, record keeping, escalation, teamwork and learning from mistakes. For managers we add governance, staffing, complaints, medication and clinical risk, culture and leadership."),

  H1("7. Legal and compliance"),
  P("The table shows what the law requires and what we do. **Legal requirement** means we must. **Good practice** means we choose to."),
  ...table(["Area", "Type", "What we do"], [
    ["Employment Agencies Act 1973 and Conduct Regulations 2003", "Legal requirement", "Tell candidates our service is free (reg 13); for temporary work, agree written terms with workers first (reg 14); get vacancy details from clients (reg 18); check candidates (regs 19 to 22); keep records (reg 29); never charge candidates fees"],
    ["Signed client terms", "Commercial necessity (not a statutory requirement for permanent recruitment)", "Signed before we start searching, so our fee, guarantee and data rules are enforceable"],
    ["Fair Work Agency", "Legal requirement", "Keep inspection-ready records"],
    ["Right to work", "Legal requirement for the employer", "Clients check as employer; we check where we employ or supply workers"],
    ["UK GDPR and Data Protection Act 2018", "Legal requirement", "Privacy notice, lawful bases, retention schedule, security, rights requests, Data Protection Record, pay the ICO fee"],
    ["Equality Act 2010", "Legal requirement", "Fair criteria, reasonable adjustments, no health questions before offer except as allowed"],
    ["Advertising", "Legal requirement", "Adverts show our full name and whether the role is permanent or temporary; only genuine vacancies"],
    ["Safeguarding", "Good practice and client expectation", "Escalate concerns promptly; never hide incidents"],
    ["Insurance", "Legal (EL once we employ) and commercial need (PI)", "Professional indemnity for recruitment; employers’ liability when we employ staff or temporary workers"]
  ], [3, 2, 5]),
  H2("Insurance we need"),
  ...table(["Cover", "Suggested level", "When", "Why"], [
    ["Professional indemnity", "£1m to £2m", "Before the first placement", "Claims about negligent recruitment, checks or advice"],
    ["Employers’ liability", "At least £5m by law; £10m is common", "As soon as we employ anyone, including temporary workers", "Legal requirement; fines for not holding it"],
    ["Public liability", "£5m to £10m", "Before temporary supply (often required by clients)", "Third-party injury or damage"],
    ["Cyber and data", "£250,000 to £500,000", "Recommended", "Data breach and cyber attack costs"],
    ["Directors and officers, legal expenses, crime", "As advised", "Optional", "Director protection, disputes, fraud"]
  ], [3, 3, 3, 4]),
  P("Use a broker who covers **healthcare staffing**, not general office insurance. See the Insurance Broker Brief in the Legal folder. Suggested levels come from market practice and must be confirmed by the broker."),
  ...box("Temporary staffing is off until every one of these is proven", [
    "Solicitor-reviewed temporary worker and client terms; Key Information Document process; employment business insurance; tested payroll with pension and holiday pay; right to work process; Agency Workers Regulations tracker; credit checks and limits; a 13-week cash-flow forecast with funding; out-of-hours and incident process; data controls; a small pilot with an audit afterwards.",
    "The Director signs the Go Live Gate in the operations system. \"In progress\" is not a pass."
  ]),

  H1("8. Systems"),
  ...table(["Tool", "Purpose", "Cost"], [
    ["Haverton Operations (operation.havertoncare.co.uk)", "CRM, registers, pipeline, reports, procedures, Go Live Gate; secure sign-in; audit trail", "Free (GitHub Pages and Supabase free plan)"],
    ["Email and calendar", "Communication; follow-up reminders exported from the CRM", "Existing"],
    ["Restricted document storage", "Identity documents, references, DBS outcomes (never in the CRM)", "Existing or free tier [confirm]"],
    ["Accounting", "Invoices, VAT, management accounts", "Accountant to advise [confirm]"]
  ], [3, 5, 2]),
  P("Move to a paid recruitment system only when at least two of these are true: more than two recruiters, over 1,000 active candidates, over 50 live temporary workers, or reporting takes more than two hours a week."),

  H1("9. People"),
  ...table(["Stage", "Team", "Hire when"], [
    ["Launch", "Founder, plus outsourced accountant, payroll and legal advice", "—"],
    ["Early growth", "Add a recruiter or resourcer; part-time admin or compliance support", "15 to 20 live roles, or follow-ups slipping"],
    ["Temporary pilot", "Staffing coordinator and on-call cover", "10 to 20 active temporary workers"],
    ["Year 2", "Consultants, coordinator, compliance lead, finance support", "Several desks and 30 to 50 workers"],
    ["Year 3", "Desk leads, operations and compliance manager, credit control", "Over 75 active workers"]
  ], [2, 5, 3]),
  P("Commission will reward **collected** gross profit, retention and compliance, not revenue alone."),
  ...box("Founder capacity check", "Suroj also leads CQC registration for Haverton Home Care and runs Haverton Care Hub. This plan starts with permanent recruitment because it needs the least time and cash. Protect around 2 to 3 focused days a week for recruitment in the first 90 days, and review this monthly. [confirm]"),

  H1("10. Money: what it costs to start"),
  P("Most start-up needs are already covered or free. Get two or three quotes for anything marked quote."),
  ...table(["Item", "Needed", "Cost"], [
    ["Operations system and database", "Now", "Free"],
    ["Solicitor review of client and candidate terms and privacy notice", "Before first placement", "Quote"],
    ["Professional indemnity insurance (recruitment)", "Before first placement", "Quote via broker"],
    ["ICO data protection fee", "Now, if not already paid", "About £52 a year for a small organisation [confirm tier]"],
    ["Accountant (VAT, year-end, management accounts)", "Now", "Quote"],
    ["Job adverts", "Now", "Free channels first; paid only with a measured return"],
    ["Temporary staffing readiness (payroll, EL insurance, legal, working capital)", "Month 5 onward", "Quote; see funding note below"]
  ], [4, 2, 3]),

  H1("11. Forecast"),
  H2("Two cases"),
  P("The **base case** comes from the Haverton Recruitment Financial Model. The **cautious case** is a founder-only plan with no temporary staffing in Year 1. We plan cash on the cautious case and treat the base case as the stretch target."),
  ...table(["Year 1", "Cautious case (assumption)", "Base case (target)"], [
    ["Permanent placements", "12 at about £5,500 = £66,000", "26 at about £7,500 = £195,000"],
    ["Retained searches", "2 at about £10,000 = £20,000", "6 at about £12,000 = £72,000"],
    ["Compliance projects", "8 at about £1,500 = £12,000", "21 at about £1,500 = £31,500"],
    ["Temporary staffing", "£0 (not switched on)", "£246,550 (from month 7, up to 22 workers)"],
    ["**Total revenue**", "**£98,000**", "**£545,050**"],
    ["Gross profit", "About £90,000 (after about 8% direct costs)", "£340,432"],
    ["Operating costs", "About £18,000 (£1,500 a month); excludes any founder salary or drawings [confirm with accountant]", "£168,500"],
    ["Profit before tax", "About £72,000, before any founder pay", "£171,932"]
  ], [3, 4, 4]),
  P("_The cautious case figures are our planning assumptions, not results._"),
  H2("Year 1 month by month (base case)"),
  ...table(["Month", "Perm", "Retained", "Projects", "Temp workers", "Operating costs"], [
    ["Oct 26", "0", "0", "0", "0", "£4,500"], ["Nov 26", "1", "0", "1", "0", "£5,000"], ["Dec 26", "1", "0", "1", "0", "£5,500"],
    ["Jan 27", "1", "0", "1", "0", "£7,500"], ["Feb 27", "2", "0.5", "1", "0", "£10,000"], ["Mar 27", "2", "0.5", "2", "0", "£11,500"],
    ["Apr 27", "2", "0.5", "2", "3", "£14,500"], ["May 27", "3", "0.5", "2", "6", "£17,000"], ["Jun 27", "3", "1", "2", "10", "£19,500"],
    ["Jul 27", "3", "1", "3", "14", "£22,000"], ["Aug 27", "4", "1", "3", "18", "£24,500"], ["Sep 27", "4", "1", "3", "22", "£27,000"]
  ], [2, 1, 1, 1, 2, 2]),
  H2("Temporary staffing unit economics"),
  ...table(["Per hour", "Planning figure"], [
    ["Charge rate (excluding VAT)", "£26.00"], ["Basic pay", "£14.50 (must stay at or above the National Living Wage, £12.71 for 21 and over from April 2026)"],
    ["Holiday, employer NI and pension (planning loads)", "About £3.63"], ["Other direct costs", "£0.75"], ["Loaded cost", "About £18.89"], ["Gross profit before bad debt", "About £7.11 (floor: £5.50)"]
  ], [3, 5]),
  H2("Cash: the biggest risk"),
  P("With temporary staffing we pay workers weekly but clients pay in 30 to 45 days. The model estimates a peak cash buffer of about **£85,000** at 22 workers. Before switching temporary staffing on, we will replace this estimate with a weekly 13-week cash-flow forecast and secure funding (for example invoice finance) [confirm with accountant]."),
  P("**VAT:** the cautious case passes the £90,000 VAT registration threshold in Year 1. Plan prices and cash ex VAT from the start, and monitor the rolling 12-month turnover monthly [confirm with accountant]."),

  H1("12. Risks and how we control them"),
  ...table(["Risk", "Impact", "Control"], [
    ["Not enough client wins early", "High", "Daily outreach routine; focus on manager roles; referral asks; review weekly"],
    ["Candidate unsuitable or unsafe", "Critical", "Role-based checks, verified references, honest client briefing, fast escalation"],
    ["Unpaid invoices", "High", "Signed terms first, 14-day payment, credit checks for larger clients, chase at day 15"],
    ["Data breach", "High", "Minimum data, secure sign-in, restricted folders, breach plan, training"],
    ["Discrimination claim", "High", "Fair criteria, structured interviews, adjustments, challenge unlawful client requests"],
    ["Cash squeeze from temporary staffing", "Critical", "Go Live Gate, funding in place, caps on workers per client, stop-supply rule"],
    ["Founder overload", "High", "Permanent-first, simple systems, clear weekly limits, hire when triggers hit"],
    ["Law changes", "Medium", "Quarterly check of GOV.UK, ICO, Fair Work Agency and HMRC guidance"]
  ], [3, 1.6, 5.4]),

  H1("13. First 90 days"),
  ...table(["When", "Focus", "Done when"], [
    ["Days 1 to 14", "Terms reviewed by solicitor, insurance in place, ICO fee, privacy notice live, CRM set up, first 100 target providers, candidate pack ready", "We can lawfully introduce candidates"],
    ["Days 15 to 30", "Outreach, discovery meetings, first genuine vacancies, candidate registrations, first shortlists", "At least 3 qualified clients or vacancies"],
    ["Days 31 to 60", "First placements, track conversion, refine pitch and pricing, file audit", "First fee earned and clean audit"],
    ["Days 61 to 90", "Repeat clients, management report, decide on recruiter capacity, start temporary readiness project (not switched on)", "A repeat client and a stable pipeline"]
  ], [2, 6, 3]),
  H2("First 30 days: activity targets"),
  ...table(["Target", "Goal"], [
    ["Local providers in the CRM", "150"], ["Decision-makers mapped", "250"], ["Candidate conversations", "100"], ["Candidate interviews", "40"],
    ["Temporary candidates pre-screened (not supplied)", "20 to 30"], ["Client calls", "100"], ["Client meetings", "10"], ["Signed client terms", "3 to 5"],
    ["Live permanent roles", "3 to 8"], ["First permanent placement", "1"], ["Temporary pilot", "Not in the first 30 days; only after the Go Live Gate"]
  ], [4, 3]),
  P("Track these in the Action Plan and Reports pages of Haverton Operations."),
  H2("Twelve-month milestones"),
  ...table(["Month", "Business goal", "Operations goal"], [
    ["1 to 3", "First vacancies and placements", "Terms, insurance, privacy, CRM, first audit"],
    ["4 to 6", "Repeat clients; introduce retained search", "Temporary readiness design; 13-week cash model"],
    ["7 to 8", "Small temporary pilot only if every gate is green", "Audit after first payroll and invoice cycle"],
    ["9 to 12", "Multi-site clients; plan Year 2", "Pricing and margin review; full compliance audit"]
  ], [2, 4, 4]),

  H1("14. How we measure success"),
  ...table(["Measure", "Target"], [
    ["Qualified client meetings", "3 a week"], ["New client terms signed", "1 to 2 a month at first"], ["CV to interview", "Investigate if below 20%"],
    ["Offer to start", "Above 80%"], ["Still in post at 12 weeks", "Above 85%"], ["Debtor days", "30 or fewer"], ["Largest client share of gross profit", "25% or less"],
    ["Submissions without consent", "Zero"], ["Critical audit failures unresolved", "Zero"]
  ], [4, 3]),
  P("We review commercial numbers weekly, quality and compliance monthly, and strategy quarterly. The Reports page in the operations system shows these live."),

  H1("15. Decisions only the Director makes"),
  ...bullets([
    "Discounting a fee below the standard band (written reason).",
    "Accepting temporary work below the £5.50 gross profit per hour floor (written reason and cash impact).",
    "Switching on temporary staffing (all gates green).",
    "Raising a client’s credit limit.",
    "Using an umbrella company (only after tax advice and checks).",
    "Closing a safeguarding concern."
  ]),
  H1("16. Sources to check"),
  ...table(["Topic", "Where"], [
    ["Agency rules and the Fair Work Agency", "gov.uk: Conduct Regulations 2003 guidance for employment agencies and employment businesses"],
    ["Right to work", "gov.uk: right to work checks employer’s guide"],
    ["Data protection in recruitment", "ico.org.uk: employment, recruitment and selection"],
    ["Discrimination in recruitment", "acas.org.uk: recruitment"],
    ["Minimum wage, National Insurance, VAT", "gov.uk: rates and thresholds for employers; register for VAT"],
    ["Care workforce data", "skillsforcare.org.uk: State of the Adult Social Care Sector and Workforce in England"]
  ], [3, 5]),
  P("_Checked against the Haverton Recruitment Master Operating System v2.0 (21 September 2026). Review this plan every quarter._")
], { title: "Haverton Recruitment Business Plan", footer: "Confidential | Version 1.1 | September 2026" })];
