import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Edit3, Lock, CheckCircle, XCircle, Search, 
  Calendar, Layers, Filter, Check, Save, UserCheck, AlertTriangle 
} from 'lucide-react';
import { subscribeToOfficialAttendanceRecords, correctOfficialAttendanceByPL } from '../utils/firebase';

export default function PLPanel({ userProfile }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null); // record object currently being corrected
  const [correctedState, setCorrectedState] = useState({});
  const [filterSection, setFilterSection] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToOfficialAttendanceRecords((records) => {
      setAttendanceRecords(records);
    });
    return () => unsub();
  }, []);

  const handleOpenCorrectionModal = (record) => {
    setEditingRecord(record);
    setCorrectedState({ ...(record.records || {}) });
  };

  const handleSaveCorrection = async () => {
    if (!editingRecord) return;
    setIsSaving(true);
    setStatusMsg('');

    const res = await correctOfficialAttendanceByPL(
      editingRecord.id || editingRecord.docId,
      correctedState,
      userProfile?.displayName || 'Program Leader (PL)'
    );

    setIsSaving(false);
    if (res.success) {
      setStatusMsg(`✅ Attendance Record for Section ${editingRecord.section} (${editingRecord.date}) corrected successfully!`);
      setEditingRecord(null);
    } else {
      setStatusMsg('❌ Correction failed: ' + res.message);
    }
  };

  const filteredRecords = attendanceRecords.filter(r => {
    if (filterSection !== 'ALL' && r.section !== filterSection) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      r.date.includes(q) ||
      (r.subjectName && r.subjectName.toLowerCase().includes(q)) ||
      (r.mentorName && r.mentorName.toLowerCase().includes(q)) ||
      (r.section && r.section.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pl-panel animate-fade-in" style={{ padding: '24px 0' }}>
      {/* PL Portal Header */}
      <div className="pl-header glass" style={{ padding: '22px 26px', borderRadius: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>
            <UserCheck size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Program Leader (PL) Master Control Portal
            </h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Department-Wide Attendance Oversight across Section A, B, C & Master Correction Authority.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input 
              type="text" 
              className="form-input"
              placeholder="Search date, subject, or mentor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'A', 'B', 'C'].map((sec) => (
              <button 
                key={sec}
                className={`btn btn-sm ${filterSection === sec ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterSection(sec)}
              >
                {sec === 'ALL' ? 'All Sections' : `Sec ${sec}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '18px' }}>
          {statusMsg}
        </div>
      )}

      {/* Official Attendance Submissions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map((rec) => {
            const recordsMap = rec.records || {};
            const totalStudents = Object.keys(recordsMap).length;
            const presentCount = Object.values(recordsMap).filter(v => v === 'P').length;
            const absentCount = Object.values(recordsMap).filter(v => v === 'A').length;

            return (
              <div key={rec.id} className="glass card-hover-effect" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="preset-chip active" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Section {rec.section}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        📅 {rec.date}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '99px' }}>
                        🔒 Locked Record
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {rec.subjectName}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Submitted by Mentor: <strong>{rec.mentorName || 'Faculty'}</strong> on {new Date(rec.submittedAt).toLocaleString()}
                      {rec.correctedBy && ` • Corrected by PL: ${rec.correctedBy}`}
                    </p>
                  </div>

                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleOpenCorrectionModal(rec)}
                  >
                    <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                    <span>PL Attendance Correction</span>
                  </button>
                </div>

                {/* Stat pills summary */}
                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--success)' }}>✅ Present: {presentCount} Students</span>
                  <span style={{ color: 'var(--danger)' }}>❌ Absent: {absentCount} Students</span>
                  <span style={{ color: 'var(--text-muted)' }}>👥 Total: {totalStudents} Students</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 600 }}>
              No official attendance records found for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* PL Correction Modal */}
      {editingRecord && (
        <div className="auth-modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="auth-modal-container glass animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  PL Official Attendance Correction
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Section {editingRecord.section} • {editingRecord.subjectName} ({editingRecord.date})
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingRecord(null)}>✕</button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px', marginBottom: '18px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '10px 14px' }}>STUDENT EMAIL</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>CORRECTED STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(correctedState).map(([email, status]) => (
                    <tr key={email} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{email}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            className={`btn btn-sm ${status === 'P' ? 'btn-success' : 'btn-secondary'}`}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => setCorrectedState(prev => ({ ...prev, [email]: 'P' }))}
                          >
                            P
                          </button>
                          <button 
                            className={`btn btn-sm ${status === 'A' ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => setCorrectedState(prev => ({ ...prev, [email]: 'A' }))}
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={isSaving} onClick={handleSaveCorrection}>
                {isSaving ? 'Saving Correction...' : 'Save PL Correction 🔒'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
