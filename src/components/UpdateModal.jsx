import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const CURRENT_APP_VERSION = '1.0.0'; // Base build version
const REMOTE_VERSION_URL = 'https://raw.githubusercontent.com/CheenuSagar/Time-Table-/main/public/version.json';

export default function UpdateModal() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const res = await fetch(`${REMOTE_VERSION_URL}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.version && data.version !== CURRENT_APP_VERSION) {
            setUpdateInfo(data);
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.log('Update check skipped:', e);
      }
    }

    // Check on launch after 2 seconds
    const timer = setTimeout(checkForUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadApk = async (e) => {
    if (e) e.preventDefault();
    const targetUrl = updateInfo?.apkUrl || 'https://raw.githubusercontent.com/CheenuSagar/Time-Table-/main/Abes_Academix.apk';

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: targetUrl });
      } else {
        window.open(targetUrl, '_blank');
      }
    } catch (err) {
      console.error('Browser open error:', err);
      window.open(targetUrl, '_system');
    }
  };

  if (!isOpen || !updateInfo) return null;

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="modal-content glass text-center" style={{ maxWidth: '420px', padding: '28px' }}>
        <button 
          className="icon-btn close-modal-btn" 
          onClick={() => setIsOpen(false)}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
        }}>
          <Sparkles size={28} style={{ color: '#fff' }} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🚀 New Update Available (v{updateInfo.version})
        </h2>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {updateInfo.releaseNotes || 'A new update with latest timetable changes & bug fixes is available.'}
        </p>

        <div style={{
          background: 'var(--bg-card-hover)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '20px',
          textAlign: 'left',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            What's New in v{updateInfo.version}:
          </div>
          • Fixed notification alerts during college holidays (Aug 4 - Aug 12)<br/>
          • Updated Special Time Table for MCA III-A, B & C<br/>
          • Auto-sync & bug fixes
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setIsOpen(false)}
            style={{ flex: 1 }}
          >
            Later
          </button>
          <button 
            onClick={handleDownloadApk}
            className="btn btn-primary btn-sm"
            style={{ flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Download size={16} /> Download APK
          </button>
        </div>
      </div>
    </div>
  );
}
