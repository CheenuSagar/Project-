import React, { useState } from 'react';
import { 
  Bell, Volume2, VolumeX, Download, Share2, Trash2, 
  Upload, FileText, Check, AlertTriangle, ShieldCheck, Shield, Lock, Unlock, Clock,
  Palette, Coffee, Layers, Zap, Sun, Moon, Sparkles, Flame, Crown, Terminal, LayoutGrid, List
} from 'lucide-react';
import { generateShareUrl, exportBackup } from '../utils/storageHelper';
import { downloadICSFile } from '../utils/icsHelper';

// Synthesizes a beautiful digital double-chime note using Web Audio API
export function playSyntheticChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First chime note (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);
    
    // Second chime note (A5, slightly offset and higher pitch)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
}

export const ALL_THEMES = [
  { id: 'default', category: 'light', label: 'Light White', icon: Sun, iconColor: '#4f46e5', desc: 'Clean & bright modern white design', dots: ['#ffffff', '#f8fafc', '#4f46e5'] },
  { id: 'dark', category: 'dark', label: 'Midnight Dark', icon: Moon, iconColor: '#818cf8', desc: 'Sleek midnight dark background', dots: ['#0b0f19', '#111827', '#6366f1'] },
  { id: 'vokka', category: 'neon', label: 'Vokka Neon', icon: Zap, iconColor: '#a855f7', desc: 'Cyberpunk violet neon & cyan', dots: ['#090614', '#120b29', '#a855f7'] },
  { id: 'coffee', category: 'dark', label: 'Warm Coffee', icon: Coffee, iconColor: '#d97706', desc: 'Espresso brown & caramel gold', dots: ['#140e0b', '#221612', '#d97706'] },
  { id: 'emerald', category: 'dark', label: 'Emerald Forest', icon: Sparkles, iconColor: '#10b981', desc: 'Deep emerald green & teal', dots: ['#061913', '#0b2920', '#10b981'] },
  { id: 'ocean', category: 'dark', label: 'Sapphire Ocean', icon: Layers, iconColor: '#0284c7', desc: 'Deep navy blue & sky blue', dots: ['#031329', '#0a2540', '#0284c7'] },
  { id: 'rose', category: 'neon', label: 'Rose Sunset', icon: Flame, iconColor: '#f43f5e', desc: 'Crimson rose & sunset amber', dots: ['#1a080f', '#290f19', '#f43f5e'] },
  { id: 'cyber', category: 'neon', label: 'Cyber Lime', icon: Zap, iconColor: '#84cc16', desc: 'Electric lime green & slate', dots: ['#0b1309', '#12210e', '#84cc16'] },
  { id: 'pastel', category: 'light', label: 'Cotton Candy', icon: Sun, iconColor: '#d946ef', desc: 'Soft pastel pink & lavender', dots: ['#fbf5ff', '#ffffff', '#d946ef'] },
  { id: 'gold', category: 'dark', label: 'Royal Gold', icon: Crown, iconColor: '#eab308', desc: 'Obsidian dark & luxury gold', dots: ['#12100b', '#1e1a12', '#eab308'] },
  { id: 'amethyst', category: 'neon', label: 'Amethyst Dream', icon: Sparkles, iconColor: '#c084fc', desc: 'Royal purple & magenta neon', dots: ['#0d0814', '#1a1029', '#c084fc'] },
  { id: 'sunset', category: 'neon', label: 'Tangerine Sunset', icon: Flame, iconColor: '#f97316', desc: 'Vibrant orange & fiery crimson', dots: ['#180b06', '#27130a', '#f97316'] },
  { id: 'matrix', category: 'neon', label: 'Matrix Code', icon: Terminal, iconColor: '#22c55e', desc: 'Hacker green & terminal dark', dots: ['#030a05', '#07170c', '#22c55e'] },
  { id: 'nordic', category: 'dark', label: 'Nordic Frost', icon: Layers, iconColor: '#38bdf8', desc: 'Glacier cyan & frosty navy', dots: ['#0b131e', '#142232', '#38bdf8'] },
  { id: 'crimson', category: 'dark', label: 'Crimson Ruby', icon: Flame, iconColor: '#ef4444', desc: 'Obsidian dark & ruby red', dots: ['#140507', '#240a0e', '#ef4444'] },
  { id: 'lavender', category: 'light', label: 'Lavender Mist', icon: Palette, iconColor: '#8b5cf6', desc: 'Lilac pastel & soft purple', dots: ['#f6f4fe', '#ffffff', '#8b5cf6'] },
  { id: 'mint', category: 'dark', label: 'Dark Mint', icon: Sparkles, iconColor: '#14b8a6', desc: 'Cool mint green & slate', dots: ['#081615', '#0f2927', '#14b8a6'] },
  { id: 'amber', category: 'dark', label: 'Warm Amber', icon: Sun, iconColor: '#f59e0b', desc: 'Charcoal dark & glowing amber', dots: ['#14100a', '#241c12', '#f59e0b'] },
  { id: 'tokyo', category: 'neon', label: 'Tokyo Synth', icon: Zap, iconColor: '#ec4899', desc: 'Electric violet, pink & cyan', dots: ['#0d0714', '#180d28', '#ec4899'] },
  { id: 'monochrome', category: 'dark', label: 'Slate Silver', icon: Layers, iconColor: '#94a3b8', desc: 'Minimalist monochrome silver', dots: ['#0f172a', '#1e293b', '#94a3b8'] },
];

export default function SettingsPanel({ 
  timetable, 
  settings, 
  onSaveSettings, 
  onImportBackup, 
  onClearAll,
  onLoadPreset,
  selectedSection,
  isAdmin,
  onToggleAdmin,
  currentTheme = 'default',
  onThemeChange
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [themeViewMode, setThemeViewMode] = useState('grid');

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      onSaveSettings({
        ...settings,
        notificationsEnabled: permission === 'granted'
      });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleCopyLink = () => {
    const url = generateShareUrl(timetable);
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      })
      .catch((err) => console.error('Failed to copy share link:', err));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          if (confirm(`Do you want to import ${data.length} lectures? This will merge with your current timetable.`)) {
            onImportBackup(data);
            e.target.value = '';
          }
        } else {
          alert('Invalid backup file format. Expected a timetable JSON array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSoundToggle = () => {
    onSaveSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled
    });
  };

  const handlePreTimeChange = (e) => {
    onSaveSettings({
      ...settings,
      preTime: Number(e.target.value)
    });
  };

  const handleTimeFormatToggle = () => {
    onSaveSettings({
      ...settings,
      timeFormat12h: !(settings.timeFormat12h !== false)
    });
  };

  const filteredThemes = ALL_THEMES.filter(t => {
    if (themeFilter === 'all') return true;
    return t.category === themeFilter;
  });

  return (
    <div className="settings-grid animate-fade-in">
      {/* 20 Theme Collection Card - Space Optimized Container */}
      <div className="settings-card glass" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="settings-title" style={{ margin: 0 }}>
            <Palette size={18} className="title-icon" style={{ color: 'var(--primary)' }} /> Color Themes Collection 
            <span className="badge badge-success" style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '3px 10px' }}>20 Styles</span>
          </h3>
        </div>
        
        <div className="settings-body" style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Choose from 20 handcrafted themes. Scroll inside the box below or switch view mode to save vertical screen space!
          </p>

          {/* Filter Pills and View Mode Toggle */}
          <div className="theme-section-controls">
            <div className="theme-filter-pills">
              <button 
                className={`theme-filter-pill ${themeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setThemeFilter('all')}
              >
                All ({ALL_THEMES.length})
              </button>
              <button 
                className={`theme-filter-pill ${themeFilter === 'dark' ? 'active' : ''}`}
                onClick={() => setThemeFilter('dark')}
              >
                Dark ({ALL_THEMES.filter(t => t.category === 'dark').length})
              </button>
              <button 
                className={`theme-filter-pill ${themeFilter === 'neon' ? 'active' : ''}`}
                onClick={() => setThemeFilter('neon')}
              >
                Neon / Cyber ({ALL_THEMES.filter(t => t.category === 'neon').length})
              </button>
              <button 
                className={`theme-filter-pill ${themeFilter === 'light' ? 'active' : ''}`}
                onClick={() => setThemeFilter('light')}
              >
                Light ({ALL_THEMES.filter(t => t.category === 'light').length})
              </button>
            </div>

            <div className="theme-view-toggle">
              <button 
                className={`theme-toggle-btn ${themeViewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setThemeViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button 
                className={`theme-toggle-btn ${themeViewMode === 'compact' ? 'active' : ''}`}
                onClick={() => setThemeViewMode('compact')}
                title="Compact Chips View"
              >
                <List size={14} /> Chips (Compact)
              </button>
            </div>
          </div>

          {/* Scrollable Container keeping vertical height compact */}
          <div className="theme-selector-scroll-container">
            {themeViewMode === 'grid' ? (
              <div className="theme-selector-grid">
                {filteredThemes.map((t) => {
                  const IconComp = t.icon;
                  const isActive = currentTheme === t.id || (t.id === 'default' && currentTheme === 'light');
                  return (
                    <div 
                      key={t.id}
                      className={`theme-card ${isActive ? 'active' : ''}`}
                      onClick={() => onThemeChange && onThemeChange(t.id)}
                    >
                      <div className="theme-card-header">
                        <IconComp size={18} style={{ color: t.iconColor }} />
                        <span className="theme-card-name">{t.label}</span>
                        {isActive && <Check size={16} className="theme-check" />}
                      </div>
                      <p className="theme-card-desc">{t.desc}</p>
                      <div className="theme-preview-dots">
                        {t.dots.map((d, i) => (
                          <span key={i} className="theme-dot" style={{ background: d, border: d === '#ffffff' ? '1px solid #cbd5e1' : 'none' }}></span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="theme-chips-flex">
                {filteredThemes.map((t) => {
                  const IconComp = t.icon;
                  const isActive = currentTheme === t.id || (t.id === 'default' && currentTheme === 'light');
                  return (
                    <div 
                      key={t.id}
                      className={`theme-chip-card ${isActive ? 'active' : ''}`}
                      onClick={() => onThemeChange && onThemeChange(t.id)}
                    >
                      <IconComp size={16} style={{ color: t.iconColor }} />
                      <span>{t.label}</span>
                      <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                        {t.dots.map((d, i) => (
                          <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: d, border: d === '#ffffff' ? '1px solid #94a3b8' : 'none' }}></span>
                        ))}
                      </div>
                      {isActive && <Check size={14} style={{ color: 'var(--primary)', marginLeft: '4px' }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Authorization Card */}
      <div className="settings-card glass" style={{ border: isAdmin ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-light)' }}>
        <h3 className="settings-title">
          <Shield size={18} className="title-icon" style={{ color: isAdmin ? 'var(--success)' : 'var(--primary)' }} /> Admin Authorization
        </h3>
        
        <div className="settings-body">
          <div className="setting-row">
            <div className="setting-info">
              <h4>Authorization Status</h4>
              <p>
                {isAdmin 
                  ? 'Admin Mode is Active. You have full permission to add, edit, or delete lectures and load presets.' 
                  : 'Regular View Mode. Modification features are locked. Enter passcode to manage the schedule.'}
              </p>
            </div>
            
            {isAdmin ? (
              <div className="setting-actions flex-gap">
                <span className="badge badge-success" style={{ marginRight: '8px' }}>
                  <Unlock size={12} /> Admin Mode Active
                </span>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    onToggleAdmin(false);
                    setAdminPasswordInput('');
                    setAdminError('');
                  }}
                >
                  <Lock size={14} /> Lock Admin
                </button>
              </div>
            ) : (
              <div className="setting-actions flex-gap" style={{ alignItems: 'stretch', flexDirection: 'column', width: '100%', maxWidth: '320px', minWidth: '260px' }}>
                {adminError && <div className="form-error" style={{ width: '100%', margin: '0 0 8px 0', padding: '6px', fontSize: '0.8rem', color: '#f87171' }}>{adminError}</div>}
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter admin passcode..."
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const success = await onToggleAdmin(true, adminPasswordInput);
                        if (success) {
                          setAdminError('');
                        } else {
                          setAdminError('Incorrect passcode!');
                        }
                      }
                    }}
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      const success = await onToggleAdmin(true, adminPasswordInput);
                      if (success) {
                        setAdminError('');
                      } else {
                        setAdminError('Incorrect passcode!');
                      }
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                  >
                    Unlock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="settings-card glass">
        <h3 className="settings-title">
          <Bell size={18} className="title-icon" /> Notification Settings
        </h3>
        
        <div className="settings-body">
          {/* Native Browser Notification Request */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Browser Push Notifications</h4>
              <p>Triggers a desktop alert when the app is active in your browser.</p>
            </div>
            
            {notificationStatus === 'unsupported' ? (
              <span className="badge badge-unsupported">Not Supported</span>
            ) : notificationStatus === 'granted' ? (
              <span className="badge badge-success">
                <ShieldCheck size={14} /> Active
              </span>
            ) : (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleRequestPermission}
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* Sound Alarm Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Chime Sound Alerts</h4>
              <p>Plays a clean, synthesizer chime before class starts.</p>
            </div>
            <div className="setting-actions">
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={playSyntheticChime}
                style={{ marginRight: '8px' }}
              >
                Test Chime
              </button>
              <button 
                className={`btn btn-sm ${settings.soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleSoundToggle}
              >
                {settings.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Pre-alert Duration setting */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Alert Trigger Time</h4>
              <p>How many minutes before the lecture start time should alerts sound?</p>
            </div>
            <select 
              className="form-select select-duration" 
              value={settings.preTime}
              onChange={handlePreTimeChange}
            >
              <option value={2}>2 minutes before</option>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
              <option value={15}>15 minutes before</option>
            </select>
          </div>

          {/* Time Format setting */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>12-Hour Time Format</h4>
              <p>Display all class schedules in 12-hour AM/PM format.</p>
            </div>
            <div className="setting-actions">
              <button 
                className={`btn btn-sm ${settings.timeFormat12h !== false ? 'btn-primary' : 'btn-secondary'}`}
                onClick={handleTimeFormatToggle}
              >
                <Clock size={14} />
                {settings.timeFormat12h !== false ? '12-Hour (AM/PM)' : '24-Hour'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync and Share (Public Use) Card */}
      <div className="settings-card glass">
        <h3 className="settings-title">
          <Share2 size={18} className="title-icon" /> Calendar Sync & Sharing
        </h3>
        
        <div className="settings-body">
          {/* ICS Download */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>1-Click Calendar Export (.ics)</h4>
              <p>
                <strong>Recommended for Mobile (iOS & Android)</strong>. Export iCalendar file with 
                weekly recurring lectures for Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => downloadICSFile(timetable)}
              disabled={timetable.length === 0}
            >
              <Download size={15} /> Export Calendar (.ics)
            </button>
          </div>

          {/* Share Link Generator */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Shareable Schedule Link</h4>
              <p>
                Generates a encoded URL of your timetable so classmates can import your schedule in 1-click.
              </p>
            </div>
            <button 
              className={`btn btn-sm ${copySuccess ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleCopyLink}
              disabled={timetable.length === 0}
            >
              {copySuccess ? <Check size={15} /> : <Share2 size={15} />}
              {copySuccess ? 'Copied Link!' : 'Copy Share Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Backups & Maintenance */}
      <div className="settings-card glass">
        <h3 className="settings-title">
          <FileText size={18} className="title-icon" /> Data Backups & Presets
        </h3>
        
        <div className="settings-body">
          {/* Export JSON and Import JSON */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Timetable Backups</h4>
              <p>Export your scheduled classes as a JSON file, or restore from a previous JSON backup.</p>
            </div>
            <div className="setting-actions flex-gap">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => exportBackup(timetable)}
                disabled={timetable.length === 0}
              >
                <Download size={14} /> Export JSON
              </button>
              
              <label className="btn btn-secondary btn-sm file-input-label">
                <Upload size={14} /> Import JSON
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden-file-input" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
          </div>

          {/* Load Preset Schedule */}
          <div className="setting-row">
            <div className="setting-info">
              <h4>Load Department Presets</h4>
              <p>Reset your schedule to official MCA III section timetable presets.</p>
            </div>
            <div className="setting-actions flex-gap">
              <button 
                className={`btn ${selectedSection === 'A' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  if (confirm('Load MCA III-A timetable preset? This will replace your current schedule.')) {
                    onLoadPreset('A');
                  }
                }}
              >
                Section III-A
              </button>
              <button 
                className={`btn ${selectedSection === 'B' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  if (confirm('Load MCA III-B timetable preset? This will replace your current schedule.')) {
                    onLoadPreset('B');
                  }
                }}
              >
                Section III-B
              </button>
              <button 
                className={`btn ${selectedSection === 'C' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  if (confirm('Load MCA III-C timetable preset? This will replace your current schedule.')) {
                    onLoadPreset('C');
                  }
                }}
              >
                Section III-C
              </button>
            </div>
          </div>

          {/* Clear Timetable */}
          <div className="setting-row border-danger-top">
            <div className="setting-info">
              <h4 className="text-danger-title">Danger Zone: Reset All</h4>
              <p>Remove all lectures and clear local storage. Irreversible action.</p>
            </div>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => {
                if (confirm('Are you sure you want to clear all scheduled lectures?')) {
                  onClearAll();
                }
              }}
              disabled={timetable.length === 0}
            >
              <Trash2 size={14} /> Clear All Classes
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .settings-card {
          padding: 26px;
        }
        .settings-title {
          font-size: 1.15rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title-icon {
          color: var(--primary);
        }
        .settings-body {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .setting-info {
          flex: 1;
          min-width: 260px;
        }
        .setting-info h4 {
          font-size: 1.02rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .setting-info p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
        .setting-actions {
          display: flex;
          align-items: center;
        }
        .flex-gap {
          gap: 10px;
        }
        .badge-unsupported {
          background: rgba(239, 68, 68, 0.12);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .badge-success {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .select-duration {
          width: auto;
          min-width: 170px;
        }
        .hidden-file-input {
          display: none;
        }
        .file-input-label {
          margin-bottom: 0;
        }
        .border-danger-top {
          border-top: 1px dashed rgba(239, 68, 68, 0.25);
          padding-top: 20px;
          margin-top: 10px;
        }
        .text-danger-title {
          color: #f87171 !important;
        }
      `}</style>
    </div>
  );
}
