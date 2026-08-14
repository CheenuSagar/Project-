import React, { useState, useEffect } from 'react';
import { 
  Bell, ArrowRight, Sparkles, GraduationCap, ShieldCheck, 
  CalendarDays, BookOpen, ChevronLeft, User, UserCheck, Shield 
} from 'lucide-react';
import AuthModal from './AuthModal';
import LogoSplash from './LogoSplash';

export default function LandingOnboarding({ onAuthSuccess, initialTab = 'student' }) {
  const [stage, setStage] = useState('splash'); // 'splash' | 'onboarding' | 'auth'

  useEffect(() => {
    // 1.2 second Splash screen auto-advance to Auth Login Choice stage
    const timer = setTimeout(() => {
      setStage('auth');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (stage === 'splash') {
    return <LogoSplash />;
  }

  return (
    <div className="fullscreen-auth-screen">
      <div className="ambient-glow orb-1"></div>
      <div className="ambient-glow orb-2"></div>

      {/* Responsive Split-Screen Web Landing Container (Voltrex Style for Desktop) */}
      <div className="web-split-landing-container animate-fade-in">
        {/* Left Visual Hero Panel (Desktop Web View) */}
        <div className="web-hero-left-panel">
          <div className="hero-brand-top">
            <div className="brand-badge-pill">
              <Sparkles size={16} /> ABES Academix MCA
            </div>
          </div>

          <div className="hero-image-overlay"></div>

          <div className="hero-content-bottom">
            <h1 className="hero-web-title">
              Smart Academix & Attendance Portal
            </h1>
            <p className="hero-web-subtitle">
              Live Section Schedules, Faculty Duties, Mentor Attendance Lock & Integrated Syllabus Tracker for ABES Engineering College.
            </p>
            
            <div className="hero-feature-tags">
              <span className="hero-tag">⚡ Live Timetable</span>
              <span className="hero-tag">📊 Official Attendance</span>
              <span className="hero-tag">🎓 Syllabus Portal</span>
            </div>
          </div>
        </div>

        {/* Right Auth Form Panel */}
        <div className="web-auth-right-panel">
          <div className="web-auth-form-wrapper">
            {stage === 'onboarding' ? (
              <div className="onboarding-web-card animate-scale-in">
                <div className="onboarding-body text-center" style={{ padding: '40px 24px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 12px 30px rgba(79, 70, 229, 0.35)' }}>
                    <GraduationCap size={40} />
                  </div>

                  <h2 className="onboarding-title" style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0' }}>
                    Welcome to ABES MCA Portal
                  </h2>
                  <p className="onboarding-desc" style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 28px 0' }}>
                    Connect to live section schedules, mentor attendance tracking, and official academic notices for MCA 3rd Semester.
                  </p>

                  <button 
                    className="btn btn-primary onboarding-btn"
                    onClick={() => setStage('auth')}
                    style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 800, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                  >
                    <span>Get Started / Choose Login Portal</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <AuthModal 
                isOpen={true}
                onClose={() => {}}
                userProfile={null}
                onAuthSuccess={onAuthSuccess}
                allowClose={false}
                initialTab={initialTab}
                isEmbedded={true}
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Responsive Split-Screen Web Desktop Styles */
        .web-split-landing-container {
          width: 100%;
          max-width: 1100px;
          min-height: 640px;
          background: #ffffff;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(79, 70, 229, 0.18);
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #e2e8f0;
          position: relative;
          z-index: 10;
        }

        .web-hero-left-panel {
          position: relative;
          background: url('/hero_banner.jpg') center center / cover no-repeat;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #ffffff;
          overflow: hidden;
        }

        .hero-image-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%);
          z-index: 1;
        }

        .hero-brand-top, .hero-content-bottom {
          position: relative;
          z-index: 2;
        }

        .brand-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(12px);
          padding: 8px 18px;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .hero-web-title {
          font-size: 2.1rem;
          font-weight: 900;
          line-height: 1.25;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .hero-web-subtitle {
          font-size: 0.95rem;
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0 0 24px 0;
          opacity: 0.95;
        }

        .hero-feature-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hero-tag {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .web-auth-right-panel {
          position: relative;
          background: #ffffff;
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .web-auth-form-wrapper {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .onboarding-back-floating-btn {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 20;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .onboarding-back-floating-btn:hover {
          background: #e2e8f0;
          transform: translateX(-3px);
        }

        /* Responsive Mobile Layout (< 900px) */
        @media (max-width: 900px) {
          .web-split-landing-container {
            grid-template-columns: 1fr;
            max-width: 440px;
            min-height: auto;
            border-radius: 28px;
          }
          .web-hero-left-panel {
            display: flex;
            min-height: 200px;
            padding: 24px 20px;
            border-radius: 28px 28px 0 0;
          }
          .hero-web-title {
            font-size: 1.35rem;
            margin-bottom: 6px;
          }
          .hero-web-subtitle {
            font-size: 0.82rem;
            margin-bottom: 12px;
            line-height: 1.45;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .hero-feature-tags {
            gap: 6px;
          }
          .hero-tag {
            font-size: 0.72rem;
            padding: 4px 10px;
          }
          .web-auth-right-panel {
            padding: 24px 20px;
            border-radius: 0 0 28px 28px;
          }
        }
      `}</style>
    </div>
  );
}
