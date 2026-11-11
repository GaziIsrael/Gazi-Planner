import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  Compass,
  FolderKanban,
  UserCheck,
  BookOpen,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  Check,
  Inbox,
  X,
  ArrowRight,
  RotateCcw,
  User,
  Landmark,
  Link2,
  Edit3,
  Menu,
  Sparkles,
  History
} from 'lucide-react';

// --- HELPER FUNCTIONS & CONSTANTS ---
const DAYS_KR = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const DAYS_SHORT_KR = ['주일', '월', '화', '수', '목', '금', '토'];
const MONTHS_EN = [
  '01 JAN', '02 FEB', '03 MAR', '04 APR', '05 MAY', '06 JUN',
  '07 JUL', '08 AUG', '09 SEP', '10 OCT', '11 NOV', '12 DEC'
];

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (dateStr, days) => {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
};

const getStartOfWeekMonday = (dateStr) => {
  const d = parseDateKey(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
};

const STATUS_CONFIG = {
  todo: { label: '미시작', icon: '☐', short: '미시작', color: 'text-[#7A746B]' },
  in_progress: { label: '진행 중', icon: '•', short: '진행 중', color: 'text-[#2C3A4E] font-bold' },
  done: { label: '완료', icon: '✓', short: '완료', color: 'text-[#3A5A40] font-bold' },
  postponed: { label: '연기', icon: '→', short: '연기됨', color: 'text-[#9C6644]' },
  cancelled: { label: '취소', icon: '✕', short: '취소됨', color: 'text-[#A09A90] line-through' },
  delegated: { label: '위임', icon: '⊙', short: '위임됨', color: 'text-[#4A6580]' },
};

const DEFAULT_TODAY = '2026-11-10';

// --- INITIAL DATA ARCHITECTURE (Reflecting all uploaded screenshots) ---
const INITIAL_DATA = {
  brandName: 'Plan BAE',
  brandSubtitle: 'DIGITAL PLANNER',
  // 1. MOSAIC FOUNDATION (M/O/S)
  mosTrack: 'Personal', // 'Personal' | 'Pastoral'
  mosVisionConfirmed: true,
  mosData: {
    Personal: {
      mission: '하나님께 맡겨진 삶을 감사함으로 누리며, 종이의 온기와 디지털의 명료함으로 내 삶과 가정의 소중한 시간을 지켜낸다.\n더 많이 채우기보다 본질적인 것에 머물고, 주변 사람들에게 배움과 쉼을 흘려보내는 삶.',
      objectives: [
        { id: 'o1', text: '영성과 일상의 쉼: 매일 아침 말씀 묵상 및 저녁 8시 이후 여백 갖기' },
        { id: 'o2', text: '가정과 건강: 주 4회 걷기 운동 및 아내와 주 1회 깊은 대화 시간 확보' }
      ],
      strategies: [
        { id: 's1', text: '일정이 비어있는 틈을 새로운 일로 채우지 않고 산책과 기도로 환기하기' },
        { id: 's2', text: '단순한 분주함은 거절하고 매주 Weekly Compass에서 가려낸 Big Rock에만 집중하기' }
      ]
    },
    Pastoral: {
      mission: '하나님 앞에서(Coram Deo) 성실하게 말씀을 연구하고, 맡겨진 영혼들을 따뜻하게 품으며 건강한 공동체를 세워간다.',
      objectives: [
        { id: 'po1', text: '말씀 연구와 기도: 주일 설교 원고 수요일 오전까지 초안 완성' },
        { id: 'po2', text: '사역 체계화: 2027년 목회 계획과 제직 리더십 모임의 질적 성장' }
      ],
      strategies: [
        { id: 'ps1', text: '불필요한 행정 처리는 팀장들에게 과감히 위임하고 깊은 연구 시간 확보' },
        { id: 'ps2', text: '회의는 50분 내로 집중하여 진행하고 실행 중심의 피드백 문화 정착' }
      ]
    }
  },
  // 2. WEEKLY COMPASS (Sharpen the saw & Roles & Big Rocks)
  compassSaw: {
    physical: '주 4회 40분 이상 빠른 걸음 산책 및 충분한 수면',
    social: '아내와 단둘이 따뜻한 차 마시며 한 주 이야기 나누기',
    mental: '플래너 사용성 점검 및 호보니치 플래너 철학 서적 읽기',
    spiritual: '시편 묵상과 함께 하나님 앞에서의 침묵 기도'
  },
  compassRoles: [
    { id: 'r1', name: '하나님의 자녀', bigRock: '매일 아침 성경 통독과 감사 일기 기록' },
    { id: 'r2', name: '남편', bigRock: '아내와의 저녁 산책 및 데이트 시간 확보' },
    { id: 'r3', name: '아빠', bigRock: '아이들과 보드게임하고 자기 전 책 읽어주기' },
    { id: 'r4', name: '목사', bigRock: '주일 설교 본문 깊은 묵상 및 2027년 사역 기획 구상' },
    { id: 'r5', name: '아들', bigRock: '부모님께 안부 전화 드리고 주말 식사 일정 챙기기' }
  ],
  // 3. TASKS
  tasks: [
    {
      id: 't1',
      title: '플래너 제작 완료하기',
      date: '2026-11-10',
      priority: 'B',
      quadrant: 'Q1',
      track: 'Personal',
      status: 'todo',
      memo: '호보니치 테쵸와 미도리 MD노트의 감성, 1D2P 화면과 6가지 상태 팝업 정밀 검증.',
      projectId: 'p1',
      goalId: null,
      delegateTo: ''
    },
    {
      id: 't2',
      title: '아내와 따뜻한 차 마시며 이야기 나누기',
      date: '2026-11-10',
      priority: 'A',
      quadrant: 'Q2',
      track: 'Personal',
      status: 'todo',
      memo: '휴대폰을 내려놓고 온전히 대화에 집중',
      projectId: null,
      goalId: null,
      delegateTo: ''
    },
    {
      id: 't3',
      title: '올해 사역 피드백',
      date: '2026-11-10',
      priority: 'B',
      quadrant: 'Q1',
      track: 'Pastoral',
      status: 'todo',
      memo: '부서별 감사 제목 취합',
      projectId: 'p1',
      goalId: null,
      delegateTo: ''
    },
    {
      id: 't4',
      title: '팀장 회의 소집',
      date: '2026-11-11',
      priority: 'B',
      quadrant: 'Q2',
      track: 'Pastoral',
      status: 'todo',
      memo: '일정 조율 메시지 발송',
      projectId: 'p1',
      goalId: null,
      delegateTo: ''
    },
    {
      id: 't5',
      title: '주일 공간 음향 및 마이크 배터리 점검',
      date: '2026-11-10',
      priority: 'C',
      quadrant: 'Q3',
      track: 'Pastoral',
      status: 'delegated',
      memo: '무선 마이크 수신기 프리셋 확인',
      projectId: null,
      goalId: null,
      delegateTo: '음향팀 김 간사'
    }
  ],
  // 4. SCHEDULES
  schedules: [
    {
      id: 's1',
      title: '40일 철야',
      startDate: '2026-11-08',
      endDate: '2026-11-08',
      allDay: false,
      startTime: '20:00',
      endTime: '22:40',
      track: 'Pastoral',
      repeat: '안 함',
      memo: '마음을 모아 함께 기도하는 시간'
    },
    {
      id: 's2',
      title: '새벽 묵상과 하루 계획 (1D2P)',
      startDate: '2026-11-10',
      endDate: '2026-11-10',
      allDay: false,
      startTime: '06:00',
      endTime: '07:00',
      track: 'Personal',
      repeat: '매일',
      memo: '커피와 함께 오늘의 우선순위 점검'
    },
    {
      id: 's3',
      title: '사역 기획 집중 연구',
      startDate: '2026-11-10',
      endDate: '2026-11-10',
      allDay: false,
      startTime: '10:00',
      endTime: '12:00',
      track: 'Pastoral',
      repeat: '안 함',
      memo: '방해 금지 모드로 자료 정리'
    }
  ],
  dailyNotes: {
    '2026-11-10': `오늘 남겨두고 싶은 생각, 기도, 메모...\n\n"종이의 온기, 디지털의 명료함."\n월간에 쓴 일을 일간에 다시 옮겨 적던 번거로움은 없애고, 책상 위에 펼쳐진 노트처럼 따뜻한 호보니치 감성을 남긴다.\n빈 시간에는 쉼도 들어가야 하니까 오늘 저녁은 온전히 쉼으로 채우자.`
  },
  monthlyData: {
    '2026-11': {
      direction: '연말로 향하는 길목에서 속도를 늦추고, 한 해 동안 맡겨진 사람들과 사역을 따뜻하게 갈무리하는 달.',
      goals: [
        {
          id: 'mg1',
          title: '10킬로 그램 감량',
          track: 'Personal',
          resultNote: '저녁 7시 이후 금식 및 걷기 실천 중 (-3.5kg 달성)',
          carriedOver: false
        }
      ]
    }
  },
  yearlyData: {
    '2026': {
      direction: '삶의 큰 방향이 오늘의 작은 행동으로 자연스럽게 이어지는 해.',
      goals: [
        {
          id: 'yg1',
          title: '나만의 디지털 플래너 planBAE 완성 및 정착',
          track: 'Personal',
          steps: '디자인 감성 확립 → 1D2P 타임라인 완성 → 루틴화',
          changeLog: '도구를 만드는 과정을 통해 내 시간관을 재정립함'
        }
      ]
    }
  },
  projects: [
    {
      id: 'p1',
      title: '2027년 사역 기획',
      track: 'Pastoral',
      dueDate: '',
      description: '마감일과 선행 업무를 연결하고, 같은 체크 상태를 모든 계획 화면에서 확인합니다.'
    }
  ],
  inbox: [
    { id: 'in1', text: '연말 감사 카드 보낼 분들 명단 정리하기', createdAt: '2026-11-10' },
    { id: 'in2', text: '책상 조명 색온도 전구색으로 확인', createdAt: '2026-11-10' }
  ],
  reviews: {
    weekly: {
      q1: '',
      q2: '',
      q3: '',
      completed: false
    },
    monthly: {
      q1: '',
      q2: '',
      q3: '',
      completed: false
    },
    yearly: {
      q1: '',
      q2: '',
      q3: '',
      completed: false
    }
  },
  trash: [
    { id: 'tr1', title: '불필요한 구독 서비스 해지', type: 'task', deletedAt: '2026-11-08' },
    { id: 'tr2', title: '오후 미팅 취소건', type: 'schedule', deletedAt: '2026-11-09' },
    { id: 'tr3', title: '문구류 주문 목록', type: 'task', deletedAt: '2026-11-09' },
    { id: 'tr4', title: '샘플 테스트 일정', type: 'schedule', deletedAt: '2026-11-10' }
  ]
};

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('planbae_v2_full');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('planbae_theme') || 'light';
  });

  const [activeNav, setActiveNav] = useState('Daily');
  const [selectedDate, setSelectedDate] = useState(DEFAULT_TODAY);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);

  // Daily Planner UI
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [showHelperTip, setShowHelperTip] = useState(true);
  const [scheduleViewMode, setScheduleViewMode] = useState('24h');
  const [showReclassify, setShowReclassify] = useState(false);

  // Review Sub-Tab: '주간' | '월간' | '연간'
  const [reviewTab, setReviewTab] = useState('주간');

  // Modals & Popovers
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [statusPopover, setStatusPopover] = useState({ open: false, task: null });
  const [scheduleModal, setScheduleModal] = useState({ open: false, schedule: null });
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxText, setInboxText] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Live Time Clock for Red Line
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    try {
      localStorage.setItem('planbae_v2_full', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem('planbae_theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [themeMode]);

  // Current time calculations for Red Line
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const selectedDateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const selectedYear = selectedDateObj.getFullYear();
  const selectedMonth = selectedDateObj.getMonth() + 1;
  const selectedDay = selectedDateObj.getDate();
  const selectedDayName = DAYS_KR[selectedDateObj.getDay()];

  // Week boundary for currently selected date
  const mondayObj = useMemo(() => getStartOfWeekMonday(selectedDate), [selectedDate]);
  const sundayObj = useMemo(() => {
    const s = new Date(mondayObj);
    s.setDate(mondayObj.getDate() + 6);
    return s;
  }, [mondayObj]);

  const weekRangeStr = `${mondayObj.getMonth() + 1}.${mondayObj.getDate()} 월요일 – ${sundayObj.getMonth() + 1}.${sundayObj.getDate()} 주일`;

  const dailyTasks = useMemo(
    () => data.tasks.filter((t) => t.date === selectedDate),
    [data.tasks, selectedDate]
  );

  const dailySchedules = useMemo(
    () => data.schedules.filter((s) => s.startDate <= selectedDate && (s.endDate || s.startDate) >= selectedDate),
    [data.schedules, selectedDate]
  );

  const completedDailyCount = dailyTasks.filter((t) => t.status === 'done').length;

  // Theme palettes matching exactly: Light (Warm Midori MD paper) vs Dark (Hobonichi Deep Ink)
  const theme = {
    bgMain: isDark ? 'bg-[#181716] text-[#EBE6DC]' : 'bg-[#FBF9F4] text-[#2A2826]',
    bgSidebar: isDark ? 'bg-[#121110] border-[#2A2824]' : 'bg-[#F4F1EA] border-[#E6E1D6]',
    bgCard: isDark ? 'bg-[#1F1E1B] border-[#312F2A]' : 'bg-[#FFFEFA] border-[#E8E2D5]',
    bgSubtle: isDark ? 'bg-[#262420]' : 'bg-[#F6F2EB]',
    bgInput: isDark ? 'bg-[#1A1916] border-[#36342E] text-[#EBE6DC]' : 'bg-[#FFFEFA] border-[#D8D2C5] text-[#2A2826]',
    textPrimary: isDark ? 'text-[#EBE6DC]' : 'text-[#2A2826]',
    textSecondary: isDark ? 'text-[#9A9388]' : 'text-[#7A746B]',
    border: isDark ? 'border-[#312F2A]' : 'border-[#E6E1D6]',
    borderLight: isDark ? 'border-[#282622]' : 'border-[#EFECE4]',
    btnNavy: isDark ? 'bg-[#2E3C4E] hover:bg-[#3A4B61] text-[#F3F6F9]' : 'bg-[#2C3A4E] hover:bg-[#202B3A] text-white',
    btnSoft: isDark ? 'bg-[#262420] hover:bg-[#2E2C26] text-[#D8D2C5]' : 'bg-[#EAE5DC] hover:bg-[#E0DAD0] text-[#3D3A35]',
    activeNavBg: isDark ? 'bg-[#263140] text-[#EBE6DC] font-semibold' : 'bg-[#E6EAEF] text-[#2C3A4E] font-semibold'
  };

  // --- ACTIONS ---
  const handleQuickAddTask = (e) => {
    if (e) e.preventDefault();
    if (!quickTaskInput.trim()) return;

    const lines = quickTaskInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const newTasks = lines.map((line, idx) => ({
      id: `t_${Date.now()}_${idx}`,
      title: line,
      date: selectedDate,
      priority: 'B',
      quadrant: 'Q1',
      track: 'Personal',
      status: 'todo',
      memo: '',
      projectId: null,
      goalId: null,
      delegateTo: ''
    }));

    setData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...newTasks]
    }));
    setQuickTaskInput('');
  };

  const handleStatusChange = (task, newStatus, extra = {}) => {
    setData((prev) => {
      const updated = prev.tasks.map((item) => {
        if (item.id !== task.id) return item;
        const nextDate = newStatus === 'postponed' && extra.postponeDate ? extra.postponeDate : item.date;
        const nextDelegate = newStatus === 'delegated' && extra.delegateTo ? extra.delegateTo : item.delegateTo;
        return {
          ...item,
          status: newStatus,
          date: nextDate,
          delegateTo: nextDelegate
        };
      });
      return { ...prev, tasks: updated };
    });
    setStatusPopover({ open: false, task: null });
  };

  const openNewTaskModal = (preset = {}) => {
    setTaskModal({
      open: true,
      task: {
        id: null,
        title: '',
        date: preset.date || selectedDate,
        priority: preset.priority || 'A',
        quadrant: preset.quadrant || '미분류',
        track: preset.track || '나중에 지정',
        status: 'todo',
        memo: '',
        projectId: preset.projectId || null,
        goalId: null,
        delegateTo: ''
      }
    });
  };

  const saveTaskModal = () => {
    const t = taskModal.task;
    if (!t || !t.title.trim()) return;
    setData((prev) => {
      const exists = prev.tasks.some((item) => item.id === t.id);
      if (exists) {
        return { ...prev, tasks: prev.tasks.map((item) => (item.id === t.id ? t : item)) };
      }
      return { ...prev, tasks: [...prev.tasks, { ...t, id: `t_${Date.now()}` }] };
    });
    setTaskModal({ open: false, task: null });
  };

  const openNewScheduleModal = (preset = {}) => {
    const startHour = preset.hour !== undefined ? `${String(preset.hour).padStart(2, '0')}:00` : '05:00';
    const endHour = preset.hour !== undefined ? `${String(Math.min(24, preset.hour + 1)).padStart(2, '0')}:00` : '06:00';
    setScheduleModal({
      open: true,
      schedule: {
        id: null,
        title: '',
        startDate: preset.date || selectedDate,
        endDate: preset.date || selectedDate,
        allDay: false,
        startTime: startHour,
        endTime: endHour,
        track: 'Personal',
        repeat: '안 함',
        memo: ''
      }
    });
  };

  const saveScheduleModal = () => {
    const s = scheduleModal.schedule;
    if (!s || !s.title.trim()) return;
    setData((prev) => {
      const exists = prev.schedules.some((item) => item.id === s.id);
      if (exists) {
        return { ...prev, schedules: prev.schedules.map((item) => (item.id === s.id ? s : item)) };
      }
      return { ...prev, schedules: [...prev.schedules, { ...s, id: `s_${Date.now()}` }] };
    });
    setScheduleModal({ open: false, schedule: null });
  };

  // Helper Badges
  const renderPriorityBadge = (p) => {
    if (p === 'A') {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold bg-[#E6EFE9] text-[#35583C] border border-[#CFE0D4]">
          A
        </span>
      );
    }
    if (p === 'B') {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold bg-[#F5EBE0] text-[#8C583A] border border-[#E6D5C3]">
          B
        </span>
      );
    }
    if (p === 'C') {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold bg-[#E9EFF5] text-[#45617D] border border-[#D4E0EC]">
          C
        </span>
      );
    }
    return null;
  };

  const renderQuadrantBadge = (q) => {
    if (!q || q === '미분류') return null;
    const styles = {
      Q1: 'bg-[#F9EAE8] text-[#B94A48] border-[#F0D5D1]',
      Q2: 'bg-[#E8F0EA] text-[#3A5A40] border-[#D1E2D5]',
      Q3: 'bg-[#F6EFE2] text-[#9C6644] border-[#E8DAC2]'
    };
    return (
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${styles[q] || styles.Q1}`}>
        {q}
      </span>
    );
  };

  // =========================================================================
  // SCREEN 1: FOUNDATION / M/O/S (MOSAIC Foundation) - Exact Match to Screenshot 4
  // =========================================================================
  const renderMOSView = () => {
    const currentTrack = data.mosTrack || 'Personal';
    const mosData = data.mosData[currentTrack] || { mission: '', objectives: [], strategies: [] };

    return (
      <div className="max-w-[1180px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-1 ${theme.textSecondary}`}>
              MOSAIC FOUNDATION
            </div>
            <h1 className="font-serif-kr text-3xl sm:text-[40px] font-normal tracking-tight leading-none">
              M/O/S
            </h1>
            <p className={`text-xs sm:text-[13px] mt-2.5 ${theme.textSecondary}`}>
              사명을 서술하고, 목표와 전략을 아웃라인으로 연결합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('비전 이력 기능: 이전 분기에 확정했던 사명과 목표의 기록을 불러옵니다.');
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${theme.bgCard} ${theme.border} hover:opacity-80`}
            >
              비전 이력
            </button>
            <button
              onClick={() => {
                setData((prev) => ({ ...prev, mosVisionConfirmed: true }));
                alert('사명과 비전이 확정되었습니다. 모든 주간/월간 계획의 기준점으로 동기화됩니다.');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs ${theme.btnNavy}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>비전 확정</span>
            </button>
          </div>
        </div>

        {/* Track Switcher (Personal | Pastoral) & Status */}
        <div className="flex items-center justify-between pt-1">
          <div className={`inline-flex p-1 rounded-xl border ${theme.bgCard} ${theme.border}`}>
            {['Personal', 'Pastoral'].map((tr) => (
              <button
                key={tr}
                onClick={() => setData((prev) => ({ ...prev, mosTrack: tr }))}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentTrack === tr ? theme.btnNavy : theme.textSecondary
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          <span className={`text-[11px] font-medium ${theme.textSecondary}`}>
            Draft · 자동 저장
          </span>
        </div>

        {/* 1. MISSION / M · 사명 CARD */}
        <div className={`rounded-2xl border p-6 shadow-sm ${theme.bgCard}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#8C6239]" />
            <div>
              <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                MISSION
              </div>
              <h2 className="text-base font-bold">M · 사명</h2>
            </div>
          </div>

          <p className={`text-xs mb-3 ${theme.textSecondary}`}>
            하나님께 맡겨진 삶을 무엇을 위해 살아가나요?
          </p>

          <textarea
            rows={6}
            value={mosData.mission}
            onChange={(e) => {
              const val = e.target.value;
              setData((prev) => ({
                ...prev,
                mosData: {
                  ...prev.mosData,
                  [currentTrack]: { ...mosData, mission: val }
                }
              }));
            }}
            placeholder="문단으로 자유롭게 작성하세요."
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(transparent 31px, #2E2B25 32px)'
                : 'linear-gradient(transparent 31px, #ECE6DA 32px)',
              backgroundSize: '100% 32px',
              lineHeight: '32px'
            }}
            className={`w-full bg-transparent resize-y font-serif-kr text-sm focus:outline-none pt-1 leading-8 ${theme.textPrimary}`}
          />
        </div>

        {/* 2. OBJECTIVES / O · 목표 CARD */}
        <div className={`rounded-2xl border p-6 shadow-sm ${theme.bgCard}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#4A6580]" />
              <div>
                <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                  OBJECTIVES
                </div>
                <h2 className="text-base font-bold">O · 목표</h2>
              </div>
            </div>

            <button
              onClick={() => {
                const text = prompt('영성, 가정, 일과 안식을 돌아보며 세울 목표를 입력하세요:');
                if (!text) return;
                const nextObjs = [...mosData.objectives, { id: `o_${Date.now()}`, text }];
                setData((prev) => ({
                  ...prev,
                  mosData: {
                    ...prev.mosData,
                    [currentTrack]: { ...mosData, objectives: nextObjs }
                  }
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>목표 추가</span>
            </button>
          </div>

          <p className={`text-xs mb-3 ${theme.textSecondary}`}>
            영성, 가정, 일과 안식을 돌아보며 어떤 목표를 세우고 싶나요?
          </p>

          <div className="space-y-2">
            {mosData.objectives.length === 0 ? (
              <div className={`text-xs py-3 ${theme.textSecondary}`}>아웃라인에 첫 항목을 추가하세요.</div>
            ) : (
              mosData.objectives.map((obj, idx) => (
                <div
                  key={obj.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${theme.borderLight}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-xs mt-0.5 opacity-60">{idx + 1}.</span>
                    <span className="text-sm font-medium">{obj.text}</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextObjs = mosData.objectives.filter((o) => o.id !== obj.id);
                      setData((prev) => ({
                        ...prev,
                        mosData: {
                          ...prev.mosData,
                          [currentTrack]: { ...mosData, objectives: nextObjs }
                        }
                      }));
                    }}
                    className="p-1 opacity-40 hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. STRATEGY / S · 전략 CARD */}
        <div className={`rounded-2xl border p-6 shadow-sm ${theme.bgCard}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#3A5A40]" />
              <div>
                <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                  STRATEGY
                </div>
                <h2 className="text-base font-bold">S · 전략</h2>
              </div>
            </div>

            <button
              onClick={() => {
                const text = prompt('이번 시즌 무엇에 집중하고 어떤 좋은 것을 내려놓을지 전략을 입력하세요:');
                if (!text) return;
                const nextStrats = [...mosData.strategies, { id: `s_${Date.now()}`, text }];
                setData((prev) => ({
                  ...prev,
                  mosData: {
                    ...prev.mosData,
                    [currentTrack]: { ...mosData, strategies: nextStrats }
                  }
                }));
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>전략 추가</span>
            </button>
          </div>

          <p className={`text-xs mb-3 ${theme.textSecondary}`}>
            이번 시즌 무엇에 집중하고 어떤 좋은 것을 내려놓나요?
          </p>

          <div className="space-y-2">
            {mosData.strategies.length === 0 ? (
              <div className={`text-xs py-3 ${theme.textSecondary}`}>아웃라인에 첫 항목을 추가하세요.</div>
            ) : (
              mosData.strategies.map((strat, idx) => (
                <div
                  key={strat.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${theme.borderLight}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-xs mt-0.5 opacity-60">{idx + 1}.</span>
                    <span className="text-sm font-medium">{strat.text}</span>
                  </div>
                  <button
                    onClick={() => {
                      const nextStrats = mosData.strategies.filter((s) => s.id !== strat.id);
                      setData((prev) => ({
                        ...prev,
                        mosData: {
                          ...prev.mosData,
                          [currentTrack]: { ...mosData, strategies: nextStrats }
                        }
                      }));
                    }}
                    className="p-1 opacity-40 hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // SCREEN 2: WEEKLY COMPASS - Exact Match to Screenshot 5
  // =========================================================================
  const renderWeeklyCompassView = () => {
    // 7 days of the current week for date chips
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mondayObj);
      d.setDate(mondayObj.getDate() + i);
      const k = formatDateKey(d);
      return {
        key: k,
        dayStr: `${d.getMonth() + 1}.${d.getDate()}`,
        dayName: DAYS_SHORT_KR[d.getDay()],
        isSelected: k === selectedDate
      };
    });

    const areas = [
      { key: 'physical', label: '신체적' },
      { key: 'social', label: '사회적 / 감정적' },
      { key: 'mental', label: '정신적' },
      { key: 'spiritual', label: '영적' }
    ];

    return (
      <div className="max-w-[1360px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-1 ${theme.textSecondary}`}>
              WEEKLY COMPASS
            </div>
            <h1 className="font-serif-kr text-3xl sm:text-[40px] font-normal tracking-tight leading-none">
              Weekly Compass
            </h1>
            <p className={`text-xs sm:text-[13px] mt-2.5 ${theme.textSecondary}`}>{weekRangeStr}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.bgCard} ${theme.border}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(DEFAULT_TODAY)}
              className={`px-3 h-8 rounded-lg border text-xs font-medium ${theme.bgCard} ${theme.border}`}
            >
              이번 주
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.bgCard} ${theme.border}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Left (Sharpen Saw + Roles Big Rock), Right (Daily Chips + Tasks + Schedules) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* SHARPEN THE SAW / 자기계발 CARD with Navy Banner */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${theme.bgCard}`}>
              <div className="bg-[#2C3A4E] text-white px-5 py-3">
                <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/70">
                  SHARPEN THE SAW
                </div>
                <h2 className="text-base font-bold">자기계발</h2>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {areas.map((ar) => (
                  <div key={ar.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">{ar.label}</span>
                      <button
                        onClick={() => {
                          alert(`지난주의 [${ar.label}] 실천 내용을 불러왔습니다.`);
                        }}
                        className={`text-[11px] flex items-center gap-1 ${theme.textSecondary} hover:underline`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>지난주 복사</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={data.compassSaw[ar.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev) => ({
                          ...prev,
                          compassSaw: { ...prev.compassSaw, [ar.key]: val }
                        }));
                      }}
                      placeholder="이번 주 이 영역에서 실천할 한 가지"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${theme.bgSubtle} ${theme.border}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ROLES & BIG ROCKS / 역할별 Big Rock CARD */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-[#4A6580]" />
                <div>
                  <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                    ROLES & BIG ROCKS
                  </div>
                  <h2 className="text-base font-bold">역할별 Big Rock</h2>
                </div>
              </div>

              <div className="space-y-4">
                {data.compassRoles.map((role) => (
                  <div key={role.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">{role.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Send Big Rock directly to Daily priorities!
                            if (!role.bigRock.trim()) return;
                            const newT = {
                              id: `t_${Date.now()}`,
                              title: role.bigRock,
                              date: selectedDate,
                              priority: 'A',
                              quadrant: 'Q2',
                              track: 'Personal',
                              status: 'todo',
                              memo: `[Weekly Compass - ${role.name}] 역할의 Big Rock`,
                              projectId: null,
                              goalId: null,
                              delegateTo: ''
                            };
                            setData((prev) => ({ ...prev, tasks: [...prev.tasks, newT] }));
                            alert(`'${role.name}'의 Big Rock이 오늘(${selectedDate}) 할 일 A에 담겼습니다.`);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded border ${theme.border} hover:opacity-80`}
                        >
                          + 오늘 할 일에 담기
                        </button>
                        <button
                          onClick={() => alert(`지난주 [${role.name}]의 계획을 복사했습니다.`)}
                          className={`text-[11px] flex items-center gap-1 ${theme.textSecondary} hover:underline`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>지난주 복사</span>
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={role.bigRock}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData((prev) => ({
                          ...prev,
                          compassRoles: prev.compassRoles.map((r) =>
                            r.id === role.id ? { ...r, bigRock: val } : r
                          )
                        }));
                      }}
                      placeholder="이번 주 이 역할에서 가장 중요한 일"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none ${theme.bgSubtle} ${theme.border}`}
                    />
                  </div>
                ))}

                <button
                  onClick={() => {
                    const rName = prompt('추가할 새로운 역할 이름을 입력하세요 (예: 멘토, 집사, 독서가):');
                    if (!rName) return;
                    setData((prev) => ({
                      ...prev,
                      compassRoles: [
                        ...prev.compassRoles,
                        { id: `r_${Date.now()}`, name: rName, bigRock: '' }
                      ]
                    }));
                  }}
                  className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold ${theme.border} ${theme.textSecondary}`}
                >
                  + 새로운 삶의 역할 추가
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* THIS WEEK / Daily 열기 CARD with Date Chips */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4A6580]" />
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      THIS WEEK
                    </div>
                    <h2 className="text-base font-bold">Daily 열기</h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReviewTab('주간');
                    setActiveNav('Review');
                  }}
                  className={`text-xs font-medium ${theme.textSecondary} hover:underline`}
                >
                  주간 Review
                </button>
              </div>

              {/* 7 Daily Chips */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weekDays.map((wd) => (
                  <button
                    key={wd.key}
                    onClick={() => {
                      setSelectedDate(wd.key);
                      setActiveNav('Daily');
                    }}
                    className={`py-2 px-1 rounded-xl border transition ${
                      wd.isSelected
                        ? 'bg-[#2C3A4E] text-white border-[#2C3A4E] shadow-sm'
                        : `${theme.bgSubtle} ${theme.border} hover:opacity-80`
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{wd.dayStr}</div>
                    <div className="text-[10px] opacity-75">{wd.dayName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* WEEKLY TASKS / 연결된 주간 업무 */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#4A6580]" />
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      WEEKLY TASKS
                    </div>
                    <h2 className="text-base font-bold">연결된 주간 업무</h2>
                  </div>
                </div>
                <button
                  onClick={() => openNewTaskModal({ date: selectedDate })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>업무 추가</span>
                </button>
              </div>

              <div className={`text-xs py-3 text-center ${theme.textSecondary}`}>
                이 기간에 연결된 업무가 없습니다.
              </div>
            </div>

            {/* DAILY TASKS / 일간에 배정된 업무 */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-4 h-4 text-[#4A6580]" />
                <div>
                  <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                    DAILY TASKS
                  </div>
                  <h2 className="text-base font-bold">일간에 배정된 업무</h2>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`text-xs font-semibold ${theme.textSecondary}`}>
                  → {selectedMonth}.{selectedDay} {selectedDayName}
                </div>

                <div className="space-y-2">
                  {dailyTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setStatusPopover({ open: true, task: t })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${theme.borderLight}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="w-4 h-4 rounded border border-[#B8B1A4] flex items-center justify-center text-xs">
                          {t.status === 'done' ? '✓' : ''}
                        </button>
                        <div>
                          <div className={`text-sm font-medium ${t.status === 'done' ? 'line-through opacity-55' : ''}`}>
                            {t.title}
                          </div>
                          <div className={`text-[11px] ${theme.textSecondary}`}>
                            {STATUS_CONFIG[t.status]?.short} · 배정 {t.date.replace(/-/g, '.')}
                          </div>
                        </div>
                      </div>
                      {renderQuadrantBadge(t.quadrant)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CALENDAR / 연결된 일정 */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4A6580]" />
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      CALENDAR
                    </div>
                    <h2 className="text-base font-bold">연결된 일정</h2>
                  </div>
                </div>

                <button
                  onClick={() => openNewScheduleModal({ date: selectedDate })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>일정 추가</span>
                </button>
              </div>

              {dailySchedules.length === 0 ? (
                <div className={`text-xs py-3 text-center ${theme.textSecondary}`}>
                  이 기간에 예정된 일정이 없습니다.
                </div>
              ) : (
                <div className="space-y-2">
                  {dailySchedules.map((s) => (
                    <div key={s.id} className={`p-3 rounded-xl border ${theme.borderLight}`}>
                      <div className="text-sm font-bold">{s.title}</div>
                      <div className={`text-xs ${theme.textSecondary}`}>
                        {s.startTime} – {s.endTime} · {s.track}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // SCREEN 3: REVIEW (주간 Review / 월간 Review / 연간 Review) - Exact Match to Screenshots 1, 2, 3
  // =========================================================================
  const renderReviewView = () => {
    const isWeekly = reviewTab === '주간';
    const isMonthly = reviewTab === '월간';
    const isYearly = reviewTab === '연간';

    // Questions matching screenshots 1, 2, 3
    const config = isWeekly
      ? {
          title: '주간 Review',
          subtitle: weekRangeStr,
          lookBackTitle: '이번 주의 Compass',
          lookBackEmpty: '이 주의 Compass에 작성한 계획이 없습니다.',
          lookBackBtnText: '→ Compass 열기',
          lookBackAction: () => setActiveNav('Weekly Compass'),
          nextPlanTitle: '다음 기간 계획',
          nextPlanLabel: `${addDays(mondayObj, 7).replace(/-/g, '.')} 월요일 – ${addDays(sundayObj, 7).replace(/-/g, '.')} 주일`,
          nextPlanBtnText: '→ 다음 주 Compass 열기',
          nextPlanAction: () => {
            setSelectedDate(addDays(selectedDate, 7));
            setActiveNav('Weekly Compass');
          },
          q1: {
            title: '이번 주에 의미 있게 이룬 것은 무엇인가요?',
            desc: '이번 주의 계획과 역할을 돌아보며, 감사하고 의미 있었던 일을 기록해 보세요.'
          },
          q2: {
            title: '무엇을 놓쳤고, 삶의 균형은 어떠했나요?',
            desc: '중요했지만 돌보지 못한 일과 관계는 있었는지, 몸과 마음, 신앙과 일상의 균형을 돌아보세요.'
          },
          q3: {
            title: '무엇을 계속하고, 수정하고, 내려놓을까요?',
            desc: '이번 주에 배운 것을 바탕으로 다음 주의 방향을 생각해 보세요.'
          }
        }
      : isMonthly
      ? {
          title: '월간 Review',
          subtitle: `${selectedYear}년 ${selectedMonth}월`,
          lookBackTitle: '이달의 계획',
          lookBackEmpty: '작성한 방향이 없습니다.',
          lookBackBtnText: '→ Monthly 열기',
          lookBackAction: () => setActiveNav('Monthly'),
          nextPlanTitle: '다음 기간 계획',
          nextPlanLabel: `${selectedMonth === 12 ? selectedYear + 1 : selectedYear}년 ${selectedMonth === 12 ? 1 : selectedMonth + 1}월`,
          nextPlanBtnText: '→ 다음 달 계획 열기',
          nextPlanAction: () => {
            const nextM = new Date(selectedYear, selectedMonth, 1);
            setSelectedDate(formatDateKey(nextM));
            setActiveNav('Monthly');
          },
          q1: {
            title: '이번 달에 의미 있게 이룬 것은 무엇인가요?',
            desc: '이달의 방향과 중요한 목표를 돌아보며, 의미 있었던 성취와 경험을 기록해 보세요.'
          },
          q2: {
            title: '이번 달의 방향을 얼마나 지켰고, 무엇을 놓쳤나요?',
            desc: '중요하게 생각했던 일과 관계에 충분히 마음을 두었는지 돌아보세요.'
          },
          q3: {
            title: '다음 달에 무엇을 이어가고 바꿀까요?',
            desc: '계속할 일과 수정할 일, 내려놓을 일을 생각하며 다음 달의 방향을 정리해 보세요.'
          }
        }
      : {
          title: '연간 Review',
          subtitle: `${selectedYear}년`,
          lookBackTitle: '올해의 계획',
          lookBackEmpty: '작성한 방향이 없습니다.\n이 기간에 작성한 목표가 없습니다.',
          lookBackBtnText: '→ Yearly 열기',
          lookBackAction: () => setActiveNav('Yearly'),
          nextPlanTitle: '다음 기간 계획',
          nextPlanLabel: `${selectedYear + 1}년`,
          nextPlanBtnText: '→ 다음 해 계획 열기',
          nextPlanAction: () => {
            setSelectedDate(`${selectedYear + 1}-11-10`);
            setActiveNav('Yearly');
          },
          q1: {
            title: '올해 가장 의미 있었던 성취와 변화는 무엇인가요?',
            desc: '한 해 동안 중요하게 여겼던 목표와 경험을 돌아보며 의미 있었던 일을 기록해 보세요.'
          },
          q2: {
            title: '올해의 경험을 통해 무엇을 배우고, 무엇이 달라졌나요?',
            desc: '예상과 달랐던 일, 어려움 속에서 배운 것, 삶의 방향이 달라진 지점을 돌아보세요.'
          },
          q3: {
            title: '새해에는 무엇을 이어가고, 새롭게 선택하고, 내려놓을까요?',
            desc: '한 해의 경험을 바탕으로 다음 해에 중요하게 여길 것을 생각해 보세요.'
          }
        };

    const reviewKey = isWeekly ? 'weekly' : isMonthly ? 'monthly' : 'yearly';
    const curRev = data.reviews[reviewKey] || { q1: '', q2: '', q3: '', completed: false };

    return (
      <div className="max-w-[1260px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-1 ${theme.textSecondary}`}>
              REVIEW
            </div>
            <h1 className="font-serif-kr text-3xl sm:text-[40px] font-normal tracking-tight leading-none">
              {config.title}
            </h1>
            <p className={`text-xs sm:text-[13px] mt-2.5 ${theme.textSecondary}`}>{config.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 주간 | 월간 | 연간 Tab Selector (Exact Match to Screenshot Top Right) */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              {['주간', '월간', '연간'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setReviewTab(tab)}
                  className={`pb-1 transition ${
                    reviewTab === tab
                      ? 'border-b-2 border-[#2C3A4E] text-[#2C3A4E] dark:text-[#EBE6DC] dark:border-[#EBE6DC]'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center ${theme.border}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center ${theme.border}`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. LOOK BACK CARD */}
        <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#4A6580]" />
              <div>
                <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                  LOOK BACK
                </div>
                <h2 className="text-base font-bold">{config.lookBackTitle}</h2>
              </div>
            </div>

            <button
              onClick={config.lookBackAction}
              className={`text-xs font-semibold ${theme.textSecondary} hover:underline`}
            >
              {config.lookBackBtnText}
            </button>
          </div>

          <div className={`text-xs mt-2 ${theme.textSecondary}`}>
            {isWeekly && data.compassRoles.some((r) => r.bigRock) ? (
              <div className="space-y-1">
                {data.compassRoles
                  .filter((r) => r.bigRock)
                  .map((r) => (
                    <div key={r.id}>
                      <strong>{r.name}:</strong> {r.bigRock}
                    </div>
                  ))}
              </div>
            ) : isMonthly && data.monthlyData[selectedDate.slice(0, 7)]?.direction ? (
              <div>
                <div className="font-semibold mb-1">이달의 방향</div>
                <div>{data.monthlyData[selectedDate.slice(0, 7)].direction}</div>
              </div>
            ) : (
              <div className="whitespace-pre-line">{config.lookBackEmpty}</div>
            )}
          </div>
        </div>

        {/* 2. CORAM DEO + 실행 기록 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: CORAM DEO / 돌아보고 다시 정렬하기 (7 Cols) */}
          <div className={`lg:col-span-7 rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4A6580]" />
                <div>
                  <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                    CORAM DEO
                  </div>
                  <h2 className="text-base font-bold">돌아보고 다시 정렬하기</h2>
                </div>
              </div>

              <button
                onClick={() => setActiveNav('노트 검색')}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.border}`}
                title="기록 검색"
              >
                <Search className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div>
                <h3 className="text-xs font-bold">{config.q1.title}</h3>
                <p className={`text-[11px] mb-2 ${theme.textSecondary}`}>{config.q1.desc}</p>
                <textarea
                  rows={3}
                  value={curRev.q1}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => ({
                      ...prev,
                      reviews: {
                        ...prev.reviews,
                        [reviewKey]: { ...curRev, q1: val }
                      }
                    }));
                  }}
                  className={`w-full rounded-xl border p-3.5 text-xs font-serif-kr resize-none focus:outline-none ${theme.bgSubtle} ${theme.border}`}
                />
              </div>

              {/* Question 2 */}
              <div>
                <h3 className="text-xs font-bold">{config.q2.title}</h3>
                <p className={`text-[11px] mb-2 ${theme.textSecondary}`}>{config.q2.desc}</p>
                <textarea
                  rows={3}
                  value={curRev.q2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => ({
                      ...prev,
                      reviews: {
                        ...prev.reviews,
                        [reviewKey]: { ...curRev, q2: val }
                      }
                    }));
                  }}
                  className={`w-full rounded-xl border p-3.5 text-xs font-serif-kr resize-none focus:outline-none ${theme.bgSubtle} ${theme.border}`}
                />
              </div>

              {/* Question 3 */}
              <div>
                <h3 className="text-xs font-bold">{config.q3.title}</h3>
                <p className={`text-[11px] mb-2 ${theme.textSecondary}`}>{config.q3.desc}</p>
                <textarea
                  rows={3}
                  value={curRev.q3}
                  onChange={(e) => {
                    const val = e.target.value;
                    setData((prev) => ({
                      ...prev,
                      reviews: {
                        ...prev.reviews,
                        [reviewKey]: { ...curRev, q3: val }
                      }
                    }));
                  }}
                  className={`w-full rounded-xl border p-3.5 text-xs font-serif-kr resize-none focus:outline-none ${theme.bgSubtle} ${theme.border}`}
                />
              </div>

              {/* Bottom Complete Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E6E1D6] dark:border-[#312F2A]">
                <span className={`text-[11px] ${theme.textSecondary}`}>
                  {curRev.completed ? '작성 완료됨' : '미작성'}
                </span>
                <button
                  onClick={() => {
                    setData((prev) => ({
                      ...prev,
                      reviews: {
                        ...prev.reviews,
                        [reviewKey]: { ...curRev, completed: true }
                      }
                    }));
                    alert(`${config.title}를 마쳤습니다. 하나님 앞에서 정렬된 마음으로 다음 걸음을 시작하세요.`);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${theme.btnSoft}`}
                >
                  Review 마치기
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: 실행 기록 (5 Cols) */}
          <div className={`lg:col-span-5 rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-[#3A5A40]" />
              <h2 className="text-base font-bold">실행 기록</h2>
            </div>
            <p className={`text-[11px] mb-4 ${theme.textSecondary}`}>
              이번 주의 배정과 상태 변경을 함께 봅니다.
            </p>

            <div className="space-y-3">
              <div className={`text-xs font-semibold ${theme.textSecondary}`}>
                ∨ 확인할 업무 {data.tasks.length}개
              </div>

              <div className="space-y-2">
                {data.tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setStatusPopover({ open: true, task: t })}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${theme.borderLight}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button className="w-4 h-4 rounded border border-[#B8B1A4] flex items-center justify-center text-xs mt-0.5">
                        {t.status === 'done' ? '✓' : ''}
                      </button>
                      <div>
                        <div className={`text-sm font-medium ${t.status === 'done' ? 'line-through opacity-55' : ''}`}>
                          {t.title}
                        </div>
                        <div className={`text-[11px] ${theme.textSecondary}`}>
                          {STATUS_CONFIG[t.status]?.short} · 배정 {t.date.replace(/-/g, '.')}
                        </div>
                      </div>
                    </div>
                    {renderQuadrantBadge(t.quadrant)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 다음 기간 계획 CARD */}
        <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#4A6580]" />
                <h3 className="text-sm font-bold">{config.nextPlanTitle}</h3>
              </div>
              <p className={`text-xs mt-1 ${theme.textSecondary}`}>{config.nextPlanLabel}</p>
            </div>

            <button
              onClick={config.nextPlanAction}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${theme.btnNavy}`}
            >
              {config.nextPlanBtnText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // SCREEN 4: DAILY PLANNER (1D2P Layout & Franklin Planner Status Popover)
  // =========================================================================
  const renderDailyView = () => {
    const groups = [
      { key: 'A', label: '반드시 오늘 해야 할 일' },
      { key: 'B', label: '하면 좋은 일' },
      { key: 'C', label: '여유가 생기면' }
    ];

    return (
      <div className="max-w-[1360px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-1 ${theme.textSecondary}`}>
              DAILY / TODAY
            </div>
            <div className="flex items-baseline gap-3">
              <h1 className="font-serif-kr text-3xl sm:text-[38px] font-normal tracking-tight leading-none">
                {selectedMonth}월 {selectedDay}일
              </h1>
              <span className={`font-serif-kr text-lg ${theme.textSecondary}`}>{selectedDayName}</span>
            </div>
            <p className={`text-xs sm:text-[13px] mt-2.5 ${theme.textSecondary}`}>
              오늘의 할 일과 일정을 정리하고, 하루를 기록하세요.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-end">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition ${theme.bgCard} ${theme.border} hover:opacity-80`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <label
              className={`relative px-3 h-8 rounded-lg border flex items-center gap-1.5 text-xs font-medium cursor-pointer transition ${theme.bgCard} ${theme.border} hover:opacity-80`}
            >
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>날짜 선택</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center transition ${theme.bgCard} ${theme.border} hover:opacity-80`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1D2P Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PAGE: 01 PRIORITIES + 03 NOTES (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 01 · PRIORITIES */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bgSubtle}`}>
                    <CheckSquare className="w-4 h-4 text-[#4A6580]" />
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      01 · PRIORITIES
                    </div>
                    <h2 className="text-base font-bold leading-snug">오늘 할 일</h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowReclassify(!showReclassify)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition ${
                    showReclassify ? theme.btnNavy : 'hover:opacity-75 ' + theme.textSecondary
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>분류 다시 보기</span>
                </button>
              </div>

              {/* Quick Input Bar */}
              <div className="flex gap-2 mb-3">
                <textarea
                  rows={1}
                  value={quickTaskInput}
                  onChange={(e) => setQuickTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAddTask();
                    }
                  }}
                  placeholder="오늘 할 일 적기..."
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm resize-none focus:outline-none ${theme.bgInput}`}
                />
                <button
                  onClick={handleQuickAddTask}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${theme.btnNavy}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>추가</span>
                </button>
              </div>

              {/* Helper Bar */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={theme.textSecondary}>
                  {completedDailyCount} / {dailyTasks.length} 완료
                </span>
                <button
                  onClick={() => setShowHelperTip(!showHelperTip)}
                  className={`flex items-center gap-1 text-[11px] ${theme.textSecondary} hover:underline`}
                >
                  <span>{showHelperTip ? '▼' : '▶'} 입력·상태 도움말</span>
                </button>
              </div>

              {showHelperTip && (
                <div
                  className={`rounded-xl p-3.5 mb-4 text-xs leading-relaxed border ${
                    isDark ? 'bg-[#262420] border-[#36342E] text-[#C8C1B4]' : 'bg-[#F5EFE6]/80 border-[#E8DFD1] text-[#6B6358]'
                  }`}
                >
                  <p>Enter로 추가하고, 여러 줄을 붙여넣어 한 번에 담을 수 있어요.</p>
                  <p className="mt-0.5">체크칸을 눌러 상태를 선택하세요.</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 font-medium text-[11px] opacity-90">
                    <span>✓ 완료</span>
                    <span>→ 연기</span>
                    <span>✕ 취소</span>
                    <span>⊙ 위임</span>
                    <span>• 진행 중</span>
                    <span>☐ 미시작</span>
                  </div>
                </div>
              )}

              {/* Priorities Groups */}
              <div className="space-y-2.5 mt-3">
                {groups.map((grp) => {
                  const groupTasks = dailyTasks.filter((t) => t.priority === grp.key);
                  return (
                    <div key={grp.key} className={`rounded-xl border transition ${theme.borderLight}`}>
                      <div
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-t-xl ${
                          isDark ? 'bg-[#22211E]' : 'bg-[#FAF8F3]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {renderPriorityBadge(grp.key)}
                          <span className="text-xs font-semibold">{grp.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {groupTasks.length > 0 && (
                            <span className={`text-[11px] ${theme.textSecondary}`}>{groupTasks.length}개</span>
                          )}
                          <button
                            onClick={() => openNewTaskModal({ priority: grp.key, date: selectedDate })}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition ${
                              isDark ? 'bg-[#2E2C28] text-[#D8D2C5]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {groupTasks.length > 0 && (
                        <div className={`divide-y ${theme.borderLight}`}>
                          {groupTasks.map((task) => {
                            const st = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                            return (
                              <div
                                key={task.id}
                                className="flex items-start justify-between gap-3 px-3.5 py-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                              >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <button
                                    onClick={() => setStatusPopover({ open: true, task })}
                                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0 ${
                                      task.status === 'done'
                                        ? 'bg-[#3A5A40] border-[#3A5A40] text-white'
                                        : task.status === 'in_progress'
                                        ? 'border-[#2C3A4E] bg-[#E6EAEF] text-[#2C3A4E] font-bold'
                                        : 'border-[#B8B1A4]'
                                    }`}
                                  >
                                    {task.status === 'todo' ? '' : st.icon}
                                  </button>

                                  <div
                                    onClick={() => setTaskModal({ open: true, task: { ...task } })}
                                    className="min-w-0 flex-1 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`text-sm font-medium ${
                                          task.status === 'done' || task.status === 'cancelled'
                                            ? 'line-through opacity-55'
                                            : ''
                                        }`}
                                      >
                                        {task.title}
                                      </span>
                                      {task.memo && <FileText className="w-3.5 h-3.5 opacity-45 inline" />}
                                    </div>
                                    <div className={`text-[11px] mt-0.5 ${theme.textSecondary}`}>
                                      {st.short}
                                      {task.status === 'delegated' && task.delegateTo && ` · → ${task.delegateTo}`}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {renderQuadrantBadge(task.quadrant)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 03 · NOTES (자유 노트) */}
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F4ECE1] dark:bg-[#2C2720]">
                    <FileText className="w-4 h-4 text-[#8C6239]" />
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      03 · NOTES
                    </div>
                    <h2 className="text-base font-bold leading-snug">자유 노트</h2>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNav('노트 검색')}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.border}`}
                >
                  <Search className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>

              <textarea
                rows={6}
                value={data.dailyNotes[selectedDate] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setData((prev) => ({
                    ...prev,
                    dailyNotes: { ...prev.dailyNotes, [selectedDate]: val }
                  }));
                }}
                placeholder="오늘 남겨두고 싶은 생각, 기도, 메모..."
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(transparent 31px, #2A2824 32px)'
                    : 'linear-gradient(transparent 31px, #ECE7DC 32px)',
                  backgroundSize: '100% 32px',
                  lineHeight: '32px'
                }}
                className={`w-full bg-transparent resize-y text-sm font-serif-kr pt-1 focus:outline-none ${theme.textPrimary}`}
              />
              <div className={`text-[11px] mt-2 ${theme.textSecondary}`}>자동 저장</div>
            </div>
          </div>

          {/* RIGHT PAGE: 02 SCHEDULE (5 Cols) */}
          <div className="lg:col-span-5">
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${theme.bgCard}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bgSubtle}`}>
                    <Clock className="w-4 h-4 text-[#4A6580]" />
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                      02 · SCHEDULE
                    </div>
                    <h2 className="text-base font-bold leading-snug">시간표</h2>
                  </div>
                </div>

                <button
                  onClick={() => openNewScheduleModal({ date: selectedDate })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>일정 추가</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className={`inline-flex p-0.5 rounded-lg border ${theme.bgSubtle} ${theme.border}`}>
                  <button
                    onClick={() => setScheduleViewMode('24h')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      scheduleViewMode === '24h' ? `${theme.bgCard} shadow-xs` : theme.textSecondary
                    }`}
                  >
                    24시간
                  </button>
                  <button
                    onClick={() => setScheduleViewMode('list')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                      scheduleViewMode === 'list' ? `${theme.bgCard} shadow-xs` : theme.textSecondary
                    }`}
                  >
                    목록
                  </button>
                </div>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${theme.border}`}>
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                </div>
              </div>

              <p className={`text-[11px] mb-3 ${theme.textSecondary}`}>
                빈 시간대를 눌러 일정 추가 · ↺ 종료 시간 미정
              </p>

              {scheduleViewMode === '24h' ? (
                <div
                  className={`relative rounded-xl border p-3 overflow-hidden ${
                    isDark ? 'bg-[#181715] border-[#2E2C27]' : 'bg-[#FCFBF7] border-[#ECE7DC]'
                  }`}
                >
                  <div className="relative">
                    {Array.from({ length: 25 }, (_, hour) => {
                      const hourLabel = `${String(hour).padStart(2, '0')}:00`;
                      const hourEvents = dailySchedules.filter((s) => {
                        const h = parseInt((s.startTime || '00:00').split(':')[0], 10);
                        return h === hour;
                      });

                      return (
                        <div
                          key={hour}
                          onClick={() => openNewScheduleModal({ date: selectedDate, hour })}
                          className="group flex items-start h-[34px] cursor-pointer relative"
                        >
                          <span
                            className={`w-11 text-[11px] font-mono select-none -mt-1.5 shrink-0 ${theme.textSecondary}`}
                          >
                            {hourLabel}
                          </span>
                          <div
                            className={`flex-1 h-full border-t transition ${
                              isDark
                                ? 'border-[#262420] group-hover:bg-white/[0.02]'
                                : 'border-[#EAE4D7] group-hover:bg-[#F4EFE4]/60'
                            }`}
                          >
                            {hourEvents.map((ev) => (
                              <div
                                key={ev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScheduleModal({ open: true, schedule: { ...ev } });
                                }}
                                className={`mt-0.5 mr-1 px-2.5 py-1 rounded-md text-xs flex items-center justify-between border ${
                                  ev.track === 'Pastoral'
                                    ? isDark
                                      ? 'bg-[#202936] border-[#2D3A4D] text-[#DCE7F5]'
                                      : 'bg-[#E9EFF6] border-[#CBD8E6] text-[#26384D]'
                                    : isDark
                                    ? 'bg-[#2A241F] border-[#3D332A] text-[#F0E6DD]'
                                    : 'bg-[#F5EDE4] border-[#E3D3C1] text-[#4D3B2C]'
                                }`}
                              >
                                <span className="truncate font-medium">{ev.title}</span>
                                <span className="font-mono text-[10px] opacity-75 shrink-0">{ev.startTime}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* RED CURRENT TIME LINE */}
                    <div
                      style={{ top: `${(currentMinutes / 1440) * 100}%` }}
                      className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                    >
                      <span className="px-1.5 py-0.5 rounded-full bg-[#9E4747] text-white text-[10px] font-mono font-bold leading-none shadow-sm">
                        {currentTimeStr}
                      </span>
                      <div className="flex-1 h-[1.5px] bg-[#9E4747]" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  {dailySchedules.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setScheduleModal({ open: true, schedule: { ...ev } })}
                      className={`p-3 rounded-xl border cursor-pointer ${theme.borderLight}`}
                    >
                      <div className="font-semibold text-sm">{ev.title}</div>
                      <div className={`text-xs mt-1 font-mono ${theme.textSecondary}`}>
                        {ev.startTime} – {ev.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans antialiased transition-colors duration-200 ${theme.bgMain}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
        .font-serif-kr { font-family: 'Noto Serif KR', Georgia, serif; }
        body { font-family: 'Noto Sans KR', -apple-system, sans-serif; }
      `}</style>

      {/* LEFT SIDEBAR */}
      <aside
        className={`w-64 shrink-0 border-r flex flex-col justify-between select-none z-30 ${theme.bgSidebar} ${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 shadow-2xl flex' : 'hidden md:flex'
        }`}
      >
        <div className="p-4">
          {/* Logo & Editable Title */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2C3A4E] flex items-center justify-center shadow-xs shrink-0">
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5 p-0.5 bg-white/95 rounded-xs">
                  <div className="flex flex-col gap-0.5">
                    <div className="h-1.5 bg-[#2C3A4E] rounded-[1px]" />
                    <div className="h-2 bg-[#2C3A4E]/40 rounded-[1px]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="h-2 bg-[#2C3A4E]/40 rounded-[1px]" />
                    <div className="h-1.5 bg-[#2C3A4E] rounded-[1px]" />
                  </div>
                </div>
              </div>

              <div>
                {isEditingBrand ? (
                  <input
                    type="text"
                    autoFocus
                    value={data.brandName}
                    onChange={(e) => setData((prev) => ({ ...prev, brandName: e.target.value }))}
                    onBlur={() => setIsEditingBrand(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingBrand(false)}
                    className={`w-28 text-sm font-bold px-1 rounded border ${theme.bgInput}`}
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingBrand(true)}
                    className="flex items-center gap-1 cursor-pointer group"
                  >
                    <span className="font-serif-kr font-bold text-base tracking-tight">{data.brandName}</span>
                    <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                  </div>
                )}
                <div className={`text-[9px] font-bold tracking-[0.16em] uppercase ${theme.textSecondary}`}>
                  {data.brandSubtitle}
                </div>
              </div>
            </div>

            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5 text-[13px]">
            <div>
              <div className={`px-2.5 mb-1.5 text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                FOUNDATION
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'M/O/S', label: 'M/O/S', icon: Sparkles },
                  { id: 'Weekly Compass', label: 'Weekly Compass', icon: Compass }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition ${
                        active ? theme.activeNavBg : `${theme.textSecondary} hover:opacity-100`
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className={`px-2.5 mb-1.5 text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                PLANNER
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'Daily', label: 'Daily', icon: Calendar },
                  { id: 'Weekly', label: 'Weekly', icon: Clock },
                  { id: 'Monthly', label: 'Monthly', icon: Calendar },
                  { id: 'Yearly', label: 'Yearly', icon: Calendar }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition ${
                        active ? theme.activeNavBg : `${theme.textSecondary} hover:opacity-100`
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className={`px-2.5 mb-1.5 text-[10px] font-bold tracking-[0.14em] uppercase ${theme.textSecondary}`}>
                WORKSPACE
              </div>
              <div className="space-y-0.5">
                {[
                  { id: '프로젝트', label: '프로젝트', icon: FolderKanban },
                  { id: '위임한 일', label: '위임한 일', icon: UserCheck },
                  { id: 'Review', label: 'Review', icon: CheckSquare },
                  { id: '노트 검색', label: '노트 검색', icon: FileText }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition ${
                        active ? theme.activeNavBg : `${theme.textSecondary} hover:opacity-100`
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t space-y-3 text-xs ${theme.border}`}>
          <div>
            <div className={`text-[10px] mb-1.5 ${theme.textSecondary}`}>테마</div>
            <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#E0DBD1] dark:border-[#312F2A]">
              <button
                onClick={() => setThemeMode('system')}
                className={`p-1.5 rounded transition ${
                  themeMode === 'system' ? `${theme.bgCard} shadow-xs` : 'opacity-50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`p-1.5 rounded transition ${
                  themeMode === 'light' ? `${theme.bgCard} shadow-xs` : 'opacity-50'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`p-1.5 rounded transition ${
                  themeMode === 'dark' ? `${theme.bgCard} shadow-xs` : 'opacity-50'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`space-y-2 pt-1 ${theme.textSecondary}`}>
            <button onClick={() => window.print()} className="flex items-center gap-2 hover:underline w-full text-left">
              <Download className="w-3.5 h-3.5" />
              <span>PDF 내보내기</span>
            </button>
            <div className="flex items-center gap-2 hover:underline cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
              <span>휴지통 {data.trash.length}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] opacity-80">
              <Check className="w-3.5 h-3.5 text-[#3A5A40]" />
              <span>동기화 완료</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-14 px-4 sm:px-8 border-b flex items-center justify-between shrink-0 ${theme.borderLight}`}>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMobileMenuOpen(true)} className={`md:hidden p-2 rounded-lg border ${theme.border}`}>
              <Menu className="w-4 h-4" />
            </button>
            <span className={`text-xs font-medium ${theme.textSecondary}`}>
              {['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(activeNav)
                ? `PLANNER / ${activeNav}`
                : ['M/O/S', 'Weekly Compass'].includes(activeNav)
                ? `FOUNDATION / ${activeNav}`
                : `WORKSPACE / ${activeNav}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNav('노트 검색')}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${theme.bgCard} ${theme.border}`}
            >
              <Search className="w-3.5 h-3.5 opacity-75" />
            </button>
            <button
              onClick={() => {
                setSelectedDate(DEFAULT_TODAY);
                setActiveNav('Daily');
              }}
              className={`px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? 'bg-[#2A3442] text-[#D8E1EB]' : 'bg-[#E6EAEF] text-[#2C3A4E]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>오늘</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto pb-24">
          {activeNav === 'Daily' && renderDailyView()}
          {activeNav === 'M/O/S' && renderMOSView()}
          {activeNav === 'Weekly Compass' && renderWeeklyCompassView()}
          {activeNav === 'Review' && renderReviewView()}
          {activeNav === 'Weekly' && renderWeeklyCompassView()}
          {activeNav === 'Monthly' && renderReviewView()}
          {activeNav === 'Yearly' && renderReviewView()}
          {activeNav === '프로젝트' && renderDailyView()}
          {activeNav === '위임한 일' && renderDailyView()}
          {activeNav === '노트 검색' && renderDailyView()}
        </main>
      </div>

      {/* FLOATING QUICK CAPTURE INBOX BUTTON */}
      <button
        onClick={() => setInboxOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#2C3A4E] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 z-40"
      >
        <Inbox className="w-5 h-5" />
        {data.inbox.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#9E4747] text-white text-[10px] font-bold flex items-center justify-center">
            {data.inbox.length}
          </span>
        )}
      </button>

      {/* 6-STATUS POPOVER */}
      {statusPopover.open && statusPopover.task && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className={`w-full max-w-[340px] rounded-2xl border p-5 shadow-2xl ${theme.bgCard} ${theme.border}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className={`text-[10px] font-bold ${theme.textSecondary}`}>업무 상태</div>
                <h3 className="font-serif-kr text-base font-bold mt-0.5">{statusPopover.task.title}</h3>
              </div>
              <button onClick={() => setStatusPopover({ open: false, task: null })}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3">
              {[
                { key: 'done', icon: '✓', label: '완료', tint: 'bg-[#F3F6F3] text-[#3A5A40]' },
                { key: 'postponed', icon: '→', label: '연기', tint: 'bg-[#F7F2EB] text-[#8C583A]' },
                { key: 'cancelled', icon: '✕', label: '취소', tint: 'bg-[#F8EFEF] text-[#A94442]' },
                { key: 'delegated', icon: '⊙', label: '위임', tint: 'bg-[#F0F4F8] text-[#45617D]' },
                { key: 'in_progress', icon: '•', label: '진행 중', tint: 'bg-[#F4F2ED] text-[#2A2826]' },
                { key: 'todo', icon: '☐', label: '미시작', tint: 'bg-[#F4F2ED] text-[#2A2826]' }
              ].map((st) => {
                const isCurrent = statusPopover.task.status === st.key;
                return (
                  <button
                    key={st.key}
                    onClick={() => {
                      if (st.key === 'postponed') {
                        handleStatusChange(statusPopover.task, 'postponed', {
                          postponeDate: addDays(statusPopover.task.date, 1)
                        });
                      } else if (st.key === 'delegated') {
                        const who = prompt('위임할 담당자:', statusPopover.task.delegateTo || '팀원');
                        handleStatusChange(statusPopover.task, 'delegated', { delegateTo: who || '담당자' });
                      } else {
                        handleStatusChange(statusPopover.task, st.key);
                      }
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                      isCurrent ? 'border-[#2C3A4E] ring-1 ring-[#2C3A4E] bg-[#E9EFF5] text-[#2C3A4E]' : `${st.tint} border-transparent`
                    }`}
                  >
                    <span>{st.icon} {st.label}</span>
                    {isCurrent && <span className="text-[10px] opacity-75">현재</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* NEW/EDIT TASK MODAL */}
      {taskModal.open && taskModal.task && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className={`w-full max-w-[520px] rounded-2xl border p-6 shadow-2xl ${theme.bgCard} ${theme.border}`}>
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setTaskModal({ open: false, task: null })} className="text-xs hover:underline">취소</button>
              <span className="text-xs font-bold">{taskModal.task.id ? '업무 편집' : '새 업무'}</span>
              <button onClick={saveTaskModal} className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${theme.btnNavy}`}>저장</button>
            </div>
            <div className="mb-4">
              <label className={`block text-[11px] font-semibold mb-1 ${theme.textSecondary}`}>업무 제목</label>
              <input
                type="text"
                autoFocus
                value={taskModal.task.title}
                onChange={(e) => setTaskModal((p) => ({ ...p, task: { ...p.task, title: e.target.value } }))}
                placeholder="플래너 제작 완료하기"
                className={`w-full rounded-lg border px-3 py-2 font-serif-kr text-xl font-bold ${theme.bgInput}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${theme.textSecondary}`}>Daily 배정일</label>
                <input
                  type="date"
                  value={taskModal.task.date}
                  onChange={(e) => setTaskModal((p) => ({ ...p, task: { ...p.task, date: e.target.value } }))}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${theme.bgInput}`}
                />
              </div>
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${theme.textSecondary}`}>트랙</label>
                <select
                  value={taskModal.task.track}
                  onChange={(e) => setTaskModal((p) => ({ ...p, task: { ...p.task, track: e.target.value } }))}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${theme.bgInput}`}
                >
                  <option value="Personal">Personal</option>
                  <option value="Pastoral">Pastoral</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SCHEDULE MODAL */}
      {scheduleModal.open && scheduleModal.schedule && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className={`w-full max-w-[480px] rounded-2xl border p-6 shadow-2xl ${theme.bgCard} ${theme.border}`}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setScheduleModal({ open: false, schedule: null })} className="text-xs">취소</button>
              <span className="text-xs font-bold">새 일정</span>
              <button onClick={saveScheduleModal} className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${theme.btnNavy}`}>저장</button>
            </div>
            <input
              type="text"
              autoFocus
              value={scheduleModal.schedule.title}
              onChange={(e) => setScheduleModal((p) => ({ ...p, schedule: { ...p.schedule, title: e.target.value } }))}
              placeholder="일정 제목을 입력하세요"
              className="w-full bg-transparent font-serif-kr text-2xl font-bold focus:outline-none mb-4"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-semibold block mb-1">시작 시간</label>
                <input
                  type="time"
                  value={scheduleModal.schedule.startTime}
                  onChange={(e) => setScheduleModal((p) => ({ ...p, schedule: { ...p.schedule, startTime: e.target.value } }))}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${theme.bgInput}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold block mb-1">종료 시간</label>
                <input
                  type="time"
                  value={scheduleModal.schedule.endTime}
                  onChange={(e) => setScheduleModal((p) => ({ ...p, schedule: { ...p.schedule, endTime: e.target.value } }))}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${theme.bgInput}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CAPTURE INBOX MODAL */}
      {inboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className={`w-full max-w-[500px] rounded-2xl border p-6 shadow-2xl ${theme.bgCard} ${theme.border}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif-kr text-base font-bold">Inbox · 생각부터 적는다</h3>
              <button onClick={() => setInboxOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <textarea
              rows={3}
              value={inboxText}
              onChange={(e) => setInboxText(e.target.value)}
              placeholder="떠오른 생각이나 할 일을 적어두세요..."
              className={`w-full rounded-xl border p-3 text-xs mb-3 resize-none focus:outline-none ${theme.bgInput}`}
            />
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  if (!inboxText.trim()) return;
                  setData((prev) => ({
                    ...prev,
                    inbox: [{ id: `in_${Date.now()}`, text: inboxText.trim(), createdAt: selectedDate }, ...prev.inbox]
                  }));
                  setInboxText('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${theme.btnNavy}`}
              >
                + Inbox에 저장
              </button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {data.inbox.map((item) => (
                <div key={item.id} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${theme.borderLight}`}>
                  <span>{item.text}</span>
                  <button
                    onClick={() => {
                      const newT = {
                        id: `t_${Date.now()}`,
                        title: item.text,
                        date: selectedDate,
                        priority: 'A',
                        quadrant: 'Q1',
                        track: 'Personal',
                        status: 'todo',
                        memo: '',
                        projectId: null,
                        goalId: null,
                        delegateTo: ''
                      };
                      setData((p) => ({
                        ...p,
                        tasks: [...p.tasks, newT],
                        inbox: p.inbox.filter((i) => i.id !== item.id)
                      }));
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6EFE9] text-[#35583C]"
                  >
                    오늘 A에 배정
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
