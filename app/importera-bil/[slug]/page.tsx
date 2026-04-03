import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountries, getCountryBySlug, getCarBrands, getCarBrandBySlug, getCarBrandImportData, formatSEK } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/headings";
import { CostTable } from "@/components/CostTable";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

// === Brand-specific data: Garanti, Fordonsskatt, FAQ ===

interface GarantiItem { title: string; text: string; list?: string[] }
interface FordonsskattRow { model: string; co2: string; fuel: string; malus: string; after: string }
interface FaqItem { question: string; answer: string }

const BRAND_GARANTI: Record<string, { intro: string; items: GarantiItem[]; source: string }> = {
  bmw: {
    intro: "BMW har internationell garanti inom EU — men det finns viktiga detaljer att känna till.",
    items: [
      { title: "Nybilsgaranti", text: "BMW:s standardgaranti (vanligtvis 2 år utan milbegränsning) gäller inom hela EU. När du importerar en BMW som fortfarande har garanti kvar kan du använda vilken auktoriserad BMW-verkstad som helst i Sverige." },
      { title: "Vad du måste göra", text: "Kontakta en svensk BMW-återförsäljare efter importen och be dem registrera bilen i det svenska BMW-systemet. Ta med dig:", list: ["Köpehandling med VIN", "Servicehistorik (digital eller Scheckheft)", "COC-intyg"] },
      { title: "Batterigaranti (laddhybrider/elbilar)", text: "BMW ger vanligtvis 8 år eller 160 000 km på högvoltsbatteriet. Denna garanti gäller internationellt inom EU — kontrollera alltid det specifika garantibeviset med säljaren före köp." },
      { title: "Serviceavtal", text: "BMW Service Inclusive (BSI) eller liknande serviceavtal kan vara landsbundna. Kontrollera med BMW Sverige om ett tyskt serviceavtal kan överföras innan du räknar det som en fördel." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med BMW Sverige (bmw.se) eller din lokala BMW-återförsäljare.",
  },
  mercedes: {
    intro: "Mercedes-Benz har internationell garanti inom EU och ett av de bredaste auktoriserade verkstadsnätverken i Sverige.",
    items: [
      { title: "Nybilsgaranti", text: "Mercedes-Benz erbjuder 2 års nybilsgaranti utan milbegränsning som gäller inom hela EU. Kontakta en auktoriserad Mercedes-verkstad i Sverige för att registrera bilen i det svenska systemet efter importen." },
      { title: "Vad du måste göra", text: "Besök en auktoriserad Mercedes-verkstad med följande dokument:", list: ["Köpehandling med VIN", "Servicehistorik (digital servicebok)", "COC-intyg", "Eventuellt garantibevis från säljaren"] },
      { title: "Batterigaranti (EQ-modeller)", text: "Mercedes ger vanligtvis 8 år eller 160 000 km på högvoltsbatteriet i EQ-modeller (EQA, EQB, EQC, EQS). Garantin gäller internationellt inom EU." },
      { title: "Serviceavtal", text: "Mercedes Service-avtal kan vara landsbundna. Kontrollera med Mercedes Sverige om ett tyskt avtal kan överföras. Mercedes har ett av de bredaste auktoriserade verkstadsnätverken i Sverige, vilket gör garantiservice enkel." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med Mercedes-Benz Sverige (mercedes-benz.se) eller din lokala Mercedes-återförsäljare.",
  },
  volkswagen: {
    intro: "Volkswagen har internationell garanti inom EU och ett av de tätaste verkstadsnäten i Sverige — garanti är sällan ett problem vid VW-import.",
    items: [
      { title: "Nybilsgaranti", text: "VW erbjuder 2 års nybilsgaranti utan milbegränsning som gäller inom hela EU. Tack vare VW:s täta verkstadsnät i Sverige är det enkelt att nyttja kvarvarande garanti efter import." },
      { title: "Vad du måste göra", text: "Besök en auktoriserad VW-verkstad i Sverige för att registrera bilen. Ta med dig:", list: ["Köpehandling med VIN", "Servicehistorik (digital servicebok eller Scheckheft)", "COC-intyg"] },
      { title: "Batterigaranti (ID-modeller)", text: "VW ger 8 år eller 160 000 km på högvoltsbatteriet i ID-serien (ID.3, ID.4, ID.5). Garantin gäller internationellt inom EU." },
      { title: "Das WeltAuto-garanti", text: "Begagnade bilar köpta via Das WeltAuto (VW:s begagnatprogram) kan ha tilläggsgaranti — men denna är ofta landsbunden. Kontrollera med VW Sverige om den överförs vid import innan du räknar den som en fördel." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med Volkswagen Sverige (volkswagen.se) eller din lokala VW-återförsäljare.",
  },
  audi: {
    intro: "Audi har internationell EU-garanti och delar servicenät med Volkswagen — vilket ger bred täckning i Sverige.",
    items: [
      { title: "Nybilsgaranti", text: "Audi erbjuder 2 års nybilsgaranti som gäller inom hela EU. Audi och VW delar servicenät, vilket innebär brett verkstadsutbud i Sverige." },
      { title: "Vad du måste göra", text: "Kontakta en auktoriserad Audi-återförsäljare i Sverige för att registrera bilen i det svenska systemet. Ta med dig:", list: ["Köpehandling med VIN", "Servicehistorik (digital servicebok eller Scheckheft)", "COC-intyg"] },
      { title: "Batterigaranti (e-tron-modeller)", text: "Audi ger 8 år eller 160 000 km på högvoltsbatteriet i e-tron-modeller (Q4 e-tron, e-tron GT). Garantin gäller internationellt inom EU." },
      { title: "Audi Approved :plus", text: "Audis begagnatgarantiprogram (Audi Approved :plus) kan vara landsbundet. Kontrollera med Audi Sverige om garantin överförs vid import från en tysk Audi-handlare." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med Audi Sverige (audi.se) eller din lokala Audi-återförsäljare.",
  },
  porsche: {
    intro: "Porsche har internationell EU-garanti — men ett begränsat verkstadsnät i Sverige som kan påverka servicetillgängligheten.",
    items: [
      { title: "Nybilsgaranti", text: "Porsche erbjuder 2 års nybilsgaranti utan milbegränsning som gäller inom hela EU. Du kan använda vilken auktoriserad Porsche-verkstad som helst i Sverige." },
      { title: "Begränsat verkstadsnät", text: "Porsche har ett begränsat antal auktoriserade verkstäder i Sverige (främst Stockholm, Göteborg, Malmö). Kontrollera avstånd till närmaste servicepoint innan du importerar." },
      { title: "Batterigaranti (Taycan)", text: "Porsche ger 8 år eller 160 000 km på högvoltsbatteriet i Taycan. Garantin gäller internationellt inom EU." },
      { title: "Porsche Approved", text: "Porsches begagnatgarantiprogram (Porsche Approved) kan ge utökad garanti på begagnade bilar. Kontrollera om den överförs vid import — det varierar. Porsche-bilar behåller generellt andrahandsvärde väl även som importerade." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med Porsche Sverige (porsche.se) eller din lokala Porsche Center.",
  },
  tesla: {
    intro: "Teslas garanti gäller internationellt och är inte bundet till något specifikt land — men det finns unika aspekter att känna till.",
    items: [
      { title: "Nybilsgaranti", text: "Tesla erbjuder 4 års nybilsgaranti eller 80 000 km (det som inträffar först). Garantin gäller internationellt och hanteras via Tesla Service Centers." },
      { title: "Inget traditionellt återförsäljarnät", text: "Tesla har inga auktoriserade återförsäljare — all service sker via Tesla Service Centers. I Sverige finns de i Stockholm, Göteborg och Malmö samt via mobila servicetekniker." },
      { title: "Batterigaranti", text: "Tesla ger 8 år på högvoltsbatteriet: 120 000 km (Model 3 Standard), 160 000 km (Model 3 Long Range, Model Y) eller 200 000 km (Model S, Model X). Garantin gäller internationellt." },
      { title: "COC-intyg", text: "Tesla tillhandahåller ofta COC-intyg gratis — en unik fördel jämfört med andra märken där COC ibland kostar 200–400 EUR." },
      { title: "Autopilot och FSD", text: "Kontrollera att Full Self Driving (FSD) eller Enhanced Autopilot-licenser överförs vid ägarbyte. Detta har historiskt varit problematiskt — Tesla kan i vissa fall återkalla mjukvaran vid ägarbytet." },
    ],
    source: "Kontrollera alltid aktuella villkor direkt med Tesla Sverige (tesla.com/sv_se).",
  },
};

const BRAND_FORDONSSKATT: Record<string, { intro?: string; rows: FordonsskattRow[] }> = {
  bmw: { rows: [
    { model: "320i (G20)", co2: "ca 142", fuel: "Bensin", malus: "ca 7 534 kr/år", after: "360 kr/år" },
    { model: "330e (G20)", co2: "ca 21", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "520d (G30)", co2: "ca 127", fuel: "Diesel", malus: "ca 8 917 kr/år", after: "ca 2 467 kr/år" },
    { model: "530e (G60)", co2: "ca 21", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "X3 xDrive30e", co2: "ca 27", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "X5 xDrive40i", co2: "ca 195", fuel: "Bensin", malus: "ca 16 590 kr/år", after: "360 kr/år" },
    { model: "i4 eDrive40", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "iX xDrive40", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
  mercedes: { rows: [
    { model: "A 200", co2: "ca 130", fuel: "Bensin", malus: "ca 5 486 kr/år", after: "360 kr/år" },
    { model: "C 200 (W206)", co2: "ca 150", fuel: "Bensin", malus: "ca 8 901 kr/år", after: "360 kr/år" },
    { model: "C 300 de", co2: "ca 25", fuel: "Diesel/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "E 220 d (W214)", co2: "ca 130", fuel: "Diesel", malus: "ca 7 826 kr/år", after: "ca 2 327 kr/år" },
    { model: "E 300 e", co2: "ca 20", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "EQA 250", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "EQC 400", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
  volkswagen: { rows: [
    { model: "Golf 8 1.5 TSI", co2: "ca 125", fuel: "Bensin", malus: "ca 4 632 kr/år", after: "360 kr/år" },
    { model: "Golf GTE", co2: "ca 20", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Tiguan 2.0 TSI", co2: "ca 165", fuel: "Bensin", malus: "ca 11 462 kr/år", after: "360 kr/år" },
    { model: "Tiguan eHybrid", co2: "ca 25", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "ID.3", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "ID.4", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
  audi: { rows: [
    { model: "A3 35 TFSI", co2: "ca 130", fuel: "Bensin", malus: "ca 5 486 kr/år", after: "360 kr/år" },
    { model: "A4 40 TFSI", co2: "ca 145", fuel: "Bensin", malus: "ca 8 047 kr/år", after: "360 kr/år" },
    { model: "A6 50 TFSIe", co2: "ca 22", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Q5 55 TFSIe", co2: "ca 28", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Q4 e-tron", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "e-tron GT", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
  porsche: { rows: [
    { model: "Cayenne E-Hybrid", co2: "ca 30", fuel: "Bensin/El (PHEV)", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Cayenne S", co2: "ca 220", fuel: "Bensin", malus: "ca 20 860 kr/år", after: "360 kr/år" },
    { model: "Macan 2.0T", co2: "ca 195", fuel: "Bensin", malus: "ca 16 590 kr/år", after: "360 kr/år" },
    { model: "911 Carrera", co2: "ca 210", fuel: "Bensin", malus: "ca 19 153 kr/år", after: "360 kr/år" },
    { model: "Taycan 4S", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
  tesla: { intro: "Alla Tesla-modeller är helt eldrivna och betalar bara grundbelopp 360 kr/år i fordonsskatt — ingen malus oavsett modell.", rows: [
    { model: "Model 3", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Model Y", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Model S", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
    { model: "Model X", co2: "0", fuel: "El", malus: "360 kr/år", after: "360 kr/år" },
  ]},
};

const BRAND_FAQ: Record<string, FaqItem[]> = {
  bmw: [
    { question: "Gäller BMW-garanti i Sverige vid import?", answer: "Ja, BMW har internationell EU-garanti. Kontakta en svensk BMW-återförsäljare efter importen för att registrera bilen i det svenska systemet. Ta med köpehandling, servicehistorik och COC-intyg." },
    { question: "Vilka BMW-modeller är bäst att importera?", answer: "3-serien, 5-serien och X3 har bäst ADAC-betyg och störst prisskillnad mot Sverige. Undvik N47-dieselmotorn (2007–2013) på grund av kända timing-kedjeproblematik." },
    { question: "Vad kostar det att importera en BMW från Tyskland?", answer: "Utöver bilpriset tillkommer ca 4 440 kr i fasta avgifter (ursprungskontroll 1 240 kr + registreringsbesiktning ca 1 700 kr + skyltavgift 500 kr) plus transport. Använd vår kalkylator för en exakt beräkning." },
  ],
  mercedes: [
    { question: "Gäller Mercedes-garanti i Sverige vid import?", answer: "Ja, Mercedes-Benz har internationell EU-garanti (2 år utan milbegränsning). Kontakta en auktoriserad Mercedes-verkstad i Sverige för att registrera bilen. Mercedes har ett av de bredaste verkstadsnätverken i Sverige." },
    { question: "Vilka Mercedes-modeller är bäst att importera?", answer: "C-klass och E-klass har bäst ADAC-betyg och stor prisskillnad mot Sverige. PHEV-varianter (C 300 de, E 300 e) ger dessutom minimalt malus-tillägg." },
    { question: "Är Mercedes dyrare att serva i Sverige som importbil?", answer: "Nej, servicekostnaden är densamma som för svensksålda Mercedes. Garanti och service hanteras av samma auktoriserade verkstäder. Kontrollera dock att eventuella tyska serviceavtal överförs." },
  ],
  volkswagen: [
    { question: "Gäller Volkswagen-garanti i Sverige vid import?", answer: "Ja, VW har internationell EU-garanti (2 år utan milbegränsning). VW har ett av de tätaste verkstadsnäten i Sverige, vilket gör garantiservice enkelt." },
    { question: "Vilka Volkswagen-modeller är bäst att importera?", answer: "Golf, Tiguan och ID.4 har bäst ADAC-betyg och stor prisskillnad mot Sverige. PHEV-varianter (Golf GTE, Tiguan eHybrid) slipper malus helt." },
    { question: "Kan jag använda Das WeltAuto-garanti på importerad VW?", answer: "Das WeltAuto-garanti (VW:s begagnatprogram) kan vara landsbunden. Kontrollera med VW Sverige innan du räknar med den. Nybilsgarantin gäller dock alltid inom EU." },
  ],
  audi: [
    { question: "Gäller Audi-garanti i Sverige vid import?", answer: "Ja, Audi har internationell EU-garanti (2 år). Audi delar servicenät med VW, vilket ger brett verkstadsutbud i Sverige." },
    { question: "Vilka Audi-modeller är bäst att importera?", answer: "A4, A6 och Q5 har bra ADAC-betyg och stor prisskillnad mot Sverige. PHEV-varianter (A6 50 TFSIe, Q5 55 TFSIe) slipper malus helt." },
    { question: "Överförs Audi Approved-garanti vid import?", answer: "Audi Approved :plus (begagnatgaranti) kan vara landsbunden. Kontrollera med Audi Sverige om garantin överförs vid import från en tysk Audi-handlare. Nybilsgarantin gäller alltid inom EU." },
  ],
  porsche: [
    { question: "Gäller Porsche-garanti i Sverige vid import?", answer: "Ja, Porsche har internationell EU-garanti (2 år). Observera att Porsche har ett begränsat verkstadsnät i Sverige (främst Stockholm, Göteborg, Malmö)." },
    { question: "Vilka Porsche-modeller är bäst att importera?", answer: "Cayenne E-Hybrid och Taycan har lägst fordonsskatt. Macan och Cayenne har störst prisskillnad mot Sverige. 911:an behåller andrahandsvärde väl även som importbil." },
    { question: "Behåller en importerad Porsche sitt andrahandsvärde?", answer: "Ja, Porsche behåller generellt andrahandsvärde väl oavsett ursprungsland. Komplett servicehistorik och Porsche Approved-status kan dock påverka värdet positivt." },
  ],
  tesla: [
    { question: "Gäller Tesla-garanti i Sverige vid import?", answer: "Ja, Teslas garanti gäller internationellt. 4 års nybilsgaranti (80 000 km) och 8 års batterigaranti (120 000–200 000 km beroende på modell). Service hanteras via Tesla Service Centers." },
    { question: "Vilka Tesla-modeller är bäst att importera?", answer: "Model 3 och Model Y har störst prisskillnad mot Sverige och är enklast att importera. Alla Tesla-modeller betalar bara 360 kr/år i fordonsskatt (ingen malus)." },
    { question: "Fungerar Tesla Autopilot/FSD efter import till Sverige?", answer: "Autopilot och navigeringsfunktioner fungerar efter import. Men kontrollera att Full Self Driving (FSD) eller Enhanced Autopilot-licenser överförs vid ägarbyte — Tesla kan i vissa fall återkalla mjukvaran." },
  ],
};

const BRAND_TITLES: Record<string, { title: string; description: string }> = {
  mercedes: { title: "Importera Mercedes från Tyskland – Kostnader, garanti och modeller 2026", description: "Importera Mercedes-Benz privat från Tyskland. Garanti, fordonsskatt per modell, ADAC-data och kalkylator." },
  volkswagen: { title: "Importera Volkswagen från Tyskland – Guide med kostnader och tips 2026", description: "Importera Volkswagen privat från Tyskland. ADAC-data, garanti, fordonsskatt per modell och kalkylator." },
  audi: { title: "Importera Audi från Tyskland – Kostnader, ADAC-data och garanti 2026", description: "Importera Audi privat från Tyskland. Garanti, fordonsskatt per modell, ADAC-data och kalkylator." },
  porsche: { title: "Importera Porsche från Tyskland – Lönar det sig? Guide 2026", description: "Importera Porsche privat från Tyskland. Garanti, fordonsskatt per modell, ADAC-data och kalkylator." },
  tesla: { title: "Importera Tesla från Tyskland – Elbilsimport, garanti och kostnader 2026", description: "Importera Tesla privat från Tyskland. Garanti, batterigaranti, fordonsskatt och importkalkylator." },
};

// Guides relevant for all car brands
const CAR_IMPORT_GUIDES: {
  slug: string;
  title: string;
  desc: (brand: string) => string;
}[] = [
  {
    slug: "kopa-bil-mobile-de-autoscout24",
    title: "Söka bil på mobile.de – guide på svenska",
    desc: (brand) =>
      `Filtrera fram rätt ${brand}, tolka tyska annonser och undvik vanliga fallgropar på Europas största bilmarknad.`,
  },
  {
    slug: "hur-lang-tid-tar-bilimport",
    title: "Hur lång tid tar en bilimport?",
    desc: () =>
      "Räkna med 4–8 veckor från köp till svenska skyltar. Steg-för-steg-tidslinje så du vet vad som väntar.",
  },
  {
    slug: "transportera-bil-fran-tyskland",
    title: "Transportera bilen hem – egenköra, trailer eller spedition",
    desc: () =>
      "Tre alternativ med olika kostnader och risker. Vilket passar din situation och din budget bäst?",
  },
  {
    slug: "coc-intyg",
    title: "COC-intyg – vad det är och varför du behöver det",
    desc: (brand) =>
      `COC-intyget krävs för att registrera din ${brand} i Sverige. Kontrollera att det finns med vid köpet.`,
  },
  {
    slug: "ursprungskontroll",
    title: "Ursprungskontroll – obligatorisk efter hemkomst",
    desc: () =>
      "Beställ hos Transportstyrelsen (1 240 kr, 2025). Utan godkänd ursprungskontroll kan bilen inte registreras.",
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning – sista steget mot svenska skyltar",
    desc: (brand) =>
      `Ca 1 700 kr. Lär dig vad besiktningsmannen kontrollerar extra noga på en importerad ${brand}.`,
  },
  {
    slug: "moms-vid-bilimport",
    title: "Moms vid bilimport – när betalar du 25%?",
    desc: () =>
      "Avgörs av bilens ålder och körsträcka (6 månader / 6 000 km-regeln). Läs reglerna innan du köper.",
  },
];

// Extra guide for electric vehicles
const EV_GUIDE = {
  slug: "importera-elbil",
  title: "Importera elbil – batteristatus, laddkontakter och skillnader",
  desc: (brand: string) =>
    `Vad du måste kontrollera på en importerad ${brand}-elbil: batterihälsa (SoH), laddstandard och garanti.`,
};

// Slugs where the EV guide is relevant
const EV_BRAND_SLUGS = ["tesla", "volkswagen"];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const countrySlugs = getCountries().map((c) => ({ slug: c.slug }));
  const brandSlugs = getCarBrands().map((b) => ({ slug: b.slug }));
  return [...countrySlugs, ...brandSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const robots = getRobotsForPath(`/importera-bil/${slug}`);
  const country = getCountryBySlug(slug);
  if (country) {
    return {
      title: `Importera bil från ${country.name} – Komplett guide ${new Date().getFullYear()}`,
      description: `Allt du behöver veta för att importera bil privat från ${country.name} till Sverige. Kostnader, process och praktiska råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
      robots,
    };
  }

  const brand = getCarBrandBySlug(slug);
  if (brand) {
    const importData = getCarBrandImportData(slug);
    const year = new Date().getFullYear();
    const customTitle = BRAND_TITLES[slug];
    return {
      title: customTitle
        ? customTitle.title
        : importData
          ? `Importera ${brand.name} från Tyskland – Guide ${year} (ADAC-data, kostnader)`
          : `Importera ${brand.name} från Tyskland – Guide och kostnader`,
      description: customTitle
        ? customTitle.description
        : importData
          ? `Importera ${brand.name} privat från Tyskland. Rekommenderade modeller, kända problem (ADAC Pannenstatistik 2025), dokument att begära och kalkylator.`
          : `Hur importerar du en ${brand.name} privat från Tyskland? Guide med kostnader, tips och vanliga fallgropar.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
      robots,
    };
  }

  return {};
}

export default async function ImporteraBilPage({ params }: Props) {
  const { slug } = await params;

  const country = getCountryBySlug(slug);
  const brand = getCarBrandBySlug(slug);

  if (!country && !brand) notFound();

  const updatedDate = new Date().toISOString().split("T")[0];

  if (country) {
    const breadcrumbs = [
      { name: "Hem", href: "/" },
      { name: "Importera bil", href: "/importera-bil/tyskland" },
      { name: `Från ${country.name}` },
    ];

    // Flagship page: render full MDX content for Germany
    if (slug === "tyskland") {
      const mdxPath = path.join(process.cwd(), "content/importera-bil/tyskland.mdx");
      const source = await readFile(mdxPath, "utf-8");
      const headings = extractHeadings(source);
      const { content } = await compileMDX({
        source,
        options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
        components: { AffiliateLink },
      });

      const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Importera bil från Tyskland – Komplett guide 2026",
        datePublished: "2026-03-11",
        dateModified: "2026-03-13",
        author: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/importera-bil/tyskland` },
      };

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getBreadcrumbJsonLd(
                breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
              )),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <div className="mx-auto max-w-3xl px-4 py-10">
            <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
            <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-table:text-sm">
              <h1>Importera bil från Tyskland – Komplett guide 2026</h1>
              <TableOfContents headings={headings} />
              {content}
            </article>
          </div>
        </>
      );
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
            )),
          }}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Importera bil från {country.name} – Komplett guide {new Date().getFullYear()}
              </h1>
              <p className="text-gray-500 text-sm">
                Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              </p>
            </header>

            <p className="text-gray-700 mb-6 text-lg">
              {country.name} är {country.primaryMarket ? "den största marknaden" : "en populär marknad"} för
              begagnade bilar i Europa. Den här guiden förklarar steg för steg hur du som
              privatperson importerar en bil från {country.name} till Sverige.
            </p>

            {country.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                <p className="text-sm text-blue-800">{country.notes}</p>
              </div>
            )}

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Steg-för-steg: Så importerar du bil från {country.name}
              </h2>
              <ol className="space-y-4">
                {[
                  { title: "Hitta bilen", desc: `Sök på mobile.de, AutoScout24 eller liknande plattformar. Kontrollera att bilen inte är märkt som exportsåld.` },
                  { title: "Besiktiga och köp bilen", desc: "Resa ner för besiktning rekommenderas alltid. Kontrollera servicehistorik, COC-intyg och att bilen är fri från belastningar." },
                  { title: "Exportregistrering och hemtransport", desc: "Säljaren avregistrerar bilen. Du kan köra hem på röda exportskyltar eller anlita transport." },
                  { title: "Ursprungskontroll", desc: "Beställ ursprungskontroll hos Transportstyrelsen (1 240 kr, 2025)." },
                  { title: "Registreringsbesiktning", desc: "Boka registreringsbesiktning hos godkänd station. Ca 1 700 kr för personbil." },
                  { title: "Registrering i Sverige", desc: "När besiktningen är godkänd registrerar Transportstyrelsen bilen och du får svenska skyltar." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Kostnader vid import från {country.name}
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700">Kostnad</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Belopp</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Källa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="p-3">Ursprungskontroll</td><td className="p-3 text-right font-medium">1 240 kr</td><td className="p-3 text-xs text-gray-500">Transportstyrelsen (2025)</td></tr>
                  <tr><td className="p-3">Registreringsbesiktning</td><td className="p-3 text-right font-medium">~1 700 kr</td><td className="p-3 text-xs text-gray-500">Schablonvärde</td></tr>
                  <tr><td className="p-3">Transport (kör hem)</td><td className="p-3 text-right font-medium">~2 000 kr</td><td className="p-3 text-xs text-gray-500">Bränslekostnad</td></tr>
                  <tr><td className="p-3">Moms (om fordon anses nytt)</td><td className="p-3 text-right font-medium">25% av priset</td><td className="p-3 text-xs text-gray-500">Skatteverket</td></tr>
                  <tr><td className="p-3">Tull (EU-import)</td><td className="p-3 text-right font-medium text-green-700">0 kr</td><td className="p-3 text-xs text-gray-500">Tullverket</td></tr>
                </tbody>
              </table>
            </section>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Räkna ut din kostnad</h3>
              <Link href="/kalkylator/bilimport" className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                Öppna kalkylatorn
              </Link>
            </div>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Läs mer</h2>
              <ul className="space-y-2">
                <li><Link href="/guider/registreringsbesiktning" className="text-blue-700 hover:underline text-sm">Guide: Registreringsbesiktning →</Link></li>
                <li><Link href="/guider/coc-intyg" className="text-blue-700 hover:underline text-sm">Guide: COC-intyg →</Link></li>
                <li><Link href="/guider/ursprungskontroll" className="text-blue-700 hover:underline text-sm">Guide: Ursprungskontroll →</Link></li>
                <li><Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline text-sm">Guide: Moms vid bilimport →</Link></li>
              </ul>
            </section>
          </article>
        </div>
      </>
    );
  }

  // Brand page
  const importData = getCarBrandImportData(brand!.slug);
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: `Importera ${brand!.name}` },
  ];

  // Fallback: thin page for brands without import data
  if (!importData) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
            )),
          }}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Importera {brand!.name} från Tyskland – Guide {new Date().getFullYear()}
              </h1>
            </header>
            <p className="text-gray-700 mb-6">
              Att importera en {brand!.name} privat från Tyskland kan vara ett smart sätt att
              hitta rätt bil till ett bättre pris.
            </p>
            <p className="text-sm text-gray-600">
              Processen är densamma oavsett märke. Se vår fullständiga guide:{" "}
              <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
                Importera bil från Tyskland
              </Link>
            </p>
          </article>
        </div>
      </>
    );
  }

  // Rich brand page with import data
  const severityStyles: Record<string, { border: string; bg: string; text: string; label: string }> = {
    "hög": { border: "border-amber-600", bg: "bg-amber-50", text: "text-amber-800", label: "Hög risk" },
    "medel": { border: "border-blue-600", bg: "bg-blue-50", text: "text-blue-800", label: "Kontrollera" },
    "låg": { border: "border-gray-300", bg: "bg-gray-50", text: "text-gray-700", label: "Mindre allvarligt" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd(
            breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
          )),
        }}
      />
      {BRAND_FAQ[brand!.slug] && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFaqJsonLd(BRAND_FAQ[brand!.slug])),
          }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Importera {importData.name} från Tyskland – Guide {new Date().getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              {" "}· Källa: {importData.adacSource}
            </p>
          </header>

          {/* Intro */}
          <div className="mb-8 space-y-4">
            {importData.intro.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tesla-specific section */}
          {importData.teslaSpecific && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Så skiljer sig Tesla-köpet
              </h2>
              {importData.specialCaseNote && (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r">
                  <p className="text-sm text-blue-800">{importData.specialCaseNote}</p>
                </div>
              )}
              <dl className="space-y-4">
                {[
                  { label: "Batteristatus (SoH)", value: importData.teslaSpecific.batteryCheck },
                  { label: "Laddkontakt", value: importData.teslaSpecific.chargingConnector },
                  { label: "Supercharger-åtkomst", value: importData.teslaSpecific.superchargerAccess },
                  { label: "Garanti", value: importData.teslaSpecific.warranty },
                  { label: "Programvaruuppdateringar", value: importData.teslaSpecific.softwareUpdates },
                  { label: "Ägarbyte", value: importData.teslaSpecific.transferProcess },
                ].map((item, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-gray-900">{item.label}</dt>
                    <dd className="text-gray-700 text-sm mt-1">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Fact card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Snabbfakta – {importData.name} från Tyskland
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Prisintervall (EUR)</dt>
                <dd className="font-medium text-gray-900">
                  {importData.priceEUR.min.toLocaleString("sv-SE")}–{importData.priceEUR.max.toLocaleString("sv-SE")} EUR
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Prisintervall (SEK)</dt>
                <dd className="font-medium text-gray-900">
                  {formatSEK(importData.priceSEK.min)}–{formatSEK(importData.priceSEK.max)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Typisk besparing mot Sverige</dt>
                <dd className="font-medium text-gray-900">{importData.priceAdvantage}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Hitta bilar</dt>
                <dd className="font-medium text-gray-900">{importData.whereToBuy.join(", ")}</dd>
              </div>
            </dl>
          </div>

          {/* Recommended models */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rekommenderade modeller
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700">Modell</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Årsmodell</th>
                    <th className="text-left p-3 font-semibold text-gray-700">ADAC-betyg</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Notering</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importData.recommendedModels.map((model, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-gray-900">{model.model}</td>
                      <td className="p-3 text-gray-700">{model.years}</td>
                      <td className="p-3 text-gray-700 capitalize">{model.adacRating}</td>
                      <td className="p-3 text-gray-600 text-xs">{model.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Källa:{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>
            </p>
          </section>

          {/* Brand-specific: Garanti */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Garanti vid {importData.name}-import</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {BRAND_GARANTI[brand!.slug].intro}
              </p>
              <div className="space-y-4 text-sm text-gray-700">
                {BRAND_GARANTI[brand!.slug].items.map((item, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                    <p className="leading-relaxed">{item.text}</p>
                    {item.list && (
                      <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                        {item.list.map((li, j) => <li key={j}>{li}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">{BRAND_GARANTI[brand!.slug].source}</p>
            </section>
          )}

          {/* Brand-specific: Fordonsskatt */}
          {BRAND_FORDONSSKATT[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Fordonsskatt — populära {importData.name}-modeller</h2>
              {BRAND_FORDONSSKATT[brand!.slug].intro ? (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r mb-4">
                  <p className="text-sm text-blue-800">{BRAND_FORDONSSKATT[brand!.slug].intro}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Vid import till Sverige gäller svensk fordonsskatt. Under de tre första åren från första registrering (var som helst i världen) kan malus-tillägget bli betydande — särskilt för bensin- och dieselmodeller.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-700">Modell</th>
                      <th className="text-left p-3 font-semibold text-gray-700">CO₂ (g/km)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Bränsle</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Malus år 1–3</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Efter 3 år</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BRAND_FORDONSSKATT[brand!.slug].rows.map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-gray-900">{row.model}</td>
                        <td className="p-3 text-gray-700">{row.co2}</td>
                        <td className="p-3 text-gray-700">{row.fuel}</td>
                        <td className="p-3 text-gray-700">{row.malus}</td>
                        <td className="p-3 text-gray-700">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Beräkning baserad på regler gällande fr.o.m. 1 juni 2022. Grundbelopp 360 kr + koldioxidbelopp enligt Transportstyrelsens malus-regler. CO₂-värden är typiska WLTP-uppskattningar — kontrollera alltid det exakta värdet i bilens COC-intyg.{" "}
                Källa:{" "}
                <a href="https://www.transportstyrelsen.se/sv/vagtrafik/fordon/fordonsskatt/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  Transportstyrelsen
                </a>
              </p>
            </section>
          )}

          {/* Fahrzeugbrief guide – all car brands */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Hitta rätt i tyska handlingar (Fahrzeugbrief)</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                När du köper en {importData.name} i Tyskland får du registreringsbeviset (Zulassungsbescheinigung Teil I och Teil II). Här hittar du de viktigaste uppgifterna du behöver för svensk registrering.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Teil I (Fahrzeugschein)</p>
                  <ul className="text-xs text-gray-700 space-y-1.5">
                    <li><span className="font-medium">Fält V.7:</span> CO₂-utsläpp (g/km) — behövs för fordonsskatt-beräkning</li>
                    <li><span className="font-medium">Fält P.2:</span> Motoreffekt (kW)</li>
                    <li><span className="font-medium">Fält D.2:</span> Fordonstyp/variant</li>
                    <li><span className="font-medium">Fält B:</span> Datum för första registrering</li>
                    <li><span className="font-medium">Fält F.1/F.2:</span> Maxvikt/tjänstevikt</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Teil II (Fahrzeugbrief)</p>
                  <p className="text-xs text-gray-700 mb-2">
                    Detta är ägarbeviset — du <strong>måste</strong> få originalet vid köp.
                    Utan Teil II i original kan du inte bevisa ägande.
                  </p>
                  <p className="text-xs text-gray-500">
                    Tips: Fotografera alla sidor av Teil I och Teil II innan du lämnar säljaren.
                    Du behöver uppgifterna för ansökan om ursprungskontroll.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Known issues */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Kända problem att kontrollera
            </h2>
            <div className="space-y-4">
              {importData.knownIssues.map((issue, i) => {
                const style = severityStyles[issue.severity] ?? severityStyles["medel"];
                return (
                  <div key={i} className={`border-l-4 ${style.border} ${style.bg} p-4 rounded-r`}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{issue.issue}</h3>
                      <span className={`text-xs font-medium ${style.text} px-2 py-0.5 rounded-full border ${style.border}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{issue.description}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Problemområden baserade på{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>{" "}
              och branscherfarenhet.
            </p>
          </section>

          {/* Documents to request */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dokument att begära vid köp
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              {importData.documentsToRequest.map((doc, i) => (
                <li key={i} className="text-gray-700 text-sm">{doc}</li>
              ))}
            </ol>
          </section>

          {/* Import process 5 steps */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Importprocessen i 5 steg
            </h2>
            <ol className="space-y-4">
              {[
                { title: "Hitta din bil", desc: `Sök efter ${importData.name} på ${importData.whereToBuy.slice(0, 2).join(" eller ")}. Jämför priser och kontrollera att bilen har komplett dokumentation.` },
                { title: "Kontrollera och besiktiga", desc: "Verifiera servicehistorik, TÜV-rapport och COC-intyg. Boka oberoende besiktning (DEKRA eller TÜV) om möjligt." },
                { title: "Köp och transportera hem", desc: "Skriv köpekontrakt med VIN och kilometerstand. Transportera bilen till Sverige – kör hem eller anlita transport." },
                { title: "Ursprungskontroll och besiktning", desc: "Beställ ursprungskontroll hos Transportstyrelsen. Boka registreringsbesiktning hos godkänd station." },
                { title: "Registrera i Sverige", desc: "När besiktningen är godkänd registrerar Transportstyrelsen bilen och du får svenska skyltar." },
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              Läs den fullständiga steg-för-steg-guiden:{" "}
              <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
                Importera bil från Tyskland
              </Link>
            </p>
          </section>

          {/* CostTable for all brands with enriched content */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alla importavgifter</h2>
              <CostTable vehicleType="bil" compact />
            </section>
          )}

          {/* Calculator CTA */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Räkna ut vad din {importData.name}-import kostar
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Kalkylatorn räknar ut alla avgifter: moms, ursprungskontroll, besiktning och transport.
            </p>
            <Link
              href="/kalkylator/bilimport"
              className="inline-block rounded bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
            >
              Öppna kalkylatorn
            </Link>
          </div>

          {/* Affiliate CTA – Wise */}
          <div className="border border-gray-200 rounded-lg p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Betala i euro till lägre växelkurs</h3>
            <p className="text-sm text-gray-700 mb-3">
              Vid köp i Tyskland betalar du i euro. Med Wise får du bankens
              mittkurs utan dolda påslag – ofta flera tusen kronor billigare
              än din banks växelkurs vid stora belopp.
            </p>
            <AffiliateLink
              href="https://wise.prf.hn/click/camref:1100l5I28j"
              partner="Wise"
              className="text-blue-700 hover:underline font-medium"
            >
              Wise – valutaväxling till verklig mittkurs
            </AffiliateLink>
          </div>

          {/* Related guides */}
          {(() => {
            const guides = EV_BRAND_SLUGS.includes(brand!.slug)
              ? [...CAR_IMPORT_GUIDES, EV_GUIDE]
              : CAR_IMPORT_GUIDES;
            return (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Guider för din {importData.name}-import
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  Allt du behöver veta – från att hitta bilen i Tyskland till svenska skyltar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guider/${guide.slug}`}
                      className="group flex flex-col p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 mb-1 leading-snug">
                        {guide.title}
                      </span>
                      <span className="text-xs text-gray-600 leading-relaxed flex-1">
                        {guide.desc(importData.name)}
                      </span>
                      <span className="text-xs text-blue-700 mt-3 font-medium">
                        Läs guide &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Se även:{" "}
                  <Link href="/importera-bil/kostnad" className="text-blue-700 hover:underline">
                    Alla kostnader vid bilimport
                  </Link>
                </p>
              </section>
            );
          })()}
        </article>
      </div>
    </>
  );
}
