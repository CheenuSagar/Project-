import React, { useState } from 'react';
import { Award, Hash, CheckCircle, Shield } from 'lucide-react';
import { saveUserRollNumber } from '../utils/firebase';

export default function RollNumberModal({ isOpen, userProfile, onRollSaved }) {
  const [rollNumber, setRollNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !userProfile) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rollNumber.trim()) {
      setErrorMsg('Please enter your official Roll Number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const success = await saveUserRollNumber(userProfile.uid, rollNumber.trim());
    setIsSubmitting(false);

    if (success) {
      onRollSaved(rollNumber.trim());
    } else {
      setErrorMsg('Failed to save Roll Number. Please try again.');
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container glass animate-fade-in" style={{ maxWidth: '420px', padding: '28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <Hash size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Complete Your Profile
          </h3>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Welcome, <strong>{userProfile.displayName}</strong>! Please enter your official ABES Roll Number for attendance tracking.
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Official College Roll Number
            </label>
            <div className="input-with-icon">
              <Hash size={18} className="input-icon" />
              <input 
                type="text"
                className="form-input auth-input"
                placeholder="e.g. 230032010053 or 25M01410053"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800, borderRadius: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Roll Number...' : 'Save & Continue 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
