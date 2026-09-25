const { P, H1, H2, bullets, table, box, titleBlock, build } = require("./lib");
const LI_ABOUT = [
"Haverton Recruitment And Staffing is a specialist recruitment agency for adult social care, supporting CQC-registered care homes, nursing homes, home care and supported living providers across England.",
"Care recruitment is all we do. We understand what makes a care service safe, well-led and person-centred, and we recruit with that in mind: not just matching CVs to job titles.",
"FOR CARE PROVIDERS",
"We recruit Registered and Deputy Managers, Home Managers, Clinical Leads, Registered Nurses, Care Coordinators, Field Care Supervisors, Team Leaders, Senior Care Assistants, Care Assistants and Support Workers. Every candidate we introduce for work with vulnerable people has a full work history with gaps explained, two references from non-relatives, checked qualifications and registration, a values-based interview, and has agreed to be put forward for your role. You pay only when you hire someone we introduce.",
"FOR CARE PROFESSIONALS",
"Our service is free, always. We share your CV only with your permission, for a specific role, and we tell you the employer, pay and hours before you decide. We stay in touch after you start. Join our register in three minutes: operation.havertoncare.co.uk/apply",
"OUR VALUES",
"Honesty, dignity, safety and respect: for the people receiving care, for the professionals who deliver it, and for the providers we work with.",
"Haverton Recruitment And Staffing is a trading name of Haverton Care Limited, registered in England and Wales, company number 17025493. Registered office: 128 City Road, London, EC1V 2NX. For permanent recruitment we act as an employment agency. We do not charge candidates fees and we do not provide immigration advice."
];
const len = LI_ABOUT.join("\n\n").length;
module.exports = (root) => [
build(`${root}/9 Social Media/Profile And Bio Copy.docx`, [
  ...titleBlock("Profile And Bio Copy", "Every profile field for Facebook, LinkedIn and Instagram, within each platform's limits", [
    ["Brand", "Haverton Recruitment And Staffing (a trading name of Haverton Care Limited)"],
    ["Positioning", "Specialist recruitment for adult social care across England, built on care expertise, safer recruitment and honesty"],
    ["Registration link", "operation.havertoncare.co.uk/apply (add ?src=facebook, linkedin or instagram)"]
  ]),
  H1("1. Brand foundations (use everywhere)"),
  ...table(["Element", "Wording"], [
    ["One-line promise", "Care careers across England. Specialist recruitment, done with care."],
    ["Tagline", "People who make a difference."],
    ["For candidates", "Free for candidates, always. Your CV is shared only with your permission. Honest information before you decide."],
    ["For care providers", "Carefully screened candidates who understand dignity, safety and person-centred care. You pay only when you hire."],
    ["Proof points (true and checkable)", "Care recruitment is all we do · Safer recruitment checks before every introduction · Consent before every CV · Free for candidates · Covering CQC-registered providers across England"],
    ["Tone of voice", "Warm, respectful, plain English, confident but never boastful. No jargon, no hype, no fear-selling about CQC."],
    ["Never say", "\"Guaranteed job\", \"guaranteed hire\", \"CQC approved/registered agency\", \"best agency in the UK\", \"visa sponsorship available\", invented vacancies or testimonials"]
  ], [2, 6]),
  H1("2. Facebook"),
  ...table(["Field", "Copy", "Limit"], [
    ["Page name", "Haverton Recruitment And Staffing", ""],
    ["Username", "@havertonrecruitment", ""],
    ["Categories", "Employment Agency · Recruiter", "Up to 3"],
    ["Bio (Intro)", "Specialist care recruitment across England. Managers, nurses and carers. Free for candidates.", "93 of 101"],
    ["Action button", "Sign up → operation.havertoncare.co.uk/apply/?src=facebook", ""],
    ["Website", "https://operation.havertoncare.co.uk/apply/?src=facebook", ""],
    ["Contact", "info@havertoncare.co.uk · 01322 879778 · no address · service area England", ""],
    ["Profile picture", "Haverton Recruitment Logo.png", ""],
    ["Cover photo", "Haverton Recruitment Cover Banner.png", ""],
    ["Pinned post", "Welcome post with Square Post 2 (see Social Media Plan, post 1) including the company details", ""]
  ], [2, 5, 1.3]),
  H2("Facebook services (Services tab, if shown)"),
  ...table(["Service", "Description"], [
    ["Permanent recruitment", "Managers, nurses, senior and care staff for CQC-registered providers across England. Fee payable only on hire."],
    ["Retained search", "Dedicated search for Registered Managers and senior roles, with milestones and full confidentiality."],
    ["Candidate register", "Free registration for care professionals. Your CV shared only with your permission."],
    ["Temporary staffing (coming soon)", "Not yet available. Register interest to hear first."]
  ], [2, 6]),
  H1("3. LinkedIn"),
  ...table(["Field", "Copy", "Limit"], [
    ["Page name", "Haverton Recruitment And Staffing", ""],
    ["URL", "linkedin.com/company/haverton-recruitment", ""],
    ["Tagline", "Specialist adult social care recruitment across England | Managers, nurses, senior carers | Free for candidates", "111 of 120"],
    ["Industry", "Staffing and Recruiting", ""],
    ["Size / type", "0-1 employees · Privately held", ""],
    ["Custom button", "Visit website → operation.havertoncare.co.uk/apply/?src=linkedin", ""],
    ["Logo / cover", "Haverton Recruitment Logo.png · LinkedIn Cover.png", ""]
  ], [2, 5, 1.3]),
  H2(`About (Overview), ${len} of 2,000 characters`),
  ...LI_ABOUT.map(p => /^[A-Z ]+$/.test(p) ? P(`**${p}**`) : P(p)),
  H2("Specialities (add each one)"),
  P("Adult social care recruitment · Registered Manager recruitment · Nurse recruitment · Care home recruitment · Home care recruitment · Supported living recruitment · Safer recruitment · Retained search · Care workforce · CQC-registered providers"),
  H1("4. Instagram"),
  ...table(["Field", "Copy", "Limit"], [
    ["Username", "@havertonrecruitment (or @havertonrecruitment.uk)", "30"],
    ["Name (searchable)", "Haverton Recruitment Care Jobs", "30 of 30"],
    ["Category", "Employment Agency", ""],
    ["Bio", "Care careers across England 💛 / Managers · Nurses · Senior Carers · Support Workers / Free for candidates · Your CV, your choice / 👇 Join our register", "144 of 150"],
    ["Link in bio", "operation.havertoncare.co.uk/apply/?src=instagram (title: Join our register)", ""],
    ["Contact buttons", "Email info@havertoncare.co.uk · Call 01322 879778", ""],
    ["Profile picture", "Haverton Recruitment Logo.png", ""]
  ], [2, 5, 1.3]),
  P("The name field is searchable on Instagram, which is why it includes \"Care Jobs\". Write the bio as four separate lines (the slashes above show the line breaks)."),
  H2("Story highlights (covers in this folder)"),
  ...table(["Highlight", "What to save in it"], [
    ["Register", "How to join the register in 3 minutes, and the link"],
    ["Roles", "Managers, Nurses, Senior Carers, Support Workers spotlights"],
    ["Tips", "Interview tips, CV tips, career advice"],
    ["Providers", "Safer recruitment, how we work, fees in principle"],
    ["FAQ", "Free for candidates? Temporary work? Where do you cover?"]
  ], [2, 6]),
  H1("5. Message and comment replies (copy and paste)"),
  ...table(["Situation", "Reply"], [
    ["\"Do you have jobs?\"", "Thanks for your interest! We're building our register of care professionals across England. Join here and we'll contact you when a role suits you: operation.havertoncare.co.uk/apply"],
    ["\"Do you charge?\"", "Never. Our service is always free for candidates."],
    ["\"Do you sponsor visas?\"", "We don't provide visa sponsorship or immigration advice. If an employer offers sponsorship for a role, we'll tell you."],
    ["\"Temporary shifts?\"", "Temporary work is coming soon, starting in Kent and South East London. Register and choose \"Temporary when available\" to hear first."],
    ["Care provider enquiry", "Thank you for getting in touch. We'd be glad to help. Could you share the role, location and a good time to call? Or email info@havertoncare.co.uk."],
    ["Someone shares personal details publicly", "Thanks! To protect your privacy, please don't share personal details here. Send us a private message instead. (Then hide the comment.)"],
    ["Complaint or negative comment", "We're sorry to hear this and want to put it right. Please message us or email info@havertoncare.co.uk so we can look into it properly."]
  ], [2.2, 6]),
  ...box("Final check before going live", ["Same logo, name and link on all three platforms.", "Company details (Haverton Care Limited, 17025493) in the pinned post (Facebook), About (LinkedIn) and a highlight (Instagram).", "Two-factor security and a backup admin on every account.", "Never describe the recruitment business as CQC registered, and never post photos of real people receiving care."])
], { footer: "Profile And Bio Copy | Version 1.0 | September 2026" })
];
