import React, { useState, useEffect } from 'react';
import { 
  Bell, ArrowRight, Sparkles, GraduationCap, ShieldCheck, 
  CalendarDays, BookOpen, ChevronLeft, User, UserCheck, Shield 
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingOnboarding({ onAuthSuccess, initialTab = 'student' }) {
  const [stage, setStage] = useState('splash'); // 'splash' | 'onboarding' | 'auth'

  useEffect(() => {
    // 1.4 second Splash screen auto-advance to Onboarding
    const timer = setTimeout(() => {
      setStage('onboarding');
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (stage === 'splash') {
    return (
      <div className="splash-screen-wrapper">
        <div className="ambient-glow orb-1"></div>
        <div className="ambient-glow orb-2"></div>
        
        <div className="splash-card animate-scale-in">
          <div className="splash-logo-box">
            <Bell size={42} className="bell-glow-animation" />
          </div>
          <h1 className="splash-title">MCA TIME TABLE</h1>
          <p className="splash-subtitle">ABES ENGINEERING COLLEGE</p>
          <div className="splash-loader-bar">
            <div className="splash-loader-progress"></div>
          </div>
        </div>

        <style>{`
          .splash-screen-wrapper {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f1f5f9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
          }
          .splash-card {
            text-align: center;
            color: #0f172a;
          }
          .splash-logo-box {
            width: 84px;
            height: 84px;
            border-radius: 24px;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 15px 35px rgba(79, 70, 229, 0.35);
          }
          .bell-glow-animation {
            color: #fff;
            animation: ringBell 1.5s ease-in-out infinite;
          }
          @keyframes ringBell {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(15deg); }
            40% { transform: rotate(-15deg); }
            60% { transform: rotate(10deg); }
            80% { transform: rotate(-10deg); }
          }
          .splash-title {
            font-size: 1.8rem;
            font-weight: 900;
            letter-spacing: 0.08em;
            margin: 0;
            color: #0f172a;
          }
          .splash-subtitle {
            margin: 6px 0 24px 0;
            font-size: 0.82rem;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.15em;
          }
          .splash-loader-bar {
            width: 140px;
            height: 4px;
            background: rgba(79, 70, 229, 0.15);
            border-radius: 99px;
            margin: 0 auto;
            overflow: hidden;
          }
          .splash-loader-progress {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 99px;
            animation: fillProgress 1.4s ease-in-out forwards;
          }
          @keyframes fillProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0%); }
          }
        `}</style>
      </div>
    );
  }

  if (stage === 'auth') {
    return (
      <div className="fullscreen-auth-screen">
        <div className="ambient-glow orb-1"></div>
        <div className="ambient-glow orb-2"></div>
        
        <button 
          className="onboarding-back-floating-btn"
          onClick={() => setStage('onboarding')}
          title="Back to Welcome Page"
        >
          <ChevronLeft size={18} />
          <span>Back to Welcome</span>
        </button>

        <div className="auth-modal-wrapper animate-scale-in" style={{ width: '100%', maxWidth: '440px', padding: '20px', position: 'relative', zIndex: 10 }}>
          <AuthModal 
            isOpen={true}
            onClose={() => {}}
            userProfile={null}
            onAuthSuccess={onAuthSuccess}
            allowClose={false}
            initialTab={initialTab}
          />
        </div>

        <style>{`
          .onboarding-back-floating-btn {
            position: fixed;
            top: 24px;
            left: 24px;
            z-index: 1000000;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            color: #0f172a;
            padding: 8px 16px;
            border-radius: 99px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .onboarding-back-floating-btn:hover {
            background: #f1f5f9;
            transform: translateX(-3px);
            border-color: #94a3b8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fullscreen-auth-screen">
      <div className="ambient-glow orb-1"></div>
      <div className="ambient-glow orb-2"></div>

      <div className="onboarding-main-container animate-fade-in">
        <div className="onboarding-card animate-scale-in">
          {/* Top Visual Hero Banner */}
          <div className="onboarding-hero-banner">
            <div className="banner-badge">
              <Sparkles size={14} /> ABES Academix MCA
            </div>
            <div className="hero-floating-icon">
              <GraduationCap size={48} />
            </div>
            <div className="floating-pills">
              <span className="pill">⚡ Live Timetable</span>
              <span className="pill">📊 Official Attendance</span>
              <span className="pill">🎓 Syllabus Portal</span>
            </div>
          </div>

          {/* Content Text */}
          <div className="onboarding-body text-center">
            <h2 className="onboarding-title">Welcome to ABES MCA Portal</h2>
            <p className="onboarding-desc">
              Your official department hub for live section schedules, mentor attendance tracking, and academic notices.
            </p>

            {/* Action Buttons */}
            <div className="onboarding-actions">
              <button 
                className="btn btn-primary onboarding-btn"
                onClick={() => setStage('auth')}
              >
                <span>Get Started / Log In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .onboarding-main-container {
          width: 100%;
          max-width: 440px;
          padding: 0;
          border-radius: 28px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(79, 70, 229, 0.12);
          position: relative;
          z-index: 10;
        }
        .onboarding-hero-banner {
          height: 240px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #fff;
          overflow: hidden;
        }
        .banner-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #fff;
        }
        .hero-floating-icon {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          animation: floatHero 4s ease-in-out infinite alternate;
        }
        @keyframes floatHero {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        .floating-pills {
          display: flex;
          gap: 6px;
          margin-top: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .pill {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(6px);
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #fff;
        }
        .onboarding-body {
          padding: 28px 24px 32px 24px;
          background: #ffffff;
        }
        .onboarding-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 10px 0;
        }
        .onboarding-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }
        .onboarding-btn {
          width: 100%;
          padding: 14px;
          font-size: 0.98rem;
          font-weight: 800;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
        }
      `}</style>
    </div>
  );
}
