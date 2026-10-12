// Site copy that appears on more than one page. Everything here is invented.

export const SITE = {
  name: 'Exortium',
  url: 'https://nathankagoro.github.io/exortium-website/',
  notice: 'Exortium is a concept agency. The team, clients and results shown are illustrative.',
};

export const NAV = [
  { href: 'index.html', label: 'Home', key: 'home' },
  { href: 'services.html', label: 'Services', key: 'services' },
  { href: 'case-studies.html', label: 'Case studies', key: 'cases' },
  { href: 'about.html', label: 'About', key: 'about' },
  { href: 'contact.html', label: 'Contact', key: 'contact' },
];

export const SERVICES = [
  {
    id: 'websites',
    word: 'Websites',
    name: 'Web design and launch',
    text: 'We plan the pages, write the words, build the site and put it live. It loads quickly, works on a phone and tells a visitor what to do next.',
    includes: ['Page plan and copy', 'Design and build', 'Speed and accessibility checks', 'Launch, then a month of fixes'],
  },
  {
    id: 'social',
    word: 'Social and ads',
    name: 'Social media and ad campaigns',
    text: 'We make the posts and the adverts, choose who sees them and watch the spend. Each week you get a note saying what ran, what it cost and what came of it.',
    includes: ['A calendar agreed a month ahead', 'Adverts written, shot and cut', 'Audience and budget set-up', 'A weekly plain-English report'],
  },
  {
    id: 'leads',
    word: 'Leads',
    name: 'Lead generation',
    text: 'We build the route from first click to booked call: the offer, the landing page, the form and the follow-up. Enquiries arrive sorted, so your team rings the likely ones first.',
    includes: ['One offer per landing page', 'Short forms that ask only what is needed', 'Follow-up emails and reminders', 'Enquiries scored before they reach you'],
  },
];

export const CASES = [
  {
    id: 'northbridge',
    name: 'Northbridge FC',
    sector: 'Football club',
    brief: 'Half the ground turns up twice a season. Give them a reason to come back before Christmas.',
    plan: ['A fixtures page that sells the next home game first', 'Short match-week clips made for phones', 'A two-game ticket offer, followed up by email'],
    measure: 'Season-ticket enquiries, and how many two-game buyers return.',
  },
  {
    id: 'helios',
    name: 'Helios Taverna',
    sector: 'Greek restaurant',
    brief: 'Friday and Saturday are full. On Tuesday it is the owner, one waiter and the radio.',
    plan: ['A booking page that loads fast on a phone', 'A midweek set menu advertised within two miles', 'A local listing with the right opening hours'],
    measure: 'Weekday bookings, and how many of those tables come back.',
  },
  {
    id: 'summit',
    name: 'Summit Ridge Roofing',
    sector: 'Roofing company',
    brief: 'The phone rings after every storm, then goes quiet for a month.',
    plan: ['One page per type of job, each with a photo-quote form', 'Search adverts only where the vans already go', 'A reply to every enquiry on the day it arrives'],
    measure: 'Surveys booked, and what each one cost to win.',
  },
];

export const TEAM = [
  {
    id: 'tamsin',
    name: 'Tamsin Vale',
    role: 'Campaigns',
    text: 'Plans the adverts and the social calendar. Keeps a spreadsheet nobody else is allowed to sort.',
  },
  {
    id: 'corwin',
    name: 'Corwin Ashby',
    role: 'Creative',
    text: 'Designs the sites and writes the headlines. Thinks most pages have one sentence too many.',
  },
  {
    id: 'odalys',
    name: 'Odalys Brandt',
    role: 'Operations and analytics',
    text: 'Runs the numbers and the schedule. Reads the report before the meeting, not during it.',
  },
];
