
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LEARNING_UNITS, SHOP_ITEMS, PROGRESS_LEVELS, GEOMETRY_DEFINITIONS } from './constants';
import { LearningUnit, User, Task, ShopItem, ChatMessage, CategoryGroup, BattleRequest } from './types';
import { AuthService, DataService, SocialService } from './services/apiService';
import { getMatheHint } from './services/geminiService';
import { TaskFactory } from './services/taskFactory';

// --- Theme Helpers ---
const GROUP_THEME: Record<CategoryGroup, { color: string; bg: string; text: string; border: string; darkBg: string }> = {
  'A': { color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', darkBg: 'bg-indigo-600' },
  'B': { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', darkBg: 'bg-emerald-600' },
  'C': { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', darkBg: 'bg-amber-600' }
};

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'A': 'Raum & Form',
  'B': 'Messen & Berechnen',
  'C': 'Funktionen & Kontext'
};

const RARITY_COLORS = {
  common: 'border-slate-200 text-slate-400',
  rare: 'border-blue-400 text-blue-500 bg-blue-50/10',
  epic: 'border-purple-500 text-purple-600 bg-purple-50/10',
  legendary: 'border-amber-500 text-amber-600 bg-amber-50/20'
};

// --- Visual Components ---
const GeometryVisual: React.FC<{ type: string; highlight?: string }> = ({ type, highlight }) => {
  if (type === 'pythagoras') return (
    <svg viewBox="0 0 200 150" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <path d="M 40,110 L 160,110 L 40,30 Z" fill="none" stroke="#6366f1" strokeWidth="4" />
      <rect x="40" y="100" width="10" height="10" fill="none" stroke="#6366f1" strokeWidth="2" />
    </svg>
  );
  if (type === 'shapes') return (
    <svg viewBox="0 0 200 120" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <path d="M 40,30 L 140,30 L 160,90 L 60,90 Z" fill="none" stroke="#10b981" strokeWidth="3" />
    </svg>
  );
  if (type === 'angles') return (
    <svg viewBox="0 0 200 100" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <line x1="20" y1="80" x2="180" y2="80" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="100" y1="80" x2="160" y2="20" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
  return null;
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'learn' | 'community' | 'shop'>('learn');
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [activeBattle, setActiveBattle] = useState<BattleRequest | null>(null);
  const [questConfig, setQuestConfig] = useState({ timed: false, noCheatSheet: false });
  const [isCoinPulsing, setIsCoinPulsing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  if (!user) return <AuthScreen onLogin={setUser} />;

  const handleUpdateCoins = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, coins: prev.coins + amount } : null);
    setIsCoinPulsing(true);
    setTimeout(() => setIsCoinPulsing(false), 500);
  };

  const handleQuestComplete = async (earnedTotal: number, perfectScore: boolean) => {
    if (!selectedUnit || !user) return;
    if (perfectScore && earnedTotal > 0) {
      handleUpdateCoins(earnedTotal);
    }
    const updated = { 
      ...user, 
      xp: user.xp + (perfectScore ? 200 : 50), 
      completedUnits: [...new Set([...user.completedUnits, selectedUnit.id])] 
    };
    setUser(updated);
    await DataService.updateUser(updated);
    await SocialService.broadcastEvent(user.username, `hat die Quest "${selectedUnit.title}" abgeschlossen! 🌟`);
    setIsTaskMode(false);
    setSelectedUnit(null);
  };

  const startBattle = (opponent: User) => {
    if (user.coins < 100) {
      alert("Du brauchst mindestens 100 Coins für ein Battle!");
      return;
    }
    const unit = LEARNING_UNITS[Math.floor(Math.random() * LEARNING_UNITS.length)];
    const battle: BattleRequest = {
      id: Math.random().toString(36).substr(2, 9),
      challengerId: user.id,
      opponentId: opponent.id,
      opponentName: opponent.username,
      opponentAvatar: opponent.avatar,
      unitId: unit.id,
      unitTitle: unit.title,
      wager: 100,
      status: 'active'
    };
    setActiveBattle(battle);
    setIsBattleMode(true);
  };

  const handleBattleComplete = async (score: number, perfect: boolean) => {
    if (!activeBattle || !user) return;
    
    // Bot-Geisterperformance simulieren
    const botSkill = activeBattle.opponentId === 'bot3' ? 5 : activeBattle.opponentId === 'bot2' ? 4 : 3;
    const opponentScore = Math.floor(Math.random() * (botSkill + 1));
    const win = score > opponentScore || (score === opponentScore && perfect);
    
    if (win) {
      handleUpdateCoins(activeBattle.wager);
      const updated = { ...user, xp: user.xp + 300 };
      setUser(updated);
      await DataService.updateUser(updated);
      await SocialService.broadcastEvent(user.username, `hat ${activeBattle.opponentName} im Math-Battle besiegt! 🏆`);
    } else {
      handleUpdateCoins(-activeBattle.wager);
      await SocialService.broadcastEvent(user.username, `wurde von ${activeBattle.opponentName} im Battle geschlagen. 💀`);
    }
    
    setIsBattleMode(false);
    setActiveBattle(null);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!user || user.coins < item.cost) return;
    const isOwned = user.unlockedItems.includes(item.id);
    if (isOwned && item.type !== 'feature') return;

    let updatedUser = { ...user, coins: user.coins - item.cost };
    if (item.type !== 'feature') {
      updatedUser.unlockedItems = [...new Set([...user.unlockedItems, item.id])];
    } else if (item.value === 'rename') {
      setTempName('');
      setIsRenameModalOpen(true);
    }
    setUser(updatedUser);
    await DataService.updateUser(updatedUser);
    await SocialService.broadcastEvent(user.username, `hat sich "${item.name}" im Shop gegönnt! 🛒`);
  };

  const handleRename = async () => {
    if (!user || !tempName.trim()) return;
    const oldName = user.username;
    const updated = { ...user, username: tempName.trim() };
    setUser(updated);
    await DataService.updateUser(updated);
    setIsRenameModalOpen(false);
    await SocialService.broadcastEvent(oldName, `heißt jetzt "${tempName.trim()}". 🏷️`);
  };

  const isDarkMode = user.activeEffects.includes('dark');
  const hasRainbow = user.activeEffects.includes('rainbow');

  return (
    <div className={`min-h-screen transition-all ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#fcfdfe] text-slate-900'}`}>
      
      {!isTaskMode && !isBattleMode && (
        <>
          <nav className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-2xl border p-3 rounded-[2.5rem] shadow-2xl flex items-center gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/60 border-white/40'}`}>
            {(['learn', 'community', 'shop'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white scale-105' : 'text-slate-500 hover:text-slate-900'}`}>{tab === 'learn' ? '📖 Quests' : tab === 'community' ? '🤝 Klasse' : '🛒 Shop'}</button>
            ))}
          </nav>

          <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-12 py-5 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
            <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setIsInventoryOpen(true)}>
              <div className={`relative text-4xl p-3 rounded-2xl border transition-all duration-500 group-hover:scale-110 ${hasRainbow ? 'animate-pulse bg-gradient-to-tr from-pink-500 via-yellow-500 to-cyan-500 border-none' : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                {user.avatar}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight italic uppercase group-hover:text-indigo-500 transition-colors">{user.username}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   {PROGRESS_LEVELS[Math.min(Math.floor(user.xp / 100), PROGRESS_LEVELS.length - 1)].title}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
               <div className={`px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-sm transition-all duration-300 shadow-lg ${isCoinPulsing ? 'scale-125 bg-amber-600' : ''}`}>🪙 {user.coins}</div>
               <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-tighter shadow-sm">{user.xp} XP</div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-12 py-16 pb-40 relative z-10">
            {activeTab === 'learn' && (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                  <div>
                    <h2 className="text-6xl font-black tracking-tighter italic uppercase mb-4">Geometry Map</h2>
                    <div className="flex gap-6 mt-4">
                      {(['A', 'B', 'C'] as CategoryGroup[]).map(g => (
                        <div key={g} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${GROUP_THEME[g].color}-500`} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{GROUP_LABELS[g]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-96 relative group">
                    <input type="text" placeholder="Themen durchsuchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full px-8 py-5 rounded-3xl border-2 font-black text-sm outline-none transition-all shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 focus:border-indigo-200'}`} />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">🔍</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {LEARNING_UNITS.filter(u => u.title.toLowerCase().includes(searchTerm.toLowerCase())).map(unit => {
                    const theme = GROUP_THEME[unit.group];
                    const isDone = user.completedUnits.includes(unit.id);
                    return (
                      <div key={unit.id} onClick={() => setSelectedUnit(unit)} className={`group relative p-10 rounded-[4rem] border-b-8 border-${theme.color}-500 shadow-xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${theme.bg} ${theme.text}`}>Segment {unit.segment}</span>
                            {isDone && <span className="text-green-500 font-black text-xs animate-bounce">✔</span>}
                          </div>
                          <h3 className="text-3xl font-black uppercase italic leading-tight mb-2">{unit.title}</h3>
                          <p className="text-slate-400 font-medium italic text-xs leading-relaxed">{unit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {activeTab === 'community' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]"><ChatView currentUser={user} /><LeaderboardView currentUser={user} onChallenge={startBattle} /></div>}
            {activeTab === 'shop' && <ShopView user={user} onBuy={handleBuy} isDarkMode={isDarkMode} />}
          </main>
        </>
      )}

      {selectedUnit && !isTaskMode && <UnitModal unit={selectedUnit} config={questConfig} onConfigChange={setQuestConfig} onClose={() => setSelectedUnit(null)} onStart={() => setIsTaskMode(true)} />}
      
      {isTaskMode && selectedUnit && <QuestExecutionView unit={selectedUnit} config={questConfig} onComplete={handleQuestComplete} onCancel={() => setIsTaskMode(false)} />}
      
      {isBattleMode && activeBattle && <BattleView battle={activeBattle} onComplete={handleBattleComplete} onCancel={() => { setIsBattleMode(false); setActiveBattle(null); }} />}

      {isInventoryOpen && <InventoryModal user={user} onClose={() => setIsInventoryOpen(false)} onToggleEffect={async (val) => {
        const isActive = user.activeEffects.includes(val);
        const updated = { ...user, activeEffects: isActive ? user.activeEffects.filter(e => e !== val) : [...user.activeEffects, val] };
        setUser(updated);
        await DataService.updateUser(updated);
      }} onAvatarChange={async (val) => {
        const updated = { ...user, avatar: val };
        setUser(updated);
        await DataService.updateUser(updated);
      }} />}

      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-slate-950 text-center">
            <h3 className="text-xl font-black uppercase italic mb-6">Neuer Name</h3>
            <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-6 bg-slate-100 rounded-2xl mb-6 font-black text-center outline-none border-2 border-transparent focus:border-indigo-500" placeholder="Cooler Name..." />
            <div className="flex gap-4"><button onClick={() => setIsRenameModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-xl font-black uppercase text-xs">Abbruch</button><button onClick={handleRename} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs shadow-lg">Ändern</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Battle View ---
const BattleView = ({ battle, onComplete, onCancel }: any) => {
  const [tasks] = useState(() => TaskFactory.generateTasks(battle.unitId, 5));
  const [curr, setCurr] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20); // PvP ist schneller!
  const [showVS, setShowVS] = useState(true);
  const task = tasks[curr];

  useEffect(() => {
    if (showVS) {
      const timer = setTimeout(() => setShowVS(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showVS]);

  useEffect(() => {
    if (!showVS && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!showVS && timeLeft === 0 && !showResult) {
      check();
    }
  }, [timeLeft, showResult, showVS]);

  const check = (val?: string) => {
    const isCorrect = (val || inputValue).trim().toLowerCase() === task.correctAnswer.toString().toLowerCase();
    if (isCorrect) setScore(score + 1);
    setShowResult(true);
  };

  const next = () => {
    if (curr < tasks.length - 1) {
      setCurr(curr + 1); setInputValue(''); setShowResult(false); setTimeLeft(20);
    } else {
      onComplete(score, score === tasks.length);
    }
  };

  if (showVS) return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-12 overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-slate-950 to-rose-900/20 animate-pulse" />
       <div className="relative z-10 flex flex-col items-center gap-12 animate-in zoom-in duration-700">
         <div className="flex items-center gap-20">
           <div className="flex flex-col items-center gap-4 animate-in slide-in-from-left duration-1000">
             <div className="text-9xl bg-white/5 p-10 rounded-[4rem] border border-white/10 shadow-2xl">👤</div>
             <div className="font-black text-2xl uppercase tracking-tighter italic text-white">DU</div>
           </div>
           <div className="text-8xl font-black italic text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">VS</div>
           <div className="flex flex-col items-center gap-4 animate-in slide-in-from-right duration-1000">
             <div className="text-9xl bg-white/5 p-10 rounded-[4rem] border border-white/10 shadow-2xl">{battle.opponentAvatar}</div>
             <div className="font-black text-2xl uppercase tracking-tighter italic text-white">{battle.opponentName}</div>
           </div>
         </div>
         <div className="text-indigo-400 font-black text-xl uppercase tracking-[0.5em] animate-bounce">Battle Startet...</div>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col">
      <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="text-slate-500 font-black text-[10px] uppercase hover:text-white transition-colors">Abbrechen</button>
          <div className="h-6 w-px bg-white/10" />
          <div className="font-black text-xs uppercase text-indigo-400">{battle.unitTitle}</div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-black uppercase text-slate-500">Dein Score</span>
             <span className="font-black text-2xl text-green-400">{score} / 5</span>
          </div>
          <div className={`px-6 py-3 rounded-2xl font-black text-xl border-2 ${timeLeft < 5 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-white/10 text-white'}`}>⏱️ {timeLeft}s</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="max-w-3xl w-full text-center">
          <h2 className="text-5xl font-black uppercase italic mb-16 leading-tight tracking-tight">{task.question}</h2>
          
          {task.type === 'visualChoice' ? (
            <div className="bg-slate-900 p-12 rounded-[4rem] border-2 border-white/5 shadow-inner">
               <svg viewBox="0 0 200 150" className="w-full h-auto max-w-[400px] mx-auto overflow-visible">
                  {task.visualData.map((v: any) => (
                    <path key={v.id} d={v.path} fill="transparent" stroke={showResult && v.id === task.correctAnswer ? '#22c55e' : '#6366f1'} strokeWidth="4" className={`cursor-pointer transition-all ${!showResult ? 'hover:fill-indigo-500/20' : ''}`} onClick={() => !showResult && check(v.id)} />
                  ))}
               </svg>
            </div>
          ) : (
            <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={showResult} className="w-full p-10 rounded-[2.5rem] bg-white/5 border-4 border-white/10 text-5xl font-black text-center outline-none mb-12 focus:border-indigo-500 transition-all placeholder:text-white/5" onKeyDown={e => e.key === 'Enter' && !showResult && check()} placeholder="?" />
          )}

          {showResult && (
            <div className="bg-indigo-600 p-10 rounded-[3rem] animate-in slide-in-from-bottom flex flex-col items-center gap-6 shadow-2xl">
              <p className="font-black text-2xl italic uppercase">{inputValue.trim().toLowerCase() === task.correctAnswer.toString().toLowerCase() || (task.type === 'visualChoice' && score > 0) ? 'Richtig!' : 'Falsch!'}</p>
              <button onClick={next} className="bg-white text-slate-950 px-20 py-6 rounded-2xl font-black text-xl uppercase shadow-xl hover:scale-105 transition-all">Nächste Aufgabe</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LeaderboardView = ({ currentUser, onChallenge }: any) => {
  const [list, setList] = useState<User[]>([]);
  useEffect(() => { SocialService.getLeaderboard().then(setList); }, []);
  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 p-10 shadow-2xl flex flex-col h-full overflow-hidden text-slate-900">
      <h3 className="font-black uppercase tracking-widest text-sm mb-10 border-b pb-4">🏆 Klassenspiegel</h3>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {list.map((u, i) => (
          <div key={u.id} className={`flex items-center justify-between p-5 rounded-[2.5rem] transition-all hover:scale-[1.02] ${u.id === currentUser.id ? 'bg-indigo-50 border-2 border-indigo-100 shadow-sm' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-4">
              <span className={`font-black text-lg w-8 ${i < 3 ? 'text-indigo-600' : 'text-slate-300'}`}>#{i+1}</span>
              <span className="text-3xl bg-white p-2 rounded-2xl shadow-sm">{u.avatar}</span>
              <div>
                <div className="font-black text-xs uppercase tracking-tighter">{u.username}</div>
                <div className="text-[9px] font-bold text-indigo-500">{u.xp} XP</div>
              </div>
            </div>
            {u.id !== currentUser.id && (
              <button onClick={() => onChallenge(u)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase hover:bg-slate-900 shadow-lg transition-all active:scale-90">Challenge</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatView = ({ currentUser }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    SocialService.getChatMessages().then(setMessages); 
    const it = setInterval(() => SocialService.getChatMessages().then(setMessages), 2500); 
    return () => clearInterval(it); 
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const send = async () => { if(!input.trim()) return; await SocialService.sendMessage(currentUser, input); setInput(''); };
  
  return (
    <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-100 flex flex-col shadow-2xl overflow-hidden h-full text-slate-900">
      <div className="p-8 bg-slate-900 text-white flex justify-between items-center"><h3 className="font-black uppercase tracking-widest text-sm italic">Live Community Feed</h3></div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 bg-slate-50/20 scroll-smooth">
        {messages.map(m => (
          <div key={m.id} className={`flex items-start gap-3 animate-in slide-in-from-bottom duration-300 ${m.type === 'system' ? 'justify-center w-full my-4' : m.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
            {m.type === 'system' ? (
              <div className="bg-indigo-50 text-indigo-600 px-8 py-3 rounded-full text-[10px] font-black uppercase border border-indigo-100 italic shadow-sm">📢 {m.text}</div>
            ) : (
              <>
                <div className="text-3xl bg-white p-2 rounded-2xl shadow-sm border border-slate-100">{m.avatar}</div>
                <div className={`p-5 rounded-[2rem] text-sm shadow-sm max-w-[70%] ${m.userId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                  <div className="font-black text-[9px] opacity-60 mb-1">{m.username}</div>
                  <p className="font-medium leading-relaxed">{m.text}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="p-6 flex gap-4 border-t bg-white">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Nachricht an die Klasse..." className="flex-1 bg-slate-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all" />
        <button onClick={send} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-500 transition-all active:scale-95">Senden</button>
      </div>
    </div>
  );
};

const UnitModal = ({ unit, config, onConfigChange, onClose, onStart }: any) => {
  const potentialReward = 50 * (config.timed && config.noCheatSheet ? 5 : config.timed ? 3 : config.noCheatSheet ? 2 : 1);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in text-slate-950 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="flex justify-between items-center mb-10 relative z-10">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">{unit.title}</h2>
           <button onClick={onClose} className="p-4 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-all">✕</button>
        </div>
        <p className="text-slate-600 text-xl font-medium mb-12 italic leading-relaxed relative z-10">{unit.detailedInfo}</p>
        
        <div className="bg-slate-50 p-10 rounded-[3rem] mb-12 relative z-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">Multiplikatoren wählen</h3>
          <div className="grid grid-cols-2 gap-6">
            <button onClick={() => onConfigChange({...config, timed: !config.timed})} className={`flex flex-col items-center gap-3 p-8 rounded-[2.5rem] border-4 transition-all shadow-sm ${config.timed ? 'border-indigo-600 bg-white scale-105 shadow-xl' : 'border-white bg-slate-100/50 opacity-60'}`}>
              <span className="text-4xl">⏱️</span>
              <span className="font-black uppercase text-[10px]">Auf Zeit (3x)</span>
            </button>
            <button onClick={() => onConfigChange({...config, noCheatSheet: !config.noCheatSheet})} className={`flex flex-col items-center gap-3 p-8 rounded-[2.5rem] border-4 transition-all shadow-sm ${config.noCheatSheet ? 'border-rose-600 bg-white scale-105 shadow-xl' : 'border-white bg-slate-100/50 opacity-60'}`}>
              <span className="text-4xl">🚫</span>
              <span className="font-black uppercase text-[10px]">Kein Spickzettel (2x)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-10 animate-pulse relative z-10">
           <div className="text-amber-500 font-black text-5xl flex items-center gap-3">🪙 {potentialReward}</div>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maximaler Reward</span>
        </div>
        
        <button onClick={onStart} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl uppercase italic shadow-2xl hover:bg-slate-900 transition-all transform hover:-translate-y-1 relative z-10">Start 🚀</button>
      </div>
    </div>
  );
};

const QuestExecutionView = ({ unit, config, onComplete, onCancel }: any) => {
  const [tasks] = useState(() => TaskFactory.generateTasks(unit.id, 5));
  const [curr, setCurr] = useState(0);
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [perfect, setPerfect] = useState(true);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const task = tasks[curr];

  useEffect(() => { 
    if(config.timed && timeLeft > 0 && !showResult) { 
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); 
      return () => clearTimeout(t); 
    } else if(config.timed && timeLeft === 0 && !showResult) {
      check();
    }
  }, [timeLeft, showResult, config.timed]);

  const check = (v?: string) => {
    const isCorrect = (v || inputValue).trim().toLowerCase() === task.correctAnswer.toString().toLowerCase();
    if(isCorrect) { 
      let mult = (config.timed && config.noCheatSheet ? 5 : config.timed ? 3 : config.noCheatSheet ? 2 : 1);
      setScore(prev => prev + (10 * mult)); 
    } else { 
      setPerfect(false); 
      setScore(0); 
    }
    setShowResult(true);
  };

  const next = () => { 
    if(curr < tasks.length -1) { 
      setCurr(curr+1); setInputValue(''); setShowResult(false); setTimeLeft(60); setHint(null);
    } else { 
      onComplete(score, perfect); 
    } 
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white text-slate-900 flex overflow-hidden">
      <div className={`flex-1 flex flex-col transition-all duration-700 bg-white ${isCheatSheetOpen ? 'max-w-[65%]' : 'max-w-full'}`}>
        <div className="flex justify-between items-center px-12 py-8 border-b border-slate-100 bg-white/50 backdrop-blur-md">
          <button onClick={onCancel} className="text-slate-400 font-black text-[11px] uppercase hover:text-rose-500 transition-colors tracking-tighter">← Quest Verlassen</button>
          <div className="flex items-center gap-10">
            <div className={`font-black text-sm flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${score > 0 ? 'text-amber-500 bg-amber-50 scale-110 shadow-sm' : 'text-slate-200'}`}>
              Pot: 🪙 {score}
            </div>
            {!config.noCheatSheet && (
              <button onClick={() => setIsCheatSheetOpen(!isCheatSheetOpen)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${isCheatSheetOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}>
                📖 Spickzettel
              </button>
            )}
            {config.timed && <div className={`px-6 py-3 rounded-2xl font-black text-sm ${timeLeft > 10 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>⏱️ {timeLeft}s</div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-16 flex flex-col justify-center items-center relative">
          <div className="max-w-3xl w-full text-center">
            <div className="mb-6"><span className="px-6 py-2 bg-slate-100 rounded-full font-black text-[9px] uppercase tracking-widest text-slate-400">Aufgabe {curr + 1} / 5</span></div>
            <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tight leading-tight mb-16">{task.question}</h2>
            
            {task.type === 'visualChoice' ? (
              <div className="bg-slate-50 p-12 rounded-[4rem] border-4 border-slate-100 shadow-inner relative group mb-12">
                <svg viewBox="0 0 200 150" className="w-full h-auto max-w-[450px] mx-auto overflow-visible">
                  {task.visualData.map((obj: any) => (
                    <path key={obj.id} d={obj.path} fill={showResult && obj.id === task.correctAnswer ? '#22c55e33' : 'transparent'} stroke={showResult && obj.id === task.correctAnswer ? '#22c55e' : '#6366f1'} strokeWidth="4" className={`cursor-pointer transition-all ${!showResult ? 'hover:fill-indigo-500/20' : ''}`} onClick={() => !showResult && check(obj.id)} />
                  ))}
                </svg>
              </div>
            ) : (
              <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={showResult} className="w-full p-12 rounded-[3rem] border-4 border-slate-100 bg-white text-slate-900 shadow-2xl text-5xl font-black text-center outline-none mb-12 focus:border-indigo-500 transition-all placeholder:text-slate-100" onKeyDown={e => e.key === 'Enter' && !showResult && check()} placeholder="Lösung..." />
            )}

            {showResult && (
               <div className="p-12 bg-slate-900 text-white rounded-[3.5rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl animate-in slide-in-from-bottom border-t-8 border-indigo-500">
                <div className="flex-1 text-center md:text-left">
                  <p className="font-black text-3xl mb-3 italic uppercase">{perfect ? 'Richtig! ⚡' : 'Fehler! 💀'}</p>
                  <p className="text-slate-400 text-base italic leading-relaxed">{perfect ? 'Das war ein Volltreffer. Weiter so!' : `Quest-Pot wurde auf 0 zurückgesetzt. Die Lösung war: ${task.correctAnswer}`}</p>
                </div>
                <button onClick={next} className="w-full md:w-auto bg-indigo-600 px-20 py-8 rounded-[2rem] font-black text-lg uppercase shadow-2xl hover:bg-indigo-500 transition-all border-b-4 border-indigo-800">Weiter →</button>
              </div>
            )}
            
            {!showResult && !hint && (
              <button onClick={async () => setHint(await getMatheHint(unit.title, task.question))} className="mt-12 text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] hover:text-indigo-500 transition-all opacity-50 hover:opacity-100">💡 Mentor um Hilfe bitten</button>
            )}
            {hint && <div className="mt-12 p-10 bg-indigo-50 text-indigo-900 rounded-[3rem] font-bold italic text-lg leading-relaxed border-2 border-indigo-100 animate-in fade-in shadow-xl">✨ {hint}</div>}
          </div>
        </div>
      </div>
      
      {isCheatSheetOpen && (
        <div className="w-[35%] bg-slate-50 text-slate-900 border-l-2 border-slate-100 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
          <div className="p-10 border-b-2 border-slate-100 bg-white font-black text-indigo-600 uppercase italic flex justify-between items-center shadow-sm">
            <span className="tracking-tighter text-xl italic uppercase">Spickzettel</span>
            <button onClick={() => setIsCheatSheetOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-12 space-y-12">
            <div className="p-10 bg-white rounded-[3.5rem] border-2 border-indigo-50 shadow-sm transition-all hover:shadow-xl">
               <h3 className="font-black text-slate-900 uppercase text-2xl mb-6 leading-tight">{unit.title}</h3>
               <p className="text-base text-slate-500 italic mb-10 leading-relaxed">{unit.detailedInfo}</p>
               <GeometryVisual type={unit.definitionId || 'shapes'} />
            </div>
            {GEOMETRY_DEFINITIONS.find(d => d.id === unit.definitionId)?.terms.map((term, i) => (
              <div key={i} className="flex gap-6 items-start animate-in fade-in slide-in-from-bottom" style={{animationDelay: `${i*100}ms`}}>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black flex-shrink-0 shadow-lg">{i+1}</div>
                <p className="text-base font-bold text-slate-700 italic leading-relaxed pt-1">{term}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ShopView = ({ user, onBuy, isDarkMode }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
    {SHOP_ITEMS.map(item => {
      const isOwned = user.unlockedItems.includes(item.id);
      const canAfford = user.coins >= item.cost;
      const rarityStyle = RARITY_COLORS[item.rarity || 'common'];
      return (
        <div key={item.id} className={`group relative p-10 rounded-[4rem] border-2 shadow-2xl transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${rarityStyle.split(' ')[0]}`}>
          <div className="absolute top-8 right-8"><span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${rarityStyle}`}>{item.rarity}</span></div>
          <div className="text-8xl mt-12 mb-10 transform transition-all group-hover:scale-125 group-hover:rotate-6 drop-shadow-2xl">{item.value === 'rain' ? '🌦️' : item.value === 'rainbow' ? '🌈' : item.value === 'rename' ? '🏷️' : item.value === 'dark' ? '🌑' : item.value}</div>
          <h4 className="font-black uppercase text-base mb-3 leading-tight">{item.name}</h4>
          <p className="text-[11px] text-slate-400 font-medium mb-12 italic leading-relaxed">{item.description}</p>
          <button disabled={(isOwned && item.type !== 'feature') || (!isOwned && !canAfford)} onClick={() => onBuy(item)} className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${isOwned && item.type !== 'feature' ? 'bg-green-100 text-green-700 shadow-sm cursor-default' : canAfford ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
            {isOwned && item.type !== 'feature' ? 'Gekauft' : `${item.cost} 🪙`}
          </button>
        </div>
      );
    })}
  </div>
);

const InventoryModal = ({ user, onClose, onToggleEffect, onAvatarChange }: any) => {
  const owned = SHOP_ITEMS.filter(i => user.unlockedItems.includes(i.id));
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[4.5rem] p-16 shadow-2xl text-slate-950 animate-in zoom-in">
        <div className="flex justify-between items-center mb-12">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter">Profil & Inventar</h2>
           <button onClick={onClose} className="p-4 bg-slate-50 rounded-full hover:text-rose-500 transition-all">✕</button>
        </div>
        <div className="space-y-12">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-[0.3em]">Avatare</h3>
            <div className="grid grid-cols-4 gap-4">
              {owned.filter(i => i.type === 'avatar').map(av => (
                <button key={av.id} onClick={() => onAvatarChange(av.value)} className={`text-5xl p-6 rounded-3xl border-4 transition-all shadow-sm ${user.avatar === av.value ? 'border-indigo-600 bg-indigo-50 scale-110 shadow-xl' : 'border-slate-50 hover:border-slate-100'}`}>
                  {av.value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-[0.3em]">Aktive Effekte</h3>
            <div className="grid grid-cols-2 gap-4">
              {owned.filter(i => i.type === 'effect').map(eff => (
                <button key={eff.id} onClick={() => onToggleEffect(eff.value)} className={`p-8 rounded-[2.5rem] border-4 transition-all flex items-center justify-between shadow-sm ${user.activeEffects.includes(eff.value) ? 'border-indigo-600 bg-indigo-50 shadow-xl' : 'border-slate-50 opacity-60'}`}>
                  <span className="font-black uppercase text-xs">{eff.name}</span>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${user.activeEffects.includes(eff.value) ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${user.activeEffects.includes(eff.value) ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="mt-16 w-full py-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:translate-y-0">Bestätigen</button>
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin }: any) => { 
  const [name, setName] = useState(''); 
  const handleSubmit = async (e: any) => { e.preventDefault(); if(!name.trim()) return; onLogin(await AuthService.login(name)); }; 
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-[5rem] p-20 shadow-[0_40px_100px_rgba(0,0,0,0.1)] text-center border-b-[20px] border-indigo-600 animate-in zoom-in duration-500">
        <div className="text-9xl mb-12 transform hover:scale-110 transition-transform cursor-default">📐</div>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic mb-16 leading-none">MathMaster<br/>Klasse 9</h1>
        <form onSubmit={handleSubmit} className="space-y-12">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Username eingeben..." className="w-full p-10 bg-slate-50 rounded-[3rem] border-4 border-transparent focus:border-indigo-500 outline-none font-black text-center text-3xl uppercase tracking-widest text-slate-900 shadow-inner" autoFocus />
          <button type="submit" className="w-full py-10 bg-slate-950 text-white rounded-[3rem] font-black text-2xl hover:bg-indigo-600 shadow-2xl transition-all uppercase tracking-tighter hover:-translate-y-2 active:translate-y-0 active:scale-95">Starten 🚀</button>
        </form>
      </div>
    </div>
  ); 
};
