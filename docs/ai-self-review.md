# AI Self-Review Checklista – Importguiden
# Obligatorisk genomgång INNAN leverans av innehåll eller UI.
# Svara JA eller NEJ på varje fråga.
# Om svaret inte är ett tydligt JA → justera eller underkänn.

---

## CONTENT

1. Är allt innehåll riktat till privatpersoner med saklig, förtroendeingivande ton?
   (NEJ om texten låter säljig, akademisk eller generisk)

2. Innehåller sidan minst ett konkret faktum, siffra eller steg-för-steg-process
   som inte finns på någon annan sida på sajten?
   (NEJ om innehållet är en ren malltext med ordbyten)

3. Är alla faktapåståenden om kostnader och regler antingen källbelagda
   eller tydligt markerade som uppskattning ("ca", "schablonvärde", "varierar")?
   (NEJ om det finns oprecisa påståenden utan markering)

4. Är texten fri från generiska AI-fraser som:
   "Sammanfattningsvis kan vi konstatera att..."
   "Det är viktigt att notera att..."
   "I denna artikel kommer vi att gå igenom..."
   "Som vi har sett ovan..."?
   (NEJ om någon av dessa eller liknande fraser förekommer)

5. Är innehållet minst 800 ord OM det är en guide eller landssida?
   (Undantag: verktyg som kalkylatorn, om-oss-sidor – motivera explicit)

---

## SEO

6. Finns exakt en H1 som matchar sidans primära sökord?
   (NEJ om H1 saknas, är generisk eller om det finns fler än en)

7. Är title 40–65 tecken och description 120–160 tecken,
   och är båda specifika för just denna sida?
   (NEJ om de är generiska mallar eller för korta/långa)

8. Finns minst 2 relevanta internlänkar med beskrivande ankartexter?
   (NEJ om ankartexterna är "klicka här", "läs mer" eller liknande)

9. Är dateUpdated synligt i innehållet?
   (NEJ om det saknas)

10. Är robots-direktivet korrekt kopplat till manifestet via getRobotsForPath()?
    (NEJ om det är hårdkodat eller saknas)

---

## DESIGN & UX

11. Används enbart godkända färger ur Importguidens palett?
    (NEJ om röd, orange, gradient eller annan otillåten färg förekommer)

12. Uppfyller alla textpar WCAG 2.1 AA-kontrast (≥4.5:1 för normal text)?
    (NEJ om gray-400 används för normal brödtext)

13. Är färg aldrig enda informationsbärare?
    (NEJ om t.ex. ett fel eller en status enbart kommuniceras via färg)

14. Innehåller leveransen inga förbjudna komponenter?
    (popup, modal, countdown, carousel, sticky CTA, social proof)

15. Är alla affiliate-länkar märkta med AffiliateLink-komponenten
    och synlig "(annonslänk)"-text?
    (NEJ om det finns affiliate-länkar utan märkning)

---

## COMPLIANCE (GDPR, COOKIES, INFOSÄK)

16. Laddas inga tredjepartsskripts (analytics, affiliate) utan att vara consent-gatade?
    (NEJ om script laddas direkt i layout utan samtyckesberoende)

17. Samlas inga personuppgifter i ny funktionalitet utan att det är
    dokumenterat och har rättslig grund?
    (NEJ om formulär eller tracking tillkommer utan GDPR-analys)

18. Är SITE_URL satt till https:// i produktionsmiljön?
    (NEJ om http:// används)

---

## SAMMANFATTNING

Räkna antalet NEJ-svar:

| Antal NEJ | Åtgärd                                          |
|-----------|-------------------------------------------------|
| 0         | Godkänd för leverans                            |
| 1–2       | Åtgärda innan leverans                          |
| 3+        | Underkänd – börja om eller eskalera till människa |

Ett enda NEJ på punkt 3, 6, 10, 16 eller 17 är alltid underkänt
oavsett övriga svar.
