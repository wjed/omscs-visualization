import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Clock, BookOpen, AlertTriangle, CheckCircle, ChevronRight,
  TrendingUp, Shield, Brain, Star, ExternalLink, X,
  AlertCircle, Award, Zap, GraduationCap, Info,
} from 'lucide-react';
import { COURSES, SEMESTERS, DIFFICULTY_CONFIG, RELATION_CONFIG, RISK_CONFIG } from './data/courses.js';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:      '#003057',
  navyLight: '#004a8f',
  gold:      '#B3A369',
  goldDark:  '#857437',
  buzz:      '#EAAA00',
  gray:      '#54585A',
  lightGray: '#f4f4f4',
  piMile:    '#D6DBD4',
  diploma:   '#F9F6E5',
  blue:      '#3A5DAE',
  teal:      '#008C95',
  orange:    '#E04F39',
  purple:    '#5F249F',
  lime:      '#A4D233',
  red:       '#8B0000',
  white:     '#ffffff',
  text:      '#1a2535',
  textMid:   '#4a5568',
  border:    'rgba(0,0,0,0.08)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const planned   = COURSES.filter(c => c.semesterIndex !== 99);
const bySem     = (i) => planned.filter(c => c.semesterIndex === i);
const semHours  = (i) => bySem(i).reduce((s, c) => s + c.workloadHrsPerWeek, 0);
const dCfg      = (label) => DIFFICULTY_CONFIG[label] || DIFFICULTY_CONFIG['Moderate'];

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DiffBadge({ label, size = 'sm' }) {
  const { color, textColor } = dCfg(label);
  const cls = size === 'lg'
    ? 'px-3 py-1 text-sm font-bold rounded-full'
    : 'px-2 py-0.5 text-xs font-bold rounded-full';
  return (
    <span className={cls} style={{ background: color, color: textColor }}>
      {label}{label === 'Brutal' ? ' 💀' : ''}
    </span>
  );
}

// ─── Relation Chip ────────────────────────────────────────────────────────────
function RelChip({ relation }) {
  const { color } = RELATION_CONFIG[relation] || RELATION_CONFIG['Elective'];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider"
      style={{ background: color + '18', color, border: `1px solid ${color}40` }}
    >
      {relation}
    </span>
  );
}

// ─── Risk Chip ────────────────────────────────────────────────────────────────
function RiskChip({ risk }) {
  const { color, label, icon } = RISK_CONFIG[risk] || RISK_CONFIG.low;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: color + '18', color, border: `1px solid ${color}50` }}
    >
      {icon} {label}
    </span>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i} size={13}
          fill={i <= Math.round(rating) ? C.buzz : 'transparent'}
          color={i <= Math.round(rating) ? C.buzz : '#ccc'}
        />
      ))}
      <span className="text-sm font-bold ml-1" style={{ color: C.navy }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Difficulty Meter ─────────────────────────────────────────────────────────
function DiffMeter({ rating, label, raw }) {
  const { color } = dCfg(label);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray }}>
          IT-Adjusted Difficulty
        </span>
        <DiffBadge label={label} />
      </div>
      <div className="flex gap-2 items-center">
        {[1,2,3,4,5].map(i => (
          <div
            key={i} className="diff-dot"
            style={{ background: i <= rating ? color : '#e2e8f0' }}
          />
        ))}
        <span className="text-sm font-bold ml-1" style={{ color }}>{rating}/5</span>
      </div>
      <p className="text-xs" style={{ color: C.textMid }}>
        Community avg (OMSCentral): <strong>{raw}/5</strong>
        <span className="ml-1 text-gray-400">— unadjusted</span>
      </p>
    </div>
  );
}

// ─── Course Detail Modal ──────────────────────────────────────────────────────
function CourseModal({ course, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const sem = SEMESTERS.find(s => s.index === course.semesterIndex);
  const { color: dColor } = dCfg(course.difficultyLabel);
  const riskColor = RISK_CONFIG[course.offeringRisk]?.color || C.teal;

  const Block = ({ icon: Icon, title, children, accent = C.navy }) => (
    <div className="rounded-xl p-4 border" style={{ borderColor: accent + '25', background: accent + '05' }}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} color={accent} />}
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>{title}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: C.text }}>{children}</p>
    </div>
  );

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-drawer" onClick={e => e.stopPropagation()}>

        {/* Top stripe */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${C.navy} 0%, ${dColor} 100%)` }} />

        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: C.border }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono font-semibold mb-1" style={{ color: C.gold }}>{course.id}</p>
              <h2 className="text-xl font-bold leading-snug mb-3" style={{ color: C.navy }}>{course.name}</h2>
              <div className="flex flex-wrap gap-2">
                <RelChip relation={course.relation} />
                <DiffBadge label={course.difficultyLabel} size="lg" />
                {sem?.tag && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: sem.tagColor + '20', color: sem.tagColor, border: `1px solid ${sem.tagColor}60` }}>
                    {sem.tag}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: C.gray }}>
              <X size={20} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: Clock, label: 'hrs/week', value: course.workloadHrsPerWeek, color: C.orange },
              { icon: BookOpen, label: 'credits', value: course.creditHours, color: C.navy },
              { icon: Star, label: 'community', value: course.communityRating.toFixed(1), color: C.buzz },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: C.lightGray }}>
                <Icon size={16} color={color} className="mx-auto mb-1" />
                <p className="text-xl font-bold" style={{ color: C.navy }}>{value}</p>
                <p className="text-xs" style={{ color: C.gray }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Difficulty + rating */}
          <div className="rounded-xl p-4 border" style={{ borderColor: dColor + '40', background: dColor + '08' }}>
            <DiffMeter rating={course.difficultyRating} label={course.difficultyLabel} raw={course.communityDifficultyRaw} />
            <div className="mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: C.gray }}>Community Rating</p>
              <Stars rating={course.communityRating} />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ color: C.textMid }}>📅 {course.semester}</span>
            <RiskChip risk={course.offeringRisk} />
          </div>

          <Block icon={Brain} title="Why This Is Hard For You" accent={C.orange}>
            {course.whyDifficultForYou}
          </Block>
          <Block icon={AlertTriangle} title="What Makes It Hard" accent={C.navy}>
            {course.whatMakesItHard}
          </Block>
          <Block icon={CheckCircle} title="What Makes It Doable" accent={C.teal}>
            {course.whatMakesItDoable}
          </Block>

          {/* Top tip */}
          <div className="rounded-xl p-4" style={{ background: C.buzz + '12', border: `1px solid ${C.buzz}50` }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} color={C.buzz} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.goldDark }}>Top Community Tip</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: C.text }}>"{course.topTip}"</p>
          </div>

          {course.prerequisiteWarning && (
            <div className="rounded-xl p-4" style={{ background: C.orange + '10', border: `1px solid ${C.orange}40` }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} color={C.orange} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.orange }}>Prerequisite Warning</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: C.text }}>{course.prerequisiteWarning}</p>
            </div>
          )}

          <div className="rounded-xl p-4 border" style={{ borderColor: riskColor + '40', background: riskColor + '08' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} color={riskColor} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: riskColor }}>Offering Risk</span>
              <RiskChip risk={course.offeringRisk} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.text }}>{course.offeringRiskNote}</p>
          </div>

          <div className="flex gap-3 pt-1">
            {['OMSCentral', 'Reddit r/OMSCS'].map(site => (
              <a key={site} href="#" onClick={e => e.preventDefault()}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border font-medium transition-colors hover:bg-gray-50"
                style={{ color: C.blue, borderColor: C.blue + '50' }}>
                <ExternalLink size={11} /> View on {site}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }) {
  const { color } = dCfg(course.difficultyLabel);
  return (
    <div
      className="course-card card p-4 flex flex-col gap-2"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={() => onClick(course)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(course)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono mb-0.5" style={{ color: C.gold }}>{course.id}</p>
          <p className="text-sm font-bold leading-snug" style={{ color: C.navy }} title={course.name}>{course.name}</p>
        </div>
        <ChevronRight size={14} color={C.piMile} className="flex-shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <DiffBadge label={course.difficultyLabel} />
          <RelChip relation={course.relation} />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: C.gray }}>
          <Clock size={11} />{course.workloadHrsPerWeek}h/wk
        </div>
      </div>
      {course.status === 'completed' && (
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.teal }}>
          <CheckCircle size={11} /> Completed
        </div>
      )}
    </div>
  );
}

// ─── Semester Card ────────────────────────────────────────────────────────────
function SemCard({ sem, onCourseClick }) {
  const courses = bySem(sem.index);
  const hrs = semHours(sem.index);
  const heavy = hrs > 25;
  const mid   = hrs >= 18 && hrs <= 25;
  const loadColor = heavy ? C.orange : mid ? C.buzz : C.teal;
  const loadText  = heavy ? '🚨 Heavy load' : mid ? '⚠ Moderate' : '✓ Manageable';

  return (
    <div className="card flex flex-col" style={{ borderTop: `3px solid ${heavy ? C.orange : mid ? C.buzz : C.teal}` }}>
      <div className="p-4 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-base" style={{ color: C.navy }}>{sem.label}</h3>
            {sem.tag && (
              <span className="text-xs px-2 py-0.5 rounded font-bold mt-1 inline-block"
                style={{ background: sem.tagColor + '20', color: sem.tagColor, border: `1px solid ${sem.tagColor}60` }}>
                {sem.tag}
              </span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold" style={{ color: loadColor }}>{loadText}</p>
            <p className="text-xs mt-0.5" style={{ color: C.gray }}>~{hrs} hrs/wk</p>
          </div>
        </div>
        {/* load bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min((hrs/35)*100, 100)}%`, background: loadColor }} />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {courses.map(c => <CourseCard key={c.id} course={c} onClick={onCourseClick} />)}
      </div>
      {sem.index === 2 && (
        <div className="mx-4 mb-4 p-3 rounded-lg text-xs leading-snug" style={{ background: C.orange + '12', border: `1px solid ${C.orange}40`, color: C.text }}>
          <strong style={{ color: C.orange }}>⚠ Consider moving CS6795</strong> to a lighter semester — CS6601 alone averages 23 hrs/wk.
        </div>
      )}
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics() {
  const workloadData = SEMESTERS.map(s => ({
    name: s.label.replace(' 20', " '"),
    hours: semHours(s.index),
  }));
  const barColor = (h) => h > 25 ? C.orange : h >= 18 ? C.buzz : C.teal;

  const diffCounts = {};
  planned.forEach(c => { diffCounts[c.difficultyLabel] = (diffCounts[c.difficultyLabel]||0)+1; });
  const diffData = Object.entries(diffCounts).map(([name,value]) => ({ name, value, color: dCfg(name).color }));

  const relCounts = {};
  planned.forEach(c => { relCounts[c.relation] = (relCounts[c.relation]||0)+c.creditHours; });
  const relData = Object.entries(relCounts).map(([name,value]) => ({ name, value, color: RELATION_CONFIG[name]?.color || C.gray }));

  const semColors = [C.navy, C.teal, C.blue, C.orange, C.purple, C.lime];
  let cum = 0;
  const progData = SEMESTERS.map((s,i) => {
    const cr = bySem(s.index).reduce((a,c) => a+c.creditHours, 0);
    cum += cr;
    return { label: s.label, cr, cum, color: semColors[i] };
  });

  const TTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-sm shadow-lg">
        <p className="font-bold mb-1" style={{ color: C.navy }}>{label}</p>
        {payload.map((p,i) => <p key={i} style={{ color: p.color || C.text }}>{p.name}: {p.value}{p.name==='hours'?' hrs/wk':''}</p>)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Analytics Dashboard</h2>
        <p className="text-sm" style={{ color: C.textMid }}>Workload, difficulty, and credit progress across your full degree plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workload */}
        <div className="card p-5">
          <h3 className="font-bold mb-0.5" style={{ color: C.navy }}>Semester Workload</h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>Estimated hrs/week · dashed line = 20-hr working-student limit</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workloadData} margin={{ top:8, right:8, left:-16, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: C.gray, fontSize: 11 }} />
              <YAxis tick={{ fill: C.gray, fontSize: 11 }} />
              <Tooltip content={<TTip />} />
              <ReferenceLine y={20} stroke={C.orange} strokeDasharray="5 3"
                label={{ value:'20h limit', fill: C.orange, fontSize:10, position:'insideTopRight' }} />
              <Bar dataKey="hours" name="hours" radius={[4,4,0,0]}>
                {workloadData.map((e,i) => <Cell key={i} fill={barColor(e.hours)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty distribution */}
        <div className="card p-5">
          <h3 className="font-bold mb-0.5" style={{ color: C.navy }}>Difficulty Distribution</h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>IT-adjusted ratings across 10 planned courses</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={diffData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                {diffData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v} course${v>1?'s':''}`, n]}
                contentStyle={{ borderRadius:8, border:`1px solid ${C.border}`, fontSize:13 }} />
              <Legend formatter={v => <span style={{ color:C.text, fontSize:12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Credit breakdown */}
        <div className="card p-5">
          <h3 className="font-bold mb-0.5" style={{ color: C.navy }}>Credit Hour Breakdown</h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>Credits by course category (30 total)</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={relData} cx="50%" cy="50%" outerRadius={82} dataKey="value"
                label={({ name, value }) => `${name} (${value}cr)`}
                labelLine={{ stroke: C.gray }}>
                {relData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v} credits`, n]}
                contentStyle={{ borderRadius:8, border:`1px solid ${C.border}`, fontSize:13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative progress */}
        <div className="card p-5">
          <h3 className="font-bold mb-0.5" style={{ color: C.navy }}>Cumulative Credit Progress</h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>30 credit hours to graduation</p>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: C.gray }}>
                <span>0 credits</span>
                <span className="font-bold" style={{ color: C.navy }}>30 credits (goal)</span>
              </div>
              <div className="h-7 rounded-full overflow-hidden flex" style={{ background: '#e2e8f0' }}>
                {progData.map((s,i) => (
                  <div key={i} style={{
                    width: `${(s.cr/30)*100}%`, background: s.color,
                    borderRight: i < progData.length-1 ? '2px solid rgba(255,255,255,0.6)' : 'none',
                  }} title={`${s.label}: +${s.cr}cr (total ${s.cum}cr)`} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {progData.map((s,i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span style={{ color: C.textMid }}>{s.label}</span>
                  <span className="font-bold ml-auto" style={{ color: C.navy }}>{s.cum}cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Risk Flags ───────────────────────────────────────────────────────────────
function RiskFlags({ onCourseClick }) {
  const flags = [
    { course: 'CS6150',  level:'high',   title:'CS6150 — Computing for Good',
      note:'Only offered ~6 times in 12 semesters. Has disappeared from the schedule before. Always have CS6261 or CS6250 ready as substitutes.' },
    { course: 'CS8803-O23', level:'medium', title:'CS8803-O23 — Modern Internet Research Methods',
      note:'Only ~4 semesters of history. Fall pattern observed but not guaranteed. Verify availability before Fall 2027 registration.' },
    { course: 'PUBP8823', level:'medium', title:'PUBP8823 — Geopolitics of Cybersecurity',
      note:'Only 4 semesters since Spring 2023 inaugural offering. Spring availability confirmed but data is thin. Have a backup ready.' },
    { course: 'CS6601',  level:'high',   title:'⚠️ Spring 2027 Load Warning',
      note:'CS6601 alone averages 23 hrs/wk. Paired with CS6795 (~8 hrs/wk) = ~31 hrs/wk while working full-time. Strongly consider moving CS6795 to a separate semester.',
      noLink: true },
    { course: 'CS6601',  level:'high',   title:'💀 CS6601 — Take This Course Alone',
      note:'Statistically the most brutal course in OMSCS. If you\'re struggling after week 3, drop early to protect your GPA. Do not pair it with any other course.' },
  ];

  const lvl = {
    high:   { bg: C.orange+'0f', border: C.orange+'40', label:'HIGH RISK',   labelBg: C.orange+'18', labelColor: C.orange, icon:'🚨' },
    medium: { bg: C.buzz+'0f',   border: C.buzz+'40',   label:'MEDIUM RISK', labelBg: C.buzz+'18',   labelColor: '#92700a', icon:'⚠️' },
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Risk Flags</h2>
        <p className="text-sm" style={{ color: C.textMid }}>Scheduling risks and workload warnings to review before each registration period.</p>
      </div>
      {flags.map((f, i) => {
        const s = lvl[f.level];
        const c = COURSES.find(x => x.id === f.course);
        return (
          <div key={i} className="card p-5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold" style={{ color: C.navy }}>{f.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: s.labelBg, color: s.labelColor }}>{s.label}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.text }}>{f.note}</p>
                {!f.noLink && c && (
                  <button className="mt-2 text-xs font-semibold flex items-center gap-1 hover:underline"
                    style={{ color: C.blue }} onClick={() => onCourseClick(c)}>
                    View course details <ChevronRight size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Background Panel ─────────────────────────────────────────────────────────
function Background() {
  const pros = [
    { label:'Networking concepts', sub:'helps CS6675, CS6250 backup, PUBP courses' },
    { label:'Security & policy familiarity', sub:'PUBP6725 will feel like structured professional development' },
    { label:'Systems thinking', sub:'helps KBAI\'s structured reasoning, CS6300 project management' },
    { label:'Real-world context', sub:'enriches ethics, policy, and research courses' },
  ];
  const gaps = [
    { label:'Algorithms & data structures', action:'Study before CS6601 (Spring 2027)' },
    { label:'Python proficiency', action:'Must be solid before Fall 2026 starts' },
    { label:'Probability & statistics', action:'Review before CS6601' },
    { label:'No formal ML/math background', action:'CS6601 will expose this hard' },
    { label:'Academic writing', action:'KBAI and CogSci are writing-heavy — start practicing now' },
  ];
  const study = [
    { sub:'Python', res:'"Automate the Boring Stuff with Python" + LeetCode Easy problems' },
    { sub:'Algorithms', res:'MIT 6.006 on YouTube (free)' },
    { sub:'Probability', res:'Khan Academy Statistics + 3Blue1Brown "Essence of" series' },
    { sub:'AI Concepts', res:'First 3 chapters of Russell & Norvig (free preview online)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Your Background vs. This Degree</h2>
        <p className="text-sm" style={{ color: C.textMid }}>
          A personalized reality check — where your IT experience pays off, where the gaps are, and how to close them before Fall 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5" style={{ borderTop: `3px solid ${C.teal}` }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} color={C.teal} />
            <h3 className="font-bold" style={{ color: C.teal }}>IT Background Advantages</h3>
          </div>
          <div className="space-y-3">
            {pros.map((p,i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-sm flex-shrink-0" style={{ color: C.teal }}>✅</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.navy }}>{p.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.textMid }}>{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5" style={{ borderTop: `3px solid ${C.orange}` }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} color={C.orange} />
            <h3 className="font-bold" style={{ color: C.orange }}>Gaps to Address</h3>
          </div>
          <div className="space-y-3">
            {gaps.map((g,i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-sm flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.navy }}>{g.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.orange }}>→ {g.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5" style={{ borderTop: `3px solid ${C.buzz}` }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} color={C.navy} />
          <h3 className="font-bold" style={{ color: C.navy }}>Recommended Self-Study Before Starting</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {study.map((s,i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: C.lightGray, border: `1px solid ${C.border}` }}>
              <p className="text-sm font-bold mb-1" style={{ color: C.navy }}>📚 {s.sub}</p>
              <p className="text-xs leading-relaxed" style={{ color: C.textMid }}>{s.res}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ onCourseClick }) {
  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="card p-4 flex items-start gap-3" style={{ borderLeft:`3px solid ${C.blue}` }}>
        <Info size={16} color={C.blue} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: C.text }}>
          <span className="font-bold" style={{ color: C.navy }}>Difficulty ratings adjusted for IT-background student.</span>{' '}
          Raw OMSCentral community scores shown separately in each course detail. Click any course card for the full breakdown.
        </p>
      </div>

      {/* Semester overview rows */}
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: C.navy }}>Your Degree at a Glance</h2>
        <div className="space-y-2">
          {SEMESTERS.map(sem => {
            const courses = bySem(sem.index);
            const hrs = semHours(sem.index);
            const heavy = hrs > 25;
            const mid = hrs >= 18;
            const loadColor = heavy ? C.orange : mid ? C.buzz : C.teal;
            return (
              <div key={sem.index} className="card p-4 flex items-center gap-4 flex-wrap">
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: C.navy }}>{sem.label}</p>
                  {sem.tag && <span className="text-xs font-bold" style={{ color: sem.tagColor }}>{sem.tag}</span>}
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {courses.map(c => (
                    <button key={c.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md"
                      style={{ background: C.lightGray, color: C.navy, border:`1px solid ${C.border}` }}
                      onClick={() => onCourseClick(c)}>
                      {c.shortName || c.name}
                      <DiffBadge label={c.difficultyLabel} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm flex-shrink-0">
                  <Clock size={13} color={loadColor} />
                  <span className="font-semibold" style={{ color: loadColor }}>{hrs} hrs/wk</span>
                  {heavy && <AlertTriangle size={13} color={C.orange} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tuition calculator */}
      <div className="card p-6" style={{ borderTop:`3px solid ${C.buzz}` }}>
        <div className="flex items-center gap-2 mb-5">
          <Award size={18} color={C.navy} />
          <h3 className="font-bold text-lg" style={{ color: C.navy }}>Tuition Calculator</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:'Courses',        value:'10',      sub:'' },
            { label:'Credit Hours',   value:'30',      sub:'cr' },
            { label:'Rate',           value:'$225',    sub:'/credit' },
            { label:'Estimated Total',value:'$6,750',  sub:'', highlight:true },
          ].map((s,i) => (
            <div key={i} className="rounded-xl p-4 text-center"
              style={{ background: s.highlight ? C.navy : C.lightGray, border:`1px solid ${C.border}` }}>
              <p className="text-2xl font-bold" style={{ color: s.highlight ? C.buzz : C.navy }}>
                {s.value}<span className="text-sm font-normal">{s.sub}</span>
              </p>
              <p className="text-xs mt-1" style={{ color: s.highlight ? 'rgba(255,255,255,0.7)' : C.gray }}>{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: C.gray }}>
          * Estimated tuition only — does not include student fees. Rates subject to change.
        </p>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ onCourseClick }) {
  const backups = COURSES.filter(c => c.status === 'backup');
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Semester Timeline</h2>
        <p className="text-sm" style={{ color: C.textMid }}>Click any course card to open the full difficulty breakdown.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {SEMESTERS.map(sem => <SemCard key={sem.index} sem={sem} onCourseClick={onCourseClick} />)}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Backup / Alternative Courses</h2>
        <p className="text-sm mb-4" style={{ color: C.textMid }}>If a planned course doesn't run or you need a lighter load — these are proven options.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {backups.map(c => <CourseCard key={c.id} course={c} onClick={onCourseClick} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ tab, setTab }) {
  const tabs = ['Overview','Timeline','Analytics','Risk Flags','Background'];
  return (
    <header className="sticky top-0 z-40 no-print" style={{ background: C.navy, boxShadow:'0 2px 12px rgba(0,0,0,0.18)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: C.buzz, color: C.navy, fontFamily:'Georgia, serif' }}>GT</div>
            <div>
              <h1 className="font-bold text-base leading-tight text-white" style={{ fontFamily:'Georgia, serif' }}>
                OMSCS Journey
              </h1>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.55)' }}>M.S. Computer Science — AI Specialization</p>
            </div>
          </div>
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-6">
            {[['10','Courses'],['30','Credits'],['Summer 2028','Completion'],['$6,750','Est. Cost']].map(([v,l]) => (
              <div key={l} className="text-right">
                <p className="text-sm font-bold" style={{ color: C.buzz }}>{v}</p>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.45)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Nav */}
        <nav className="flex">
          {tabs.map(t => (
            <button key={t} className={`nav-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('Overview');
  const [modal, setModal] = useState(null);

  const panels = {
    'Overview':   <Overview   onCourseClick={setModal} />,
    'Timeline':   <Timeline   onCourseClick={setModal} />,
    'Analytics':  <Analytics />,
    'Risk Flags': <RiskFlags  onCourseClick={setModal} />,
    'Background': <Background />,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f4f4f4' }}>
      <Header tab={tab} setTab={setTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-up">
        {panels[tab]}
      </main>

      <footer className="mt-12 border-t py-8" style={{ borderColor: '#e2e8f0', background: C.white }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: C.gray }}>
            <p>Data sourced from OMSCentral, Reddit r/OMSCS, and GT course offering history PDF (Spring 2026).</p>
            <p className="text-center">Difficulty ratings are personalized estimates for an IT-background student and may differ from community averages.</p>
            <p className="text-right">Course availability not guaranteed — check omscs.gatech.edu before registering.
              <br /><span style={{ color: C.gold }}>Last updated: May 2026</span></p>
          </div>
        </div>
      </footer>

      {modal && <CourseModal course={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
