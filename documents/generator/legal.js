const L = require("./lib");
const { P, H1, H2, H3, bullets, clauses, table, box, sign, titleBlock, build, DRAFT_LEGAL } = L;
const CO = "Haverton Care Limited, a company registered in England and Wales with company number 17025493, whose registered office is at 128 City Road, London, EC1V 2NX, trading as Haverton Recruitment And Staffing";
const LEGAL_FOOTER = "Draft for solicitor review | Version 1.0 | September 2026";

module.exports = (root) => [

/* ---------------------------------------------------------------- CLIENT TERMS */
build(`${root}/3 Legal/Client Terms Of Business.docx`, [
  ...titleBlock("Client Terms Of Business", "Permanent recruitment and retained search", [
    ["Who these terms are for", "Care providers and other organisations that ask us to find permanent staff"],
    ["Our role", "Employment agency (we introduce candidates; you employ them)"],
    ["Version", "1.0, September 2026"]
  ]),
  ...box("Before you use this document", DRAFT_LEGAL),
  H1("Terms at a glance"),
  P("This page is a quick summary. The full terms that follow are the ones that count."),
  ...table(["Topic", "In short"], [
    ["What we do", "We find, screen and introduce candidates for your permanent vacancies. You decide whether to employ them."],
    ["When you pay", "Only if you employ or engage someone we introduced, within 12 months of our introduction."],
    ["How much", "A percentage of the candidate’s first-year pay, set out in clause 5, plus VAT if it applies."],
    ["When the invoice is due", "Within 14 days of the date on our invoice. We invoice on the candidate’s start date."],
    ["If the person leaves early", "If they leave within 12 weeks, you get a partial refund or a free replacement (clause 7)."],
    ["Candidates", "We never charge candidates a fee for finding them work. We only send identifiable details with their consent."],
    ["Your checks", "As the employer you remain responsible for right to work checks and your own final safer recruitment decisions."]
  ], [2, 5]),

  H1("1. About these terms"),
  ...clauses([
    ["1.1", `These terms are between ${CO} (**we**, **us**, **our**) and the organisation named in the signature section (**you**, **your**).`],
    ["1.2", "When we introduce candidates for permanent roles we act as an **employment agency**, as defined in the Employment Agencies Act 1973 and the Conduct of Employment Agencies and Employment Businesses Regulations 2003 (the **Conduct Regulations**)."],
    ["1.3", "These terms apply to every introduction we make to you. They replace any terms you send us, including terms in a purchase order, unless a Director of Haverton Care Limited agrees otherwise in writing."],
    ["1.4", "These terms start when you sign them, or, if earlier, when you ask us to act on a vacancy, interview a candidate we introduced, or engage a candidate we introduced after receiving these terms."],
    ["1.5", "These terms do **not** cover temporary workers supplied by us. If we supply temporary workers in future, separate terms will apply."]
  ]),

  H1("2. Words with special meanings"),
  ...table(["Word", "What it means in these terms"], [
    ["Candidate", "A person we introduce to you, whether or not you already know them."],
    ["Introduction", "Us giving you a CV, profile, name or any other information that identifies a Candidate, or arranging an interview. **Introduce** has the same meaning. An Introduction lasts for 12 months from the date we make it."],
    ["Engage", "Employing a Candidate, or using their services in any other way (for example as a worker, contractor, consultant, or through another agency or company), whether permanent, fixed-term or temporary. **Engagement** has the same meaning."],
    ["Start Date", "The first day of the Candidate’s Engagement."],
    ["Remuneration", "The Candidate’s gross annual basic salary for the first year, plus any guaranteed payments (such as guaranteed bonus, shift or car allowance). For hourly roles it is the hourly rate × contracted weekly hours × 52. Employer pension and National Insurance contributions are **not** included."],
    ["Fee", "The fee set out in clause 5."],
    ["Retained Search", "An assignment where you pay part of the Fee in advance, as described in clause 8."],
    ["Working Day", "Monday to Friday, excluding bank holidays in England."]
  ], [2, 5]),

  H1("3. What we will do"),
  ...clauses([
    ["3.1", "We will use reasonable skill and care to find, screen and introduce Candidates who appear to match the vacancy details you give us."],
    ["3.2", "Before we introduce a Candidate we will take the steps the Conduct Regulations require. This includes checking, so far as reasonably practicable, the Candidate’s identity, that they have the experience, training and qualifications you say are needed, and that they are willing to work in the role."],
    ["3.3", "Where the role involves working with, caring for or attending **vulnerable persons**, we will also take the extra steps required by regulation 22 of the Conduct Regulations. We will try to obtain copies of relevant qualifications and two references from people who are not relatives of the Candidate, and take reasonable steps to confirm the Candidate is not unsuitable for the role. If we cannot do this, we will tell you before or when we make the Introduction."],
    ["3.4", "We will only send you identifiable information about a Candidate after the Candidate has agreed to us introducing them for your vacancy."],
    ["3.5", "We will tell you promptly if we learn anything that suggests a Candidate we have introduced may be unsuitable for the role."],
    ["3.6", "We do not promise that we will find a suitable Candidate, or how quickly."]
  ]),

  H1("4. What you will do"),
  ...clauses([
    ["4.1", "Give us accurate, complete information about each vacancy before we start work, including: your identity and the nature of your business; the job title, duties, location and hours; the salary and benefits; the start date; any experience, training, qualifications or registration the law or a professional body requires; and any health and safety risks you know of."],
    ["4.2", "Tell us straight away if any vacancy details change, or if the vacancy is filled or withdrawn."],
    ["4.3", "Tell us within 2 Working Days if you make an offer to, or Engage, any Candidate we Introduced, and give us the agreed Remuneration and Start Date."],
    ["4.4", "Carry out, and keep responsibility for, the checks you must do as the employer, including **right to work checks**, any DBS checks, and your own references, health assessments and final decision on suitability. Our checks support your decision but do not replace your legal duties as employer, including under the Health and Social Care Act 2008 (Regulated Activities) Regulations 2014 where they apply to you."],
    ["4.5", "Treat Candidate information as confidential. Use it only to decide whether to Engage the Candidate, and do not pass it to anyone else without our written permission (see clause 9)."],
    ["4.6", "Make recruitment decisions lawfully and fairly. You must not ask us to select or reject anyone because of a protected characteristic under the Equality Act 2010, unless a lawful exception applies and you explain it to us in writing."]
  ]),

  H1("5. Our Fee"),
  ...clauses([
    ["5.1", "You must pay us a Fee if you Engage a Candidate within **12 months** of our last Introduction of that Candidate to you. This applies whatever role the Candidate is Engaged in, and whether you Engage them directly or through someone else."],
    ["5.2", "The Fee is a percentage of the Candidate’s Remuneration:"]
  ]),
  ...table(["Type of role", "Fee"], [
    ["Care and support roles (for example Care Assistant, Support Worker)", "12.5% of Remuneration"],
    ["Senior and coordinator roles (for example Senior Care Assistant, Team Leader, Care Coordinator, Field Care Supervisor)", "15% of Remuneration"],
    ["Deputy Manager, Registered Manager, Home Manager, Quality and Compliance roles", "17.5% of Remuneration"],
    ["Executive and specialist roles, and all Retained Search", "20% of Remuneration, or a fixed fee agreed in writing"]
  ], [4, 2]),
  ...clauses([
    ["5.3", "Where we agree a different fee in writing for a particular vacancy, that fee applies instead."],
    ["5.4", "If you do not tell us the Remuneration, or it is not known, we will calculate the Fee on the salary advertised for the vacancy, or if there is none, on a reasonable market salary for the role."],
    ["5.5", "All Fees are shown **without VAT**. If VAT applies, we will add it at the rate in force on the invoice date. [confirm VAT registration status]"],
    ["5.6", "**Onward introductions.** If you pass a Candidate’s details to another person or organisation (including a group company) and they Engage the Candidate within 12 months of our Introduction, you must pay the Fee as if you had Engaged the Candidate yourself."],
    ["5.7", "We will never charge a Candidate a fee for finding them work."]
  ]),

  H1("6. Invoices and payment"),
  ...clauses([
    ["6.1", "We will invoice you on or after the Start Date. You must pay within **14 days** of the invoice date, into the bank account shown on the invoice."],
    ["6.2", "If you pay late, we may charge interest and compensation under the Late Payment of Commercial Debts (Interest) Act 1998. Interest runs daily at 8% a year above the Bank of England base rate from the due date until we receive payment."],
    ["6.3", "If you have a genuine query about an invoice, tell us in writing within 7 days of receiving it. You must still pay any part that is not in dispute."],
    ["6.4", "**Withdrawn offers.** If you withdraw an offer after the Candidate has accepted it, for any reason other than the Candidate failing your lawful pre-employment checks or giving false information, you must pay a cancellation charge of 25% of the Fee that would have been payable."]
  ]),

  H1("7. If the Candidate leaves early"),
  ...clauses([
    ["7.1", "If the Candidate’s Engagement ends within **12 weeks** of the Start Date, we will, at your choice, either try to find a replacement Candidate without a further Fee, or give you a partial refund of the Fee paid, as follows:"]
  ]),
  ...table(["Engagement ends", "Refund of Fee paid"], [
    ["In weeks 1 to 4", "50%"], ["In weeks 5 to 8", "30%"], ["In weeks 9 to 12", "15%"], ["After week 12", "No refund"]
  ], [3, 2]),
  ...clauses([
    ["7.2", "The refund or replacement only applies if all of these are true:"],
    ["", "(a) you paid the Fee in full within 14 days of the invoice date;"],
    ["", "(b) you tell us in writing within 7 days of the Engagement ending;"],
    ["", "(c) the Engagement did not end because of redundancy, restructuring, a material change you made to the role, pay or location, or your breach of the Candidate’s contract; and"],
    ["", "(d) you do not Engage the Candidate again within 12 months."],
    ["7.3", "If you choose a replacement, you must give us the chance to fill the vacancy for 8 weeks. If we cannot, we will give the refund in clause 7.1 instead. Only one replacement is available for each placement."]
  ]),

  H1("8. Retained Search"),
  ...clauses([
    ["8.1", "For senior, confidential or hard-to-fill roles we may agree to carry out a Retained Search. The Fee is agreed in writing before we start and is paid in three equal parts:"],
    ["", "(a) one third when you instruct us;"],
    ["", "(b) one third when we give you an agreed shortlist of qualified Candidates; and"],
    ["", "(c) one third when a Candidate accepts your offer."],
    ["8.2", "The first two payments are for work done and are **not refundable**, including if you stop the search, fill the role another way, or put it on hold."],
    ["8.3", "If the final Remuneration is higher than the figure used to set the Fee, we will invoice the difference with the final payment."],
    ["8.4", "During a Retained Search you agree not to instruct another agency for the same role for the exclusive period agreed in writing (usually 8 weeks)."]
  ]),

  H1("9. Candidate information and data protection"),
  ...clauses([
    ["9.1", "When we share a Candidate’s personal data with you, each of us is a separate **controller** of that data under the UK General Data Protection Regulation (**UK GDPR**) and the Data Protection Act 2018."],
    ["9.2", "You must: use Candidate data only to consider and manage their possible Engagement; keep it secure; not keep it longer than you need; and delete it when you no longer need it, unless the law requires you to keep it."],
    ["9.3", "You must not ask us for, or use, information about a Candidate’s health or disability to decide whether to shortlist them, except where the Equality Act 2010 allows it."],
    ["9.4", "Each of us will tell the other promptly, and within 48 hours where practicable, if we become aware of a personal data breach involving Candidate data we have shared."],
    ["9.5", "Our privacy notice explains how we handle personal data. You can ask us for a copy."]
  ]),

  H1("10. Liability"),
  ...clauses([
    ["10.1", "You decide whether to Engage a Candidate. We are not responsible for any Candidate’s acts or omissions, or for any loss arising from your decision to Engage them, unless we have been negligent or deliberately misled you."],
    ["10.2", "Our total liability to you under or in connection with these terms is limited to the total Fees you have paid us in the 12 months before the claim arose."],
    ["10.3", "We are not liable for loss of profit, loss of business, or any indirect or consequential loss."],
    ["10.4", "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else the law does not allow to be limited."]
  ]),

  H1("11. Complaints"),
  P("If you are unhappy with our service, please contact the Director at info@havertoncare.co.uk or 01322 879778. We will acknowledge your complaint within 2 Working Days and aim to respond in full within 10 Working Days."),

  H1("12. General"),
  ...clauses([
    ["12.1", "These terms are the whole agreement between us about Introductions. Any change must be in writing and signed by a Director of Haverton Care Limited."],
    ["12.2", "If any part of these terms is found to be unenforceable, the rest stays in force."],
    ["12.3", "Neither of us may transfer our rights under these terms without the other’s written consent, except that we may assign our right to be paid."],
    ["12.4", "Nobody else has any rights under these terms under the Contracts (Rights of Third Parties) Act 1999."],
    ["12.5", "Notices must be in writing and sent by email to the address each of us gives for this purpose. Our address for notices is info@havertoncare.co.uk."],
    ["12.6", "These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction."]
  ]),

  H1("Signatures"),
  P("By signing, you confirm you have authority to agree these terms for your organisation."),
  ...table(null, [["Client organisation (legal name)", ""], ["Company or charity number", ""], ["Address", ""], ["Email for invoices", ""], ["Email for notices", ""]], [2, 3]),
  ...sign(["the Client", "Haverton Care Limited"])
], { footer: LEGAL_FOOTER }),

/* ---------------------------------------------------------------- CANDIDATE TERMS */
build(`${root}/3 Legal/Candidate Terms.docx`, [
  ...titleBlock("Candidate Terms", "How we help you find work, and what we agree with each other", [
    ["Who these terms are for", "People who register with us to find permanent work"],
    ["Cost to you", "Nothing. We never charge candidates for finding work."],
    ["Version", "1.0, September 2026"]
  ]),
  ...box("Before you use this document", DRAFT_LEGAL),
  H1("1. Who we are"),
  P(`We are ${CO}. In these terms, **we**, **us** and **our** mean Haverton Care Limited, and **you** means the person registering with us.`),
  P("For permanent roles we act as an **employment agency** under the Employment Agencies Act 1973 and the Conduct of Employment Agencies and Employment Businesses Regulations 2003. This means we introduce you to organisations (our **clients**) who may employ you directly. You will not be employed by us."),
  H1("2. What we will do for you"),
  ...bullets([
    "Talk to you about the work you want, your experience and where you can travel to.",
    "Look for suitable permanent roles with our clients, mainly adult social care providers.",
    "Tell you about each role before we put you forward, including the organisation, location, hours and pay.",
    "Only send your CV or details to a client **after you have agreed**, for that specific role.",
    "Help arrange interviews, pass on feedback where the client gives it, and support you through any offer.",
    "Keep in touch after you start, usually at week 1, week 4 and week 12."
  ]),
  H1("3. No fees"),
  P("We will **never** charge you a fee for finding you work or for putting you forward for roles. Our clients pay us if they employ you. If anyone asks you for money in our name, please tell us straight away."),
  H1("4. What we ask of you"),
  ...bullets([
    "Give us true and complete information about your work history, qualifications, registration and right to work, and tell us promptly if anything changes.",
    "Tell us if you have already applied to the same organisation, or been put forward by another agency, so we do not duplicate applications.",
    "Let us know if you accept a job, stop looking for work, or no longer want us to contact you.",
    "Tell us if you need any adjustments for interviews or assessments. You do not have to share health information to register."
  ]),
  H1("5. Checks"),
  P("Many roles in health and social care need checks, such as identity and right to work, references, employment history and gaps, qualifications and professional registration, and in some roles a DBS check. We will explain which checks apply to a role before we put you forward. Where a role involves work with vulnerable people, the law requires us to seek two references from people who are not your relatives and copies of relevant qualifications."),
  P("We only ask for information that is needed at each stage. We will not ask you about your health or disability before a job offer except where the law allows, for example to make adjustments for an interview."),
  H1("6. Your information"),
  P("Our Recruitment Privacy Notice explains what information we hold about you, why, how long we keep it, and your rights. We will give you a copy when you register. You can change your mind about being contacted, or about being put forward for a role, at any time."),
  H1("7. Ending these terms"),
  P("Either of us can end these terms at any time by telling the other. If you ask us to stop, we will stop putting you forward, and we will handle your information as our privacy notice explains."),
  H1("8. Concerns and complaints"),
  P("If you are unhappy with our service, or you have a concern about a client, a role or your safety, please contact the Director at info@havertoncare.co.uk or 01322 879778. We take concerns about safety, discrimination and exploitation seriously and will act promptly."),
  H1("9. Law"),
  P("These terms are governed by the law of England and Wales."),
  H1("Your agreement"),
  P("Please tick and sign to confirm you have read and agree to these terms."),
  ...table(null, [["I have read and agree to these Candidate Terms", "☐ Yes"], ["I have received the Recruitment Privacy Notice", "☐ Yes"], ["Full name", ""], ["Signature", ""], ["Date", ""]], [3, 2])
], { footer: LEGAL_FOOTER }),

/* ---------------------------------------------------------------- PRIVACY NOTICE */
build(`${root}/3 Legal/Recruitment Privacy Notice.docx`, [
  ...titleBlock("Recruitment Privacy Notice", "How we use personal information when we help people find work", [
    ["Controller", "Haverton Care Limited (company number 17025493), 128 City Road, London, EC1V 2NX"],
    ["ICO registration number", "[confirm]"],
    ["Contact for privacy questions", "The Director, info@havertoncare.co.uk, 01322 879778"],
    ["Version", "1.0, September 2026"]
  ]),
  ...box("Before you use this document", DRAFT_LEGAL),
  H1("1. Who this notice is for"),
  P("This notice is for candidates who register with Haverton Recruitment And Staffing, people who apply to our adverts, and referees whose details candidates give us. It explains what we collect, why, who we share it with, how long we keep it, and your rights under the UK GDPR and the Data Protection Act 2018."),
  H1("2. What we collect"),
  ...table(["Type of information", "Examples", "When we collect it"], [
    ["Contact and identity", "Name, email, phone, postcode, date of birth where needed", "When you register"],
    ["Work history", "CV, employment history and gaps, qualifications, training, professional registration, references", "When you register and before we put you forward"],
    ["Job preferences", "Roles, location, travel, hours, pay expectations, availability", "When you register"],
    ["Right to work", "Result and date of your right to work check, and any time limit on your permission", "Before an offer, where needed"],
    ["Criminal record information", "Whether a DBS check is needed, its level and outcome, and our risk assessment if something is disclosed", "Only for roles that are eligible for a DBS check"],
    ["Health and adjustments", "Adjustments you ask for at interview; health information only after an offer and only where lawful and needed for the role", "Only when relevant"],
    ["Equality monitoring (optional)", "For example ethnicity or disability, to check our process is fair", "Only if you choose to give it. Kept separate and never used for selection."],
    ["Our records", "Notes of calls and meetings, consent to be put forward, feedback, placement details", "Throughout"]
  ], [2, 4, 3]),
  H1("3. Where we get it"),
  P("Mostly from you. We also receive information from job boards and professional networks you have used to apply, from referees you name, from clients who give feedback, and from official sources such as professional registers and the Home Office online right to work service."),
  H1("4. Why we use it, and our lawful reasons"),
  ...table(["What we do", "Our lawful basis under the UK GDPR"], [
    ["Find and suggest suitable roles, and put you forward with your agreement", "Taking steps at your request before a contract (Article 6(1)(b)), and our legitimate interests in running a recruitment service (Article 6(1)(f))"],
    ["Keep records the law requires recruitment agencies to keep", "Legal obligation (Article 6(1)(c)), including the Conduct of Employment Agencies and Employment Businesses Regulations 2003"],
    ["Check identity, experience, qualifications and references, including the extra checks for work with vulnerable people", "Legal obligation (Article 6(1)(c)) and legitimate interests (Article 6(1)(f))"],
    ["Keep in touch about future roles", "Legitimate interests (Article 6(1)(f)). You can ask us to stop at any time."],
    ["Send you news or marketing by email or text", "Your consent, where the law requires it. You can withdraw it at any time."],
    ["Handle health information for adjustments or after an offer", "Article 9(2)(b) (employment obligations) with Data Protection Act 2018, Schedule 1, paragraph 1"],
    ["Handle equality monitoring information", "Article 9(2)(g) with Data Protection Act 2018, Schedule 1, paragraph 8 (equality of opportunity)"],
    ["Handle criminal record information for eligible roles", "Data Protection Act 2018, Schedule 1, paragraph 1 (employment) and, where it applies, paragraph 18 (safeguarding of children and individuals at risk). [confirm with solicitor]"]
  ], [3, 4]),
  P("Where we rely on a Schedule 1 condition, we keep an Appropriate Policy Document as the Data Protection Act 2018 requires. We do not make decisions about you using only automated means."),
  H1("5. Who we share it with"),
  ...bullets([
    "**Clients** who may employ you, only for a role you have agreed we can put you forward for.",
    "**Referees** you have named, to request references.",
    "**Service providers** who help us run our business under contract, including our secure cloud database (Supabase, hosted in London, UK), email, file storage and accountancy services. They may only use your data on our instructions.",
    "**Regulators, the police or other authorities**, where the law requires it or to protect someone from harm (for example a safeguarding concern)."
  ]),
  P("We do not sell your information. We aim to keep your information in the UK. If a provider stores data outside the UK, we will make sure there are legal safeguards, such as UK adequacy regulations or the International Data Transfer Agreement, and tell you on request."),
  H1("6. How long we keep it"),
  ...table(["Information", "How long"], [
    ["If you are not placed and we have not been in touch", "Up to 2 years after our last meaningful contact, then deleted, unless you ask us to keep you on file longer"],
    ["Records the Conduct Regulations require", "At least 1 year from when the record was made or last used"],
    ["If you are placed: placement, fee and contract records", "6 years after the end of the tax year of the placement, for legal and accounting reasons"],
    ["Criminal record information", "Only the outcome and date. We do not keep copies of DBS certificates. Deleted within 6 months of the decision unless needed for a dispute."],
    ["Equality monitoring", "Kept anonymised for statistics only"]
  ], [3, 4]),
  H1("7. Your rights"),
  P("You have the right to: ask for a copy of your information; ask us to correct it; ask us to delete it; ask us to limit how we use it; object to us using it for legitimate interests or marketing; and ask us to transfer it. Some rights have exceptions, for example where the law requires us to keep records. We will reply within one month."),
  P("To use any right, contact the Director at info@havertoncare.co.uk."),
  H1("8. Keeping it safe"),
  P("Access to our systems is limited to people who need it, protected by individual passwords, and recorded. Sensitive documents such as identity documents are kept in restricted storage, not in our general database."),
  H1("9. Complaints"),
  P("Please talk to us first. You also have the right to complain to the Information Commissioner’s Office (ICO): ico.org.uk/make-a-complaint, 0303 123 1113."),
  H1("10. Changes"),
  P("We will update this notice when our practices or the law change. The version number and date are at the top.")
], { footer: LEGAL_FOOTER }),

/* ---------------------------------------------------------------- DATA PROTECTION RECORD */
build(`${root}/3 Legal/Data Protection Record.docx`, [
  ...titleBlock("Data Protection Record", "Internal record of processing, retention, lawful bases and safeguards", [
    ["Owner", "Director, Haverton Care Limited"], ["Review", "Every 12 months, or sooner if the service changes"], ["Version", "1.0, September 2026"]
  ]),
  ...box("Why this document exists", ["The UK GDPR expects us to be able to **show** how we comply (accountability). This record, kept up to date, is that evidence. It also includes the **Appropriate Policy Document** the Data Protection Act 2018 requires when we rely on Schedule 1 conditions for special category and criminal offence data.", "Draft for review by a solicitor or data protection adviser."]),
  H1("1. Record of processing"),
  ...table(["Activity", "Data", "People", "Lawful basis", "Where held"], [
    ["Candidate registration and matching", "Contact, work history, preferences", "Candidates", "6(1)(b), 6(1)(f)", "Operations system (Supabase, London)"],
    ["Consent to represent", "Role, date, scope", "Candidates", "6(1)(f), 6(1)(c)", "Operations system"],
    ["Checks for roles with vulnerable people", "Qualifications, references, registration status", "Candidates, referees", "6(1)(c), 6(1)(f)", "Status in system; documents in restricted folder"],
    ["Right to work (where we check)", "Check result, date, expiry", "Candidates", "6(1)(c)", "Status in system; evidence in restricted folder"],
    ["DBS (eligible roles only)", "Level, outcome, risk assessment", "Candidates", "6(1)(c) + Sch 1 para 1 / 18", "Restricted folder only"],
    ["Client management and invoicing", "Business contacts, terms, invoices", "Client staff", "6(1)(b), 6(1)(f), 6(1)(c)", "Operations system; accounts"],
    ["Marketing to clients", "Business email, phone", "Client staff", "6(1)(f) (PECR rules for corporate subscribers)", "Operations system"]
  ], [3, 3, 2, 2, 3]),
  H1("2. Retention schedule"),
  ...table(["Record", "Keep for", "Trigger", "Then"], [
    ["Unplaced candidate record", "2 years", "Last meaningful contact", "Delete, or ask candidate if they want to stay"],
    ["Conduct Regulations records (terms, hirer and candidate information)", "At least 1 year", "Creation or last use", "Delete or keep with placement file"],
    ["Placement, fee and invoice records", "6 years", "End of tax year of placement", "Delete"],
    ["DBS outcome and risk assessment", "6 months", "Recruitment decision", "Delete, unless in dispute"],
    ["Unsuccessful campaign notes", "12 months", "Campaign closed", "Delete (Equality Act claims window plus margin)"],
    ["Marketing suppression list", "Indefinitely", "Opt-out", "Keep minimum data so we never contact again"]
  ], [3, 2, 2, 3]),
  H1("3. Legitimate interests assessment (summary)"),
  ...table(["Question", "Answer"], [
    ["Purpose", "Running a recruitment service that matches people to care-sector jobs."],
    ["Is processing necessary?", "Yes. We cannot find suitable roles without holding a candidate’s details and preferences."],
    ["Balance", "Candidates expect an agency to hold and use their details for this purpose. We minimise data, never share identifiable details without consent, and honour objections at once. Their interests do not override ours when these safeguards are followed."],
    ["Outcome", "Legitimate interests is appropriate for matching and keeping in touch. Review annually."]
  ], [2, 5]),
  H1("4. Appropriate Policy Document (summary)"),
  ...table(["Requirement", "How we meet it"], [
    ["Conditions relied on", "DPA 2018 Schedule 1 paragraphs 1 (employment), 8 (equality of opportunity) and, where applicable, 18 (safeguarding). [confirm]"],
    ["Lawfulness, fairness, transparency", "Explained in the Recruitment Privacy Notice, given at registration."],
    ["Purpose limitation", "Used only for suitability, adjustments, safeguarding and equality monitoring."],
    ["Minimisation", "Outcome and date only for DBS; no certificate copies; no health questions before offer except adjustments."],
    ["Accuracy", "Checked at source (registers, online services) and updated when told."],
    ["Storage limitation", "Retention schedule above."],
    ["Security", "Restricted folders, individual logins, audit trail, least-privilege access."],
    ["Review", "This document is reviewed annually and kept for 6 months after we stop the processing."]
  ], [2, 5]),
  H1("5. If something goes wrong (data breach)"),
  ...bullets([
    "**Contain it immediately** (recall the email, revoke access, change passwords).",
    "**Record it** the same day: what, when, whose data, how many people, likely harm.",
    "**Decide within 72 hours** of becoming aware whether it must be reported to the ICO (report if it is likely to result in a risk to people’s rights and freedoms).",
    "**Tell the people affected** without undue delay if the risk to them is high.",
    "**Learn from it**: record the cause and the change you made to stop it happening again."
  ]),
  H1("6. Processors (service providers)"),
  ...table(["Provider", "Service", "Location", "Agreement in place"], [
    ["Supabase", "Operations database and sign-in", "London, UK (eu-west-2)", "[confirm: accept DPA in Supabase organisation settings]"],
    ["Email and file storage provider", "Email, restricted document folders", "[confirm]", "[confirm]"],
    ["Accountant / payroll", "Accounts and invoicing", "UK", "[confirm]"],
    ["GitHub", "Hosts the encrypted website files only (no personal data)", "Global", "Not required for personal data"]
  ], [2, 3, 2, 3])
], { footer: "Internal | Version 1.0 | September 2026" })
];
