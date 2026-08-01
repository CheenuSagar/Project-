import React, { useState } from 'react';
import { GraduationCap, UserCheck, Sparkles, Check, ArrowRight, Shield, X, Bell, BookOpen } from 'lucide-react';

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole, currentRole, allowClose = false }) {
  const [remember, setRemember] = useState(true);

  if (!isOpen) return null;

  const handleSelect = (role) => {
    try {
      if (remember) {
        localStorage.setItem('lecalert_user_role', role);
        localStorage.setItem('lecalert_remember_role', 'true');
      } else {
        localStorage.setItem('lecalert_user_role', role);
        localStorage.setItem('lecalert_remember_role', 'false');
      }
    } catch (e) {
      console.error('Role storage error:', e);
    }
    onSelectRole(role);
  };

  return (
    <div className="role-modal-overlay">
      <div className="role-modal-container glass animate-fade-in">
        {allowClose && (
          <button className="role-modal-close" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        )}

        <div className="role-modal-header">
          <div className="role-badge-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>ABES Academix Portal</span>
          </div>
          <h2 className="role-modal-title">Welcome! Choose Your Role</h2>
          <p className="role-modal-subtitle">
            Select how you want to use the application. Your dashboard, controls, and lecture notification alerts will be tailored to your portal.
          </p>
        </div>

        <div className="role-cards-grid">
          {/* Student Role Card */}
          <div 
            className={`role-card student-card ${currentRole === 'student' ? 'active-role' : ''}`}
            onClick={() => handleSelect('student')}
          >
            <div className="role-card-header">
              <div className="role-icon-wrapper student-icon">
                <GraduationCap size={32} />
              </div>
              {currentRole === 'student' && (
                <span className="current-active-tag">
                  <Check size={12} /> Active
                </span>
              )}
            </div>

            <h3 className="role-card-title">Student Portal</h3>
            <span className="role-tagline">Track Lectures & Schedule</span>
            <p className="role-card-desc">
              View section timetable, stay updated on upcoming classes, track breaks, and receive automated lecture start notifications.
            </p>

            <ul className="role-feature-list">
              <li><Check size={14} /> Section A, B & C Timetables</li>
              <li><Check size={14} /> Class Countdown & Next Lecture Alert</li>
              <li><Check size={14} /> Academic Calendar & Holidays</li>
            </ul>

            <button className="role-select-btn student-btn">
              <span>Enter as Student</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Teacher Role Card */}
          <div 
            className={`role-card teacher-card ${currentRole === 'teacher' ? 'active-role' : ''}`}
            onClick={() => handleSelect('teacher')}
          >
            <div className="role-card-header">
              <div className="role-icon-wrapper teacher-icon">
                <UserCheck size={32} />
              </div>
              {currentRole === 'teacher' && (
                <span className="current-active-tag">
                  <Check size={12} /> Active
                </span>
              )}
            </div>

            <h3 className="role-card-title">Teacher Portal</h3>
            <span className="role-tagline">Faculty Duties & Timetable</span>
            <p className="role-card-desc">
              Access individual faculty schedules, manage proxy duties, request slot swaps with colleagues, and receive teaching alerts.
            </p>

            <ul className="role-feature-list">
              <li><Check size={14} /> PIN Protected Faculty Account</li>
              <li><Check size={14} /> Proxy Assignment & Slot Swapping</li>
              <li><Check size={14} /> Syllabus & Attendance Tracking</li>
            </ul>

            <button className="role-select-btn teacher-btn">
              <span>Enter as Teacher</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="role-modal-footer">
          <label className="remember-role-checkbox">
            <input 
              type="checkbox" 
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)} 
            />
            <span>Remember my role choice on this device</span>
          </label>
        </div>
      </div>
    </div>
  );
}






