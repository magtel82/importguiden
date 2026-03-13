import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

interface GuideData {
  title: string;
  description: string;
  updatedDate: string;
  content: () => React.ReactNode;
}

const guides: Record<string, GuideData> = {
  "registreringsbesiktning": {
    title: "Registreringsbesiktning av importerad bil – Så fungerar det",
    description:
      "Allt om registreringsbesiktning vid import: vad kontrolleras, var gör man det och vad kostar det?",
    updatedDate: "2026-03-13",
    content: () => (
      <>
        <p className="text-gray-700 mb-6 text-lg">
          Alla importerade bilar måste genomgå en registreringsbesiktning innan de kan registreras
          och köras lagligt i Sverige. Här förklarar vi allt du behöver veta.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Vad är registreringsbesiktning?</h2>
          <p className="text-gray-700 mb-3">
            Registreringsbesiktning är en kontroll som genomförs av ett godkänt besiktningsföretag
            (Opus Bilprovning, Besikta, Dekra m.fl.). Kontrollen säkerställer att fordonet
            uppfyller svenska och europeiska tekniska krav och är trafiksäkert.
          </p>
          <p className="text-gray-700">
            Till skillnad från en vanlig kontrollbesiktning är registreringsbesiktningen mer
            grundlig – den kontrollerar att fordonet är korrekt typgodkänt och att alla
            delar uppfyller gällande krav.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Vad kontrolleras?</h2>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>Fordonsteknik och konstruktion</li>
            <li>Bromsar, styrning och hjulupphängning</li>
            <li>Belysning och reflexer (anpassning till vänstertrafik kan krävas)</li>
            <li>Avgassystem och utsläppsnivåer</li>
            <li>VIN-nummer (stämmer med papper)</li>
            <li>COC-intyg eller typintyg</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Kostnad</h2>
          <p className="text-gray-700 mb-2">
            Registreringsbesiktning kostar ungefär:
          </p>
          <ul className="space-y-1 list-disc list-inside text-gray-700">
            <li>Personbil: ca 1 500–1 900 kr</li>
            <li>Husbil: ca 3 000–5 000 kr</li>
            <li>MC: ca 1 000–1 500 kr</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Källa: Schablonvärden. Priser varierar mellan besiktningsstationer och fordonstyp.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Steg för steg</h2>
          <ol className="space-y-3">
            {[
              { step: "1", title: "Beställ ursprungskontroll först", desc: "Ursprungskontroll via Transportstyrelsen (1 240 kr) bör göras innan besiktning." },
              { step: "2", title: "Boka registreringsbesiktning", desc: "Kontakta valfri besiktningsstation och boka tid för registreringsbesiktning (ej kontrollbesiktning)." },
              { step: "3", title: "Ta med rätt papper", desc: "Utländskt registreringsbevis, COC-intyg, köpeavtal och ursprungskontrollsresultat." },
              { step: "4", title: "Genomför besiktningen", desc: "Bilen kontrolleras. Du får ett besiktningsprotokoll." },
              { step: "5", title: "Registrering", desc: "Med godkänd besiktning kan du registrera bilen hos Transportstyrelsen." },
            ].map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Relaterade guider</h3>
          <ul className="space-y-1">
            <li><Link href="/guider/ursprungskontroll" className="text-blue-700 hover:underline text-sm">Ursprungskontroll →</Link></li>
            <li><Link href="/guider/coc-intyg" className="text-blue-700 hover:underline text-sm">COC-intyg →</Link></li>
          </ul>
        </div>
      </>
    ),
  },
  "coc-intyg": {
    title: "COC-intyg – Vad är det och hur skaffar du det?",
    description:
      "Certificate of Conformity (COC) krävs vid import av bil inom EU. Läs vår guide om hur du skaffar det.",
    updatedDate: "2026-03-13",
    content: () => (
      <>
        <p className="text-gray-700 mb-6 text-lg">
          COC (Certificate of Conformity) är ett intyg från biltillverkaren som bekräftar att
          fordonet uppfyller EU:s tekniska krav. Det är ofta ett krav vid registreringsbesiktning
          i Sverige.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Vad är ett COC-intyg?</h2>
          <p className="text-gray-700 mb-3">
            COC är en förkortning av Certificate of Conformity (på svenska: typintyg eller
            EG-intyg om överensstämmelse). Det utfärdas av fordonstillverkaren och intygar
            att fordonet är typgodkänt och uppfyller EU-direktiv.
          </p>
          <p className="text-gray-700">
            Dokumentet innehåller teknisk information om fordonet: motor, vikt, utsläpp,
            chassinummer m.m.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Hur skaffar du ett COC-intyg?</h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="font-semibold text-gray-900">Kontrollera om säljaren har det</p>
                <p className="text-sm text-gray-600">
                  Be alltid säljaren om COC-intyget. Många bilar säljs med det i handlingarna.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="font-semibold text-gray-900">Beställ via tillverkarens importör</p>
                <p className="text-sm text-gray-600">
                  Kontakta den officiella importören i Sverige (eller landet du köper från).
                  Kostnad: 500–1 500 kr beroende på märke.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="font-semibold text-gray-900">Online-tjänster</p>
                <p className="text-sm text-gray-600">
                  Det finns tredjepartstjänster online som tillhandahåller COC-intyg. Kontrollera
                  seriositet noga.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Saknas COC-intyg?</h2>
          <p className="text-gray-700">
            Saknas COC-intyg kan du i vissa fall använda ett nationellt typintyg eller ett
            enskilt godkännande via Transportstyrelsen. Det tar längre tid och kostar mer.
            Kontakta besiktningsstationen i förväg för att diskutera din situation.
          </p>
        </section>
      </>
    ),
  },
  "ursprungskontroll": {
    title: "Ursprungskontroll vid bilimport – Guide och kostnader",
    description:
      "Vad är ursprungskontroll, varför behövs det och hur beställer du det hos Transportstyrelsen?",
    updatedDate: "2026-03-13",
    content: () => (
      <>
        <p className="text-gray-700 mb-6 text-lg">
          Ursprungskontroll är en obligatorisk kontroll som genomförs av Transportstyrelsen
          för alla importerade fordon. Den kostar 1 240 kr (2025) och syftar till att säkerställa
          att fordonet inte är stulet eller belastat med lån.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Varför krävs ursprungskontroll?</h2>
          <p className="text-gray-700 mb-3">
            Sverige kräver ursprungskontroll för att skydda köparen och samhället från handel
            med stulna fordon. Kontrollen kollar mot internationella register för stulna fordon
            (Interpol, Europol m.fl.) och mot belastningar i utländska kreditregister.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Hur beställer du ursprungskontroll?</h2>
          <ol className="space-y-3">
            {[
              { step: "1", title: "Logga in på Transportstyrelsen", desc: "Gå till transportstyrelsen.se och logga in med BankID." },
              { step: "2", title: "Välj 'Importera fordon'", desc: "Navigera till tjänsten för ursprungskontroll." },
              { step: "3", title: "Fyll i fordonets uppgifter", desc: "VIN-nummer, märke, modell och dina uppgifter." },
              { step: "4", title: "Betala avgiften", desc: "1 240 kr betalas direkt. Kortbetalning eller faktura." },
              { step: "5", title: "Vänta på svar", desc: "Handläggningstid är normalt 2–5 arbetsdagar." },
            ].map((item) => (
              <li key={item.step} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Beställ ursprungskontroll så tidigt som möjligt. Det kan ta
            upp till en vecka och du kan inte registrera bilen utan godkänt resultat.
          </p>
        </div>
      </>
    ),
  },
  "moms-vid-bilimport": {
    title: "Moms vid bilimport från EU – Regler och undantag",
    description:
      "När betalar du moms vid import av bil från EU? Regler för nytt vs begagnat fordon förklarade.",
    updatedDate: "2026-03-13",
    content: () => (
      <>
        <p className="text-gray-700 mb-6 text-lg">
          Momsreglerna vid bilimport inom EU kan verka komplicerade. Grundregeln är: om bilen
          anses som ett <em>nytt transportmedel</em> ska du betala moms i Sverige.
          Annars inte.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Ny eller begagnad – vad gäller?</h2>
          <p className="text-gray-700 mb-3">
            EU definierar ett <strong>nytt transportmedel</strong> som ett fordon som är:
          </p>
          <ul className="space-y-2 list-disc list-inside text-gray-700 mb-3">
            <li>Yngre än <strong>6 månader</strong> från leverans/fabrik, <strong>eller</strong></li>
            <li>Har körts <strong>färre än 6 000 km</strong></li>
          </ul>
          <p className="text-gray-700">
            Uppfylls <em>något</em> av dessa kriterier räknas bilen som ny och du betalar
            25% moms på inköpspriset i Sverige. Om bilen är äldre än 6 månader
            <strong> och</strong> har mer än 6 000 km slipper du momsen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Räkneexempel</h2>
          <div className="bg-gray-50 rounded p-4 border border-gray-200 text-sm">
            <p className="font-semibold mb-2">Bil köpt för 200 000 kr, 4 månader gammal, 3 000 km</p>
            <p className="text-gray-700">Anses som nytt fordon → Moms: 200 000 × 25% = <strong>50 000 kr</strong></p>
          </div>
          <div className="bg-gray-50 rounded p-4 border border-gray-200 text-sm mt-3">
            <p className="font-semibold mb-2">Bil köpt för 200 000 kr, 3 år gammal, 60 000 km</p>
            <p className="text-gray-700">Anses som begagnat fordon → Moms: <strong>0 kr</strong></p>
          </div>
        </section>

        <p className="text-xs text-gray-500">
          Källa: <a href="https://www.skatteverket.se" className="underline" target="_blank" rel="nofollow">Skatteverket</a>.
          Reglerna kan ändras – kontrollera alltid aktuell information.
        </p>
      </>
    ),
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: getCanonicalUrl(`/guider/${slug}`) },
    robots: getRobotsForPath(`/guider/${slug}`),
  };
}

export default async function GuiderPage({ params }: Props) {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) notFound();

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Guider", href: "/guider" },
    { name: guide.title.split("–")[0].trim() },
  ];

  const GuideContent = guide.content;

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
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{guide.title}</h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={guide.updatedDate}>{guide.updatedDate}</time>
            </p>
          </header>

          <GuideContent />
        </article>
      </div>
    </>
  );
}
