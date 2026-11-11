import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sun, 
  Moon, 
  Search, 
  Compass, 
  Target, 
  FileText,
  RotateCcw,
  CheckSquare,
  CornerDownRight,
  X,
  UserCheck,
  CircleDot
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review'>('daily');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);

  // Data States
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '플래너 제작 완료하기', status: 'not_started', priority: 'B', date: '2026-11-10', tag: 'Q1' },
      { id: 2, title: '팀장 회의 소집', status: 'cancelled', priority: 'B', date: '2026-11-11', tag: 'Q2' },
      { id: 3, title: '줌미팅', status: 'not_started', priority: 'B', date: '2026-11-11', tag: 'Q1' },
      { id: 4, title: '아내와 따뜻한 차 마시며 이야기 나누기', status: 'not_started', priority: 'A', date: '2026-11-11', tag: 'Q2' }
    ];
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('planbae_schedule');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '40일 철야', start: '20:00', end: '22:40', tag: 'Pastoral', date: '2026-11-08' }
    ];
  });

  const [dailyNote, setDailyNote] = useState(() => localStorage.getItem('planbae_note') || '');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  const [quickInput, setQuickInput] = useState('');

  // Foundation & Review States
  const [mosMission, setMosMission] = useState(() => localStorage.getItem('planbae_mos_mission') || '');
  const [reviewTab, setReviewTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [reviewAnswers, setReviewAnswers] = useState(() => {
    const saved = localStorage.getItem('planbae_review');
    return saved ? JSON.parse(saved) : { q1: '', q2: '', q3: '' };
  });

  // Monthly & Yearly Target State
  const [monthGoal, setMonthGoal] = useState(() => localStorage.getItem('planbae_month_goal') || '10킬로 그램 감량');
  const [yearDirection, setYearDirection] = useState(() => localStorage.getItem('planbae_year_dir') || '');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('planbae_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planbae_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('planbae_note', dailyNote);
  }, [dailyNote]);

  useEffect(() => {
    localStorage.setItem('planbae_review', JSON.stringify(reviewAnswers));
  }, [reviewAnswers]);

  useEffect(() => {
    localStorage.setItem('planbae_mos_mission', mosMission);
  }, [mosMission]);

  useEffect(() => {
    localStorage.setItem('planbae_month_goal', monthGoal);
  }, [monthGoal]);

  useEffect(() => {
    localStorage.setItem('planbae_year_dir', yearDirection);
  }, [yearDirection]);

  const handleAddQuickTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickInput.trim()) {
      const newTask = {
        id: Date.now(),
        title: quickInput.trim(),
        status: 'not_started',
        priority: 'B',
        date: '2026-11-11',
        tag: 'Q1'
      };
      setTasks([...tasks, newTask]);
      setQuickInput('');
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setShowStatusMenu(null);
  };

  const renderStatusSymbol = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />;
      case 'postponed': return <CornerDownRight className="w-3.5 h-3.5 text-amber-600 font-bold" />;
      case 'cancelled': return <X className="w-3.5 h-3.5 text-rose-500 font-bold" />;
      case 'delegated': return <UserCheck className="w-3.5 h-3.5 text-indigo-600 font-bold" />;
      case 'in_progress': return <CircleDot className="w-3.5 h-3.5 text-blue-600 font-bold" />;
      default: return <div className="w-3.5 h-3.5 border border-stone-400 dark:border-stone-500 rounded-xs"></div>;
    }
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const formattedCurrentTime = currentTime.toTimeString().slice(0, 5);

  return (
    <div className="flex h-screen w-full overflow-hidden text-sm bg-[#FBF9F4] text-[#333333] dark:bg-[#1E1E22] dark:text-[#E0E0E0] font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-60 border-r border-[#E6E1D6] dark:border-[#3A3A40] flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo / App Name */}
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="w-8 h-8 rounded bg-[#2C3A4E] dark:bg-stone-800 text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
              EB
            </div>
            <div>
              {isEditingName ? (
                <input 
                  type="text" 
                  value={appName} 
                  onChange={(e) => setAppName(e.target.value)}
                  onBlur={() => {
                    setIsEditingName(false);
                    localStorage.setItem('planbae_app_name', appName);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      localStorage.setItem('planbae_app_name', appName);
                    }
                  }}
                  autoFocus
                  className="text-base font-bold font-serif bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 px-1 rounded outline-none"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingName(true)}
                  className="text-base font-bold font-serif tracking-tight cursor-pointer hover:opacity-75"
                  title="클릭하여 플래너 이름 수정"
                >
                  {appName}
                </div>
              )}
              <div className="text-[10px] tracking-wider text-stone-500 uppercase font-sans">Digital Planner</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Foundation</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => setView('mos')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'mos' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <Target className="w-4 h-4" />
                  <span>M/O/S</span>
                </button>
                <button 
                  onClick={() => setView('compass')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'compass' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Weekly Compass</span>
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Planner</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => setView('daily')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'daily' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Daily</span>
                </button>
                <button 
                  onClick={() => setView('weekly')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'weekly' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Weekly</span>
                </button>
                <button 
                  onClick={() => setView('monthly')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'monthly' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Monthly</span>
                </button>
                <button 
                  onClick={() => setView('yearly')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'yearly' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Yearly</span>
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Workspace</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => setView('review')} 
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-colors text-left ${view === 'review' ? 'bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Review</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="pt-4 border-t border-[#E6E1D6] dark:border-[#3A3A40] space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] text-stone-500">테마</span>
            <div className="flex bg-[#ECE7DD] dark:bg-stone-800 p-0.5 rounded-md">
              <button 
                onClick={() => setIsDark(false)}
                className={`p-1.5 rounded ${!isDark ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-300'}`} title="종이 모드" > <Sun className="w-3.5 h-3.5" /> </button> <button onClick={() => setIsDark(true)} className={`p-1.5 rounded ${isDark ? 'bg-[#26262B] text-stone-100 shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                title="잉크 다크 모드"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 px-2 flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>동기화 완료</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 border-b border-[#E6E1D6] dark:border-[#3A3A40] flex items-center justify-between px-8 shrink-0">
          <div className="text-xs tracking-wider text-stone-600 uppercase font-sans">
            PLANNER / {view.toUpperCase()}
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">
              <Search className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>
            <button 
              onClick={() => setCurrentTime(new Date())} 
              className="px-2.5 py-1 text-xs border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-800 hover:bg-stone-50"
            >
              오늘
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* 1. DAILY VIEW */}
          {view === 'daily' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">Daily / Today</div>
                  <div className="text-3xl font-serif font-bold tracking-tight mt-0.5">
                    11월 11일 <span className="text-xl font-normal text-stone-600 font-sans">수요일</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">오늘의 할 일과 일정을 정리하고, 하루를 기록하세요.</div>
                </div>
                <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-2 font-medium">날짜 선택 2026. 11. 11.</span>
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Priorities & Notes */}
                <div className="space-y-6">
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">01 · Priorities</span>
                        <h2 className="text-base font-bold font-serif">오늘 할 일</h2>
                      </div>
                      <span className="text-xs text-stone-600">0 / 4 완료</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="오늘 할 일 적기... (Enter를 누르면 추가)"
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        onKeyDown={handleAddQuickTask}
                        className="flex-1 border border-stone-300 dark:border-stone-700 rounded px-3 py-1.5 bg-[#FBF9F4] dark:bg-stone-800 text-xs outline-none"
                      />
                      <button 
                        onClick={() => handleAddQuickTask({ key: 'Enter' } as any)}
                        className="px-3 py-1.5 bg-[#2C3A4E] dark:bg-stone-700 text-white rounded text-xs"
                      >
                        + 추가
                      </button>
                    </div>

                    {/* Task Groups */}
                    <div className="space-y-4">
                      {['A', 'B', 'C'].map((p) => (
                        <div key={p} className="border-t border-stone-100 dark:border-stone-800 pt-3">
                          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
                            <span className="bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded font-serif">{p}</span>
                            <span className="flex-1 ml-2">
                              {p === 'A' ? '반드시 오늘 해야 할 일' : p === 'B' ? '하면 좋은 일' : '여유가 생기면'}
                            </span>
                            <button className="text-stone-500 hover:text-stone-800"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="space-y-2">
                            {tasks.filter(t => t.priority === p).map(task => (
                              <div key={task.id} className="relative flex items-center justify-between py-1 border-b border-dashed border-stone-200 dark:border-stone-800 text-xs">
                                <div className="flex items-center space-x-2.5">
                                  <button onClick={() => setShowStatusMenu(showStatusMenu === task.id ? null : task.id)}>
                                    {renderStatusSymbol(task.status)}
                                  </button>
                                  <span className={task.status === 'completed' || task.status === 'cancelled' ? 'line-through text-stone-400' : ''}>
                                    {task.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 rounded">{task.tag}</span>

                                {/* Status Menu Popover */}
                                {showStatusMenu === task.id && (
                                  <div className="absolute left-0 top-7 z-30 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 shadow-md rounded p-1 text-[11px] grid grid-cols-3 gap-1 w-52">
                                    <button onClick={() => updateTaskStatus(task.id, 'completed')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">✓ 완료</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'postponed')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">→ 연기</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'cancelled')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">✕ 취소</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'delegated')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">⊙ 위임</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'in_progress')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">• 진행 중</button>
                                    <button onClick={() => updateTaskStatus(task.id, 'not_started')} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">☐ 미시작</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">03 · Notes</span>
                        <h2 className="text-base font-bold font-serif">자유 노트</h2>
                      </div>
                      <span className="text-[11px] text-stone-500">자동 저장</span>
                    </div>
                    <textarea 
                      rows={5}
                      value={dailyNote}
                      onChange={(e) => setDailyNote(e.target.value)}
                      placeholder="오늘 남겨두고 싶은 생각, 기도, 메모..."
                      className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* Right: 24h Schedule */}
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs flex flex-col h-[740px]">
                  <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div>
                      <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">02 · Schedule</span>
                      <h2 className="text-base font-bold font-serif">24시간 시간표</h2>
                    </div>
                    <span className="text-xs text-stone-600">현재 {formattedCurrentTime}</span>
                  </div>

                  <div className="relative flex-1 overflow-y-auto pr-2">
                    {/* Red Current Time Line */}
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: `${(currentMinutes / 1440) * 1200}px` }} > <span className="bg-[#C24B40] text-white text-[9px] font-mono px-1 rounded font-bold mr-1"> {formattedCurrentTime} </span> <div className="flex-1 h-[1.5px] bg-[#C24B40]"></div> </div>  <div className="relative" style={{ height: '1200px' }}> {Array.from({ length: 25 }, (_, i) => ( <div key={i} className="absolute w-full flex items-start border-t border-stone-200 dark:border-stone-800/80" style={{ top: `${(i / 24) * 1200}px`, height: '50px' }}
                        >
                          <span className="w-12 text-[10px] text-stone-500 font-mono -mt-2 bg-transparent select-none">
                            {String(i).padStart(2, '0')}:00
                          </span>
                        </div>
                      ))}

                      {schedule.map(evt => {
                        const [startH, startM] = evt.start.split(':').map(Number);
                        const [endH, endM] = evt.end.split(':').map(Number);
                        const startMins = startH * 60 + startM;
                        const endMins = endH * 60 + endM;
                        const top = (startMins / 1440) * 1200;
                        const height = ((endMins - startMins) / 1440) * 1200;

                        return (
                          <div 
                            key={evt.id}
                            className="absolute left-14 right-2 bg-stone-100 dark:bg-stone-800 border-l-2 border-[#2C3A4E] p-2 rounded text-xs z-10 shadow-xs"
                            style={{ top: `${top}px`, height: `${Math.max(height, 28)}px` }}
                          >
                            <div className="font-semibold text-stone-800 dark:text-stone-200 flex justify-between">
                              <span>{evt.title}</span>
                              <span className="text-[10px] text-stone-500 font-mono">{evt.start} - {evt.end}</span>
                            </div>
                            <span className="text-[10px] text-stone-500">{evt.tag}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MONTHLY VIEW (스크린샷 디자인 완벽 반영) */}
          {view === 'monthly' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">MONTHLY</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">2026년 11월</h1>
                  <p className="text-xs text-stone-500 mt-1">날짜 숫자 → Daily · 날짜 칸이나 + → 계획 확인과 추가</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                    <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setView('review')} className="px-2 font-medium flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 mr-1" /> 월간 Review
                    </button>
                    <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Monthly Calendar Grid */}
              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">
                  <span className="text-xs font-serif font-bold">월간 달력</span>
                  <div className="flex space-x-1 text-xs">
                    <button className="px-2 py-0.5 bg-[#ECE7DD] dark:bg-stone-700 rounded font-medium">캘린더</button>
                    <button className="px-2 py-0.5 text-stone-500">목록</button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-stone-600 mb-2">
                  <div className="text-rose-500">주일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div className="text-blue-500">토</div>
                </div>

                {/* 5-Week Grid */}
                <div className="grid grid-cols-7 gap-px bg-stone-200 dark:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded overflow-hidden text-xs">
                  {Array.from({ length: 35 }, (_, idx) => {
                    const dayNum = idx + 1; // 11월 1일 주일 시작
                    const isToday = dayNum === 11;
                    return (
                      <div 
                        key={idx} 
                        className={`h-2
