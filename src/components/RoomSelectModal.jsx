import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Sparkles, Check, X, Layers, School } from 'lucide-react';

export default function RoomSelectModal({ isOpen, onClose, onSelectRoom, currentRoom = '', allowClose = true }) {
  // Pre-filled with AB-
  const [roomNumInput, setRoomNumInput] = useState(() => {
    if (currentRoom) {
      return currentRoom.replace(/^AB-?/i, '');
    }
    return '';
  });

  useEffect(() => {
    if (currentRoom) {
      setRoomNumInput(currentRoom.replace(/^AB-?/i, ''));
    }
  }, [currentRoom]);

  if (!isOpen) return null;

  const handleSelectPresetRoom = (fullRoom) => {
    const numOnly = fullRoom.replace(/^AB-?/i, '');
    setRoomNumInput(numOnly);
    const finalRoom = `AB-${numOnly}`;
    if (onClose) onClose();
    try {
      if (onSelectRoom) onSelectRoom(finalRoom);
    } catch (err) {
      console.error('onSelectRoom error:', err);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleaned = roomNumInput.replace(/[^0-9]/g, '').trim() || '207';
    const finalRoom = `AB-${cleaned}`;
    if (onClose) onClose();
    try {
      if (onSelectRoom) onSelectRoom(finalRoom);
    } catch (err) {
      console.error('onSelectRoom error:', err);
    }
  };

  return (
    <div className="room-modal-overlay">
      <div className="room-modal-container glass animate-fade-in text-center">
        {allowClose && (
          <button className="room-modal-close" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        )}

        <div className="room-icon-badge">
          <School size={30} />
        </div>

        <h2 className="room-modal-title">Which Classroom Are You In?</h2>
        <p className="room-modal-subtitle">
          Enter your current room number (e.g. <strong>207</strong>, <strong>208</strong>, <strong>209</strong>). Your timetable will automatically load for that classroom!
        </p>

        {/* Input Form with pre-filled AB- */}
        <form onSubmit={handleSubmit} className="room-input-box">
          <div className="prefilled-input-wrapper">
            <span className="prefix-tag">AB -</span>
            <input 
              type="text" 
              className="form-input room-field"
              placeholder="207"
              maxLength={4}
              value={roomNumInput}
              onChange={(e) => setRoomNumInput(e.target.value.replace(/[^0-9]/g, ''))}
              autoFocus
              required
            />
          </div>

          <button type="submit" className="btn btn-primary room-submit-btn">
            <span>Show Room Schedule</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Room Choice Chips */}
        <div className="quick-rooms-section">
          <span className="quick-rooms-label">QUICK SELECT MCA CLASSROOMS:</span>
          <div className="quick-room-chips">
            <button 
              className={`room-chip ${roomNumInput === '207' ? 'active' : ''}`}
              onClick={() => handleSelectPresetRoom('AB-207')}
            >
              <MapPin size={13} />
              <span>AB-207 (Section III-A)</span>
            </button>
            <button 
              className={`room-chip ${roomNumInput === '208' ? 'active' : ''}`}
              onClick={() => handleSelectPresetRoom('AB-208')}
            >
              <MapPin size={13} />
              <span>AB-208 (Section III-B)</span>
            </button>
            <button 
              className={`room-chip ${roomNumInput === '209' ? 'active' : ''}`}
              onClick={() => handleSelectPresetRoom('AB-209')}
            >
              <MapPin size={13} />
              <span>AB-209 (Section III-C)</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .room-modal-overlay {
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
          z-index: 10001;
          padding: 20px;
        }
        .room-modal-container {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          position: relative;
        }
        .room-modal-close {
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
        .room-icon-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px auto;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
        }
        .room-modal-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .room-modal-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 22px;
        }
        .room-input-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 22px;
        }
        .prefilled-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-card-hover);
          border: 2px solid var(--primary);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
        }
        .prefix-tag {
          padding: 12px 16px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary);
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          border-right: 1px solid var(--border-light);
        }
        .room-field {
          flex: 1;
          border: none !important;
          background: transparent !important;
          font-size: 1.25rem !important;
          font-weight: 800 !important;
          color: var(--text-primary) !important;
          padding: 12px 14px !important;
          box-shadow: none !important;
        }
        .room-submit-btn {
          width: 100%;
          padding: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
        }
        .quick-rooms-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-light);
          padding-top: 16px;
        }
        .quick-rooms-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }
        .quick-room-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .room-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--bg-card-hover);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .room-chip:hover, .room-chip.active {
          background: rgba(99, 102, 241, 0.12);
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
