
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
        this.createTransformTask(0, seed),
        this.createTransformTask(1, seed),
        this.createTransformTask(2, seed),
        this.createTransformTask(3, seed),
        this.createTransformTask(4, seed)
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
      case 'u1': // Haus der Vierecke
        return {
          id, type: 'choice',
          question: "BOUNTY FRAGE: Welche Aussage ist mathematisch präzise?",
          options: [
            "Jedes Rechteck ist ein Quadrat.",
            "Ein Drachenviereck hat immer 4 rechte Winkel.",
            "Jedes Quadrat ist eine Raute und ein Rechteck zugleich.",
            "Ein Trapez hat niemals rechte Winkel."
          ],
          correctAnswer: 2,
          explanation: "Das Quadrat ist die 'perfekte' Form: Es erfüllt die Definition der Raute (4 gleiche Seiten) UND des Rechtecks (4 rechte Winkel)."
        };
      
      case 'u2': // Winkel & Thales
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: In einem rechtwinkligen Dreieck ist Winkel Alpha = 35°. Wie groß ist Winkel Beta, wenn Gamma der rechte Winkel (90°) ist?",
          correctAnswer: "55",
          placeholder: "Grad",
          explanation: "Winkelsumme im Dreieck ist 180°. 180° - 90° - 35° = 55°."
        };

      case 'u3': // Flächen
        const a = getRandomInt(5, 9);
        return {
          id, type: 'input',
          question: `BOUNTY FRAGE: Ein Rechteck hat den Flächeninhalt A = ${a*8} cm². Die Seite a ist ${a} cm lang. Wie lang ist Seite b?`,
          correctAnswer: "8",
          placeholder: "cm",
          explanation: "Formel A = a * b. Umgestellt nach b: b = A / a."
        };

      case 'u4': // Volumen
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: Ein Würfel hat eine Kantenlänge von 4 cm. Berechne das Volumen.",
          correctAnswer: "64",
          placeholder: "cm³",
          explanation: "V = a * a * a = 4 * 4 * 4 = 64."
        };

      case 'u5': // Ähnlichkeit (Strahlensatz light)
        return {
          id, type: 'choice',
          question: "BOUNTY FRAGE: Ein Foto (10x15 cm) wird mit Faktor k = 3 vergrößert. Wie groß ist die neue Fläche im Vergleich zur alten?",
          options: ["3-mal so groß", "6-mal so groß", "9-mal so groß", "27-mal so groß"],
          correctAnswer: 2,
          explanation: "Bei der Fläche wirkt der Streckfaktor im Quadrat: k² = 3² = 9."
        };

      case 'u6': // Context / Pythagoras
        return {
          id, type: 'input',
          question: "BOUNTY FRAGE: Ein rechtwinkliges Dreieck hat die Katheten a=6cm und b=8cm. Berechne die Hypotenuse c.",
          correctAnswer: "10",
          placeholder: "cm",
          explanation: "Satz des Pythagoras: a² + b² = c². 36 + 64 = 100. Wurzel aus 100 ist 10."
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
