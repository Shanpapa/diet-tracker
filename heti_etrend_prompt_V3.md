# Heti étrendgeneráló prompt — Levi & Edit (V3)

## Hogyan használd?

Másold be ezt a teljes promptot, majd töltsd ki a **HETI VÁLTOZÓK** részt.
A többi rész fix — nem kell módosítani.

> **FONTOS:** Ez egy SZIGORÚAN KÖVETENDŐ SPECIFIKÁCIÓ.
> Ha bármely feltétel sérülne, automatikusan korrigáld a tervet és újra-validáld.

---

## SZEMÉLYEK

**Levi** — férfi, 39 év, 186 cm, 147 kg → cél: 100 kg
**Edit** — nő, 38 év, 168 cm, 100 kg → cél: 80 kg

---

## KALÓRIA ÉS MAKRÓ LIMITEK

| | Levi | Edit |
|---|---|---|
| Napi max kalória | **2000 kcal** | **1550 kcal** |
| Fehérje | 140–160 g/nap | 90–110 g/nap |
| Rost | min. 30 g/nap | min. 25 g/nap |
| Zsír | mérsékelt | mérsékelt |
| Szénhidrát | kiegyensúlyozott | kiegyensúlyozott |

**Tűréshatár:** max **+5% felfelé** kötelező betartani (Levi: 2100 kcal max, Edit: 1627 kcal max). E felett **automatikus javítás kötelező**. Lefelé nincs szigorú minimum, de a cél a teljes érték elérése.

---

## HIBAKEZELÉS (KÖTELEZŐ)

- Ha egy nap +5% felett lépi a kalória limitet → csökkentsd az adagokat
- Ha fehérje nem éri el a minimumot vagy túllépi a maximumot → módosítsd a fehérjeforrást
- Ha rost nem éri el a minimumot → adj hozzá zöldséget / chia / lenmag / hüvelyest
- Ha hordozható snack <15g fehérje → automatikusan javítsd
- Ha bármi szabály sérül → javítsd és újra-validáld a végeredményt

---

## ÉTKEZÉSI STRUKTÚRA

### Hétköznap — Levi (4 étkezés)

| Időpont | Étkezés | Kalória sáv (irányadó) | Megjegyzés |
|---|---|---|---|
| 5–6h | Reggeli (munkán) | 450–650 kcal | |
| 10h | Tízórai (munkán, NEM kötelezően hordozható) | 200–300 kcal | min. 15g fehérje |
| 13–14h | Ebéd (otthon) | 550–750 kcal | **Levi napi főétkezése** |
| — | **Uzsonna KIMARAD** | — | JSON: `name: "Levi kimarad"`, items: [], totals: 0 |
| 18h | Vacsora (otthon) | 300–500 kcal | **Max 500** — alvás-minőség |

**FIX SZABÁLY:** A NAPI ÖSSZESEN ~2000 kcal (max 2100, +5% tűrés). A meal-szintű sávok **csak útmutatók**, nem feszíthetők egyszerre mind a felső szélre.

**Rugalmas elosztás példák** (mind a 4 étkezés között elosztva, napi 2000):
- Erős reggeli nap: 650 + 250 + 600 + 500 = 2000 ✓
- Erős ebéd nap: 500 + 250 + 750 + 500 = 2000 ✓
- Erős vacsora nap: 450 + 250 + 800 + 500 = 2000 ✓ (de ebéd kissé felül)
- Kiegyensúlyozott: 550 + 250 + 700 + 500 = 2000 ✓

**Két szabály ami nem hajlik:**
1. Vacsora **max 500 kcal** Levinél (alvás-minőség)
2. Tízórai **min 15g fehérje** mindig

### Hétköznap — Edit (4 étkezés)

| Időpont | Étkezés | Kalória sáv (irányadó) | Megjegyzés |
|---|---|---|---|
| 6–7h | Reggeli (otthon) | 350–450 kcal | Stabil, fehérje-rost alapú |
| 10:30h | Tízórai (úton munkába vagy munkakezdés előtt, **hordozható**) | 250–320 kcal | min. 15g fehérje, **energetikus + stabil vércukor** (kitart 5-6h-ig kaja-szünet nélküli álló munka alatt). Ajánlott alapok: zabkása lenmaggal+banánnal, túró-magvakkal, görög joghurt-mogyoróvaj-alma kombó, mandulás chia pudding. KERÜLENDŐ: gyors-felszívódó cukor egyedül (sima fehér kenyér, gyümölcslé, péksütemény) |
| — | **Ebéd KIMARAD** | — | JSON: `name: "Edit kimarad"`, items: [], totals: 0 |
| 16:00–16:30h | Uzsonna (műszak vége, úton hazafelé, **hordozható**) | 180–220 kcal | min. 15g fehérje, kis lökés hazaútra (vacsora kb. 90 perc múlva otthon) |
| 18h | Vacsora (otthon) | 550–700 kcal | **Edit napi főétkezése** (ebéd helyett pótolja a hiányzó kalóriákat) |

**FIX SZABÁLY:** A NAPI ÖSSZESEN ~1550 kcal (max 1627, +5% tűrés).

**Rugalmas elosztás példák** (Edit kevésbé rugalmas mint Levi az ebédkimaradás miatt):
- Tipikus: 400 + 280 + 200 + 670 = 1550 ✓
- Erős reggeli: 450 + 280 + 200 + 620 = 1550 ✓
- Erős vacsora: 380 + 280 + 200 + 690 = 1550 ✓

**Három szabály ami nem hajlik:**
1. Tízórai és uzsonna **mindkettő hordozható** + **min 15g fehérje**
2. Tízórai **energetikus** (lassú-felszívódó szénhidrátok + fehérje + zsír)
3. Vacsora **max 700 kcal** (alvás-minőség)

### KRITIKUS SZABÁLY — hétközi vacsora aszimmetria és együtt-étkezés

**Hétközben (hétfő-péntek) az EGYETLEN közösen elfogyasztott étkezés a vacsora.** Levi 5-6h-kor evett reggelit munkán, Edit 6-7h-kor otthon. Délben Levi otthon ebédel, Edit munkán van. Csak este 18h körül találkoznak otthon.

**Levi vacsora ≠ Edit vacsora a kalória/makró igényük miatt.** Levi már evett ebédet (500-800 kcal), Edit nem. Tehát:
- Edit vacsora **nagyobb és tápdús** (a napi főétkezése)
- Levi vacsora **kisebb és könnyebb**

**Vacsora együtt fogyasztva, de NEM kell ugyanaz legyen.** Lehet eltérő étel, eltérő adag, eltérő ízvilág. **Ha sikerül egy étel ami mindkettőjüknek megfelelő (csak más adagban), az BONUS** — egyszerűbb a főzés. Ha az igényeik nagyon eltérnek, két külön étel teljesen rendben van.

### Hétvége — közösen főzünk és eszünk

**Szombaton és vasárnap mind az 5 étkezés közösen elkészített és elfogyasztott.** A heti egyetlen olyan idő amikor együtt vannak egész nap.

| Étkezés | Hétvégi szabály |
|---|---|
| Reggeli | Rugalmas — lehet azonos vagy eltérő |
| Tízórai | Rugalmas — lehet azonos vagy eltérő |
| **Ebéd** | **KÖTELEZŐEN AZONOS étel, eltérő adagok** (Levi nagyobb, Edit kisebb) |
| Uzsonna | Rugalmas — lehet azonos vagy eltérő |
| Vacsora | Rugalmas — lehet azonos vagy eltérő |

A hétvégi ebéd az egyetlen kötelezően közös étel (egy fogás, két adag). A többi hétvégi étkezés **együtt fogyasztott, de a fogás lehet eltérő** ha az igényeik így kívánják.

---

## TILTÓLISTÁK

**Levi:** kelkáposzta, tök, édes burgonya
**Edit:** olívabogyó, mazsola

---

## EGÉSZSÉGÜGYI SZEMPONTOK

**Edit — rheumatoid arthritis + Rituximab (immunszupprimált):**

Tilos:
- Nyers tojás, nyers hal, nyers tej
- **Pasztörizálatlan sajtok** (brie, camembert, kék sajtok, raw milk cheese)
- **Nyers csíráztatott magvak** (alfalfa, mungobab csíra)
- **Félig sült / véres hús** (rare steak, tartar, carpaccio)

Heti minimum:
- 2 adag zsíros hal (lazac, makréla, szardínia)

Napi:
- Hozzáadott cukor < 25g
- Ultra-feldolgozott húsok minimalizálása

Kerülendő:
- Magas gyulladásindex ételek (finomított olajok, sok bolti cukor)

Ajánlott:
- Fermentált ételek (kimchi, görög joghurt, kéfir)
- Omega-3 (lazac, tonhal, dió, lenmag, chia)
- Színes zöldségek
- Anti-inflammatory fűszerek (kurkuma, gyömbér, fokhagyma)

---

## ÉTREND-KATEGORIZÁLÁS (FONTOS — V3 ÚJDONSÁG)

### A. Tiszta 80%-ba MEGY (NEM számít élvezetinek)

Ezek házi készítésű comfort food-ok, tiszta alapanyagokkal:
- **Házi ramen:** friss/szárított búzatészta + saját leves-alap (csirke alaplé + szójaszósz + gochugaru/miso) + tojás + zöldség + kimchi/gyoza
- **Házi pizza:** sourdough vagy teljeskiőrlésű alap + sovány toppingok (csirke, tonhal, zöldség, mozzarella) + házi paradicsomszósz
- **Házi burger:** sovány marha (5-10% zsír) + teljeskiőrlésű buci + friss zöldség + házi szósz (mustár, joghurt-alap, paradicsom)
- **Egészséges rakott krumpli:** tojás-túró-csirke verzió, kevés sajttal, sok salátával — a hagyományos zsírszalonna-tejföl bombát kerülve
- **Házi kínai/japán/koreai főzelékek és wokok** friss alapanyagokkal

### B. Élvezeti étel (max 3x/hét)

Bolti, étterem, vagy refined-alapanyagból készült comfort food:
- Bolti pizza (Domino's, Pizza Express, frozen)
- Étterem burger fries-szal
- Hagyományos zsíros rakott krumpli (zsírszalonna, tejföl bőven)
- Bolti péksütemények, sütik, fánk
- Klasszikus étterem-vacsora
- Take-away curry sok ghee-vel

### C. Ultra-feldolgozott (élvezeti RÉSZHALMAZA, max 1x/hét)

Az élvezeti egy szigorúbb alkategóriája:
- **Flash-fried instant tészta** (Shin Ramyun, Buldak, Mama, Nissin Cup Noodle, stb.)
- Bolti készételek, frozen meals
- Bolti kolbász/szalámi/pepperoni nagyobb adagban (kis kiegészítő mennyiség OK)
- Chips, bolti süti, bolti fagyi
- Energy/protein bárok (a legtöbb)

> **Megjegyzés:** ezeket nem azért kerüljük, mert "rosszak", hanem mert a flash-frying + sok adalékanyag + magas nátrium kombinációja gyulladás-promotor (Editnek RA-val problémás) és tápanyag-szegény (Levinek fogyásnál nem kíván).

---

## ÉTRENDI SZABÁLYOK

- **80% tiszta étel, 20% élvezeti** — a heti tervben max 3 élvezeti étel (B vagy C kategóriából)
- **Ultra-feldolgozott (C) max 1x/hét** — ez a 3 élvezetin BELÜL van, nem felett
- **Heti meglepi étel (1x/hét)** — egészséges, kreatív, AI-generált, NEM számít élvezetinek
- **Kolbász + bacon:** Levinél max 2x/hét, Editnél max 1x/hét (akkor is, ha a fő étel tiszta)
- **Minden főétkezés** (reggeli, ebéd, vacsora) tartalmazzon minőségi fehérjeforrást
- **Hordozható snack** (Edit tízórai, Edit uzsonna) min. 15g fehérje, hűtés nélkül 4-5 órán át megáll
- **Levi tízórai** (akár hordozható, akár munkahelyen evett) min. 15g fehérje
- **Hétvégi ebéd** kötelezően azonos étel (eltérő adag), egyéb hétvégi étkezések rugalmasak
- **Rost-cél elérése:** zöldségek, chia, lenmag, hüvelyesek, teljes kiőrlésű gabona

### Időbeli folytonosság — meal prep előfeltételek (HARD RULE)

A heti terv hétfőtől vasárnapig fut. Az AI **SOHA** nem írhat olyan ételt egy adott napra, ami időben még nincs készen.

**Konkrét szabályok:**

1. **Az AKTUÁLIS hét hétfő-csütörtök Levi ebédjére** a HETI VÁLTOZÓK-ban megadott `Múlt vasárnapi B-alap és maradék mennyisége` mező használandó. Ha ott "nincs maradék" szerepel, akkor a hétfői (és szükség esetén keddi) Levi ebéd külön kell legyen tervezve (gyors hétfői reggeli batch vagy más tiszta ötlet).

2. **A vasárnapi meal prep batch** kétféleképpen használható:
   - Vasárnap mindketten ehetnek belőle (vasárnapi ebéd vagy vacsora)
   - A maradék a **KÖVETKEZŐ hét** Levi munkanapi ebédjeire megy
   
   **TILOS** a vasárnap készülő batch-et felhasználni az AKTUÁLIS hét **korábbi** napjain (hétfő-szombat ebédre/vacsorára) — időutazás nélkül lehetetlen.

3. **Húsleves** általános batch — vasárnap készül, az aktuális hét végén (vasárnap) és a köv. hét elején fogyasztható.

---

## PREFERENCIÁK

**Mindketten szeretik:**
kimchi, gyoza, fermentált ételek, tonhal, lazac, tojás, görög joghurt, áfonya, kivi, dió, mandula, avokádó, tészta, magyaros ételek (pörkölt, húsleves), chia pudding, banán, lenmag

**Konyha-stílusok preferencia sorrendben:**
1. **Magyaros** (pörkölt, húsleves, töltött paprika, csirkepaprikás)
2. **Ázsiai / japán / koreai** (különösen Edit szereti) — ramen, bibimbap, sushi, donburi, koreai BBQ, vietnami pho/bun, thai curry
3. Mediterrán (görög, olasz)
4. Mindenevők — bármilyen konyha mehet ha minőségi

**Levi egyedi preferenciák:**
kolbász, bacon

**Edit egyedi preferenciák:**
ázsiai konyha extra hangsúly

---

## EDIT ÁLLAPOT-MODIFIER

A heti változókban megadható, hogy Edit milyen állapotban van. **Default: ENERGIKUS-ANTI-INFLAMMATORY** (ezt használd, ha a heti változók üresen hagyják).

**Lehetséges állapotok:**

- **NORMÁL** — alap tiszta étrend, nincs külön fókusz
- **ENERGIKUS-ANTI-INFLAMMATORY (DEFAULT)** — heti 2x zsíros hal, napi 1x kurkuma vagy gyömbér tartalmú étel (curry, tea, smoothie), magnézium-fókusz (zöld levelek, magvak, mandula), stabil vércukor (alacsony GI szénhidrátok, sok rost), napi 1x fermentált étel (kimchi, joghurt, kéfir)
- **IZÜLETI FELLOBBANÁS** — extra anti-inflammatory hét, lágyabb ételek (könnyű rágni), nagy turmeric-ginger jelenlét, halolaj-bomba, alacsony purin (kerüljük: vörös hús sok, vesetároló halak, alkohol)
- **STRESSZES** — stabil vércukor kiemelve, magnézium-bomba, könnyű esti étkezés (jobb alvás), B-vitamin-rich (full-grain, leveles zöldek)
- **EGYÉB:_____** — custom kérés (pl. "fáradt", "fogy túl gyorsan")

---

## UK TERMÉK-ELÉRHETŐSÉG (LONDONI BEVÁSÁRLÁS)

A receptek **UK szupermarketekben elérhető** termékeket használjanak (Tesco, Sainsbury's, Morrisons, Waitrose, Asda, Aldi, Lidl). Magyar termékeket NE javasolj kivéve ha a heti változókban explicit szerepel.

### Magyar → UK helyettesítések

- **Túró** → Polish twaróg / serek wiejski (Tesco World Foods polc) VAGY 0% görög joghurt szűrve VAGY light ricotta
- **Trappista sajt** → mature cheddar VAGY edam VAGY mild gouda
- **Magyar kolbász** → Polish kielbasa krakowska / lengyel debrecziner (Tesco World Foods) VAGY chorizo
- **Debreceni** → Polish kabanos
- **Sült szalonna / zsírszalonna** → smoked streaky bacon (UK standard)
- **Liptói túró** → Polish bryndza (Tesco)
- **Tejföl** → soured cream (UK standard)
- **Sárgaborsó-leves alap** → red lentils (gyakoribb UK-ben, hasonló íz)

### Ázsiai hozzávalók

Asian shops minden londoni sarkon elérhetők, korlátlanul használhatók: kimchi, gochujang, gochugaru, doubanjiang, miso, koreai/japán rizsek, friss/szárított ramen tészta (NEM instant), tofu, tempeh, edamame, oyster sauce, shaoxing wine, dashi, nori, stb.

---

## MEAL PREP — VASÁRNAP

Nincs időlimit, közös program.

### Fix minden héten

- **Húsleves** (egész csirke, sárgarépa, fehérrépa) → 3-4 napig eláll hűtőben
- **Főtt tojás:** 14 db
- **Chia pudding** Editnek: 3-4 adag előre
- **Fehérje alap A:** sütőben sült csirkemell (~800g)

### Rotáló fehérje alap B (heti változókban megadva)

**Ötletek — válassz egyet, vagy írj sajátot:**
- Töltött paprika darált pulykával és rizzsel, paradicsomos alapban
- Darált marhás chili babbal
- Pulyka fasírt sütőben sütve
- Csirkés curry kókusztejjel és rizzsel
- Lazac citromos-fokhagymás pácban
- Görög csirke (olíva, paradicsom, oregánó)
- Darált pulyka bolognai
- Sütőben sült csirkecomb
- Marhapörkölt
- Töltött cukkini darált pulykával
- Csirkés zöldséges wok rizzsel
- Lencse főzelék csirkemellel
- **Pork adobo** (Filipino-Korean: szójás-oysteres-rizsecetes pácolt sertéslapocka)
- **Tonkatsu pork** (panírozott sertésszelet, sokszor használható)
- **Koreai bulgogi** (marhaszelet édes-szójás pácban)
- **Vietnámi citromfüves csirke**

**A B-alap szabálya:**
- Vasárnap készül egy nagyobb batch (kb. 4 adag Levi ebédjére + vasárnapi 2 adag)
- Vasárnap mindketten ehetnek belőle (ebéd vagy vacsora)
- A maradék a **KÖVETKEZŐ hét** Levi munkanapi ebédjeibe megy

### Egyéb batch

- Főtt rizs (500g)
- Sült zöldség tepsin (cukkini, paprika, brokkoli)

> Legalább 3 étkezés használja ezeket az alapokat a héten.

---

## HETI MEGLEPI (V3 ÚJDONSÁG)

Hetente **1 új, kreatív, EGÉSZSÉGES étel** kerüljön a tervbe. Az AI generálja, magas variancia. Lehet bármelyik étkezés (reggeli, tízórai, ebéd, uzsonna, vacsora), de optimálisan közös fogyasztás (hétközi vacsora ha az igények engedik, vagy hétvégi ebéd).

A meglepi NEM számít az élvezeti 3-as kontingensbe (mert egészséges).

A meglepi a `patch_notes.highlights` tömbjében jelenjen meg ezzel a formátummal:

```
"🎁 Heti meglepi: [nap] [étkezés] — [étel neve] — [rövid magyarázat miért kreatív]"
```

Példa:
```
"🎁 Heti meglepi: Csütörtök vacsora — Vietnami bun bo nam bo (rizstészta sovány marhával, friss zöldekkel, lime-os szósszal). Edit ázsiai szeretete + Levi protein-igénye együtt, és egyikőtök se evett még ilyet."
```

Az emoji + szövegformátum egységes legyen minden héten, hogy a tracker app könnyen kiemelhesse.

---

## VÉSZHELYZETI OPCIÓK

Adj meg **legalább 3 kreatív gyors alternatívát** minden héten, a `veszhelyzeti_opciok` JSON tömbben. A vészhelyzeti opciók legyenek:
- 10 percen belül elkészíthetők (nem főzni-igényesek)
- UK szupermarket alapanyagokból
- min. 15g fehérje
- Hordozhatók ha lehet

**Példa-kategóriák amikből válassz** (de NE ismételd minden héten ugyanazt — variálj):

- **Konzerv-mentő:** tonhal konzerv + avokádó + tk kenyér
- **Tojás-bomba:** 3-4 főtt tojás + paradicsom + sajt
- **Joghurt-bowl:** görög joghurt + magvak + gyümölcs + chia
- **Túró-edamame:** túró/twaróg + edamame + zöldség + tk kenyér
- **Sushi take-away** Tescóból (előcsomagolt)
- **Rotisserie csirke** Tescóból + saláta
- **Smoothie:** banán + spenót + protein por + tej + chia + lenmag

*(A fenti csak ötlet — az AI saját kreatív alternatívái kerüljenek a tervbe minden héten, ne legyen fix lista.)*

---

## ADAGOLÁS FORMÁTUMA

Minden étkezésnél add meg külön Levinél és Editnél:
- Összetevők **gramm pontossággal** (kivéve a darabos: tojás, gyümölcs db-szám OK)
- Kalória (kcal), Fehérje (g), Szénhidrát (g), Zsír (g), Rost (g)

A nap végén összesítő táblázat. Tűréshatár: max +5%.

---

## VALIDÁCIÓ (A VÉGÉN KÖTELEZŐ)

Minden nap végén ellenőrizd és jelenítsd meg:

| Nap | Levi kcal | Levi P | Levi rost | Edit kcal | Edit P | Edit rost |
|-----|-----------|--------|-----------|-----------|--------|-----------|

**Limitek:**
- Levi: kcal max 2100 (5% tűrés), fehérje 140-160g, rost min 30g
- Edit: kcal max 1627 (5% tűrés), fehérje 90-110g, rost min 25g

Ha bármelyik limit sérül → javítsd mielőtt kiadod az eredményt, és újra-validáld.

**Egyéb ellenőrzések a végén:**
- Élvezeti étel max 3x ✓
- Ultra-feldolgozott (C kat) max 1x ✓
- Levi bacon/kolbász max 2x, Edit max 1x ✓
- Edit zsíros hal min 2x ✓
- Edit napi cukor < 25g ✓
- Hordozható snackek mind ≥ 15g fehérje ✓
- Heti meglepi szerepel a highlights-ban 🎁 ✓
- Időbeli folytonosság: B-alap a megfelelő hetekre van rendelve ✓

---

## JSON FORMÁTUM (NEM MÓDOSÍTHATÓ — APP READS IT)

A generált étrendet az alábbi struktúrában add vissza, hogy az appba importálható legyen:

```json
{
  "week_start": "ÉÉÉÉ-HH-NN",
  "patch_notes": {
    "cim": "Rövid hét-leírás — max 60 karakter, humoros",
    "feherje_alap_b": "Múlt vasárnap készült batch neve (amit Levi most a héten eszik). Pl: 'csirkecomb-pörkölt' VAGY 'nincs B-alap, külön tervezett ebédek'",
    "elvezetiek": [
      "Első élvezeti étel (nap + étkezés)",
      "Második élvezeti étel (nap + étkezés)"
    ],
    "highlights": [
      "🎁 Heti meglepi: [nap] [étkezés] — [étel neve] — [magyarázat]",
      "Második highlight",
      "Harmadik highlight",
      "Negyedik highlight (opcionális)"
    ],
    "macro_cel": {
      "levi": "max 2000 kcal / nap · 140–160g fehérje",
      "edit": "max 1550 kcal / nap · 90–110g fehérje"
    }
  },
  "days": [
    {
      "day": "Hétfő",
      "meals": [
        {
          "type": "reggeli",
          "name": "Az étel neve",
          "levi": {
            "items": [
              {
                "name": "Összetevő",
                "amount": "180g",
                "kcal": 234,
                "protein": 19.5,
                "carbs": 1.2,
                "fat": 15.9,
                "fiber": 0.0
              }
            ],
            "total_kcal": 234,
            "total_protein": 19.5,
            "total_carbs": 1.2,
            "total_fat": 15.9,
            "total_fiber": 0.0
          },
          "edit": {
            "items": [],
            "total_kcal": 0,
            "total_protein": 0,
            "total_carbs": 0,
            "total_fat": 0,
            "total_fiber": 0
          }
        }
      ]
    }
  ],
  "veszhelyzeti_opciok": [
    "Opció 1 leírása",
    "Opció 2 leírása",
    "Opció 3 leírása"
  ]
}
```

### Étkezés típusok (`type` mező)

`reggeli`, `tizorai`, `ebed`, `uzsonna`, `vacsora`

### Aszimmetrikus étkezés (mindkettőjük eszik, de mást) — `name` mező

Ha hétközi vacsora vagy hétvégi rugalmas étkezés során Levi és Edit **MÁS** ételt eszik, a `name` mezőben mindkét fogást jelezd ezzel a formátummal:

```
"name": "Levi: [Levi étele] | Edit: [Edit étele]"
```

Például: `"name": "Levi: csirkemell saláta | Edit: lazac rizzsel és wokoltzöldséggel"`

Ha azonos étel (eltérő adag), akkor egyszerű név:
```
"name": "Csirke curry rizzsel"
```

### Üres étkezés formátum (kötelező)

Hétközben Edit ebéd / Levi uzsonna kimarad. JSON-ban:

```json
{
  "type": "ebed",
  "name": "Edit kimarad",
  "levi": { "items": [...], "total_kcal": ... },
  "edit": {
    "items": [],
    "total_kcal": 0,
    "total_protein": 0,
    "total_carbs": 0,
    "total_fat": 0,
    "total_fiber": 0
  }
}
```

Vagy fordítva Levi uzsonnánál:
```json
{
  "type": "uzsonna",
  "name": "Levi kimarad",
  "levi": { "items": [], "total_kcal": 0, ... },
  "edit": { "items": [...], "total_kcal": ... }
}
```

### Patch_notes mező-szabályok

- `cim`: max 60 karakter, informatív, humoros, vicces
- `feherje_alap_b`: **A jelenlegi heten Levi munkanapi ebédjeiben szereplő B-alap étel pontos neve** (azaz a múlt vasárnap készült batchből). Ha a heti változókban "nincs maradék" volt és külön tervezett ebédek vannak, akkor: `"feherje_alap_b": "nincs B-alap, külön tervezett ebédek"` legyen. **NE** ezen heti vasárnap készülő új batch-et írd ide — az a köv. heti tervhez tartozik.
- `elvezetiek`: **0–3 elem** (ahány ténylegesen szerepel a heti tervben). Ha nincs élvezeti étel, üres tömb.
- `highlights`: **3–4 elem**, AZ EGYIK KÖTELEZŐEN A HETI MEGLEPI 🎁 emoji-val. Legyenek konkrétak, humorral.
- `macro_cel`: az aktuális heti makró-cél. **Manuálisan frissített** ha súly-mérföldkő miatt változik.

---

## OUTPUT FORMÁTUM (KIMENET)

Az AI minden héten **két dolgot** produkáljon:

1. **Human-readable összefoglaló a chatben:**
   - Validáció táblázat (Levi/Edit kcal, fehérje, rost minden napra)
   - Heti átlag
   - Szabály-ellenőrzés checklist
   - Rövid összefoglaló a hét tematikájáról
   - A meglepi étel kiemelése

2. **JSON fájl** (importálható az app-ba) — a fenti spec szerint, mentve `heti_etrend_ÉÉÉÉ-HH-NN.json` néven (a hét kezdete dátummal)

A két output egyszerre kerüljön ki. A JSON akkor jó ha minden szabályt betart és a validáció 0 megsértéssel zár.

---

## ═══ HETI VÁLTOZÓK — ITT MÓDOSÍTSD ═══

### KÖTELEZŐ MEZŐK

**Hét kezdete:** [ÉÉÉÉ-HH-NN, hétfői dátum]

**Múlt vasárnapi B-alap és maradék hétfő reggel:**
[pl. csirkecomb-pörkölt: ~600g | sült zöldség mix: ~300g]
[VAGY: nincs maradék, hétfői Levi ebéd külön legyen tervezve gyors megoldással]

**Vasárnap készülő új B-alap (a KÖVETKEZŐ hét ebédjeire megy):**
[pl. tonkatsu pork batch / lazac batch / marhapörkölt / pork adobo / etc.]

### OPCIONÁLIS MEZŐK

**Élvezeti ételek ezen a héten (max 3, ha kevesebb akkor csak azok, ha 0 akkor üres):**
[pl. Péntek vacsora: pizza házilag sourdough alappal | Szombat ebéd: rakott krumpli light]

**Edit állapota ezen a héten** (default: ENERGIKUS-ANTI-INFLAMMATORY):
[NORMÁL / IZÜLETI FELLOBBANÁS / STRESSZES / EGYÉB:_____]

**Különleges kérések / tematika ezen a héten:**
[pl. ázsiai hét, ramen-fókusz, magyar comfort food hét, könnyű meleg-időjárás-étrend]

**Alapanyagok amiket fel kell használni (ha van):**
[pl. 500g lazac filé hétfőn, 1 doboz nyitott kimchi, fél fej káposzta]

**Amit mindenképpen kerüljük ezen a héten:**
[pl. ne legyen ramen, ne legyen tészta, kerüljük a sok rizst]

**Macro_cel manuális update (ha súlymérföldkő elérve):**
[pl. új Levi cél: 1900 kcal | Edit változatlan]
[Ha üres → a default 2000/1550 marad]

---

*A fenti fix részt nem kell módosítani — csak a HETI VÁLTOZÓK szekciót töltsd ki és dobd be a promptba.*
