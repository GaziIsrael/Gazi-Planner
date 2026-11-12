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
  MousePointer
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'mos' | 'compass' | 'review' | 'projects' | 'delegated' | 'search'>('daily');
  const [isDark, setIsDark] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem('planbae_app_name') || 'Plan BAE');
  const [isEditingName, setIsEditingName] = useState(false);

  // Selected Date State (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState('2026-11-12');

  // Daily Tasks (Date-aware)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('planbae_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: '플래너 제작 완료하기', status: 'not_started', priority: 'B', date: '2026-11-12', tag: 'Q1' },
      { id: 2, title: '팀장 회의 소집', status: 'cancelled', priority: 'B', date: '2026-11-12', tag: 'Q2' },
      { id: 3, title: '줌미팅', status: 'not_started', priority: 'B', date: '2026-11-12', tag: 'Q1' },
      { id: 4, title: '아내와 따뜻한 차 마시며 이야기 나누기', status: 'not_started', priority: 'A', date: '2026-11-12', tag: 'Q2' }
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
      { id: 1, title: '40일 철야', start: '20:00', end: '22:40', tag: 'Pastoral', date: '2026-11-12' }
    ];
  });

  // Date-specific Notes Map
  const [notesByDate, setNotesByDate] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('planbae_notes_by_date');
    if (saved) return JSON.parse(saved);
    const legacyNote = localStorage.getItem('planbae_note') || '';
    return { '2026-11-12': legacyNote };
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Full-Page Apple Pencil Overlay States
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [penColor, setPenColor] = useState('#2C3A4E');
  const [penTool, setPenTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState(2.2);
  const [pencilOnly, setPencilOnly] = useState(true); // true: 손가락=스크롤 전용, 펜슬/마우스=필기 전용
  const [canUndo, setCanUndo] = useState(false);

  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<string[]>([]);

  // Foundation & Target States
  const [mosMission, setMosMission] = useState(() => localStorage.getItem('planbae_mos_mission') || '');
  const [reviewTab, setReviewTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [monthGoal, setMonthGoal] = useState(() => localStorage.getItem('planbae_month_goal') || '10킬로 그램 감량');
  const [yearDirection, setYearDirection] = useState(() => localStorage.getItem('planbae_year_dir') || '');

  // Helper: Format selectedDate for Korean Display
  const formatKoreanDateHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return {
      monthDay: `${m}월 ${d}일`,
      weekday: days[dateObj.getDay()],
      dotted: `${y}. ${String(m).padStart(2, '0')}. ${String(d).padStart(2, '0')}.`
    };
  };

  const changeDateByDays = (delta: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + delta);
    const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    setSelectedDate(nextStr);
  };

  // Current Ink Storage Key (Separates ink by view AND date!)
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
    localStorage.setItem('planbae_mos_mission', mosMission);
  }, [mosMission]);

  useEffect(() => {
    localStorage.setItem('planbae_month_goal', monthGoal);
  }, [monthGoal]);

  useEffect(() => {
    localStorage.setItem('planbae_year_dir', yearDirection);
  }, [yearDirection]);

  // iPadOS Safari: Block page scroll ONLY when Apple Pencil touches the canvas; allow finger touches to scroll
  useEffect(() => {
    const canvas = pageCanvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isDrawMode) return;
      const touch = e.touches[0] as any;
      // If pencilOnly is ON: block scroll when stylus touches, allow scroll when finger ('direct') touches
      if (pencilOnly) {
        if (touch && touch.touchType === 'stylus') {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawMode) return;
      const touch = e.touches[0] as any;
      if (pencilOnly) {
        if (touch && touch.touchType === 'stylus') {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDrawMode, pencilOnly]);

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

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = pageCanvasRef.current;
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
    if (!isDrawMode) return;
    
    // If pencilOnly is ON, ignore finger touches so fingers only scroll/pan the page
    if (pencilOnly && e.pointerType === 'touch') {
      return;
    }

    const canvas = pageCanvasRef.current;
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
      ctx.lineWidth = 30;
    } else if (penTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.lineWidth = 18;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = isDark && penColor === '#2C3A4E' ? '#E5E5E5' : penColor;
      ctx.lineWidth = Math.max(1.5, penSize * (pressure * 1.8));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isDrawMode) return;
    if (pencilOnly && e.pointerType === 'touch') return;

    const canvas = pageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    if (penTool === 'pen') {
      const pressure = e.pressure > 0 ? e.pressure : 0.5;
      ctx.lineWidth = Math.max(1.5, penSize * (pressure * 1.8));
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = pageCanvasRef.current;
    if (canvas) {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem(getInkStorageKey(), dataUrl);

      historyRef.current.push(dataUrl);
      if (historyRef.current.length > 30) {
        historyRef.current.shift();
      }
      setCanUndo(historyRef.current.length > 1);
    }
  };

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

  const handleAddQuickTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickInput.trim()) {
      const newTask = {
        id: Date.now(),
        title: quickInput.trim(),
        status: 'not_started',
        priority: 'B',
        date: selectedDate,
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
  const dateDisplay = formatKoreanDateHeader(selectedDate);
  const dailyTasks = tasks.filter(t => t.date === selectedDate);
  const currentDailyNote = notesByDate[selectedDate] || '';

  return (
    <div className="flex h-screen w-full overflow-hidden text-sm bg-[#FBF9F4] text-[#333333] dark:bg-[#1E1E22] dark:text-[#E0E0E0] font-sans antialiased">
      
      {/* SIDEBAR */}
      <aside className="w-60 border-r border-[#E6E1D6] dark:border-[#3A3A40] flex flex-col justify-between p-4 shrink-0 z-30 bg-[#FBF9F4] dark:bg-[#1E1E22]">
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
        
        {/* Top Header */}
        <header className="h-14 border-b border-[#E6E1D6] dark:border-[#3A3A40] flex items-center justify-between px-6 shrink-0 z-30 bg-[#FBF9F4] dark:bg-[#1E1E22]">
          <div className="text-xs tracking-wider text-stone-600 uppercase font-sans">
            {view === 'projects' ? 'WORKSPACE / 프로젝트' : 
             view === 'delegated' ? 'WORKSPACE / 위임한 일' : 
             view === 'search' ? 'WORKSPACE / 노트 검색' : 
             view === 'review' ? 'WORKSPACE / Review' : 
             `PLANNER / ${view.toUpperCase()}`}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#ECE7DD] dark:bg-stone-800 p-0.5 rounded-md text-xs">
              <button
                onClick={() => setIsDrawMode(false)}
                className={!isDrawMode ? 'flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white dark:bg-stone-700 font-semibold text-[#2C3A4E] dark:text-white shadow-xs' : 'flex items-center space-x-1.5 px-2.5 py-1 text-stone-500'}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>클릭·입력</span>
              </button>
              <button
                onClick={() => setIsDrawMode(true)}
                className={isDrawMode ? 'flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2C3A4E] text-white font-semibold shadow-xs' : 'flex items-center space-x-1.5 px-2.5 py-1 text-stone-500'}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>화면 전체 펜슬 필기</span>
              </button>
            </div>

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
            
            <button 
              onClick={() => { 
                setView('daily'); 
                setSelectedDate('2026-11-12');
                setCurrentTime(new Date()); 
              }} 
              className="px-2.5 py-1 text-xs border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-800 hover:bg-stone-50"
            >
              오늘
            </button>
          </div>
        </header>

        {/* Floating Apple Pencil Toolbar */}
        {isDrawMode && (
          <div className="bg-[#F6F3EB] dark:bg-[#26262B] border-b border-[#E6E1D6] dark:border-[#3A3A40] px-6 py-2 flex flex-wrap items-center justify-between gap-2 z-30 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#2C3A4E] dark:text-stone-300 mr-1">펜슬 도구:</span>
              
              <button 
                onClick={() => setPenTool('pen')}
                className={penTool === 'pen' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-[#2C3A4E] dark:text-white' : 'p-1.5 text-stone-500'}
                title="만년필"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPenTool('highlighter')}
                className={penTool === 'highlighter' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-amber-500' : 'p-1.5 text-stone-500'}
                title="형광펜"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPenTool('eraser')}
                className={penTool === 'eraser' ? 'p-1.5 rounded bg-white dark:bg-stone-700 shadow-xs text-rose-500' : 'p-1.5 text-stone-500'}
                title="지우개"
              >
                <Eraser className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-stone-300 dark:bg-stone-600 mx-1"></div>

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

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPencilOnly(!pencilOnly)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] border ${
                  pencilOnly 
                    ? 'bg-[#2C3A4E] text-white border-[#2C3A4E]' 
                    : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-600'
                }`}
                title="펜슬로는 글씨만 써지고, 손가락으로만 화면이 스크롤됩니다."
              >
                <Hand className="w-3.5 h-3.5" />
                <span>{pencilOnly ? '펜슬=필기 / 손가락=스크롤 고정' : '손가락 터치 필기 허용'}</span>
              </button>

              <button 
                onClick={handleUndo}
                disabled={!canUndo}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] border ${
                  canUndo 
                    ? 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600' 
                    : 'text-stone-300 dark:text-stone-600 border-transparent cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>되돌리기</span>
              </button>

              <button 
                onClick={clearCanvas}
                className="flex items-center space-x-1 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>이 날짜 필기 지우기</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content + Transparent Full-Page Handwriting Canvas */}
        <div className="flex-1 overflow-y-auto relative" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="relative min-h-[1400px] p-8">

            {/* TRANSPARENT FULL-PAGE INK OVERLAY */}
            <canvas
              ref={pageCanvasRef}
              width={1600}
              height={2200}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ 
                touchAction: isDrawMode ? (pencilOnly ? 'pan-y' : 'none') : 'auto',
                pointerEvents: isDrawMode ? 'auto' : 'none'
              }}
              className={`absolute inset-0 w-full h-full z-20 ${isDrawMode ? 'cursor-crosshair' : ''}`}
            />

            {/* 1. DAILY VIEW (Date-Separated Tasks, Notes & Handwriting) */}
            {view === 'daily' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-stone-600">Daily / {selectedDate}</div>
                    <div className="text-3xl font-serif font-bold tracking-tight mt-0.5">
                      {dateDisplay.monthDay} <span className="text-xl font-normal text-stone-600 font-sans">{dateDisplay.weekday}</span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">날짜별로 할 일, 자유 노트, 펜슬 필기가 각각 독립적으로 저장됩니다.</div>
                  </div>
                  
                  {/* Date Navigation Controls */}
                  <div className="flex items-center space-x-1 border border-stone-300 dark:border-stone-700 rounded-md p-0.5 bg-white dark:bg-stone-800 text-xs">
                    <button 
                      onClick={() => changeDateByDays(-1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
                      title="이전 날짜"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                      className="px-2 py-0.5 font-medium bg-transparent outline-none text-xs cursor-pointer"
                    />
                    <button 
                      onClick={() => changeDateByDays(1)}
                      className="p-1.5 text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
                      title="다음 날짜"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
                        <span className="text-xs text-stone-600">
                          {dailyTasks.filter(t => t.status === 'completed').length} / {dailyTasks.length} 완료
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <input 
                          type="text" 
                          placeholder={`${dateDisplay.monthDay} 할 일 적기... (Enter로 추가)`}
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
                            <div className="space-y-2.5">
                              {dailyTasks.filter(t => t.priority === p).map(task => (
                                <div key={task.id} className="relative flex items-center justify-between py-1.5 border-b border-dashed border-stone-200 dark:border-stone-800 text-xs">
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
                              <div className="h-6 border-b border-dashed border-stone-200/70 dark:border-stone-800/70"></div>
                              <div className="h-6 border-b border-dashed border-stone-200/70 dark:border-stone-800/70"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 03 · Notes (Date-separated) */}
                    <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">03 · Notes ({dateDisplay.monthDay})</span>
                          <h2 className="text-base font-bold font-serif">자유 노트</h2>
                        </div>
                        <span className="text-[11px] text-stone-500">날짜별 자동 저장</span>
                      </div>
                      <textarea 
                        rows={10}
                        value={currentDailyNote}
                        onChange={(e) => setNotesByDate({ ...notesByDate, [selectedDate]: e.target.value })}
                        placeholder={`${dateDisplay.monthDay}의 생각, 기도, 메모를 적거나 Apple Pencil로 필기하세요...`}
                        style={{
                          backgroundImage: 'radial-gradient(rgba(160, 150, 135, 0.35) 1px, transparent 1px)',
                          backgroundSize: '18px 18px'
                        }}
                        className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none p-2 rounded border border-stone-200/60 dark:border-stone-700/60"
                      />
                    </div>
                  </div>

                  {/* Right: 24h Schedule */}
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs flex flex-col h-[1260px]">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-widest block">02 · Schedule</span>
                        <h2 className="text-base font-bold font-serif">24시간 시간표</h2>
                      </div>
                      <span className="text-xs text-stone-600">현재 {formattedCurrentTime}</span>
                    </div>

                    <div className="relative flex-1">
                      <div 
                        className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                        style={{ top: ((currentMinutes / 1440) * 1150) + 'px' }}
                      >
                        <span className="bg-[#C24B40] text-white text-[9px] font-mono px-1 rounded font-bold mr-1">
                          {formattedCurrentTime}
                        </span>
                        <div className="flex-1 h-[1.5px] bg-[#C24B40]"></div>
                      </div>

                      <div className="relative" style={{ height: '1150px' }}>
                        {Array.from({ length: 25 }, (_, i) => (
                          <div 
                            key={i} 
                            className="absolute w-full flex items-start border-t border-stone-200 dark:border-stone-800/80"
                            style={{ top: ((i / 24) * 1150) + 'px', height: '47px' }}
                          >
                            <span className="w-12 text-[10px] text-stone-500 font-mono -mt-2 bg-transparent select-none">
                              {String(i).padStart(2, '0')}:00
                            </span>
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
                            <div 
                              key={evt.id}
                              className="absolute left-14 right-2 bg-stone-100 dark:bg-stone-800 border-l-2 border-[#2C3A4E] p-2 rounded text-xs shadow-xs"
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
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
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
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
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
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">SEARCH</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight mt-0.5">노트 검색</h1>
                  <p className="text-xs text-stone-500 mt-1">모든 날짜의 자유 노트와 사명 선언서를 통합 검색합니다.</p>
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
                    {Object.entries(notesByDate).map(([dateKey, text]) => (
                      text && text.includes(searchQuery) ? (
                        <div 
                          key={dateKey} 
                          onClick={() => { setSelectedDate(dateKey); setView('daily'); }}
                          className="p-3 bg-[#FAF6EE] dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs cursor-pointer hover:border-[#2C3A4E]"
                        >
                          <div className="font-bold text-[#2C3A4E] dark:text-stone-200 mb-1">자유 노트 ({dateKey})</div>
                          <div className="text-stone-600 dark:text-stone-400">{text}</div>
                        </div>
                      ) : null
                    ))}
                    {mosMission && mosMission.includes(searchQuery) && (
                      <div className="p-3 bg-[#FAF6EE] dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs">
                        <div className="font-bold text-[#2C3A4E] dark:text-stone-200 mb-1">M · 사명 선언서</div>
                        <div className="text-stone-600 dark:text-stone-400">{mosMission}</div>
                      </div>
                    )}
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
                    <p className="text-xs text-stone-500 mt-1">날짜 숫자를 누르면 해당 날짜의 Daily 화면과 필기 노트로 바로 이동합니다.</p>
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
                      const isCurrentMonth = dayNum <= 30;
                      const formattedDayStr = isCurrentMonth ? `2026-11-${String(dayNum).padStart(2, '0')}` : '';
                      const isSelected = formattedDayStr === selectedDate;
                      const cellBg = isSelected ? 'bg-[#FAF6EE] dark:bg-stone-800 font-bold' : 'bg-white dark:bg-[#202024]';
                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDate(formattedDayStr);
                              setView('daily');
                            }
                          }}
                          className={"h-28 p-1.5 flex flex-col justify-between cursor-pointer hover:bg-stone-50 " + cellBg}
                        >
                          <div className="flex justify-between items-center">
                            <span className={idx % 7 === 0 ? 'text-rose-500' : idx % 7 === 6 ? 'text-blue-500' : ''}>
                              {isCurrentMonth ? dayNum : dayNum - 30}
                            </span>
                            {isCurrentMonth && localStorage.getItem(`planbae_ink_daily_${formattedDayStr}`) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2C3A4E]" title="필기 기록 있음"></span>
                            )}
                          </div>
                          {dayNum === 12 && (
                            <div className="bg-stone-100 dark:bg-stone-700 p-1 rounded text-[10px] text-stone-700 dark:text-stone-300">
                              20:00 40일 철야
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
                    <input 
                      type="text" 
                      value={monthGoal}
                      onChange={(e) => setMonthGoal(e.target.value)}
                      className="w-full border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs bg-transparent outline-none"
                    />
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
                    <p className="text-xs text-stone-500 mt-1">한 해의 방향과 목표를 정하고, 올해의 성취와 변화를 기록합니다.</p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs">
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
                  <textarea 
                    rows={8}
                    value={mosMission}
                    onChange={(e) => setMosMission(e.target.value)}
                    placeholder="문단으로 자유롭게 작성하거나 펜슬로 적어보세요..."
                    className="w-full bg-transparent outline-none text-xs leading-relaxed resize-none"
                  />
                </div>
              </div>
            )}

            {/* 8. WEEKLY COMPASS */}
            {view === 'compass' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <div className="text-[11px] uppercase tracking-wider text-stone-600">Foundation</div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight">Weekly Compass</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold font-serif">자기계발 (4대 영역)</h3>
                    {['신체적', '사회적 / 감정적', '정신적', '영적'].map(area => (
                      <div key={area} className="space-y-1">
                        <div className="text-xs font-semibold text-stone-600">{area}</div>
                        <input type="text" placeholder="실천할 한 가지..." className="w-full border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1.5 text-xs bg-transparent outline-none" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold font-serif">역할별 Big Rock</h3>
                    {['하나님의 자녀', '남편', '아빠', '목사', '선생님'].map(role => (
                      <div key={role} className="space-y-1">
                        <div className="text-xs font-semibold text-stone-600">{role}</div>
                        <input type="text" placeholder="가장 중요한 일..." className="w-full border border-stone-200 dark:border-stone-700 rounded px-2.5 py-1.5 text-xs bg-transparent outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 9. REVIEW */}
            {view === 'review' && (
              <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h1 className="text-3xl font-serif font-bold tracking-tight">주간 Review</h1>
                  <div className="flex space-x-1 border border-stone-300 dark:border-stone-700 rounded p-0.5 text-xs">
                    <button onClick={() => setReviewTab('weekly')} className={reviewTab === 'weekly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>주간</button>
                    <button onClick={() => setReviewTab('monthly')} className={reviewTab === 'monthly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>월간</button>
                    <button onClick={() => setReviewTab('yearly')} className={reviewTab === 'yearly' ? 'px-2.5 py-1 rounded bg-[#2C3A4E] text-white' : 'px-2.5 py-1 rounded'}>연간</button>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-[#26262B] border border-[#E6E1D6] dark:border-[#3A3A40] rounded-lg p-6 shadow-xs space-y-4">
                  <h2 className="text-base font-bold font-serif">CORAM DEO · 돌아보고 다시 정렬하기</h2>
                  <textarea rows={3} className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none" placeholder="이번 주에 의미 있게 이룬 것은 무엇인가요?" />
                  <textarea rows={3} className="w-full border border-stone-200 dark:border-stone-700 rounded p-2 text-xs bg-transparent outline-none resize-none" placeholder="무엇을 놓쳤고, 삶의 균형은 어떠했나요?" />
                </div>
              </div>
            )}

            {/* 10. WEEKLY TIMETABLE */}
            {view === 'weekly' && (
              <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
                  <h1 className="text-3xl font-serif font-bold tracking-tight">Weekly</h1>
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
