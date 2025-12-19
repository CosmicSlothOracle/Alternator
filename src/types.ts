
export type CategoryGroup = 'A' | 'B' | 'C';

export interface Task {
  id: string;
  question: string;
  type: 'choice' | 'input' | 'boolean' | 'shorttext' | 'visualChoice' | 'wager';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  placeholder?: string;
  visualData?: any; 
  wagerOptions?: number[]; // For wager tasks
}

export interface TermDefinition {
  term: string;
  definition: string;
  visual?: string; // SVG path or instruction
}

export interface LearningUnit {
  id: string;
  group: CategoryGroup;
  category: 'Basics' | 'Konstruktion' | 'Berechnung' | 'Transformation' | 'Koordinaten' | 'Modellierung';
  title: string;
  description: string;
  detailedInfo: string;
  examples: string[];
  tasks: Task[]; 
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  coinsReward: number; // Standard Reward für Abschluss (immer)
  bounty: number;      // Extra Reward für Perfect Run (100-500)
  definitionId?: string;
  keywords: string[];
}

export interface GeometryDefinition {
  id: string;
  groupId: CategoryGroup;
  title: string;
  description: string;
  formula: string;
  terms: TermDefinition[];
  visual: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'avatar' | 'effect' | 'feature' | 'voucher' | 'calculator';
  cost: number;
  value: string;
  icon?: string; // New: Display symbol separate from logic value
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  totalEarned: number;
  completedUnits: string[];
  masteredUnits: string[]; // NEU: Für Units, die mit Bounty (perfekt) abgeschlossen wurden
  unlockedItems: string[]; 
  activeEffects: string[]; 
  calculatorSkin: string; // The active calculator design
  xp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  avatar: string;
  type?: 'chat' | 'system';
}

export interface BattleRequest {
  id: string;
  challengerId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  unitId: string;
  unitTitle: string;
  wager: number;
  status: 'pending' | 'active' | 'completed';
  result?: {
    winnerId: string;
    challengerScore: number;
    opponentScore: number;
  };
}

export interface LogEntry {
  timestamp: number;
  action: string;
  details: string;
  userId: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}