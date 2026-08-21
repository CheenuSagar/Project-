import React from 'react';
import { Download, Sparkles, X, Clock, PlusCircle, Trash2, Wrench, CheckCircle2 } from 'lucide-react';
import { CURRENT_APP_VERSION, dismissUpdate } from '../utils/updateService';

export default function UpdateModal({ isOpen, onClose, updateData }) {
  if (!isOpen || !updateData || !updateData.serverData) return null;

  const { serverData, hoursSinceRelease } = updateData;

  const handleDownloadUpdate = () => {
    if (serverData.apkUrl) {
      window.open(serverData.apkUrl, '_system');
    }
  };

  const handleDismiss = () => {
    dismissUpdate(serverData.versionCode);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(168, 85, 247, 0.14))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'var(--primary-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                App Update Available 🚀
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                Version {serverData.versionName} • Build #{serverData.versionCode}
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={handleDismiss} title="Dismiss Update">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '18px', padding: '22px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Version Pill Comparison */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-surface)', padding: '12px 18px', borderRadius: '14px',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>INSTALLED VERSION</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>v{CURRENT_APP_VERSION.versionName}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'block', fontWeight: 700 }}>LATEST VERSION</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>v{serverData.versionName}</span>
            </div>
          </div>

          {/* Release Age Banner */}
          {hoursSinceRelease !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)', padding: '8px 14px', borderRadius: '10px'
            }}>
              <Clock size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>
                Released <strong>{hoursSinceRelease >= 48 ? `${Math.floor(hoursSinceRelease / 24)} days ago` : `${hoursSinceRelease} hours ago`}</strong> (48h deferred notification trigger)
              </span>
            </div>
          )}

          {/* 1. Added / New Features Section */}
          {serverData.added && serverData.added.length > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={15} /> WHAT'S NEW & ADDED:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serverData.added.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. Removed Buttons & Features Section */}
          {serverData.removed && serverData.removed.length > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={15} /> REMOVED / CLEANED UP:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serverData.removed.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Fixed / Improved Section */}
          {serverData.fixed && serverData.fixed.length > 0 && (
            <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '14px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={15} /> FIXES & IMPROVEMENTS:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serverData.fixed.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback array changelog */}
          {serverData.changelog && serverData.changelog.length > 0 && !serverData.added && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                CHANGELOG DETAILS:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serverData.changelog.map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleDismiss} style={{ fontSize: '0.85rem' }}>
            Remind Me Later 🕒
          </button>
          <button className="btn btn-primary" onClick={handleDownloadUpdate} style={{ fontSize: '0.85rem' }}>
            <Download size={16} /> Download & Install APK ⬇️
          </button>
        </div>
      </div>
    </div>
  );
}
