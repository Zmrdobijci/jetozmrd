/* Oskórované profily senátních kandidátů 2026 (mimo hand-written incumbenty v data.js).
   Klíč = kand-<obvod>-<číslo> (číslo z listiny senat-kandidati.js).
   data.js z toho staví scored person; kandidáti bez záznamu = Šedá zóna.
   Doplňováno po vlnách zmrdologickou rešerší (doložená fakta + citace u svítících os). */
window.SENAT_SKORE = {
  // ── obvod 3 (Cheb) ──
  'kand-3-1': {
    category: 'Není zmrd',
    categoryReason: 'Ing. Jiří Sedláček z Tachova, jednatel městské firmy Správa majetku a údržby Tachov a kandidát Trikolory. Žádná ze šesti os nesvítí: žádný záznam u Demagoga, žádná korupce, toxicita ani otáčení kabátů. Jediný nález — rozhodnutí ERÚ 2021 — je správní přestupek firmy za neúplné vyúčtování tepla, ne osobní pochybení.',
    dictum: 'Správce městského majetku, na kterého archiv ani Demagog nic nemají — řadový kandidát s čistým štítem.',
    lit: [],
    overrides: {
      lze: { text: 'Žádný záznam u Demagog.cz ani jiný doložený vzorec opakovaných nepravd.' },
      penize: { text: 'Jednatel městské s.r.o. je legální zaměstnání, ne dotační byznys ani trafika. Pokuta ERÚ 2021 padla na firmu za formální nedostatky vyúčtování tepla, ne na kandidáta osobně.' },
      prace: { text: 'Nezvolený kandidát bez mandátu — docházka nehodnotitelná.' },
      konzistence: { text: 'Bývalý člen ODS, dnes blízký Trikoloře; jeden přechod bez doloženého oportunismu.' },
      toxicita: { text: 'Žádné doložené urážky, dehonestace ani výhrůžky.' },
      zbabelost: { text: 'Žádné doložené vyhýbání se odpovědnosti.' },
    },
  },
  'kand-3-2': {
    category: 'Není zmrd',
    categoryReason: 'Manažerka v cestovním ruchu a kulturní aktivistka, krajská zastupitelka Karlovarského kraje 2018–2024. Jediná doložená epizoda: opozice ji 2021 nařkla ze střetu zájmů při hlasování o dotaci pro festival, který spoluzaložila — jednorázový spor bez prokázaného profitu, bez odsouzení, bez vzorce. Na rozsvícení osy to nestačí.',
    dictum: 'Jediná skvrnka je dotace pro vlastní festival, u které se zapomněla zdržet — na zmrda málo, na opatrnost taky.',
    lit: [],
    overrides: {
      lze: { text: 'Bez záznamu — nemá profil na Demagog.cz, žádné doložené opakované nepravdy.' },
      penize: { text: 'V květnu 2021 ji opozice v krajském zastupitelstvu nařkla ze střetu zájmů: hlasovala o dotaci 250 tis. Kč pro Marienbad Film Festival, jehož byla zakládající členkou. Jednorázová epizoda bez prokázaného profitu — dle pravidla (vzorec, ne jednorázovka) osu nerozsvěcuje.' },
      prace: { text: 'Nehodnotitelné — nezvolená kandidátka.' },
      konzistence: { text: 'Bez doloženého otáčení kabátu — u Pirátů od roku 2018.' },
      toxicita: { text: 'Bez záznamu urážek či dehonestace.' },
      zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti.' },
    },
  },
  'kand-3-3': {
    category: 'Není zmrd',
    categoryReason: 'Komunální politička: starostka Velké Hleďsebe (2014–2022), krajská zastupitelka. V senátních volbách 2020 prošla do 2. kola, prohrála s Plevným. Hlídač státu ani média neevidují střet zájmů, dotační podvod ani veřejné nepravdy. V „kontejnerové kauze" naopak vystupovala proti dezinformacím.',
    dictum: 'Starostka z lázeňské vísky, na kterou archiv ani Hlídač nic nemají — zatím čistý štít.',
    lit: [],
    overrides: {
      lze: { text: 'Žádný výrok ověřený Demagogem, žádná doložená opakovaná nepravda.' },
      penize: { text: 'Hlídač státu eviduje jednu soukromou firmu (neobchoduje se státem) a dotace v běžném rozsahu pro komunální politiku. Žádný doložený vzorec života z veřejných peněz, trafika ani střet zájmů.' },
      prace: { text: 'Do Senátu nezvolena; výkon mandátu nelze hodnotit.' },
      konzistence: { text: 'Dlouhodobě za ANO bez doloženého obracení kabátu.' },
      toxicita: { text: 'Žádné doložené urážky; v kontejnerové kauze varovala před šířením strachu a nenávisti.' },
      zbabelost: { text: 'Žádné doložené vyhýbání se odpovědnosti.' },
    },
  },
  'kand-3-4': {
    category: 'Není zmrd',
    categoryReason: 'Dobrovolný velitel JSDH Planá a neuvolněný zastupitel za KSČM, kandidát 2020 (8,76 %, nezvolen). Žádná osa nesvítí: žádný záznam na Demagogu, žádné trestní řízení, žádný dotační/majetkový střet, žádné dehonestace. Ideologicky zaprášený, zmrdologicky čistý.',
    dictum: 'Rudý doktor ze starých časů, co velí hasičům a píše na ParlamentníListy o polystyrenu — ideologie ano, zmrdství ne.',
    lit: [],
    overrides: {
      lze: { text: 'Bez doloženého záznamu; jeho texty jsou hypotetická argumentace, ne ověřitelná nepravda.' },
      penize: { text: 'Velitel JSDH je dobrovolnická funkce, mandát zastupitele neuvolněný; žádné dotace, zakázky ani profit přes rodinu.' },
      prace: { text: 'Nehodnotitelné — nezvolen; jako zastupitel bez doloženého záznamu absencí.' },
      konzistence: { text: 'Dlouhodobě KSČM, žádný přestup ani obrat postojů.' },
      toxicita: { text: 'Veřejné texty kritizují politiku, ne osoby; žádné urážky.' },
      zbabelost: { text: 'Bez doloženého záznamu.' },
    },
  },
  'kand-3-6': {
    category: 'Není zmrd',
    categoryReason: 'Dvanáct let starostkou Kladrub (2006–2018), poté zastupitelka, právnička, dlouhodobě Strana zelených. Žádná osa nesvítí — ani náznak vzorce ohýbání před mocí. Doložitelně čistý kandidát.',
    dictum: 'Dvanáct let v komunální politice a ani jedna osa nesvítí; někdo holt dělá starostu, místo aby z něj žil.',
    lit: [],
    overrides: {
      lze: { text: 'Bez záznamu — nemá profil na Demagog.cz, žádné doložené nepravdy.' },
      penize: { text: 'Hlídač státu eviduje jen funkce zastupitelky a radní Kladrub, žádné dotace, zakázky ani střet zájmů. Starostenský plat za reálně vykonávanou funkci.' },
      prace: { text: 'Nehodnotitelné — nikdy nezvolena do celostátního sboru; jako starostka spojována s rozvojem města.' },
      konzistence: { text: 'Členka Strany zelených nepřetržitě od 2006, bez přebíhání.' },
      toxicita: { text: 'Bez doložených urážek či výhrůžek.' },
      zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti.' },
    },
  },
  'kand-3-7': {
    category: 'Není zmrd',
    categoryReason: 'Realitní makléř z Karlovarska, jeden z devíti kandidátů obvodu, nezvolen. Žádné ověřitelné prohřešky: Demagog ho neeviduje, média žádnou kauzu. Profily na Hlídači státu pod stejným jménem nelze spolehlivě přiřadit (jméno je rozšířené).',
    dictum: 'Realiťák, co chtěl do Senátu a zůstal řádkem na hlasovacím lístku — nuda je v tomhle byznysu vzácná ctnost.',
    lit: [],
    overrides: {
      lze: { text: 'Žádný výrok na Demagog.cz, žádná doložená nepravda.' },
      penize: { text: 'Běžná realitní činnost. Drobné záznamy na Hlídači pod stejným jménem nelze jednoznačně přiřadit (jméno je rozšířené) — nepředstavují doložený vzorec.' },
      prace: { text: 'Nezvolený kandidát bez mandátu — nelze hodnotit.' },
      konzistence: { text: 'Žádná doložená změna stran kvůli výhodě.' },
      toxicita: { text: 'Žádné doložené urážky ani výhrůžky.' },
      zbabelost: { text: 'Žádný doložený případ.' },
    },
  },
  'kand-3-8': {
    category: 'Není zmrd',
    categoryReason: 'Dvojnásobný senátor za obvod Cheb (2008–2020), starosta a učitel ze Stříbra; v roce 2020 mandát neobhájil. Tenká stopa: žádný profil na Demagogu, žádné mediálně doložené kauzy. Jediný nález — opomenutí živnosti v přiznání 2010 — úřad odložil pro promlčení.',
    dictum: 'Komunální učitel, který si odseděl dvě senátní období bez jediné doložené kauzy — vzácný případ politika, kterého archiv nechává být.',
    lit: [],
    overrides: {
      lze: { text: 'Bez doloženého záznamu; profil ověřených výroků na Demagog.cz nemá.' },
      penize: { text: 'Hlídač eviduje u jeho firem dotace bez doloženého zneužití; firmy neobchodují se státem. Nepřiznaná živnost (2010) byla administrativní pochybení odložené pro promlčení, ne obohacovací schéma.' },
      prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti; v Senátu aktivní člen výborů.' },
      konzistence: { text: 'KSČ/KSČM 1987–1995, od 2003 ČSSD — jednorázová polistopadová trajektorie bez doloženého účelového obratu.' },
      toxicita: { text: 'Bez doloženého záznamu urážek či výhrůžek.' },
      zbabelost: { text: 'Bez doloženého záznamu vyhýbání se odpovědnosti.' },
    },
  },
  'kand-3-9': {
    category: 'Není zmrd',
    categoryReason: 'Právník a zastupitel Plesné, neúspěšný kandidát za SPD (2020, 7,31 %), předtím SPOZ a ČSSD. Žádná doložená kauza, ověřené nepravdy ani toxický výrok. Střídání stran je série neúspěšných kandidatur bez programového obratu, ne otáčení kabátu v mandátu.',
    dictum: 'Vícenásobný neúspěšný kandidát, který za desítky let nestihl spáchat jedinou doložitelnou kauzu — pro zmrdologii prázdný spis.',
    lit: [],
    overrides: {
      lze: { text: 'Bez záznamu. Nemá profil na Demagog.cz.' },
      penize: { text: 'Hlídač eviduje vazbu na Zemědělské družstvo Hroby (zemědělské dotace SZIF/EU), do družstva ale vstoupil až 2024 a jde o dotace dostupné kterémukoli družstvu, ne osobní obohacovací vzorec.' },
      prace: { text: 'Nehodnotitelné — nezvolený kandidát bez mandátu.' },
      konzistence: { text: 'Kandidoval za SPOZ, ČSSD i SPD, vždy neúspěšně — bez doloženého programového obratu pro výhodu.' },
      toxicita: { text: 'Bez záznamu urážlivých či výhrůžných výroků.' },
      zbabelost: { text: 'Bez záznamu.' },
    },
  },
};
