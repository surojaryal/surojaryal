const { P, H1, H2, bullets, numbered, table, box, titleBlock, build } = require("./lib");
const WHO = "**Haverton Care Limited, trading as Haverton Recruitment And Staffing. Permanent work. We act as an employment agency.**";
const APPLY = (subject) => [H2("How to apply"),
  P(`Register and upload your CV in 3 minutes at **operation.havertoncare.co.uk/apply**, or email **info@havertoncare.co.uk** with the subject line **"${subject}"**, or call **01322 879778**. We will call you back for a short chat.`),
  P("**We never charge candidates a fee.** We only send your CV to an employer after you have agreed to that specific role. Read how we use your information at operation.havertoncare.co.uk/apply/privacy.html.")];
const RTW = "You must have the right to work in the UK. Haverton does not provide visa sponsorship or immigration advice. If an employer offers sponsorship for a role, we will tell you.";
const advert = (title, lines) => [H1(title), ...lines];

module.exports = (root) => [
build(`${root}/7 Launch Kit/Job Adverts.docx`, [
  ...titleBlock("Job Adverts", "Ready-to-post adverts for your first candidate pools", [
    ["Use for", "Website, Facebook, LinkedIn, local groups, colleges and Jobcentre Plus"], ["Owner", "Suroj Aryal"], ["Status", "Use permanent adverts once Candidate Terms and the Privacy Notice are in place."]
  ]),
  H1("Rules for every advert"),
  ...table(["Rule", "Why"], [
    ["Show the **full company name** and say whether each position is **temporary or permanent**", "Legal requirement: Conduct Regulations 2003, regulation 27(1)"],
    ["Also say whether we act as an employment agency (permanent) or employment business (temporary)", "Good practice: makes our role clear to candidates"],
    ["If you show pay, also show the type of work, the location and the minimum experience or qualifications", "Legal requirement: regulation 27(3)"],
    ["Only advertise a **specific position** when you hold its details and the client's authority to fill it (a signed Vacancy Brief). Until then, use a **register with us** advert that invites people to register and does not describe vacancies", "Legal requirement: regulation 27(2). **Ask your solicitor to confirm the register-with-us wording [confirm]**"],
    ["Never charge candidates a fee", "Legal requirement: Employment Agencies Act 1973, section 6"],
    ["No age, gender, nationality or health wording, for example \"young and energetic\" or \"must be fit\". Ask for a driving licence only if the role truly needs one", "Legal requirement: Equality Act 2010"],
    ["Job boards such as Indeed and DWP Find a Job: post **real, live vacancies** only. Use register-with-us adverts on your own website and social media", "Job board posting rules [confirm each site's current rules]"]
  ], [5, 3]),
  ...box("Free places to post", [
    "**Your registration page**: operation.havertoncare.co.uk/apply (add ?src=facebook, ?src=linkedin and so on to see which channel works).", "**Your website Recruitment page** (see Recruitment Page.html in this folder).",
    "**Facebook**: your business page, and local community and care-worker job groups (check each group's rules).",
    "**LinkedIn**: personal posts and your company page. Best for Registered Manager and Deputy roles.",
    "**Indeed** and **DWP Find a Job**: free listings, for live vacancies only.",
    "**Local colleges, training providers and Jobcentre Plus** in the town where each client needs staff."
  ]),

  ...advert("Advert 1: Care Assistants and Support Workers (talent pool, permanent)", [
    P("**Register with us: Care Assistants and Support Workers looking for permanent work**", { run: { size: 26 } }),
    P(WHO),
    P("We invite caring, reliable Care Assistants and Support Workers across England to **register with us** for permanent work in adult social care, close to where they live."),
    P("**This advert is not for a specific vacancy.** When an employer gives us a real vacancy that suits you, we will tell you the employer, the pay and the hours, and we will only put you forward if you say yes."),
    H2("We would like to hear from you if you"),
    ...bullets(["have experience in care, or have strong people skills and want to start a career in care", "treat people with dignity and respect, and want to make a difference", "are reliable and can commit to a regular pattern of work", "can provide two references covering your recent work or study"]),
    H2("What we do for you"),
    ...bullets(["Match you to employers who fit your skills, location and hours", "Help you prepare for interviews", "Stay in touch after you start, at 7, 30, 60 and 90 days", "Never charge you a fee"]),
    P(RTW),
    ...APPLY("Care Assistant pool")
  ]),

  ...advert("Advert 2: Senior Care Assistants and Team Leaders (talent pool, permanent)", [
    P("**Register with us: Senior Care Assistants and Team Leaders looking for permanent work**", { run: { size: 26 } }),
    P(WHO),
    P("Are you ready for your next step? We invite experienced Senior Care Assistants and Team Leaders across England to **register with us** for permanent work. This advert is not for a specific vacancy; when an employer gives us a suitable real vacancy we will contact you, and we only share your CV with your agreement."),
    H2("Useful experience"),
    ...bullets(["Leading a shift and supporting a care team", "Safe medication administration, with competency assessments", "Writing and reviewing care plans and risk assessments", "Recognising and reporting safeguarding concerns", "A Level 2 or Level 3 Diploma in Adult Care, or working towards one (helpful, not always essential)"]),
    H2("Why register with us"),
    P("Haverton Recruitment is led by Suroj Aryal, a former CQC Registered Manager with around 15 years in adult social care, who started as a care worker. We understand the job and we will be honest with you about each employer and role."),
    P(RTW),
    ...APPLY("Senior Care Assistant pool")
  ]),

  ...advert("Advert 3: Registered Managers and Deputy Managers (confidential, permanent)", [
    P("**Registered Managers and Deputy Managers: confidential career conversations**", { run: { size: 26 } }),
    P(WHO),
    P("If you are a Registered Manager or Deputy Manager in adult social care, or ready to step up, we would like to talk to you in confidence. Register with us for permanent opportunities with care providers across England. This advert is not for a specific vacancy."),
    H2("What to expect"),
    ...bullets(["A confidential conversation with a former CQC Registered Manager who understands the role", "Honest information about each provider before you decide", "Your details are never shared without your agreement to the specific role", "No fee, ever"]),
    H2("Helpful background"),
    ...bullets(["Experience leading a regulated service or deputising for a Registered Manager", "A Level 5 Diploma in Leadership and Management for Adult Care, or working towards it (helpful, not always essential)", "Experience with audits, safeguarding, staff supervision and CQC assessments"]),
    ...APPLY("Manager confidential")
  ]),

  ...advert("Advert 4: Live vacancy template (use only when a client gives you a real vacancy)", [
    P("Fill every square-bracket item from the signed **Client Vacancy Brief**. Do not name the client without their permission.", { run: { italics: true } }),
    P("**[Job title]: [Permanent, full time or part time], [Town], £[salary or hourly rate]**", { run: { size: 26 } }),
    P(WHO),
    P("Our client, a [CQC-registered care home / nursing home / home care provider] in [town], is looking for a [job title] to join their team."),
    H2("The role"),
    ...bullets(["Hours: [hours and shift pattern, including nights or weekends]", "Pay: £[amount] [per hour / per year], plus [only benefits the client has confirmed]", "Location: [town or area]", "Main duties: [3 to 5 duties from the brief]"]),
    H2("You will need"),
    ...bullets(["[Minimum experience]", "[Qualification, if genuinely required]", "[Driving licence and car, only if the role needs travel between visits]", "An enhanced DBS check (arranged as part of the process) [confirm who arranges and pays]", "Two satisfactory references"]),
    P(RTW),
    ...APPLY("[Job title] [Town]")
  ]),

  ...advert("Advert 5: Temporary work (register your interest only)", [
    P("**Temporary care work coming soon: register your interest**", { run: { size: 26 } }),
    P("**Haverton Care Limited, trading as Haverton Recruitment And Staffing. Temporary work (not yet available). We will act as an employment business.**"),
    P("We are preparing to offer temporary work to Care Assistants, Senior Care Assistants and Support Workers starting in Kent and South East London. **We are not offering shifts yet and there are no vacancies at this stage.** If you would like to hear when we open, send us your name, phone number, the role you do and the areas you can travel to."),
    P("We will not ask for your documents until we are ready to offer work, and we will never charge you a fee."),
    ...APPLY("Temporary interest")
  ]),

  ...advert("Short social media versions", [
    ...table(["Use for", "Post text"], [
      ["Care Assistants (Facebook)", "Care Assistants and Support Workers across England looking for permanent work: register with us. This is not a specific vacancy; when an employer gives us a real role that fits, we will tell you, and we only share your CV with your OK. No fees, ever. Register in 3 minutes: operation.havertoncare.co.uk/apply/?src=facebook. Haverton Care Limited (Haverton Recruitment And Staffing), permanent work, employment agency."],
      ["Managers (LinkedIn)", "Registered Managers and Deputy Managers across England: if you would value a confidential conversation about your next step with someone who has done the job, message me or register confidentially at operation.havertoncare.co.uk/apply/?src=linkedin. This is not a specific vacancy; nothing is shared without your agreement. Haverton Care Limited (Haverton Recruitment And Staffing), permanent work, employment agency."],
      ["Temporary (Facebook)", "Temporary care work is coming soon. Haverton Recruitment And Staffing is preparing to offer temporary work, starting in Kent and South East London. We are not offering shifts yet; register at operation.havertoncare.co.uk/apply/?src=facebook to be told first. Haverton Care Limited (Haverton Recruitment And Staffing), temporary work, employment business."]
    ], [2, 7])
  ])
], { footer: "Job Adverts | Version 1.0 | September 2026" })
];
