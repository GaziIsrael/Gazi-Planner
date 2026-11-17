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
  Highlighter,
  Undo2,
  Hand,
  MousePointer,
  HelpCircle,
  AlignLeft,
  ListTodo,
  Copy
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review' | 'projects' | 'delegated' | 'search'>('compass');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);

  // Selected Date State (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState('2026-11-17');

  // Daily Tasks
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '모임 후 감사 메시지 전하기', status: 'not_started', priority: 'B', date: '2026-11-17', qTag: 'Q2', track: 'Pastoral', deadline: '', memo: '' },
      { id: 2, title: '팀장 회의 소집 준비', status: 'not_started', priority: 'A', date: '2026-11-17', qTag: 'Q1', track: 'Ministry', deadline: '2026-11-18', memo: '회의 자료 출력하기' }
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
      { id: 1, title: '하루 종일 일정 예시', start: '00:00', end: '23:59', tag: '종일', date: '2026-11-17' }
    ];
  });

  // Weekly Compass Data
  const [compassData, setCompassData] = useState(() => {
    const saved = localStorage.getItem('planbae_compass');
    return saved ? JSON.parse(saved) : {
      physical: '가볍게 걷고 충분히 쉬기',
      social: '가족의 이야기 듣기',
      mental: '책을 읽고 한 줄 쓰기',
      spiritual: '감사 세 가지 기록하기',
      godChild: '아침에 조용히 하루의 방향 정하기',
      husband: '저녁 한 번은 휴대전화 없이 대화하기',
      father: '주말 산책 함께하기',
      pastor: '모임의 한 사람에게 먼저 안부 묻기',
      son: '이번 주 이 역할에서 가장 중요한 일',
      coworker: '준비물 진행 상황 확인하기'
    };
  });

  // Date-specific Notes Map
  const [notesByDate, setNotesByDate] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('planbae_notes_by_date');
    if (saved) return JSON.parse(saved);
    return { '2026-11-17': '' };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // UI Interaction States
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [showTaskHelp, setShowTaskHelp] = useState(false);
  const [showScheduleHelp, setShowScheduleHelp] = useState(false);
  const [showCompassHelp, setShowCompassHelp] = useState(false);
  
  const [quickInput, setQuickInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto Apple Pencil Detection States
  const [showPencilBar, setShowPencilBar] = useState(false);
  const [penColor, setPenColor] = useState('#355E3B'); // Default Pen Color matched to new theme
  const [penTool, setPenTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState(2.2);
  const [canUndo, setCanUndo] = useState(false);

  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<string[]>([]);

  // Foundation & Target States
  const [mosMission, setMosMission] = useState(() => localStorage.getItem('planbae_mos_mission') || '');
  const [reviewTab, setReviewTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [monthGoal, setMonthGoal] = useState(() => localStorage.getItem('planbae_month_goal') || '');
  const [yearDirection, setYearDirection] = useState(() => localStorage.getItem('planbae_year_dir') || '');

  const formatKoreanDateHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return {
      monthDay: `${m}월 ${d}일`,
      weekday: days[dateObj.getDay()],
      dotted: `${y}. ${String(m).padStart(2, '0')}. ${String(d).padStart(2, '0')}.`,
      dayOnly: `${d}일`,
      monthOnly: `${y}년 ${m}월`
    };
  };

  const changeDateByDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + delta);
    const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    setSelectedDate(nextStr);
  };

  const getInkStorageKey = () => {
    if (view === 'daily') return `planbae_ink_daily_${selectedDate}`;
    if (view === 'monthly') return `planbae_ink_monthly_${selectedDate.slice(0, 7)}`;
    if (view === 'yearly') return `planbae_ink_yearly_${selectedDate.slice(0, 4)}`;
    return `planbae_ink_${view}`;
  };

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
    localStorage.setItem('planbae_notes_by_date', JSON.stringify(notesByDate));
  }, [notesByDate]);

  useEffect(() => {
    localStorage.setItem('planbae_compass', JSON.stringify(compassData));
  }, [compassData]);

  // Load saved full-page handwriting whenever view OR selectedDate changes
  useEffect(() => {
    const canvas = pageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const storageKey = getInkStorageKey();
    const savedDataUrl = localStorage.getItem(storageKey);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (savedDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        historyRef.current = [savedDataUrl];
        setCanUndo(false);
      };
      img.src = savedDataUrl;
    } else {
      historyRef.current = [canvas.toDataURL('image/png')];
      setCanUndo(false);
    }
  }, [view, selectedDate]);

  // Auto Apple Pencil Detection Engine
  useEffect(() => {
    const container = containerRef.current;
    const canvas = pageCanvasRef.current;
    if (!container || !canvas) return;

    const getCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startStroke = (clientX: number, clientY: number, force = 0.5) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      isDrawingRef.current = true;
      setShowPencilBar(true);

      const { x, y } = getCanvasCoords(clientX, clientY);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pressure = force > 0 ? force : 0.5;

      if (penTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 30;
      } else if (penTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.lineWidth = 18;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = isDark && penColor === '#355E3B' ? '#E5E5E5' : penColor;
        ctx.lineWidth = Math.max(1.5, penSize * (pressure * 1.8));
      }
    };

    const moveStroke = (clientX: number, clientY: number, force = 0.5) => {
      if (!isDrawingRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCanvasCoords(clientX, clientY);
      if (penTool === 'pen') {
        const pressure = force > 0 ? force : 0.5;
        ctx.lineWidth = Math.max(1.5, penSize * (pressure * 1.8));
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const endStroke = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem(getInkStorageKey(), dataUrl);

      historyRef.current.push(dataUrl);
      if (historyRef.current.length > 30) {
        historyRef.current.shift();
      }
      setCanUndo(historyRef.current.length > 1);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0] as any;
      if (touch && touch.touchType === 'stylus') {
        e.preventDefault();
        startStroke(touch.clientX, touch.clientY, touch.force);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0] as any;
      if (touch && touch.touchType === 'stylus') {
        e.preventDefault();
        moveStroke(touch.clientX, touch.clientY, touch.force);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isDrawingRef.current) endStroke();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'pen' && !isDrawingRef.current) {
        e.preventDefault();
        startStroke(e.clientX, e.clientY, e.pressure);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'pen' && isDrawingRef.current) {
        e.preventDefault();
        moveStroke(e.clientX, e.clientY, e.pressure);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'pen' && isDrawingRef.current) {
        endStroke();
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
    };
  }, [view, selectedDate, penTool, penColor, penSize, isDark]);

  const handleUndo = () => {
    if (historyRef.current.length <= 1 || !pageCanvasRef.current) return;
    
    historyRef.current.pop();
    const previousState = historyRef.current[historyRef.current.length - 1];
    setCanUndo(historyRef.current.length > 1);

    const canvas = pageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx && previousState) {
      const img = new Image();
      img.onload = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        localStorage.setItem(getInkStorageKey(), previousState);
      };
      img.src = previousState;
    }
  };

  const clearCanvas = () => {
    const canvas = pageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const emptyUrl = canvas.toDataURL('image/png');
      localStorage.setItem(getInkStorageKey(), emptyUrl);
      historyRef.current.push(emptyUrl);
      setCanUndo(historyRef.current.length > 1);
    }
  };

  // Task Management
  const handleAddQuickTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickInput.trim()) {
      const newTask = {
        id: Date.now(),
        title: quickInput.trim(),
        status: 'not_started',
        priority: 'B',
        date: selectedDate,
        qTag: 'Q2',
        track: '',
        deadline: '',
        memo: ''
      };
      setTasks([...tasks, newTask]);
      setQuickInput('');
    }
  };

  const updateTaskProperty = (taskId: number, field: string, value: any) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
  };

  const updateCompassData = (field: string, value: string) => {
    setCompassData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderStatusSymbol = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />;
      case 'postponed': return <CornerDownRight className="w-3.5 h-3.5 text-amber-600 font-bold" />;
      case 'cancelled': return <X className="w-3.5 h-3.5 text-rose-500 font-bold" />;
      case 'delegated': return <UserCheck className="w-3.5 h-3.5 text-indigo-600 font-bold" />;
      case 'in_progress': return <CircleDot className="w-3.5 h-3.5 text-blue-600 font-bold" />;
      default: return <div className="w-3.5 h-3.5 border border-stone-400 dark:border-stone-500 rounded-xs bg-white dark:bg-stone-800"></div>;
    }
  };

  const toggleTaskExpand = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const formattedCurrentTime = currentTime.toTimeString().slice(0, 5);
  const dateDisplay = formatKoreanDateHeader(selectedDate);
  const dailyTasks = tasks.filter(t => t.date === selectedDate);
  const currentDailyNote = notesByDate[selectedDate] || '';

  return (
    <div className="flex h-screen w-full overflow-hidden text-sm bg-[#FBF9F4] text-[#333333] dark:bg-[#1E1E22] dark:text-[#E0E0E0] font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-60 border-r border-[#E6E1D6] dark:border-[#3A3A40] flex flex-col justify-between p-4 shrink-0 z-30 bg-[#FBF9F4] dark:bg-[#1E1E22]">
        <div>
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="w-8 h-8 rounded bg-[#355E3B] dark:bg-stone-800 text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
              EB
            </div>
            <div>
              <div onClick={() => setIsEditingName(true)} className="text-base font-bold font-serif tracking-tight cursor-pointer hover:opacity-75">
                {appName}
              </div>
              <div className="text-[10px] tracking-wider text-stone-500 uppercase font-sans">Digital Planner</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Foundation</div>
              <nav className="space-y-0.5">
                <button onClick={() => setView('mos')} className={view === 'mos' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <Target className="w-4 h-4" /><span>M/O/S</span>
                </button>
                <button onClick={() => setView('compass')} className={view === 'compass' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <Compass className="w-4 h-4" /><span>Weekly Compass</span>
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Planner</div>
              <nav className="space-y-0.5">
                <button onClick={() => setView('daily')} className={view === 'daily' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <CheckSquare className="w-4 h-4" /><span>Daily</span>
                </button>
                <button onClick={() => setView('weekly')} className={view === 'weekly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <Clock className="w-4 h-4" /><span>Weekly</span>
                </button>
                <button onClick={() => setView('monthly')} className={view === 'monthly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <CalendarIcon className="w-4 h-4" /><span>Monthly</span>
                </button>
                <button onClick={() => setView('yearly')} className={view === 'yearly' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <CalendarIcon className="w-4 h-4" /><span>Yearly</span>
                </button>
              </nav>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Workspace</div>
              <nav className="space-y-0.5">
                <button onClick={() => setView('projects')} className={view === 'projects' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <FolderKanban className="w-4 h-4" /><span>Projects</span>
                </button>
                <button onClick={() => setView('delegated')} className={view === 'delegated' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <Users className="w-4 h-4" /><span>Delegation</span>
                </button>
                <button onClick={() => setView('review')} className={view === 'review' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <FileText className="w-4 h-4" /><span>Review</span>
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
              <button onClick={() => setIsDark(false)} className={!isDark ? 'p-1.5 rounded bg-white text-stone-900 shadow-xs' : 'p-1.5 rounded text-stone-500'} title="종이 모드"><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={() => setIsDark(true)} className={isDark ? 'p-1.5 rounded bg-[#26262B] text-stone-100 shadow-xs' : 'p-1.5 rounded text-stone-500'} title="잉크 다크 모드"><Moon className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="text-[11px] text-[#355E3B] dark:text-[#A3C2B0] px-2 flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5" /><span>동기화 완료</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-14 border-b border-[#E6E1D6] dark:border-[#3A3A40] flex items-center justify-between px-6 shrink-0 z-30 bg-[#FBF9F4] dark:bg-[#1E1E22]">
          <div className="flex items-center space-x-3 text-xs tracking-wider text-stone-600 font-sans uppercase">
            <div className="flex items-center space-x-2">
              <span className="opacity-70">PLANNER</span><span className="opacity-40">/</span><span>{view}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPencilBar(!showPencilBar)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${showPencilBar ? 'bg-[#355E3B] text-white border-[#355E3B]' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'}`}
              title="Apple Pencil 툴바"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
            <button className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"><Search className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Auto-Revealed Apple Pencil Toolbar */}
        {showPencilBar && (
          <div className="absolute top-14 left-0 right-0 bg-[#F6F3EB] dark:bg-[#26262B] border-b border-[#E6E1D6] dark:border-[#3A3A40] px-6 py-2 flex flex-wrap items-center justify-between gap-2 z-40 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#355E3B] dark:text-[#A3C2B0] mr-1">Apple Pencil 자동 인식:</span>
              <button onClick={() => setPenTool('pen')} className={penTool === 'pen' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-[#355E3B] dark:text-white' : 'p-1.5 text-stone-500'}><PenTool className="w-4 h-4" /></button>
              <button onClick={() => setPenTool('highlighter')} className={penTool === 'highlighter' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-amber-500' : 'p-1.5 text-stone-500'}><Highlighter className="w-4 h-4" /></button>
              <button onClick={() => setPenTool('eraser')} className={penTool === 'eraser' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-rose-500' : 'p-1.5 text-stone-500'}><Eraser className="w-4 h-4" /></button>
              <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1"></div>
              {[
                { name: '포레스트 그린', hex: '#355E3B' },
                { name: '세피아', hex: '#5C4033' },
                { name: '레드', hex: '#C24B40' },
                { name: '그레이', hex: '#6B7280' }
              ].map(c => (
                <button key={c.hex} onClick={() => { setPenTool('pen'); setPenColor(c.hex); }} className={`w-4 h-4 rounded-full border ${penColor === c.hex && penTool === 'pen' ? 'ring-2 ring-offset-1 ring-stone-400 scale-110' : 'border-stone-300'}`} style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handleUndo} disabled={!canUndo} className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] border ${canUndo ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600' : 'text-stone-300 dark:text-stone-600 border-transparent cursor-not-allowed'}`}>
                <Undo2 className="w-3.5 h-3.5" /><span>되돌리기</span>
              </button>
              <button onClick={clearCanvas} className="flex items-center space-x-1 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded">
                <Trash2 className="w-3.5 h-3.5" /><span>페이지 지우기</span>
              </button>
              <button onClick={() => setShowPencilBar(false)} className="p-1 text-stone-400 hover:text-stone-700 ml-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Scrollable Content Container */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="relative min-h-[1400px] p-8">

            {/* PASSIVE INK LAYER */}
            <canvas ref={pageCanvasRef} width={1600} height={2200} style={{ pointerEvents: 'none' }} className="absolute inset-0 w-full h-full z-20" />

            {/* 1. DAILY VIEW */}
            {view === 'daily' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-400 mb-1">{dateDisplay.monthOnly}</div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-serif font-bold tracking-tight">{dateDisplay.dayOnly}</span>
                      <span className="text-sm font-normal text-stone-500 font-sans">{dateDisplay.weekday}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-2 uppercase tracking-widest opacity-60">321ST DAY · 44 LEFT · WEEK 47</div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-right text-stone-500 dark:text-stone-400 mb-4 font-serif leading-relaxed italic">
                      여호와를 의지하는 자는 시온 산이 흔들리지 아니하고 영원히 있음 같도다<br/>
                      산들이 예루살렘을 두름과 같이 여호와께서 그의 백성을 지금부터 영원까지<br/>
                      두르시리로다 - 시편 125:1-2
                    </div>
                    <div className="flex items-center space-x-2 bg-[#ECE7DD] dark:bg-stone-800 rounded-md p-0.5 text-xs">
                      <button onClick={() => changeDateByDays(-1)} className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedDate('2026-11-17'); setCurrentTime(new Date()); }} className="px-3 py-1 font-medium bg-[#355E3B] text-white rounded">오늘</button>
                      <button onClick={() => changeDateByDays(1)} className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                      <button className="p-1.5 text-stone-600 dark:text-stone-300 border-l border-stone-300 dark:border-stone-700 pl-2"><CalendarIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Tasks & Notes */}
                  <div className="space-y-6">
                    <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-3 relative">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest block mb-0.5">01 · TASKS</span>
                          <h2 className="text-base font-bold font-serif">할일</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setShowTaskHelp(!showTaskHelp)} className="text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0]"><HelpCircle className="w-4 h-4" /></button>
                          <button className="text-stone-400 hover:text-stone-600"><ListTodo className="w-4 h-4" /></button>
                          <button className="p-1 rounded bg-[#355E3B] text-white hover:bg-[#2A4B2F]"><Plus className="w-3.5 h-3.5" /></button>
                        </div>

                        {/* TASK HELP POPOVER */}
                        {showTaskHelp && (
                          <div className="absolute top-12 left-0 z-50 w-80 bg-white dark:bg-[#26262B] border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xl p-4 text-xs text-left">
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">할 일을 기록하고 우선순위와 중요도를 정해 하루의 실행을 관리합니다.</p>
                              <button onClick={() => setShowTaskHelp(false)} className="text-stone-400 hover:text-stone-600 ml-2 shrink-0"><X className="w-4 h-4" /></button>
                            </div>
                            
                            <h3 className="font-bold text-[#355E3B] dark:text-[#A3C2B0] mb-2">어떻게 사용하나요</h3>
                            <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                              <li>1. <span className="font-semibold">+</span> 업무 추가로 제목을 적습니다. 기존 제목은 한 번 누르면 선택, 다시 누르면 편집입니다.</li>
                              <li>2. 선택하면 우선순위 A/B/C, Q 분류, 트랙, 마감일, 메모 속성을 조작할 수 있습니다.</li>
                              <li>3. Q1은 중요하고 긴급, Q2는 중요하고 여유 있음, Q3는 긴급하지만 덜 중요한 일입니다.</li>
                              <li>4. 체크칸을 눌러 완료·진행·연기·취소·위임 등 상태를 변경합니다.</li>
                            </ul>
                            <h3 className="font-bold text-[#355E3B] dark:text-[#A3C2B0] mt-4 mb-2">단축키와 유용한 팁</h3>
                            <ul className="space-y-1.5 text-stone-600 dark:text-stone-400 list-disc list-inside">
                              <li>메모 버튼으로 세부 내용을 적고, 체크칸에서 실행 상태를 바꿔보세요.</li>
                              <li>선택 상태에서 Enter → 아래에 새 업무. 제목 편집 중 Enter → 저장 후 선택 상태로 돌아옵니다.</li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <input 
                          type="text" 
                          placeholder={`${dateDisplay.monthDay} 할 일 적기... (Enter로 추가)`}
                          value={quickInput}
                          onChange={(e) => setQuickInput(e.target.value)}
                          onKeyDown={handleAddQuickTask}
                          className="flex-1 border border-stone-300 dark:border-stone-700 rounded px-3 py-1.5 bg-[#FBF9F4] dark:bg-stone-800 text-xs outline-none focus:border-[#355E3B]"
                        />
                      </div>

                      <div className="space-y-4">
                        {['A', 'B', 'C'].map((p) => {
                          const tasksInPriority = dailyTasks.filter(t => t.priority === p);
                          if (tasksInPriority.length === 0 && p !== 'A') return null;

                          return (
                            <div key={p} className="border-t border-stone-100 dark:border-stone-800 pt-3">
                              <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
                                <span className="bg-[#E8F0EA] dark:bg-stone-700 text-[#355E3B] dark:text-stone-300 px-1.5 py-0.5 rounded font-serif text-[10px]">{p}</span>
                                <span className="flex-1 ml-2">
                                  {p === 'A' ? '반드시 오늘 해야 할 일' : p === 'B' ? '하면 좋은 일' : '여유가 생기면'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {tasksInPriority.map(task => (
                                  <div key={task.id} className="relative flex flex-col border-b border-dashed border-stone-200 dark:border-stone-800 text-xs transition-colors">
                                    <div 
                                      className={`flex items-center justify-between py-1.5 cursor-pointer rounded px-1 -mx-1 ${expandedTaskId === task.id ? 'bg-[#E8F0EA] dark:bg-stone-800/80' : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'}`}
                                      onClick={() => toggleTaskExpand(task.id)}
                                    >
                                      <div className="flex items-center space-x-2.5">
                                        <button onClick={(e) => { e.stopPropagation(); setShowStatusMenu(showStatusMenu === task.id ? null : task.id); }}>
                                          {renderStatusSymbol(task.status)}
                                        </button>
                                        <span className={task.status === 'completed' || task.status === 'cancelled' ? 'line-through text-stone-400' : 'font-medium'}>
                                          {task.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1.5">
                                        {task.memo && <AlignLeft className="w-3 h-3 text-stone-400" />}
                                        {task.qTag && <span className="text-[9px] font-bold text-[#C24B40] dark:text-rose-400">{task.qTag}</span>}
                                        {task.track && <span className="text-[9px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 rounded">{task.track}</span>}
                                      </div>
                                    </div>

                                    {/* Inline Editor */}
                                    {expandedTaskId === task.id && (
                                      <div className="ml-6 my-2 p-3 bg-white dark:bg-[#1E1E22] rounded border border-[#E6E1D6] dark:border-stone-700 shadow-sm space-y-3" onClick={e => e.stopPropagation()}>
                                        <div className="flex flex-wrap items-center gap-3">
                                          <div className="flex bg-stone-100 dark:bg-stone-800 rounded p-0.5 border border-stone-200 dark:border-stone-700">
                                            {['A', 'B', 'C'].map(pri => (
                                              <button 
                                                key={pri} 
                                                onClick={() => updateTaskProperty(task.id, 'priority', pri)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.priority === pri ? 'bg-white dark:bg-stone-600 text-[#355E3B] shadow-xs' : 'text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                              >{pri}</button>
                                            ))}
                                          </div>
                                          <div className="flex bg-stone-100 dark:bg-stone-800 rounded p-0.5 border border-stone-200 dark:border-stone-700">
                                            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                                              <button 
                                                key={q} 
                                                onClick={() => updateTaskProperty(task.id, 'qTag', q)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.qTag === q ? 'bg-[#355E3B] text-white shadow-xs' : 'text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700'}`}
                                              >{q}</button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <input 
                                            type="text" placeholder="트랙 (예: Pastoral)" value={task.track || ''} 
                                            onChange={(e) => updateTaskProperty(task.id, 'track', e.target.value)}
                                            className="flex-1 bg-[#FBF9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-[11px] outline-none focus:border-[#355E3B]"
                                          />
                                          <input 
                                            type="date" value={task.deadline || ''} 
                                            onChange={(e) => updateTaskProperty(task.id, 'deadline', e.target.value)}
                                            className="w-28 bg-[#FBF9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-2 py-1 text-[11px] outline-none focus:border-[#355E3B]"
                                          />
                                        </div>
                                        <textarea 
                                          rows={2} placeholder="상세 메모나 링크를 적어두세요..." value={task.memo || ''}
                                          onChange={(e) => updateTaskProperty(task.id, 'memo', e.target.value)}
                                          className="w-full bg-[#FBF9F4] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded p-2 text-[11px] outline-none resize-none focus:border-[#355E3B]"
                                        />
                                      </div>
                                    )}

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
                                <div className="h-6 border-b border-dashed border-stone-200/70 dark:border-stone-800/70"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest block mb-0.5">03 · NOTES</span>
                          <h2 className="text-base font-bold font-serif">노트</h2>
                        </div>
                        <button className="text-stone-400 hover:text-stone-600"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <textarea 
                        rows={8}
                        value={currentDailyNote}
                        onChange={(e) => setNotesByDate({ ...notesByDate, [selectedDate]: e.target.value })}
                        placeholder="오늘 남겨두고 싶은 생각, 기도, 메모..."
                        className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  {/* Right: Schedule with Help Popover */}
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs flex flex-col h-[1260px]">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-3 relative">
                      <div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest block mb-0.5">02 · SCHEDULE</span>
                        <h2 className="text-base font-bold font-serif">일정</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setShowScheduleHelp(!showScheduleHelp)} className="text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0]"><HelpCircle className="w-4 h-4" /></button>
                        <button className="text-stone-400 hover:text-stone-600"><span className="text-xs font-bold font-mono">24</span></button>
                        <button className="p-1 rounded bg-[#355E3B] text-white hover:bg-[#2A4B2F]"><Plus className="w-3.5 h-3.5" /></button>
                      </div>

                      {showScheduleHelp && (
                        <div className="absolute top-12 right-0 z-50 w-80 bg-white dark:bg-[#26262B] border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xl p-4 text-xs text-left">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">하루의 시간과 약속을 살피고 필요한 일을 일정으로 배치합니다.</p>
                            <button onClick={() => setShowScheduleHelp(false)} className="text-stone-400 hover:text-stone-600 ml-2 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                          <h3 className="font-bold text-[#355E3B] dark:text-[#A3C2B0] mb-2">어떻게 사용하나요</h3>
                          <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                            <li>1. <span className="font-semibold">+</span> 시간 영역에서 일정을 만듭니다.</li>
                            <li>2. 시작·종료 시각을, 하루에 걸친 일은 종일을 선택합니다.</li>
                            <li>3. 제목·날짜·시간·메모·반복을 수정합니다.</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="relative flex-1">
                      <div className="text-[10px] text-stone-500 mb-2">{dateDisplay.monthDay} {dateDisplay.weekday}</div>
                      {selectedDate === '2026-11-17' && (
                        <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: ((currentMinutes / 1440) * 1150) + 'px' }}>
                          <span className="bg-[#C24B40] text-white text-[9px] font-mono px-1 rounded font-bold mr-1">{formattedCurrentTime}</span>
                          <div className="flex-1 h-[1px] bg-[#C24B40]"></div>
                        </div>
                      )}
                      <div className="relative" style={{ height: '1150px' }}>
                        {Array.from({ length: 25 }, (_, i) => (
                          <div key={i} className="absolute w-full flex items-start border-t border-stone-200 dark:border-stone-800/80" style={{ top: ((i / 24) * 1150) + 'px', height: '47px' }}>
                            <span className="w-12 text-[10px] text-stone-500 font-mono -mt-2 bg-transparent select-none">{String(i).padStart(2, '0')}:00</span>
                          </div>
                        ))}
                        {schedule.filter(evt => evt.date === selectedDate).map(evt => {
                          const [startH, startM] = evt.start.split(':').map(Number);
                          const [endH, endM] = evt.end.split(':').map(Number);
                          const startMins = startH * 60 + startM;
                          const endMins = endH * 60 + endM;
                          const top = (startMins / 1440) * 1150;
                          const height = ((endMins - startMins) / 1440) * 1150;
                          return (
                            <div key={evt.id} className="absolute left-14 right-2 bg-stone-100 dark:bg-stone-800 border-l-2 border-[#355E3B] p-2 rounded text-xs shadow-xs opacity-80" style={{ top: top + 'px', height: Math.max(height, 28) + 'px' }}>
                              <div className="font-semibold text-stone-800 dark:text-stone-200 flex justify-between">
                                <span>{evt.title}</span>
                                <span className="text-[10px] text-stone-500 font-mono">{evt.start} - {evt.end}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WEEKLY COMPASS VIEW (Perfectly matched to the screenshot) */}
            {view === 'compass' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4 relative">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-4xl font-serif font-bold tracking-tight">47주차</h1>
                      <button onClick={() => setShowCompassHelp(!showCompassHelp)} className="text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0]">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-stone-500 mt-2 font-medium">11월 15일 - 11월 21일</div>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-[#ECE7DD] dark:bg-stone-800 rounded-md p-0.5 text-xs">
                    <button className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="px-4 py-1 font-medium bg-[#355E3B] text-white rounded">이번 주</button>
                    <button className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                    <button className="p-1.5 text-stone-600 dark:text-stone-300 border-l border-stone-300 dark:border-stone-700 pl-2"><CalendarIcon className="w-4 h-4" /></button>
                  </div>

                  {/* COMPASS HELP POPOVER */}
                  {showCompassHelp && (
                    <div className="absolute top-14 left-32 z-50 w-[360px] bg-white dark:bg-[#26262B] border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xl p-5 text-xs text-left">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">무엇을 할지와 함께 어떤 역할과 관계에 충실할지 돌아봅니다. 이번 주 어떤 사람으로 살아갈지 정하는 나침반입니다.</p>
                        <button onClick={() => setShowCompassHelp(false)} className="text-stone-400 hover:text-stone-600 ml-2 shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                      
                      <h3 className="font-bold text-[#355E3B] dark:text-[#A3C2B0] mb-2 mt-4">어떻게 사용하나요</h3>
                      <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                        <li>1. 화면의 컴파스 책갈피 버튼으로 이번 주 내용을 열고 닫습니다.</li>
                        <li>2. 책갈피의 WEEKLY COMPASS 제목을 누르면 작성 화면으로 이동합니다.</li>
                        <li>3. 자기계발 영역과 역할별 Big Rocks에 이번 주의 작은 실천을 적습니다. 입력은 자동 저장됩니다.</li>
                        <li>4. 이전 기록이 있는 항목은 지난주 복사로 이어갈 수 있습니다.</li>
                        <li>5. Weekly Planner의 핵심에는 이번 주 무엇을 이루고 실행할지 따로 정리합니다.</li>
                      </ul>
                      <h3 className="font-bold text-[#355E3B] dark:text-[#A3C2B0] mt-4 mb-2">단축키와 유용한 팁</h3>
                      <ul className="space-y-1.5 text-stone-600 dark:text-stone-400 list-disc list-inside">
                        <li>책갈피는 빠르게 읽는 공간입니다. 수정은 Weekly Compass 화면에서 합니다.</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg overflow-hidden bg-white/80 dark:bg-[#26262B] shadow-xs">
                  
                  {/* Left Column: SHARPEN THE SAW */}
                  <div className="border-r border-[#E6E1D6] dark:border-[#3A3A40]">
                    <div className="bg-[#9B7B6A] dark:bg-[#685348] text-white p-3.5 pl-5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest block mb-1 opacity-80">01 · SHARPEN THE SAW</span>
                      <h2 className="text-sm font-bold font-serif">자기계발</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {[
                        { label: '신체적', key: 'physical' },
                        { label: '사회적 / 감정적', key: 'social' },
                        { label: '정신적', key: 'mental' },
                        { label: '영적', key: 'spiritual' }
                      ].map((item) => (
                        <div key={item.key} className="group border-b border-stone-100 dark:border-stone-800 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.label}</span>
                            <button className="text-[10px] text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0] flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="w-3 h-3"/><span>지난주 복사</span>
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={(compassData as any)[item.key]} 
                            onChange={(e) => updateCompassData(item.key, e.target.value)}
                            className="w-full bg-transparent text-xs text-stone-600 dark:text-stone-400 outline-none"
                            placeholder="이번 주 실천할 일..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: ROLES & BIG ROCKS */}
                  <div>
                    <div className="bg-[#9B7B6A] dark:bg-[#685348] text-white p-3.5 pl-5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest block mb-1 opacity-80">02 · ROLES & BIG ROCKS</span>
                      <h2 className="text-sm font-bold font-serif">역할별 Big Rocks</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {[
                        { label: '하나님의 자녀', key: 'godChild' },
                        { label: '남편', key: 'husband' },
                        { label: '아빠', key: 'father' },
                        { label: '목사', key: 'pastor' },
                        { label: '아들', key: 'son' },
                        { label: '동역자', key: 'coworker' }
                      ].map((item) => (
                        <div key={item.key} className="group border-b border-stone-100 dark:border-stone-800 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.label}</span>
                            <button className="text-[10px] text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0] flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="w-3 h-3"/><span>지난주 복사</span>
                            </button>
                          </div>
                          <input 
                            type="text" 
                            value={(compassData as any)[item.key]} 
                            onChange={(e) => updateCompassData(item.key, e.target.value)}
                            className="w-full bg-transparent text-xs text-stone-600 dark:text-stone-400 outline-none"
                            placeholder="가장 중요한 일..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
                
                {/* Footer Badge */}
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">M/O/S 계획 기준</span>
                  <span className="text-[10px] font-bold bg-[#355E3B] text-white px-2 py-0.5 rounded">M/O/S v1.0</span>
                </div>
              </div>
            )}
            
            {/* The rest of the views (Projects, Delegated, etc.) omitted for brevity */}
            {view === 'projects' && (<div className="max-w-5xl mx-auto space-y-6 relative z-10"><h1 className="text-3xl font-serif font-bold">프로젝트</h1></div>)}
          </div>
        </div>
      </main>
    </div>
  );
}
