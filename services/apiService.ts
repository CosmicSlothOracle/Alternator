
import { User, ChatMessage, LogEntry, BattleRequest } from '../types';

const DELAY = 100;

const db = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val)),
};

// Chat Initialisierung
if (!db.get('mm_chat')) {
  db.set('mm_chat', [
    { id: '1', userId: 'bot1', username: 'Lukas_9b', text: 'Hey, wer traut sich ein Battle in "Ähnlichkeit" zu? 📐', timestamp: Date.now() - 3600000, avatar: '🦉', type: 'chat' }
  ]);
}

export const AuthService = {
  async login(username: string): Promise<User> {
    await new Promise(r => setTimeout(r, DELAY));
    let users = db.get('mm_users') || [];
    let user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        avatar: '👤',
        coins: 250,
        totalEarned: 250,
        completedUnits: [],
        masteredUnits: [], // Initialisierung
        unlockedItems: ['av_1'],
        activeEffects: [],
        xp: 0
      };
      users.push(user);
      db.set('mm_users', users);
    }
    // Migration für bestehende User ohne masteredUnits
    if (!user.masteredUnits) {
        user.masteredUnits = [];
    }
    
    db.set('mm_current_user', user);
    return user;
  },

  getCurrentUser(): User | null {
    return db.get('mm_current_user');
  }
};

export const DataService = {
  async updateUser(user: User): Promise<void> {
    let users = db.get('mm_users') || [];
    const idx = users.findIndex((u: User) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      db.set('mm_users', users);
      db.set('mm_current_user', user);
    }
  }
};

export const SocialService = {
  async getLeaderboard(): Promise<User[]> {
    let users = db.get('mm_users') || [];
    const bots: User[] = [
      { id: 'bot1', username: 'Lukas_9b', xp: 450, avatar: '🦉', coins: 1000, totalEarned: 2000, completedUnits: [], masteredUnits: [], unlockedItems: [], activeEffects: [] },
      { id: 'bot2', username: 'Sarah.Math', xp: 820, avatar: '🥷', coins: 1500, totalEarned: 3000, completedUnits: [], masteredUnits: [], unlockedItems: [], activeEffects: [] },
      { id: 'bot3', username: 'MathePro_X', xp: 1250, avatar: '💎', coins: 5000, totalEarned: 10000, completedUnits: [], masteredUnits: [], unlockedItems: [], activeEffects: [] }
    ];
    const all = [...users, ...bots];
    return all.sort((a, b) => b.xp - a.xp);
  },

  async getChatMessages(): Promise<ChatMessage[]> {
    return db.get('mm_chat') || [];
  },

  async sendMessage(user: User, text: string, type: 'chat' | 'system' = 'chat'): Promise<void> {
    let chat = await this.getChatMessages();
    chat.push({ 
      id: Date.now().toString(), 
      userId: user.id, 
      username: user.username, 
      avatar: user.avatar, 
      text, 
      timestamp: Date.now(),
      type 
    });
    db.set('mm_chat', chat.slice(-50));
  },

  async broadcastEvent(username: string, event: string) {
    // Diese Funktion dient als "Event-Tracker" für das Backend
    console.log(`[EVENT]: ${username} ${event}`);
    await this.sendMessage({ id: 'system', username: 'SYSTEM', avatar: '📢' } as User, `${username} ${event}`, 'system');
  }
};
