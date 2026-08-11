import React, { useState } from 'react';
import { ShieldCheck, FileText, Check, X, Lock, Eye, BookOpen, AlertCircle } from 'lucide-react';

export default function TermsModal({ isOpen, onAccept, onClose, allowClose = false }) {
  const [isChecked, setIsChecked] = useState(true);

  if (!isOpen) return null;

  const handleAgree = () => {
    if (!isChecked) return;
    try {
      localStorage.setItem('lecalert_terms_accepted', 'true');
      localStorage.setItem('lecalert_terms_accepted_date', new Date().toISOString());
    } catch (e) {
      console.error('Storage error:', e);
    }
    if (onAccept) onAccept();
  };

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal-container glass animate-fade-in">
        {allowClose && (
          <button className="terms-modal-close" onClick={onClose} title="Close Terms">
            <X size={20} />
          </button>
        )}

        <div className="terms-modal-header">
          <div className="terms-icon-badge">
            <ShieldCheck size={28} />
          </div>
          <h2 className="terms-modal-title">Terms of Service & User Agreement</h2>
          <p className="terms-modal-subtitle">
            Welcome to ABES MCA TimeTable & Notification Provider. Please read and accept our user agreement to continue using the application.
          </p>
        </div>

        {/* Scrollable Terms Content Box */}
        <div className="terms-content-scroll">
          <div className="terms-section">
            <h4 className="terms-section-title">
              <BookOpen size={16} /> 1. Acceptance of Agreement
            </h4>
            <p>
              By accessing, installing, or using the ABES MCA TimeTable Notification Provider application, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and User Agreement. If you do not agree to these terms, you may not use the app.
            </p>
          </div>

          <div className="terms-section">
            <h4 className="terms-section-title">
              <Lock size={16} /> 2. Privacy & Local Storage Policy
            </h4>
            <p>
              Your privacy is paramount. This application operates as an offline-first tool. All user preferences, timetable selections, section choices, role settings, and local reminder schedules are stored strictly on your local device storage (localStorage & native device notifications). No personal data or schedule information is collected, harvested, or transmitted to third-party tracking servers.
            </p>
          </div>

          <div className="terms-section">
            <h4 className="terms-section-title">
              <AlertCircle size={16} /> 3. Lecture Notifications & Reminders
            </h4>
            <p>
              Lecture start reminders and pre-alert chime notifications are scheduled locally on your device. Timely delivery of alerts depends on system notification permissions, alarm privileges, and device battery optimization settings. The app is provided to assist your academic routine, but users are advised to maintain awareness of their schedule.
            </p>
          </div>

          <div className="terms-section">
            <h4 className="terms-section-title">
              <FileText size={16} /> 4. Academic Schedule & Notice Accuracy
            </h4>
            <p>
              Timetable presets, syllabus portals, and holiday notices are updated for academic utility. Official college notice boards, department circulars, and head-of-department instructions remain the primary source of official truth. Faculty substitute assignments and slot swaps should be made in coordination with department guidelines.
            </p>
          </div>

          <div className="terms-section">
            <h4 className="terms-section-title">
              <Eye size={16} /> 5. Intellectual Property & Usage Rights
            </h4>
            <p>
              All code, UI designs, themes, and syllabus curation in this application are developed for student and faculty benefit at ABES Engineering College MCA Department. Unintended tampering, malicious modification, or reverse engineering for deceptive purposes is prohibited.
            </p>
          </div>

          <div className="terms-section">
            <h4 className="terms-section-title">
              <Check size={16} /> 6. Amendments & Updates
            </h4>
            <p>
              We reserve the right to revise or update these terms periodically to align with application feature additions or institutional policy updates. Continued use of the app signifies acceptance of any modified terms.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="terms-modal-footer">
          {!allowClose ? (
            <>
              <label className="terms-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={(e) => setIsChecked(e.target.checked)} 
                />
                <span>I have read, understood, and agree to the Terms of Service & User Agreement</span>
              </label>

              <button 
                className="btn btn-primary terms-accept-btn" 
                onClick={handleAgree}
                disabled={!isChecked}
              >
                <ShieldCheck size={18} /> Accept & Continue
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={onClose} style={{ margin: '0 auto' }}>
              Close Agreement
            </button>
          )}
        </div>
      </div>

      <style>{`
        .terms-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .terms-modal-container {
          width: 100%;
          max-width: 580px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          position: relative;
        }
        .terms-modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border-light);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .terms-modal-close:hover {
          background: var(--primary);
          color: #fff;
        }
        .terms-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .terms-icon-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px auto;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
        }
        .terms-modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .terms-modal-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .terms-content-scroll {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-card-hover);
          border: 1px solid var(--border-light);
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 320px;
        }
        .terms-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .terms-section-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .terms-section-title svg {
          color: var(--primary);
        }
        .terms-section p {
          font-size: 0.83rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .terms-modal-footer {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .terms-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-primary);
          cursor: pointer;
          user-select: none;
        }
        .terms-checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .terms-accept-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
