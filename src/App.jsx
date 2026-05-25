import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  Clock, BookOpen, AlertTriangle, CheckCircle, XCircle, ChevronRight,
  TrendingUp, Shield, Brain, Star, ExternalLink, X, GraduationCap,
  AlertCircle, Info, Award, Target, Zap,
} from 'lucide-react';
import { COURSES, SEMESTERS, DIFFICULTY_CONFIG, RELATION_CONFIG, RISK_CONFIG } from './data/courses.js';

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  navy:       '#003057',
  navyDark:   '#001f3d',
  navyLight:  '#004080',
  gold:       '#B3A369',
  goldMedium: '#A4925A',
  goldDark:   '#857437',
  buzzGold:   '#EAAA00',
  gray:       '#54585A',
  piMile:     '#D6DBD4',
  diploma:    '#F9F6E5',
  boldBlue:   '#3A5DAE',
  teal:       '#008C95',
  orange:     '#E04F39',
  purple:     '#5F249F',
  lime:       '#A4D233',
  brutalRed:  '#8B0000',
  white:      '#FFFFFF',
};

// ─── Utility helpers ──────────────────────────────────────────────────────────
const plannedCourses = COURSES.filter(c => c.semesterIndex !== 99);
const semesterCourses = (idx) => plannedCourses.filter(c => c.semesterIndex === idx);
const totalHours = (idx) => semesterCourses(idx).reduce((s, c) => s + c.workloadHrsPerWeek, 0);
const diffConfig = (label) => DIFFICULTY_CONFIG[label] || DIFFICULTY_CONFIG['Moderate'];

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ label, size = 'sm' }) {
  const cfg = diffConfig(label);
  const pad = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  const skull = label === 'Brutal' ? ' 💀' : '';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wide ${pad}`}
      style={{ background: cfg.color, color: cfg.textColor }}
    >
      {label}{skull}
    </span>
  );
}

// ─── Relation Badge ───────────────────────────────────────────────────────────
function RelationBadge({ relation }) {
  const cfg = RELATION_CONFIG[relation] || RELATION_CONFIG['Elective'];
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider border"
      style={{ borderColor: cfg.color, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ risk }) {
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.low;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: cfg.color + '25', color: cfg.color, border: `1px solid ${cfg.color}50` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Difficulty Meter ─────────────────────────────────────────────────────────
function DifficultyMeter({ rating, max = 5, label, rawRating }) {
  const cfg = diffConfig(label);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 uppercase tracking-wider">IT-Adjusted Difficulty</span>
        <DifficultyBadge label={label} />
      </div>
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className="difficulty-dot filled"
            style={{
              background: i < rating ? cfg.color : 'rgba(255,255,255,0.12)',
              width: 20, height: 20,
            }}
            title={`IT-adjusted: ${rating}/5 | Community avg: ${rawRating}/5`}
          />
        ))}
        <span className="text-sm font-bold ml-1" style={{ color: cfg.color }}>{rating}/5</span>
      </div>
      {rawRating && (
        <p className="text-xs" style={{ color: C.piMile }}>
          OMSCentral community avg: <span className="font-semibold text-white">{rawRating}/5</span>
          <span className="ml-1 text-gray-500">(unadjusted for IT background)</span>
        </p>
      )}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < full ? C.buzzGold : (i === full && half ? C.buzzGold + '88' : 'transparent')}
          color={i < full || (i === full && half) ? C.buzzGold : '#444'}
        />
      ))}
      <span className="text-sm font-semibold ml-1" style={{ color: C.buzzGold }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Course Detail Modal ──────────────────────────────────────────────────────
function CourseDetailModal({ course, onClose }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const cfg = diffConfig(course.difficultyLabel);
  const sem = SEMESTERS.find(s => s.index === course.semesterIndex);

  const Section = ({ icon: Icon, title, children, accent }) => (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent || 'rgba(179,163,105,0.2)'}` }}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={15} color={accent || C.gold} />}
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent || C.gold }}>{title}</span>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: C.piMile }}>{children}</div>
    </div>
  );

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div
        ref={drawerRef}
        className="modal-drawer"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: C.gold + '40', background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 100%)` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono mb-1" style={{ color: C.gold }}>{course.id}</p>
              <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: 'Georgia, serif', color: C.white }}>
                {course.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <RelationBadge relation={course.relation} />
                <DifficultyBadge label={course.difficultyLabel} size="lg" />
                {sem && sem.tag && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: sem.tagColor + '30', color: sem.tagColor, border: `1px solid ${sem.tagColor}` }}>
                    {sem.tag}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: C.gray }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Clock size={16} color={C.buzzGold} className="mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{course.workloadHrsPerWeek}</p>
              <p className="text-xs" style={{ color: C.gray }}>hrs/week</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <BookOpen size={16} color={C.gold} className="mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{course.creditHours}</p>
              <p className="text-xs" style={{ color: C.gray }}>credits</p>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Star size={16} color={C.buzzGold} className="mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{course.communityRating.toFixed(1)}</p>
              <p className="text-xs" style={{ color: C.gray }}>community</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Difficulty meters */}
          <div className="rounded-lg p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${cfg.color}40` }}>
            <DifficultyMeter rating={course.difficultyRating} label={course.difficultyLabel} rawRating={course.communityDifficultyRaw} />
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Community Rating</p>
              <StarRating rating={course.communityRating} />
            </div>
          </div>

          {/* Semester + offering risk */}
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: C.piMile }}>
              <span style={{ color: C.gold }}>📅</span> {course.semester}
            </span>
            <RiskBadge risk={course.offeringRisk} />
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

          {/* Top tip callout */}
          <div className="rounded-lg p-4" style={{ background: `linear-gradient(135deg, ${C.buzzGold}18 0%, ${C.gold}10 100%)`, border: `1px solid ${C.buzzGold}50` }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} color={C.buzzGold} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.buzzGold }}>Top Community Tip</span>
            </div>
            <p className="text-sm leading-relaxed italic" style={{ color: C.white }}>"{course.topTip}"</p>
          </div>

          {/* Prerequisite warning */}
          {course.prerequisiteWarning && (
            <div className="rounded-lg p-4" style={{ background: `${C.orange}15`, border: `1px solid ${C.orange}50` }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={15} color={C.orange} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.orange }}>Prerequisite Warning</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#ffcfc7' }}>{course.prerequisiteWarning}</p>
            </div>
          )}

          {/* Offering risk */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${RISK_CONFIG[course.offeringRisk]?.color}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={15} color={RISK_CONFIG[course.offeringRisk]?.color} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: RISK_CONFIG[course.offeringRisk]?.color }}>
                Offering Risk
              </span>
              <RiskBadge risk={course.offeringRisk} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.piMile }}>{course.offeringRiskNote}</p>
          </div>

          {/* External links */}
          <div className="flex gap-3 pt-2">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: C.boldBlue, border: `1px solid ${C.boldBlue}50` }}
            >
              <ExternalLink size={12} /> View on OMSCentral
            </a>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: C.boldBlue, border: `1px solid ${C.boldBlue}50` }}
            >
              <ExternalLink size={12} /> View on Reddit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onClick }) {
  const cfg = diffConfig(course.difficultyLabel);
  const isBackup = course.status === 'backup';

  return (
    <div
      className="course-card rounded-lg p-3 border"
      style={{
        background: isBackup ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
        borderColor: cfg.color + '35',
      }}
      onClick={() => onClick(course)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(course)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono mb-0.5" style={{ color: C.gold + 'aa' }}>{course.id}</p>
          <p className="text-sm font-semibold leading-snug text-white truncate" title={course.name}>
            {course.name}
          </p>
        </div>
        <ChevronRight size={14} color={C.gray} className="flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <DifficultyBadge label={course.difficultyLabel} />
          <RelationBadge relation={course.relation} />
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: C.piMile }}>
          <Clock size={11} />
          <span>{course.workloadHrsPerWeek}h/wk</span>
        </div>
      </div>

      {course.status === 'completed' && (
        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: C.teal }}>
          <CheckCircle size={12} /> Completed
        </div>
      )}
      {course.status === 'in-progress' && (
        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: C.buzzGold }}>
          <TrendingUp size={12} /> In Progress
        </div>
      )}
    </div>
  );
}

// ─── Semester Card ────────────────────────────────────────────────────────────
function SemesterCard({ semester, onCourseClick }) {
  const courses = semesterCourses(semester.index);
  const hours = totalHours(semester.index);
  const isHeavy = hours > 25;
  const isMedium = hours >= 18 && hours <= 25;

  const loadColor = isHeavy ? C.orange : isMedium ? C.buzzGold : C.teal;
  const loadLabel = isHeavy ? '🚨 HEAVY LOAD' : isMedium ? '⚠️ MODERATE LOAD' : '✓ MANAGEABLE';

  return (
    <div
      className="rounded-xl p-4 flex-1 min-w-64"
      style={{
        background: `linear-gradient(160deg, ${C.navyDark} 0%, ${C.navy} 100%)`,
        border: `1px solid ${C.gold}30`,
        minWidth: '260px',
      }}
    >
      {/* Semester header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            {semester.label}
          </h3>
          {semester.tag && (
            <span
              className="text-xs px-2 py-0.5 rounded font-bold mt-1 inline-block"
              style={{ background: semester.tagColor + '25', color: semester.tagColor, border: `1px solid ${semester.tagColor}` }}
            >
              {semester.tag}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold" style={{ color: loadColor }}>{loadLabel}</p>
          <p className="text-xs mt-0.5" style={{ color: C.gray }}>~{hours} hrs/wk total</p>
        </div>
      </div>

      {/* Load bar */}
      <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min((hours / 35) * 100, 100)}%`, background: loadColor }}
        />
      </div>

      {/* Course cards */}
      <div className="space-y-2">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onClick={onCourseClick} />
        ))}
      </div>

      {/* Spring 2027 extra warning */}
      {semester.index === 2 && (
        <div className="mt-3 rounded-lg p-3" style={{ background: `${C.orange}18`, border: `1px solid ${C.orange}40` }}>
          <p className="text-xs leading-snug" style={{ color: '#ffcfc7' }}>
            <span className="font-bold">⚠️ Consider moving CS6795</span> to a lighter semester —
            CS6601 alone is 23 hrs/week.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
function AnalyticsDashboard() {
  // Chart A — Workload per semester
  const workloadData = SEMESTERS.map(s => ({
    name: s.label.replace(' 20', " '"),
    hours: totalHours(s.index),
  }));

  const workloadColor = (hours) => hours > 25 ? C.orange : hours >= 18 ? C.buzzGold : C.teal;

  // Chart B — Difficulty distribution
  const diffCounts = {};
  plannedCourses.forEach(c => {
    diffCounts[c.difficultyLabel] = (diffCounts[c.difficultyLabel] || 0) + 1;
  });
  const diffData = Object.entries(diffCounts).map(([name, value]) => ({
    name, value, color: DIFFICULTY_CONFIG[name]?.color || C.gray,
  }));

  // Chart C — Relation breakdown
  const relCounts = {};
  plannedCourses.forEach(c => {
    relCounts[c.relation] = (relCounts[c.relation] || 0) + c.creditHours;
  });
  const relData = Object.entries(relCounts).map(([name, value]) => ({
    name, value, color: RELATION_CONFIG[name]?.color || C.gray,
  }));

  // Chart D — Cumulative credits
  const semColors = [C.gold, C.teal, C.boldBlue, C.orange, C.purple, C.lime];
  let cumulative = 0;
  const progressData = SEMESTERS.map((s, i) => {
    const credits = semesterCourses(s.index).reduce((a, c) => a + c.creditHours, 0);
    cumulative += credits;
    return { label: s.label, credits, cumulative, color: semColors[i] };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg p-3 text-sm" style={{ background: C.navyDark, border: `1px solid ${C.gold}50` }}>
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || C.piMile }}>{p.name}: {p.value}{p.name === 'hours' ? ' hrs/wk' : ''}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
          Analytics Dashboard
        </h2>
        <p className="text-sm" style={{ color: C.gray }}>Workload, difficulty, and progress visualized across your full degree plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Chart A: Workload */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.gold}25` }}>
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            Semester Workload
          </h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>Estimated hrs/week (sum of course averages)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="name" tick={{ fill: C.piMile, fontSize: 11 }} />
              <YAxis tick={{ fill: C.piMile, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={20} stroke={C.orange} strokeDasharray="6 3" label={{ value: 'Full-time limit', fill: C.orange, fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {workloadData.map((entry, i) => (
                  <Cell key={i} fill={workloadColor(entry.hours)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart B: Difficulty Distribution */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.gold}25` }}>
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            Difficulty Distribution
          </h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>IT-adjusted ratings across all planned courses</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={diffData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {diffData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} course${value > 1 ? 's' : ''}`, name]}
                contentStyle={{ background: C.navyDark, border: `1px solid ${C.gold}50`, borderRadius: 8 }}
                labelStyle={{ color: C.white }}
                itemStyle={{ color: C.piMile }}
              />
              <Legend
                formatter={(value) => <span style={{ color: C.piMile, fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart C: Relation Breakdown */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.gold}25` }}>
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            Credit Hour Breakdown
          </h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>Credits by course category</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={relData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${value}cr`} labelLine={{ stroke: C.gray }}>
                  {relData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} credits`, name]}
                  contentStyle={{ background: C.navyDark, border: `1px solid ${C.gold}50`, borderRadius: 8 }}
                  itemStyle={{ color: C.piMile }}
                />
                <Legend formatter={(value) => <span style={{ color: C.piMile, fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D: Credit Progress */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.gold}25` }}>
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            Cumulative Credit Progress
          </h3>
          <p className="text-xs mb-4" style={{ color: C.gray }}>Degree completion: 30 credit hours total</p>
          <div className="space-y-4">
            {/* Visual progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: C.piMile }}>
                <span>0 credits</span>
                <span className="font-bold" style={{ color: C.buzzGold }}>30 credits (goal)</span>
              </div>
              <div className="h-6 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {progressData.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${(s.credits / 30) * 100}%`,
                      background: s.color,
                      borderRight: i < progressData.length - 1 ? '2px solid rgba(0,48,87,0.8)' : 'none',
                    }}
                    title={`${s.label}: ${s.credits} credits`}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {progressData.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span style={{ color: C.piMile }}>{s.label}</span>
                  <span className="font-semibold text-white ml-auto">{s.cumulative}cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Risk Flags Panel ─────────────────────────────────────────────────────────
function RiskFlagsPanel({ onCourseClick }) {
  const flags = [
    {
      course: COURSES.find(c => c.id === 'CS6150'),
      level: 'high',
      title: 'CS6150 — Computing for Good',
      note: 'Only offered ~6 times in 12 semesters. Has disappeared from the schedule. Always have CS6261 or CS6250 ready as substitutes.',
    },
    {
      course: COURSES.find(c => c.id === 'CS8803-O23'),
      level: 'medium',
      title: 'CS8803-O23 — Modern Internet Research Methods',
      note: 'Newer course with only ~4 semesters of history. Fall pattern observed but not guaranteed. Verify availability when registering for Fall 2027.',
    },
    {
      course: COURSES.find(c => c.id === 'PUBP8823'),
      level: 'medium',
      title: 'PUBP8823 — Geopolitics of Cybersecurity',
      note: 'Only 4 semesters of history since inaugural Spring 2023 offering. Spring availability confirmed but data is thin. Have a backup elective ready.',
    },
    {
      course: COURSES.find(c => c.id === 'CS6601'),
      level: 'high',
      title: '⚠️ Spring 2027 Load Warning',
      note: 'CS6601 alone averages 23 hrs/week. Paired with CS6795 (~8 hrs/week) = ~31 hrs/week while working full-time. Strongly consider moving CS6795 to a separate semester.',
      isSemesterWarning: true,
    },
    {
      course: COURSES.find(c => c.id === 'CS6601'),
      level: 'high',
      title: '💀 CS6601 — Take This Alone',
      note: 'Statistically the most brutal course in OMSCS. If you find yourself struggling after week 3, drop early — protect your GPA. Do not pair with any other course.',
      isCourseWarning: true,
    },
  ];

  const levelStyles = {
    high:   { border: C.orange, bg: `${C.orange}12`, icon: '🚨', label: 'HIGH RISK', labelColor: C.orange },
    medium: { border: C.buzzGold, bg: `${C.buzzGold}10`, icon: '⚠️', label: 'MEDIUM RISK', labelColor: C.buzzGold },
    low:    { border: C.teal, bg: `${C.teal}10`, icon: '✓', label: 'LOW RISK', labelColor: C.teal },
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-start gap-3 mb-2">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
            Risk Flags
          </h2>
          <p className="text-sm" style={{ color: C.gray }}>
            Scheduling risks and workload warnings to watch before each registration period.
          </p>
        </div>
      </div>

      {flags.map((flag, i) => {
        const s = levelStyles[flag.level];
        return (
          <div
            key={i}
            className="rounded-xl p-5"
            style={{ background: s.bg, border: `1px solid ${s.border}50` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-bold text-white text-sm">{flag.title}</h4>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: s.labelColor + '25', color: s.labelColor }}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: C.piMile }}>{flag.note}</p>
                {flag.course && !flag.isSemesterWarning && (
                  <button
                    className="mt-2 text-xs flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: C.gold }}
                    onClick={() => onCourseClick(flag.course)}
                  >
                    View course details <ChevronRight size={12} />
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
function BackgroundPanel() {
  const advantages = [
    { text: "Networking concepts", courses: "helps CS6675, CS6250 backup, PUBP courses" },
    { text: "Security/policy familiarity", courses: "PUBP6725 will feel like professional development" },
    { text: "Systems thinking", courses: "helps KBAI's structured reasoning, CS6300 project management" },
    { text: "Real-world context", courses: "enriches ethics, policy, and research courses" },
  ];

  const gaps = [
    { text: "Algorithms & data structures", action: "Study before CS6601 (Spring 2027)" },
    { text: "Python proficiency", action: "Must be solid before Fall 2026 starts" },
    { text: "Probability & statistics", action: "Review before CS6601" },
    { text: "No formal ML/math background", action: "CS6601 will expose this hard" },
    { text: "Academic writing", action: "KBAI and CogSci are writing-heavy; start practicing now" },
  ];

  const studyItems = [
    { subject: "Python", resource: "\"Automate the Boring Stuff with Python\" + LeetCode Easy problems" },
    { subject: "Algorithms", resource: "MIT 6.006 on YouTube (free)" },
    { subject: "Probability", resource: "Khan Academy Statistics + 3Blue1Brown \"Essence of\" series" },
    { subject: "AI Concepts", resource: "First 3 chapters of Russell & Norvig (free preview online)" },
  ];

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="rounded-xl p-5" style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navy} 100%)`, border: `1px solid ${C.gold}30` }}>
        <div className="flex items-start gap-3">
          <GraduationCap size={28} color={C.buzzGold} className="flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
              Your Background vs. This Degree
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: C.piMile }}>
              A personalized reality check. You're coming from an IT background into an AI/CS master's — that's ambitious and achievable.
              Here's exactly where your experience pays off, where the gaps are, and how to close them before you start.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Advantages */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.teal}40` }}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} color={C.teal} />
            <h3 className="font-bold" style={{ fontFamily: 'Georgia, serif', color: C.teal }}>
              Your IT Background Advantages
            </h3>
          </div>
          <div className="space-y-3">
            {advantages.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: C.teal }}>✅</span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.gray }}>{item.courses}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps */}
        <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.orange}40` }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} color={C.orange} />
            <h3 className="font-bold" style={{ fontFamily: 'Georgia, serif', color: C.orange }}>
              Gaps to Address
            </h3>
          </div>
          <div className="space-y-3">
            {gaps.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: C.orange }}>⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.gray }}>→ {item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study plan */}
      <div className="rounded-xl p-5" style={{ background: C.navyDark, border: `1px solid ${C.gold}30` }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} color={C.buzzGold} />
          <h3 className="font-bold" style={{ fontFamily: 'Georgia, serif', color: C.buzzGold }}>
            Recommended Self-Study Before Starting
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studyItems.map((item, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.gold}20` }}>
              <p className="text-sm font-bold mb-1" style={{ color: C.buzzGold }}>📚 {item.subject}</p>
              <p className="text-xs leading-relaxed" style={{ color: C.piMile }}>{item.resource}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cost Calculator ──────────────────────────────────────────────────────────
function CostCalculator() {
  const totalCourses = plannedCourses.length;
  const totalCredits = plannedCourses.reduce((s, c) => s + c.creditHours, 0);
  const costPerCredit = 225;
  const totalCost = totalCredits * costPerCredit;

  return (
    <div className="rounded-xl p-6" style={{ background: C.navyDark, border: `1px solid ${C.gold}30` }}>
      <div className="flex items-center gap-2 mb-5">
        <Award size={18} color={C.buzzGold} />
        <h3 className="font-bold" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
          Tuition Calculator
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Courses', value: totalCourses, suffix: '' },
          { label: 'Credit Hours', value: totalCredits, suffix: 'cr' },
          { label: 'Rate', value: `$${costPerCredit}`, suffix: '/credit' },
          { label: 'Estimated Total', value: `$${totalCost.toLocaleString()}`, suffix: '', highlight: true },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-lg p-4 text-center"
            style={{
              background: stat.highlight ? `linear-gradient(135deg, ${C.gold}20 0%, ${C.buzzGold}15 100%)` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${stat.highlight ? C.gold : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <p className="text-2xl font-bold" style={{ color: stat.highlight ? C.buzzGold : C.white }}>
              {stat.value}<span className="text-sm font-normal">{stat.suffix}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: C.gray }}>{stat.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs mt-4 text-center" style={{ color: C.gray }}>
        * Estimated tuition only — does not include student fees. Rates subject to change.
      </p>
    </div>
  );
}

// ─── Header / Hero ────────────────────────────────────────────────────────────
function Header({ activeTab, setActiveTab }) {
  const tabs = ['Overview', 'Timeline', 'Analytics', 'Risk Flags', 'Background'];
  const completedCount = COURSES.filter(c => c.status === 'completed').length;
  const inProgressCount = COURSES.filter(c => c.status === 'in-progress').length;

  return (
    <header className="sticky top-0 z-40 no-print" style={{ background: C.navy, borderBottom: `1px solid ${C.gold}30` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top bar — only visible on initial load / overview */}
        <div className="py-4 border-b" style={{ borderColor: `${C.gold}20` }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm"
                style={{ background: C.buzzGold, color: C.navy, fontFamily: 'Georgia, serif' }}
              >
                GT
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
                  OMSCS Journey
                </h1>
                <p className="text-xs" style={{ color: C.piMile }}>M.S. Computer Science — AI Specialization</p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { label: 'Courses', value: plannedCourses.length },
                { label: 'Credits', value: 30 },
                { label: 'Completion', value: 'Summer 2028' },
                { label: 'Est. Cost', value: '$6,750' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-sm font-bold" style={{ color: C.buzzGold }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: C.gray }}>{stat.label}</p>
                </div>
              ))}
              {(completedCount > 0 || inProgressCount > 0) && (
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: C.teal }}>{completedCount}/{plannedCourses.length}</p>
                  <p className="text-xs" style={{ color: C.gray }}>Done</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`nav-tab px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'active' : ''}`}
              style={{
                color: activeTab === tab ? C.buzzGold : C.piMile,
                borderBottomColor: activeTab === tab ? C.buzzGold : 'transparent',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel({ onCourseClick }) {
  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="rounded-xl p-4" style={{ background: `${C.boldBlue}15`, border: `1px solid ${C.boldBlue}40` }}>
        <div className="flex items-start gap-2">
          <Info size={16} color={C.boldBlue} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: C.piMile }}>
            <span className="font-semibold text-white">Difficulty ratings adjusted for IT-background student.</span>{' '}
            Raw OMSCentral community ratings shown separately in each course detail. Click any course card for the full breakdown.
          </p>
        </div>
      </div>

      {/* Quick summary timeline */}
      <div>
        <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
          Your Degree at a Glance
        </h2>
        <div className="space-y-3">
          {SEMESTERS.map(sem => {
            const courses = semesterCourses(sem.index);
            const hours = totalHours(sem.index);
            const isHeavy = hours > 25;
            return (
              <div
                key={sem.index}
                className="rounded-xl p-4 flex items-center gap-4 flex-wrap"
                style={{ background: C.navyDark, border: `1px solid ${C.gold}20` }}
              >
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: C.gold }}>{sem.label}</p>
                  {sem.tag && (
                    <span className="text-xs font-bold" style={{ color: sem.tagColor }}>{sem.tag}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {courses.map(c => (
                    <button
                      key={c.id}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                      style={{ background: diffConfig(c.difficultyLabel).color + '25', color: C.white, border: `1px solid ${diffConfig(c.difficultyLabel).color}50` }}
                      onClick={() => onCourseClick(c)}
                    >
                      <span>{c.shortName || c.name}</span>
                      <DifficultyBadge label={c.difficultyLabel} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm flex-shrink-0">
                  <Clock size={13} color={isHeavy ? C.orange : C.piMile} />
                  <span style={{ color: isHeavy ? C.orange : C.piMile }}>{hours} hrs/wk</span>
                  {isHeavy && <AlertTriangle size={13} color={C.orange} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CostCalculator />
    </div>
  );
}

// ─── Timeline Panel ───────────────────────────────────────────────────────────
function TimelinePanel({ onCourseClick }) {
  const backupCourses = COURSES.filter(c => c.status === 'backup');

  return (
    <div className="space-y-8">
      {/* Semester cards grid */}
      <div>
        <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
          Semester Timeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {SEMESTERS.map(sem => (
            <SemesterCard key={sem.index} semester={sem} onCourseClick={onCourseClick} />
          ))}
        </div>
      </div>

      {/* Alternatives */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: C.gold }}>
          Backup / Alternative Courses
        </h2>
        <div className="rounded-xl p-4" style={{ background: C.navyDark, border: `1px solid ${C.gray}40` }}>
          <p className="text-xs mb-4" style={{ color: C.gray }}>
            These courses are your safety net. If a planned course doesn't run or you need a lighter semester, these are proven options.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {backupCourses.map(course => (
              <CourseCard key={course.id} course={course} onClick={onCourseClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleModalClose = () => setSelectedCourse(null);

  const tabContent = {
    'Overview':   <OverviewPanel onCourseClick={handleCourseClick} />,
    'Timeline':   <TimelinePanel onCourseClick={handleCourseClick} />,
    'Analytics':  <AnalyticsDashboard />,
    'Risk Flags': <RiskFlagsPanel onCourseClick={handleCourseClick} />,
    'Background': <BackgroundPanel />,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.navy }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-up">
        {tabContent[activeTab]}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t py-8" style={{ borderColor: `${C.gold}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: C.gray }}>
            <p>Data sourced from OMSCentral, Reddit r/OMSCS, and GT course offering history PDF (Spring 2026).</p>
            <p className="text-center">Difficulty ratings are personalized estimates for an IT-background student and may differ from community averages.</p>
            <p className="text-right">Course availability not guaranteed — check omscs.gatech.edu before registering. <br /><span style={{ color: C.gold }}>Last updated: May 2026</span></p>
          </div>
        </div>
      </footer>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal course={selectedCourse} onClose={handleModalClose} />
      )}
    </div>
  );
}
