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
// Severity tiers for over-budget messages:
//   normal  = 1–50% over limit  → blunt and direct
//   severe  = >50% over limit   → angry, no mercy
// ─────────────────────────────────────────────────────────────────────────────

interface RealityCheckStrings {
  // Over daily + monthly — normal
  statusOverBoth: (daily: string, monthly: string) => string
  tipRecoverByMonthEnd: (under: string, n: number) => string
  tipLastDayBoth: () => string
  // Over daily + monthly — severe
  statusOverBothSevere: (daily: string, monthly: string) => string
  tipRecoverEmergency: (under: string, n: number) => string
  tipLastDayBothSevere: () => string
  // Over daily only — normal
  statusOverDaily: (overage: string) => string
  tipSkipBiggest: (label: string, amount: string) => string
  tipSpendNothing: (overage: string) => string
  // Over daily only — severe
  statusOverDailySevere: (overage: string, pct: number) => string
  tipShutItDown: () => string
  // Monthly projection over
  statusProjectionOver: (overage: string) => string
  tipCapDaily: (amount: string, n: number) => string
  tipFinalDay: () => string
  // Approaching limit
  statusApproaching: (remaining: string) => string
  tipPauseNow: () => string
  // On track
  statusOnTrack: (surplus: string) => string
  tipSaveSurplus: () => string
  // Biggest item context
  statusBiggest: (label: string, amount: string) => string
  tipRecurring: () => string
  // No spending
  statusNoSpending: (budget: string) => string
  tipPlanFixed: () => string
  // Fallback
  statusFallback: () => string
  tipSetBudget: () => string
}

const realityCheckStrings: Record<Language, RealityCheckStrings> = {
  en: {
    // ── over both — normal ─────────────────────────────────────────────────
    statusOverBoth: (d, m) =>
      `You've blown past your daily budget by ${d} and you're ${m} over for the month. This is a problem.`,
    tipRecoverByMonthEnd: (under, n) =>
      `You need to stay under ${under} every single day for the next ${n} day${n > 1 ? 's' : ''} to dig yourself out.`,
    tipLastDayBoth: () =>
      "Last day of the month and both budgets are gone. Put the wallet down.",

    // ── over both — severe (>50% over daily) ──────────────────────────────
    statusOverBothSevere: (d, m) =>
      `${d} over today. ${m} over this month. You torched both budgets — what is going on?`,
    tipRecoverEmergency: (under, n) =>
      `Emergency mode: ${under}/day maximum for the next ${n} day${n > 1 ? 's' : ''}. Not a suggestion.`,
    tipLastDayBothSevere: () =>
      "Last day of the month, both budgets in flames. Zero spending. Full stop.",

    // ── over daily — normal ────────────────────────────────────────────────
    statusOverDaily: (o) =>
      `You went ${o} over budget today. Not great — what happened?`,
    tipSkipBiggest: (label, amt) =>
      `Cut "${label}" (${amt}) next time — that one item is what pushed you over the edge.`,
    tipSpendNothing: (o) =>
      `Zero spending for the rest of today. Take the ${o} hit, learn from it, and move on.`,

    // ── over daily — severe (>50% over daily) ─────────────────────────────
    statusOverDailySevere: (o, pct) =>
      `You're ${o} over — that's ${pct}% past your limit. This is not a slip-up, this is a blowout.`,
    tipShutItDown: () =>
      "Shut it down. Not one more purchase today. You've already done enough damage.",

    // ── monthly projection over ────────────────────────────────────────────
    statusProjectionOver: (o) =>
      `You're on track to blow your budget by ${o} this month. That's not a forecast — that's a warning.`,
    tipCapDaily: (amt, n) =>
      `Lock yourself to ${amt}/day for the remaining ${n} day${n > 1 ? 's' : ''} or this month is a write-off.`,
    tipFinalDay: () =>
      "Last day of the month. Do not spend another cent — you're already too close.",

    // ── approaching limit ─────────────────────────────────────────────────
    statusApproaching: (r) =>
      `Only ${r} left before you blow today's budget. You're dangerously close.`,
    tipPauseNow: () =>
      "Stop right now. Every purchase from here is a step toward going over.",

    // ── on track ──────────────────────────────────────────────────────────
    statusOnTrack: (s) =>
      `You're projected to finish the month ${s} under budget. Respect.`,
    tipSaveSurplus: () =>
      "Move that surplus to savings now — before you find something to spend it on.",

    // ── biggest item context ───────────────────────────────────────────────
    statusBiggest: (label, amt) =>
      `Biggest hit today: "${label}" at ${amt}.`,
    tipRecurring: () =>
      "If this is recurring, log it as a fixed cost and plan your discretionary spending around it.",

    // ── no spending ────────────────────────────────────────────────────────
    statusNoSpending: (b) =>
      `Full ${b} budget intact. Clean slate.`,
    tipPlanFixed: () =>
      "Decide your fixed expenses first, then give every peso that's left a job before you spend it.",

    // ── fallback ───────────────────────────────────────────────────────────
    statusFallback: () => "Start logging expenses to see your reality check.",
    tipSetBudget: () =>
      "Set a daily budget in Settings — no budget means no accountability.",
  },

  tl: {
    // ── over both — normal ─────────────────────────────────────────────────
    statusOverBoth: (d, m) =>
      `Nilampasan mo ang daily budget ng ${d} at ${m} na ang sobra mo sa buwan. Malaking problema ito.`,
    tipRecoverByMonthEnd: (under, n) =>
      `Kailangan mong manatili sa ${under} bawat araw sa susunod na ${n} araw para makabawi. Seryosohin mo.`,
    tipLastDayBoth: () =>
      "Huling araw ng buwan at wala ka nang budget. Itigil na ang pagga-gastos.",

    // ── over both — severe ─────────────────────────────────────────────────
    statusOverBothSevere: (d, m) =>
      `${d} sobra ngayon. ${m} sobra ngayong buwan. Sinunog mo ang dalawang budget — ano ba 'yan?!`,
    tipRecoverEmergency: (under, n) =>
      `Emergency mode: ${under} lang bawat araw sa susunod na ${n} araw. Ito ay utos, hindi suhestyon.`,
    tipLastDayBothSevere: () =>
      "Huling araw ng buwan, dalawang budget ang nawasak. Zero na gastos. Tapos na.",

    // ── over daily — normal ────────────────────────────────────────────────
    statusOverDaily: (o) =>
      `Lumampas ka ng ${o} sa budget ngayon. Hindi maganda — bakit nangyari ito?`,
    tipSkipBiggest: (label, amt) =>
      `Alisin ang "${label}" (${amt}) sa susunod — yung isang item na iyan ang nagtulak sa iyo sa labas ng budget.`,
    tipSpendNothing: (o) =>
      `Wala nang gastos ngayon. Tanggapin ang ${o} na pagkakamali, matuto, at sige na.`,

    // ── over daily — severe ────────────────────────────────────────────────
    statusOverDailySevere: (o, pct) =>
      `${o} na sobra ka — ${pct}% lampas na sa limit mo! Hindi ito maliit na bagay, ito ay pagsabog ng budget!`,
    tipShutItDown: () =>
      "Tigilan mo na. Wala nang kahit isang gastos pa ngayon. Sobra na ang nagawa mo.",

    // ── monthly projection over ────────────────────────────────────────────
    statusProjectionOver: (o) =>
      `Sa ganitong takbo, lalampas ka ng ${o} sa budget ngayong buwan. Babala ito, hindi hula.`,
    tipCapDaily: (amt, n) =>
      `I-lock ang gastos sa ${amt} bawat araw sa natitirang ${n} araw o maging write-off na ang buwang ito.`,
    tipFinalDay: () =>
      "Huling araw ng buwan. Huwag nang gumastos pa — malapit ka na sa limitasyon.",

    // ── approaching limit ──────────────────────────────────────────────────
    statusApproaching: (r) =>
      `${r} na lang bago mabasag ang budget ngayon. Mapanganib ka na nang malapit.`,
    tipPauseNow: () =>
      "Huminto ka na ngayon. Bawat gastos mula rito ay isang hakbang patungo sa pagsobra.",

    // ── on track ───────────────────────────────────────────────────────────
    statusOnTrack: (s) =>
      `Inaasahang matapos ang buwan na ${s} sa loob ng budget. Respeto.`,
    tipSaveSurplus: () =>
      "Ilipat na ang sobra sa ipon ngayon — bago mo pa mahanap ang pagkakataong gastusin ito.",

    // ── biggest item context ───────────────────────────────────────────────
    statusBiggest: (label, amt) =>
      `Pinakamalaking tinamaan ngayon: "${label}" na ${amt}.`,
    tipRecurring: () =>
      "Kung paulit-ulit ito, itala bilang fixed na gastos at planuhin ang natitira sa araw sa paligid nito.",

    // ── no spending ────────────────────────────────────────────────────────
    statusNoSpending: (b) =>
      `Buong ${b} na budget — buo pa. Malinis na simula.`,
    tipPlanFixed: () =>
      "Tukuyin muna ang mga fixed na gastos, tapos bigyan ng trabaho ang bawat peso bago gastusin.",

    // ── fallback ───────────────────────────────────────────────────────────
    statusFallback: () => "Mag-log ng gastos para makita ang iyong reality check.",
    tipSetBudget: () =>
      "Mag-set ng daily budget sa Settings — walang budget, walang accountability.",
  },

  ceb: {
    // ── over both — normal ─────────────────────────────────────────────────
    statusOverBoth: (d, m) =>
      `Nalapas nimo ang daily budget og ${d} ug ${m} na ang imong sobra niining bulana. Dako na ang problema kani.`,
    tipRecoverByMonthEnd: (under, n) =>
      `Kinahanglan nga manatili ka sa ${under} matag adlaw sa sunod nga ${n} ka adlaw para makabawi. Seryosohon mo kini.`,
    tipLastDayBoth: () =>
      "Kataposang adlaw sa buwan ug wala nay budget. Undang na sa pagga-gasto.",

    // ── over both — severe ─────────────────────────────────────────────────
    statusOverBothSevere: (d, m) =>
      `${d} sobra karon. ${m} sobra niining bulana. Gisunug nimo ang duha ka budget — unsa ba kana?!`,
    tipRecoverEmergency: (under, n) =>
      `Emergency mode: ${under} lang matag adlaw sa sunod nga ${n} ka adlaw. Mando kini, dili suhestyon.`,
    tipLastDayBothSevere: () =>
      "Kataposang adlaw sa buwan, duha ka budget ang guba. Zero nga gastos. Katapusan na.",

    // ── over daily — normal ────────────────────────────────────────────────
    statusOverDaily: (o) =>
      `Nakasobra ka og ${o} sa budget karon. Dili maayo — nganong nahitabo man kini?`,
    tipSkipBiggest: (label, amt) =>
      `Tangtangon ang "${label}" (${amt}) sa sunod — kana lang nga item ang nagtulod nimo sa gawas sa budget.`,
    tipSpendNothing: (o) =>
      `Walay gastos na karon. Dawata ang ${o} nga sayop, pagkat-on, ug padayon na.`,

    // ── over daily — severe ────────────────────────────────────────────────
    statusOverDailySevere: (o, pct) =>
      `${o} na sobra ka — ${pct}% ka na lapas sa limit mo! Dili kini gamay nga sayop, pagpabuto kini sa budget!`,
    tipShutItDown: () =>
      "Undanga na. Wala nay bisan usa ka gastos pa karon. Sobra na ang imong nabuhat.",

    // ── monthly projection over ────────────────────────────────────────────
    statusProjectionOver: (o) =>
      `Sa niining saka, mosobra ka og ${o} sa budget niining bulana. Pasidaan kini, dili tagna.`,
    tipCapDaily: (amt, n) =>
      `I-lock ang gastos sa ${amt} matag adlaw sa nahibilin nga ${n} ka adlaw o maging write-off na kining bulan.`,
    tipFinalDay: () =>
      "Kataposang adlaw sa buwan. Ayaw nag gastos pa — hapit ka na sa limitasyon.",

    // ── approaching limit ──────────────────────────────────────────────────
    statusApproaching: (r) =>
      `${r} na lang ang babag nimo sa paglapas sa budget karon. Peligroso ka na kaduol.`,
    tipPauseNow: () =>
      "Hunonga na karon. Ang matag gastos gikan karon usa ka lakang padulong sa pagsobra.",

    // ── on track ───────────────────────────────────────────────────────────
    statusOnTrack: (s) =>
      `Giaasahan nga matapos ang buwan nga ${s} ubos sa budget. Respeto.`,
    tipSaveSurplus: () =>
      "Ibalhin na ang sobra sa ipon karon — sa dili pa nimo makit-an ang buhaton nimo niini.",

    // ── biggest item context ───────────────────────────────────────────────
    statusBiggest: (label, amt) =>
      `Pinaka-dakong gasto karon: "${label}" nga ${amt}.`,
    tipRecurring: () =>
      "Kon kini kanunay, isulat isip fixed nga gasto ug planoha ang nahibilin sa adlaw sa palibot niini.",

    // ── no spending ────────────────────────────────────────────────────────
    statusNoSpending: (b) =>
      `Tibuok ${b} nga budget — buo pa. Limpyo nga sugod.`,
    tipPlanFixed: () =>
      "Tukuyon una ang mga fixed nga gastos, dayon hatagan og trabaho ang matag piso sa dili pa gastusin.",

    // ── fallback ───────────────────────────────────────────────────────────
    statusFallback: () => "Mag-log og gastos para makita ang imong reality check.",
    tipSetBudget: () =>
      "Mag-set og daily budget sa Settings — walay budget, walay accountability.",
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
