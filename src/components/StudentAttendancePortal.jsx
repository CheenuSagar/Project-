import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, Percent, Flame, Calendar, Clock, ArrowRight, Zap, RefreshCw, Sliders, Target, Info, Lock, Edit3, UserCheck 
} from 'lucide-react';
import { subscribeToOfficialAttendanceRecords } from '../utils/firebase';

export default function StudentAttendancePortal({ userProfile, selectedSection = 'A', onOpenRollModal }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetSliderVal, setTargetSliderVal] = useState(75);

  // Authenticated Student Identity
  const rawName = userProfile?.displayName || '';
  const studentName = rawName.replace(/\s*\(\d+\)/g, '').trim() || 'MCA Student';
  
  // Extract roll number from profile or email
  const rawEmail = userProfile?.email || '';
  const profileRoll = userProfile?.rollNumber || (rawEmail ? rawEmail.split('@')[0] : '');
  
  // Format active email key for Firestore match
  const activeEmail = rawEmail.toLowerCase();
  const displayRoll = profileRoll.includes('@') ? profileRoll.split('@')[0] : profileRoll;
  const isRollEmail = activeEmail && (/^\d+$/.test(activeEmail.split('@')[0]) || (displayRoll && activeEmail.startsWith(displayRoll.toLowerCase())));

  useEffect(() => {
    const unsub = subscribeToOfficialAttendanceRecords((records) => {
      setAttendanceRecords(records || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute subject-wise statistics STRICTLY for logged-in student
  const subjectStats = {};
  let totalClasses = 0;
  let totalAttended = 0;

  attendanceRecords.forEach(rec => {
    const recordsMap = rec.records || {};
    // Match by exact authenticated email OR roll number email
    const studentStatus = recordsMap[activeEmail] || recordsMap[`${displayRoll}@abes.ac.in`?.toLowerCase()];
    if (studentStatus) {
      const subName = rec.subjectName || 'General Subject';
      if (!subjectStats[subName]) {
        subjectStats[subName] = { attended: 0, total: 0, subjectCode: rec.subjectCode || '' };
      }
      subjectStats[subName].total += 1;
      totalClasses += 1;

      if (studentStatus === 'P') {
        subjectStats[subName].attended += 1;
        totalAttended += 1;
      }
    }
  });

  const hasRecords = totalClasses > 0;
  
  // Clean Zero Baseline when no official attendance records exist yet
  const displayTotalClasses = hasRecords ? totalClasses : 0;
  const displayTotalAttended = hasRecords ? totalAttended : 0;
  const rawPercent = displayTotalClasses > 0 ? (displayTotalAttended / displayTotalClasses) * 100 : 0.0;
  const overallPercent = parseFloat(rawPercent.toFixed(1));
  const isEligible = hasRecords ? overallPercent >= 75.0 : true; // Default neutral

  // Exact Mathematical Target Simulator Calculations
  const targetFrac = targetSliderVal / 100;
  let targetClassesNeeded = 0;
  let targetBunksAllowed = 0;
  let simulatedFinalPercent = 0;

  if (displayTotalClasses === 0) {
    targetClassesNeeded = Math.ceil(targetFrac * 10);
    simulatedFinalPercent = targetSliderVal;
  } else if (targetSliderVal > overallPercent) {
    if (targetFrac < 1) {
      targetClassesNeeded = Math.ceil((targetFrac * displayTotalClasses - displayTotalAttended) / (1 - targetFrac));
    } else {
      targetClassesNeeded = 999;
    }
    if (targetClassesNeeded < 0) targetClassesNeeded = 0;
    
    const simAttended = displayTotalAttended + targetClassesNeeded;
    const simConducted = displayTotalClasses + targetClassesNeeded;
    simulatedFinalPercent = parseFloat(((simAttended / simConducted) * 100).toFixed(1));
  } else {
    targetBunksAllowed = Math.floor((displayTotalAttended - targetFrac * displayTotalClasses) / targetFrac);
    if (targetBunksAllowed < 0) targetBunksAllowed = 0;

    const simConducted = displayTotalClasses + targetBunksAllowed;
    simulatedFinalPercent = simConducted > 0 ? parseFloat(((displayTotalAttended / simConducted) * 100).toFixed(1)) : 0;
  }

  // Official MCA Subjects List
  const displaySubjects = hasRecords ? Object.keys(subjectStats).map(name => ({
    name,
    attended: subjectStats[name].attended,
    total: subjectStats[name].total,
    percent: parseFloat(((subjectStats[name].attended / subjectStats[name].total) * 100).toFixed(1))
  })) : [
    { name: 'DAA - Design & Analysis of Algorithm (25CA301)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Agile S/w Dev & Testing (25CA302)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Computer Networks (25CA303)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Elective-I: AML (25CA304-E1) / Cloud-II (E2)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Elective-II: Data Analytics (25DE002) / Cyber Security (25DE003)', attended: 0, total: 0, percent: 0.0 },
    { name: 'DAA Lab (25CA351)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Full Stack Lab (25VC352)', attended: 0, total: 0, percent: 0.0 },
    { name: 'Mini Project (25CA353)', attended: 0, total: 0, percent: 0.0 }
  ];

  return (
    <div className="student-attendance-portal animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Top Welcome Header */}
      <div className="portal-header glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', border: '1px solid var(--border-light)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="preset-chip active" style={{ fontSize: '0.78rem' }}>
              Official MCA Attendance Portal
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Section {selectedSection}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Attendance & Eligibility Hub
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Track your semester attendance criteria, bunk margin, and subject breakdowns in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
              Roll: {displayRoll}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px var(--primary-glow)' }}>
            {studentName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Secured Authenticated Student Identity Card */}
      <div 
        className="glass" 
        style={{ 
          padding: '18px 22px', 
          borderRadius: '20px', 
          marginBottom: '24px', 
          border: '1.5px solid var(--border-light)', 
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(16, 185, 129, 0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.14)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {studentName}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', fontSize: '0.72rem', fontWeight: 800 }}>
                Verified Student 🔒
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Official Roll No: <strong style={{ color: 'var(--primary)' }}>{displayRoll || 'MCA Student'}</strong> {!isRollEmail && activeEmail ? `(${activeEmail})` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Overall Percentage */}
        <div className="glass card-hover-effect" style={{ padding: '24px', borderRadius: '24px', border: '2px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Semester Score
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {overallPercent}%
              </h2>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={24} />
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${Math.min(overallPercent, 100)}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: '99px', transition: 'width 0.8s ease-in-out' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
              Attended: <strong>{displayTotalAttended} / {displayTotalClasses}</strong> Lectures
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)' }}>
              {hasRecords ? (isEligible ? 'Eligible 🟢' : 'Shortage 🔴') : 'Fresh Semester (0 Record)'}
            </span>
          </div>
        </div>
      </div>

      {/* No Attendance Record Notice Banner */}
      {!hasRecords && (
        <div className="glass" style={{ padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border-light)', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(79, 70, 229, 0.08))', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              No Official Attendance Marked Yet for {displayRoll}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Once your subject professors mark official attendance for Section {selectedSection}, your live attendance score & subject breakdown will update automatically.
            </p>
          </div>
        </div>
      )}

      {/* Target Percentage Slider Calculator Card */}
      <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-light)', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(6, 182, 212, 0.06))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Target Percentage Simulator 🎚️
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Select or drag any target percentage (50% - 95%) to calculate required lectures or bunk allowance!
              </p>
            </div>
          </div>

          <div style={{ padding: '6px 18px', borderRadius: '99px', background: 'var(--primary-gradient)', color: '#fff', fontSize: '1.2rem', fontWeight: 900, boxShadow: '0 6px 18px var(--primary-glow)' }}>
            Target: {targetSliderVal}%
          </div>
        </div>

        {/* Quick Target Chips Preset Selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[75, 80, 85, 90, 95].map((val) => (
            <button 
              key={val}
              className={`preset-chip ${targetSliderVal === val ? 'active' : ''}`}
              onClick={() => setTargetSliderVal(val)}
              style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 800 }}
            >
              {val}% {val === 75 ? '(75% Exam Criteria)' : (val === 90 ? '🏆 Distinction' : 'Target')}
            </button>
          ))}
        </div>

        {/* Interactive Slider Input */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="range"
            min="50"
            max="95"
            step="1"
            value={targetSliderVal}
            onChange={(e) => setTargetSliderVal(Number(e.target.value))}
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '99px',
              outline: 'none',
              accentColor: 'var(--primary)',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Dynamic Calculator Result Output Card */}
        <div style={{ background: 'rgba(79, 70, 229, 0.12)', border: '1.5px solid var(--primary)', borderRadius: '18px', padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mathematical Simulation for {targetSliderVal}% Goal:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
                {displayTotalClasses === 0 ? (
                  <span>👉 To reach {targetSliderVal}%, attend <strong style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{targetClassesNeeded}</strong> out of every 10 upcoming lectures!</span>
                ) : (targetSliderVal > overallPercent ? (
                  <span>👉 You must attend the next <strong style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{targetClassesNeeded}</strong> consecutive lectures to reach {targetSliderVal}%!</span>
                ) : (
                  <span>🎉 You can bunk up to <strong style={{ color: 'var(--success)', fontSize: '1.4rem' }}>{targetBunksAllowed}</strong> lectures & still stay above {targetSliderVal}%!</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '10px 16px', borderRadius: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                SIMULATED OUTCOME
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)' }}>
                Target: {simulatedFinalPercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {displayTotalClasses === 0 ? 'Starting Fresh Semester' : `${displayTotalAttended + targetClassesNeeded} / ${displayTotalClasses + targetClassesNeeded} Lectures`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              Subject-Wise Attendance Breakdown ({displayRoll})
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Individual course score & status for MCA 3rd Sem (Section {selectedSection}).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displaySubjects.map((sub, idx) => {
            const subEligible = sub.total > 0 ? sub.percent >= 75.0 : true;

            return (
              <div 
                key={idx} 
                className="glass card-hover-effect" 
                style={{ padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}
              >
                <div style={{ flex: '1 1 240px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {sub.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Attended: <strong>{sub.attended} / {sub.total}</strong> Lectures</span>
                    <span>•</span>
                    <span style={{ color: sub.total > 0 ? (subEligible ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)', fontWeight: 700 }}>
                      {sub.total > 0 ? (subEligible ? 'Safe' : 'Shortage') : 'No Attendance Marked Yet'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Subject Progress Bar */}
                  <div style={{ width: '120px', textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: sub.total > 0 ? (subEligible ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                      {sub.percent}%
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${Math.min(sub.percent, 100)}%`, height: '100%', background: sub.total > 0 ? (subEligible ? 'var(--success-gradient)' : 'var(--danger)') : 'var(--border-light)', borderRadius: '99px' }}></div>
                    </div>
                  </div>

                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: sub.total > 0 ? (subEligible ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)') : 'rgba(255, 255, 255, 0.05)', color: sub.total > 0 ? (subEligible ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
