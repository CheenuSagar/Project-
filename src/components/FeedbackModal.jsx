import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle, Loader2, User, Mail, Tag, Star, AlertTriangle, Layers } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, userProfile, selectedSection = 'A' }) {
  const [senderName, setSenderName] = useState(userProfile?.displayName || '');
  const [senderRole, setSenderRole] = useState(userProfile?.role === 'teacher' ? 'Faculty' : 'Student');
  const [category, setCategory] = useState('Bug Report');
  const [urgency, setUrgency] = useState('Medium');
  const [rating, setRating] = useState(5);
  const [sectionContext, setSectionContext] = useState(selectedSection || 'A');
  const [message, setMessage] = useState('');
  const [replyEmail, setReplyEmail] = useState(userProfile?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' }); // 'success' | 'error'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatus({ type: 'error', text: 'Please enter details in the message field.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('https://formsubmit.co/ajax/cheenusagar4@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[LecAlert Support] ${category} (${urgency} Priority) - Rating: ${rating}★ from ${senderName || 'Student'}`,
          _template: 'table',
          _captcha: 'false',
          'User Name': senderName.trim() || 'Anonymous',
          'User Role': senderRole,
          'User Rating': `${rating} / 5 Stars ⭐`,
          'Feedback Category': category,
          'Urgency Level': urgency,
          'Section Context': `Section ${sectionContext}`,
          'Message Details': message.trim(),
          'Reply Email': replyEmail.trim() || 'Not provided',
          'Submitted At': new Date().toLocaleString()
        })
      });

      if (response.ok) {
        setStatus({ 
          type: 'success', 
          text: 'Thank you! Your feedback & report has been sent directly to Cheenu Sagar (Support Lead).' 
        });
        setMessage('');
      } else {
        throw new Error('Failed to dispatch feedback.');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      setStatus({ 
        type: 'error', 
        text: 'Could not send feedback. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setStatus({ type: '', text: '' });
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 2000 }} onClick={handleModalClose}>
      <div 
        className="modal-content glass feedback-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', width: '92%', borderRadius: '24px', padding: '24px' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Feedback & Technical Support 💬
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Report an issue, request a new feature, or rate your MCA Portal experience!
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleModalClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {status.type === 'success' ? (
            <div className="feedback-success-card animate-scale-up" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.14)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Feedback Submitted Successfully! 🎉
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '22px', lineHeight: 1.5 }}>
                {status.text}
              </p>
              <button className="btn btn-primary" onClick={handleModalClose} style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800 }}>
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Star Rating Section */}
              <div style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Rate Your App Experience:
                  </span>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {rating === 5 ? '🤩 Outstanding' : (rating === 4 ? '😃 Very Good' : (rating === 3 ? '🙂 Good' : '😐 Needs Improvement'))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= rating ? '#f59e0b' : 'var(--border-light)',
                        padding: '2px',
                        fontSize: '1.4rem',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${star} Star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Name & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <User size={14} /> Your Name:
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={{ borderRadius: '12px', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>I am a:</label>
                  <select 
                    className="form-select"
                    value={senderRole}
                    onChange={(e) => setSenderRole(e.target.value)}
                    style={{ borderRadius: '12px', fontSize: '0.88rem' }}
                  >
                    <option value="Student">Student (MCA 3rd Sem)</option>
                    <option value="Faculty">Faculty / Teacher</option>
                    <option value="Mentor">Class Mentor</option>
                    <option value="PL">Program Leader (PL)</option>
                    <option value="Other">Other / Guest</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Expanded Category Selector Chips */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Tag size={14} /> Select Feedback Type:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'Bug Report', label: '🐛 Bug Report' },
                    { id: 'Timetable Issue', label: '📅 Timetable Issue' },
                    { id: 'Attendance Issue', label: '📊 Attendance Issue' },
                    { id: 'Notification Alert', label: '🔔 Notification Alert' },
                    { id: 'Feature Request', label: '💡 Feature Request' },
                    { id: 'UI Suggestion', label: '🎨 UI & Theme Idea' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`preset-chip ${category === cat.id ? 'active' : ''}`}
                      onClick={() => setCategory(cat.id)}
                      style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Priority & Section Context */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <AlertTriangle size={14} /> Urgency Level:
                  </label>
                  <select 
                    className="form-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    style={{ borderRadius: '12px', fontSize: '0.88rem' }}
                  >
                    <option value="Low">🟢 Low (General Suggestion)</option>
                    <option value="Medium">🟡 Medium (Minor Glitch)</option>
                    <option value="High">🔴 High / Critical (App Not Working)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    <Layers size={14} /> Section Context:
                  </label>
                  <select 
                    className="form-select"
                    value={sectionContext}
                    onChange={(e) => setSectionContext(e.target.value)}
                    style={{ borderRadius: '12px', fontSize: '0.88rem' }}
                  >
                    <option value="A">Section III-A (AB-207)</option>
                    <option value="B">Section III-B (AB-208)</option>
                    <option value="C">Section III-C (AB-209)</option>
                    <option value="General">All Sections / General</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Message Textarea */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Detailed Description / Feedback Message <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea 
                  className="form-input"
                  rows={3}
                  placeholder="Tell us what's working well or describe the issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ borderRadius: '12px', fontSize: '0.9rem', padding: '12px' }}
                  required
                />
              </div>

              {/* Row 5: Reply Email */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Mail size={14} /> Your Reply Email:
                </label>
                <input 
                  type="email"
                  className="form-input"
                  placeholder="your.email@abes.ac.in"
                  value={replyEmail}
                  onChange={(e) => setReplyEmail(e.target.value)}
                  style={{ borderRadius: '12px', fontSize: '0.88rem' }}
                />
              </div>

              {/* Error Alert */}
              {status.type === 'error' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> {status.text}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={handleModalClose} disabled={isSubmitting} style={{ borderRadius: '12px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 800 }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Submit Feedback 🚀
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
