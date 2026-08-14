import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, Settings as SettingsIcon, Bell, Plus, Check, AlertCircle, Share2, CalendarDays, Menu, X, Coffee, Zap, Layers, Palette, ChevronDown, UserCheck, Shield, GraduationCap, UserCog, BookOpen, Award } from 'lucide-react';
import StudentPanel from './components/StudentPanel';
import TeacherPanel from './components/TeacherPanel';
import MentorPanel from './components/MentorPanel';
import PLPanel from './components/PLPanel';
import AdminPanel from './components/AdminPanel';
import StudentAttendancePortal from './components/StudentAttendancePortal';
import AutoGeneratorModal from './components/AutoGeneratorModal';
import Dashboard from './components/Dashboard';
import TimetableGrid from './components/TimetableGrid';
import AcademicCalendar from './components/AcademicCalendar';
import SyllabusPortal from './components/SyllabusPortal';
import SettingsPanel, { playSyntheticChime, ALL_THEMES } from './components/SettingsPanel';
import ClassModal from './components/ClassModal';
import FeedbackModal from './components/FeedbackModal';
import AdminPasswordModal from './components/AdminPasswordModal';
import RoleSelectionModal from './components/RoleSelectionModal';
import TermsModal from './components/TermsModal';
import AuthModal from './components/AuthModal';
import RoomSelectModal from './components/RoomSelectModal';
import RollNumberModal from './components/RollNumberModal';
import LandingOnboarding from './components/LandingOnboarding';
import LogoSplash from './components/LogoSplash';
import { MessageSquare, MapPin, User, LogOut } from 'lucide-react';
import { 
  loadTimetable, saveTimetable, loadSettings, saveSettings, parseShareUrl, 
  loadAcademicCalendar, saveAcademicCalendar, loadHolidayNotice, saveHolidayNotice, isTodayHoliday,
  DEFAULT_TIMETABLE_A, DEFAULT_TIMETABLE_B, DEFAULT_TIMETABLE_C 
} from './utils/storageHelper';
import { requestLocalNotificationPermission, rescheduleLectureReminders } from './utils/localNotificationScheduler';
import { 
  subscribeToRemoteTimetable, saveRemoteTimetable, 
  subscribeToRemoteHolidayNotice, saveRemoteHolidayNotice, 
  subscribeToRemoteAcademicEvents, saveRemoteAcademicEvents, 
  subscribeToRemoteAppVersion, saveRemoteAppVersion, CURRENT_APP_VERSION,
  logoutFirebaseUser, updateUserRoomNumber 
} from './utils/firebase';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export default function App() {
  const [timetable, setTimetable] = useState([]);
  const [holidayNotice, setHolidayNotice] = useState(() => loadHolidayNotice());

  // User Role State: 'student' | 'teacher' | null
  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('lecalert_user_role');
      if (saved === 'admin') return 'student';
      return saved || 'student';
    } catch (e) {
      return 'student';
    }
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('lecalert_user_role');
      return !saved;
    } catch (e) {
      return false;
    }
  });

  const [selectedSection, setSelectedSection] = useState(() => {
    try {
      const saved = localStorage.getItem('lecalert_selected_section');
      if (saved) return saved;
      const hasTimetable = localStorage.getItem('lecalert_timetable');
      if (!hasTimetable) {
        return 'B'; // default
      }
      return '';
    } catch (e) {
      return '';
    }
  });

  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: false,
    preTime: 5,
    alarmSound: 'chime'
  });
  const [academicEvents, setAcademicEvents] = useState(() => loadAcademicCalendar());
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedRole = localStorage.getItem('lecalert_user_role');
      if (savedRole === 'teacher') return 'teacher';
      return 'student';
    } catch (e) {
      return 'student';
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const pendingAdminCallbackRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false); // Always default to false on app load
  
  // Theme state: 'default', 'vokka', 'coffee'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('lecalert_theme') || 'default';
    } catch (e) {
      return 'default';
    }
  });

  // Mobile menu, Weekly Quick Popup, Header Theme Dropdown, Terms & Room states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWeeklyPopupOpen, setIsWeeklyPopupOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(() => {
    try {
      return localStorage.getItem('lecalert_terms_accepted') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Classroom Room Selection & Firebase Auth State
  const [selectedRoom, setSelectedRoom] = useState(() => {
    try {
      return localStorage.getItem('lecalert_selected_room') || 'AB-207';
    } catch (e) {
      return 'AB-207';
    }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const raw = localStorage.getItem('lecalert_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    try {
      const raw = localStorage.getItem('lecalert_user_profile');
      return !raw; // Force Login Page First on app/website launch if not logged in
    } catch (e) {
      return true;
    }
  });
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [isMobileThemeOpen, setIsMobileThemeOpen] = useState(false);
  const [remoteAppVersionNotice, setRemoteAppVersionNotice] = useState(null);
  const [showAppSplash, setShowAppSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowAppSplash(false);
    }, 1200);
    return () => clearTimeout(splashTimer);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lecalert_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Real-time Firestore Database Listeners
  useEffect(() => {
    // 1. Master Timetable Listener
    const unsubTimetable = subscribeToRemoteTimetable((remoteData) => {
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        const isObsolete = remoteData.some(c => (c.id && c.id.includes('special')) || (c.name && c.name.includes('Special')));
        if (isObsolete) {
          const freshTable = loadTimetable();
          setTimetable(freshTable);
          saveTimetable(freshTable);
          saveRemoteTimetable(freshTable);
        } else {
          setTimetable(remoteData);
          saveTimetable(remoteData);
        }
      }
    });

    // 2. Holiday Notice Listener
    const unsubHoliday = subscribeToRemoteHolidayNotice((remoteNotice) => {
      if (remoteNotice) {
        setHolidayNotice(remoteNotice);
        saveHolidayNotice(remoteNotice);
      }
    });

    // 3. Academic Calendar Listener
    const unsubCalendar = subscribeToRemoteAcademicEvents((remoteEvents) => {
      if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
        setAcademicEvents(remoteEvents);
        saveAcademicCalendar(remoteEvents);
      }
    });

    // 4. Remote App Version Release Listener
    const unsubVersion = subscribeToRemoteAppVersion((versionData) => {
      if (versionData && versionData.version) {
        setRemoteAppVersionNotice(versionData);
      }
    });

    return () => {
      unsubTimetable();
      unsubHoliday();
      unsubCalendar();
      unsubVersion();
    };
  }, []);

  // Share link import modal state
  const [sharedClasses, setSharedClasses] = useState(null);
  
  // Tracks already notified classes to prevent duplicate triggers in the same minute
  // Format: { 'classId': 'YYYY-MM-DD-HH:MM' }
  const notifiedRef = useRef({});

  // 1. Initial Load and Hash Sync
  useEffect(() => {
    // Load local storage data
    const localTable = loadTimetable();
    setTimetable(localTable);
    
    const localSettings = loadSettings();
    setSettings(localSettings);

    // Check for share link in URL hash
    const hash = window.location.hash;
    if (hash.includes('share=')) {
      const imported = parseShareUrl(hash);
      if (imported && imported.length > 0) {
        setSharedClasses(imported);
      }
      // Clear hash so it doesn't prompt again on refresh
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Secret Admin Trigger Refs & Handler (5-tap logo or Ctrl+Shift+A)
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef(null);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 3000);

    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
      
      // Trigger Secret Admin Verification Modal
      verifyAdminAction(() => {
        setActiveTab('admin');
      });
    } else {
      setActiveTab(userRole || 'student');
    }
  };

  // Keyboard shortcut listener: Ctrl + Shift + A for Secret Admin Access
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        verifyAdminAction(() => {
          setActiveTab('admin');
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const handleSelectRole = (role) => {
    setUserRole(role);
    setIsRoleModalOpen(false);
    try {
      localStorage.setItem('lecalert_user_role', role);
      if (role === 'student') {
        localStorage.setItem('lecalert_is_admin', 'false');
        setIsAdmin(false);
      }
    } catch (e) {}
    if (role === 'teacher') {
      setActiveTab('teacher');
    } else {
      setActiveTab('student');
    }
  };

  // 2. Alarm Trigger Interval Loop (runs every second)
  useEffect(() => {
    const checkSchedule = () => {
      if (timetable.length === 0) return;
      
      const now = new Date();
      if (isTodayHoliday(holidayNotice, now)) return; // Pause alarms on holiday/suspension days!
      
      const currentDay = DAYS[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateString = `${year}-${month}-${day}`;
      
      const isTeacherMode = userRole === 'teacher' || activeTab === 'teacher';
      let authTeacher = '';
      try {
        const savedTeacher = localStorage.getItem('lecalert_auth_teacher');
        const expiry = localStorage.getItem('lecalert_auth_teacher_expiry');
        if (savedTeacher && expiry && Date.now() < Number(expiry)) {
          authTeacher = savedTeacher;
        }
      } catch (e) {}

      timetable.forEach((cls) => {
        if (cls.day !== currentDay) return;

        // Strict Role Notification Filtering
        if (isTeacherMode) {
          // If teacher is logged in, ONLY notify for classes taught by this teacher (or as substitute)
          if (authTeacher) {
            const isMyClass = cls.teacher === authTeacher || cls.substituteTeacher === authTeacher;
            if (!isMyClass) return;
          }
        } else {
          // Student Mode: If a section is selected, filter by section
          if (selectedSection && cls.section && cls.section !== selectedSection && cls.section !== 'All') {
            return;
          }
        }
        
        const startMins = timeToMinutes(cls.startTime);
        // Target trigger time is startMins minus the preTime
        const triggerMins = startMins - settings.preTime;
        
        if (currentMinutes === triggerMins) {
          const uniqueTriggerId = `${cls.id}-${todayDateString}-${currentMinutes}`;
          
          // Check if we already notified for this exact minute today
          if (notifiedRef.current[cls.id] === uniqueTriggerId) return;
          
          // Set as notified first to prevent race condition
          notifiedRef.current[cls.id] = uniqueTriggerId;
          
          // 1. Trigger Audio Alarm
          if (settings.soundEnabled) {
            playSyntheticChime();
            // Optional second chime after a short delay
            setTimeout(playSyntheticChime, 1500);
          }
          
          const subInfo = cls.substituteTeacher ? ` (Substitute Teacher: ${cls.substituteTeacher})` : '';
          
          // 2. Role-Targeted Notification Construction
          const notifTitle = isTeacherMode 
            ? `👨‍🏫 ABES Academix: Faculty Teaching Alert!` 
            : `🎓 ABES Academix: Class Starting Soon!`;
          
          const notifBody = isTeacherMode
            ? `Upcoming Lecture: ${cls.name} (Sec ${cls.section || 'All'}) starts in ${settings.preTime} mins ${cls.location ? `at ${cls.location}` : ''}.${subInfo}`
            : `${cls.name} starts in ${settings.preTime} mins ${cls.location ? `at ${cls.location}` : ''}.${subInfo}`;

          // Trigger System Notification
          if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(notifTitle, {
                body: notifBody,
                icon: '/favicon.ico',
                tag: cls.id
              });
            } catch (err) {
              console.error('Failed to dispatch notification:', err);
            }
          } else {
            // Fallback in-app alert
            alert(`${notifTitle}\n${notifBody}`);
          }
        }
      });
    };

    // Run check once, then set interval
    checkSchedule();
    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [timetable, settings, userRole, activeTab, holidayNotice]);

  // Offline lecture reminders (native Android app only) — schedules device-level
  // alarms via Capacitor Local Notifications so alerts fire even when the app
  // is closed / phone has no internet. No-ops in a regular browser tab.
  useEffect(() => {
    requestLocalNotificationPermission();
  }, []);

  useEffect(() => {
    rescheduleLectureReminders(timetable, settings.preTime, holidayNotice);
  }, [timetable, settings.preTime, holidayNotice]);

  // Save changes helper with remote Firestore Sync
  const handleSaveTimetable = (newTable) => {
    setTimetable(newTable);
    saveTimetable(newTable);
    saveRemoteTimetable(newTable);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveAcademicEvents = (newEvents) => {
    setAcademicEvents(newEvents);
    saveAcademicCalendar(newEvents);
    saveRemoteAcademicEvents(newEvents);
  };

  // Admin Verification Helper (SHA-256 Encrypted Mastermind & Admin Hashes)
  const MASTERMIND_HASH = "2071810017735617cc09af7c114a19863f8e1ca8ae82bc4951a6d5e337e88aa6";
  const ADMIN_HASH = "d89a08370f1157a589cebe086324544139adef1c0e118947390337227b2ddddd";

  const verifyAdminAction = (callback) => {
    if (isAdmin) {
      if (callback) callback();
      return true;
    }
    pendingAdminCallbackRef.current = callback || null;
    setIsAdminPasswordModalOpen(true);
    return false;
  };

  const handleToggleAdmin = (status) => {
    if (status) {
      if (isAdmin) return true;
      pendingAdminCallbackRef.current = null;
      setIsAdminPasswordModalOpen(true);
      return false;
    } else {
      setIsAdmin(false);
      try {
        localStorage.setItem('lecalert_is_admin', 'false');
      } catch (e) {}
      if (activeTab === 'admin') {
        setActiveTab(userRole || 'student');
      }
      return true;
    }
  };

  const handleVerifyAdminPassword = async (enteredPassword) => {
    try {
      const msgBuffer = new TextEncoder().encode(enteredPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex === MASTERMIND_HASH || hashHex === ADMIN_HASH) {
        setIsAdmin(true);
        setActiveTab('admin');
        try {
          localStorage.setItem('lecalert_is_admin', 'true');
        } catch (e) {}
        if (pendingAdminCallbackRef.current) {
          pendingAdminCallbackRef.current();
          pendingAdminCallbackRef.current = null;
        }
        return true;
      }
    } catch (e) {
      console.error("Crypto hashing failed:", e);
    }
    return false;
  };

  // Add / Edit / Delete Handlers
  const handleSaveClass = async (classData) => {
    await verifyAdminAction(() => {
      if (editingClass) {
        // Update
        const updated = timetable.map((c) => (c.id === editingClass.id ? classData : c));
        handleSaveTimetable(updated);
      } else {
        // Create new
        handleSaveTimetable([...timetable, classData]);
      }
      setEditingClass(null);
    });
  };

  const handleDeleteClass = async (id) => {
    await verifyAdminAction(() => {
      const filtered = timetable.filter((c) => c.id !== id);
      handleSaveTimetable(filtered);
      setEditingClass(null);
    });
  };

  const handleLoadSectionPreset = (sectionCode) => {
    let preset = [];
    if (sectionCode === 'A') preset = DEFAULT_TIMETABLE_A;
    else if (sectionCode === 'B') preset = DEFAULT_TIMETABLE_B;
    else if (sectionCode === 'C') preset = DEFAULT_TIMETABLE_C;
    handleSaveTimetable(preset);
    setSelectedSection(sectionCode);
    try {
      localStorage.setItem('lecalert_selected_section', sectionCode);
    } catch (e) {}
  };

  const handleSelectSection = (sectionCode) => {
    if (!sectionCode) return;
    const sec = String(sectionCode).toUpperCase();
    setSelectedSection(sec);
    try {
      localStorage.setItem('lecalert_selected_section', sec);
    } catch (e) {}

    let room = 'AB-207';
    if (sec === 'B') room = 'AB-208';
    else if (sec === 'C') room = 'AB-209';
    setSelectedRoom(room);
    try {
      localStorage.setItem('lecalert_selected_room', room);
    } catch (e) {}

    handleLoadSectionPreset(sec);

    if (userProfile) {
      const updated = { ...userProfile, section: sec, roomNumber: room };
      setUserProfile(updated);
      try {
        localStorage.setItem('lecalert_user_profile', JSON.stringify(updated));
      } catch (e) {}
      if (userProfile.uid) {
        updateUserRoomNumber(userProfile.uid, room, sec).catch(() => {});
      }
    }
  };


  // Import shared timetable options
  const handleAcceptImport = (merge) => {
    if (!sharedClasses) return;
    
    if (merge) {
      // Merge: avoid duplicates by ID
      const existingIds = new Set(timetable.map(c => c.id));
      const filteredShared = sharedClasses.filter(c => !existingIds.has(c.id));
      
      // If there are ID overlaps, regenerate their IDs
      const safeShared = filteredShared.map(c => ({
        ...c,
        id: timetable.some(t => t.id === c.id) ? Date.now().toString() + Math.random().toString(36).substr(2, 5) : c.id
      }));

      handleSaveTimetable([...timetable, ...safeShared]);
    } else {
      // Replace
      handleSaveTimetable(sharedClasses);
    }
    setSharedClasses(null);
  };

  // MANDATORY AUTH & ONBOARDING GATE: Splash -> Onboarding Hero -> Auth Flow
  if (!userProfile) {
    return (
      <LandingOnboarding 
        initialTab={userRole || 'student'}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
          setUserRole(profile.role || 'student');
          setIsAdmin(profile.role === 'admin');
          try {
            localStorage.setItem('lecalert_user_profile', JSON.stringify(profile));
            localStorage.setItem('lecalert_user_role', profile.role || 'student');
          } catch (e) {}

          if (profile.role === 'student') {
            setActiveTab('student');
            const sec = profile.section || (
              profile.roomNumber
                ? (profile.roomNumber.includes('208') ? 'B' : profile.roomNumber.includes('209') ? 'C' : 'A')
                : (localStorage.getItem('lecalert_selected_section') || 'B')
            );
            handleSelectSection(sec);
          } else if (profile.role === 'teacher' || profile.role === 'mentor') {
            setActiveTab('mentor');
          } else if (profile.role === 'pl') {
            setActiveTab('pl');
          } else if (profile.role === 'admin') {
            setIsAdmin(true);
            setActiveTab('admin');
          }
        }}
      />
    );
  }

  return (
    <div className="app-layout">
      {showAppSplash && <LogoSplash />}
      {/* Navigation Header */}
      <header className="app-header glass">
        <div className="brand-logo" onClick={handleLogoClick} title="MCA Time Table (Tap 5 times for Secret Admin Access)">
          <div className="logo-icon">
            <Bell size={20} className="bell-glow" />
          </div>
          <div className="logo-text">
            <span>MCA</span> Time Table
          </div>
        </div>

        {/* Desktop Navbar - Dynamic Role-Based Portals */}
        <nav className="desktop-nav">
          <div className="nav-tabs">
            {(!userRole || userRole === 'student') && (
              <>
                <button 
                  className={`nav-tab ${activeTab === 'student' ? 'active' : ''}`}
                  onClick={() => setActiveTab('student')}
                >
                  <GraduationCap size={16} /> Student Portal
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attendance')}
                >
                  <Award size={16} style={{ color: 'var(--success)' }} /> Attendance Portal
                </button>
              </>
            )}
            {(!userRole || userRole === 'teacher' || userRole === 'mentor' || isAdmin) && (
              <button 
                className={`nav-tab ${activeTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setActiveTab('teacher')}
              >
                <UserCheck size={16} /> Teacher Portal
              </button>
            )}
            {(userRole === 'mentor' || userRole === 'teacher' || isAdmin) && (
              <button 
                className={`nav-tab ${activeTab === 'mentor' ? 'active' : ''}`}
                onClick={() => setActiveTab('mentor')}
              >
                <User size={16} /> Mentor Portal
              </button>
            )}
            {(userRole === 'pl' || isAdmin) && (
              <button 
                className={`nav-tab ${activeTab === 'pl' ? 'active' : ''}`}
                onClick={() => setActiveTab('pl')}
              >
                <UserCheck size={16} /> PL Portal
              </button>
            )}
            {isAdmin && (
              <button 
                className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <Shield size={16} /> Admin Portal
              </button>
            )}
            <button 
              className={`nav-tab ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              <BookOpen size={16} /> Syllabus Portal
            </button>
            <button 
              className={`nav-tab ${activeTab === 'academic' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic')}
            >
              <CalendarDays size={16} /> Academic Calendar
            </button>
            <button 
              className="nav-tab"
              onClick={() => setIsFeedbackOpen(true)}
            >
              <MessageSquare size={16} style={{ color: 'var(--secondary)' }} /> Feedback & Support
            </button>
          </div>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">

          {/* User Auth / Profile Button */}
          <button 
            className="role-switch-header-btn"
            onClick={() => setIsAuthModalOpen(true)}
            title="User Account & Login"
          >
            <User size={16} />
            <span>{userProfile?.displayName || (userRole === 'teacher' ? 'Faculty Login' : 'Login / Signup')}</span>
          </button>

          {/* Quick Theme Picker Pill */}
          <div className="header-theme-picker">
            <button 
              className="header-theme-btn" 
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              title="Quick Theme Selector"
            >
              <Palette size={16} style={{ color: 'var(--primary)' }} />
              <span>Theme</span>
              <ChevronDown size={14} style={{ transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isThemeDropdownOpen && (
              <div className="header-theme-dropdown glass">
                <div style={{ padding: '6px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>
                  SELECT APP THEME
                </div>
                {ALL_THEMES.map((t) => {
                  const IconComp = t.icon;
                  const isActive = theme === t.id || (t.id === 'default' && theme === 'light');
                  return (
                    <div 
                      key={t.id}
                      className={`header-theme-option ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setTheme(t.id);
                        setIsThemeDropdownOpen(false);
                      }}
                    >
                      <IconComp size={14} style={{ color: t.iconColor }} />
                      <span style={{ flex: 1 }}>{t.label}</span>
                      {isActive && <Check size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Corner Hamburger Button for Mobile */}
          <button 
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">Navigation & Settings</span>
              <button className="icon-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Logged In User Profile Banner in Mobile Drawer */}
            {userProfile && (
              <div 
                className="glass" 
                style={{ 
                  margin: '12px 16px 10px 16px', 
                  padding: '14px 16px', 
                  borderRadius: '20px', 
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(168, 85, 247, 0.08))',
                  border: '1.5px solid var(--primary-glow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0, boxShadow: '0 4px 14px var(--primary-glow)' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 18px var(--primary-glow)' }}>
                      {(userProfile.displayName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1.02rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {userProfile.displayName || 'MCA Student'}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginTop: '3px' }}>
                      Roll No: {userProfile.rollNumber || userProfile.email?.split('@')[0] || '230032010001'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginTop: '1px' }}>
                      {userProfile.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'var(--primary-gradient)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px var(--primary-glow)'
                    }}
                  >
                    <User size={16} />
                    <span>Customize Profile & Photo ⚙️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: 'var(--danger)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                    <span>Sign Out / Logout 🚪</span>
                  </button>
                </div>
              </div>
            )}

            <div className="mobile-nav-list">

              {(!userRole || userRole === 'student') && (
                <>
                  <button 
                    className={`mobile-nav-item ${activeTab === 'student' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('student'); setIsMobileMenuOpen(false); }}
                  >
                    <GraduationCap size={18} /> Student Portal
                  </button>
                  <button 
                    className={`mobile-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}
                  >
                    <Award size={18} style={{ color: 'var(--success)' }} /> Attendance Portal
                  </button>
                </>
              )}
              {(!userRole || userRole === 'teacher' || userRole === 'mentor' || isAdmin) && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'teacher' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('teacher'); setIsMobileMenuOpen(false); }}
                >
                  <UserCheck size={18} /> Teacher Portal
                </button>
              )}
              {(userRole === 'mentor' || userRole === 'teacher' || isAdmin) && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'mentor' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('mentor'); setIsMobileMenuOpen(false); }}
                >
                  <User size={18} /> Mentor Portal
                </button>
              )}
              {(userRole === 'pl' || isAdmin) && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'pl' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('pl'); setIsMobileMenuOpen(false); }}
                >
                  <Shield size={18} /> PL Portal
                </button>
              )}
              {isAdmin && (
                <button 
                  className={`mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                >
                  <Shield size={18} /> Admin Portal
                </button>
              )}
              <button 
                className={`mobile-nav-item ${activeTab === 'syllabus' ? 'active' : ''}`}
                onClick={() => { setActiveTab('syllabus'); setIsMobileMenuOpen(false); }}
              >
                <BookOpen size={18} /> Syllabus Portal
              </button>
              <button 
                className={`mobile-nav-item ${activeTab === 'academic' ? 'active' : ''}`}
                onClick={() => { setActiveTab('academic'); setIsMobileMenuOpen(false); }}
              >
                <CalendarDays size={18} /> Academic Calendar
              </button>
              <button 
                className="mobile-nav-item"
                onClick={() => { setIsFeedbackOpen(true); setIsMobileMenuOpen(false); }}
              >
                <MessageSquare size={18} style={{ color: 'var(--secondary)' }} /> Feedback & Support
              </button>
            </div>

            {/* Mobile Theme Selector (Collapsible Accordion) */}
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => setIsMobileThemeOpen(!isMobileThemeOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 800
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={18} style={{ color: 'var(--primary)' }} />
                  <span>APP THEME ({ALL_THEMES.find(t => t.id === theme)?.label || 'Light White'})</span>
                </div>
                <ChevronDown size={18} style={{ transform: isMobileThemeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
              </button>

              {isMobileThemeOpen && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {ALL_THEMES.map((t) => {
                    const IconComp = t.icon;
                    const isActive = theme === t.id || (t.id === 'default' && theme === 'light');
                    return (
                      <button
                        key={t.id}
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        style={{ padding: '10px 14px', fontSize: '0.85rem', justifyContent: 'flex-start', gap: '10px' }}
                        onClick={() => {
                          setTheme(t.id);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <IconComp size={16} style={{ color: t.iconColor }} />
                        <span style={{ fontWeight: isActive ? 800 : 600 }}>{t.label}</span>
                        {isActive && <Check size={16} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Floating Bottom Trigger for Weekly Schedule */}
      <button 
        className="floating-bottom-trigger"
        onClick={() => setIsWeeklyPopupOpen(true)}
        title="View Full Weekly Schedule"
      >
        <Calendar size={18} />
        <span>Weekly Schedule</span>
      </button>

      {/* Full Weekly Schedule Modal */}
      {isWeeklyPopupOpen && (
        <div className="weekly-popup-overlay" onClick={() => setIsWeeklyPopupOpen(false)}>
          <div className="weekly-popup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="weekly-popup-header">
              <div className="weekly-popup-title">
                <Calendar size={22} style={{ color: 'var(--primary)' }} />
                <span>Weekly Schedule</span>
              </div>
              <button className="modal-close-btn" onClick={() => setIsWeeklyPopupOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <div className="weekly-popup-body">
              <TimetableGrid 
                timetable={timetable} 
                settings={settings}
                onAddClick={async () => {
                  await verifyAdminAction(() => {
                    setEditingClass(null);
                    setIsModalOpen(true);
                  });
                }}
                onEditClick={async (cls) => {
                  await verifyAdminAction(() => {
                    setEditingClass(cls);
                    setIsModalOpen(true);
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Content - 3 Portals */}
      <main className="app-main-content">
        {(activeTab === 'student' || activeTab === 'dashboard') && (
          <StudentPanel 
            timetable={timetable} 
            settings={settings}
            onAddClick={async () => {
              await verifyAdminAction(() => {
                setEditingClass(null);
                setIsModalOpen(true);
              });
            }}
            onEditClick={async (cls) => {
              await verifyAdminAction(() => {
                setEditingClass(cls);
                setIsModalOpen(true);
              });
            }}
            onLoadPreset={handleLoadSectionPreset}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            holidayNotice={holidayNotice}
            selectedRoom={selectedRoom}
            onOpenRoomModal={() => setIsRoomModalOpen(true)}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'attendance' && (
          <StudentAttendancePortal 
            userProfile={userProfile}
            selectedSection={selectedSection}
            onOpenRollModal={() => setIsRollModalOpen(true)}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherPanel 
            timetable={timetable}
            settings={settings}
            isAdmin={isAdmin}
            onSaveTimetable={handleSaveTimetable}
            onEditClick={async (cls) => {
              await verifyAdminAction(() => {
                setEditingClass(cls);
                setIsModalOpen(true);
              });
            }}
            holidayNotice={holidayNotice}
          />
        )}

        {activeTab === 'mentor' && (
          <MentorPanel userProfile={userProfile} />
        )}

        {activeTab === 'pl' && (
          <PLPanel userProfile={userProfile} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            timetable={timetable} 
            settings={settings} 
            onSaveSettings={handleSaveSettings}
            onImportBackup={async (imported) => {
              await verifyAdminAction(() => {
                handleSaveTimetable([...timetable, ...imported]);
              });
            }}
            onClearAll={async () => {
              await verifyAdminAction(() => {
                handleSaveTimetable([]);
                setSelectedSection('');
                try {
                  localStorage.removeItem('lecalert_selected_section');
                } catch (e) {}
              });
            }}
            onLoadPreset={handleLoadSectionPreset}
            selectedSection={selectedSection}
            isAdmin={isAdmin}
            onToggleAdmin={handleToggleAdmin}
            currentTheme={theme}
            onThemeChange={setTheme}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onEditClick={async (cls) => {
              await verifyAdminAction(() => {
                setEditingClass(cls);
                setIsModalOpen(true);
              });
            }}
            onSaveTimetable={handleSaveTimetable}
            onAddClick={async () => {
              await verifyAdminAction(() => {
                setEditingClass(null);
                setIsModalOpen(true);
              });
            }}
            holidayNotice={holidayNotice}
            onSaveHolidayNotice={async (newNotice) => {
              setHolidayNotice(newNotice);
              saveHolidayNotice(newNotice);
              const result = await saveRemoteHolidayNotice(newNotice);
              return result;
            }}
            onOpenTerms={() => setIsTermsOpen(true)}
          />
        )}

        {activeTab === 'academic' && (
          <AcademicCalendar 
            events={academicEvents} 
            onSaveEvents={handleSaveAcademicEvents}
            isAdmin={isAdmin}
            verifyAdminAction={verifyAdminAction}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusPortal />
        )}
      </main>

      {/* AI Automatic Timetable Generator Modal */}
      <AutoGeneratorModal 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onApplyTimetable={(generatedTable) => {
          handleSaveTimetable(generatedTable);
          alert('Conflict-free timetable published successfully!');
        }}
      />

      {/* Footer */}
      <footer className="page-footer">
        <p>
          © 2026 MCA Time Table 🎓 • Build by Cheenu Sagar •{' '}
          <button 
            className="footer-terms-btn" 
            onClick={() => setIsTermsOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
          >
            Terms & Agreement
          </button>
        </p>
      </footer>

      {/* Add / Edit Class Modal */}
      <ClassModal 
        isOpen={isModalOpen || !!editingClass} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        editingClass={editingClass}
      />

      {/* Shared Timetable Import Dialog */}
      {sharedClasses && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in text-center">
            <div className="import-prompt-icon">
              <Share2 size={36} />
            </div>
            <h2>Import Timetable Schedule?</h2>
            <p className="prompt-desc">
              We detected a shared timetable link containing <strong>{sharedClasses.length} lectures</strong>. 
              Would you like to merge these lectures into your current schedule, or replace your timetable entirely?
            </p>
            <div className="prompt-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setSharedClasses(null)}
              >
                Discard
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleAcceptImport(true)}
              >
                Merge with Mine
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleAcceptImport(false)}
              >
                Replace Entirely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Button */}
      <button 
        className="floating-feedback-btn"
        onClick={() => setIsFeedbackOpen(true)}
        title="Feedback & Problem Report"
      >
        <MessageSquare size={18} />
        <span>Feedback & Support</span>
      </button>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        userProfile={userProfile}
        selectedSection={selectedSection}
      />

      {/* Admin Password Verification Modal */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSubmit={handleVerifyAdminPassword}
      />



      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onLogoutSuccess={() => {
          setUserProfile(null);
          setUserRole('student');
          setIsAdmin(false);
          setSelectedSection('A');
          setSelectedRoom('AB-207');
          setActiveTab('student');
          try {
            localStorage.removeItem('lecalert_user_profile');
            localStorage.setItem('lecalert_user_role', 'student');
            localStorage.removeItem('lecalert_selected_section');
            localStorage.removeItem('lecalert_selected_room');
            localStorage.removeItem('lecalert_is_admin');
          } catch (e) {}
        }}
        onAuthSuccess={(profile) => {
          setUserProfile(profile);
          setUserRole(profile.role || 'student');
          setIsAdmin(profile.role === 'admin');
          try {
            localStorage.setItem('lecalert_user_profile', JSON.stringify(profile));
            localStorage.setItem('lecalert_user_role', profile.role || 'student');
          } catch (e) {}
          setIsAuthModalOpen(false);

          if (profile.role === 'student') {
            setActiveTab('student');
            if (!profile.rollNumber) {
              setIsRollModalOpen(true);
            }
            const sec = profile.section || (
              profile.roomNumber
                ? (profile.roomNumber.includes('208') ? 'B' : profile.roomNumber.includes('209') ? 'C' : 'A')
                : (localStorage.getItem('lecalert_selected_section') || 'B')
            );
            handleSelectSection(sec);
          } else if (profile.role === 'teacher') {
            setActiveTab('teacher');
          } else if (profile.role === 'admin') {
            setIsAdmin(true);
            try {
              localStorage.setItem('lecalert_is_admin', 'true');
            } catch (e) {}
            setActiveTab('admin');
          }
        }}
        allowClose={Boolean(userProfile)}
      />

      {/* Classroom Room Selector Modal */}
      <RoomSelectModal 
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        currentRoom={selectedRoom}
        onSelectRoom={(roomNum) => {
          setIsRoomModalOpen(false);
          const rNum = roomNum ? roomNum.replace(/[^0-9]/g, '') : '207';
          const fullRoom = `AB-${rNum}`;
          setSelectedRoom(fullRoom);
          try {
            localStorage.setItem('lecalert_selected_room', fullRoom);
          } catch (e) {}

          // Map Room Number to Section Automatically
          if (rNum === '207') {
            handleSelectSection('A');
          } else if (rNum === '208') {
            handleSelectSection('B');
          } else if (rNum === '209') {
            handleSelectSection('C');
          } else {
            handleSelectSection('A');
          }

          if (userProfile?.uid) {
            updateUserRoomNumber(userProfile.uid, fullRoom).catch(() => {});
          }
        }}
        allowClose={true}
      />

      {/* Mandatory Roll Number Verification Modal for Students */}
      <RollNumberModal 
        isOpen={isRollModalOpen}
        userProfile={userProfile}
        onRollSaved={(savedRoll) => {
          setIsRollModalOpen(false);
          const updated = { ...(userProfile || {}), rollNumber: savedRoll };
          setUserProfile(updated);
          try {
            localStorage.setItem('lecalert_user_profile', JSON.stringify(updated));
          } catch (e) {}
        }}
      />

      {/* Terms of Service & User Agreement Modal */}
      <TermsModal 
        isOpen={!isTermsAccepted || isTermsOpen}
        onAccept={() => {
          setIsTermsAccepted(true);
          setIsTermsOpen(false);
        }}
        onClose={() => setIsTermsOpen(false)}
        allowClose={isTermsAccepted}
      />

    </div>
  );
}



















