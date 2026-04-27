import type { Language } from '../types/expense'

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  tl: 'Tagalog',
  ceb: 'Bisaya',
}

// Maps English day names (from date-fns) to each language
const DAY_NAMES: Record<Language, Record<string, string>> = {
  en: {
    Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday',
    Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
  },
  tl: {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miyerkules',
    Thursday: 'Huwebes', Friday: 'Biyernes', Saturday: 'Sabado', Sunday: 'Linggo',
  },
  ceb: {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miyerkules',
    Thursday: 'Huwebes', Friday: 'Biyernes', Saturday: 'Sabado', Sunday: 'Domingo',
  },
}

export function translateDay(englishDay: string, lang: Language): string {
  return DAY_NAMES[lang][englishDay] ?? englishDay
}

// ── Insight strings ──────────────────────────────────────────────────────────

interface InsightStrings {
  noData: () => string
  streak: (n: number) => string
  streak2: () => string
  moreVsLastWeek: (pct: number, day: string) => string
  lessVsLastWeek: (pct: number, day: string) => string
  aboveAvg: (pct: number, avg: string) => string
  belowAvg: (pct: number) => string
  biggestItem: (label: string, amount: string) => string
  multiExpense: (n: number, total: string) => string
  noSpendingToday: () => string
}

const insightStrings: Record<Language, InsightStrings> = {
  en: {
    noData: () => "No spending recorded yet. Add your first expense above.",
    streak: (n) => `${n} days in a row under budget. Keep it going.`,
    streak2: () => "2 days under budget in a row. Tomorrow makes it a streak.",
    moreVsLastWeek: (pct, day) => `You're spending ${pct}% more than last ${day}.`,
    lessVsLastWeek: (pct, day) => `You're spending ${pct}% less than last ${day}. Nice.`,
    aboveAvg: (pct, avg) => `Today is ${pct}% above your 7-day average (${avg}/day).`,
    belowAvg: (pct) => `Today is ${pct}% below your 7-day average. Light day.`,
    biggestItem: (label, amount) => `Your biggest spend today is "${label}" at ${amount}.`,
    multiExpense: (n, total) => `You've made ${n} expense${n > 1 ? 's' : ''} today totalling ${total}.`,
    noSpendingToday: () => "No spending today. Either you're frugal or forgot to log.",
  },
  tl: {
    noData: () => "Wala pang naitala na gastos. Idagdag ang iyong unang gastos sa itaas.",
    streak: (n) => `${n} araw sunod-sunod na nasa loob ng badyet. Ituloy!`,
    streak2: () => "2 araw sunod-sunod na nasa loob ng badyet. Isa pa bukas para maging streak!",
    moreVsLastWeek: (pct, day) => `${pct}% na mas mataas ang gastos mo kumpara noong ${day} ng nakaraang linggo.`,
    lessVsLastWeek: (pct, day) => `${pct}% na mas mababa ang gastos mo kumpara noong ${day} ng nakaraang linggo. Galing!`,
    aboveAvg: (pct, avg) => `${pct}% na mas mataas ngayon kaysa sa iyong 7-araw na average (${avg}/araw).`,
    belowAvg: (pct) => `${pct}% na mas mababa ngayon kaysa sa iyong 7-araw na average. Magaan na araw.`,
    biggestItem: (label, amount) => `Ang pinakamalaking gastos mo ngayon ay "${label}" na ${amount}.`,
    multiExpense: (n, total) => `${n} gastos ka ngayon na kabuuang ${total}.`,
    noSpendingToday: () => "Walang gastos ngayon. Matipid ka o nakalimutan mong i-log.",
  },
  ceb: {
    noData: () => "Wala pay nasulat nga gastuhon. Idugang ang imong unang gastos sa ibabaw.",
    streak: (n) => `${n} ka adlaw sunod-sunod nga sulod sa budget. Padayon!`,
    streak2: () => "2 ka adlaw sunod-sunod nga sulod sa budget. Isa pa ugma para mahimong streak!",
    moreVsLastWeek: (pct, day) => `${pct}% ang pagsaka sa imong gastuhon kumpara sa ${day} sa miaging semana.`,
    lessVsLastWeek: (pct, day) => `${pct}% ang pagbaba sa imong gastuhon kumpara sa ${day} sa miaging semana. Maayo!`,
    aboveAvg: (pct, avg) => `${pct}% ang pagtaas karon kaysa sa imong 7-adlaw nga average (${avg}/adlaw).`,
    belowAvg: (pct) => `${pct}% ang pagkunhod karon kaysa sa imong 7-adlaw nga average. Gaan nga adlaw.`,
    biggestItem: (label, amount) => `Ang pinaka-dakong gastuhon nimo karon mao ang "${label}" nga ${amount}.`,
    multiExpense: (n, total) => `${n} ka gastos karon nga total ${total}.`,
    noSpendingToday: () => "Walay gastuhon karon. Matipid ka o nakalimtan mong i-log.",
  },
}

export function insightT(lang: Language): InsightStrings {
  return insightStrings[lang]
}

// ── Reality Check strings ────────────────────────────────────────────────────

interface RealityCheckStrings {
  statusOverBoth: (daily: string, monthly: string) => string
  tipRecoverByMonthEnd: (under: string, n: number) => string
  tipLastDayBoth: () => string
  statusOverDaily: (overage: string) => string
  tipSkipBiggest: (label: string, amount: string) => string
  tipSpendNothing: (overage: string) => string
  statusProjectionOver: (overage: string) => string
  tipCapDaily: (amount: string, n: number) => string
  tipFinalDay: () => string
  statusApproaching: (remaining: string) => string
  tipPauseNow: () => string
  statusOnTrack: (surplus: string) => string
  tipSaveSurplus: () => string
  statusBiggest: (label: string, amount: string) => string
  tipRecurring: () => string
  statusNoSpending: (budget: string) => string
  tipPlanFixed: () => string
  statusFallback: () => string
  tipSetBudget: () => string
}

const realityCheckStrings: Record<Language, RealityCheckStrings> = {
  en: {
    statusOverBoth: (d, m) => `You're ${d} over today and ${m} over your monthly budget.`,
    tipRecoverByMonthEnd: (under, n) => `To recover by month-end, keep daily spending under ${under} for the next ${n} day${n > 1 ? 's' : ''}.`,
    tipLastDayBoth: () => "Last day of the month — absorb the overage by skipping all non-essentials today.",
    statusOverDaily: (o) => `You're ${o} over today's budget.`,
    tipSkipBiggest: (label, amt) => `Next time, consider skipping or halving "${label}" (${amt}) — that alone would keep you within budget.`,
    tipSpendNothing: (o) => `Spend nothing more today and trim ${o} from tomorrow's budget to stay on track this week.`,
    statusProjectionOver: (o) => `At this pace you'll overspend by ${o} this month.`,
    tipCapDaily: (amt, n) => `Cap your daily spend at ${amt} for the remaining ${n} day${n > 1 ? 's' : ''} to land exactly on budget.`,
    tipFinalDay: () => "Final day of the month — don't spend another cent.",
    statusApproaching: (r) => `Only ${r} left in today's budget.`,
    tipPauseNow: () => "Pause all non-essential spending now — one more average purchase will push you over.",
    statusOnTrack: (s) => `You're projected to finish the month ${s} under budget.`,
    tipSaveSurplus: () => "Consider moving that surplus to savings before you find a reason to spend it.",
    statusBiggest: (label, amt) => `Biggest expense today: "${label}" at ${amt}.`,
    tipRecurring: () => "If this is a recurring item, log it as a fixed cost and plan the rest of your day around it.",
    statusNoSpending: (b) => `Full ${b} budget still available today.`,
    tipPlanFixed: () => "Start by planning your known fixed expenses first, then allocate what's left for discretionary spending.",
    statusFallback: () => "Start logging expenses to see your reality check.",
    tipSetBudget: () => "Set a daily budget in Settings so Budglet can track your progress against a goal.",
  },
  tl: {
    statusOverBoth: (d, m) => `${d} na lampas ka ngayon at ${m} na lampas sa iyong buwanang badyet.`,
    tipRecoverByMonthEnd: (under, n) => `Para mabawi bago matapos ang buwan, huwag hihigit sa ${under} bawat araw sa susunod na ${n} araw.`,
    tipLastDayBoth: () => "Huling araw ng buwan — huwag nang gastusin pa ang mga hindi kailangan ngayon.",
    statusOverDaily: (o) => `${o} na lampas ka sa badyet ngayon.`,
    tipSkipBiggest: (label, amt) => `Sa susunod, subukang iwasan o hatiin ang "${label}" (${amt}) — sapat na ito para manatili sa badyet.`,
    tipSpendNothing: (o) => `Huwag nang gumastos ngayon at bawasan ng ${o} ang badyet bukas para manatili sa track.`,
    statusProjectionOver: (o) => `Sa ganitong takbo, lalampas ka ng ${o} sa badyet ngayong buwan.`,
    tipCapDaily: (amt, n) => `Limitahan ang pang-araw-araw na gastos sa ${amt} sa natitirang ${n} araw para eksaktong maabot ang badyet.`,
    tipFinalDay: () => "Huling araw ng buwan — huwag nang gumastos pa.",
    statusApproaching: (r) => `${r} na lang ang natitira sa badyet ngayon.`,
    tipPauseNow: () => "Ihinto na ang lahat ng hindi kailangang gastos — isa pa lang ang makakapagpawala ng natitira.",
    statusOnTrack: (s) => `Inaasahang matapos ang buwan na ${s} na mas mababa sa badyet.`,
    tipSaveSurplus: () => "Ilipat na ang sobra sa ipon bago pa mo mapagastusan.",
    statusBiggest: (label, amt) => `Pinakamalaking gastos ngayon: "${label}" na ${amt}.`,
    tipRecurring: () => "Kung paulit-ulit ito, itala bilang fixed na gastos at planuhin ang natitirang araw sa paligid nito.",
    statusNoSpending: (b) => `Buong ${b} na badyet ay available pa ngayon.`,
    tipPlanFixed: () => "Simulan sa pagpaplano ng mga kilalang fixed na gastos, tapos ilaan ang natitira para sa iba.",
    statusFallback: () => "Mag-log ng gastos para makita ang iyong reality check.",
    tipSetBudget: () => "Mag-set ng daily budget sa Settings para masubaybayan ng Budglet ang iyong progreso.",
  },
  ceb: {
    statusOverBoth: (d, m) => `${d} na ka sobra karon ug ${m} na ka sobra sa imong buwanang budget.`,
    tipRecoverByMonthEnd: (under, n) => `Para mabawi sa katapusan sa buwan, ayaw molabaw sa ${under} matag adlaw sa sunod nga ${n} ka adlaw.`,
    tipLastDayBoth: () => "Kataposang adlaw sa buwan — preskuhon na ang tanan nga dili kinahanglan karon.",
    statusOverDaily: (o) => `${o} na ka sobra sa budget karon.`,
    tipSkipBiggest: (label, amt) => `Sa sunod, hunahunaa ang preskuha o bahin-bahin ang "${label}" (${amt}) — igo na kana para manatili sa budget.`,
    tipSpendNothing: (o) => `Ayaw nag gastos karon ug bawasan og ${o} ang budget ugma para manatili sa track.`,
    statusProjectionOver: (o) => `Sa niining saka, mosobra ka og ${o} sa budget niining bulana.`,
    tipCapDaily: (amt, n) => `Limitahan ang adlaw-adlaw nga gastos sa ${amt} sa nahibilin nga ${n} ka adlaw para eksaktong maabtan ang budget.`,
    tipFinalDay: () => "Kataposang adlaw sa buwan — ayaw nag gastos pa.",
    statusApproaching: (r) => `${r} na lang ang nahibilin sa budget karon.`,
    tipPauseNow: () => "Hunonga na ang tanan nga dili kinahanglan nga gastos — usa pa lang ang makapasaka sa imong limitasyon.",
    statusOnTrack: (s) => `Giaasahan nga matapos ang buwan nga ${s} ubos sa budget.`,
    tipSaveSurplus: () => "Ibalhin na ang sobra sa ipon sa dili pa nimo ipagastos.",
    statusBiggest: (label, amt) => `Pinaka-dakong gastos karon: "${label}" nga ${amt}.`,
    tipRecurring: () => "Kon kini kanunay nga gastos, isulat isip fixed nga gasto ug planoha ang nahibilin sa adlaw sa palibot niini.",
    statusNoSpending: (b) => `Tibuok ${b} nga budget magamit pa karon.`,
    tipPlanFixed: () => "Sugdi pinaagi sa pagplano sa nahibaloan nga fixed nga gastos, dayon ihatag ang nahibilin para sa uban.",
    statusFallback: () => "Mag-log og gastos para makita ang imong reality check.",
    tipSetBudget: () => "Mag-set og daily budget sa Settings para masubay sa Budglet ang imong progress.",
  },
}

export function realityCheckT(lang: Language): RealityCheckStrings {
  return realityCheckStrings[lang]
}

export const GPT_LANGUAGE_INSTRUCTION: Record<Language, string> = {
  en: '',
  tl: 'Respond entirely in Tagalog (Filipino).',
  ceb: 'Respond entirely in Bisaya (Cebuano).',
}
