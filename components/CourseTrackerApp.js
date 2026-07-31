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
  return (
    <GlassCard dark={dark} className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent || COLORS.secondary}, ${COLORS.primary})` }}
      >
        <Icon size={22} color="white" />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold truncate ${dark ? "text-white" : "text-[#1B5E20]"}`}>{value}</p>
        <p className={`text-xs mt-0.5 truncate ${dark ? "text-green-200/70" : "text-[#2E7D32]/70"}`}>{label}</p>
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
  const [lang, setLang] = useState("en");
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
  const stats = useMemo(() => {
    const subs = data.submissions;
    const students = new Map();
    subs.forEach(s => {
      if (!students.has(s.phone)) students.set(s.phone, { name: s.studentName, phone: s.phone, university: s.university, faculty: s.faculty });
    });
    const approved = subs.filter(s => s.status === "approved");
    const pending = subs.filter(s => s.status === "pending");
    const rejected = subs.filter(s => s.status === "rejected");

    const courseCounts = {};
    subs.forEach(s => { courseCounts[s.courseName] = (courseCounts[s.courseName] || 0) + 1; });
    const popular = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];

    const uniCounts = {};
    subs.forEach(s => { uniCounts[s.university] = (uniCounts[s.university] || 0) + 1; });
    const activeUni = Object.entries(uniCounts).sort((a, b) => b[1] - a[1])[0];

    const catCounts = {};
    subs.forEach(s => { catCounts[s.category] = (catCounts[s.category] || 0) + 1; });

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

  /* ---------------- actions (all hit the real database) ---------------- */

  // Students never authenticate — this insert only ever creates a 'pending'
  // row; a DB trigger (see supabase/schema.sql) forces status='pending' no
  // matter what the client sends, and RLS blocks anon UPDATEs entirely.
  // So a submission can NEVER count until an authenticated admin reviews it.
  const addSubmission = async (payload, file) => {
    const dup = data.submissions.some(s => s.phone === payload.phone && s.courseName === payload.courseName);
    if (dup) return { ok: false, reason: "dup" };

    let certificateUrl = null;
    if (file) {
      const path = `${payload.phone}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("certificates").upload(path, file);
      if (upErr) return { ok: false, reason: "upload", message: upErr.message };
      const { data: pub } = supabase.storage.from("certificates").getPublicUrl(path);
      certificateUrl = pub?.publicUrl || null;
    }

    const { error } = await supabase.from("submissions").insert({
      student_name: payload.studentName, phone: payload.phone, university: payload.university,
      faculty: payload.faculty, course_id: null, course_name: payload.courseName || "",
      category: "", completion_date: payload.completionDate || null,
      notes: payload.notes || "", certificate_url: certificateUrl, certificate_name: file?.name || null,
    });
    if (error) return { ok: false, reason: "db", message: error.message };
    await fetchAll();
    return { ok: true };
  };

  // Only reachable from admin-only views, and RLS additionally rejects this
  // UPDATE server-side unless the request carries an authenticated session.
  const updateSubmissionStatus = async (id, status, reviewNotes) => {
    const { error } = await supabase.from("submissions")
      .update({ status, review_notes: reviewNotes ?? null })
      .eq("id", id);
    if (!error) await fetchAll();
    return { ok: !error, message: error?.message };
  };

  const TABLE_BY_KEY = { universities: "universities", faculties: "faculties", categories: "categories" };
  const addItem = async (key, value) => {
    if (!value.trim() || data[key].includes(value)) return;
    const { error } = await supabase.from(TABLE_BY_KEY[key]).insert({ name: value.trim() });
    if (!error) await fetchAll();
  };
  const removeItem = async (key, value) => {
    const { error } = await supabase.from(TABLE_BY_KEY[key]).delete().eq("name", value);
    if (!error) await fetchAll();
  };
  const addCourse = async (name, category) => {
    if (!name.trim()) return;
    const { error } = await supabase.from("courses").insert({ name: name.trim(), category });
    if (!error) await fetchAll();
  };
  const removeCourse = async (id) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) await fetchAll();
  };

  const doLogout = () => {
    setIsAdmin(false);
    setGateUnlocked(false);
    setGateInput("");
    setView("submit");
  };

  /* ---------------- render ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: COLORS.accent, borderTopColor: COLORS.primary }} />
          <p style={{ color: COLORS.primary }} className="font-medium">Loading Course Tracker…</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard, adminOnly: true },
    { key: "submit", label: t.nav.submit, icon: Upload, adminOnly: false },
    { key: "leaderboard", label: t.nav.leaderboard, icon: Trophy, adminOnly: false },
    { key: "profile", label: t.nav.profile, icon: GraduationCap, adminOnly: false },
    { key: "review", label: t.nav.review, icon: ClipboardCheck, adminOnly: true },
    { key: "admin", label: t.nav.admin, icon: Settings, adminOnly: true },
  ];

  return (
    <div dir={t.dir} className={`min-h-screen w-full ${textMain}`} style={{ background: dark ? pageBg : `linear-gradient(180deg, ${COLORS.bg} 0%, #E8F5E9 100%)` }}>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ background: dark ? "rgba(15,27,16,0.85)" : "rgba(241,248,233,0.85)", borderColor: dark ? "rgba(129,199,132,0.15)" : "rgba(46,125,50,0.12)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              onPointerDown={handleLogoPointerDown}
              onPointerMove={handleLogoPointerMove}
              onPointerUp={handleLogoPointerUp}
              onPointerLeave={handleLogoPointerUp}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-default select-none touch-none"
              style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <p className="font-bold leading-tight" style={{ color: dark ? "white" : COLORS.primary }}>{t.appName}</p>
              <p className="text-[10px] leading-tight opacity-60 hidden sm:block">{t.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5" title="Language">
              <Languages size={17} style={{ color: dark ? COLORS.accent : COLORS.primary }} />
            </button>
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5" title="Theme">
              {dark ? <Sun size={17} color={COLORS.accent} /> : <Moon size={17} color={COLORS.primary} />}
            </button>
            {isAdmin && (
              <button onClick={doLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: COLORS.danger }}>
                <LogOut size={14} /> {t.logout}
              </button>
            )}
            {/* Admin Login button is invisible by default — it only appears
                after the hidden drag gesture on the logo icon (see above). */}
            {!isAdmin && adminBtnRevealed && (
              <button onClick={() => setView("login")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white fade-up" style={{ background: COLORS.primary }}>
                <LogIn size={14} /> {t.login}
              </button>
            )}
            <a href="https://elearning.fao.org" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:shadow-md transition-all"
              style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
              <BookOpen size={14} /> {lang === "en" ? "Browse FAO Courses" : "تصفح كورسات FAO"}
            </a>
          </div>
        </div>
        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex gap-1.5 overflow-x-auto">
          {navItems.filter(n => !n.adminOnly || isAdmin).map(n => {
            const Icon = n.icon;
            const active = view === n.key;
            return (
              <button key={n.key} onClick={() => setView(n.key)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`, color: "white", boxShadow: "0 4px 14px rgba(46,125,50,0.35)" }
                  : { color: dark ? "#C8E6C9" : COLORS.primary, background: dark ? "rgba(255,255,255,0.04)" : "rgba(46,125,50,0.06)" }}>
                <Icon size={14} /> {n.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 fade-up" key={view}>
        {view === "login" && (
          <div className="max-w-md mx-auto mt-10">
            <GlassCard dark={dark} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
                <LogIn size={24} color="white" />
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: dark ? "white" : COLORS.primary }}>
                {t.login}
              </h2>
              <input type="password" value={gateInput} onChange={e => setGateInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key !== "Enter") return;
                  if (gateInput === GATE_PASSPHRASE) { setIsAdmin(true); setGateUnlocked(true); setGateErr(""); setGateInput(""); setView("dashboard"); }
                  else setGateErr(lang === "en" ? "Wrong password." : "كلمة المرور غلط.");
                }}
                placeholder={t.password}
                className="w-full px-4 py-2.5 rounded-xl border outline-none mb-2 text-sm text-center"
                style={{ borderColor: COLORS.accent, background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
              {gateErr && <p className="text-xs mb-2" style={{ color: COLORS.danger }}>{gateErr}</p>}
              <button onClick={() => {
                if (gateInput === GATE_PASSPHRASE) { setIsAdmin(true); setGateUnlocked(true); setGateErr(""); setGateInput(""); setView("dashboard"); }
                else setGateErr(lang === "en" ? "Wrong password." : "كلمة المرور غلط.");
              }} className="w-full py-2.5 rounded-xl font-semibold text-white mt-2 hover:shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
                {t.enter}
              </button>
            </GlassCard>
          </div>
        )}

        {view === "dashboard" && isAdmin && (
          <DashboardView t={t} dark={dark} stats={stats} pieCatData={pieCatData} barUniData={barUniData}
            lineMonthly={lineMonthly} approvalPie={approvalPie} />
        )}

        {view === "submit" && (
          <SubmitView t={t} dark={dark} data={data} onSubmit={addSubmission} showToast={showToast} lang={lang} />
        )}

        {view === "leaderboard" && (
          <LeaderboardView t={t} dark={dark} leaderboard={stats.leaderboard} universities={data.universities} monthLabel={stats.monthLabel} lang={lang} />
        )}

        {view === "profile" && (
          <ProfileView t={t} dark={dark} submissions={data.submissions} />
        )}

        {view === "review" && isAdmin && (
          <ReviewView t={t} dark={dark} submissions={data.submissions} onUpdate={updateSubmissionStatus} showToast={showToast} lang={lang} />
        )}

        {view === "admin" && isAdmin && (
          <AdminView t={t} dark={dark} data={data} addItem={addItem} removeItem={removeItem} addCourse={addCourse} removeCourse={removeCourse} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 inset-x-0 flex justify-center z-50 px-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium text-white"
            style={{ background: toast.kind === "error" ? COLORS.danger : COLORS.success }}>
            {toast.kind === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Dashboard                                                          */
/* ---------------------------------------------------------------- */
function DashboardView({ t, dark, stats, pieCatData, barUniData, lineMonthly, approvalPie }) {
  const cardText = dark ? "#E8F5E9" : "#1B2E1B";
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t.stats.total} value={stats.totalStudents} dark={dark} />
        <StatCard icon={FileText} label={t.stats.subs} value={stats.totalSubs} dark={dark} accent="#66BB6A" />
        <StatCard icon={FileCheck2} label={t.stats.approved} value={stats.approvedCount} dark={dark} accent={COLORS.success} />
        <StatCard icon={Clock} label={t.stats.pending} value={stats.pendingCount} dark={dark} accent={COLORS.warn} />
        <StatCard icon={FileX2} label={t.stats.rejected} value={stats.rejectedCount} dark={dark} accent={COLORS.danger} />
        <StatCard icon={TrendingUp} label={t.stats.popular} value={stats.popular} dark={dark} accent="#388E3C" />
        <StatCard icon={School} label={t.stats.activeUni} value={stats.activeUni} dark={dark} accent="#2E7D32" />
        <StatCard icon={Award} label={t.top10} value={stats.leaderboard.length} dark={dark} accent="#1B5E20" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.coursesByCategory}</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieCatData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {pieCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip /> <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.studentsByUni}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barUniData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.monthlyCompletions}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineMonthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.approvalRate}</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={approvalPie} dataKey="value" nameKey="name" outerRadius={80} label>
                <Cell fill={COLORS.success} /><Cell fill={COLORS.warn} /><Cell fill={COLORS.danger} />
              </Pie>
              <Tooltip /> <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.top10}</p>
          <div className="space-y-2">
            {stats.leaderboard.slice(0, 10).map((s, i) => (
              <div key={s.phone} className="flex items-center gap-3 py-1.5 border-b last:border-0" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                <RankBadge rank={i + 1} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: cardText }}>{s.name}</p>
                  <p className="text-[11px] opacity-60 truncate">{s.university}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{s.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard dark={dark}>
          <p className="font-semibold mb-3" style={{ color: cardText }}>{t.recent}</p>
          <div className="space-y-2">
            {stats.recent.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: cardText }}>{s.studentName}</p>
                  <p className="text-[11px] opacity-60 truncate">{s.courseName}</p>
                </div>
                <Badge status={s.status} t={t} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Submit                                                              */
/* ---------------------------------------------------------------- */
function SubmitView({ t, dark, data, onSubmit, showToast, lang }) {
  const [form, setForm] = useState({
    studentName: "", phone: "", university: "", faculty: "",
    courseName: "", completionDate: "", notes: "",
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fileErr, setFileErr] = useState("");

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm";
  const inputStyle = { borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" };
  const label = "text-xs font-semibold mb-1.5 block opacity-80";

  const handleFile = (f) => {
    if (!f) return;
    const okTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!okTypes.includes(f.type)) { setFileErr(lang === "en" ? "Only PDF, JPG or PNG allowed." : "يُسمح فقط بـ PDF أو JPG أو PNG."); return; }
    if (f.size > 5 * 1024 * 1024) { setFileErr(lang === "en" ? "File must be under 5MB." : "يجب أن يكون الملف أقل من 5 ميغابايت."); return; }
    setFileErr(""); setFile(f);
  };

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!form.studentName || !form.phone || !form.courseName || !file) {
      showToast(lang === "en" ? "Please fill required fields and attach a certificate." : "يرجى تعبئة الحقول المطلوبة وإرفاق الشهادة.", "error");
      return;
    }
    setSubmitting(true);
    const res = await onSubmit(form, file);
    setSubmitting(false);
    if (!res.ok && res.reason === "dup") { showToast(t.dup, "error"); return; }
    if (!res.ok) { showToast(res.message || (lang === "en" ? "Something went wrong." : "حدث خطأ ما."), "error"); return; }
    showToast(t.submitted);
    setForm({ studentName: "", phone: "", university: "", faculty: "", courseName: "", completionDate: "", notes: "" });
    setFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <GlassCard dark={dark}>
        <h2 className="text-xl font-bold mb-1" style={{ color: dark ? "white" : COLORS.primary }}>{t.submitTitle}</h2>
        <p className="text-xs opacity-60 mb-5">{t.submitSub}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={label}>{t.fullName} *</label>
            <input className={inputCls} style={inputStyle} value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} /></div>
          <div><label className={label}>{t.phone} *</label>
            <input className={inputCls} style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className={label}>{t.university}</label>
            <input className={inputCls} style={inputStyle} value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} /></div>
          <div><label className={label}>{t.faculty}</label>
            <input className={inputCls} style={inputStyle} value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} /></div>
          <div><label className={label}>{t.course}</label>
            <input className={inputCls} style={inputStyle} value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} />
            <a href="https://elearning.fao.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] mt-1.5 font-medium hover:underline" style={{ color: COLORS.primary }}>
              <BookOpen size={11} /> {lang === "en" ? "Not sure which course? Browse FAO courses" : "مش عارف تختار كورس؟ تصفح كورسات FAO"}
            </a>
          </div>
          <div><label className={label}>{t.completion}</label>
            <input type="date" className={inputCls} style={inputStyle} value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} /></div>
        </div>

        <div className="mt-4">
          <label className={label}>{t.notes}</label>
          <textarea className={inputCls} style={inputStyle} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="mt-4">
          <label
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer text-center transition-all"
            style={{ borderColor: dragging ? COLORS.primary : COLORS.accent, background: dragging ? "rgba(129,199,132,0.15)" : "transparent" }}>
            <UploadCloud size={26} color={COLORS.primary} />
            <p className="text-sm font-medium">{file ? file.name : t.upload}</p>
            <p className="text-[11px] opacity-60">{t.uploadHint}</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </label>
          {fileErr && <p className="text-xs mt-1.5" style={{ color: COLORS.danger }}>{fileErr}</p>}
        </div>

        <button onClick={submit} disabled={submitting} className="w-full mt-5 py-3 rounded-xl font-semibold text-white hover:shadow-lg transition-all disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
          {submitting ? "…" : t.submitBtn}
        </button>
      </GlassCard>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Leaderboard                                                        */
/* ---------------------------------------------------------------- */
function LeaderboardView({ t, dark, leaderboard, universities, monthLabel, lang }) {
  const [q, setQ] = useState("");
  const [uniFilter, setUniFilter] = useState("all");
  const filtered = leaderboard.filter(s =>
    (uniFilter === "all" || s.university === uniFilter) &&
    (s.name.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q))
  );
  return (
    <div>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold" style={{ color: dark ? "white" : COLORS.primary }}>{t.leaderboardTitle}</h2>
          <p className="text-xs opacity-60">{t.leaderboardSub}</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shrink-0" style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
          🏆 {lang === "en" ? `${monthLabel} Competition` : `مسابقة ${monthLabel}`}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
        </div>
        <select value={uniFilter} onChange={e => setUniFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }}>
          <option value="all">{t.all}</option>
          {universities.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="grid gap-2.5">
        {filtered.map((s, i) => {
          const rank = leaderboard.indexOf(s) + 1;
          return (
            <GlassCard key={s.phone} dark={dark} className="flex items-center gap-4 !py-3.5">
              <RankBadge rank={rank} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate" style={{ color: dark ? "white" : "#1B2E1B" }}>{s.name}</p>
                <p className="text-[11px] opacity-60 truncate">{s.university} · {s.faculty}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: COLORS.primary }}>{s.count}</p>
                <p className="text-[10px] opacity-50">{t.approvedCount}</p>
              </div>
            </GlassCard>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-sm opacity-50 py-10">—</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Profile                                                            */
/* ---------------------------------------------------------------- */
function ProfileView({ t, dark, submissions }) {
  const [q, setQ] = useState("");
  const match = q ? submissions.filter(s => s.studentName.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q)) : [];
  const phone = match[0]?.phone;
  const studentSubs = phone ? submissions.filter(s => s.phone === phone).sort((a, b) => b.createdAt - a.createdAt) : [];
  const info = match[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative mb-6">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-50" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.profileSearch}
          className="w-full pl-9 pr-3 py-3 rounded-xl border text-sm outline-none"
          style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
      </div>

      {q && !info && <p className="text-center text-sm opacity-50 py-10">{t.noStudent}</p>}

      {info && (
        <div className="space-y-5">
          <GlassCard dark={dark}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})` }}>
                {info.studentName[0]}
              </div>
              <div>
                <p className="font-bold" style={{ color: dark ? "white" : "#1B2E1B" }}>{info.studentName}</p>
                <p className="text-xs opacity-60">{info.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="opacity-50 text-xs">{t.university}</p><p className="font-medium">{info.university}</p></div>
              <div><p className="opacity-50 text-xs">{t.faculty}</p><p className="font-medium">{info.faculty}</p></div>
              <div><p className="opacity-50 text-xs">{t.stats.approved}</p><p className="font-medium">{studentSubs.filter(s => s.status === "approved").length}</p></div>
              <div><p className="opacity-50 text-xs">{t.stats.subs}</p><p className="font-medium">{studentSubs.length}</p></div>
            </div>
          </GlassCard>

          <GlassCard dark={dark}>
            <p className="font-semibold mb-3">{t.timeline}</p>
            <div className="space-y-3">
              {studentSubs.map(s => (
                <div key={s.id} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <FileText size={16} className="mt-0.5 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.courseName}</p>
                    <p className="text-[11px] opacity-60">{s.completionDate} · {s.category}</p>
                    {s.reviewNotes && <p className="text-[11px] mt-1 italic opacity-70">"{s.reviewNotes}"</p>}
                  </div>
                  <Badge status={s.status} t={t} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Review                                                              */
/* ---------------------------------------------------------------- */
function ReviewView({ t, dark, submissions, onUpdate, showToast, lang }) {
  const [filter, setFilter] = useState("pending");
  const [q, setQ] = useState("");
  const [zoom, setZoom] = useState(null);
  const [notes, setNotes] = useState({});

  const list = submissions
    .filter(s => filter === "all" || s.status === filter)
    .filter(s => s.studentName.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold" style={{ color: dark ? "white" : COLORS.primary }}>{t.reviewTitle}</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 opacity-50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
        </div>
        <div className="flex gap-1.5">
          {["pending", "approved", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap"
              style={filter === f ? { background: COLORS.primary, color: "white" } : { background: dark ? "rgba(255,255,255,0.06)" : "rgba(46,125,50,0.08)", color: dark ? "white" : COLORS.primary }}>
              {f === "all" ? t.all : t.status[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {list.map(s => (
          <GlassCard key={s.id} dark={dark}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setZoom(s)} className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center border-2 border-dashed hover:border-solid transition-all" style={{ borderColor: COLORS.accent }}>
                  <FileText size={20} color={COLORS.primary} />
                </button>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{s.studentName} <span className="font-normal opacity-50">· {s.phone}</span></p>
                  <p className="text-xs opacity-70 truncate">{s.courseName} — {s.university}</p>
                  <p className="text-[11px] opacity-50">{s.completionDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge status={s.status} t={t} />
                {s.status === "pending" && (
                  <>
                    <button onClick={async () => {
                      const res = await onUpdate(s.id, "approved", notes[s.id]);
                      showToast(res.ok ? (lang === "en" ? "Approved" : "تم القبول") : (res.message || "Error"), res.ok ? "success" : "error");
                    }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1" style={{ background: COLORS.success }}>
                      <CheckCircle2 size={13} /> {t.approve}
                    </button>
                    <button onClick={async () => {
                      const res = await onUpdate(s.id, "rejected", notes[s.id]);
                      showToast(res.ok ? (lang === "en" ? "Rejected" : "تم الرفض") : (res.message || "Error"), res.ok ? "error" : "error");
                    }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1" style={{ background: COLORS.danger }}>
                      <XCircle size={13} /> {t.reject}
                    </button>
                  </>
                )}
              </div>
            </div>
            {s.status === "pending" && (
              <input placeholder={t.reviewNotes} value={notes[s.id] || ""} onChange={e => setNotes({ ...notes, [s.id]: e.target.value })}
                className="w-full mt-3 px-3 py-2 rounded-lg border text-xs outline-none"
                style={{ borderColor: "rgba(46,125,50,0.2)", background: dark ? "rgba(255,255,255,0.04)" : "white", color: dark ? "white" : "black" }} />
            )}
          </GlassCard>
        ))}
        {list.length === 0 && <p className="text-center text-sm opacity-50 py-10">—</p>}
      </div>

      {zoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setZoom(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <p className="font-semibold text-[#1B2E1B]">{zoom.certificateName}</p>
            <p className="text-xs opacity-60 mt-1 mb-3">{zoom.studentName} · {zoom.courseName}</p>
            {zoom.certificateUrl ? (
              zoom.certificateName?.toLowerCase().endsWith(".pdf") ? (
                <a href={zoom.certificateUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-8 rounded-xl border-2 border-dashed text-sm font-semibold"
                  style={{ borderColor: COLORS.accent, color: COLORS.primary }}>
                  <FileText size={32} className="mx-auto mb-2" />
                  {lang === "en" ? "Open PDF in new tab" : "افتح ملف الـPDF في تاب جديد"}
                </a>
              ) : (
                <img src={zoom.certificateUrl} alt={zoom.certificateName || "certificate"}
                  className="w-full rounded-xl border" style={{ borderColor: COLORS.accent }} />
              )
            ) : (
              <p className="text-[11px] opacity-50 py-6">
                {lang === "en" ? "No certificate file was attached to this submission." : "لا يوجد ملف شهادة مرفق بهذا التقديم."}
              </p>
            )}
            <button onClick={() => setZoom(null)} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: COLORS.primary }}>
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Admin                                                               */
/* ---------------------------------------------------------------- */
function ManagedList({ title, items, onAdd, onRemove, dark, t, icon: Icon }) {
  const [val, setVal] = useState("");
  return (
    <GlassCard dark={dark}>
      <p className="font-semibold mb-3 flex items-center gap-2"><Icon size={16} color={COLORS.primary} /> {title}</p>
      <div className="flex gap-2 mb-3">
        <input value={val} onChange={e => setVal(e.target.value)} placeholder={t.add}
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
        <button onClick={() => { onAdd(val); setVal(""); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: COLORS.primary }}>
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {items.map(it => (
          <div key={it} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm" style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(46,125,50,0.05)" }}>
            <span className="truncate">{it}</span>
            <button onClick={() => onRemove(it)} className="opacity-50 hover:opacity-100 shrink-0"><Trash2 size={13} color={COLORS.danger} /></button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function AdminView({ t, dark, data, addItem, removeItem, addCourse, removeCourse }) {
  const [cName, setCName] = useState("");
  const [cCat, setCCat] = useState(data.categories[0] || "");
  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ color: dark ? "white" : COLORS.primary }}>{t.adminTitle}</h2>
      <div className="grid md:grid-cols-2 gap-5">
        <ManagedList title={t.universities} items={data.universities} onAdd={v => addItem("universities", v)} onRemove={v => removeItem("universities", v)} dark={dark} t={t} icon={School} />
        <ManagedList title={t.faculties} items={data.faculties} onAdd={v => addItem("faculties", v)} onRemove={v => removeItem("faculties", v)} dark={dark} t={t} icon={GraduationCap} />
        <ManagedList title={t.categories} items={data.categories} onAdd={v => addItem("categories", v)} onRemove={v => removeItem("categories", v)} dark={dark} t={t} icon={BookOpen} />

        <GlassCard dark={dark}>
          <p className="font-semibold mb-3 flex items-center gap-2"><BookOpen size={16} color={COLORS.primary} /> {t.courses}</p>
          <div className="flex gap-2 mb-3">
            <input value={cName} onChange={e => setCName(e.target.value)} placeholder={t.course}
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }} />
            <select value={cCat} onChange={e => setCCat(e.target.value)}
              className="px-2 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: "rgba(46,125,50,0.25)", background: dark ? "rgba(255,255,255,0.05)" : "white", color: dark ? "white" : "black" }}>
              {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { addCourse(cName, cCat); setCName(""); }} className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: COLORS.primary }}>
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {data.courses.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm" style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(46,125,50,0.05)" }}>
                <span className="truncate">{c.name} <span className="opacity-50 text-xs">· {c.category}</span></span>
                <button onClick={() => removeCourse(c.id)} className="opacity-50 hover:opacity-100 shrink-0"><Trash2 size={13} color={COLORS.danger} /></button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
