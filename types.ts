
export type CategoryGroup = 'A' | 'B' | 'C';

export interface Task {
  id: string;
  question: string;
  type: 'choice' | 'input' | 'boolean' | 'shorttext' | 'visualChoice';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  placeholder?: string;
  visualData?: any; 
}

export interface LearningUnit {
  id: string;
  segment: number;
  group: CategoryGroup;
  category: 'Basics' | 'Konstruktion' | 'Berechnung' | 'Transformation' | 'Koordinaten' | 'Modellierung';
  title: string;
  description: string;
  detailedInfo: string;
  examples: string[];
  tasks: Task[]; 
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
  coinsReward: number;
  definitionId?: string;
  keywords: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'avatar' | 'effect' | 'feature';
  cost: number;
  value: string;
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
  unlockedItems: string[]; 
  activeEffects: string[]; 
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
