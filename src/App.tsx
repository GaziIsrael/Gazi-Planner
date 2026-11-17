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
  CalendarDays
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review' | 'projects' | 'delegated' | 'search'>('daily');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);

  // Selected Date State (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState('2026-11-17');

  // Daily Tasks with extended properties
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '모임 후 감사 메시지 전하기', status: 'not_started', priority: 'B', date: '2026-11-17', qTag: 'Q2', track: 'Pastoral', deadline: '', memo: '' }
    ];
  });

  // Schedule & Other States (Omitted for brevity in explanation, but fully included in code)
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('planbae_schedule');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '하루 종일 일정 예시', start: '00:00', end: '23:59', tag: '종일', date: '2026-11-17' }
    ];
  });
  const [notesByDate, setNotesByDate] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('planbae_notes_by_date');
    if (saved) return JSON.parse(saved);
    return { '2026-11-17': '' };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Floating Toolbar States
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'priority' | 'qTag' | 'track' | null>(null);
  const [showTaskHelp, setShowTaskHelp] = useState(false);
  const [showScheduleHelp, setShowScheduleHelp] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);

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
  useEffect(() => localStorage.setItem('planbae_schedule', JSON.stringify(schedule)), [schedule]);
  useEffect(() => localStorage.setItem('planbae_notes_by_date', JSON.stringify(notesByDate)), [notesByDate]);

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

  // Task Management
  const handleAddNewTask = () => {
    const newTask = {
      id: Date.now(),
      title: '',
      status: 'not_started',
      priority: '',
      date: selectedDate,
      qTag: '',
      track: '',
      deadline: '',
      memo: ''
    };
    setTasks([newTask, ...tasks]);
    setEditingTaskId(newTask.id);
    setActiveDropdown(null);
  };

  const updateTaskProperty = (taskId: number, field: string, value: any) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    setActiveDropdown(null);
  };

  const renderStatusSymbol = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-emerald-600 font-bold" />;
      case 'postponed': return <CornerDownRight className="w-4 h-4 text-amber-600 font-bold" />;
      case 'cancelled': return <X className="w-4 h-4 text-rose-500 font-bold" />;
      case 'delegated': return <UserCheck className="w-4 h-4 text-indigo-600 font-bold" />;
      case 'in_progress': return <CircleDot className="w-4 h-4 text-blue-600 font-bold" />;
      default: return <div className="w-4 h-4 border-2 border-stone-400 dark:border-stone-500 rounded-sm"></div>;
    }
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
              <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest px-2 mb-1.5">Planner</div>
              <nav className="space-y-0.5">
                <button onClick={() => setView('daily')} className={view === 'daily' ? 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md bg-[#E8F0EA] dark:bg-[#2C3B32] font-semibold text-[#355E3B] dark:text-[#A3C2B0]' : 'w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:bg-[#F2EEE6] dark:hover:bg-stone-800/60'}>
                  <CheckSquare className="w-4 h-4" /><span>Daily</span>
                </button>
              </nav>
            </div>
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

        {/* Apple Pencil Toolbar */}
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
        <div ref={containerRef} className="flex-1 overflow-y-auto relative" style={{ WebkitOverflowScrolling: 'touch' }} onClick={() => { setEditingTaskId(null); setActiveDropdown(null); }}>
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
                    
                    {/* TASKS COMPONENT (Completely Redesigned to match Screenshot) */}
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
                          <button onClick={() => setShowTaskHelp(!showTaskHelp)} className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#355E3B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                            <HelpCircle className="w-5 h-5" />
                          </button>
                          <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                            <AlignJustify className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleAddNewTask(); }} className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#355E3B] text-white shadow-md hover:bg-[#2A4B2F] transition-colors">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {showTaskHelp && (
                        <div className="mb-4 bg-white dark:bg-[#26262B] border border-[#E6E1D6] dark:border-stone-700 rounded-lg p-4 text-xs text-left shadow-xs">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">할 일을 기록하고 우선순위와 중요도를 정해 하루의 실행을 관리합니다.</p>
                            <button onClick={() => setShowTaskHelp(false)} className="text-stone-400 hover:text-stone-600 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
                          <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                            <li>1. <span className="font-semibold">+</span> 업무 추가로 제목을 적습니다. 기존 제목은 한 번 누르면 선택, 다시 누르면 편집입니다.</li>
                            <li>2. 선택하면 우선순위, Q 분류, 트랙, 마감일 속성을 조작할 수 있습니다.</li>
                            <li>3. 체크칸을 눌러 완료·진행·연기·취소·위임 등 상태를 변경합니다.</li>
                          </ul>
                        </div>
                      )}

                      <div className="space-y-2">
                        {dailyTasks.map(task => {
                          const isEditing = editingTaskId === task.id;
                          
                          return (
                            <div key={task.id} className="group relative">
                              
                              {/* Task Row (Active or Inactive) */}
                              <div 
                                className={`flex flex-col rounded-lg transition-all ${isEditing ? 'bg-[#2E353B] dark:bg-[#262A2E] text-white shadow-md' : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800'}`}
                                onClick={(e) => { e.stopPropagation(); if(!isEditing) { setEditingTaskId(task.id); setActiveDropdown(null); } }}
                              >
                                <div className="flex items-center justify-between py-3 px-3">
                                  <div className="flex items-center space-x-3 w-full">
                                    <button onClick={(e) => { e.stopPropagation(); setShowStatusMenu(showStatusMenu === task.id ? null : task.id); }} className="shrink-0 mt-0.5">
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
                                        className="w-full bg-transparent text-base font-medium outline-none text-white placeholder-stone-400"
                                      />
                                    ) : (
                                      <div className={`flex items-center space-x-2 text-base font-medium ${task.status === 'completed' ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'}`}>
                                        <span>{task.title}</span>
                                        {task.memo && <FileText className="w-3.5 h-3.5 text-stone-400" />}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isEditing && (
                                    <div className="flex items-center space-x-3 text-stone-400 shrink-0">
                                      <FileText className="w-4 h-4 cursor-pointer hover:text-white" />
                                      <Info className="w-4 h-4 cursor-pointer hover:text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Floating Properties Toolbar (Only visible when editing) */}
                                {isEditing && (
                                  <div className="px-3 pb-3 relative">
                                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                                      {/* 순위 (Priority) Button & Dropdown */}
                                      <div className="relative">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'priority' ? null : 'priority'); }}
                                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${activeDropdown === 'priority' ? 'bg-[#404850] text-white' : 'bg-[#3A4248] text-stone-300 hover:bg-[#404850]'}`}
                                        >
                                          <AlignLeft className="w-3.5 h-3.5" /><span>순위</span>
                                        </button>
                                        {activeDropdown === 'priority' && (
                                          <div className="absolute top-9 left-0 w-32 bg-[#2E353B] border border-[#4A5560] rounded-lg shadow-xl p-1.5 z-40">
                                            {[{id: '', label: '미분류'}, {id: 'A', label: 'A', color: '#F87171'}, {id: 'B', label: 'B', color: '#FBBF24'}, {id: 'C', label: 'C', color: '#60A5FA'}].map(opt => (
                                              <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'priority', opt.id); setActiveDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-[#404850] text-stone-200">
                                                <div className="flex items-center space-x-2">
                                                  {opt.id !== '' && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }}></span>}
                                                  <span>{opt.label}</span>
                                                </div>
                                                {task.priority === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* 분류 (Q Tag) Button & Dropdown */}
                                      <div className="relative">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'qTag' ? null : 'qTag'); }}
                                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${activeDropdown === 'qTag' ? 'bg-[#404850] text-white' : 'bg-[#3A4248] text-stone-300 hover:bg-[#404850]'}`}
                                        >
                                          <LayoutGrid className="w-3.5 h-3.5" /><span>분류</span>
                                        </button>
                                        {activeDropdown === 'qTag' && (
                                          <div className="absolute top-9 left-0 w-32 bg-[#2E353B] border border-[#4A5560] rounded-lg shadow-xl p-1.5 z-40">
                                            {[{id: '', label: '미분류'}, {id: 'Q1', label: 'Q1'}, {id: 'Q2', label: 'Q2'}, {id: 'Q3', label: 'Q3'}].map(opt => (
                                              <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'qTag', opt.id); setActiveDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-[#404850] text-stone-200">
                                                <div className="flex items-center space-x-2">
                                                  {opt.id !== '' && <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />}
                                                  <span>{opt.label}</span>
                                                </div>
                                                {task.qTag === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* 트랙 (Track) Button & Dropdown */}
                                      <div className="relative">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'track' ? null : 'track'); }}
                                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${activeDropdown === 'track' ? 'bg-[#404850] text-white' : 'bg-[#3A4248] text-stone-300 hover:bg-[#404850]'}`}
                                        >
                                          <Hash className="w-3.5 h-3.5" /><span>{task.track || '트랙'}</span>
                                        </button>
                                        {activeDropdown === 'track' && (
                                          <div className="absolute top-9 left-0 w-36 bg-[#2E353B] border border-[#4A5560] rounded-lg shadow-xl p-1.5 z-40">
                                            {[{id: '', label: '미지정'}, {id: 'Personal', label: 'Personal'}, {id: 'Pastoral', label: 'Pastoral'}].map(opt => (
                                              <button key={opt.id} onClick={(e) => { e.stopPropagation(); updateTaskProperty(task.id, 'track', opt.id); setActiveDropdown(null); }} className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-[#404850] text-stone-200">
                                                <div className="flex items-center space-x-2">
                                                  {opt.id === 'Personal' && <Users className="w-3.5 h-3.5 text-blue-400" />}
                                                  {opt.id === 'Pastoral' && <FolderKanban className="w-3.5 h-3.5 text-amber-600" />}
                                                  <span>{opt.label}</span>
                                                </div>
                                                {task.track === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* 마감일 (Deadline) Button */}
                                      <div className="relative flex items-center">
                                        <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#3A4248] text-stone-300 hover:bg-[#404850] cursor-pointer transition-colors">
                                          <CalendarDays className="w-3.5 h-3.5" />
                                          <span>{task.deadline || '마감일'}</span>
                                          <input 
                                            type="date" 
                                            className="absolute opacity-0 w-0 h-0"
                                            value={task.deadline}
                                            onChange={(e) => updateTaskProperty(task.id, 'deadline', e.target.value)}
                                          />
                                        </label>
                                      </div>

                                    </div>
                                  </div>
                                )}

                                {/* Tags (Visible when NOT editing) */}
                                {!isEditing && (task.priority || task.qTag || task.track) && (
                                  <div className="px-10 pb-3 flex items-center space-x-1.5">
                                    {task.priority && <span className="bg-[#D9A05B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">{task.priority}</span>}
                                    {task.qTag && <span className="bg-[#2C3B32] text-[#A3C2B0] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">{task.qTag}</span>}
                                    {task.track && <span className="text-[10px] text-stone-500 flex items-center"><FolderKanban className="w-3 h-3 mr-0.5" /></span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 03 · Notes */}
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
                            <button onClick={() => setShowScheduleHelp(false)} className="text-stone-400 hover:text-stone-600 shrink-0"><X className="w-4 h-4" /></button>
                          </div>
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
          </div>
        </div>
      </main>
    </div>
  );
}
