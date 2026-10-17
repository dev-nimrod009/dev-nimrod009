// Legal reference mapping each offense type to the defining Kenyan statute and
// the constitutional rights that apply to the accused.
// Statutory summaries are simplified for officer guidance, not legal advice.

const ARTICLE_49_CORE = {
  article: 'Article 49(1)',
  heading: 'Rights of an Arrested Person',
  text: 'Kept separate from convicted persons; informed promptly in language they understand of the reason for arrest; to remain silent; to be charged in court or released; to be brought before a court as soon as reasonably possible and in any event not later than 24 hours after arrest (or the next court day if the 24 hours end outside court hours).',
}

const LEGAL_REFERENCE = {
  'Petty Theft': {
    statute: 'Penal Code, Cap 63',
    section: 'Section 275',
    title: 'Theft',
    definition: 'A person who fraudulently and without claim of good faith takes anything capable of being stolen, or converts it to their own use, commits the felony of theft.',
    penalty: 'Imprisonment up to 3 years for simple theft, with enhanced terms where the property is stolen from a dwelling or a person.',
    bailConsiderations: 'Generally bailable. Court may grant police or court cash bail pending charge and trial.',
  },
  'Assault': {
    statute: 'Penal Code, Cap 63',
    section: 'Section 250',
    title: 'Common Assault',
    definition: 'A person who unlawfully assaults another commits a misdemeanour. An assault is any act by which a person intentionally or recklessly causes another to apprehend unlawful violence, or applies unlawful force.',
    penalty: 'Imprisonment up to 1 year for common assault; up to 5 years where bodily harm is caused (s.251) and up to life where grievous harm is caused (s.234).',
    bailConsiderations: 'Bailable in most cases; severity of injury weighs on bail terms.',
  },
  'Robbery with Violence': {
    statute: 'Penal Code, Cap 63',
    section: 'Section 296(2)',
    title: 'Robbery with Violence',
    definition: 'Robbery where the offender is armed with a dangerous or offensive weapon, is in company with one or more others, or at or immediately before or after the time of the robbery wounds, beats, strikes or uses violence against any person.',
    penalty: 'Among the most serious felonies. Sentencing follows the Constitution (Article 26) and the Muruatetu jurisprudence; the mandatory death sentence no longer applies and courts may impose life imprisonment or other lawful sentences.',
    bailConsiderations: 'Non-bailable as a matter of practice for capital-classified offences; the accused may petition the High Court. Article 49(1)(f) right to be released unless compelling reasons justify continued detention still applies and must be justified in writing.',
  },
  'Burglary': {
    statute: 'Penal Code, Cap 63',
    section: 'Sections 303-306',
    title: 'Housebreaking and Burglary',
    definition: 'A person who breaks and enters any building with intent to commit an offence therein commits housebreaking; it becomes burglary when the breaking and entering occurs between 6:00 p.m. and 6:00 a.m.',
    penalty: 'Imprisonment up to 5 years for housebreaking and up to 10 years for burglary, and where stealing accompanies the break-in, the offender is liable additionally to imprisonment for the term provided for that offence.',
    bailConsiderations: 'Bailable; terms often consider prior convictions and likelihood of interference with evidence.',
  },
  'Possession of Contraband': {
    statute: 'Prisons Act, Cap 90 / Station Standing Orders',
    section: 'Section 52',
    title: 'Introducing or Possessing Prohibited Articles',
    definition: 'Possession of articles prohibited in custody (weapons, phones, narcotics, or other unauthorised items) within a police or prison facility, or supplying them to a person in lawful custody.',
    penalty: 'Imprisonment (commonly up to 2 years) and, where the article is a narcotic or weapon, prosecution may additionally proceed under the Penal Code or the Narcotic Drugs and Psychotropic Substances Act.',
    bailConsiderations: 'Usually bailable; disposal of the article is documented in the OB and exhibits register.',
  },
  'Dangerous Driving': {
    statute: 'Traffic Act, Cap 403',
    section: 'Section 113',
    title: 'Dangerous Driving',
    definition: 'Driving a motor vehicle on a road at a speed or in a manner that is dangerous to the public, whether or not injury or damage results.',
    penalty: 'First offence: fine and/or imprisonment up to 6 months (or up to 2 years where grievous hurt results), plus licence disqualification.',
    bailConsiderations: 'Bailable, typically with surety; release frequently processed at the station level under police bail.',
  },
  'Disorderly Conduct': {
    statute: 'Penal Code, Cap 63',
    section: 'Sections 91-93',
    title: 'Idle and Disorderly Conduct / Riotous Behaviour',
    definition: 'Conduct amounting to a breach of the peace in a public place, including fighting, abusive or threatening behaviour, or riotous assembly.',
    penalty: 'Imprisonment up to 1 month to 1 year depending on the specific section; fines may be imposed in lieu.',
    bailConsiderations: 'Bailable; most minor category. Station bail commonly applied.',
  },
  'Defilement': {
    statute: 'Sexual Offences Act, No. 3 of 2006',
    section: 'Section 8',
    title: 'Defilement',
    definition: 'An act which causes penetration with a child. The age of the child determines the sentencing band, from imprisonment of not less than 30 years where the child is between 12 and 15 years, to imprisonment for life where the child is below 11 years.',
    penalty: 'Minimum statutory sentences apply by age band; life imprisonment for the most serious bands. These are statutory minimums, not discretionary.',
    bailConsiderations: 'Bail is discretionary under Article 49(1)(f) and the Criminal Procedure Code (s.123) - serious consideration is given to the protection of the child victim and witnesses before any release.',
  },
  'Cattle Rustling': {
    statute: 'Stock and Produce Theft Act, Cap 267',
    section: 'Section 4',
    title: 'Stock Theft',
    definition: 'Stealing, slaughtering, or driving away livestock (cattle, sheep, goats, camels, equines or pigs) with intent to steal or defraud the owner.',
    penalty: 'Imprisonment of not less than 5 years and not more than 14 years, depending on the value and number of stock involved.',
    bailConsiderations: 'Bailable subject to court discretion; courts weigh risk of retaliation and repeat stock-related offending in the region.',
  },
  'Drug Trafficking': {
    statute: 'Narcotic Drugs and Psychotropic Substances (Control) Act, No. 4 of 1994',
    section: 'Sections 3-4',
    title: 'Trafficking / Possession of Narcotics',
    definition: 'Trafficking includes importing, exporting, manufacturing, selling, supplying or transporting any narcotic drug or psychotropic substance. Simple possession is a distinct offence under s.4.',
    penalty: 'Trafficking: fine of not less than KES 1,000,000 and/or imprisonment of not less than 20 years (life for the most serious quantities). Possession: fine and/or imprisonment up to 10 years depending on the substance.',
    bailConsiderations: 'Bail is discretionary; quantity and classification of the substance weigh heavily on terms.',
  },
}

const CONSTITUTION_RIGHTS = [
  ARTICLE_49_CORE,
  {
    article: 'Article 49(1)(f)',
    heading: 'Right to Release or Bail',
    text: 'The arrested person has the right to be released on bond or bail, on reasonable conditions, pending a charge or trial, unless there are compelling reasons not to be released. Any such reasons must be recorded and communicated.',
  },
  {
    article: 'Article 49(2)',
    heading: 'Reasonable Conditions',
    text: 'Any bail conditions set must be reasonable and the person may not be remanded in custody for an offence punishable by a fine only, or by imprisonment for not more than six months.',
  },
  {
    article: 'Article 51',
    heading: 'Fair Hearing of the Accused',
    text: 'Every accused person has the right to a fair trial, which includes the right to be presumed innocent until proven guilty, to be informed of the charge with sufficient detail, to adequate time to prepare a defence, and to be tried in a language they understand.',
  },
]

function getLegalReference(offenseType) {
  return LEGAL_REFERENCE[offenseType] || null
}

export { LEGAL_REFERENCE, CONSTITUTION_RIGHTS, ARTICLE_49_CORE, getLegalReference }
