
import { Task } from '../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Fisher-Yates Shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const TaskFactory = {
  generateTasks(unitId: string, count: number = 5): Task[] {
    const pool = this.getTaskPool(unitId);
    // Shuffle and take first 'count' items to ensure no duplicates in one run
    const shuffled = shuffleArray<Task>(pool);
    return shuffled.slice(0, count);
  },

  // Generates the "Final Boss" task for the Bounty
  generateBountyTask(unitId: string): Task {
    const seed = Date.now();
    return this.createBountyTask(unitId, seed);
  },

  getTaskPool(unitId: string): Task[] {
    const seed = Date.now(); // Still use seed for ID generation uniqueness per session

    switch (unitId) {
      case 'u1': return [
        this.createWagerTask(1, seed),
        this.createVisualShapeTask(0, seed),
        this.createShapeTask(0, seed), // Rechteck vs Quadrat
        this.createShapeTask(1, seed), // Schiefes Regal (Ex-Pizza)
        this.createShapeTask(2, seed), // Smartphone
        this.createVisualShapeTask(1, seed), // Alternative Visuals
        this.createVisualShapeTask(2, seed)
      ];
      case 'u2': return [
        this.createVisualAngleTask(0, seed),
        this.createAngleTask(0, seed),
        this.createAngleTask(1, seed),
        this.createAngleTask(2, seed),
        this.createVisualAngleTask(1, seed),
        this.createVisualAngleTask(2, seed)
      ];
      case 'u3': return [
        this.createAreaTask(0, seed),
        this.createAreaTask(1, seed),
        this.createAreaTask(2, seed),
        this.createAreaTask(3, seed), // Extra variation
        this.createAreaTask(4, seed)
      ];
      case 'u4': return [
        this.createVolumeTask(0, seed),
        this.createVolumeTask(1, seed),
        this.createVolumeTask(2, seed),
        this.createVolumeTask(3, seed),
        this.createVolumeTask(4, seed)
      ];
      case 'u5': return [
        this.createVisualSimilarityTask(0, seed),
        this.createVisualSimilarityTask(1, seed),
        this.createScalingLogicTask(0, seed),
        this.createScalingLogicTask(1, seed),
        this.createScalingLogicTask(2, seed),
        this.createScalingLogicTask(3, seed),
        this.createTransformTask(0, seed)
      ];
      case 'u6': return [
        this.createContextTask(0, seed),
        this.createContextTask(1, seed),
        this.createContextTask(2, seed),
        this.createContextTask(3, seed),
        this.createContextTask(4, seed)
      ];
      default: return [];
    }
  },

  // --- BOUNTY TASKS (Classical Math Problems) ---
  createBountyTask(unitId: string, seed: number): Task {
    const id = `bounty-${unitId}-${seed}`;
    
    switch (unitId) {
      case 'u1': // Segment 1: Figuren verstehen
        return {
          id, type: 'choice',
          question: "Aussage: 'Jedes Rechteck ist ein Quadrat.' Entscheide und begründe.",
          options: [
            "Stimmt, weil beide 4 Ecken haben.",
            "Stimmt nicht, weil bei einem Quadrat alle Seiten gleich lang sein müssen.",
            "Stimmt, weil Quadrate spezielle Rechtecke sind.",
            "Stimmt nicht, weil Rechtecke länglicher sind."
          ],
          correctAnswer: 1,
          explanation: "Ein Quadrat ist zwar ein spezielles Rechteck, aber die Aussage 'JEDES Rechteck ist ein Quadrat' ist falsch. Ein Rechteck mit den Seiten 4cm und 6cm ist kein Quadrat."
        };
      
      case 'u2': // Segment 2: Winkel
        return {
          id, type: 'input',
          question: "Ein Dreieck hat die Winkel 47° und 63°. Berechne den dritten Winkel.",
          correctAnswer: "70",
          placeholder: "Grad",
          explanation: "Die Innenwinkelsumme im Dreieck beträgt immer 180°. Also: 180° - 47° - 63° = 70°."
        };

      case 'u3': // Segment 3: Flächen und Terme
        return {
          id, type: 'input',
          question: "Ein Rechteck hat die Seitenlängen (x+2) und (x-1). Berechne die Fläche für x=6.",
          correctAnswer: "40",
          placeholder: "Flächeneinheiten",
          explanation: "Für x=6 sind die Seitenlängen (6+2)=8 und (6-1)=5. Die Fläche ist A = 8 * 5 = 40."
        };

      case 'u4': // Segment 4: Körper und Oberflächen
        return {
          id, type: 'input',
          question: "Ein Quader hat die Maße 8cm × 5cm × 4cm. Berechne das Volumen.",
          correctAnswer: "160",
          placeholder: "cm³",
          explanation: "Das Volumen eines Quaders ist Länge × Breite × Höhe. Also: 8 * 5 * 4 = 160 cm³."
        };

      case 'u5': // Segment 5: Ähnlichkeit
        return {
          id, type: 'input',
          question: "Ein Modellauto im Maßstab 1:20 ist einem echten Auto von 4,2 m Länge nachempfunden. Wie lang ist das Modell in cm?",
          correctAnswer: "21",
          placeholder: "cm",
          explanation: "4,2 Meter sind 420 cm. Die Modelllänge ist 420 cm / 20 = 21 cm."
        };

      case 'u6': // Segment 5: Alltagsgeometrie
        return {
          id, type: 'input',
          question: "Ein 1,80 m großer Mensch wirft einen 2,4 m langen Schatten. Zur gleichen Zeit wirft ein Turm einen 12 m langen Schatten. Wie hoch ist der Turm?",
          correctAnswer: "9",
          placeholder: "Meter",
          explanation: "Mit dem Strahlensatz: (Turmhöhe / Turmschatten) = (Menschgröße / Menschenschatten). h / 12 = 1.8 / 2.4  =>  h = (1.8 / 2.4) * 12 = 9 Meter."
        };

      default:
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: 2x + 5 = 15. Bestimme x.",
          correctAnswer: "5",
          placeholder: "x =",
          explanation: "2x = 10, also x = 5."
        };
    }
  },

  // --- NEW: WAGER TASK ---
  createWagerTask(index: number, seed: number): Task {
    return {
      id: `u1-wager-${seed}`,
      type: 'wager',
      question: "Wette darauf: 'Jedes Quadrat ist automatisch auch ein Rechteck.'",
      options: ["Stimmt", "Stimmt nicht"],
      wagerOptions: [10, 20, 50],
      correctAnswer: 0, // Stimmt
      explanation: "Ein Quadrat hat 4 rechte Winkel und gegenüberliegende Seiten sind parallel. Damit erfüllt es ALLE Bedingungen eines Rechtecks (und ist sogar noch spezieller)."
    };
  },

  createVisualShapeTask(index: number, seed: number): Task {
    const id = `u1-vis-${index}-${seed}`;
    const types = [
      { 
        q: "Welche geometrische Form hat eine klassische Schallplatte?", 
        ans: 'circle', 
        expl: 'Eine Schallplatte ist ein perfekter Kreis.',
        data: [
            { id: 'rect', label: 'Rechteck', path: 'M 20,20 H 180 V 130 H 20 Z' }, // Distinct box
            { id: 'circle', label: 'Kreis', path: 'M 100,75 A 50,50 0 1,0 100,76 Z' }, // Centered Circle
            { id: 'tri', label: 'Dreieck', path: 'M 20,130 L 180,130 L 100,20 Z' } // Centered Triangle
        ]
      },
      { 
        q: "Die markierte Wandfläche für das Graffiti. Welche Form soll hier gefüllt werden?", 
        ans: 'rect', 
        expl: 'Die Fläche hat vier rechte Winkel. Es ist ein Rechteck.',
        data: [
            { id: 'tri', label: 'Rampe', path: 'M 20,130 L 180,130 L 180,20 Z' },
            { id: 'rect', label: 'Wand', path: 'M 40,40 H 160 V 110 H 40 Z' },
            { id: 'para', label: 'Parallelogramm', path: 'M 40,130 L 160,130 L 190,20 L 70,20 Z' }
        ]
      },
      { 
        q: "Die Seitenansicht einer Skater-Rampe (Bank). Welche Form erkennst du?", 
        ans: 'tri', 
        expl: 'Von der Seite betrachtet bildet die Rampe ein Dreieck.',
        data: [
            { id: 'circle', label: 'Rad', path: 'M 100,75 A 50,50 0 1,0 100,76 Z' },
            { id: 'rect', label: 'Box', path: 'M 40,40 H 160 V 110 H 40 Z' },
            { id: 'tri', label: 'Rampe', path: 'M 20,130 L 180,130 L 180,20 Z' }
        ]
      }
    ];
    const selected = types[index % types.length];

    return {
      id,
      type: 'visualChoice',
      question: selected.q,
      visualData: selected.data,
      correctAnswer: selected.ans,
      explanation: selected.expl
    };
  },

  createVisualAngleTask(index: number, seed: number): Task {
    const id = `u2-vis-${index}-${seed}`;
    return {
      id,
      type: 'visualChoice',
      question: "Eine Flasche wird geworfen. Welcher Abwurfwinkel wäre 'stumpf' (>90°)?",
      visualData: [
        { id: 'a', label: 'Spitz (<90°)', path: 'M 20,130 L 100,130 L 60,40', stroke: true }, 
        { id: 'b', label: 'Recht (90°)', path: 'M 100,130 L 180,130 L 180,50', stroke: true }, 
        { id: 'c', label: 'Stumpf (>90°)', path: 'M 20,130 L 100,130 L 20,50', stroke: true }  
      ],
      correctAnswer: 'c',
      explanation: 'Ein stumpfer Winkel ist weiter geöffnet als ein rechter Winkel (größer als 90 Grad).'
    };
  },

  createVisualSimilarityTask(index: number, seed: number): Task {
    const id = `u5-vis-${index}-${seed}`;
    if (index % 2 === 0) {
      return {
        id,
        type: 'visualChoice',
        question: "Welches Dreieck ist eine echte Vergrößerung (ähnlich) zum Referenz-Dreieck?",
        // Ref: Base 40, Height 40. Scaled: Base 80, Height 80. Wrong: Base 80, Height 40 (stretched)
        visualData: [
          { id: 'ref', label: 'Referenz', path: 'M 20,80 L 60,80 L 20,40 Z', stroke: true },
          { id: 'wrong', label: 'A', path: 'M 80,80 L 160,80 L 80,40 Z', stroke: true }, // Only stretched X
          { id: 'correct', label: 'B', path: 'M 80,140 L 160,140 L 80,60 Z', stroke: true } // Scaled X and Y
        ],
        correctAnswer: 'correct',
        explanation: 'Bei Ähnlichkeit müssen ALLE Seiten mit dem gleichen Faktor k gestreckt werden. Figur A wurde nur breiter gemacht, Figur B ist proportional vergrößert.'
      };
    } else {
      return {
        id,
        type: 'visualChoice',
        question: "Das Quadrat wurde mit Faktor k=0.5 verkleinert. Welches Bild stimmt?",
        visualData: [
          { id: 'ref', label: 'Start', path: 'M 20,20 H 100 V 100 H 20 Z', stroke: true },
          { id: 'correct', label: 'A', path: 'M 120,60 H 160 V 100 H 120 Z', stroke: true }, // Half size
          { id: 'wrong', label: 'B', path: 'M 120,20 H 140 V 100 H 120 Z', stroke: true }  // Thin rectangle
        ],
        correctAnswer: 'correct',
        explanation: 'k=0.5 bedeutet, jede Seite ist nur noch halb so lang. Aus einem Quadrat wird wieder ein Quadrat, nur kleiner.'
      };
    }
  },

  createScalingLogicTask(index: number, seed: number): Task {
    const id = `u5-logic-${index}-${seed}`;
    const tasks = [
      {
        q: "Du verdoppelst die Seitenlänge eines Quadrats (k=2). Was passiert mit der Fläche?",
        o: ["Sie verdoppelt sich (x2)", "Sie vervierfacht sich (x4)", "Sie bleibt gleich", "Sie wird 8-mal so groß"],
        a: 1,
        e: "Die Fläche wächst im Quadrat: k² = 2² = 4. Es passen also 4 kleine Quadrate in das große."
      },
      {
        q: "Ein Würfel wird verdreifacht (k=3). Wie verändert sich das Volumen?",
        o: ["x3", "x9", "x27", "x6"],
        a: 2,
        e: "Das Volumen wächst hoch drei: k³ = 3³ = 3 * 3 * 3 = 27."
      },
      {
        q: "Ein Modellauto hat den Maßstab 1:10. Das echte Auto ist 4 Meter lang. Wie lang ist das Modell?",
        o: ["4 cm", "40 cm", "10 cm", "1 Meter"],
        a: 1,
        e: "4 Meter = 400 cm. Geteilt durch 10 sind das 40 cm."
      },
      {
        q: "Zwei Figuren sind ähnlich, wenn...",
        o: ["sie die gleiche Farbe haben.", "sie gleich groß sind.", "ihre Winkel gleich sind und Seitenverhältnisse stimmen.", "sie beide Vierecke sind."],
        a: 2,
        e: "Ähnlichkeit bedeutet: Gleiche Form (Winkel), aber unterschiedliche Größe (skaliert)."
      }
    ];
    const t = tasks[index % tasks.length];
    return {
      id, type: 'choice',
      question: t.q, options: t.o, correctAnswer: t.a, explanation: t.e
    };
  },

  createShapeTask(index: number, seed: number): Task {
    const id = `u1-gen-${index}-${seed}`;
    const questions = [
      {
        q: "Ein Mitschüler behauptet: 'Jedes Quadrat ist automatisch auch ein Rechteck'. Hat er Recht?",
        o: ["Ja, das stimmt.", "Nein, falsch.", "Nur wenn es rot ist.", "Nur in der Geometrie nicht."],
        a: 0,
        e: "Er hat Recht. Ein Quadrat erfüllt alle Bedingungen eines Rechtecks (rechte Winkel), hat aber zusätzlich vier gleich lange Seiten."
      },
      // REPLACED PIZZA TASK
      {
        q: "Du baust ein Regal auf, aber es ist total schief und wackelig. Die Winkel sind nicht mehr 90°, aber die Seiten noch gleich lang und parallel. Was ist es jetzt?",
        o: ["Quadrat", "Rechteck", "Raute (Rhombus)", "Kreis"],
        a: 2,
        e: "Ein 'schiefes Quadrat' nennt man Raute. Alle Seiten sind gleich lang, aber die Winkel sind keine 90° mehr."
      },
      {
        q: "Welche geometrische Form hat ein typisches Smartphone-Display?",
        o: ["Raute", "Rechteck", "Trapez", "Drachenviereck"],
        a: 1,
        e: "Displays sind Rechtecke. Sie haben vier rechte Winkel."
      }
    ];
    const s = questions[index % questions.length];
    return {
      id, type: 'choice',
      question: s.q,
      options: s.o,
      correctAnswer: s.a,
      explanation: s.e
    };
  },

  createAngleTask(index: number, seed: number): Task {
    const id = `u2-gen-${index}-${seed}`;
    const type = index % 3;
    
    if (type === 0) {
      const alpha = getRandomInt(100, 140);
      return { 
        id, type: 'input', 
        question: `Du lehnst an einer Wand. Dein Rücken und die Wand bilden ${alpha}°. Ein anderer Winkel liegt auf der gleichen Geraden direkt daneben (Nebenwinkel). Wie groß ist dieser?`, 
        correctAnswer: (180 - alpha).toString(), 
        explanation: 'Nebenwinkel an einer Geraden ergänzen sich immer zu 180°.', 
        placeholder: 'Grad...' 
      };
    } else if (type === 1) {
      return {
        id, type: 'choice',
        question: "Ein Scheinwerfer ist im 45°-Winkel ausgerichtet. Sein gegenüberliegender Winkel (Scheitelwinkel) hat wie viel Grad?",
        options: ["45°", "90°", "135°", "180°"],
        correctAnswer: 0,
        explanation: "Scheitelwinkel liegen sich gegenüber und sind immer exakt gleich groß."
      };
    } else {
      const alpha = getRandomInt(20, 60);
      return { 
        id, type: 'input', 
        question: `Konstruktion einer Rampe: Es entsteht ein rechtwinkliges Dreieck. Unten beträgt der Winkel ${alpha}°. Wie groß ist der dritte Winkel oben?`, 
        correctAnswer: (90 - alpha).toString(), 
        explanation: 'In einem rechtwinkligen Dreieck müssen die beiden spitzen Winkel zusammen 90° ergeben.', 
        placeholder: 'Grad...' 
      };
    }
  },

  createAreaTask(index: number, seed: number): Task {
    const id = `u3-gen-${index}-${seed}`;
    const g = getRandomInt(4, 8);
    const h = getRandomInt(2, 4);
    
    // Simple variety based on index
    if (index % 3 === 0) {
      return { 
        id, type: 'input', 
        question: `Eine Wandfläche ist ${g}m breit und ${h}m hoch (Rechteck). Wie viel Quadratmeter (m²) müssen gestaltet werden?`, 
        correctAnswer: (g * h).toString(), 
        explanation: 'Fläche A = Breite * Höhe.', 
        placeholder: 'm²...' 
      };
    } else {
       return { 
        id, type: 'input', 
        question: `Ein Wimpel (Dreieck): Grundseite ${g*5} cm, Höhe ${h*5} cm. Fläche?`, 
        correctAnswer: ((g*5 * h*5) / 2).toString(), 
        explanation: 'Dreieck: (g * h) / 2.', 
        placeholder: 'cm²...' 
      };
    }
  },

  createVolumeTask(index: number, seed: number): Task {
     const id = `u4-gen-${index}-${seed}`;
     const a = getRandomInt(3,6);
     return { 
        id, type: 'input', 
        question: `Eine Box: ${a}dm x ${a}dm x ${a}dm. Volumen in Liter?`, 
        correctAnswer: (a * a * a).toString(), 
        explanation: 'Volumen = a * a * a.', 
        placeholder: 'Liter...' 
      };
  },

  createTransformTask(index: number, seed: number): Task {
     const id = `u5-gen-${index}-${seed}`;
     return { 
        id, type: 'input', 
        question: `Zoom 200% (k=2). Länge war 10cm. Neu?`, 
        correctAnswer: "20", 
        explanation: 'Länge * k.', 
        placeholder: 'cm...' 
      };
  },

  createContextTask(index: number, seed: number): Task {
    const id = `u6-gen-${index}-${seed}`;
    const scenarios = [
      // SCENARIO 1: 1972 TIME TRAVEL
      {
        type: 'choice' as const,
        q: "Zeitreise in den Matheunterricht 1972: An der Tafel steht 'y = x + 2', aber der Lehrer wirft plötzlich seinen Schlüsselbund durch die Klasse. Die Flugbahn ist eine Parabel. Was beschreibt der Scheitelpunkt?",
        o: ["Den Abwurfpunkt.", "Den höchsten Punkt der Flugbahn.", "Den Aufprallpunkt.", "Die Geschwindigkeit."],
        a: 1,
        e: "Egal ob 1972 oder heute: Der Scheitelpunkt einer Wurfparabel ist immer das Maximum (der höchste Punkt)."
      },
      // SCENARIO 2: Flugkurve Berechnung (Simplified)
      {
        type: 'input' as const,
        q: "Ein Ball fliegt in einer Kurve: Höhe y = -x² + 4x. Wie hoch ist der Ball bei einer Entfernung von x=2 Metern? (Rechne: -2² + 4*2)",
        a: "4", 
        e: "Einsetzen: -2² ergibt -4. 4 mal 2 ist 8. Addiert (-4 + 8) ergibt das 4 Meter Höhe.",
        p: "Meter..."
      },
      // SCENARIO 3: INSTAGRAM REEL / DRONE
      {
        type: 'input' as const,
        q: "Für ein Insta-Reel fliegt deine Drohne erst 30m geradeaus, dann exakt 40m im rechten Winkel nach oben für den 'Dramatic Zoom'. Wie weit ist sie Luftlinie vom Start entfernt?",
        a: "50",
        e: "Satz des Pythagoras (3-4-5 Dreieck): 30² + 40² = 900 + 1600 = 2500. Die Wurzel daraus ist 50.",
        p: "Meter..."
      },
      // SCENARIO 4: Kicks Reselling
      {
        type: 'choice' as const,
        q: "Du kaufst limitierte Sneaker für 200€. Der Sammlerwert steigt linear um 20€ pro Monat. Wie lautet die Funktionsgleichung?",
        o: ["y = 200x + 20", "y = 20x + 200", "y = x² + 200", "y = 200 - 20x"],
        a: 1,
        e: "Startwert 200 (y-Achsenabschnitt), Anstieg 20 (pro Monat x). Also y = 20x + 200."
      },
      // SCENARIO 5: Handy Display
      {
        type: 'choice' as const,
        q: "Ein Smartphone-Display hat ein 18:9 Format (Verhältnis Höhe zu Breite). Wenn es 7cm breit ist, wie hoch ist es dann?",
        o: ["14 cm", "18 cm", "9 cm", "21 cm"],
        a: 0,
        e: "Das Verhältnis 18 zu 9 lässt sich kürzen auf 2 zu 1. Die Höhe ist also doppelt so groß wie die Breite. 7 * 2 = 14."
      }
    ];

    const s = scenarios[index % scenarios.length];
    
    if (s.type === 'choice') {
      return {
        id, type: 'choice', question: s.q, options: s.o!, correctAnswer: s.a, explanation: s.e
      };
    } else {
      return {
        id, type: 'input', question: s.q, correctAnswer: s.a.toString(), explanation: s.e, placeholder: s.p
      };
    }
  }
};
