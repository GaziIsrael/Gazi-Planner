import React, { useState, useEffect, useRef } from 'react';
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
  CheckSquare,
  CornerDownRight,
  X,
  UserCheck,
  CircleDot,
  FolderKanban,
  Users,
  SearchCode,
  PenTool,
  Eraser,
  Trash2,
  Type,
  Highlighter,
  Undo2,
  Hand
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review' | 'projects' | 'delegated' | 'search'>('daily');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);

  // Daily Tasks
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '플래너 제작 완료하기', status: 'not_started', priority: 'B', date: '2026-11-10', tag: 'Q1' },
      { id: 2, title: '팀장 회의 소집', status: 'cancelled', priority: 'B', date: '2026-11-11', tag: 'Q2' },
      { id: 3, title: '줌미팅', status: 'not_started', priority: 'B', date: '2026-11-11', tag: 'Q1' },
      { id: 4, title: '아내와 따뜻한 차 마시며 이야기 나누기', status: 'not_started', priority: 'A', date: '2026-11-11', tag: 'Q2' }
    ];
  });

  // Projects
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('planbae_projects');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        title: '2027년 사역기획', 
        tag: 'Pastoral', 
        deadline: '미지정', 
        progress: 0,
        subtasks: [
          { id: 101, title: '올해 사역 피드백', status: 'not_started', priority: 'B', tag: 'Q1' },
          { id: 102, title: '팀장 회의 소집', status: 'not_started', priority: 'B', tag: 'Q1' }
        ]
      }
    ];
  });

  // Schedule
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
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Apple Pencil, Palm Rejection & Undo States
  const [noteMode, setNoteMode] = useState<'text' | 'draw'>('draw');
  const [penColor, setPenColor] = useState('#2C3A4E');
  const [penTool, setPenTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState(2);
  const [pencilOnly, setPencilOnly] = useState(true); // 팜 리젝션 기본 활성화
  const [canUndo, setCanUndo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<string[]>([]);

  // Foundation & Target States
  const [mosMission, setMosMission] = useState(() => localStorage.getItem('planbae_mos_mission') || '');
  const [reviewTab, setReviewTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
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
    localStorage.setItem('planbae_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('planbae_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('planbae_note', dailyNote);
  }, [dailyNote]);

  useEffect(() => {
    localStorage.setItem('planbae_mos_mission', mosMission);
  }, [mosMission]);

  useEffect(() => {
    localStorage.setItem('planbae_month_goal', monthGoal);
  }, [monthGoal]);

  useEffect(() => {
    localStorage.setItem('planbae_year_dir', yearDirection);
  }, [yearDirection]);

  // Load saved canvas drawing & initialize undo history
  useEffect(() => {
    if (view === 'daily' && noteMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const savedDataUrl = localStorage.getItem('planbae_handwriting');
      if (ctx) {
        if (savedDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            if (historyRef.current.length === 0) {
              historyRef.current = [savedDataUrl];
            }
          };
          img.src = savedDataUrl;
        } else if (historyRef.current.length === 0) {
          historyRef.current = [canvas.toDataURL('image/png')];
        }
      }
    }
  }, [view, noteMode]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // 팜 리젝션: Apple Pencil 전용 모드일 때 손가락 터치(touch) 차단
    if (pencilOnly && e.pointerType === 'touch') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pressure = e.pressure > 0 ? e.pressure : 0.5;

    if (penTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 22;
    } else if (penTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.lineWidth = 14;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = isDark && penColor === '#2C3A4E' ? '#E5E5E5' : penColor;
      ctx.lineWidth = Math.max(1, penSize * (pressure * 1.6));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (pencilOnly && e.pointerType === 'touch') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    if (penTool === 'pen') {
      const pressure = e.pressure > 0 ? e.pressure : 0.5;
      ctx.lineWidth = Math.max(1, penSize * (pressure * 1.6));
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem('planbae_handwriting', dataUrl);

      // 실행 취소(Undo) 스택에 저장 (최대 30단계)
      historyRef.current.push(dataUrl);
      if (historyRef.current.length > 30) {
        historyRef.current.shift();
      }
      setCanUndo(historyRef.current.length > 1);
    }
  };

  // 실행 취소 (Undo) 함수
  const handleUndo = () => {
    if (historyRef.current.length <= 1 || !canvasRef.current) return;
    
    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];
    setCanUndo(historyRef.current.length > 1);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx && previousState) {
      const img = new Image();
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        localStorage.setItem('planbae_handwriting', previousState);
      };
      img.src = previousState;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const emptyUrl = canvas.toDataURL('image/png');
      localStorage.setItem('planbae_handwriting', emptyUrl);
      historyRef.current.push(emptyUrl);
      setCanUndo(historyRef.current.length > 1);
    }
  };

  const handleAddQuickTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickInput.trim()) {
      const newTask = {
        id: Date.now(),
        title: quickInput.trim(),
        status: 'not_started',
        priority: 'B',
        date: '2026-11-12',
        tag: 'Q1'
      };
      setTasks([...tasks, newTask]);
      setQuickInput('');
    }
  };

  const handleAddSubtask = (projectId: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubtaskInput.trim()) {
      setProjects(projects.map(p => {
        if (p.id === projectId) {
          const updatedSubtasks = [
            ...p.subtasks,
            { id: Date.now(), title: newSubtaskInput.trim(), status: 'not_started', priority: 'B', tag: 'Q1' }
          ];
          return { ...p, subtasks: updatedSubtasks };
        }
        return p;
      }));
      setNewSubtaskInput('');
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

          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Foundation</div>
              <nav className="space-y-0.5">
                <button 
                  onClick={() => setView('mos')} 
                  className={view === 'mos' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <Target className="w-4 h-4" />
                  <span>M/O/S</span>
                </button>
                <button 
                  onClick={() => setView('compass')} 
                  className={view === 'compass' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
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
                  className={view === 'daily' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Daily</span>
                </button>
                <button 
                  onClick={() => setView('weekly')} 
                  className={view === 'weekly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <Clock className="w-4 h-4" />
                  <span>Weekly</span>
                </button>
                <button 
                  onClick={() => setView('monthly')} 
                  className={view === 'monthly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Monthly</span>
                </button>
                <button 
                  onClick={() => setView('yearly')} 
                  className={view === 'yearly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
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
                  onClick={() => setView('projects')} 
                  className={view === 'projects' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>프로젝트</span>
                </button>
                <button 
                  onClick={() => setView('delegated')} 
                  className={view === 'delegated' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <Users className="w-4 h-4" />
                  <span>위임한 일</span>
                </button>
                <button 
                  onClick={() => setView('review')} 
                  className={view === 'review' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <FileText className="w-4 h-4" />
                  <span>Review</span>
                </button>
                <button 
                  onClick={() => setView('search')} 
                  className={view === 'search' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#ECE7DD] dark:bg-[#26262B] font-semibold text-[#2C3A4E] dark:text-stone-100' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}
                >
                  <SearchCode className="w-4 h-4" />
                  <span>노트 검색</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E6E1D6] dark:border-[#3A3A40] space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] text-stone-500">테마</span>
            <div className="flex bg-[#ECE7DD] dark:bg-stone-800 p-0.5 rounded-md">
              <button 
                onClick={() => setIsDark(false)}
                className={!isDark ? 'p-1.5 rounded bg-white text-stone-900 shadow-xs' : 'p-1.5 rounded text-stone-500'}
                title="종이 모드"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsDark(true)}
                className={isDark ? 'p-1.5 rounded bg-[#26262B] text-stone-100 shadow-xs' : 'p-1.5 rounded text-stone-500'}
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
        
        {/* Header */}
        <header className="h-14 border-b border-[#E6E1D6] dark:border-[#3A3A40] flex items-center justify-between px-8 shrink-0">
          <div className="text-xs tracking-wider text-stone-600 uppercase font-sans">
            {view === 'projects' ? 'WORKSPACE / 프로젝트' : 
             view === 'delegated' ? 'WORKSPACE / 위임한 일' : 
             view === 'search' ? 'WORKSPACE / 노트 검색' : 
             view === 'review' ? 'WORKSPACE / Review' : 
             `PLANNER / ${view.toUpperCase()}`}
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setView('search')} className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">
              <Search className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>
            <button 
              onClick={() => { setView('daily'); setCurrentTime(new Date()); }} 
              className="px-2.5 py-1 text-xs border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-800 hover:bg-stone-50"
            >
              오늘
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* 1. DAILY VIEW */}
          {view === 'daily' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">Daily / Today</div>
                  <div className="text-3xl font-serif font-bold tracking-tight mt-0.5">
                    11월 12일 <span className="text-xl font-normal text-stone-600 font-sans">목요일</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">오늘의 할 일과 일정을 정리하고, 하루를 기록하세요.</div>
                </div>
                <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="px-2 font-medium">날짜 선택 2026. 11. 12.</span>
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Priorities */}
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

                  {/* 03 · Notes (Palm Rejection & Undo 지원) */}
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">03 · Notes</span>
                        <h2 className="text-base font-bold font-serif">자유 노트</h2>
                      </div>
                      
                      <div className="flex items-center bg-[#ECE7DD] dark:bg-stone-800 p-0.5 rounded-md text-[11px]">
                        <button 
                          onClick={() => setNoteMode('draw')}
                          className={noteMode === 'draw' ? 'flex items-center space-x-1 px-2 py-1 rounded bg-white dark:bg-stone-700 font-semibold shadow-xs' : 'flex items-center space-x-1 px-2 py-1 text-stone-500'}
                        >
                          <PenTool className="w-3 h-3" />
                          <span>펜슬 필기</span>
                        </button>
                        <button 
                          onClick={() => setNoteMode('text')}
                          className={noteMode === 'text' ? 'flex items-center space-x-1 px-2 py-1 rounded bg-white dark:bg-stone-700 font-semibold shadow-xs' : 'flex items-center space-x-1 px-2 py-1 text-stone-500'}
                        >
                          <Type className="w-3 h-3" />
                          <span>텍스트</span>
                        </button>
                      </div>
                    </div>

                    {noteMode === 'text' ? (
                      <textarea 
                        rows={7}
                        value={dailyNote}
                        onChange={(e) => setDailyNote(e.target.value)}
                        placeholder="오늘 남겨두고 싶은 생각, 기도, 메모..."
                        className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none"
                      />
                    ) : (
                      <div className="space-y-2">
                        {/* Apple Pencil Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F6F3EB] dark:bg-stone-800/80 px-2.5 py-1.5 rounded border border-stone-200 dark:border-stone-700">
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => setPenTool('pen')}
                              className={penTool === 'pen' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-[#2C3A4E] dark:text-white' : 'p-1.5 text-stone-500'}
                              title="만년필"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setPenTool('highlighter')}
                              className={penTool === 'highlighter' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-amber-500' : 'p-1.5 text-stone-500'}
                              title="형광펜"
                            >
                              <Highlighter className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setPenTool('eraser')}
                              className={penTool === 'eraser' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-rose-500' : 'p-1.5 text-stone-500'}
                              title="지우개"
                            >
                              <Eraser className="w-3.5 h-3.5" />
                            </button>
                            
                            <div className="h-3.5 w-px bg-stone-300 dark:bg-stone-600 mx-1"></div>

                            {[
                              { name: '네이비', hex: '#2C3A4E' },
                              { name: '세피아', hex: '#5C4033' },
                              { name: '레드', hex: '#C24B40' },
                              { name: '그린', hex: '#2D6A4F' }
                            ].map(c => (
                              <button
                                key={c.hex}
                                onClick={() => { setPenTool('pen'); setPenColor(c.hex); }}
                                className={`w-4 h-4 rounded-full border ${penColor === c.hex && penTool === 'pen' ? 'ring-2 ring-offset-1 ring-stone-400 scale-110' : 'border-stone-300'}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                          </div>

                          {/* Right Controls: Palm Rejection Toggle + Undo + Clear */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => setPencilOnly(!pencilOnly)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] border transition-colors ${
                                pencilOnly 
                                  ? 'bg-[#2C3A4E] text-white border-[#2C3A4E]' 
                                  : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                              }`}
                              title={pencilOnly ? '팜 리젝션 ON (Apple Pencil만 인식)' : '손가락 터치/마우스 필기 허용'}
                            >
                              <Hand className="w-3 h-3" />
                              <span>{pencilOnly ? '펜슬 전용' : '손 터치 허용'}</span>
                            </button>

                            <button 
                              onClick={handleUndo}
                              disabled={!canUndo}
                              className={`p-1.5 rounded border ${
                                canUndo 
                                  ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600 hover:bg-stone-100' 
                                  : 'text-stone-300 dark:text-stone-600 border-transparent cursor-not-allowed'
                              }`}
                              title="실행 취소 (Undo)"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={clearCanvas}
                              className="p-1.5 text-stone-500 hover:text-rose-600"
                              title="전체 지우기"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Apple Pencil Drawing Canvas */}
                        <div 
                          className="relative border border-stone-200 dark:border-stone-700 rounded overflow-hidden bg-[#FBF9F4] dark:bg-[#1E1E22]"
                          style={{
                            backgroundImage: 'radial-gradient(rgba(160, 150, 135, 0.35) 1px, transparent 1px)',
                            backgroundSize: '18px 18px'
                          }}
                        >
                          <canvas
                            ref={canvasRef}
                            width={800}
                            height={480}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            style={{ touchAction: 'none' }}
                            className="w-full h-[240px] cursor-crosshair block"
                          />
                          <div className="absolute bottom-1.5 right-2 text-[10px] text-stone-400 pointer-events-none select-none">
                            {pencilOnly ? '팜 리젝션 ON (Apple Pencil 전용)' : '터치·마우스 모드'} · 자동 저장
                          </div>
                        </div>
                      </div>
                    )}
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
                    <div 
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: ((currentMinutes / 1440) * 1200) + 'px' }}
                    >
                      <span className="bg-[#C24B40] text-white text-[9px] font-mono px-1 rounded font-bold mr-1">
                        {formattedCurrentTime}
                      </span>
                      <div className="flex-1 h-[1.5px] bg-[#C24B40]"></div>
                    </div>

                    <div className="relative" style={{ height: '1200px' }}>
                      {Array.from({ length: 25 }, (_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full flex items-start border-t border-stone-200 dark:border-stone-800/80"
                          style={{ top: ((i / 24) * 1200) + 'px', height: '50px' }}
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
                            style={{ top: top + 'px', height: Math.max(height, 28) + 'px' }}
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

          {/* 2. PROJECTS */}
          {view === 'projects' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">PROJECTS</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">프로젝트</h1>
                  <p className="text-xs text-stone-500 mt-1">마감일과 선행 업무를 연결하고, 같은 체크 상태를 모든 계획 화면에서 확인합니다.</p>
                </div>
                <button className="px-3 py-1.5 bg-[#2C3A4E] dark:bg-stone-700 text-white rounded text-xs flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>프로젝트 추가</span>
                </button>
              </div>

              {projects.map(proj => (
                <div key={proj.id} className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <FolderKanban className="w-4 h-4 text-[#2C3A4E] dark:text-stone-300" />
                      <h2 className="text-base font-bold font-serif">{proj.title}</h2>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600">{proj.tag}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <button className="text-stone-500 hover:text-stone-800">열기</button>
                      <button className="text-stone-500 hover:text-stone-800">편집</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>마감일 {proj.deadline}</span>
                    <span className="font-bold text-[#2C3A4E] dark:text-stone-300">{proj.progress}%</span>
                  </div>

                  <input 
                    type="text" 
                    placeholder="하위 업무를 적고 Enter로 추가..." 
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => handleAddSubtask(proj.id, e)}
                    className="w-full border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs bg-[#FBF9F4] dark:bg-stone-800 outline-none"
                  />

                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] text-stone-500">0 / {proj.subtasks.length} 완료</div>
                    {proj.subtasks.map(st => (
                      <div key={st.id} className="flex items-center justify-between py-1.5 border-b border-dashed border-stone-200 dark:border-stone-800 text-xs">
                        <div className="flex items-center space-x-2.5">
                          <button onClick={() => updateTaskStatus(st.id, 'completed')}>
                            {renderStatusSymbol(st.status)}
                          </button>
                          <span>{st.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-serif bg-stone-100 dark:bg-stone-800 px-1 rounded">{st.priority}</span>
                          <span className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 rounded">{st.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. DELEGATED */}
          {view === 'delegated' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="text-[11px] uppercase tracking-wider text-stone-600">DELEGATED TASKS</div>
                <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">위임한 일</h1>
                <p className="text-xs text-stone-500 mt-1">팀원이나 동역자에게 위임한 업무의 진행 상황과 마감일을 추적합니다.</p>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 text-xs font-semibold text-stone-600">
                    <span>업무 내용</span>
                    <span>담당자 / 마감</span>
                  </div>
                  {tasks.filter(t => t.status === 'delegated').length === 0 ? (
                    <div className="text-center py-10 text-xs text-stone-400">
                      현재 위임된 업무가 없습니다. 할 일에서 상태를 '⊙ 위임'으로 선택하면 이곳에 정리됩니다.
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'delegated').map(t => (
                      <div key={t.id} className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 text-xs">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>{t.title}</span>
                        </div>
                        <span className="text-[11px] text-stone-500">배정일 {t.date}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTE SEARCH */}
          {view === 'search' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="text-[11px] uppercase tracking-wider text-stone-600">SEARCH</div>
                <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">노트 검색</h1>
                <p className="text-xs text-stone-500 mt-1">자유 노트, 사명 선언서, 플래너에 적힌 모든 기록을 검색합니다.</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요 (예: 기도, 말씀, 회의...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg text-xs outline-none"
                />
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                <div className="text-xs font-semibold text-stone-600">검색 결과</div>
                <div className="space-y-3 pt-2">
                  {dailyNote && dailyNote.includes(searchQuery) && (
                    <div className="p-3 bg-[#FAF6EE] dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs">
                      <div className="font-bold text-[#2C3A4E] dark:text-stone-200 mb-1">자유 노트</div>
                      <div className="text-stone-600 dark:text-stone-400">{dailyNote}</div>
                    </div>
                  )}
                  {mosMission && mosMission.includes(searchQuery) && (
                    <div className="p-3 bg-[#FAF6EE] dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs">
                      <div className="font-bold text-[#2C3A4E] dark:text-stone-200 mb-1">M · 사명 선언서</div>
                      <div className="text-stone-600 dark:text-stone-400">{mosMission}</div>
                    </div>
                  )}
                  {(!dailyNote.includes(searchQuery) && !mosMission.includes(searchQuery)) && (
                    <div className="text-xs text-stone-400 py-6 text-center">
                      일치하는 노트 기록이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. MONTHLY VIEW */}
          {view === 'monthly' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">MONTHLY</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">2026년 11월</h1>
                  <p className="text-xs text-stone-500 mt-1">날짜 숫자 → Daily · 날짜 칸이나 + → 계획 확인과 추가</p>
                </div>
                <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setView('review')} className="px-2 font-medium flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 mr-1" /> 월간 Review
                  </button>
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">
                  <span className="text-xs font-serif font-bold">월간 달력</span>
                  <div className="flex space-x-1 text-xs">
                    <button className="px-2 py-0.5 bg-[#ECE7DD] dark:bg-stone-700 rounded font-medium">캘린더</button>
                    <button className="px-2 py-0.5 text-stone-500">목록</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-stone-600 mb-2">
                  <div className="text-rose-500">주일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div className="text-blue-500">토</div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-stone-200 dark:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded overflow-hidden text-xs">
                  {Array.from({ length: 35 }, (_, idx) => {
                    const dayNum = idx + 1;
                    const isToday = dayNum === 12;
                    const cellBg = isToday ? 'bg-[#FAF6EE] dark:bg-stone-800 font-bold' : 'bg-white dark:bg-[#202024] hover:bg-stone-50';
                    return (
                      <div key={idx} className={"h-24 p-1.5 flex flex-col justify-between transition-colors " + cellBg}>
                        <div className="flex justify-between items-center">
                          <span className={idx % 7 === 0 ? 'text-rose-500' : idx % 7 === 6 ? 'text-blue-500' : ''}>
                            {dayNum <= 30 ? dayNum : dayNum - 30}
                          </span>
                          <span className="text-[10px] text-stone-400 opacity-60">+</span>
                        </div>
                        {dayNum === 8 && (
                          <div className="bg-stone-100 dark:bg-stone-700 p-1 rounded text-[10px] text-stone-700 dark:text-stone-300">
                            20:00 40일 철야
                          </div>
                        )}
                        {dayNum === 10 && (
                          <div className="text-[10px] text-stone-600 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>플래너 제작</span>
                          </div>
                        )}
                        <div></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">INTENTIONS</span>
                  <h3 className="text-sm font-bold font-serif">월간 목표</h3>
                  <p className="text-xs text-stone-500">이달의 방향: 이번 달에는 무엇에 마음을 두고 싶나요?</p>
                  <input 
                    type="text" 
                    value={monthGoal}
                    onChange={(e) => setMonthGoal(e.target.value)}
                    className="w-full border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs bg-transparent outline-none"
                    placeholder="이달의 중요 목표를 적으세요..."
                  />
                </div>

                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">CALENDAR</span>
                  <h3 className="text-sm font-bold font-serif">연결된 일정</h3>
                  <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold">40일 철야</span>
                      <span className="text-[11px] text-stone-500">11.8 주일 · 20:00~22:40 · Pastoral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. YEARLY VIEW */}
          {view === 'yearly' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">YEARLY</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">2026년</h1>
                  <p className="text-xs text-stone-500 mt-1">한 해의 방향과 목표를 정하고, 올해의 성취와 변화를 기록합니다.</p>
                </div>
                <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setView('review')} className="px-2 font-medium flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 mr-1" /> 연간 Review
                  </button>
                  <button className="p-1 text-stone-500 hover:text-stone-800"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                <div className="flex justify-between items-center mb-6 border-b border-stone-200 dark:border-stone-800 pb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">YEAR AT A GLANCE</span>
                    <h2 className="text-base font-bold font-serif">한눈에 보는 한해</h2>
                  </div>
                  <div className="text-xs text-stone-500">총 365일 · 지나온 날 316일 · 남은 날 49일</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    '01 JAN', '02 FEB', '03 MAR', '04 APR',
                    '05 MAY', '06 JUN', '07 JUL', '08 AUG',
                    '09 SEP', '10 OCT', '11 NOV', '12 DEC'
                  ].map((monthTitle, mIdx) => (
                    <div key={monthTitle} className="border border-stone-100 dark:border-stone-800 p-2.5 rounded">
                      <div className="text-xs font-serif font-bold text-stone-700 dark:text-stone-300 mb-2 border-b border-stone-100 dark:border-stone-800 pb-1">
                        {monthTitle}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-stone-600 mb-1">
                        <span className="text-rose-500">일</span>
                        <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span>
                        <span className="text-blue-500">토</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-[9px] text-center">
                        {Array.from({ length: 31 }, (_, d) => (
                          <span 
                            key={d} 
                            className={mIdx === 10 && d === 11 ? 'py-0.5 rounded bg-[#2C3A4E] text-white font-bold' : 'py-0.5 rounded text-stone-600 dark:text-stone-400'}
                          >
                            {d + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">INTENTIONS</span>
                <h3 className="text-base font-bold font-serif">연간 목표 & 방향</h3>
                <p className="text-xs text-stone-500">올해의 방향: 올해 어떤 방향으로 나아가고 싶나요?</p>
                <textarea 
                  rows={3}
                  value={yearDirection}
                  onChange={(e) => setYearDirection(e.target.value)}
                  placeholder="올해 이루고 싶은 중요한 목표와 삶의 방향을 적어보세요..."
                  className="w-full border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs bg-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* 7. FOUNDATION / M/O/S */}
          {view === 'mos' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-baseline">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">MOSAIC Foundation</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight">M/O/S</h1>
                  <p className="text-xs text-stone-500 mt-1">사명을 서술하고, 목표와 전략을 아웃라인으로 연결합니다.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-600">Draft · 자동 저장</span>
                  <button className="px-3 py-1 bg-[#2C3A4E] dark:bg-stone-700 text-white rounded text-xs">✓ 비전 확정</button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-6 space-y-3 shadow-xs">
                <span className="text-[#2C3A4E] font-serif font-bold text-xs uppercase tracking-wider block">Mission</span>
                <h2 className="text-base font-bold font-serif">M · 사명</h2>
                <p className="text-xs text-stone-500">하나님께 맡겨진 삶을 무엇을 위해 살아가나요?</p>
                <textarea 
                  rows={6}
                  value={mosMission}
                  onChange={(e) => setMosMission(e.target.value)}
                  placeholder="문단으로 자유롭게 작성하세요..."
                  className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* 8. WEEKLY COMPASS */}
          {view === 'compass' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4 flex justify-between items-baseline">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">Foundation</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight">Weekly Compass</h1>
                  <p className="text-xs text-stone-500 mt-1">역할마다 이번 주의 Big Rock을 정하고 삶의 균형을 맞춥니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">SHARPEN THE SAW</span>
                  <h3 className="text-sm font-bold font-serif">자기계발 (4대 영역)</h3>
                  {['신체적', '사회적 / 감정적', '정신적', '영적'].map(area => (
                    <div key={area} className="space-y-1">
                      <div className="text-xs font-semibold text-stone-600">{area}</div>
                      <input 
                        type="text" 
                        placeholder="이번 주 이 영역에서 실천할 한 가지..." 
                        className="w-full border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1.5 text-xs bg-transparent outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                  <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">ROLES & BIG ROCKS</span>
                  <h3 className="text-sm font-bold font-serif">역할별 Big Rock</h3>
                  {['하나님의 자녀', '남편', '아빠', '목사', '선생님'].map(role => (
                    <div key={role} className="space-y-1">
                      <div className="text-xs font-semibold text-stone-600">{role}</div>
                      <input 
                        type="text" 
                        placeholder="이번 주 이 역할에서 가장 중요한 일..." 
                        className="w-full border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1.5 text-xs bg-transparent outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. REVIEW */}
          {view === 'review' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">Review</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight">주간 Review</h1>
                  <p className="text-xs text-stone-500 mt-1">2026년 11.9 월요일 ~ 11.15 주일</p>
                </div>
                <div className="flex space-x-1 border border-stone-300 dark:border-stone-700 rounded p-0.5 text-xs">
                  <button onClick={() => setReviewTab('weekly')} className={reviewTab === 'weekly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>주간</button>
                  <button onClick={() => setReviewTab('monthly')} className={reviewTab === 'monthly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>월간</button>
                  <button onClick={() => setReviewTab('yearly')} className={reviewTab === 'yearly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>연간</button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-6 shadow-xs space-y-5">
                <div className="flex items-center space-x-2">
                  <span className="text-[#2C3A4E] font-serif font-bold text-xs uppercase tracking-wider">CORAM DEO</span>
                  <h2 className="text-base font-bold font-serif">돌아보고 다시 정렬하기</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">이번 주에 의미 있게 이룬 것은 무엇인가요?</label>
                    <textarea 
                      rows={2} 
                      className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none"
                      placeholder="감사하고 의미 있었던 일을 기록해 보세요..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">무엇을 놓쳤고, 삶의 균형은 어떠했나요?</label>
                    <textarea 
                      rows={2} 
                      className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none"
                      placeholder="몸과 마음, 신앙과 일상의 균형을 돌아보세요..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">무엇을 계속하고, 수정하고, 내려놓을까요?</label>
                    <textarea 
                      rows={2} 
                      className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none"
                      placeholder="다음 주의 방향을 생각해 보세요..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button className="px-4 py-1.5 bg-[#2C3A4E] text-white rounded text-xs">Review 마치기</button>
                </div>
              </div>
            </div>
          )}

          {/* 10. WEEKLY TIMETABLE */}
          {view === 'weekly' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="text-[11px] uppercase tracking-wider text-stone-600">24-HOUR SCHEDULE</div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Weekly</h1>
                <p className="text-xs text-stone-500 mt-1">2026년 11.9 월요일 ~ 11.15 주일</p>
              </div>

              <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                <div className="grid grid-cols-8 gap-px bg-stone-200 dark:bg-stone-700 rounded overflow-hidden text-xs">
                  <div className="bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold">시간</div>
                  {['11.9 월', '11.10 화', '11.11 수', '11.12 목', '11.13 금', '11.14 토', '11.15 주일'].map((d, i) => (
                    <div key={d} className={i === 3 ? 'bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold text-[#C24B40]' : 'bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold'}>
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 14 }, (_, h) => (
                    <React.Fragment key={h}>
                      <div className="bg-white dark:bg-stone-900 p-2 text-center text-stone-400 font-mono text-[10px]">
                        {String(h + 7).padStart(2, '0')}:00
                      </div>
                      {Array.from({ length: 7 }, (_, d) => (
                        <div key={d} className="bg-white dark:bg-stone-900 p-2 border-t border-stone-100 dark:border-stone-800 min-h-[40px]">
                          {h === 13 && d === 6 && (
                            <div className="bg-[#2C3A4E] text-white p-1 rounded text-[10px]">40일 철야</div>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
