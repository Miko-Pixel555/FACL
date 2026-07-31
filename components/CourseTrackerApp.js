"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutDashboard, Trophy, Upload, ClipboardCheck, Settings, Search,
  Sun, Moon, Languages, LogIn, LogOut, CheckCircle2, XCircle, Clock,
  Award, TrendingUp, Users, GraduationCap, FileCheck2, FileX2,
  ChevronRight, Plus, Trash2, Pencil, X, ZoomIn, FileText,
  UploadCloud, Medal, School, BookOpen, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { supabase } from "../lib/supabaseClient";

/* ---------------------------------------------------------------- */
/* Design tokens (from brief)                                        */
/* ---------------------------------------------------------------- */
const COLORS = {
  primary: "#2E7D32",
  secondary: "#4CAF50",
  accent: "#81C784",
  bg: "#F1F8E9",
  success: "#43A047",
  danger: "#E53935",
  warn: "#F9A825",
};
const PIE_COLORS = ["#2E7D32", "#4CAF50", "#81C784", "#A5D6A7", "#66BB6A", "#1B5E20"];

const T = {
  en: {
    dir: "ltr", font: "'Poppins', sans-serif",
    appName: "Course Tracker", tagline: "Certified progress, beautifully ranked.",
    nav: { dashboard: "Dashboard", submit: "Submit Course", leaderboard: "Leaderboard", review: "Certificate Review", admin: "Admin Panel", profile: "Student Profile" },
    login: "Admin Login", logout: "Log out", password: "Password", enter: "Enter Dashboard",
    loginHint: "Sign in with the admin account created in Supabase Auth.",
    stats: { total: "Total Students", subs: "Course Submissions", approved: "Approved Certificates", pending: "Pending Review", rejected: "Rejected", popular: "Most Popular Course", activeUni: "Most Active University" },
    submitTitle: "Submit Your Certificate", submitSub: "Fill in your details and upload proof of completion.",
    fullName: "Full Name", phone: "Phone Number", university: "University", faculty: "Faculty",
    course: "Course Name", category: "Category", completion: "Completion Date", notes: "Notes (optional)",
    upload: "Drag & drop your certificate, or click to browse", uploadHint: "PDF, JPG or PNG · max 5MB",
    submitBtn: "Submit Certificate", submitted: "Certificate submitted! Awaiting admin review.",
    dup: "You've already submitted this course with this phone number.",
    leaderboardTitle: "Leaderboard", leaderboardSub: "Ranked by approved courses only",
    rank: "Rank", student: "Student", approvedCount: "Approved Courses",
    reviewTitle: "Certificate Review", approve: "Approve", reject: "Reject", view: "View",
    reviewNotes: "Add a review note (optional)", pendingOnly: "Pending", all: "All",
    adminTitle: "Admin Panel", universities: "Universities", faculties: "Faculties",
    categories: "Categories", courses: "Courses", add: "Add", save: "Save", cancel: "Cancel",
    searchPlaceholder: "Search by name, phone, university...",
    profileSearch: "Search a student by name or phone", noStudent: "No student found. Try submitting a course first.",
    timeline: "Submission timeline", status: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
    coursesByCategory: "Courses by Category", studentsByUni: "Students by University",
    monthlyCompletions: "Monthly Completions", approvalRate: "Approval vs Rejection",
    recent: "Recent Submissions", top10: "Top 10 Students",
  },
  ar: {
    dir: "rtl", font: "'Cairo', sans-serif",
    appName: "متتبع الدورات", tagline: "تقدّم موثّق، بترتيب أنيق.",
    nav: { dashboard: "لوحة التحكم", submit: "إرسال دورة", leaderboard: "المتصدرون", review: "مراجعة الشهادات", admin: "لوحة الإدارة", profile: "ملف الطالب" },
    login: "دخول المشرف", logout: "تسجيل خروج", password: "كلمة المرور", enter: "دخول اللوحة",
    loginHint: "سجّل الدخول بحساب الأدمن اللي أنشأته في Supabase Auth.",
    stats: { total: "إجمالي الطلاب", subs: "إجمالي التقديمات", approved: "شهادات معتمدة", pending: "قيد المراجعة", rejected: "مرفوضة", popular: "الدورة الأكثر شيوعًا", activeUni: "الجامعة الأكثر نشاطًا" },
    submitTitle: "أرسل شهادتك", submitSub: "أدخل بياناتك وارفع إثبات إتمام الدورة.",
    fullName: "الاسم الكامل", phone: "رقم الهاتف", university: "الجامعة", faculty: "الكلية",
    course: "اسم الدورة", category: "التصنيف", completion: "تاريخ الإتمام", notes: "ملاحظات (اختياري)",
    upload: "اسحب وأفلت شهادتك، أو انقر للتصفح", uploadHint: "PDF أو JPG أو PNG · بحد أقصى 5 ميغابايت",
    submitBtn: "إرسال الشهادة", submitted: "تم إرسال الشهادة! بانتظار مراجعة المشرف.",
    dup: "لقد أرسلت هذه الدورة مسبقًا بهذا الرقم.",
    leaderboardTitle: "المتصدرون", leaderboardSub: "الترتيب حسب الدورات المعتمدة فقط",
    rank: "الترتيب", student: "الطالب", approvedCount: "الدورات المعتمدة",
    reviewTitle: "مراجعة الشهادات", approve: "قبول", reject: "رفض", view: "عرض",
    reviewNotes: "أضف ملاحظة مراجعة (اختياري)", pendingOnly: "قيد الانتظار", all: "الكل",
    adminTitle: "لوحة الإدارة", universities: "الجامعات", faculties: "الكليات",
    categories: "التصنيفات", courses: "الدورات", add: "إضافة", save: "حفظ", cancel: "إلغاء",
    searchPlaceholder: "ابحث بالاسم أو الهاتف أو الجامعة...",
    profileSearch: "ابحث عن طالب بالاسم أو الهاتف", noStudent: "لم يتم العثور على طالب. جرّب إرسال دورة أولاً.",
    timeline: "سجل التقديمات", status: { pending: "قيد الانتظار", approved: "معتمد", rejected: "مرفوض" },
    coursesByCategory: "الدورات حسب التصنيف", studentsByUni: "الطلاب حسب الجامعة",
    monthlyCompletions: "الإتمامات الشهرية", approvalRate: "نسبة القبول والرفض",
    recent: "أحدث التقديمات", top10: "أفضل 10 طلاب",
  }
};

/* ---------------------------------------------------------------- */
/* Seed data                                                          */
/* ---------------------------------------------------------------- */
const SEED_UNIS = ["Cairo University", "Ain Shams University", "Alexandria University", "AUC"];
const SEED_FACULTIES = ["Engineering", "Business", "Computer Science", "Medicine", "Arts"];
const SEED_CATEGORIES = ["Programming", "Data Science", "Design", "Business", "Languages"];
const SEED_COURSES = [
  { id: "c1", name: "React for Beginners", category: "Programming" },
  { id: "c2", name: "Python Data Analysis", category: "Data Science" },
  { id: "c3", name: "UI/UX Fundamentals", category: "Design" },
  { id: "c4", name: "Digital Marketing 101", category: "Business" },
  { id: "c5", name: "Business English", category: "Languages" },
  { id: "c6", name: "Machine Learning Basics", category: "Data Science" },
];

function seedSubmissions() {
  const names = ["Layla Hassan", "Omar Khaled", "Mona Ibrahim", "Youssef Ahmed", "Sara Mostafa", "Ali Reda", "Nour Adel", "Karim Fathy"];
  const subs = [];
  let id = 1;
  names.forEach((name, i) => {
    const uni = SEED_UNIS[i % SEED_UNIS.length];
    const fac = SEED_FACULTIES[i % SEED_FACULTIES.length];
    const phone = `010${1000000 + i * 137}`;
    const numCourses = 1 + (i % 4);
    for (let j = 0; j < numCourses; j++) {
      const course = SEED_COURSES[(i + j) % SEED_COURSES.length];
      subs.push({
        id: `s${id++}`,
        studentName: name, phone, university: uni, faculty: fac,
        courseId: course.id, courseName: course.name, category: course.category,
        completionDate: `2026-0${(j % 6) + 1}-1${j}`,
        notes: "", certificateName: "certificate.pdf",
        status: j === numCourses - 1 && i % 3 === 0 ? "pending" : (i % 5 === 0 ? "rejected" : "approved"),
        reviewNotes: "", createdAt: Date.now() - (id * 86400000),
      });
    }
  });
  return subs;
}

/* ---------------------------------------------------------------- */
/* Supabase row <-> app object mapping                                */
/* ---------------------------------------------------------------- */
function fromDbSubmission(r) {
  return {
    id: r.id, studentName: r.student_name, phone: r.phone, university: r.university,
    faculty: r.faculty, courseId: r.course_id, courseName: r.course_name, category: r.category,
    completionDate: r.completion_date, certificateUrl: r.certificate_url, certificateName: r.certificate_name,
    notes: r.notes, status: r.status, reviewNotes: r.review_notes,
    createdAt: new Date(r.created_at).getTime(),
  };
}

/* ---------------------------------------------------------------- */
/* Small UI atoms                                                     */
/* ---------------------------------------------------------------- */
function GlassCard({ children, className = "", dark }) {
  return (
    <div
      className={`rounded-[16px] p-5 border transition-all ${className}`}
      style={{
        background: dark ? "rgba(30,41,30,0.6)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: dark ? "rgba(129,199,132,0.15)" : "rgba(46,125,50,0.1)",
        boxShadow: dark ? "0 8px 30px rgba(0,0,0,0.3)" : "0 8px 30px rgba(46,125,50,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, dark, accent }) {
  const valueStr = String(value ?? "");
  const valueSizeClass = valueStr.length > 14 ? "text-sm" : valueStr.length > 8 ? "text-lg" : "text-2xl";
  return (
    <GlassCard dark={dark} className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent || COLORS.secondary}, ${COLORS.primary})` }}
      >
        <Icon size={22} color="white" />
      </div>
      <div className="min-w-0">
        <p className={`${valueSizeClass} font-bold leading-snug break-words ${dark ? "text-white" : "text-[#1B5E20]"}`}>{value}</p>
        <p className={`text-xs mt-0.5 leading-snug break-words ${dark ? "text-green-200/70" : "text-[#2E7D32]/70"}`}>{label}</p>
      </div>
    </GlassCard>
  );
}

function Badge({ status, t }) {
  const map = {
    approved: { bg: "#E8F5E9", fg: COLORS.success, icon: CheckCircle2 },
    pending: { bg: "#FFF8E1", fg: COLORS.warn, icon: Clock },
    rejected: { bg: "#FFEBEE", fg: COLORS.danger, icon: XCircle },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>
      <Icon size={13} /> {t.status[status]}
    </span>
  );
}

function RankBadge({ rank }) {
  const styles = {
    1: { bg: "linear-gradient(135deg,#FFD700,#FFA000)", label: "🥇" },
    2: { bg: "linear-gradient(135deg,#E0E0E0,#9E9E9E)", label: "🥈" },
    3: { bg: "linear-gradient(135deg,#D7A26E,#8D5524)", label: "🥉" },
  };
  if (styles[rank]) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shadow-md" style={{ background: styles[rank].bg }}>
        {styles[rank].label}
      </div>
    );
  }
  return <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-[#E8F5E9] text-[#2E7D32]">{rank}</div>;
}

/* ---------------------------------------------------------------- */
/* Main App                                                            */
/* ---------------------------------------------------------------- */
// `initialView` is only ever passed as "login" from the hidden admin-entry
// route (see app/<secret>/page.js). The public "/" route never passes it,
// and there is no button or nav item anywhere that leads to the login
// screen — so admins are the only ones who can reach it, by knowing that
// one long, unguessable URL.
export default function CourseTrackerApp({ initialView = "submit" }) {
  const [lang, setLang] = useState("ar");
  const [dark, setDark] = useState(false);
  const t = T[lang];

  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState(initialView);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    universities: [], faculties: [], categories: [], courses: [], submissions: [],
  });
  const [toast, setToast] = useState(null);

  // Hidden gesture to reveal the admin login button: press-and-drag the
  // little logo icon in the top-left far enough (no visual hint that
  // anything is happening) and the "Admin Login" button fades in next to
  // the theme toggle. Nothing else on the page can trigger it.
  const [adminBtnRevealed, setAdminBtnRevealed] = useState(false);
  const dragRef = useRef({ x: 0, active: false });
  const handleLogoPointerDown = (e) => {
    dragRef.current = { x: e.clientX, active: true };
  };
  const handleLogoPointerMove = (e) => {
    if (!dragRef.current.active || adminBtnRevealed) return;
    if (Math.abs(e.clientX - dragRef.current.x) > 45) {
      setAdminBtnRevealed(true);
    }
  };
  const handleLogoPointerUp = () => {
    dragRef.current = { x: 0, active: false };
  };

  // This passphrase is now the ONLY admin gate — there is no Supabase Auth
  // account behind it anymore. Note this is client-side only: anyone who
  // inspects the site's JS bundle can read GATE_PASSPHRASE in plain text,
  // and the database now accepts admin writes from the public anon key
  // (see the updated RLS policies in supabase/schema.sql). This trades
  // real security for simplicity — treat the site as "hidden by
  // obscurity", not as protected against a determined visitor.
  const GATE_PASSPHRASE = "FACL#egyptian4life";
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [gateErr, setGateErr] = useState("");

  const showToast = useCallback((msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchAll = useCallback(async () => {
    const [uniRes, facRes, catRes, courseRes, subRes] = await Promise.all([
      supabase.from("universities").select("*").order("name"),
      supabase.from("faculties").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("courses").select("*").order("name"),
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
    ]);
    setData({
      universities: (uniRes.data || []).map(r => r.name),
      faculties: (facRes.data || []).map(r => r.name),
      categories: (catRes.data || []).map(r => r.name),
      courses: (courseRes.data || []).map(r => ({ id: r.id, name: r.name, category: r.category })),
      submissions: (subRes.data || []).map(fromDbSubmission),
    });
  }, []);

  // initial load + realtime subscription
  // Admin access is now controlled purely by the client-side GATE_PASSPHRASE
  // below — there is no Supabase Auth session anymore, so nothing to
  // restore here on load.
  useEffect(() => {
    let channel;
    (async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);

      channel = supabase
        .channel("submissions-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
          fetchAll();
        })
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  useEffect(() => {
    const link = document.createElement("style");
    link.innerHTML = `
      * { font-family: ${t.font}; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: ${COLORS.accent}; border-radius: 8px; }
      @keyframes fadeUp { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
      .fade-up { animation: fadeUp .35s ease both; }
    `;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, [t.font]);

  const pageBg = dark ? "#0F1B10" : COLORS.bg;
  const textMain = dark ? "text-white" : "text-[#1B2E1B]";

  /* ---------------- derived stats ---------------- */
  // Groups values that differ only by case/extra spaces (e.g. "Suez canal"
  // vs " Suez Canal ") into a single bucket instead of splitting them into
  // separate bars. The first-seen spelling (trimmed) is kept as the label
  // shown in charts.
  const normKey = (v) => (v || "").trim().replace(/\s+/g, " ").toLowerCase();
  const groupCount = (list, getVal) => {
    const counts = {}; // normKey -> count
    const labels = {}; // normKey -> display label (first-seen)
    list.forEach(item => {
      const raw = (getVal(item) || "").trim().replace(/\s+/g, " ");
      const key = raw.toLowerCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
      if (!labels[key]) labels[key] = raw;
    });
    return Object.keys(counts).map(key => [labels[key], counts[key]]);
  };

  const stats = useMemo(() => {
    const subs = data.submissions;
    const students = new Map();
    subs.forEach(s => {
      if (!students.has(s.phone)) students.set(s.phone, { name: s.studentName, phone: s.phone, university: s.university, faculty: s.faculty });
    });
    const approved = subs.filter(s => s.status === "approved");
    const pending = subs.filter(s => s.status === "pending");
    const rejected = subs.filter(s => s.status === "rejected");

    const courseCountsList = groupCount(subs, s => s.courseName);
    const popular = courseCountsList.sort((a, b) => b[1] - a[1])[0];

    const uniCountsList = groupCount(subs, s => s.university);
    const activeUni = uniCountsList.sort((a, b) => b[1] - a[1])[0];
    const uniCounts = {};
    uniCountsList.forEach(([label, count]) => { uniCounts[label] = count; });

    const catCountsList = groupCount(subs, s => s.category);
    const catCounts = {};
    catCountsList.forEach(([label, count]) => { catCounts[label] = count; });

    const monthly = {};
    subs.forEach(s => {
      const m = (s.completionDate || "").slice(0, 7);
      monthly[m] = (monthly[m] || 0) + 1;
    });

    // Leaderboard = monthly competition: only approved submissions whose
    // completion date (or, failing that, submission date) falls in the
    // CURRENT calendar month count. Once a new month starts, last month's
    // approvals stop counting automatically and everyone starts back at
    // zero — no manual reset needed.
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthOf = (s) => (s.completionDate || "").slice(0, 7) || new Date(s.createdAt).toISOString().slice(0, 7);

    const rankMap = new Map();
    approved.filter(s => monthOf(s) === currentMonthKey).forEach(s => {
      const key = s.phone;
      if (!rankMap.has(key)) rankMap.set(key, { name: s.studentName, phone: s.phone, university: s.university, faculty: s.faculty, count: 0 });
      rankMap.get(key).count += 1;
    });
    const leaderboard = [...rankMap.values()].sort((a, b) => b.count - a.count);
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return {
      totalStudents: students.size, totalSubs: subs.length,
      approvedCount: approved.length, pendingCount: pending.length, rejectedCount: rejected.length,
      popular: popular ? popular[0] : "—", activeUni: activeUni ? activeUni[0] : "—",
      catCounts, uniCounts, monthly, leaderboard, monthLabel,
      recent: [...subs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    };
  }, [data.submissions]);

  const pieCatData = Object.entries(stats.catCounts).map(([name, value]) => ({ name, value }));
  const barUniData = Object.entries(stats.uniCounts).map(([name, value]) => ({ name, value }));
  const lineMonthly = Object.entries(stats.monthly).sort().map(([name, value]) => ({ name, value }));
  const approvalPie = [
    { name: t.status.approved, value: stats.approvedCount },
    { name: t.status.pending, value: stats.pendingCount },
    { name: t.status.rejected, value: stats.rejectedCount },
  ];

  /* ---------------- act
