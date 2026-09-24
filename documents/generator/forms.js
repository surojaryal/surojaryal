const { P, H1, H2, bullets, table, form, box, titleBlock, build } = require("./lib");
const F = "Form | Version 1.1 | September 2026";
const tick = opts => opts.map(o => "☐ " + o).join("    ");

module.exports = (root) => [

build(`${root}/4 Forms/Candidate Registration Form.docx`, [
  ...titleBlock("Candidate Registration Form", "For people looking for permanent work in adult social care"),
  ...box("Please note", ["It is free to register. We never charge candidates a fee.", "Only give us what we ask for here. Please **do not** send passport scans, DBS certificates, medical details or bank details at this stage."]),
  H1("About you"),
  ...form(["Full name", "Preferred name", "Email", "Mobile", "Postcode (for travel planning)", "How did you hear about us?"]),
  H1("The work you want"),
  ...form([["Roles you are interested in", tick(["Care Assistant", "Senior Carer", "Team Leader", "Deputy Manager", "Registered Manager", "Other"])],
    ["Type of service", tick(["Care home", "Nursing home", "Home care", "Supported living", "Any"])],
    "Areas you can work in", ["How you travel", tick(["Own car", "Public transport", "Other"])], "Hours and shifts you can do", "Earliest start date", "Current or expected pay"]),
  H1("Your experience"),
  ...form(["Current or last employer and role", "Years in care", "Qualifications (for example Care Certificate, Level 3, Level 5)", ["Professional registration (if any)", "Body and number:"], "Anything you want us to know about your experience"]),
  H1("Checks we may need later"),
  P("Depending on the role, we will ask you later for identity and right to work evidence, a full work history including any gaps, references, and for some roles a DBS check. We will explain exactly what is needed before any of it is collected."),
  ...form([["Do you need any adjustments for interviews or assessments?", "☐ No   ☐ Yes (please tell us what would help)"]]),
  H1("Agreement"),
  ...form([["I have read the Candidate Terms and the Recruitment Privacy Notice", "☐ Yes"], ["We may keep in touch about suitable future roles", "☐ Yes   ☐ No"], ["Signature", ""], ["Date", ""]]),
  P("_Office use: Candidate ID ______   Entered in system by ______   Date ______ _")
], { footer: F }),

build(`${root}/4 Forms/Consent To Represent Form.docx`, [
  ...titleBlock("Consent To Represent", "Your permission before we send your details to an employer"),
  P("We will only send your CV or other details that identify you to an employer after you agree, for the specific role below. Please read the role details and confirm."),
  H1("The role"),
  ...form(["Employer (organisation name)", "Job title", "Location", "Hours and shift pattern", "Salary or pay rate", "Start date (if known)", "Vacancy reference"]),
  H1("Your confirmation"),
  ...form([["I understand the role details above", "☐ Yes"], ["I agree Haverton Recruitment may send my CV and details to this employer for this role only", "☐ Yes"],
    ["I have not already applied, or been put forward by another agency, to this employer for this role", "☐ Correct   ☐ Not correct (please explain)"],
    ["Candidate name", ""], ["Signature, or confirmation by email or recorded call", ""], ["Date and time", ""]]),
  P("You can withdraw your consent at any time before the employer makes a decision, by contacting us."),
  P("_Office use: Submission ID ______   Recorded in system (Consent Confirmed = Yes) by ______   Date ______ _")
], { footer: F }),

build(`${root}/4 Forms/Client Vacancy Brief.docx`, [
  ...titleBlock("Client Vacancy Brief", "What we need to know before we search (Conduct Regulations, regulation 18)"),
  H1("The client"),
  ...form(["Organisation (legal name)", "Service name and type", "CQC location ID (if relevant) and current rating", "Hiring manager and contact details", "Who makes the final decision?", ["Terms of business signed?", "☐ Yes   ☐ No (do not start until signed)"]]),
  H1("The role"),
  ...form(["Job title", "Why is the role open? (growth, leaver, new service, performance)", "Main duties", "Location and travel", "Hours, shifts, on-call", "Salary, benefits and any guaranteed payments", ["Permanent or fixed term", tick(["Permanent", "Fixed term (length)"])], "Ideal start date", "Reporting line and team size"]),
  H1("What the person must have"),
  ...form(["Essential experience", "Essential qualifications or registration (required by law or a professional body)", "Checks needed (DBS level, right to work, driving)", "Nice to have (not essential)", "What must they achieve in the first 90 days?", "Why did the last person leave? What will make someone stay?"]),
  ...box("Fair recruitment check", "Essential criteria must be genuinely needed for the job. We cannot select by age, sex, race, religion, disability or any other protected characteristic unless a lawful exception applies and is written down."),
  H1("Safety and working with vulnerable people"),
  ...form(["Does the role involve working with vulnerable adults or children?", "Known health and safety risks", "Induction arrangements"]),
  H1("Process and fee"),
  ...form(["Interview stages and dates", "Other agencies already involved", ["Fee band agreed", tick(["12.5%", "15%", "17.5%", "20% or retained"])], "Next action and date"])
], { footer: F }),

build(`${root}/4 Forms/Interview Scoring Sheet.docx`, [
  ...titleBlock("Interview Scoring Sheet", "Same questions, same scoring, for every candidate for a role"),
  ...form(["Candidate", "Role and client", "Interviewer", "Date"]),
  P("**Scoring:** 1 = no evidence, 2 = limited, 3 = good, 4 = strong. Score the example the candidate gives, not how confident they sound."),
  ...table(["Question", "What good looks like", "Score", "Notes"], [
    ["Tell me about a time you noticed something was not right with a person you supported. What did you do?", "Spotted change, acted quickly, reported through the right route, recorded it", "", ""],
    ["How do you protect someone’s dignity during personal care?", "Consent, privacy, choice, talks to the person, respects their routine", "", ""],
    ["A colleague asks you to sign for medication you did not give. What do you do?", "Refuses, explains why, escalates, follows policy", "", ""],
    ["Describe a mistake you made at work and what you learned.", "Honest, took responsibility, changed practice", "", ""],
    ["How do you support someone who refuses care?", "Respects choice, explores reasons, considers capacity, records, escalates if at risk", "", ""],
    ["Why this role, and why now?", "Realistic, values-led, understands the service", "", ""],
    ["**Managers only:** How have you improved a service after a poor audit or inspection?", "Clear plan, involved staff, measured results, governance", "", ""],
    ["**Managers only:** How do you keep staffing safe when people call in sick?", "Planning, escalation, never compromises safety, records decisions", "", ""]
  ], [4, 4, 1.3, 2.7]),
  ...form([["Total score", ""], ["Recommendation", tick(["Put forward", "Hold", "Not suitable"])], ["Reason (based on the criteria, not personal opinion)", ""]]),
  P("_Do not record anything about protected characteristics. Keep this sheet with the candidate file._")
], { footer: F }),

build(`${root}/4 Forms/Reference Request.docx`, [
  ...titleBlock("Reference Request", "Employment reference for a care role"),
  P("Dear Referee,"),
  P("The person named below has applied for a role in adult social care and has given your details as a referee. Because the role involves working with vulnerable people, we must seek references from people who are not relatives of the candidate. We would be grateful if you could complete this form. The candidate has consented to this request."),
  ...form(["Candidate name", "Role applied for", "Your name and job title", "Organisation", "Your relationship to the candidate"]),
  H1("Employment details"),
  ...form(["Dates employed (from and to)", "Job title(s)", "Reason for leaving (if known)", ["Would you re-employ this person?", "☐ Yes   ☐ No   ☐ Prefer to explain below"]]),
  H1("Suitability"),
  ...form([["Are you aware of any safeguarding concerns, disciplinary action or investigation relating to the candidate’s work with vulnerable people?", "☐ No   ☐ Yes (please give details or call us)"],
    "How would you describe their reliability, attitude to people they support, and teamwork?", "Anything else we should know?"]),
  ...form(["Signature", "Date", "Work email and phone (so we can verify this reference)"]),
  P("Thank you. Please return this to info@havertoncare.co.uk. We will handle the information in line with our Recruitment Privacy Notice."),
  P("_Office use: request sent to independently verified business contact? ☐ Yes   Verified by phone ☐   Date ______ _")
], { footer: F }),

build(`${root}/4 Forms/Placement Check In Record.docx`, [
  ...titleBlock("Placement Check In Record", "Day 7, day 30, day 60 and day 90 calls with the candidate and the client"),
  ...form(["Candidate", "Client and role", "Start date", "Placement ID"]),
  ...table(["Check in", "Candidate says", "Client says", "Action and date"], [
    ["Day 7 (induction, first shifts, anything worrying?)", "", "", ""],
    ["Day 30 (settling in, training, team fit)", "", "", ""],
    ["Day 60 (confidence, supervision, any concerns)", "", "", ""],
    ["Day 90 (staying? end of guarantee; referral ask)", "", "", ""]
  ], [2, 3, 3, 2]),
  ...form([["Still in post at 90 days?", "☐ Yes   ☐ No"], "If no: reason (for learning, not blame)", ["Referral asked?", "☐ Yes"], ["Testimonial asked, with written consent to use it?", "☐ Yes"]]),
  ...box("If a safety concern comes up", "Record the facts, act at once, tell the Director, and make sure the client’s safeguarding process is followed. Never promise to keep a safeguarding concern secret.")
], { footer: F })
];
