const { P, H1, H2, bullets, numbered, table, box, titleBlock, build } = require("./lib");
const REG = "operation.havertoncare.co.uk/apply/?src=";
const LEGAL_C = "Haverton Recruitment And Staffing (Haverton Care Limited). Candidate register, not a specific vacancy. Employment agency.";
const LEGAL_P = "Haverton Recruitment And Staffing is a trading name of Haverton Care Limited, company number 17025493. Employment agency.";
const posts = [
 ["Tue 29 Sep", "Welcome (pin this)", "Haverton Recruitment Square Post 2.png", "All",
  `💛 Care careers across England.\nHaverton Recruitment And Staffing is building its register of Managers, Nurses, Senior Carers and Care and Support Workers for roles with CQC-registered care providers.\n✅ Free for candidates ✅ Your CV shared only with your permission\n👉 Join our register: ${REG}facebook`,
  `We are delighted to launch Haverton Recruitment And Staffing: specialist recruitment for adult social care across England.\nWe connect Managers, Nurses, Senior Carers and Care and Support Workers with CQC-registered care homes, nursing homes, home care and supported living services.\nFree for candidates. CV shared only with permission.\nJoin our register: ${REG}linkedin`],
 ["Thu 1 Oct", "5 qualities of a great carer", "Post 01 Five Qualities.png", "Candidates",
  `What makes a great carer? 💛\n1. Kindness in small moments\n2. Respect for dignity and choice\n3. Reliability\n4. Speaking up when something is not right\n5. Always learning\nSound like you? Join our register: ${REG}facebook\nTag a carer who has all five 👇`,
  `The best care professionals share five qualities: kindness, respect for dignity and choice, reliability, the courage to speak up, and a commitment to learning.\nThese are the values we look for in every candidate we register.\nJoin our register: ${REG}linkedin`],
 ["Tue 6 Oct", "Registered and Deputy Managers", "Post 02 Managers.png", "Managers",
  `Registered Manager or Deputy Manager thinking about your next step? 🏡\nConfidential conversations, honest information about each service, and your details shared only with your permission.\nRegister in confidence: ${REG}facebook`,
  `Registered Managers and Deputy Managers: good leadership is the single biggest factor in a well-run care service.\nIf you are considering your next role, we offer confidential conversations, honest information about each provider, and we never share your details without your agreement.\nRegister in confidence: ${REG}linkedin`],
 ["Thu 8 Oct", "Interview tips", "Post 03 Interview Tips.png", "Candidates",
  `Got a care interview coming up? 📝 Save these 5 tips:\n• Share a real example of person-centred care\n• Explain how you protect dignity and privacy\n• Know how to raise a safeguarding concern\n• Ask about induction and support\n• Be yourself: values matter most\nLooking for your next role? ${REG}facebook`,
  `Five things that help candidates stand out in a care interview: a real example of person-centred care, how they protect dignity, how they would raise a safeguarding concern, good questions about induction and support, and genuine values.\nShare this with someone preparing for an interview.\nJoin our register: ${REG}linkedin`],
 ["Tue 13 Oct", "Safer recruitment (for providers)", "Post 04 Safer Recruitment.png", "Care providers",
  `For care providers: safer recruitment is more than a DBS check.\nEvery candidate we introduce has a full work history with gaps explained, two references from non-relatives, checked qualifications, a values-based interview, and has agreed to be put forward.\nFilling a key role? Message us or email info@havertoncare.co.uk`,
  `Safer recruitment is more than a DBS check.\nBefore we introduce any candidate for work with vulnerable people, we check full work history and gaps, obtain two references from non-relatives, verify qualifications and registration, carry out a values-based interview, and confirm the candidate's consent.\nIf you are recruiting for a Registered Manager, Deputy, Nurse or senior care role anywhere in England, let's talk: info@havertoncare.co.uk | 01322 879778`],
 ["Thu 15 Oct", "Nurses", "Post 05 Nurses.png", "Nurses",
  `Registered Nurses (RGN and RMN) 🩺\nPermanent roles in nursing homes and care services across England, close to where you live. Clear information on pay, shifts and support. Free for candidates.\nJoin our register: ${REG}facebook`,
  `Registered Nurses (RGN and RMN): nursing in adult social care offers continuity, relationships and real clinical leadership.\nWe are registering nurses for permanent roles with CQC-registered nursing homes and care services across England.\nJoin our register: ${REG}linkedin`],
 ["Tue 20 Oct", "Your CV, your choice", "Post 06 Your CV Your Choice.png", "Candidates",
  `Your CV. Your choice. 🔒\nWe never send your CV without your permission, we tell you the employer, pay and hours first, and we never charge candidates a fee.\nRecruitment built on trust: ${REG}facebook`,
  `Candidates should always know where their CV goes. Our promise: no CV is sent without permission, candidates hear the employer, pay and hours first, and we never charge candidates a fee.\nJoin our register: ${REG}linkedin`],
 ["Thu 22 Oct", "Temporary work coming soon + providers", "Post 07 Temporary Soon.png / Post 08 Providers.png", "Candidates / Providers",
  `Temporary care work is coming soon ⏳\nStarting in Kent and South East London for Care Assistants, Senior Carers, Support Workers and Healthcare Assistants. Not available yet: register now and choose "Temporary when available" to hear first.\n${REG}facebook`,
  `Care providers: struggling to fill a Registered Manager, Deputy, Nurse or senior care role? Haverton Recruitment And Staffing supports CQC-registered providers across England, and you pay only when you hire.\ninfo@havertoncare.co.uk | 01322 879778`]
];
module.exports = (root) => [
build(`${root}/9 Social Media/Social Media Plan.docx`, [
  ...titleBlock("Social Media Plan", "Haverton Recruitment And Staffing: first 4 weeks on Facebook, LinkedIn and Instagram", [
    ["Goal", "Registrations in the CV Database (candidates) and enquiries from care providers. Likes and followers only matter if they lead to these."],
    ["Time needed", "About 1 hour a week: schedule posts on Monday, reply to comments daily (5 minutes)"],
    ["Images", "All in this folder: Post 01 to Post 08, plus Square Post 2"]
  ]),
  H1("1. Make both pages work harder (do once)"),
  ...table(["Area", "Facebook", "LinkedIn"], [
    ["Button", "Sign up button linking to " + REG + "facebook", "Custom button (Visit website) linking to " + REG + "linkedin"],
    ["Pinned or featured", "Pin the welcome post", "Feature the welcome post"],
    ["About", "Bio, website, email, phone, service area England, no address", "Tagline, description with company details, industry Staffing and Recruiting"],
    ["Messages", "Instant reply and 3 FAQs switched on", "Turn on page messaging"],
    ["Consistency", "Same logo, name and colours everywhere", "Same"],
    ["Legal", "Company details in the pinned post", "Company details in the description"],
    ["Security", "Two-factor authentication and a backup admin", "Add a second super admin"]
  ], [2, 4, 4]),
  H1("2. The 4-week calendar"),
  P("Post at about **7pm** on Facebook and Instagram (when care staff are off shift) and **8am or 12pm** on LinkedIn [professional judgement: test and compare]. Use the same image on every platform."),
  ...table(["Date", "Post", "Image", "Audience"], posts.map(p => [p[0], p[1], p[2], p[3]]), [1.3, 2.6, 3.2, 1.6]),
  H1("3. Captions ready to copy"),
  P("**Facebook** uses the first caption. **Instagram** uses the same caption, but replace the link with \"Link in bio\" and add hashtags. **LinkedIn** uses the second caption. Always add the small legal line at the end."),
  ...posts.flatMap((p, i) => [
    H2(`${i + 1}. ${p[0]}: ${p[1]}`),
    P("**Facebook / Instagram**"), ...p[4].split("\n").map(l => P(l)), P(`_${/provider/i.test(p[3]) && i === 4 ? LEGAL_P : LEGAL_C}_`),
    P("**LinkedIn**"), ...p[5].split("\n").map(l => P(l)), P(`_${/Providers/.test(p[3]) || i === 4 ? LEGAL_P : LEGAL_C}_`)
  ]),
  P("**Hashtags (Instagram, and 3 to 5 on LinkedIn):** #CareJobs #NursingJobs #CareCareers #SocialCare #RegisteredManager #CareWorkers #SupportWorker #SeniorCarer #UKJobs #AdultSocialCare"),
  H1("4. Growing reach for free"),
  ...bullets([
    "**Facebook groups:** join 10 care-job groups across England as the page (use \"Posting as\"). Share one post a week in 3 or 4 of them. Follow each group's rules.",
    "**Reply fast:** answer every comment and message within a few hours. Fast replies are a strong signal to Facebook and LinkedIn.",
    "**Ask for shares:** \"Tag a carer who…\" posts spread furthest on Facebook.",
    "**LinkedIn:** follow and comment helpfully on posts by Skills for Care, care associations and care providers, as the page.",
    "**Email signature:** add \"Join our care register: operation.havertoncare.co.uk/apply\" to every email."
  ]),
  H1("5. Paid boosting (optional, from week 3)"),
  ...box("Legal and platform rule", "Adverts about jobs on Facebook and Instagram must use Meta's **Employment** special ad category. It blocks targeting by age, gender and postcode, so target by location (England or regions) and interests only. This protects against discrimination under the Equality Act 2010."),
  ...table(["Step", "Detail"], [
    ["What to boost", "The best-performing post from weeks 1 and 2 (most link clicks, not likes)"],
    ["Budget", "£5 a day for 5 days (£25). Stop if a registration costs more than about £10 [estimate: review after the first test]"],
    ["Audience", "England, broad; interests such as caregiving, nursing, health care"],
    ["Measure", "Count new registrations marked \"facebook\" in the CV Database during the boost"]
  ], [2, 6]),
  P("LinkedIn adverts are much more expensive; use them later for Registered Manager searches with a signed client."),
  H1("6. What to measure every Friday (5 minutes)"),
  ...table(["Measure", "Where", "Week 4 target [estimate]"], [
    ["New registrations by source", "CRM, CV Database (Heard about us: facebook, linkedin, instagram)", "10 to 20 in total"],
    ["Provider enquiries from social", "Inbox and CRM Clients", "1 to 2"],
    ["Link clicks per post", "Meta Business Suite, LinkedIn analytics", "Rising week on week"],
    ["Followers", "Each page", "Only as a secondary signal"]
  ], [3, 4, 2]),
  ...box("Rules for every post", ["No fake vacancies: until a client gives you a real vacancy, posts invite people to join the register.", "Never post photos of real people receiving care, or anything that identifies them.", "Never promise jobs, pay or visa sponsorship. Never charge candidates.", "Keep the legal line on every recruitment post."])
], { footer: "Social Media Plan | Version 1.0 | September 2026" })
];
