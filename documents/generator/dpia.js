const { P, H1, bullets, table, box, titleBlock, build } = require("./lib");
module.exports = (root) => [
build(`${root}/3 Legal/CV Database Risk Assessment.docx`, [
  ...titleBlock("CV Database Risk Assessment", "Data protection impact assessment (DPIA) for the online registration form and CV database", [
    ["Controller", "Haverton Care Limited (17025493)"], ["Owner", "Suroj Aryal, Director"], ["Date", "September 2026"], ["Review", "Every 12 months, or before any change to the form, storage or suppliers"]
  ]),
  ...box("Is a DPIA required?", "The ICO expects one where processing is likely to be high risk. Collecting CVs at scale through a public form may involve special category data that candidates choose to include, so completing one is **good practice and a sensible precaution** [confirm with your data protection adviser]. It also answers questions a client or the ICO may ask."),
  H1("1. What we do"),
  ...table(["Item", "Detail"], [
    ["Purpose", "Let candidates register for adult social care jobs and upload a CV, so we can match them to vacancies from CQC-registered clients."],
    ["Data collected", "Name, email, phone, postcode, role wanted, availability, travel, experience, qualifications and skills (tick boxes), right to work answer (yes, no or not sure), optional free text, optional CV, how they heard about us, job alert consent."],
    ["Not collected", "Health details, bank details, DBS certificates, date of birth, nationality, identity documents. The form asks candidates not to include health information."],
    ["Lawful basis", "Article 6(1)(b) steps at the candidate's request before a contract, and 6(1)(f) legitimate interests. Job alerts by email: consent. See Recruitment Privacy Notice v1.1."],
    ["Special category data", "Not requested. It may appear in CVs or free text. We do not use it for selection, and delete or ignore it where it is not needed."],
    ["Where it is stored", "Supabase (London, UK): applications table and a private storage bucket for CVs. Operations site hosted on GitHub Pages holds only encrypted content and the public form."],
    ["Who can access", "Only people listed in the members allowlist (currently the Director), after signing in. The public form can only add an application; it cannot read, change or delete anything."],
    ["Retention", "Applications not added to Candidates: reviewed and deleted within 2 years of last contact (the CRM flags them). Candidate records follow the Data Protection Record retention schedule."]
  ], [2, 6]),
  H1("2. Risks and controls"),
  ...table(["Risk", "Likelihood / impact before controls", "Controls in place", "Remaining risk"], [
    ["Unauthorised access to CVs", "Possible / High", "Private bucket; member-only read policy; signed links that expire after 5 minutes; strong password; database rules tested before launch", "Low"],
    ["Public form abused (spam, floods, malicious files)", "Likely / Medium", "Hidden spam field; 3 per email per day and 100 per hour limits; PDF and Word only, 5 MB maximum; random file names; files never run by the system", "Low"],
    ["Excessive or special category data in CVs", "Likely / Medium", "Form tells candidates not to include health data; no health, DBS or bank questions; review note to record removal", "Low to medium"],
    ["Keeping data too long", "Possible / Medium", "2-year retention review banner in the CRM; one-click delete of application and CV", "Low"],
    ["Candidate not informed", "Unlikely / Medium", "Privacy notice linked and must be ticked before submitting; version recorded with each application", "Low"],
    ["CV sent to a client without agreement", "Possible / High", "CRM requires Consent To Represent before a submission can move beyond Draft", "Low"],
    ["Supplier (processor) failure or breach", "Unlikely / High", "Supabase data processing agreement accepted [confirm done]; UK region; breach procedure below", "Low to medium"]
  ], [2.5, 1.6, 4, 1.3]),
  H1("3. Actions"),
  ...table(["Action", "Status"], [
    ["Accept the Supabase data processing agreement (organisation settings, legal documents)", "☐"],
    ["Have the solicitor confirm the privacy notice wording, then update the version on the form if it changes", "☐"],
    ["Check the CV Database page weekly: contact new applicants within 3 working days", "☐"],
    ["Every quarter: delete applications past the retention period", "☐"],
    ["If a breach is suspected: contain it, record it, assess risk, and report to the ICO within 72 hours where required; tell affected people without undue delay if high risk", "Procedure"]
  ], [7, 1.2]),
  H1("4. Decision"),
  P("With the controls above, the remaining risk is low to medium and the processing can go ahead. Signed: ______________________ (Director)   Date: ____________")
], { footer: "CV Database Risk Assessment | Version 1.0 | September 2026" })
];
