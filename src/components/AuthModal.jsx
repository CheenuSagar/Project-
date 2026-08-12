import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, UserCheck, Shield, Key, Mail, Lock, User, 
  ArrowRight, Sparkles, X, Check, Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import { loginFirebaseUser, registerFirebaseUser } from '../utils/firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, allowClose = true, initialTab = 'student' }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'student'); // 'student' | 'teacher' | 'admin'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [facultyPin, setFacultyPin] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'student');
      setErrorMsg('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setFacultyPin('');
    setAdminPasscode('');
    setErrorMsg('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        // Admin Master Passcode Verification
        if (adminPasscode.trim() === 'abes2026' || adminPasscode.trim() === '1234') {
          onAuthSuccess({
            role: 'admin',
            displayName: 'Master Administrator',
            email: 'admin@abes.ac.in',
            roomNumber: ''
          });
          resetForm();
        } else {
          setErrorMsg('Invalid Admin Security Passcode! Default is abes2026 or 1234.');
        }
        setLoading(false);
        return;
      }

      if (activeTab === 'teacher' && !isRegistering) {
        // Faculty PIN Quick Auth Check
        if (facultyPin.trim().length >= 4) {
          onAuthSuccess({
            role: 'teacher',
            displayName: displayName.trim() || 'Faculty Member',
            email: `${facultyPin.trim()}@faculty.abes.ac.in`,
            facultyPin: facultyPin.trim()
          });
          resetForm();
          setLoading(false);
          return;
        }
      }

      // Standard Firebase Email/Password Auth
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both Email and Password.');
        setLoading(false);
        return;
      }

      let res;
      if (isRegistering) {
        const nameToUse = displayName.trim() || (activeTab === 'teacher' ? 'Faculty Professor' : 'MCA Student');
        res = await registerFirebaseUser(email.trim(), password.trim(), nameToUse, activeTab);
      } else {
        res = await loginFirebaseUser(email.trim(), password.trim());
      }

      if (res.success) {
        onAuthSuccess({
          role: res.role || activeTab,
          displayName: res.user?.displayName || displayName || 'User',
          email: res.user?.email || email,
          uid: res.user?.uid,
          roomNumber: res.roomNumber || ''
        });
        resetForm();
      } else {
        // Friendly error messages
        let msg = res.message || 'Authentication failed.';
        if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
          msg = 'Invalid Email or Password. If you are new, click "Create Account".';
        } else if (msg.includes('auth/email-already-in-use')) {
          msg = 'An account with this email already exists. Please log in.';
        } else if (msg.includes('auth/weak-password')) {
          msg = 'Password should be at least 6 characters long.';
        }
        setErrorMsg(msg);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container glass animate-fade-in">
        {allowClose && (
          <button className="auth-modal-close" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        )}

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-badge-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>ABES MCA TimeTable System</span>
          </div>
          <h2 className="auth-modal-title">
            {isRegistering ? 'Create Your Account' : 'Portal Login & Access'}
          </h2>
          <p className="auth-modal-subtitle">
            Connect to live synchronized MCA timetable, faculty duties & classroom portals.
          </p>
        </div>

        {/* Role Tabs Selection */}
        <div className="auth-role-tabs">
          <button 
            className={`auth-role-tab ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => handleTabChange('student')}
          >
            <GraduationCap size={15} /> Student
          </button>
          <button 
            className={`auth-role-tab ${activeTab === 'mentor' ? 'active' : ''}`}
            onClick={() => handleTabChange('mentor')}
          >
            <User size={15} /> Mentor
          </button>
          <button 
            className={`auth-role-tab ${activeTab === 'pl' ? 'active' : ''}`}
            onClick={() => handleTabChange('pl')}
          >
            <UserCheck size={15} /> PL Portal
          </button>
          <button 
            className={`auth-role-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
          >
            <Shield size={15} /> Admin
          </button>
        </div>

        {/* Form Error Banner */}
        {errorMsg && (
          <div className="auth-error-banner animate-pulse">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          {activeTab === 'admin' ? (
            <div className="auth-input-group">
              <label className="auth-label">Master Security Passcode</label>
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input 
                  type="password"
                  className="form-input auth-input"
                  placeholder="Enter admin security passcode..."
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          ) : activeTab === 'teacher' && !isRegistering ? (
            <>
              <div className="auth-input-group">
                <label className="auth-label">Faculty PIN / Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="text"
                    className="form-input auth-input"
                    placeholder="Enter Faculty PIN (e.g. 1001) or Email..."
                    value={email || facultyPin}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,4}$/.test(val)) {
                        setFacultyPin(val);
                        setEmail('');
                      } else {
                        setEmail(val);
                        setFacultyPin('');
                      }
                    }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {email && (
                <div className="auth-input-group">
                  <label className="auth-label">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="form-input auth-input"
                      placeholder="Enter password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {isRegistering && (
                <div className="auth-input-group">
                  <label className="auth-label">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text"
                      className="form-input auth-input"
                      placeholder={activeTab === 'teacher' ? 'Prof. Name' : 'Student Name'}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label">
                  {activeTab === 'student' ? 'Student Email / Roll No.' : 'Faculty Email'}
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="text"
                    className="form-input auth-input"
                    placeholder={activeTab === 'student' ? 'e.g. 230032010001@abes.ac.in' : 'e.g. faculty@abes.ac.in'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-input auth-input"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{activeTab === 'admin' ? 'Unlock Admin' : (isRegistering ? 'Create Account' : 'Sign In')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Register */}
        <div className="auth-footer-actions">
          {activeTab !== 'admin' && (
            <button 
              type="button"
              className="auth-switch-mode-btn"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMsg('');
              }}
            >
              {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .auth-modal-container {
          width: 100%;
          max-width: 480px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          position: relative;
        }
        .auth-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border-light);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .auth-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .auth-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
        }
        .auth-modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .auth-modal-subtitle {
          font-size: 0.84rem;
          color: var(--text-secondary);
        }
        .auth-role-tabs {
          display: flex;
          gap: 6px;
          background: var(--bg-card-hover);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border-light);
          margin-bottom: 18px;
        }
        .auth-role-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .auth-role-tab.active {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .auth-error-banner {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .auth-form-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .auth-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .auth-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .auth-input {
          padding-left: 38px !important;
          padding-right: 38px !important;
          width: 100%;
        }
        .password-toggle-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .auth-help-text {
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .auth-submit-btn {
          margin-top: 6px;
          padding: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-footer-actions {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }
        .auth-switch-mode-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }
        .demo-login-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin: 4px 0;
        }
        .demo-login-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
