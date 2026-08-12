import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Lock, Save, Calendar, 
  Layers, BookOpen, Users, Check, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { saveOfficialAttendance, subscribeToOfficialAttendanceRecords } from '../utils/firebase';

const SAMPLE_STUDENTS = {
  A: [
    { email: '230032010001@abes.ac.in', name: 'Aarav Sharma', roll: '230032010001' },
    { email: '230032010002@abes.ac.in', name: 'Aditi Verma', roll: '230032010002' },
    { email: '230032010003@abes.ac.in', name: 'Akash Gupta', roll: '230032010003' },
    { email: '230032010004@abes.ac.in', name: 'Ananya Roy', roll: '230032010004' },
    { email: '230032010005@abes.ac.in', name: 'Bhavya Singh', roll: '230032010005' },
    { email: '230032010006@abes.ac.in', name: 'Chetan Kumar', roll: '230032010006' }
  ],
  B: [
    { email: '230032010020@abes.ac.in', name: 'Devendra Patel', roll: '230032010020' },
    { email: '230032010021@abes.ac.in', name: 'Divya Aggarwal', roll: '230032010021' },
    { email: '230032010022@abes.ac.in', name: 'Ishan Malhotra', roll: '230032010022' },
    { email: '230032010023@abes.ac.in', name: 'Kavya Pandey', roll: '230032010023' },
    { email: '230032010024@abes.ac.in', name: 'Manish Tiwari', roll: '230032010024' }
  ],
  C: [
    { email: '230032010040@abes.ac.in', name: 'Nikhil Saxena', roll: '230032010040' },
    { email: '230032010041@abes.ac.in', name: 'Pooja Joshi', roll: '230032010041' },
    { email: '230032010042@abes.ac.in', name: 'Rahul Sagar', roll: '230032010042' },
    { email: '230032010043@abes.ac.in', name: 'Riya Singhal', roll: '230032010043' },
    { email: '230032010044@abes.ac.in', name: 'Sneha Mishra', roll: '230032010044' }
  ]
};

const SUBJECTS = [
  'Design & Analysis of Algorithms (DAA)',
  'Agile S/w Dev & Testing',
  'Computer Networks',
  'Departmental Elective (Blockchain/Analytics)',
  'DAA Lab',
  'Networks Lab',
  'Mini Project'
];

export default function MentorPanel({ userProfile }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

  const [attendanceState, setAttendanceState] = useState({}); // { studentEmail: 'P' | 'A' }
  const [allRecords, setAllRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch submitted records to check if locked
  useEffect(() => {
    const unsub = subscribeToOfficialAttendanceRecords((records) => {
      setAllRecords(records);
    });
    return () => unsub();
  }, []);

  const currentStudents = SAMPLE_STUDENTS[selectedSection] || [];

  // Check if attendance is already locked for this date, section, & subject
  const currentDocId = `${selectedDate}_${selectedSection}_${selectedSubject.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const existingRecord = allRecords.find(r => r.id === currentDocId || r.docId === currentDocId);
  const isLocked = existingRecord?.locked;

  useEffect(() => {
    // If existing record exists, load its attendance map
    if (existingRecord && existingRecord.records) {
      setAttendanceState(existingRecord.records);
    } else {
      // Default all to Present
      const defaultState = {};
      currentStudents.forEach(st => {
        defaultState[st.email] = 'P';
      });
      setAttendanceState(defaultState);
    }
  }, [selectedDate, selectedSection, selectedSubject, existingRecord]);

  const handleToggleAttendance = (email, status) => {
    if (isLocked) return;
    setAttendanceState(prev => ({
      ...prev,
      [email]: status
    }));
  };

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const updated = {};
    currentStudents.forEach(st => {
      updated[st.email] = 'P';
    });
    setAttendanceState(updated);
  };

  const handleSubmitAttendance = async () => {
    if (isLocked) return;
    setIsSubmitting(true);
    setStatusMsg('');

    const res = await saveOfficialAttendance(
      selectedDate,
      selectedSection,
      selectedSubject,
      userProfile?.uid || 'mentor1',
      userProfile?.displayName || 'Faculty Mentor',
      attendanceState
    );

    setIsSubmitting(false);
    if (res.success) {
      setStatusMsg('✅ Official Attendance Submitted & Locked! Tamper-proof record saved.');
    } else {
      setStatusMsg('❌ Submission failed: ' + res.message);
    }
  };

  return (
    <div className="mentor-panel animate-fade-in" style={{ padding: '24px 0' }}>
      <div className="mentor-header glass" style={{ padding: '22px 26px', borderRadius: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Faculty Mentor Attendance Portal
            </h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Official 1-Tap Attendance Marking & Tamper-Proof Record Submission for Assigned Mentees.
            </p>
          </div>
        </div>

        {/* Selection Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Date
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              <Layers size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Section
            </label>
            <select 
              className="form-input"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="A">Section III-A (AB-207)</option>
              <option value="B">Section III-B (AB-208)</option>
              <option value="C">Section III-C (AB-209)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Subject / Lab
            </label>
            <select 
              className="form-input"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ width: '100%' }}
            >
              {SUBJECTS.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lock Banner */}
      {isLocked ? (
        <div className="glass animate-scale-in" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Lock size={26} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Official Attendance Locked 🔒
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Submitted by <strong>{existingRecord.mentorName || 'Faculty'}</strong> on {new Date(existingRecord.submittedAt).toLocaleString()}. Attendance is tamper-proof. Corrections can ONLY be done by Program Leader (PL) or Admin.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Marking Attendance: Section {selectedSection} ({currentStudents.length} Assigned Mentees)
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllPresent}>
            <Check size={14} /> Mark All Present
          </button>
        </div>
      )}

      {statusMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '18px' }}>
          {statusMsg}
        </div>
      )}

      {/* Mentees Student Table */}
      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>ROLL NO.</th>
              <th style={{ padding: '12px 16px' }}>STUDENT NAME</th>
              <th style={{ padding: '12px 16px' }}>EMAIL ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>ATTENDANCE STATUS</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((st) => {
              const status = attendanceState[st.email] || 'P';
              return (
                <tr key={st.email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {st.roll}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {st.email}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        disabled={isLocked}
                        className={`btn btn-sm ${status === 'P' ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', opacity: isLocked && status !== 'P' ? 0.4 : 1 }}
                        onClick={() => handleToggleAttendance(st.email, 'P')}
                      >
                        PRESENT (P)
                      </button>
                      <button 
                        disabled={isLocked}
                        className={`btn btn-sm ${status === 'A' ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', opacity: isLocked && status !== 'A' ? 0.4 : 1, background: status === 'A' ? 'var(--danger)' : undefined, color: status === 'A' ? '#fff' : undefined }}
                        onClick={() => handleToggleAttendance(st.email, 'A')}
                      >
                        ABSENT (A)
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      {!isLocked && (
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button 
            className="btn btn-primary"
            style={{ padding: '14px 24px', fontSize: '0.95rem', fontWeight: 800, borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            disabled={isSubmitting}
            onClick={handleSubmitAttendance}
          >
            <Lock size={18} />
            <span>{isSubmitting ? 'Locking Attendance...' : 'Submit & Lock Official Attendance 🔒'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
