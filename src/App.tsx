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
  Copy,
  Info,
  AlignJustify,
  LayoutGrid,
  Hash,
  CalendarDays,
  User
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review' | 'projects' | 'delegated' | 'search'>('daily');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-11-17');

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '영사', status: 'not_started', priority: 'B', date: '2026-11-17', qTag: 'Q2', track: 'Personal', deadline: '2026-11-23', memo: '' },
      { id: 2, title: '모임 후 감사 메시지 전하기', status: 'not_started', priority: 'B', date: '2026-11-17', qTag: 'Q2', track: 'Pastoral', deadline: '', memo: '참석자 리스트 확인' }
    ];
  });

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

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('planbae_schedule');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '하루 종일 일정 예시', start: '00:00', end: '23:59', tag: '종일', date: '2026-11-17' },
      { id: 2, title: '40일 철야', start: '20:00', end: '22:40', tag: 'Pastoral', date: '2026-11-08' }
    ];
  });

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

  const [notesByDate, setNotesByDate] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('planbae_notes_by_date');
    if (saved) return JSON.parse(saved);
    return { '2026-11-17': '' };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // UI Interaction States
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  
  // Quick Input & Inline Editor States
  const [isQuickInputActive, setIsQuickInputActive] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState('');
  const [quickQTag, setQuickQTag] = useState('');
  const [quickTrack, setQuickTrack] = useState('');
  const [quickDeadline, setQuickDeadline] = useState('');
  const [activeQuickDropdown, setActiveQuickDropdown] = useState<'priority' | 'qTag' | 'track' | null>(null);
  
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'priority' | 'qTag' | 'track' | null>(null);
  
  const [showTaskHelp, setShowTaskHelp] = useState(false);
  const [showScheduleHelp, setShowScheduleHelp] = useState(false);
  const [showCompassHelp, setShowCompassHelp] = useState(false);
  
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto Apple Pencil Detection States
  const [showPencilBar, setShowPencilBar] = useState(false);
  const [penColor, setPenColor] = useState('#355E3B');
  const [penTool, setPenTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState(2.2);
  const [pencilOnly, setPencilOnly] = useState(true);
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
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => localStorage.setItem('planbae_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('planbae_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('planbae_schedule', JSON.stringify(schedule)), [schedule]);
  useEffect(() => localStorage.setItem('planbae_compass', JSON.stringify(compassData)), [compassData]);
  useEffect(() => localStorage.setItem('planbae_notes_by_date', JSON.stringify(notesByDate)), [notesByDate]);
  useEffect(() => localStorage.setItem('planbae_mos_mission', mosMission), [mosMission]);
  useEffect(() => localStorage.setItem('planbae_month_goal', monthGoal), [monthGoal]);
  useEffect(() => localStorage.setItem('planbae_year_dir', yearDirection), [yearDirection]);

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
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
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
      if (historyRef.current.length > 30) historyRef.current.shift();
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

    const onTouchEnd = () => { if (isDrawingRef.current) endStroke(); };

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
      if (e.pointerType === 'pen' && isDrawingRef.current) endStroke();
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

  // Click outside handler to close editors
  const handleGlobalClick = () => {
    setIsQuickInputActive(false);
    setEditingTaskId(null);
    setActiveDropdown(null);
    setActiveQuickDropdown(null);
  };

  // Quick Inline Task Adding
  const submitQuickTask = () => {
    if (quickInput.trim() === '') return;
    const newTask = {
      id: Date.now(),
      title: quickInput.trim(),
      status: 'not_started',
      priority: quickPriority,
      date: selectedDate,
      qTag: quickQTag,
      track: quickTrack,
      deadline: quickDeadline,
      memo: ''
    };
    setTasks([newTask, ...tasks]);
    setQuickInput('');
    setQuickPriority('');
    setQuickQTag('');
    setQuickTrack('');
    setQuickDeadline('');
    setActiveQuickDropdown(null);
  };

  const handleQuickInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitQuickTask();
    }
  };

  // Existing Task Management
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

  const updateTaskProperty = (taskId: number, field: string, value: any) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    if (field !== 'title' && field !== 'memo' && field !== 'deadline') {
      setActiveDropdown(null);
    }
  };
  
  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setShowStatusMenu(null);
  };

  const updateCompassData = (field: string, value: string) => {
    setCompassData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderStatusSymbol = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-emerald-600 font-bold" />;
      case 'postponed': return <CornerDownRight className="w-4 h-4 text-amber-600 font-bold" />;
      case 'cancelled': return <X className="w-4 h-4 text-rose-500 font-bold" />;
      case 'delegated': return <UserCheck className="w-4 h-4 text-indigo-600 font-bold" />;
      case 'in_progress': return <CircleDot className="w-4 h-4 text-blue-600 font-bold" />;
      default: return <div className="w-4 h-4 border-2 border-stone-400 dark:border-stone-500 rounded-sm bg-transparent"></div>;
    }
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const formattedCurrentTime = currentTime.toTimeString().slice(0, 5);
  const dateDisplay = formatKoreanDateHeader(selectedDate);
  const dailyTasks = tasks.filter(t => t.date === selectedDate);
  const currentDailyNote = notesByDate[selectedDate] || '';

  // Class strings for inline editing UI to perfectly match the screenshot
  const activeEditorContainerClass = "bg-[#E8EEF2] dark:bg-[#252A2E] rounded-xl shadow-sm border border-transparent";
  const inactiveTaskContainerClass = "hover:bg-stone-50 dark:hover:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800";
  const propertyBtnClass = "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-600 font-medium transition-colors";

  return (
    <div className="flex h-screen w-full overflow-hidden text-sm bg-[#FBF9F4] text-[#333333] dark:bg-[#1E1E22] dark:text-[#E0E0E0] font-sans antialiased" onClick={handleGlobalClick}>
      
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
                <button onClick={() => setView('search')} className={view === 'search' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <SearchCode className="w-4 h-4" /><span>노트 검색</span>
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
              <button onClick={(e) => { e.stopPropagation(); setIsDark(false); }} className={!isDark ? 'p-1.5 rounded bg-white text-stone-900 shadow-xs' : 'p-1.5 rounded text-stone-500'} title="종이 모드"><Sun className="w-3.5 h-3.5" /></button>
              <button onClick={(e) => { e.stopPropagation(); setIsDark(true); }} className={isDark ? 'p-1.5 rounded bg-[#26262B] text-stone-100 shadow-xs' : 'p-1.5 rounded text-stone-500'} title="잉크 다크 모드"><Moon className="w-3.5 h-3.5" /></button>
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
              onClick={(e) => { e.stopPropagation(); setShowPencilBar(!showPencilBar); }}
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
              <button onClick={(e) => { e.stopPropagation(); setPenTool('pen'); }} className={penTool === 'pen' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-[#355E3B] dark:text-white' : 'p-1.5 text-stone-500'}><PenTool className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setPenTool('highlighter'); }} className={penTool === 'highlighter' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-amber-500' : 'p-1.5 text-stone-500'}><Highlighter className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setPenTool('eraser'); }} className={penTool === 'eraser' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-rose-500' : 'p-1.5 text-stone-500'}><Eraser className="w-4 h-4" /></button>
              <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1"></div>
              {[
                { name: '포레스트 그린', hex: '#355E3B' },
                { name: '세피아', hex: '#5C4033' },
                { name: '레드', hex: '#C24B40' },
                { name: '그레이', hex: '#6B7280' }
              ].map(c => (
                <button key={c.hex} onClick={(e) => { e.stopPropagation(); setPenTool('pen'); setPenColor(c.hex); }} className={`w-4 h-4 rounded-full border ${penColor === c.hex && penTool === 'pen' ? 'ring-2 ring-offset-1 ring-stone-400 scale-110' : 'border-stone-300'}`} style={{ backgroundColor: c.hex }} title={c.name} />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={(e) => { e.stopPropagation(); handleUndo(); }} disabled={!canUndo} className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] border ${canUndo ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600' : 'text-stone-300 dark:text-stone-600 border-transparent cursor-not-allowed'}`}>
                <Undo2 className="w-3.5 h-3.5" /><span>되돌리기</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); clearCanvas(); }} className="flex items-center space-x-1 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded">
                <Trash2 className="w-3.5 h-3.5" /><span>페이지 지우기</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowPencilBar(false); }} className="p-1 text-stone-400 hover:text-stone-700 ml-2"><X className="w-4 h-4" /></button>
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
                      <button onClick={(e) => { e.stopPropagation(); changeDateByDays(-1); }} className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedDate('2026-11-17'); setCurrentTime(new Date()); }} className="px-3 py-1 font-medium bg-[#355E3B] text-white rounded">오늘</button>
                      <button onClick={(e) => { e.stopPropagation(); changeDateByDays(1); }} className="p-1.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded"><ChevronRight className="w-4 h-4" /></button>
                      <button className="p-1.5 text-stone-600 dark:text-stone-300 border-l border-stone-300 dark:border-stone-700 pl-2"><CalendarIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Tasks & Notes */}
                  <div className="space-y-6">
                    
                    {/* TASKS COMPONENT */}
                    <div className="bg-[#FAF9F6] dark:bg-[#1E1E22] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#355E3B] text-white flex items-center justify-center shadow-xs">
                            <ListTodo className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-0.5">01 · TASKS</span>
                            <h2 className="text-xl font-bold">할일</h2>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={(e) => { e.stopPropagation(); setShowTaskHelp(!showTaskHelp); }} className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#355E3B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                            <HelpCircle className="w-5 h-5" />
                          </button>
                          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                            <AlignJustify className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setIsQuickInputActive(true); setEditingTaskId(null); setActiveDropdown(null); }} className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#355E3B] text-white shadow-md hover:bg-[#2A4B2F] transition-colors">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {showTaskHelp && (
                        <div className="mb-4 bg-white dark:bg-[#26262B] border border-[#E6E1D6] dark:border-stone-700 rounded-lg p-4 text-xs text-left shadow-xs">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">할 일을 기록하고 우선순위와 중요도를 정해 하루의 실행을 관리합니다.</p>
                            <button onClick={(e) => { e.stopPropagation(); setShowTaskHelp(false); }} className="text-stone-400 hover:text-stone-600 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                          <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                            <li>1. <span className="font-semibold">+</span> 업무 추가로 제목을 적습니다. 기존 제목은 한 번 누르면 선택, 다시 누르면 편집입니다.</li>
                            <li>2. 선택하면 우선순위, Q 분류, 트랙, 마감일 속성을 조작할 수 있습니다.</li>
                            <li>3. 체크칸을 눌러 완료·진행·연기·취소·위임 등 상태를 변경합니다.</li>
                          </ul>
                        </div>
                      )}

                      {/* QUICK ADD INLINE EDITOR (Matches Screenshot Layout) */}
                      <div 
                        className={`relative flex flex-col mb-6 transition-all ${isQuickInputActive ? activeEditorContainerClass : 'border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-[#262A2E] hover:border-[#355E3B]'}`}
                        onClick={(e) => { e.stopPropagation(); setIsQuickInputActive(true); setEditingTaskId(null); setActiveDropdown(null); }}
                      >
                        <div className="flex items-center justify-between py-3 px-3">
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-4 h-4 border-2 border-stone-400 dark:border-stone-500 rounded-sm shrink-0"></div>
                            <input 
                              type="text" 
                              placeholder={isQuickInputActive ? '' : `${dateDisplay.monthDay} 할 일 적기... (Enter로 추가)`}
                              value={quickInput}
                              onChange={(e) => setQuickInput(e.target.value)}
                              onKeyDown={handleQuickInputKeyDown}
                              className={`w-full bg-transparent text-base font-medium outline-none ${isQuickInputActive ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'}`}
                              autoFocus={isQuickInputActive}
                            />
                          </div>
                          {isQuickInputActive && (
                            <div className="flex items-center space-x-3 text-stone-500 shrink-0">
                              <FileText className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                              <Info className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                            </div>
                          )}
                        </div>

                        {/* Inline Properties Toolbar for Quick Add */}
                        {isQuickInputActive && (
                          <div className="px-3 pb-3 relative">
                            <div className="flex flex-wrap gap-2 text-xs pl-7">
                              {/* 순위 (Priority) */}
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveQuickDropdown(activeQuickDropdown === 'priority' ? null : 'priority'); }} className={propertyBtnClass}>
                                  <AlignLeft className="w-3.5 h-3.5" /><span>{quickPriority || '순위'}</span>
                                </button>
                                {activeQuickDropdown === 'priority' && (
                                  <div className="absolute top-10 left-0 w-32 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                    {[{id: '', label: '미분류'}, {id: 'A', label: 'A', color: '#F87171'}, {id: 'B', label: 'B', color: '#FBBF24'}, {id: 'C', label: 'C', color: '#60A5FA'}].map(opt => (
                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); setQuickPriority(opt.id); setActiveQuickDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                        <div className="flex items-center space-x-2">
                                          {opt.id !== '' && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }}></span>}
                                          <span>{opt.label}</span>
                                        </div>
                                        {quickPriority === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* 분류 (QTag) */}
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveQuickDropdown(activeQuickDropdown === 'qTag' ? null : 'qTag'); }} className={propertyBtnClass}>
                                  <LayoutGrid className="w-3.5 h-3.5" /><span>{quickQTag || '분류'}</span>
                                </button>
                                {activeQuickDropdown === 'qTag' && (
                                  <div className="absolute top-10 left-0 w-32 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                    {[{id: '', label: '미분류'}, {id: 'Q1', label: 'Q1'}, {id: 'Q2', label: 'Q2'}, {id: 'Q3', label: 'Q3'}, {id: 'Q4', label: 'Q4'}].map(opt => (
                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); setQuickQTag(opt.id); setActiveQuickDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                        <div className="flex items-center space-x-2">
                                          {opt.id !== '' && <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />}
                                          <span>{opt.label}</span>
                                        </div>
                                        {quickQTag === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* 트랙 (Track) */}
                              <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setActiveQuickDropdown(activeQuickDropdown === 'track' ? null : 'track'); }} className={propertyBtnClass}>
                                  <Hash className="w-3.5 h-3.5" /><span>{quickTrack || '트랙'}</span>
                                </button>
                                {activeQuickDropdown === 'track' && (
                                  <div className="absolute top-10 left-0 w-36 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                    {[{id: '', label: '미지정'}, {id: 'Personal', label: 'Personal'}, {id: 'Pastoral', label: 'Pastoral'}].map(opt => (
                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); setQuickTrack(opt.id); setActiveQuickDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                        <div className="flex items-center space-x-2">
                                          {opt.id === 'Personal' && <User className="w-3.5 h-3.5 text-blue-400" />}
                                          {opt.id === 'Pastoral' && <FolderKanban className="w-3.5 h-3.5 text-amber-600" />}
                                          <span>{opt.label}</span>
                                        </div>
                                        {quickTrack === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* 마감일 (Deadline) */}
                              <div className="relative flex items-center">
                                <label className={propertyBtnClass + " cursor-pointer"}>
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span>{quickDeadline || '마감일'}</span>
                                  <input type="date" className="absolute opacity-0 w-0 h-0" value={quickDeadline} onChange={(e) => setQuickDeadline(e.target.value)} />
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
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
                                {tasksInPriority.map(task => {
                                  const isEditing = editingTaskId === task.id;
                                  
                                  return (
                                    <div key={task.id} className="relative flex flex-col transition-colors">
                                      
                                      {/* Task Row */}
                                      <div 
                                        title="약 0.4초 누른 뒤 끌어서 순서 변경"
                                        className={`flex flex-col transition-all cursor-pointer ${isEditing ? activeEditorContainerClass : inactiveTaskContainerClass}`}
                                        onClick={(e) => { e.stopPropagation(); if(!isEditing) { setEditingTaskId(task.id); setActiveDropdown(null); setIsQuickInputActive(false); } }}
                                      >
                                        <div className="flex items-center justify-between py-3 px-3">
                                          <div className="flex items-center space-x-3 w-full">
                                            <button onClick={(e) => { e.stopPropagation(); setShowStatusMenu(showStatusMenu === task.id ? null : task.id); }} className="shrink-0">
                                              {renderStatusSymbol(task.status)}
                                            </button>
                                            
                                            {isEditing ? (
                                              <input 
                                                type="text" 
                                                value={task.title}
                                                onChange={(e) => updateTaskProperty(task.id, 'title', e.target.value)}
                                                onKeyDown={(e) => { if(e.key === 'Enter') { setEditingTaskId(null); setActiveDropdown(null); } }}
                                                autoFocus
                                                placeholder="할 일 입력..."
                                                className="w-full bg-transparent text-base font-medium outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400"
                                              />
                                            ) : (
                                              <div className={`flex items-center space-x-2 text-base font-medium ${task.status === 'completed' ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                                                <span>{task.title}</span>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {isEditing ? (
                                            <div className="flex items-center space-x-3 text-stone-500 shrink-0">
                                              <FileText className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                                              <Info className="w-4 h-4 cursor-pointer hover:text-stone-800" />
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-2 shrink-0">
                                              {task.memo && <FileText className="w-3.5 h-3.5 text-stone-400" />}
                                            </div>
                                          )}
                                        </div>

                                        {/* Floating Properties Toolbar for Existing Task */}
                                        {isEditing && (
                                          <div className="px-3 pb-3 relative">
                                            <div className="flex flex-wrap gap-2 text-xs font-medium pl-7">
                                              {/* 순위 */}
                                              <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'priority' ? null : 'priority'); }} className={propertyBtnClass}>
                                                  <AlignLeft className="w-3.5 h-3.5" /><span>{task.priority || '순위'}</span>
                                                </button>
                                                {activeDropdown === 'priority' && (
                                                  <div className="absolute top-10 left-0 w-32 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                                    {[{id: '', label: '미분류'}, {id: 'A', label: 'A', color: '#F87171'}, {id: 'B', label: 'B', color: '#FBBF24'}, {id: 'C', label: 'C', color: '#60A5FA'}].map(opt => (
                                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'priority', opt.id); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                                        <div className="flex items-center space-x-2">
                                                          {opt.id !== '' && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }}></span>}
                                                          <span>{opt.label}</span>
                                                        </div>
                                                        {task.priority === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                                      </button>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                              
                                              {/* 분류 */}
                                              <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'qTag' ? null : 'qTag'); }} className={propertyBtnClass}>
                                                  <LayoutGrid className="w-3.5 h-3.5" /><span>{task.qTag || '분류'}</span>
                                                </button>
                                                {activeDropdown === 'qTag' && (
                                                  <div className="absolute top-10 left-0 w-32 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                                    {[{id: '', label: '미분류'}, {id: 'Q1', label: 'Q1'}, {id: 'Q2', label: 'Q2'}, {id: 'Q3', label: 'Q3'}, {id: 'Q4', label: 'Q4'}].map(opt => (
                                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'qTag', opt.id); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                                        <div className="flex items-center space-x-2">
                                                          {opt.id !== '' && <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />}
                                                          <span>{opt.label}</span>
                                                        </div>
                                                        {task.qTag === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                                      </button>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>

                                              {/* 트랙 */}
                                              <div className="relative">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'track' ? null : 'track'); }} className={propertyBtnClass}>
                                                  <Hash className="w-3.5 h-3.5" /><span>{task.track || '트랙'}</span>
                                                </button>
                                                {activeDropdown === 'track' && (
                                                  <div className="absolute top-10 left-0 w-36 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg shadow-xl p-1.5 z-40">
                                                    {[{id: '', label: '미지정'}, {id: 'Personal', label: 'Personal'}, {id: 'Pastoral', label: 'Pastoral'}].map(opt => (
                                                      <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'track', opt.id); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-stone-100 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200">
                                                        <div className="flex items-center space-x-2">
                                                          {opt.id === 'Personal' && <User className="w-3.5 h-3.5 text-blue-400" />}
                                                          {opt.id === 'Pastoral' && <FolderKanban className="w-3.5 h-3.5 text-amber-600" />}
                                                          <span>{opt.label}</span>
                                                        </div>
                                                        {task.track === opt.id && <Check className="w-3.5 h-3.5 text-[#355E3B]" />}
                                                      </button>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                              
                                              {/* 마감일 */}
                                              <div className="relative flex items-center">
                                                <label className={propertyBtnClass + " cursor-pointer"}>
                                                  <CalendarDays className="w-3.5 h-3.5" />
                                                  <span>{task.deadline || '마감일'}</span>
                                                  <input type="date" className="absolute opacity-0 w-0 h-0" value={task.deadline} onChange={(e) => updateTaskProperty(task.id, 'deadline', e.target.value)} />
                                                </label>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Property Badges (Visible when NOT editing) */}
                                        {!isEditing && (task.priority || task.qTag || task.track || task.deadline) && (
                                          <div className="pl-9 pr-3 pb-3 flex items-center space-x-1.5 -mt-1.5">
                                            {task.priority && (
                                              <span className="bg-[#F4EBE1] text-[#936B3B] dark:bg-[#4A3A22] dark:text-[#E5C992] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                                {task.priority}
                                              </span>
                                            )}
                                            {task.qTag && (
                                              <span className="bg-[#F4EBE1] text-[#936B3B] dark:bg-[#4A3A22] dark:text-[#E5C992] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                                {task.qTag}
                                              </span>
                                            )}
                                            {task.track && (
                                              <span className="text-[#5C7C9E] dark:text-[#88A4C4] flex items-center justify-center">
                                                {task.track === 'Personal' ? <User className="w-3.5 h-3.5" /> : <FolderKanban className="w-3.5 h-3.5" />}
                                              </span>
                                            )}
                                            {task.deadline && (
                                              <span className="bg-[#EAE8E3] text-[#6B6863] dark:bg-stone-700 dark:text-stone-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                {task.deadline.slice(2).replace(/-/g, '.')}
                                              </span>
                                            )}
                                          </div>
                                        )}

                                      </div>

                                      {/* Status Menu Popover */}
                                      {showStatusMenu === task.id && (
                                        <div className="absolute left-0 top-7 z-30 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 shadow-md rounded p-1 text-[11px] grid grid-cols-3 gap-1 w-52">
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'completed'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">✓ 완료</button>
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'postponed'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">→ 연기</button>
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'cancelled'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">✕ 취소</button>
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'delegated'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">⊙ 위임</button>
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'in_progress'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">• 진행 중</button>
                                          <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'not_started'); }} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 text-left">☐ 미시작</button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                                <div className="h-6 border-b border-dashed border-stone-200/70 dark:border-stone-800/70"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
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

                  {/* Right: Schedule */}
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs flex flex-col h-[1260px]">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-3 relative">
                      <div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest block mb-0.5">02 · SCHEDULE</span>
                        <h2 className="text-base font-bold font-serif">일정</h2>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setShowScheduleHelp(!showScheduleHelp); }} className="text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0]"><HelpCircle className="w-4 h-4" /></button>
                        <button className="text-stone-400 hover:text-stone-600"><span className="text-xs font-bold font-mono">24</span></button>
                        <button className="p-1 rounded bg-[#355E3B] text-white hover:bg-[#2A4B2F]"><Plus className="w-3.5 h-3.5" /></button>
                      </div>

                      {showScheduleHelp && (
                        <div className="absolute top-12 right-0 z-50 w-80 bg-white dark:bg-[#26262B] border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xl p-4 text-xs text-left">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">하루의 시간과 약속을 살피고 필요한 일을 일정으로 배치합니다.</p>
                            <button onClick={(e) => { e.stopPropagation(); setShowScheduleHelp(false); }} className="text-stone-400 hover:text-stone-600 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                          <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                            <li>1. 일정 추가 또는 시간표 영역에서 일정을 만듭니다.</li>
                            <li>2. 시작·종료 시각을, 하루 종일의 일은 종일을 선택합니다.</li>
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

            {/* 2. PROJECTS */}
            {view === 'projects' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">PROJECTS</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">프로젝트</h1>
                </div>
                {projects.map(proj => (
                  <div key={proj.id} className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <FolderKanban className="w-4 h-4 text-[#355E3B] dark:text-[#A3C2B0]" />
                        <h2 className="text-base font-bold font-serif">{proj.title}</h2>
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-600">{proj.tag}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>마감일 {proj.deadline}</span>
                      <span className="font-bold text-[#355E3B] dark:text-[#A3C2B0]">{proj.progress}%</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      {proj.subtasks.map(st => (
                        <div key={st.id} className="flex items-center justify-between py-1.5 border-b border-dashed border-stone-200 dark:border-stone-800 text-xs">
                          <div className="flex items-center space-x-2.5">
                            {renderStatusSymbol(st.status)}<span>{st.title}</span>
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
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">DELEGATED TASKS</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">위임한 일</h1>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 text-xs font-semibold text-stone-600">
                      <span>업무 내용</span><span>담당자 / 마감</span>
                    </div>
                    {tasks.filter(t => t.status === 'delegated').length === 0 ? (
                      <div className="text-center py-10 text-xs text-stone-400">현재 위임된 업무가 없습니다.</div>
                    ) : (
                      tasks.filter(t => t.status === 'delegated').map(t => (
                        <div key={t.id} className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 text-xs">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-indigo-600" /><span>{t.title}</span>
                          </div>
                          <span className="text-[11px] text-stone-500">{t.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTE SEARCH */}
            {view === 'search' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">SEARCH</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">노트 검색</h1>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input type="text" placeholder="검색어 입력..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg text-xs outline-none" />
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                  <div className="text-xs font-semibold text-stone-600">검색 결과</div>
                  <div className="space-y-3 pt-2">
                    {Object.entries(notesByDate).map(([dateKey, text]) => (
                      text && text.includes(searchQuery) ? (
                        <div key={dateKey} onClick={() => { setSelectedDate(dateKey); setView('daily'); }} className="p-3 bg-[#E8F0EA] dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs cursor-pointer hover:border-[#355E3B]">
                          <div className="font-bold text-[#355E3B] dark:text-stone-200 mb-1">자유 노트 ({dateKey})</div>
                          <div className="text-stone-600 dark:text-stone-400">{text}</div>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. MONTHLY VIEW */}
            {view === 'monthly' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-600">MONTHLY</div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">2026년 11월</h1>
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
                  <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-stone-600 mb-2">
                    <div className="text-rose-500">주일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-500">토</div>
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-stone-200 dark:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded overflow-hidden text-xs">
                    {Array.from({ length: 35 }, (_, idx) => {
                      const dayNum = idx + 1;
                      const isCurrentMonth = dayNum <= 30;
                      const formattedDayStr = isCurrentMonth ? `2026-11-${String(dayNum).padStart(2, '0')}` : '';
                      const isSelected = formattedDayStr === selectedDate;
                      const cellBg = isSelected ? 'bg-[#E8F0EA] dark:bg-stone-800 font-bold' : 'bg-white dark:bg-[#202024]';
                      return (
                        <div key={idx} onClick={() => { if (isCurrentMonth) { setSelectedDate(formattedDayStr); setView('daily'); } }} className={"h-28 p-1.5 flex flex-col justify-between cursor-pointer hover:bg-stone-50 " + cellBg}>
                          <div className="flex justify-between items-center">
                            <span className={idx % 7 === 0 ? 'text-rose-500' : idx % 7 === 6 ? 'text-blue-500' : ''}>{isCurrentMonth ? dayNum : dayNum - 30}</span>
                            {isCurrentMonth && localStorage.getItem(`planbae_ink_daily_${formattedDayStr}`) && <span className="w-1.5 h-1.5 rounded-full bg-[#355E3B]"></span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. YEARLY VIEW */}
            {view === 'yearly' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-600">YEARLY</div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">2026년</h1>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['01 JAN', '02 FEB', '03 MAR', '04 APR', '05 MAY', '06 JUN', '07 JUL', '08 AUG', '09 SEP', '10 OCT', '11 NOV', '12 DEC'].map((monthTitle, mIdx) => (
                      <div key={monthTitle} className="border border-stone-100 dark:border-stone-800 p-2.5 rounded">
                        <div className="text-xs font-serif font-bold text-stone-700 dark:text-stone-300 mb-2 border-b border-stone-100 dark:border-stone-800 pb-1">{monthTitle}</div>
                        <div className="grid grid-cols-7 gap-1 text-[9px] text-center">
                          {Array.from({ length: 31 }, (_, d) => (
                            <span key={d} className={mIdx === 10 && d === 16 ? 'py-0.5 rounded bg-[#355E3B] text-white font-bold' : 'py-0.5 rounded text-stone-600 dark:text-stone-400'}>{d + 1}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. FOUNDATION / M/O/S */}
            {view === 'mos' && (
              <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">MOSAIC Foundation</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight">M/O/S</h1>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-6 space-y-3 shadow-xs">
                  <h2 className="text-base font-bold font-serif">M · 사명</h2>
                  <textarea rows={8} value={mosMission} onChange={(e) => setMosMission(e.target.value)} placeholder="사명 선언서 작성..." className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none" />
                </div>
              </div>
            )}

            {/* 8. WEEKLY COMPASS */}
            {view === 'compass' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4 relative">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-4xl font-serif font-bold tracking-tight">47주차</h1>
                      <button onClick={(e) => { e.stopPropagation(); setShowCompassHelp(!showCompassHelp); }} className="text-stone-400 hover:text-[#355E3B] dark:hover:text-[#A3C2B0]"><HelpCircle className="w-4 h-4" /></button>
                    </div>
                    <div className="text-xs text-stone-500 mt-2 font-medium">11월 15일 - 11월 21일</div>
                  </div>
                  {showCompassHelp && (
                    <div className="absolute top-14 left-32 z-50 w-[360px] bg-white dark:bg-[#26262B] border border-stone-200 dark:border-stone-700 rounded-lg shadow-2xl p-5 text-xs text-left">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">이번 주 어떤 사람으로 살아갈지 정하는 나침반입니다.</p>
                        <button onClick={() => setShowCompassHelp(false)} className="text-stone-400 hover:text-stone-600 ml-2 shrink-0"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg overflow-hidden bg-white/80 dark:bg-[#26262B] shadow-xs">
                  <div className="border-r border-[#E6E1D6] dark:border-[#3A3A40]">
                    <div className="bg-[#9B7B6A] dark:bg-[#685348] text-white p-3.5 pl-5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest block mb-1 opacity-80">01 · SHARPEN THE SAW</span>
                      <h2 className="text-sm font-bold font-serif">자기계발</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {[{ label: '신체적', key: 'physical' }, { label: '사회적 / 감정적', key: 'social' }, { label: '정신적', key: 'mental' }, { label: '영적', key: 'spiritual' }].map((item) => (
                        <div key={item.key} className="group border-b border-stone-100 dark:border-stone-800 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.label}</span>
                          </div>
                          <input type="text" value={(compassData as any)[item.key]} onChange={(e) => updateCompassData(item.key, e.target.value)} className="w-full bg-transparent text-xs text-stone-600 dark:text-stone-400 outline-none" placeholder="이번 주 실천할 일..." />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="bg-[#9B7B6A] dark:bg-[#685348] text-white p-3.5 pl-5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest block mb-1 opacity-80">02 · ROLES & BIG ROCKS</span>
                      <h2 className="text-sm font-bold font-serif">역할별 Big Rocks</h2>
                    </div>
                    <div className="p-5 space-y-6">
                      {[{ label: '하나님의 자녀', key: 'godChild' }, { label: '남편', key: 'husband' }, { label: '아빠', key: 'father' }, { label: '목사', key: 'pastor' }, { label: '아들', key: 'son' }, { label: '동역자', key: 'coworker' }].map((item) => (
                        <div key={item.key} className="group border-b border-stone-100 dark:border-stone-800 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.label}</span>
                          </div>
                          <input type="text" value={(compassData as any)[item.key]} onChange={(e) => updateCompassData(item.key, e.target.value)} className="w-full bg-transparent text-xs text-stone-600 dark:text-stone-400 outline-none" placeholder="가장 중요한 일..." />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'review' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h1 className="text-3xl font-serif font-bold tracking-tight">주간 Review</h1>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold font-serif">CORAM DEO · 돌아보고 다시 정렬하기</h2>
                  <textarea rows={3} className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none" placeholder="이번 주에 의미 있게 이룬 것은 무엇인가요?" />
                </div>
              </div>
            )}

            {view === 'weekly' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h1 className="text-3xl font-serif font-bold tracking-tight">Weekly</h1>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
                  <div className="grid grid-cols-8 gap-px bg-stone-200 dark:bg-stone-700 rounded overflow-hidden text-xs">
                    <div className="bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold">시간</div>
                    {['11.16 월', '11.17 화', '11.18 수', '11.19 목', '11.20 금', '11.21 토', '11.22 주일'].map((d, i) => (
                      <div key={d} className={i === 1 ? 'bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold text-[#C24B40]' : 'bg-stone-100 dark:bg-stone-800 p-2 text-center font-bold'}>{d}</div>
                    ))}
                    {Array.from({ length: 14 }, (_, h) => (
                      <React.Fragment key={h}>
                        <div className="bg-white dark:bg-stone-900 p-2 text-center text-stone-400 font-mono text-[10px]">{String(h + 7).padStart(2, '0')}:00</div>
                        {Array.from({ length: 7 }, (_, d) => (
                          <div key={d} className="bg-white dark:bg-stone-900 p-2 border-t border-stone-100 dark:border-stone-800 min-h-[45px]"></div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
