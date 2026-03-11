"use client";
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course {
  id: number;
  crop: string;
  crop_sw: string;
  emoji: string;
  topic: string;
  topic_sw: string;
  level: string;
  level_sw: string;
  duration: string;
  category: string;
  category_sw: string;
  color: string;
  accent: string;
}

interface CourseContent {
  content: string;
  tips: string[];
  modern_techniques: string[];
}

type Language = "english" | "kiswahili";

// ─── UI Text ──────────────────────────────────────────────────────────────────
const UI_TEXT = {
  english: {
    title: "Learning Hub",
    subtitle: "Modern farming techniques for maximum yield",
    search: "Search crops or topics...",
    allLevels: "All Levels",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    startLearning: "Start Learning",
    loading: "Generating AI content...",
    tips: "💡 Key Tips",
    modernTech: "🚀 Modern Techniques",
    back: "Back to Courses",
    minutes: "min",
    courses: "courses",
    noResults: "No courses match your search.",
    levelBadge: { Beginner: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced" } as Record<string, string>,
    errorMsg: "Failed to load content. Please check your connection and try again.",
    retry: "Retry",
  },
  kiswahili: {
    title: "Kitovu cha Kujifunza",
    subtitle: "Mbinu za kisasa za kilimo kwa mavuno mengi",
    search: "Tafuta mazao au mada...",
    allLevels: "Viwango Vyote",
    beginner: "Mwanzo",
    intermediate: "Kati",
    advanced: "Juu",
    startLearning: "Anza Kujifunza",
    loading: "Inatengeneza maudhui ya AI...",
    tips: "💡 Vidokezo Muhimu",
    modernTech: "🚀 Mbinu za Kisasa",
    back: "Rudi kwa Kozi",
    minutes: "dak",
    courses: "kozi",
    noResults: "Hakuna kozi zinazolingana na utafutaji wako.",
    levelBadge: { Beginner: "Mwanzo", Intermediate: "Kati", Advanced: "Juu" } as Record<string, string>,
    errorMsg: "Imeshindwa kupakia maudhui. Tafadhali angalia muunganiko wako na ujaribu tena.",
    retry: "Jaribu Tena",
  },
};

// ─── Static styles ─────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  wrapper: { fontFamily: "'DM Sans', sans-serif", color: "#1a3a2a", minHeight: "100vh", padding: "0" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
  titleBlock: { display: "flex", flexDirection: "column" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, color: "#1a3a2a", margin: 0, lineHeight: 1.1 },
  subtitle: { fontSize: "14px", color: "#4a8c5c", marginTop: "4px" },
  langToggle: { display: "flex", background: "#f0f7f2", borderRadius: "50px", padding: "4px", gap: "4px", border: "1px solid #c8e6c9" },
  controls: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchBox: { flex: 1, minWidth: "200px", padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #c8e6c9", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#1a3a2a", background: "#fff", outline: "none" },
  select: { padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #c8e6c9", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#1a3a2a", background: "#fff", cursor: "pointer", outline: "none" },
  categoryRow: { display: "flex", gap: "8px", overflowX: "auto", marginBottom: "20px", paddingBottom: "4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" },
  cardEmoji: { fontSize: "38px", lineHeight: 1 },
  cardCrop: { fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#1a3a2a", margin: 0 },
  cardTopic: { fontSize: "13px", color: "#4a7c5a", lineHeight: 1.4, margin: 0 },
  cardMeta: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  durationBadge: { padding: "3px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: 600, background: "rgba(0,0,0,0.06)", color: "#555", marginLeft: "auto" },
  noResults: { textAlign: "center", padding: "48px 20px", color: "#888", fontSize: "15px", gridColumn: "1/-1" },
  statsText: { fontSize: "13px", color: "#888", marginBottom: "16px" },
  detailWrap: { display: "flex", flexDirection: "column", gap: "24px" },
  detailHeader: { background: "linear-gradient(135deg, #1a3a2a 0%, #2d5c3e 100%)", borderRadius: "20px", padding: "32px", color: "#fff", display: "flex", gap: "20px", alignItems: "flex-start" },
  detailEmoji: { fontSize: "52px", lineHeight: 1, flexShrink: 0 },
  detailTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, margin: 0, lineHeight: 1.2 },
  detailSubtitle: { fontSize: "14px", opacity: 0.8, marginTop: "6px" },
  detailBadges: { display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" },
  detailBadge: { padding: "4px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, background: "rgba(255,255,255,0.2)", color: "#fff" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "16px" },
  spinner: { width: "44px", height: "44px", borderRadius: "50%", border: "4px solid #e8f5e9", borderTopColor: "#4a8c5c", animation: "spin 0.9s linear infinite" },
  loadingText: { color: "#4a8c5c", fontSize: "14px", fontWeight: 600 },
  contentCard: { background: "#fff", borderRadius: "16px", padding: "28px", border: "1.5px solid #e8f5e9", lineHeight: 1.75, fontSize: "15px", color: "#2d4a3e" },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#1a3a2a", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" },
  tipsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" },
  tipCard: { background: "#f0f7f2", borderRadius: "12px", padding: "14px 16px", fontSize: "13px", color: "#2d5c3e", borderLeft: "3px solid #4a8c5c", lineHeight: 1.5 },
  techCard: { background: "linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%)", borderRadius: "12px", padding: "14px 16px", fontSize: "13px", color: "#7a3a00", borderLeft: "3px solid #e07b2a", lineHeight: 1.5 },
  errorBox: { background: "#fff5f5", border: "1.5px solid #ffcdd2", borderRadius: "14px", padding: "24px", textAlign: "center", color: "#c62828" },
  retryBtn: { marginTop: "12px", padding: "10px 28px", borderRadius: "10px", border: "none", background: "#e07b2a", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#4a8c5c", fontSize: "14px", fontWeight: 700, cursor: "pointer", padding: "0", fontFamily: "'DM Sans', sans-serif" },
};

// ─── Dynamic style helpers (functions kept outside static object) ──────────────
const langBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 18px",
  borderRadius: "50px",
  border: "none",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  transition: "all 0.25s ease",
  background: active ? "#2d5c3e" : "transparent",
  color: active ? "#fff" : "#4a8c5c",
  boxShadow: active ? "0 2px 8px rgba(45,92,62,0.25)" : "none",
});

const cardStyle = (color: string): React.CSSProperties => ({
  background: color,
  borderRadius: "16px",
  padding: "22px",
  border: "1.5px solid rgba(0,0,0,0.06)",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  position: "relative",
  overflow: "hidden",
});

const badgeStyle = (accent: string): React.CSSProperties => ({
  padding: "3px 10px",
  borderRadius: "50px",
  fontSize: "11px",
  fontWeight: 700,
  background: accent + "22",
  color: accent,
  border: `1px solid ${accent}44`,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const startBtnStyle = (accent: string): React.CSSProperties => ({
  marginTop: "4px",
  padding: "10px 0",
  borderRadius: "10px",
  border: "none",
  background: accent,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  width: "100%",
  transition: "opacity 0.2s",
});

const categoryTabStyle = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  borderRadius: "50px",
  border: `1.5px solid ${active ? "#2d5c3e" : "#c8e6c9"}`,
  background: active ? "#2d5c3e" : "#fff",
  color: active ? "#fff" : "#4a8c5c",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function LearningHub({ farmerId }: { farmerId?: number }) {
  const [language, setLanguage] = useState<Language>("english");
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [content, setContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [cache, setCache] = useState<Record<string, CourseContent>>({});

  const t = UI_TEXT[language];

  useEffect(() => {
    fetch(`${API_URL}/api/learning/courses`)
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .catch(() => {});
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(courses.map((c) => (language === "kiswahili" ? c.category_sw : c.category)))),
  ];

  const filtered = courses.filter((c) => {
    const cropName = language === "kiswahili" ? c.crop_sw : c.crop;
    const topicName = language === "kiswahili" ? c.topic_sw : c.topic;
    const catName = language === "kiswahili" ? c.category_sw : c.category;
    const matchSearch = !search || cropName.toLowerCase().includes(search.toLowerCase()) || topicName.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || catName === selectedCategory;
    const matchLevel = selectedLevel === "All" || c.level === selectedLevel;
    return matchSearch && matchCat && matchLevel;
  });

  const loadCourseContent = useCallback(async (course: Course) => {
    const cacheKey = `${course.id}-${language}`;
    if (cache[cacheKey]) { setContent(cache[cacheKey]); return; }
    setLoading(true); setError(null); setContent(null);
    try {
      const res = await fetch(`${API_URL}/api/learning/course-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: course.crop, topic: course.topic, language }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CourseContent = await res.json();
      setCache((prev) => ({ ...prev, [cacheKey]: data }));
      setContent(data);
    } catch {
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  }, [language, cache, t.errorMsg]);

  const openCourse = (course: Course) => {
    setActiveCourse(course);
    loadCourseContent(course);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeCourse = () => { setActiveCourse(null); setContent(null); setError(null); };

  useEffect(() => {
    if (activeCourse) loadCourseContent(activeCourse);
    setSelectedCategory("All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ─── Detail View ──────────────────────────────────────────────────────────────
  if (activeCourse) {
    return (
      <div style={S.wrapper}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={S.detailWrap}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <button style={S.backBtn} onClick={closeCourse}>← {t.back}</button>
            <div style={S.langToggle}>
              <button style={langBtnStyle(language === "english")} onClick={() => setLanguage("english")}>🇬🇧 English</button>
              <button style={langBtnStyle(language === "kiswahili")} onClick={() => setLanguage("kiswahili")}>🇰🇪 Kiswahili</button>
            </div>
          </div>

          <div style={S.detailHeader}>
            <div style={S.detailEmoji}>{activeCourse.emoji}</div>
            <div>
              <p style={{ ...S.detailSubtitle, marginTop: 0, marginBottom: "6px" }}>
                {language === "kiswahili" ? activeCourse.category_sw : activeCourse.category}
              </p>
              <h2 style={S.detailTitle}>{language === "kiswahili" ? activeCourse.crop_sw : activeCourse.crop}</h2>
              <p style={S.detailSubtitle}>{language === "kiswahili" ? activeCourse.topic_sw : activeCourse.topic}</p>
              <div style={S.detailBadges}>
                <span style={S.detailBadge}>{language === "kiswahili" ? activeCourse.level_sw : activeCourse.level}</span>
                <span style={S.detailBadge}>⏱ {activeCourse.duration} {t.minutes}</span>
              </div>
            </div>
          </div>

          {loading && (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={S.loadingText}>{t.loading}</p>
            </div>
          )}

          {error && (
            <div style={S.errorBox}>
              <p style={{ margin: 0 }}>{error}</p>
              <button style={S.retryBtn} onClick={() => loadCourseContent(activeCourse)}>{t.retry}</button>
            </div>
          )}

          {content && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.4s ease" }}>
              <div style={S.contentCard}>
                {content.content.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "14px 0 0" }}>{para}</p>
                ))}
              </div>
              {content.tips.length > 0 && (
                <div>
                  <h3 style={S.sectionTitle}>{t.tips}</h3>
                  <div style={S.tipsGrid}>
                    {content.tips.map((tip, i) => (
                      <div key={i} style={S.tipCard}><span style={{ fontWeight: 700, marginRight: "6px" }}>{i + 1}.</span>{tip}</div>
                    ))}
                  </div>
                </div>
              )}
              {content.modern_techniques.length > 0 && (
                <div>
                  <h3 style={S.sectionTitle}>{t.modernTech}</h3>
                  <div style={S.tipsGrid}>
                    {content.modern_techniques.map((tech, i) => (
                      <div key={i} style={S.techCard}><span style={{ fontWeight: 700, marginRight: "6px" }}>→</span>{tech}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Catalog View ─────────────────────────────────────────────────────────────
  return (
    <div style={S.wrapper}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .course-card:hover{transform:translateY(-4px) !important;box-shadow:0 12px 32px rgba(26,58,42,0.12) !important}
        .start-btn:hover{opacity:0.85 !important}
        input:focus,select:focus{border-color:#4a8c5c !important;box-shadow:0 0 0 3px rgba(74,140,92,0.12) !important}
        ::-webkit-scrollbar{height:4px}::-webkit-scrollbar-thumb{background:#c8e6c9;border-radius:4px}
      `}</style>

      <div style={S.header}>
        <div style={S.titleBlock}>
          <h2 style={S.title}>📚 {t.title}</h2>
          <p style={S.subtitle}>{t.subtitle}</p>
        </div>
        <div style={S.langToggle}>
          <button style={langBtnStyle(language === "english")} onClick={() => setLanguage("english")}>🇬🇧 English</button>
          <button style={langBtnStyle(language === "kiswahili")} onClick={() => setLanguage("kiswahili")}>🇰🇪 Kiswahili</button>
        </div>
      </div>

      <div style={S.controls}>
        <input style={S.searchBox} placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={S.select} value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
          <option value="All">{t.allLevels}</option>
          <option value="Beginner">{t.beginner}</option>
          <option value="Intermediate">{t.intermediate}</option>
          <option value="Advanced">{t.advanced}</option>
        </select>
      </div>

      <div style={S.categoryRow}>
        {categories.map((cat) => (
          <button key={cat} style={categoryTabStyle(selectedCategory === cat)} onClick={() => setSelectedCategory(cat)}>{cat}</button>
        ))}
      </div>

      <p style={S.statsText}>{filtered.length} {t.courses}</p>

      <div style={S.grid}>
        {filtered.length === 0 && <div style={S.noResults}>{t.noResults}</div>}
        {filtered.map((course) => (
          <div key={course.id} className="course-card" style={cardStyle(course.color)} onClick={() => openCourse(course)}>
            <div style={S.cardEmoji}>{course.emoji}</div>
            <div>
              <h3 style={S.cardCrop}>{language === "kiswahili" ? course.crop_sw : course.crop}</h3>
              <p style={S.cardTopic}>{language === "kiswahili" ? course.topic_sw : course.topic}</p>
            </div>
            <div style={S.cardMeta}>
              <span style={badgeStyle(course.accent)}>{language === "kiswahili" ? (t.levelBadge[course.level] ?? course.level_sw) : course.level}</span>
              <span style={badgeStyle(course.accent)}>{language === "kiswahili" ? course.category_sw : course.category}</span>
              <span style={S.durationBadge}>⏱ {course.duration} {t.minutes}</span>
            </div>
            <button className="start-btn" style={startBtnStyle(course.accent)}>{t.startLearning} →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
