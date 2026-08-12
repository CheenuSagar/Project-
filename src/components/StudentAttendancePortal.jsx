import React, { useState, useEffect } from 'react';
import { 
  Award, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, Percent, Flame, Calendar, Clock, ArrowRight, Zap, RefreshCw 
} from 'lucide-react';
import { subscribeToOfficialAttendanceRecords } from '../utils/firebase';

export default function StudentAttendancePortal({ userProfile, selectedSection = 'A' }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentEmail = userProfile?.email || '230032010001@abes.ac.in';
  const studentName = userProfile?.displayName || 'MCA Student';

  useEffect(() => {
    const unsub = subscribeToOfficialAttendanceRecords((records) => {
      setAttendanceRecords(records || []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute subject-wise statistics
  const subjectStats = {};
  let totalClasses = 0;
  let totalAttended = 0;

  attendanceRecords.forEach(rec => {
    const recordsMap = rec.records || {};
    const studentStatus = recordsMap[studentEmail];
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

  // Fallback demo data if no records exist yet in Firestore
  const hasRecords = totalClasses > 0;
  
  const displayTotalClasses = hasRecords ? totalClasses : 48;
  const displayTotalAttended = hasRecords ? totalAttended : 41;
  const overallPercent = parseFloat(((displayTotalAttended / displayTotalClasses) * 100).toFixed(1));
  const isEligible = overallPercent >= 75.0;

  // Calculate Bunk Margin / Required Classes to reach 75%
  // Formula for max bunks: Math.floor((attended - 0.75 * total) / 0.75)
  // Formula for required classes: Math.ceil((0.75 * total - attended) / 0.25)
  let maxBunksAvailable = 0;
  let requiredClassesTo75 = 0;

  if (isEligible) {
    maxBunksAvailable = Math.floor((displayTotalAttended - 0.75 * displayTotalClasses) / 0.75);
    if (maxBunksAvailable < 0) maxBunksAvailable = 0;
  } else {
    requiredClassesTo75 = Math.ceil((0.75 * displayTotalClasses - displayTotalAttended) / 0.25);
    if (requiredClassesTo75 < 0) requiredClassesTo75 = 0;
  }

  // Demo subjects fallback
  const displaySubjects = hasRecords ? Object.keys(subjectStats).map(name => ({
    name,
    attended: subjectStats[name].attended,
    total: subjectStats[name].total,
    percent: parseFloat(((subjectStats[name].attended / subjectStats[name].total) * 100).toFixed(1))
  })) : [
    { name: 'DAA - Design & Analysis of Algorithms', attended: 12, total: 14, percent: 85.7 },
    { name: 'OS - Operating Systems', attended: 11, total: 13, percent: 84.6 },
    { name: 'DBMS - Database Management Systems', attended: 9, total: 11, percent: 81.8 },
    { name: 'CN - Computer Networks', attended: 6, total: 7, percent: 85.7 },
    { name: 'Web Technology & Python Lab', attended: 3, total: 3, percent: 100.0 }
  ];

  return (
    <div className="student-attendance-portal animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Top Welcome Header */}
      <div className="portal-header glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', border: '1px solid var(--border-light)' }}>
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
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {studentEmail}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px var(--primary-glow)' }}>
            {studentName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Overall Percentage */}
        <div className="glass card-hover-effect" style={{ padding: '24px', borderRadius: '24px', border: `2px solid ${isEligible ? 'var(--success)' : 'var(--danger)'}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Semester Score
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '2.4rem', fontWeight: 900, color: isEligible ? 'var(--success)' : 'var(--danger)' }}>
                {overallPercent}%
              </h2>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: isEligible ? 'var(--success-glow)' : 'rgba(239, 68, 68, 0.15)', color: isEligible ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={24} />
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${Math.min(overallPercent, 100)}%`, height: '100%', background: isEligible ? 'var(--success-gradient)' : 'var(--danger)', borderRadius: '99px', transition: 'width 0.8s ease-in-out' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
              Attended: <strong>{displayTotalAttended} / {displayTotalClasses}</strong> Lectures
            </span>
            <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, background: isEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isEligible ? 'var(--success)' : 'var(--danger)' }}>
              {isEligible ? 'Eligible 🟢' : 'Shortage 🔴'}
            </span>
          </div>
        </div>

        {/* Card 2: Smart Bunk & Margin Predictor */}
        <div className="glass card-hover-effect" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-light)', background: isEligible ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(168, 85, 247, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEligible ? 'Bunk Allowance Margin' : 'Required Attendance Action'}
              </span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {isEligible ? (
                  <span>{maxBunksAvailable} Bunk Classes Available 🏖️</span>
                ) : (
                  <span>Attend Next {requiredClassesTo75} Classes ⚠️</span>
                )}
              </h3>
            </div>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isEligible ? (
              <span>You are safely above the <strong>75% exam criteria</strong>. You can bunk up to <strong>{maxBunksAvailable}</strong> upcoming lectures without falling below 75%!</span>
            ) : (
              <span>Your attendance is below 75%. You must attend <strong>{requiredClassesTo75} consecutive lectures</strong> to restore your exam eligibility threshold!</span>
            )}
          </p>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              Subject-Wise Attendance Breakdown
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Individual course score & status for MCA 3rd Sem.
            </p>
          </div>
          {!hasRecords && (
            <span className="preset-chip active" style={{ fontSize: '0.75rem' }}>
              Sample View (Live Records Syncing)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displaySubjects.map((sub, idx) => {
            const subEligible = sub.percent >= 75.0;
            const subMaxBunks = subEligible ? Math.floor((sub.attended - 0.75 * sub.total) / 0.75) : 0;
            const subReqClasses = !subEligible ? Math.ceil((0.75 * sub.total - sub.attended) / 0.25) : 0;

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
                    <span>Attended: <strong>{sub.attended} / {sub.total}</strong></span>
                    <span>•</span>
                    <span style={{ color: subEligible ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                      {subEligible ? `Safe (${subMaxBunks} Bunks Left)` : `Shortage (Need +${subReqClasses} Classes)`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Subject Progress Bar */}
                  <div style={{ width: '120px', textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: subEligible ? 'var(--success)' : 'var(--danger)' }}>
                      {sub.percent}%
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${Math.min(sub.percent, 100)}%`, height: '100%', background: subEligible ? 'var(--success-gradient)' : 'var(--danger)', borderRadius: '99px' }}></div>
                    </div>
                  </div>

                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: subEligible ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: subEligible ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {subEligible ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
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
