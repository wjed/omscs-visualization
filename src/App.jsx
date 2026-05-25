import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Clock, BookOpen, AlertTriangle, CheckCircle, ChevronRight,
  Shield, Brain, Star, ExternalLink, X, AlertCircle, Award, Zap, Info,
} from 'lucide-react';
import { COURSES, SEMESTERS, DIFFICULTY_CONFIG, RELATION_CONFIG, RISK_CONFIG } from './data/courses.js';

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  navy:    '#003057', gold:   '#B3A369', goldDk: '#857437',
  buzz:    '#EAAA00', gray:   '#54585A', teal:   '#008C95',
  orange:  '#E04F39', blue:   '#3A5DAE', lime:   '#A4D233',
  red:     '#8B0000', purple: '#5F249F', white:  '#ffffff',
  bg:      '#E8EDF5', text:   '#0f1c2e', mid:    '#4a5568', soft:   '#8a96a3',
  border:  'rgba(0,0,0,0.07)',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const planned  = COURSES.filter(c => c.semesterIndex !== 99);
const bySem    = (i) => planned.filter(c => c.semesterIndex === i);
const semHrs   = (i) => bySem(i).reduce((s, c) => s + c.workloadHrsPerWeek, 0);
const dCfg     = (l) => DIFFICULTY_CONFIG[l] || DIFFICULTY_CONFIG['Moderate'];
const serif    = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans     = { fontFamily: "'Inter', sans-serif" };

// ── Difficulty Badge ───────────────────────────────────────────────────────────
function DiffBadge({ label, lg }) {
  const { color, textColor } = dCfg(label);
  return (
    <span style={{
      background: color, color: textColor,
      padding: lg ? '4px 12px' : '2px 8px',
      fontSize: lg ? 13 : 11,
      fontWeight: 700, borderRadius: 99, letterSpacing: '0.03em',
      fontFamily: "'Inter', sans-serif",
    }}>
      {label}{label === 'Brutal' ? ' 💀' : ''}
    </span>
  );
}

// ── Relation Chip ──────────────────────────────────────────────────────────────
function RelChip({ relation }) {
  const { color } = RELATION_CONFIG[relation] || RELATION_CONFIG['Elective'];
  return (
    <span style={{
      background: color + '15', color, border: `1px solid ${color}40`,
      padding: '2px 8px', fontSize: 11, fontWeight: 700,
      borderRadius: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: "'Inter', sans-serif",
    }}>{relation}</span>
  );
}

// ── Risk Chip ──────────────────────────────────────────────────────────────────
function RiskChip({ risk }) {
  const { color, label, icon } = RISK_CONFIG[risk] || RISK_CONFIG.low;
  return (
    <span style={{
      background: color + '15', color, border: `1px solid ${color}40`,
      padding: '2px 10px', fontSize: 11, fontWeight: 700,
      borderRadius: 99, fontFamily: "'Inter', sans-serif",
    }}>{icon} {label}</span>
  );
}

// ── Stars ──────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14}
          fill={i <= Math.round(rating) ? C.buzz : 'transparent'}
          color={i <= Math.round(rating) ? C.buzz : '#d1d5db'} />
      ))}
      <span style={{ marginLeft: 6, fontWeight: 700, fontSize: 15, color: C.navy }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Diff Meter ─────────────────────────────────────────────────────────────────
function DiffMeter({ rating, label, raw }) {
  const { color } = dCfg(label);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.soft, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          IT-Adjusted Difficulty
        </span>
        <DiffBadge label={label} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="diff-dot"
            style={{ background: i <= rating ? color : '#e5e7eb' }} />
        ))}
        <span style={{ marginLeft: 4, fontWeight: 700, fontSize: 16, color }}>{rating}/5</span>
      </div>
      <p style={{ fontSize: 12, color: C.soft }}>
        Community avg on OMSCentral: <strong style={{ color: C.mid }}>{raw}/5</strong>
        <span style={{ marginLeft: 6, opacity: 0.7 }}>not adjusted for IT background</span>
      </p>
    </div>
  );
}

// ── Course Modal ───────────────────────────────────────────────────────────────
function CourseModal({ course, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const sem     = SEMESTERS.find(s => s.index === course.semesterIndex);
  const { color: dc } = dCfg(course.difficultyLabel);
  const rc      = RISK_CONFIG[course.offeringRisk]?.color || C.teal;

  const Section = ({ icon: Icon, title, children, accent = C.navy }) => (
    <div style={{ borderRadius: 12, padding: '16px 18px', border: `1px solid ${accent}22`, background: accent + '06' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {Icon && <Icon size={14} color={accent} />}
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text }}>{children}</p>
    </div>
  );

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-drawer" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.navy}, ${dc})` }} />

        {/* Header */}
        <div style={{ padding: '28px 28px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                {course.id}
              </p>
              <h2 style={{ ...serif, fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 14, lineHeight: 1.2 }}>
                {course.name}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <RelChip relation={course.relation} />
                <DiffBadge label={course.difficultyLabel} lg />
                {sem?.tag && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                    background: sem.tagColor + '20', color: sem.tagColor, border: `1px solid ${sem.tagColor}60`,
                  }}>{sem.tag}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{
              padding: 8, borderRadius: 8, border: 'none', background: '#f3f4f6',
              cursor: 'pointer', color: C.gray, display: 'flex', alignItems: 'center',
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { icon: Clock, label: 'hrs / week', value: course.workloadHrsPerWeek, color: C.orange },
              { icon: BookOpen, label: 'credit hours', value: course.creditHours, color: C.navy },
              { icon: Star, label: 'community rating', value: course.communityRating.toFixed(1), color: C.buzz },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ borderRadius: 12, padding: '14px 16px', background: '#f1f5fb', border: '1px solid rgba(0,48,87,0.08)', textAlign: 'center' }}>
                <Icon size={16} color={color} style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ borderRadius: 12, padding: '18px 20px', border: `1px solid ${dc}35`, background: dc + '08' }}>
            <DiffMeter rating={course.difficultyRating} label={course.difficultyLabel} raw={course.communityDifficultyRaw} />
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.soft, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                Community Rating
              </p>
              <Stars rating={course.communityRating} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: C.mid, fontWeight: 500 }}>📅 {course.semester}</span>
            <RiskChip risk={course.offeringRisk} />
          </div>

          <Section icon={Brain} title="Why This Is Hard For You" accent={C.orange}>
            {course.whyDifficultForYou}
          </Section>
          <Section icon={AlertTriangle} title="What Makes It Hard">
            {course.whatMakesItHard}
          </Section>
          <Section icon={CheckCircle} title="What Makes It Doable" accent={C.teal}>
            {course.whatMakesItDoable}
          </Section>

          {/* Top tip */}
          <div style={{ borderRadius: 12, padding: '16px 20px', background: '#fffbeb', border: `1px solid ${C.buzz}50` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Zap size={14} color={C.buzz} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.goldDk, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Top Community Tip
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text, fontStyle: 'italic' }}>"{course.topTip}"</p>
          </div>

          {course.prerequisiteWarning && (
            <div style={{ borderRadius: 12, padding: '16px 20px', background: '#fff5f5', border: `1px solid ${C.orange}45` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={14} color={C.orange} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Prerequisite Warning
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text }}>{course.prerequisiteWarning}</p>
            </div>
          )}

          <div style={{ borderRadius: 12, padding: '16px 20px', border: `1px solid ${rc}35`, background: rc + '07' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={14} color={rc} />
              <span style={{ fontSize: 11, fontWeight: 700, color: rc, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Offering Risk
              </span>
              <RiskChip risk={course.offeringRisk} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text }}>{course.offeringRiskNote}</p>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            {['OMSCentral', 'Reddit r/OMSCS'].map(s => (
              <a key={s} href="#" onClick={e => e.preventDefault()} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
                color: C.blue, border: `1px solid ${C.blue}40`, textDecoration: 'none',
                background: '#f8faff',
              }}>
                <ExternalLink size={11} /> {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Course Card ────────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }) {
  const { color } = dCfg(course.difficultyLabel);
  return (
    <div className="course-card card" onClick={() => onClick(course)}
      role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick(course)}
      style={{ borderLeft: `4px solid ${color}`, padding: '16px 18px', background: `linear-gradient(135deg, ${color}0d 0%, #fff 55%)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
            {course.id}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>{course.name}</p>
        </div>
        <ChevronRight size={15} color={C.soft} style={{ flexShrink: 0, marginTop: 2 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <DiffBadge label={course.difficultyLabel} />
          <RelChip relation={course.relation} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: C.soft }}>
          <Clock size={11} color={C.soft} />
          {course.workloadHrsPerWeek}h / wk
        </div>
      </div>
      {course.status === 'completed' && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.teal }}>
          <CheckCircle size={11} /> Completed
        </div>
      )}
    </div>
  );
}

// ── Semester Card ──────────────────────────────────────────────────────────────
function SemCard({ sem, onCourseClick }) {
  const courses = bySem(sem.index);
  const hrs = semHrs(sem.index);
  const heavy = hrs > 25, mid = hrs >= 18 && hrs <= 25;
  const lc = heavy ? C.orange : mid ? C.buzz : C.teal;
  const lt = heavy ? 'Heavy load' : mid ? 'Moderate' : 'Manageable';

  return (
    <div className="card" style={{ borderTop: `4px solid ${lc}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${lc}0a 0%, transparent 65%)` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <div>
            <h3 style={{ ...serif, fontSize: 18, fontWeight: 700, color: C.navy }}>{sem.label}</h3>
            {sem.tag && (
              <span style={{
                display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 700,
                padding: '2px 10px', borderRadius: 99,
                background: sem.tagColor + '20', color: sem.tagColor, border: `1px solid ${sem.tagColor}60`,
              }}>{sem.tag}</span>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: lc }}>{heavy ? '🚨' : mid ? '⚠' : '✓'} {lt}</p>
            <p style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>~{hrs} hrs / wk</p>
          </div>
        </div>
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: lc, borderRadius: 99, width: `${Math.min((hrs/35)*100,100)}%` }} />
        </div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {courses.map(c => <CourseCard key={c.id} course={c} onClick={onCourseClick} />)}
      </div>
      {sem.index === 3 && (
        <div style={{ margin: '0 20px 20px', padding: '12px 16px', borderRadius: 10, fontSize: 13, lineHeight: 1.5, background: '#fff7f5', border: `1px solid ${C.orange}40`, color: C.text }}>
          <strong style={{ color: C.orange }}>Solo course by design.</strong> CS6601 averages 23 hrs/wk. Budget 30+ hrs/wk for the first month.
        </div>
      )}
    </div>
  );
}

// ── Analytics ──────────────────────────────────────────────────────────────────
function Analytics() {
  const wData = SEMESTERS.map(s => ({
    name: s.label.replace(' 20', " '"), hours: semHrs(s.index),
  }));
  const bc = h => h > 25 ? C.orange : h >= 18 ? C.buzz : C.teal;

  const dCounts = {};
  planned.forEach(c => { dCounts[c.difficultyLabel] = (dCounts[c.difficultyLabel] || 0) + 1; });
  const dData = Object.entries(dCounts).map(([name, value]) => ({ name, value, color: dCfg(name).color }));

  const rCounts = {};
  planned.forEach(c => { rCounts[c.relation] = (rCounts[c.relation] || 0) + c.creditHours; });
  const rData = Object.entries(rCounts).map(([name, value]) => ({ name, value, color: RELATION_CONFIG[name]?.color || C.gray }));

  const semColors = [C.navy, C.teal, C.blue, C.orange, C.purple, C.lime];
  let cum = 0;
  const progData = SEMESTERS.map((s, i) => {
    const cr = bySem(s.index).reduce((a, c) => a + c.creditHours, 0);
    cum += cr;
    return { label: s.label, cr, cum, color: semColors[i] };
  });

  const TTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card" style={{ padding: '10px 14px', fontSize: 13 }}>
        <p style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || C.mid }}>{p.name}: {p.value}{p.name === 'hours' ? ' hrs/wk' : ''}</p>
        ))}
      </div>
    );
  };

  const ChartCard = ({ title, sub, children }) => (
    <div className="card" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 3, height: 20, borderRadius: 99, background: `linear-gradient(180deg, ${C.buzz}, ${C.gold})`, flexShrink: 0 }} />
        <h3 style={{ ...serif, fontSize: 20, fontWeight: 700, color: C.navy }}>{title}</h3>
      </div>
      <p style={{ fontSize: 13, color: C.soft, marginBottom: 20, marginLeft: 13 }}>{sub}</p>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-heading" style={{ ...serif, fontSize: 32, fontWeight: 800, color: C.navy }}>Analytics</h2>
        <p style={{ fontSize: 15, color: C.mid }}>Workload, difficulty distribution, and credit progress across your degree.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        <ChartCard title="Semester Workload" sub="Estimated hours per week. Dashed line = 20-hour working-student threshold.">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={wData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: C.soft, fontSize: 12, fontFamily: 'Inter' }} />
              <YAxis tick={{ fill: C.soft, fontSize: 12, fontFamily: 'Inter' }} />
              <Tooltip content={<TTip />} />
              <ReferenceLine y={20} stroke={C.orange} strokeDasharray="5 3"
                label={{ value: '20h limit', fill: C.orange, fontSize: 11, position: 'insideTopRight' }} />
              <Bar dataKey="hours" name="hours" radius={[5, 5, 0, 0]}>
                {wData.map((e, i) => <Cell key={i} fill={bc(e.hours)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Difficulty Distribution" sub="IT-adjusted ratings across all 10 planned courses.">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={dData} cx="50%" cy="50%" innerRadius={60} outerRadius={92} paddingAngle={3} dataKey="value">
                {dData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} course${v > 1 ? 's' : ''}`, n]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }} />
              <Legend formatter={v => <span style={{ fontSize: 13, color: C.mid }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Credit Breakdown" sub="30 total credit hours split by course category.">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={rData} cx="50%" cy="50%" outerRadius={88} dataKey="value"
                label={({ name, value }) => `${name} (${value}cr)`}
                labelLine={{ stroke: '#ccc' }}>
                {rData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} credits`, n]}
                contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Credit Progress" sub="Cumulative credits toward the 30-hour degree requirement.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: C.soft }}>
                <span>0 credits</span>
                <span style={{ fontWeight: 700, color: C.navy }}>30 credits</span>
              </div>
              <div style={{ height: 28, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
                {progData.map((s, i) => (
                  <div key={i} title={`${s.label}: +${s.cr}cr (total ${s.cum}cr)`}
                    style={{
                      width: `${(s.cr / 30) * 100}%`, background: s.color,
                      borderRight: i < progData.length - 1 ? '2px solid rgba(255,255,255,0.5)' : 'none',
                    }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {progData.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ color: C.mid }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: C.navy, marginLeft: 'auto' }}>{s.cum}cr</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Risk Flags ─────────────────────────────────────────────────────────────────
function RiskFlags({ onCourseClick }) {
  const flags = [
    { id: 'CS6601', level: 'high', title: 'CS6601: Budget 30+ hrs/wk in Summer 2027', noLink: false,
      note: 'This is statistically the hardest course in OMSCS. You are correctly taking it alone in summer. Budget 30 or more hours per week for the first four weeks. If you are struggling after week 3, drop early and protect your GPA.' },
    { id: 'CS6150', level: 'high', title: 'CS6150: Computing for Good has a spotty schedule',
      note: 'Only offered about 6 times across 12 semesters. Has disappeared from the schedule before with no warning. Keep CS6261 or CS6250 ready as drop-in substitutes for Fall 2027.' },
    { id: 'CS8803-O23', level: 'medium', title: 'CS8803-O23: Modern Internet Research Methods is newer',
      note: 'Only 4 semesters of offering history. A Fall pattern has been observed but is not guaranteed. Verify availability well before Fall 2027 registration opens.' },
    { id: 'PUBP8823', level: 'medium', title: 'PUBP8823: Geopolitics of Cybersecurity is newer',
      note: 'Only 4 semesters since its Spring 2023 debut. Spring availability looks consistent but there is not enough data to be confident. Have a backup elective ready for Spring 2028.' },
    { id: 'CS6300', level: 'medium', title: 'CS6300: Java and Android needed before Fall 2026', noLink: false,
      note: 'Software Development Process requires Android and Java development. If you are not comfortable with Java, spend a few weeks on it before the semester starts. Being the team lead on the group project is strongly recommended.' },
  ];

  const styles = {
    high:   { bg: '#fff5f5', border: C.orange + '50', badge: C.orange, badgeBg: '#ffe4e1', icon: '🚨', tag: 'HIGH RISK' },
    medium: { bg: '#fffbeb', border: C.buzz + '50',   badge: '#92700a', badgeBg: '#fef3c7', icon: '⚠️', tag: 'MEDIUM RISK' },
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-heading" style={{ ...serif, fontSize: 32, fontWeight: 800, color: C.navy }}>Risk Flags</h2>
        <p style={{ fontSize: 15, color: C.mid }}>Scheduling risks and workload warnings to review before each registration period.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {flags.map((f, i) => {
          const s = styles[f.level];
          const course = COURSES.find(c => c.id === f.id);
          return (
            <div key={i} className="card" style={{ padding: '20px 24px', background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{f.title}</h4>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: s.badgeBg, color: s.badge }}>{s.tag}</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.text }}>{f.note}</p>
                  {!f.noLink && course && (
                    <button onClick={() => onCourseClick(course)}
                      style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      View course details <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Background ─────────────────────────────────────────────────────────────────
function Background() {
  const pros = [
    { label: 'Networking concepts', sub: 'Directly helps CS6675, CS6250 backup, and the PUBP policy courses' },
    { label: 'Security and policy familiarity', sub: 'PUBP6725 will feel like structured professional development' },
    { label: 'Systems thinking', sub: "Helps KBAI's structured reasoning approach and CS6300 project coordination" },
    { label: 'Real-world context', sub: 'Enriches ethics, policy, and research courses with grounded examples' },
  ];
  const gaps = [
    { label: 'Java and Android basics', action: 'Needed for CS6300 starting Fall 2026' },
    { label: 'Python proficiency', action: 'Must be solid before Fall 2026 and critical by Summer 2027' },
    { label: 'Algorithms and data structures', action: 'Study hard before CS6601 in Summer 2027' },
    { label: 'Probability and statistics', action: 'Review before CS6601 in Summer 2027' },
    { label: 'Academic writing', action: 'KBAI and Cog Sci are writing-heavy. CS6603 in Fall 2026 is good practice' },
  ];
  const study = [
    { subject: 'Java Basics', resource: '"Head First Java" or the free MOOC.fi Java Programming course — needed for CS6300' },
    { subject: 'Python', resource: '"Automate the Boring Stuff with Python" and LeetCode Easy problems' },
    { subject: 'Algorithms', resource: 'MIT 6.006 lectures on YouTube (free) — essential before Summer 2027' },
    { subject: 'Probability', resource: 'Khan Academy Statistics and 3Blue1Brown "Essence of" series' },
    { subject: 'AI Concepts', resource: 'First 3 chapters of Russell and Norvig (free preview online)' },
  ];

  const Panel = ({ title, color, icon: Icon, children }) => (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', background: `linear-gradient(135deg, ${color}10 0%, ${color}04 100%)`, borderBottom: '1px solid rgba(0,48,87,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <h3 style={{ ...serif, fontSize: 20, fontWeight: 700, color }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-heading" style={{ ...serif, fontSize: 32, fontWeight: 800, color: C.navy }}>Your Background vs. This Degree</h2>
        <p style={{ fontSize: 15, color: C.mid }}>Where your IT experience pays off, where the gaps are, and how to close them before Fall 2026.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 20 }}>
        <Panel title="IT Background Advantages" color={C.teal} icon={CheckCircle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{p.label}</p>
                  <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.5 }}>{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Gaps to Address" color={C.orange} icon={AlertTriangle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {gaps.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{g.label}</p>
                  <p style={{ fontSize: 13, color: C.orange, lineHeight: 1.5, fontWeight: 500 }}>{g.action}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Recommended Self-Study Before Starting" color={C.buzz} icon={BookOpen}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {study.map((s, i) => (
            <div key={i} style={{ borderRadius: 10, padding: '16px 18px', background: C.bg, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>📚 {s.subject}</p>
              <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.55 }}>{s.resource}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function Overview({ onCourseClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Disclaimer */}
      <div className="card" style={{ padding: '16px 20px', borderLeft: `4px solid ${C.blue}`, background: `linear-gradient(135deg, ${C.blue}07 0%, #fff 50%)`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Info size={16} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
          <strong style={{ color: C.navy }}>Difficulty ratings are adjusted for an IT-background student.</strong> Raw OMSCentral community scores are shown separately in each course detail. Click any course to open the full breakdown.
        </p>
      </div>

      {/* Semester rows */}
      <div>
        <h2 className="section-heading" style={{ ...serif, fontSize: 28, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Degree at a Glance</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SEMESTERS.map(sem => {
            const courses = bySem(sem.index);
            const hrs = semHrs(sem.index);
            const heavy = hrs > 25, mid = hrs >= 18;
            const lc = heavy ? C.orange : mid ? C.buzz : C.teal;
            return (
              <div key={sem.index} className="card" style={{ padding: '0', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
                <div style={{ width: 4, flexShrink: 0, background: lc }} />
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', flex: 1 }}>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{sem.label}</p>
                  {sem.tag && <p style={{ fontSize: 11, fontWeight: 700, color: sem.tagColor, marginTop: 2 }}>{sem.tag}</p>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                  {courses.map(c => (
                    <button key={c.id} onClick={() => onCourseClick(c)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
                      background: C.bg, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.navy,
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {c.shortName || c.name} <DiffBadge label={c.difficultyLabel} />
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <Clock size={13} color={lc} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: lc }}>{hrs} hrs / wk</span>
                  {heavy && <AlertTriangle size={13} color={C.orange} />}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tuition */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 28px', background: `linear-gradient(135deg, ${C.buzz}12 0%, ${C.gold}08 100%)`, borderBottom: `1px solid rgba(0,48,87,0.07)`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.buzz + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={18} color={C.goldDk} />
          </div>
          <h3 style={{ ...serif, fontSize: 22, fontWeight: 700, color: C.navy }}>Tuition Estimate</h3>
        </div>
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'Courses', value: '10' },
              { label: 'Credit Hours', value: '30 cr' },
              { label: 'Rate', value: '$225 / credit' },
              { label: 'Estimated Total', value: '$6,750', highlight: true },
            ].map((s, i) => (
              <div key={i} style={{
                borderRadius: 12, padding: '18px 16px', textAlign: 'center',
                background: s.highlight ? C.navy : '#f1f5fb', border: s.highlight ? 'none' : `1px solid rgba(0,48,87,0.08)`,
              }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.highlight ? C.buzz : C.navy, lineHeight: 1.1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: s.highlight ? 'rgba(255,255,255,0.6)' : C.soft, marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.soft, textAlign: 'center' }}>
            Estimated tuition only. Does not include student fees. Rates subject to change.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────────────
function Timeline({ onCourseClick }) {
  const backups = COURSES.filter(c => c.status === 'backup');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h2 className="section-heading" style={{ ...serif, fontSize: 32, fontWeight: 800, color: C.navy }}>Semester Timeline</h2>
        <p style={{ fontSize: 15, color: C.mid }}>Click any course card to open the full difficulty breakdown.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {SEMESTERS.map(s => <SemCard key={s.index} sem={s} onCourseClick={onCourseClick} />)}
      </div>
      <div>
        <h2 className="section-heading" style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.navy }}>Backup Courses</h2>
        <p style={{ fontSize: 14, color: C.mid, marginBottom: 16 }}>If a planned course doesn't run or you need a lighter load, these are proven options.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {backups.map(c => <CourseCard key={c.id} course={c} onClick={onCourseClick} />)}
        </div>
      </div>
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────────
function Header({ tab, setTab }) {
  const tabs = ['Overview', 'Timeline', 'Analytics', 'Risk Flags', 'Background'];
  return (
    <header className="no-print" style={{
      background: C.navy, position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
    }}>
      <div style={{ padding: '0 48px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.buzz,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 15, color: C.navy,
              flexShrink: 0,
            }}>GT</div>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                OMSCS Journey
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
                M.S. Computer Science: AI Specialization
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['10', 'Courses'], ['30 cr', 'Credits'], ['Summer 2028', 'Completion'], ['$6,750', 'Est. Cost']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center', padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.buzz, lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Nav */}
        <nav style={{ display: 'flex', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t} className={`nav-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('Overview');
  const [modal, setModal] = useState(null);

  const panels = {
    'Overview':   <Overview onCourseClick={setModal} />,
    'Timeline':   <Timeline onCourseClick={setModal} />,
    'Analytics':  <Analytics />,
    'Risk Flags': <RiskFlags onCourseClick={setModal} />,
    'Background': <Background />,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header tab={tab} setTab={setTab} />

      <main className="fade-up" style={{ padding: '36px 48px 60px' }}>
        {panels[tab]}
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, background: '#fff', padding: '28px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 12, color: C.soft }}>
          <p>Data sourced from OMSCentral, Reddit r/OMSCS, and GT course offering history PDF (Spring 2026).</p>
          <p style={{ textAlign: 'center' }}>Difficulty ratings are personalized estimates for an IT-background student and may differ from community averages.</p>
          <p style={{ textAlign: 'right' }}>
            Course availability not guaranteed. Check omscs.gatech.edu before registering.
            <br /><span style={{ color: C.gold, fontWeight: 600 }}>Last updated May 2026</span>
          </p>
        </div>
      </footer>

      {modal && <CourseModal course={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
