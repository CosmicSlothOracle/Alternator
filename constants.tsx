
import { LearningUnit, ShopItem } from './types';

export const PROGRESS_LEVELS = [
  { title: "Messy Bun", icon: "🎀" },
  { title: "First Try", icon: "👟" },
  { title: "Soft Focus", icon: "🌫️" },
  { title: "Blurry Mirror", icon: "🪞" },
  { title: "Getting Ready", icon: "💄" },
  { title: "Mirror Check ✔", icon: "✔️" },
  { title: "Lipgloss Level", icon: "✨" },
  { title: "Clean Lines", icon: "📏" },
  { title: "Playlist Ready", icon: "🎧" },
  { title: "Outfit Half-Locked", icon: "👗" },
  { title: "After School Glow", icon: "☀️" },
  { title: "Neon Mood", icon: "🏮" },
  { title: "Angles On Point", icon: "📐" },
  { title: "Friday Feeling", icon: "💃" },
  { title: "Main Character Moment", icon: "🎬" },
  { title: "Late Train Energy", icon: "🚄" },
  { title: "City Lights", icon: "🌃" },
  { title: "Bass In The Floor", icon: "🔊" },
  { title: "Späti Stop", icon: "🥤" },
  { title: "No Filter Needed", icon: "📸" },
  { title: "Everyone Knows", icon: "🌟" },
  { title: "Camera Finds You", icon: "🎥" },
  { title: "Quiet Confidence", icon: "🤫" },
  { title: "Always Invited", icon: "💌" },
  { title: "Outfit Locked", icon: "🔒" },
  { title: "Glow Up I", icon: "🔥" },
  { title: "Glow Up II", icon: "💎" },
  { title: "Glow Up III", icon: "🌌" },
  { title: "Main Character Energy", icon: "⚡" },
  { title: "After Midnight", icon: "🌙" }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'av_1', name: 'Newbie', type: 'avatar', cost: 0, value: '👤', description: 'Dein Start-Avatar.', rarity: 'common' },
  { id: 'item_rename', name: 'Name Change', type: 'feature', cost: 150, value: 'rename', description: 'Wähle einen neuen, cooleren Namen.', rarity: 'rare' },
  { id: 'av_2', name: 'Schlaue Eule', type: 'avatar', cost: 100, value: '🦉', description: 'Weise Entscheidungen im Test.', rarity: 'rare' },
  { id: 'av_3', name: 'Math Ninja', type: 'avatar', cost: 300, value: '🥷', description: 'Schneller als jeder Taschenrechner.', rarity: 'epic' },
  { id: 'av_alien', name: 'Cosmic Entity', type: 'avatar', cost: 600, value: '👽', description: 'Wissen aus fremden Galaxien.', rarity: 'epic' },
  { id: 'av_neon', name: 'Cyber Spirit', type: 'avatar', cost: 1000, value: '⚡', description: 'Leuchte im Leaderboard.', rarity: 'legendary' },
  { id: 'av_diamond', name: 'Diamond Lord', type: 'avatar', cost: 2500, value: '💎', description: 'Der ultimative Flex für Profis.', rarity: 'legendary' },
  
  { id: 'eff_rain', name: 'Matrix Rain', type: 'effect', cost: 250, value: 'rain', description: 'Lass Zahlen auf dem Screen regnen.', rarity: 'rare' },
  { id: 'eff_rainbow', name: 'Chroma Aura', type: 'effect', cost: 750, value: 'rainbow', description: 'Dein Avatar leuchtet in Regenbogenfarben.', rarity: 'epic' },
  { id: 'eff_dark', name: 'Void Protocol', type: 'effect', cost: 500, value: 'dark', description: 'Schalte das Dark Theme permanent frei.', rarity: 'epic' }
];

export const GEOMETRY_DEFINITIONS = [
  {
    id: 'shapes',
    segmentId: 1,
    groupId: 'A',
    title: 'Figuren & Haus der Vierecke',
    description: 'Hier lernst du, Vierecke nach ihren Eigenschaften zu ordnen. Alles beginnt beim allgemeinen Viereck.',
    formula: 'Winkelsumme = 360°',
    terms: [
      'Trapez: Mindestens zwei parallele Seiten.',
      'Parallelogramm: Je zwei Seiten parallel und gleich lang.',
      'Raute: Ein Parallelogramm mit vier gleich langen Seiten (wie ein Drache).',
      'Rechteck: Ein Parallelogramm mit vier rechten Winkeln (90°).',
      'Quadrat: Die perfekte Form. Alle Seiten gleich lang UND alle Winkel 90°.',
      'Symmetrie: Ein Quadrat hat 4 Symmetrieachsen, ein Rechteck nur 2.'
    ],
    visual: 'shapes'
  },
  {
    id: 'angles',
    segmentId: 2,
    groupId: 'A',
    title: 'Winkel & Thaleskreis',
    description: 'Winkel an Geraden und der magische 90°-Kreis.',
    formula: 'Nebenwinkel = 180° | Thales = 90°',
    terms: [
      'Scheitelwinkel: Liegen sich gegenüber und sind exakt gleich groß.',
      'Nebenwinkel: Liegen nebeneinander auf einer Geraden. Summe = 180°.',
      'Satz des Thales: Jeder Punkt auf einem Halbkreis bildet mit dem Durchmesser ein rechtwinkliges Dreieck.',
      'Innenwinkelsumme: Im Dreieck immer 180°, im Viereck immer 360°.',
      'Stufenwinkel: Entstehen an parallelen Geraden und sind gleich groß.'
    ],
    visual: 'angles'
  },
  {
    id: 'areas',
    segmentId: 3,
    groupId: 'B',
    title: 'Flächen & Zerlegung',
    description: 'Wie man komplizierte Flächen einfach berechnet.',
    formula: 'A(Trapez) = (a + c) / 2 * h',
    terms: [
      'Parallelogramm: A = Grundseite * Höhe (g * h).',
      'Dreieck: A = (g * h) / 2. Jedes Dreieck ist ein halbes Parallelogramm.',
      'Trapez: A = Mittelparallele (m) * Höhe. Wobei m = (a+c)/2 ist.',
      'Zerlegung: Teile wilde Formen in Rechtecke auf und addiere sie.',
      'Ergänzung: Rechne ein großes Rechteck minus die "Lücken", die nicht dazu gehören.'
    ],
    visual: 'shapes'
  },
  {
    id: 'volumes',
    segmentId: 4,
    groupId: 'B',
    title: 'Körper & Oberflächen',
    description: 'Vom flachen Blatt zum 3D-Körper.',
    formula: 'V = G * h | O = 2*G + M',
    terms: [
      'Prisma: Ein Körper mit zwei identischen Vielecken als Deck- und Grundfläche.',
      'Zylinder: Ein rundes Prisma. Grundfläche G = π * r².',
      'Mantelfläche (M): Die äußere Wand. Beim Zylinder ist M = Umfang * Höhe (2*π*r*h).',
      'Volumen (V): Gibt an, wie viel Platz drinnen ist (Einheit: cm³, dm³, m³).',
      'Oberfläche (O): Alles, was man anmalen kann. 2x Boden + 1x Mantel.'
    ],
    visual: 'pythagoras'
  },
  {
    id: 'transform',
    segmentId: 5,
    groupId: 'A',
    title: 'Ähnlichkeit & Streckung',
    description: 'Formen skalieren ohne sie zu verzerren.',
    formula: 'L_neu = k * L_alt',
    terms: [
      'Ähnlichkeit: Figuren sind ähnlich, wenn ihre Winkel gleich sind (Form bleibt gleich).',
      'Streckfaktor k: k > 1 vergrößert, k < 1 verkleinert.',
      'Flächenfaktor: Die Fläche ändert sich um k². (Bsp: k=2 -> 4x Fläche).',
      'Volumenfaktor: Das Volumen ändert sich um k³. (Bsp: k=2 -> 8x Volumen).',
      'Maßstab: 1:100 bedeutet 1cm auf der Karte sind 100cm (1m) in echt.'
    ],
    visual: 'angles'
  },
  {
    id: 'context',
    segmentId: 6,
    groupId: 'C',
    title: 'Transfer & Modellierung',
    description: 'Mathe im echten Leben anwenden.',
    formula: 'V = G * h (Alltagstransfer)',
    terms: [
      'Umrechnung: Wichtig! 1 Liter ist exakt 1 dm³.',
      'Flüssigkeiten: Wenn du cm³ hast, teile durch 1000, um Liter zu bekommen.',
      'Sachaufgaben: Lies genau! Wird nach dem Volumen (Inhalt) oder der Oberfläche (Material) gefragt?',
      'Rundung: Im echten Leben rundet man oft auf zwei Nachkommastellen.',
      'Zusammengesetzte Körper: Ein Haus ist oft ein Quader mit einem Prisma-Dach.'
    ],
    visual: 'pythagoras'
  }
];

export const LEARNING_UNITS: LearningUnit[] = [
  {
    id: 'u1', segment: 1, group: 'A', category: 'Basics', title: 'Figuren verstehen',
    description: 'Erkennen, beschreiben, ordnen.',
    detailedInfo: 'Werde zum Profi im Identifizieren von Vierecken. Verstehe, warum jedes Quadrat ein Rechteck ist, aber nicht jedes Rechteck ein Quadrat.',
    examples: ['Quadrat = Rechteck + Raute'],
    keywords: ['form', 'viereck', 'eigenschaft', 'klassifikation', 'viereckshaus'],
    difficulty: 'Einfach', coinsReward: 50,
    definitionId: 'shapes',
    tasks: []
  },
  {
    id: 'u2', segment: 2, group: 'A', category: 'Basics', title: 'Winkel & Beziehungen',
    description: 'Winkel sicher lesen & begründen.',
    detailedInfo: 'Lerne die Geheimsprache der Geradenkreuzungen. Nutze den Thaleskreis, um perfekte rechte Winkel zu finden.',
    examples: ['Nebenwinkel = 180°', 'Thales: γ = 90°'],
    keywords: ['winkel', 'thales', 'nebenwinkel', 'grad', 'kreis'],
    difficulty: 'Mittel', coinsReward: 60,
    definitionId: 'angles',
    tasks: []
  },
  {
    id: 'u3', segment: 3, group: 'B', category: 'Berechnung', title: 'Flächen & Terme',
    description: 'Flächen sehen statt nur rechnen.',
    detailedInfo: 'Trapeze und Parallelogramme lauern überall. Lerne, wie man sie mit einfachen Formeln bändigt.',
    examples: ['A(Trapez) = m * h'],
    keywords: ['fläche', 'trapez', 'zerlegung', 'cm2'],
    difficulty: 'Mittel', coinsReward: 80,
    definitionId: 'areas',
    tasks: []
  },
  {
    id: 'u4', segment: 4, group: 'B', category: 'Berechnung', title: 'Körper & Oberflächen',
    description: '3D-Denken & Volumina.',
    detailedInfo: 'Stell dir vor, du baust eine Dose. Wie viel Blech brauchst du? Wie viel Limo passt rein? Hier erfährst du es.',
    examples: ['V = G * h', 'M = u * h'],
    keywords: ['volumen', 'zylinder', 'prisma', 'oberfläche', '3d'],
    difficulty: 'Schwer', coinsReward: 100,
    definitionId: 'volumes',
    tasks: []
  },
  {
    id: 'u5', segment: 5, group: 'A', category: 'Transformation', title: 'Ähnlichkeit',
    description: 'Maßstäbe & zentrische Streckung.',
    detailedInfo: 'Zoomen im echten Leben. Was passiert mit der Fläche eines Fotos, wenn du es doppelt so groß ausdruckst?',
    examples: ['Länge * k', 'Fläche * k²'],
    keywords: ['ähnlichkeit', 'streckung', 'maßstab', 'faktor'],
    difficulty: 'Mittel', coinsReward: 70,
    definitionId: 'transform',
    tasks: []
  },
  {
    id: 'u6', segment: 6, group: 'C', category: 'Modellierung', title: 'Alltags-Geometrie',
    description: 'Mathe für echte Probleme.',
    detailedInfo: 'Hausbau, Poolbefüllung oder Zeltlager – hier zeigst du, dass du Geometrie im Griff hast.',
    examples: ['Verschnitt berechnen', 'Füllmengen'],
    keywords: ['sachaufgabe', 'transfer', 'modell', 'alltag'],
    difficulty: 'Schwer', coinsReward: 120,
    definitionId: 'context',
    tasks: []
  }
];
