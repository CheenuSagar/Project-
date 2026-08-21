import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, X, Check } from 'lucide-react';

export default function AdminPasswordModal({ isOpen, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter the Admin Password.');
      return;
    }

    try {
      const success = await onSubmit(password);
      if (!success) {
        setErrorMsg('Incorrect Password! Access denied.');
      } else {
        setPassword('');
        setErrorMsg('');
        setShowPassword(false);
        onClose();
      }
    } catch (err) {
      setErrorMsg('Verification error. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setPassword('');
    setErrorMsg('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div 
        className="modal-content glass animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '92%', padding: '28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px var(--primary-glow)'
            }}>
              <Shield size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Unlock Admin Mode
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Password Verification</span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
          Enter the Admin Password or Mastermind Password to perform administrative edits & schedule management.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Admin Passcode / Password:</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                style={{ paddingRight: '44px', letterSpacing: showPassword ? 'normal' : '2px', fontSize: '0.95rem' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '16px',
              border: '1px solid var(--danger-glow)'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
              <Lock size={16} /> Unlock Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
