import type { Element, MoonPhaseKey, OrganDetails } from '../types'
import type { ZodiacElement } from '../lib/zodiac'

/** Übersetzungstyp – English ist die Referenzstruktur. */
export interface Translation {
  brandTitle: string
  brandSubtitle: string
  langDe: string
  langEn: string
  langZh: string
  langHi: string
  langEs: string
  langFr: string
  langAr: string
  langBn: string
  langRu: string
  langPt: string
  langUr: string
  langFi: string
  langJa: string
  langNo: string
  langPl: string
  langNl: string
  langIt: string
  langDa: string
  langSv: string
  useLocation: string
  addressPlaceholder: string
  searching: string
  locationLabel: string
  sourceGps: string
  sourceAddress: string
  sourceSaved: string
  geoDenied: string
  geoUnavailable: string
  geoError: string
  geoLoading: string
  trueSolarTime: string
  trueSolarTimeHint: string
  civilTime: string
  utcOffset: string
  longitude: string
  longitudeCorrection: string
  equationOfTime: string
  sunrise: string
  sunset: string
  solarNoon: string
  polarDay: string
  polarNight: string
  organClock: string
  organClockHint: string
  organActiveNow: string
  organs: Record<string, string>
  elements: Record<Element, string>
  moonPhase: string
  moonPhaseHint: string
  illumination: string
  cycleDay: string
  fullMoonWeek: string
  daysToFullMoon: string
  daysSinceFullMoon: string
  phases: Record<MoonPhaseKey, string>
  footerOsm: string
  footerNote: string
  footerDedication: string
  adanoLeyName: string
  awaitingLocation: string
  timeSelectionLabel: string
  liveTime: string
  customTime: string
  resetToLive: string
  timeSelectorHint: string
  springEquinox: string
  summerSolstice: string
  autumnEquinox: string
  winterSolstice: string
  paypalDonate: string
  venmoDonate: string
  venmoModalTitle: string
  venmoModalText: string
  venmoOpenLink: string
  solarNutritionTitle: string
  solarNutritionSubtitle: string
  growthZone1Title: string
  growthZone1Desc: string
  growthZone2Title: string
  growthZone2Desc: string
  growthZone3Title: string
  growthZone3Desc: string
  growthZoneShort1: string
  growthZoneShort2: string
  growthZoneShort3: string
  nutritionFullMoonWarning: string
  pwaInstallBtn: string
  pwaInstallTitle: string
  pwaInstallIosHint: string
  tabShortNutrition: string
  printPage: string
  seasonsQuickSelect: string
  planetaryHoursTitle: string
  planetaryHoursHint: string
  dayRuler: string
  diurnalHour: string
  nocturnalHour: string
  planetSun: string
  planetVenus: string
  planetMercury: string
  planetMoon: string
  planetSaturn: string
  planetJupiter: string
  planetMars: string
  planetDescs: Record<string, string>
  zodiacTitle: string
  sunSign: string
  moonSign: string
  zodiacSigns: Record<string, string>
  zodiacElements: Record<ZodiacElement, string>
  nowHere: string

  /** Accessibility-Labels für Screenreader (SVG-/Canvas-Komponenten). */
  ariaAnalogClock: string
  /** Sonnenbogen: Platzhalter {el} = aktuelle Höhe in Grad. */
  ariaSolarArc: string
  /** Mondgrafik: {phase} = Phasenname, {lit} = Beleuchtung in %. */
  ariaMoonGraphic: string
  ariaOrganWheel: string
  /** Mond-Zeitstrahl: {cycleDay} = Zyklustag, {total} = Synodik, {pct} = Position %. */
  ariaMoonTimeline: string

  /** Kurze Tab-Labels für das mobile Karten-Layout. */
  tabShortSolar: string
  tabShortArc: string
  tabShortOrgan: string
  tabShortPlanetary: string
  tabShortMoon: string
  tabShortZodiac: string
  tabShortProfile: string

  /** Tagesprofil-Karte: Synthese aus Organ/Planet/Mond. */
  profileTitle: string
  profileHint: string
  profileOrganNow: string
  profilePlanetNow: string
  profileMoonNow: string
  profileTipLabel: string
  profileNutritionLabel: string
  profileMoonBoost: string
  /** Planetare Qualität je Planet (7 Keys). */
  planetProfileSun: string
  planetProfileMoon: string
  planetProfileMars: string
  planetProfileMercury: string
  planetProfileJupiter: string
  planetProfileVenus: string
  planetProfileSaturn: string

  moonrise: string
  moonset: string
  nextFullMoon: string
  nextNewMoon: string
  notAvailable: string
  solarArcTitle: string
  solarArcHint: string
  sunAboveHorizon: string
  sunBelowHorizon: string
  goldenHour: string
  goldenHourEve: string
  civilDawn: string
  civilDusk: string
  nauticalDawn: string
  nauticalDusk: string
  astronomicalDawn: string
  astronomicalDusk: string
  addFavorite: string
  removeFavorite: string
  favorites: string
  share: string
  copied: string
  noFavorites: string
  searchError: string
  ipFallbackLabel: string

  activitiesTitle: string
  nutritionTitle: string
  acupressureTitle: string

  settingsTitle: string
  notificationsTitle: string
  enableNotifications: string
  notifOrganChange: string
  notifSelectedOrgans: string
  notifAllOrgans: string
  notifFullMoon: string
  notifPermissionDenied: string
  notifPermissionPrompt: string
  notifTitleOrgan: string
  notifTitleFullMoon: string
  notifBodyFullMoon: string

  themeTitle: string
  themeDefault: string
  themeNightshift: string
  themeToggleTip: string

  embedWidgetTitle: string
  embedWidgetDesc: string
  embedGenerateCode: string
  embedCopyCode: string
  embedCopied: string
  embedViewLabel: string
  embedWidthLabel: string
  embedHeightLabel: string
  embedInstructionsTitle: string
  embedInstruction1: string
  embedInstruction2: string
  embedInstruction3: string

  /** Daten-Export/Import/Reset (Backup). */
  dataTitle: string
  dataDesc: string
  dataExport: string
  dataExported: string
  dataImport: string
  /** Platzhalter {count} = Anzahl importierter Favoriten. */
  dataImported: string
  dataImportError: string
  dataReset: string
  dataResetConfirm: string
  dataResetDone: string

  organDetails: Record<string, OrganDetails>
}

/** English dictionary (reference). */
const en: Translation = {
  brandTitle: 'Solar Time',
  brandSubtitle: 'Discover the true time by the sun, right where you are.',

  langDe: 'DE',
  langEn: 'EN',
  langZh: 'ZH',
  langHi: 'HI',
  langEs: 'ES',
  langFr: 'FR',
  langAr: 'AR',
  langBn: 'BN',
  langRu: 'RU',
  langPt: 'PT',
  langUr: 'UR',
  langFi: 'FI',
  langJa: 'JA',
  langNo: 'NO',
  langPl: 'PL',
  langNl: 'NL',
  langIt: 'IT',
  langDa: 'DA',
  langSv: 'SV',

  useLocation: 'Use my location',
  addressPlaceholder: 'Search address or place …',
  searching: 'Searching …',
  locationLabel: 'Location',
  sourceGps: 'GPS',
  sourceAddress: 'Address',
  sourceSaved: 'saved',
  geoDenied: 'Location access denied. Please search by address or grant permission.',
  geoUnavailable: 'Location detection is not available.',
  geoError: 'Could not determine your location.',
  geoLoading: 'Determining your location …',

  trueSolarTime: 'True Solar Time',
  trueSolarTimeHint: "Based on the sun's position at your location.",
  civilTime: 'Local time',
  utcOffset: 'UTC offset',
  longitude: 'Longitude',
  longitudeCorrection: 'Longitude correction',
  equationOfTime: 'Equation of Time',
  sunrise: 'Sunrise',
  sunset: 'Sunset',
  solarNoon: 'Solar noon',
  polarDay: 'Polar Day (24h daylight)',
  polarNight: 'Polar Night (24h darkness)',

  organClock: 'TCM Organ Clock',
  organClockHint: 'According to the Chinese body clock (TCM).',
  organActiveNow: 'Active now',

  organs: {
    lung: 'Lung',
    largeIntestine: 'Large Intestine',
    stomach: 'Stomach',
    spleen: 'Spleen-Pancreas',
    heart: 'Heart',
    smallIntestine: 'Small Intestine',
    bladder: 'Bladder',
    kidney: 'Kidney',
    pericardium: 'Pericardium',
    tripleBurner: 'Triple Burner',
    gallbladder: 'Gallbladder',
    liver: 'Liver',
  },

  elements: {
    metal: 'Metal',
    earth: 'Earth',
    fire: 'Fire',
    water: 'Water',
    wood: 'Wood',
  },

  moonPhase: 'Moon Phase',
  moonPhaseHint: 'Current state of the moon in its cycle.',
  illumination: 'Illumination',
  cycleDay: 'Day {day} of {total}',
  fullMoonWeek: 'Full moon week – energy is particularly high.',
  daysToFullMoon: '{days} days until full moon',
  daysSinceFullMoon: '{days} days since full moon',

  phases: {
    new: 'New Moon',
    waxingCrescent: 'Waxing Crescent',
    firstQuarter: 'First Quarter',
    waxingGibbous: 'Waxing Gibbous',
    full: 'Full Moon',
    waningGibbous: 'Waning Gibbous',
    lastQuarter: 'Last Quarter',
    waningCrescent: 'Waning Crescent',
  },

  footerOsm: 'Location data © OpenStreetMap contributors',
  footerNote: 'All calculations run locally in your browser.',
  footerDedication: 'In memory of {name} (Swami Nitty Gritty), rediscoverer and founder of Solar Nutrition.',
  adanoLeyName: 'Adano Ley',

  awaitingLocation: 'Please select a location to see the times.',

  timeSelectionLabel: 'Date & Time',
  liveTime: 'Live Time',
  customTime: 'Simulated Date',
  resetToLive: 'Reset to Live Time',
  timeSelectorHint: 'Select a date and time to simulate solar time, TCM clock & moon phase.',
  springEquinox: 'Spring Equinox (Mar 20)',
  summerSolstice: 'Summer Solstice (Jun 21)',
  autumnEquinox: 'Autumn Equinox (Sep 22)',
  winterSolstice: 'Winter Solstice (Dec 21)',
  paypalDonate: 'Donate',
  venmoDonate: 'Venmo',
  venmoModalTitle: 'Venmo Donations',
  venmoModalText: 'Donations and payments on Venmo can be sent directly to username @Hodrius.',
  venmoOpenLink: 'Open Venmo (@Hodrius)',
  solarNutritionTitle: 'Solar Nutrition',
  solarNutritionSubtitle: 'According to the principles of Adano Ley (Swami Nitty Gritty)',
  growthZone1Title: 'Currently in Growth Zone 1',
  growthZone1Desc: 'Eat foods and fruits that grow on trees, or foods that are neutrally permitted at any time.',
  growthZone2Title: 'Currently in Growth Zone 2',
  growthZone2Desc: 'Eat foods that grow on bushes and shrubs or at least 6 cm above the ground, or foods that are neutrally permitted at any time.',
  growthZone3Title: 'Currently in Growth Zone 3',
  growthZone3Desc: 'Eat foods that grow underground or close to the ground (lower than 6 cm), or foods from water or the sea, or foods that are neutrally permitted at any time.',
  growthZoneShort1: 'Trees & Tree Fruits',
  growthZoneShort2: 'Bushes & Shrubs (≥ 6cm)',
  growthZoneShort3: 'Roots (< 6cm) & Sea',
  nutritionFullMoonWarning: 'Attention: You are currently within Full Moon Week. Please consider the rules for 3 days before full moon, the day of full moon, and 3 days after full moon if you already have experience with Solar Nutrition.',
  pwaInstallBtn: 'Install App',
  pwaInstallTitle: 'Install Solar Time',
  pwaInstallIosHint: 'On iOS / Safari: Tap the Share button ⎋ below and select "Add to Home Screen".',
  tabShortNutrition: 'Nutrition',
  printPage: 'Print / Save as PDF',
  seasonsQuickSelect: 'Solstices & Equinoxes',
  planetaryHoursTitle: 'Planetary Hours',
  planetaryHoursHint: 'Astrological planetary hours based on Chaldean order.',
  dayRuler: 'Day Ruler',
  diurnalHour: 'Day Hour',
  nocturnalHour: 'Night Hour',
  planetSun: 'Sun',
  planetVenus: 'Venus',
  planetMercury: 'Mercury',
  planetMoon: 'Moon',
  planetSaturn: 'Saturn',
  planetJupiter: 'Jupiter',
  planetMars: 'Mars',
  planetDescs: {
    sun: 'Vitality, leadership, self-awareness & clarity',
    venus: 'Harmony, love, art, enjoyment & relationship',
    mercury: 'Communication, learning, commerce & analysis',
    moon: 'Intuition, emotions, care & transformation',
    saturn: 'Structure, discipline, focus & endurance',
    jupiter: 'Abundance, optimism, growth & wisdom',
    mars: 'Energy, courage, action & assertiveness',
  },
  zodiacTitle: 'Zodiac & Celestial Position',
  sunSign: 'Sun Sign (Zodiac)',
  moonSign: 'Moon Sign',
  zodiacSigns: {
    aries: 'Aries',
    taurus: 'Taurus',
    gemini: 'Gemini',
    cancer: 'Cancer',
    leo: 'Leo',
    virgo: 'Virgo',
    libra: 'Libra',
    scorpio: 'Scorpio',
    sagittarius: 'Sagittarius',
    capricorn: 'Capricorn',
    aquarius: 'Aquarius',
    pisces: 'Pisces',
  },
  zodiacElements: {
    fire: 'Fire',
    earth: 'Earth',
    air: 'Air',
    water: 'Water',
  },
  nowHere: 'Now here',

  ariaAnalogClock: 'Analog solar clock',
  ariaSolarArc: 'Sun elevation curve, current {el}°',
  ariaMoonGraphic: 'Moon phase: {phase}, {lit}% illuminated',
  ariaOrganWheel: 'TCM organ wheel',
  ariaMoonTimeline: 'Moon cycle day {cycleDay} of {total}, position {pct}%',

  tabShortSolar: 'Solar',
  tabShortArc: 'Arc',
  tabShortOrgan: 'Organ',
  tabShortPlanetary: 'Planet',
  tabShortMoon: 'Moon',
  tabShortZodiac: 'Zodiac',
  tabShortProfile: 'Profile',

  profileTitle: 'Daily Profile',
  profileHint: 'Synthesis of organ clock, planetary hour and moon phase.',
  profileOrganNow: 'Organ',
  profilePlanetNow: 'Planet',
  profileMoonNow: 'Moon',
  profileTipLabel: 'Good for right now',
  profileNutritionLabel: 'Nutrition now',
  profileMoonBoost: 'Full moon week – energy is amplified.',
  planetProfileSun: 'Clarity, vitality and presence',
  planetProfileMoon: 'Intuition, receptivity and care',
  planetProfileMars: 'Courage, drive and focused action',
  planetProfileMercury: 'Communication, learning and exchange',
  planetProfileJupiter: 'Growth, generosity and perspective',
  planetProfileVenus: 'Harmony, enjoyment and connection',
  planetProfileSaturn: 'Structure, discipline and depth',

  moonrise: 'Moonrise',
  moonset: 'Moonset',
  nextFullMoon: 'Next Full Moon',
  nextNewMoon: 'Next New Moon',
  notAvailable: '—',

  solarArcTitle: 'Daily Sun Arc',
  solarArcHint: 'All times are in local standard time (clock time), not True Solar Time.',
  sunAboveHorizon: 'Sun above horizon',
  sunBelowHorizon: 'Sun below horizon',
  goldenHour: 'Golden Hour (AM)',
  goldenHourEve: 'Golden Hour (PM)',
  civilDawn: 'Civil Dawn',
  civilDusk: 'Civil Dusk',
  nauticalDawn: 'Nautical Dawn',
  nauticalDusk: 'Nautical Dusk',
  astronomicalDawn: 'Astronomical Dawn',
  astronomicalDusk: 'Astronomical Dusk',

  addFavorite: 'Save as favorite',
  removeFavorite: 'Remove from favorites',
  favorites: 'Favorites',
  share: 'Share location',
  copied: 'Link copied!',
  noFavorites: 'No saved places yet.',
  searchError: 'Search failed – please try again or enter coordinates.',
  ipFallbackLabel: 'Approximate location (IP)',

  activitiesTitle: 'Recommended Activities',
  nutritionTitle: 'Nutrition & Tea Tips',
  acupressureTitle: 'Acupressure Points',

  settingsTitle: 'Settings',
  notificationsTitle: 'Browser Notifications',
  enableNotifications: 'Enable Notifications',
  notifOrganChange: 'Notify on Organ Window Change',
  notifSelectedOrgans: 'Notify only for selected organs (empty = all)',
  notifAllOrgans: 'All organs selected',
  notifFullMoon: 'Full Moon Week entrance alert',
  notifPermissionDenied: 'Notification permission denied in browser settings.',
  notifPermissionPrompt: 'Request Notification Permission',
  notifTitleOrgan: '{organ} Window ({window})',
  notifTitleFullMoon: 'Full Moon Week Started',
  notifBodyFullMoon: 'Energy levels are at their peak for the next 7 days.',

  themeTitle: 'Theme Mode',
  themeDefault: 'Night Sky (Default)',
  themeNightshift: 'Astronomy Red Light Mode',
  themeToggleTip: 'Toggle Astronomy Red Light Mode',

  embedWidgetTitle: 'Embed Widget',
  embedWidgetDesc: 'Embed the Organ Clock or Solar Time directly into your website or blog.',
  embedGenerateCode: 'Generate Embed Code',
  embedCopyCode: 'Copy Embed Code',
  embedCopied: 'Copied!',
  embedViewLabel: 'View Type',
  embedWidthLabel: 'Width (px or %)',
  embedHeightLabel: 'Height (px)',
  embedInstructionsTitle: 'How to embed on your site',
  embedInstruction1: 'Choose your preferred view (Organ Clock, Solar Time, or Moon Phase).',
  embedInstruction2: 'Copy the HTML <iframe> snippet generated below.',
  embedInstruction3: 'Paste it into your website editor (WordPress Custom HTML, Wix, Squarespace, or HTML file).',

  dataTitle: 'Data & Backup',
  dataDesc: 'Export your favorites, settings, and language as a JSON file, or import a backup.',
  dataExport: 'Export as JSON file',
  dataExported: 'Backup downloaded',
  dataImport: 'Import JSON file',
  dataImported: '{count} favorites imported, settings updated',
  dataImportError: 'Invalid backup file',
  dataReset: 'Delete all data',
  dataResetConfirm: 'Really delete all favorites, settings and language? This cannot be undone.',
  dataResetDone: 'All data deleted',

  organDetails: {
    lung: {
      activities: [
        'A sign of balance and health is waking up between 3:00 AM and 5:00 AM. Lung time is ideal for light exercises (such as Tai Chi), meditation, as well as studying, reading, reflecting, or receiving inspiration.',
        'Practice deep diaphragmatic breathing to activate the upper, middle, and lower lung.',
        'This is also an ideal time for light massages using local osmotic pressure in the outer area, as close to the organ as possible. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion-based pressure.',
      ],
      acupressure: [{ name: 'LU 7 (Lieque)', desc: 'Radial side of the wrist, about 2 finger widths above the wrist crease. Relieves respiratory tension.' }],
    },
    largeIntestine: {
      activities: [
        'Perform a relaxed cross-crawl walk with arms swinging freely. Drink distilled water.',
        'Encourage a bowel movement to stimulate gastrointestinal peristalsis and relieve pressure from the transverse colon.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusing pressure.',
      ],
      acupressure: [{ name: 'LI 4 (Hegu)', desc: 'In the webbing between thumb and index finger. Regulates digestion and clears heat.' }],
    },
    stomach: {
      activities: [
        'Eat soaked almonds (chewing thoroughly) and kiwi, papaya, and/or pear with an optimal chronobiotic breakfast. Drink a cobalamin tonic.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion-based pressure.',
      ],
      acupressure: [{ name: 'ST 36 (Zusanli)', desc: 'Four finger widths below the kneecap, one finger width outside the shinbone. Master point for digestive energy.' }],
    },
    spleen: {
      activities: [
        'Drink lemonade or limeade with orange blossom honey. As an occasional alternative, drink cobalamin tonic during Spleen-Pancreas time instead of Stomach time (7:00–9:00 AM).',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion pressure.',
      ],
      acupressure: [{ name: 'SP 6 (Sanyinjiao)', desc: 'Four finger widths above the inner ankle bone behind the shinbone. Nourishes spleen and blood.' }],
    },
    heart: {
      activities: [
        'Eat red bell pepper, cayenne, and clarified butter (ghee) with an optimal chronobiotic lunch between 12:00 PM and 1:00 PM. Occasionally drink a cup of hawthorn tea with lunch.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology treatment with distal diffusion-based pressure.',
      ],
      acupressure: [{ name: 'HT 7 (Shenmen)', desc: 'At the wrist crease on the pinky side. Calms the mind and spirit.' }],
    },
    smallIntestine: {
      activities: [
        'Eat spaghetti squash, black or brown sesame seeds, and unrefined corn oil with an optimal chronobiotic lunch.',
        'Drink 6–8 oz of tomato juice with unsulfured blackstrap molasses and a pinch of cayenne pepper. Occasionally eat stuffed grape leaves with sheep or goat cheese, or supplement with barley grass.',
        'This is also an ideal time for light massages using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusional pressure.',
      ],
      acupressure: [{ name: 'SI 3 (Houxi)', desc: 'On the outer edge of the hand below the pinky knuckle. Relieves neck and back tension.' }],
    },
    bladder: {
      activities: [
        'Juice an organic watermelon—rind, seeds, and all. Pass the pulp through the juicer three times and drink 6–8 oz.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusional pressure.',
      ],
      acupressure: [{ name: 'BL 60 (Kunlun)', desc: 'In the depression between outer ankle bone and Achilles tendon. Relieves backache and promotes flow.' }],
    },
    kidney: {
      activities: [
        'Drink 6 to 8 oz of cranberry juice or blueberry juice.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology treatment with distal diffusing pressure.',
      ],
      acupressure: [{ name: 'KI 1 (Yongquan)', desc: 'In the depression of the sole, upper third of the foot. Grounding point for calm and vitality.' }],
    },
    pericardium: {
      activities: [
        'For men: Eat yam, kelp, and white or red radish with an optimal chronobiotic dinner. For women: Eat yam, dulse, and black radish with an optimal chronobiotic dinner.',
        'Men may supplement with ginseng at this time. Women may occasionally supplement with ginseng or Dang Gui (Angelica sinensis rhizome) in the morning during Stomach time (7:00–9:00 AM).',
        'Men may eat two-thirds of a baked plantain and women one-third of a baked plantain as the second and final part of a two-part Circulation-Sex tonic starting at Stomach time.',
        'This is also an ideal time for a gentle massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion pressure.',
      ],
      acupressure: [{ name: 'PC 6 (Neiguan)', desc: 'Two finger widths above inner wrist crease between tendons. Protects heart and calms emotions.' }],
    },
    tripleBurner: {
      activities: [
        'Eat a portion of fresh pineapple with a dollop of pure peanut butter. As a substitute or alternative, drink pineapple juice with 1 to 3 teaspoons of 100% agave tequila (or 100% potato vodka) and 1 to 3 tablespoons of aloe vera.',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion-based pressure.',
      ],
      acupressure: [{ name: 'TB 5 (Waiguan)', desc: 'Two finger widths above outer wrist crease between bones. Balances body heat and immune defense.' }],
    },
    gallbladder: {
      activities: [
        'Perform cross-crawling on a mini trampoline. Drink apple juice containing one teaspoon of extra virgin olive oil. Occasionally eat an Umeboshi plum and its seed.',
        'After performing one or all of these suggestions, rest or sleep.',
        'This is also an ideal time for a gentle massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusional pressure.',
      ],
      acupressure: [{ name: 'GB 34 (Yanglingquan)', desc: 'Outer side of lower leg below fibula head. Relaxes tendons and muscles.' }],
    },
    liver: {
      activities: [
        'Rest or sleep. Once a month, preferably at the time of the full moon, wake up to drink cobalamin tonic to cleanse carbon residues from glycogen storage in the liver.',
        'Then go to sleep with the light turned on. (You can use a red light if you want to gain weight, and a green light if your goal is to be lean and toned.)',
        'This is also an ideal time for a light massage using local osmotic pressure in the outer area as close as possible to the organ. At any other time of day, avoid local pressure massage and use reflexology with distal diffusion pressure.',
      ],
      acupressure: [{ name: 'LV 3 (Taichong)', desc: 'On top of foot between 1st and 2nd metatarsal bones. Clears stagnation and detoxifies.' }],
    },
  },
}

export default en
