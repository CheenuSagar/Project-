import React from 'react';
import { Download, Sparkles, X, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
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
      <div className="modal-content glass animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'var(--primary-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                New App Update Available 🚀
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
                Version {serverData.versionName} • Build #{serverData.versionCode}
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={handleDismiss} title="Dismiss Update">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '16px', padding: '20px' }}>
          {/* Version Pill Banner */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CURRENT VERSION</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>v{CURRENT_APP_VERSION.versionName}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', display: 'block', fontWeight: 700 }}>NEW VERSION</span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>v{serverData.versionName}</span>
            </div>
          </div>

          {/* Release Age Banner */}
          {hoursSinceRelease !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)', padding: '8px 12px', borderRadius: '8px'
            }}>
              <Clock size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>
                Released <strong>{hoursSinceRelease >= 48 ? `${Math.floor(hoursSinceRelease / 24)} days ago` : `${hoursSinceRelease} hours ago`}</strong> (48h deferred notification trigger)
              </span>
            </div>
          )}

          {/* Changelog */}
          {serverData.changelog && serverData.changelog.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                What's New in this Version:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {serverData.changelog.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
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
            <Download size={16} /> Update Now (APK)
          </button>
        </div>
      </div>
    </div>
  );
}
