import React from 'react';
import { Bell } from 'lucide-react';

export default function LogoSplash() {
  return (
    <div className="logo-splash-wrapper">
      <div className="logo-splash-content">
        <div className="logo-splash-badge">
          <Bell size={48} className="logo-splash-icon" />
        </div>
        <div className="logo-splash-text-group">
          <h1 className="logo-splash-title">
            <span className="gradient-text">MCA</span> TIME TABLE
          </h1>
          <p className="logo-splash-subtitle">ABES ENGINEERING COLLEGE</p>
        </div>
      </div>

      <style>{`
        .logo-splash-wrapper {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #0f172a;
          background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          overflow: hidden;
          animation: splashFadeOut 0.35s ease-out 0.95s forwards;
          pointer-events: none;
        }

        .logo-splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: logoZoomOut 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        .logo-splash-badge {
          width: 96px;
          height: 96px;
          border-radius: 28px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 20px 45px rgba(99, 102, 241, 0.45),
                      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          color: #ffffff;
        }

        .logo-splash-icon {
          color: #ffffff;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
        }

        .logo-splash-text-group {
          animation: textFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.12s backwards;
        }

        .logo-splash-title {
          font-size: 2.1rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin: 0;
          color: #ffffff;
          text-transform: uppercase;
        }

        .logo-splash-title .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-splash-subtitle {
          margin: 6px 0 0 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        @keyframes logoZoomOut {
          0% {
            opacity: 0;
            transform: scale(2.6);
            filter: blur(10px);
          }
          35% {
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }

        @keyframes textFadeUp {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes splashFadeOut {
          0% {
            opacity: 1;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
