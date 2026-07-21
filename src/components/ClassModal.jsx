import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#06b6d4' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Blue', value: '#3b82f6' }
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function ClassModal({ isOpen, onClose, onSave, onDelete, editingClass }) {
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingClass) {
      setName(editingClass.name || '');
      setTeacher(editingClass.teacher || '');
      setLocation(editingClass.location || '');
      setDay(editingClass.day || 'Monday');
      setStartTime(editingClass.startTime || '09:00');
      setEndTime(editingClass.endTime || '10:00');
      setColor(editingClass.color || '#6366f1');
      setError('');
    } else {
      setName('');
      setTeacher('');
      setLocation('');
      setDay('Monday');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#6366f1');
      setError('');
    }
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Class name is required.');
      return;
    }

    // Time validation
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;

    if (endVal <= startVal) {
      setError('End time must be after start time.');
      return;
    }

    const payload = {
      id: editingClass ? editingClass.id : Date.now().toString(),
      name: name.trim(),
      teacher: teacher.trim(),
      location: location.trim(),
      day,
      startTime,
      endTime,
      color
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-fade-in">
        <div className="modal-header">
          <h2>{editingClass ? 'Edit Lecture' : 'Add New Lecture'}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Subject / Class Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems, Advanced Math"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Instructor / Professor</label>
              <input
                type="text"
                className="form-input"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar"
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Room / Online Link</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 402, meet.google.com/abc"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Day of the Week</label>
            <select
              className="form-input select-input"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div className="color-picker-grid">
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col.value}
                  className={`color-btn ${color === col.value ? 'active' : ''}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => setColor(col.value)}
                  title={col.name}
                  aria-label={`Select ${col.name} color`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {editingClass && (
              <button
                type="button"
                className="btn btn-danger mr-auto"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this lecture?')) {
                    onDelete(editingClass.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Lecture
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        .modal-content {
          width: 100%;
          max-width: 520px;
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
        }
        .modal-header h2 {
          font-size: 1.4rem;
          color: var(--text-primary);
        }
        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
        }
        .btn-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .modal-form {
          display: flex;
          flex-direction: column;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .flex-1 {
          flex: 1;
        }
        .select-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .select-input option {
          background-color: var(--bg-surface);
          color: var(--text-primary);
        }
        .color-picker-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding: 6px 0;
        }
        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .color-btn:hover {
          transform: scale(1.15);
        }
        .color-btn.active {
          border-color: white;
          transform: scale(1.1);
          box-shadow: 0 0 12px currentColor;
        }
        .form-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid var(--danger);
          color: #f87171;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          margin-bottom: 16px;
          text-align: center;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--border-light);
          padding-top: 18px;
        }
        .mr-auto {
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
