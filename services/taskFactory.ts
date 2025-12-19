
import { Task } from '../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const TaskFactory = {
  generateTasks(unitId: string, count: number = 5): Task[] {
    const pool: Task[] = [];
    const seed = Date.now();
    
    for (let i = 0; i < count; i++) {
      let task: Task;
      // We use a combination of index and seed to ensure variety even in the same session
      const varietyIndex = (i + seed) % 3; 

      switch (unitId) {
        case 'u1': 
          task = varietyIndex === 0 ? this.createVisualShapeTask(i, seed) : this.createShapeTask(i, seed); 
          break;
        case 'u2': 
          task = varietyIndex === 0 ? this.createVisualAngleTask(i, seed) : this.createAngleTask(i, seed); 
          break;
        case 'u3': 
          task = this.createAreaTask(i, seed); 
          break;
        case 'u4': 
          task = this.createVolumeTask(i, seed); 
          break;
        case 'u5': 
          task = this.createTransformTask(i, seed); 
          break;
        case 'u6': 
          task = this.createContextTask(i, seed); 
          break;
        default:
          task = this.createShapeTask(i, seed);
      }
      pool.push(task);
    }
    return pool;
  },

  createVisualShapeTask(index: number, seed: number): Task {
    const id = `u1-vis-${index}-${seed}`;
    const types = [
      { 
        q: "Klicke auf das Parallelogramm!", 
        ans: 'para', 
        expl: 'Ein Parallelogramm hat gegenüberliegende parallele Seiten.' 
      },
      { 
        q: "Wo ist das Trapez?", 
        ans: 'trap', 
        expl: 'Ein Trapez hat mindestens zwei parallele Seiten.' 
      },
      { 
        q: "Finde das Rechteck!", 
        ans: 'rect', 
        expl: 'Ein Rechteck hat vier rechte Winkel.' 
      }
    ];
    const selected = types[index % types.length];

    return {
      id,
      type: 'visualChoice',
      question: selected.q,
      visualData: [
        { id: 'rect', label: 'Rechteck', path: 'M 10,10 H 70 V 50 H 10 Z' },
        { id: 'para', label: 'Parallelogramm', path: 'M 100,10 L 160,10 L 150,50 L 90,50 Z' },
        { id: 'trap', label: 'Trapez', path: 'M 10,70 L 70,70 L 60,110 L 20,110 Z' }
      ],
      correctAnswer: selected.ans,
      explanation: selected.expl
    };
  },

  createVisualAngleTask(index: number, seed: number): Task {
    const id = `u2-vis-${index}-${seed}`;
    return {
      id,
      type: 'visualChoice',
      question: "Welches ist die Hypotenuse im rechtwinkligen Dreieck?",
      visualData: [
        { id: 'a', label: 'Kathete a', path: 'M 40,30 V 110', stroke: true },
        { id: 'b', label: 'Kathete b', path: 'M 40,110 H 160', stroke: true },
        { id: 'c', label: 'Hypotenuse c', path: 'M 40,30 L 160,110', stroke: true }
      ],
      correctAnswer: 'c',
      explanation: 'Die Hypotenuse liegt immer dem rechten Winkel gegenüber und ist die längste Seite.'
    };
  },

  createShapeTask(index: number, seed: number): Task {
    const id = `u1-gen-${index}-${seed}`;
    const questions = [
      {
        q: "Welche Eigenschaft teilt ein Quadrat mit einer Raute?",
        o: ["Vier rechte Winkel", "Vier gleich lange Seiten", "Zwei Symmetrieachsen", "Keine parallelen Seiten"],
        a: 1,
        e: "Sowohl Quadrat als auch Raute haben vier gleich lange Seiten."
      },
      {
        q: "Was ist ein Trapez mit zwei parallelen Seiten und zwei gleich langen Schenkeln?",
        o: ["Parallelogramm", "Gleichschenkliges Trapez", "Drachenviereck", "Raute"],
        a: 1,
        e: "Wenn die Schenkel eines Trapezes gleich lang sind, ist es gleichschenklig."
      },
      {
        q: "Welches Viereck ist punktsymmetrisch, aber nicht zwingend achsensymmetrisch?",
        o: ["Quadrat", "Rechteck", "Parallelogramm", "Trapez"],
        a: 2,
        e: "Ein allgemeines Parallelogramm ist punktsymmetrisch zum Schnittpunkt der Diagonalen."
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
    const type = index % 2;
    if (type === 0) {
      const alpha = getRandomInt(20, 160);
      return { 
        id, type: 'input', 
        question: `An einer Geradenkreuzung sind Alpha und Beta Nebenwinkel. Alpha misst ${alpha}°. Wie groß ist Beta?`, 
        correctAnswer: (180 - alpha).toString(), 
        explanation: 'Nebenwinkel ergänzen sich immer zu 180°.', 
        placeholder: 'Grad...' 
      };
    } else {
      const alpha = getRandomInt(20, 80);
      return { 
        id, type: 'input', 
        question: `In einem rechtwinkligen Dreieck ist ein Winkel Alpha = ${alpha}°. Berechne den zweiten spitzen Winkel Beta.`, 
        correctAnswer: (90 - alpha).toString(), 
        explanation: 'In einem rechtwinkligen Dreieck ergänzen sich die spitzen Winkel zu 90° (da 180° - 90° = 90°).', 
        placeholder: 'Grad...' 
      };
    }
  },

  createAreaTask(index: number, seed: number): Task {
    const id = `u3-gen-${index}-${seed}`;
    const variant = index % 2;
    if (variant === 0) {
      const g = getRandomInt(5, 12);
      const h = getRandomInt(4, 8);
      return { 
        id, type: 'input', 
        question: `Ein Parallelogramm hat eine Grundseite g = ${g} cm und eine Höhe h = ${h} cm. Berechne den Flächeninhalt A.`, 
        correctAnswer: (g * h).toString(), 
        explanation: 'A = g * h. Das ist wie bei einem Rechteck, das man "gerade rückt".', 
        placeholder: 'cm²...' 
      };
    } else {
      const a = getRandomInt(6, 10);
      const c = getRandomInt(2, 5);
      const h = getRandomInt(4, 6);
      const ans = ((a + c) / 2) * h;
      return { 
        id, type: 'input', 
        question: `Ein Trapez hat die parallelen Seiten a = ${a} cm und c = ${c} cm sowie die Höhe h = ${h} cm. Berechne A.`, 
        correctAnswer: ans.toString(), 
        explanation: 'A = ((a + c) / 2) * h. Man rechnet mit der Mittelparallele m = (a+c)/2.', 
        placeholder: 'cm²...' 
      };
    }
  },

  createVolumeTask(index: number, seed: number): Task {
    const id = `u4-gen-${index}-${seed}`;
    const variant = index % 2;
    if (variant === 0) {
      const G = getRandomInt(10, 25);
      const h = getRandomInt(5, 10);
      return { 
        id, type: 'input', 
        question: `Ein Prisma hat eine Grundfläche G = ${G} cm² und eine Höhe h = ${h} cm. Berechne das Volumen V.`, 
        correctAnswer: (G * h).toString(), 
        explanation: 'Für alle Prismen gilt: Volumen = Grundfläche * Höhe.', 
        placeholder: 'cm³...' 
      };
    } else {
      const r = pickRandom([2, 5, 10]);
      const h = 10;
      // Pi roughly 3.14 for simple calculations if needed, but here we stay with integers or multiples for clarity
      // Let's use a cylinder with given G
      const G = r * r * 3; // Simplified Pi = 3 for this specific task
      return { 
        id, type: 'input', 
        question: `Ein Zylinder hat eine Grundfläche G = ${G} cm² und eine Höhe h = ${h} cm. Wie groß ist sein Volumen V?`, 
        correctAnswer: (G * h).toString(), 
        explanation: 'V = G * h. Auch ein Zylinder ist ein (rundes) Prisma.', 
        placeholder: 'cm³...' 
      };
    }
  },

  createTransformTask(index: number, seed: number): Task {
    const id = `u5-gen-${index}-${seed}`;
    const variant = index % 3;
    const k = pickRandom([2, 3, 5]);
    
    if (variant === 0) {
      return { 
        id, type: 'input', 
        question: `Ein Bild wird mit dem Streckfaktor k = ${k} vergrößert. Eine Originallänge von 4 cm wird zu ...?`, 
        correctAnswer: (4 * k).toString(), 
        explanation: 'Längen ändern sich mit dem Faktor k.', 
        placeholder: 'cm...' 
      };
    } else if (variant === 1) {
      return { 
        id, type: 'input', 
        question: `Ein Quadrat mit A = 10 cm² wird mit k = ${k} gestreckt. Wie groß ist der neue Flächeninhalt?`, 
        correctAnswer: (10 * k * k).toString(), 
        explanation: `Flächen ändern sich mit dem Quadrat des Streckfaktors (k²). Hier: 10 * ${k * k}.`, 
        placeholder: 'cm²...' 
      };
    } else {
      return { 
        id, type: 'input', 
        question: `Ein Würfel mit V = 2 cm³ wird mit k = ${k} gestreckt. Welches Volumen hat der Bildwürfel?`, 
        correctAnswer: (2 * Math.pow(k, 3)).toString(), 
        explanation: `Volumina ändern sich mit der dritten Potenz des Streckfaktors (k³). Hier: 2 * ${Math.pow(k, 3)}.`, 
        placeholder: 'cm³...' 
      };
    }
  },

  createContextTask(index: number, seed: number): Task {
    const id = `u6-gen-${index}-${seed}`;
    const questions = [
      {
        q: "Ein Zimmer ist 4m breit und 5m lang. Wieviele 1m² Fliesen werden mindestens benötigt?",
        o: ["9", "20", "25", "40"],
        a: 1,
        e: "A = 4m * 5m = 20m²."
      },
      {
        q: "Ein Aquarium (Quader) ist 60cm lang, 30cm breit und 40cm hoch. Wieviele Liter passen hinein? (1 Liter = 1000cm³)",
        o: ["72 Liter", "130 Liter", "240 Liter", "720 Liter"],
        a: 0,
        e: "V = 60 * 30 * 40 = 72.000 cm³. Das sind 72 Liter."
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
  }
};
