import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, UserCheck, Shield, Key, Mail, Lock, User, 
  ArrowRight, Sparkles, X, Check, Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import { loginFirebaseUser, registerFirebaseUser, loginWithGoogleFirebase, deleteFirebaseAccount, logoutFirebaseUser } from '../utils/firebase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onLogoutSuccess, userProfile, allowClose = true, initialTab = 'student' }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [authStep, setAuthStep] = useState('choice'); // 'choice' | 'credentials'
  const [activeTab, setActiveTab] = useState(initialTab || 'student'); // 'student' | 'mentor' | 'pl' | 'admin'
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
    setIsRegistering(false);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogleFirebase();
      if (res.success) {
        onAuthSuccess({
          role: 'student',
          displayName: res.displayName,
          email: res.user?.email,
          uid: res.user?.uid,
          rollNumber: res.rollNumber || ''
        });
        resetForm();
      } else {
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setErrorMsg('Google Sign-In error. Please try again.');
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

        {/* Logged In User Profile & Play Store Compliant Delete Account */}
        {userProfile ? (
          <div style={{ padding: '10px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontSize: '1.8rem', fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)' }}>
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : '👤'}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {userProfile.displayName || 'Logged In User'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {userProfile.email} • <span style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--primary)' }}>{userProfile.role || 'Student'}</span>
              </p>
              {userProfile.rollNumber && (
                <span className="preset-chip active" style={{ marginTop: '8px', display: 'inline-block', fontSize: '0.78rem' }}>
                  Roll No: {userProfile.rollNumber}
                </span>
              )}
            </div>

            {/* Logout & Delete Account Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
                onClick={async () => {
                  await logoutFirebaseUser();
                  if (onLogoutSuccess) onLogoutSuccess();
                  onClose();
                }}
              >
                Sign Out / Logout 🚪
              </button>

              {!showConfirmDelete ? (
                <button 
                  type="button"
                  className="btn"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: 800 }}
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Delete Account & Data 🗑️
                </button>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Are you sure? This will permanently delete your account and profile data (Play Store Compliant).
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1 }} 
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      style={{ flex: 1, background: 'var(--danger)', color: '#fff', fontWeight: 800 }}
                      onClick={async () => {
                        setLoading(true);
                        const res = await deleteFirebaseAccount();
                        setLoading(false);
                        if (res.success) {
                          if (onLogoutSuccess) onLogoutSuccess();
                          onClose();
                        } else {
                          setErrorMsg(res.message || 'Delete failed.');
                        }
                      }}
                    >
                      Permanently Delete 🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Choose Login Method / Role Screen */}
        {authStep === 'choice' ? (
          <div className="auth-choice-step animate-fade-in">
            <div className="auth-modal-header text-center" style={{ marginBottom: '20px' }}>
              <div className="auth-badge-pill" style={{ margin: '0 auto 10px auto' }}>
                <Sparkles size={14} className="sparkle-icon" />
                <span>ABES MCA Portal</span>
              </div>
              <h2 className="auth-modal-title" style={{ fontSize: '1.45rem', fontWeight: 900 }}>
                How would you like to log in?
              </h2>
              <p className="auth-modal-subtitle">
                Select your portal role below to enter your ID & Password.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
              {/* Choice Card 1: Student */}
              <div 
                className="glass card-hover-effect"
                onClick={() => { setActiveTab('student'); setAuthStep('credentials'); }}
                style={{ padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Student Portal
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Sign in with Roll No / Email or 1-Tap Google
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--primary)' }} />
              </div>

              {/* Choice Card 2: Mentor */}
              <div 
                className="glass card-hover-effect"
                onClick={() => { setActiveTab('mentor'); setAuthStep('credentials'); }}
                style={{ padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--secondary-glow)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Faculty Mentor Portal
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Official mentee attendance marking & locking
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--secondary)' }} />
              </div>

              {/* Choice Card 3: Program Leader (PL) */}
              <div 
                className="glass card-hover-effect"
                onClick={() => { setActiveTab('pl'); setAuthStep('credentials'); }}
                style={{ padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Program Leader (PL) Portal
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Department oversight & master attendance correction
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--warning)' }} />
              </div>

              {/* Choice Card 4: Admin */}
              <div 
                className="glass card-hover-effect"
                onClick={() => { setActiveTab('admin'); setAuthStep('credentials'); }}
                style={{ padding: '16px 18px', borderRadius: '16px', border: '1.5px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Master Admin Access
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Unlock master timetable & system management
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--danger)' }} />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Credentials ID & Password Page */
          <div className="auth-credentials-step animate-fade-in">
            {/* Top Back to Choice Button */}
            <button 
              type="button"
              className="onboarding-back-btn"
              onClick={() => setAuthStep('choice')}
              style={{ marginBottom: '14px' }}
            >
              <span>← Change Login Method</span>
            </button>

            <div className="auth-modal-header">
              <h2 className="auth-modal-title">
                {activeTab === 'admin' ? 'Master Admin Unlock' : (activeTab === 'mentor' ? 'Faculty Mentor Login' : (activeTab === 'pl' ? 'Program Leader Login' : (isRegistering ? 'Create Student Account' : 'Student Login')))}
              </h2>
              <p className="auth-modal-subtitle">
                Enter your credentials to access your {activeTab} portal.
              </p>
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

          {activeTab === 'student' && (
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                <span style={{ padding: '0 10px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
              </div>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </form>

        {/* Toggle Sign In / Register (Students only) */}
        <div className="auth-footer-actions">
          {activeTab === 'student' && (
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
    )}
  </>
)}

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
    </div>
  );
}
