import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, setDoc, getDoc, collection, 
  addDoc, query, where, getDocs, updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBF5sN0dMtfSlnRLfOJtCMxoHxqt5c6fVs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mca-timetable.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mca-timetable",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mca-timetable.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "57704066762",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:57704066762:web:304dcf6b8113e8a8600e33",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z2JHSER4F6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ----------------------------------------------------
// REAL-TIME FIRESTORE DATABASE HELPERS
// ----------------------------------------------------

/**
 * Real-time listener for Master Timetable across all sections
 */
export function subscribeToRemoteTimetable(onData, onError) {
  try {
    const docRef = doc(db, 'schedules', 'master_timetable');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data().data)) {
        onData(docSnap.data().data);
      } else {
        onData(null);
      }
    }, (err) => {
      console.warn('Remote timetable sync offline/error:', err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.error('Firestore subscription error:', e);
    return () => {};
  }
}

/**
 * Save / Publish Master Timetable to Firestore
 */
export async function saveRemoteTimetable(timetableArray) {
  try {
    const docRef = doc(db, 'schedules', 'master_timetable');
    await setDoc(docRef, {
      data: timetableArray,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('Failed to save remote timetable:', e);
    return false;
  }
}

/**
 * Real-time listener for Holiday & Suspension Notice
 */
export function subscribeToRemoteHolidayNotice(onData) {
  try {
    const docRef = doc(db, 'notices', 'holiday_notice');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().notice) {
        onData(docSnap.data().notice);
      } else {
        onData(null);
      }
    }, (err) => {
      console.warn('Remote holiday notice error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Save Holiday & Suspension Notice to Firestore
 */
export async function saveRemoteHolidayNotice(noticeObj) {
  try {
    const docRef = doc(db, 'notices', 'holiday_notice');
    await setDoc(docRef, {
      notice: noticeObj,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('Failed to save remote holiday notice:', e);
    return false;
  }
}

/**
 * Real-time listener for Academic Calendar Events
 */
export function subscribeToRemoteAcademicEvents(onData) {
  try {
    const docRef = doc(db, 'calendar', 'academic_events');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data().events)) {
        onData(docSnap.data().events);
      } else {
        onData(null);
      }
    }, (err) => {
      console.warn('Remote academic events error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Save Academic Calendar Events to Firestore
 */
export async function saveRemoteAcademicEvents(eventsArray) {
  try {
    const docRef = doc(db, 'calendar', 'academic_events');
    await setDoc(docRef, {
      events: eventsArray,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('Failed to save remote academic events:', e);
    return false;
  }
}

// ----------------------------------------------------
// OFFICIAL ATTENDANCE & HIERARCHY HELPERS (PL & MENTOR)
// ----------------------------------------------------

/**
 * Save Official Attendance marked by Mentor (LOCKED ONCE SUBMITTED)
 */
export async function saveOfficialAttendance(dateStr, section, subjectName, mentorId, mentorName, attendanceMap) {
  try {
    const docId = `${dateStr}_${section}_${subjectName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const docRef = doc(db, 'official_attendance', docId);
    await setDoc(docRef, {
      docId,
      date: dateStr,
      section,
      subjectName,
      mentorId,
      mentorName,
      records: attendanceMap, // { studentEmail: 'P' | 'A' | 'C' }
      locked: true, // TAMPER-PROOF LOCK
      submittedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e) {
    console.error('Failed to save official attendance:', e);
    return { success: false, message: e.message };
  }
}

/**
 * Correction Authority: PL / Admin can edit locked attendance
 */
export async function correctOfficialAttendanceByPL(docId, updatedMap, plName) {
  try {
    const docRef = doc(db, 'official_attendance', docId);
    await updateDoc(docRef, {
      records: updatedMap,
      correctedBy: plName,
      correctedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e) {
    console.error('Failed to correct attendance:', e);
    return { success: false, message: e.message };
  }
}

/**
 * Real-time listener for Official Attendance Records (PL & Admin Portal)
 */
export function subscribeToOfficialAttendanceRecords(onData) {
  try {
    const q = collection(db, 'official_attendance');
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      onData(list);
    }, (err) => {
      console.warn('Official attendance sync error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

// ----------------------------------------------------
// USER AUTHENTICATION & USER PROFILE HELPERS
// ----------------------------------------------------

/**
 * User Registration with Full Name, Role & Avatar
 */
export async function registerFirebaseUser(email, password, displayName, role, avatarId = 'avatar1') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    // Save user role and profile in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName,
      role, // 'student' | 'teacher' | 'mentor' | 'pl' | 'admin'
      avatarId: avatarId || 'avatar1',
      createdAt: new Date().toISOString()
    });

    return { success: true, user, role, displayName, avatarId };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * User Login
 */
export async function loginFirebaseUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    let profileData = {};
    if (userSnap.exists()) {
      profileData = userSnap.data();
    }

    return { 
      success: true, 
      user, 
      role: profileData.role || 'student', 
      displayName: profileData.displayName || user.displayName || 'User',
      avatarId: profileData.avatarId || 'avatar1'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Update User Room Number preference
 */
export async function updateUserRoomNumber(uid, roomNumber) {
  if (!uid) return;
  try {
    const formattedRoom = roomNumber ? (roomNumber.startsWith('AB-') ? roomNumber : `AB-${roomNumber.replace(/[^0-9]/g, '')}`) : '';
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { roomNumber: formattedRoom }, { merge: true });
    return formattedRoom;
  } catch (e) {
    console.error('Error updating user room:', e);
  }
}

/**
 * Google Sign-In with 1-Tap Auth
 */
export async function loginWithGoogleFirebase() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    let profileData = {};
    if (userSnap.exists()) {
      profileData = userSnap.data();
    } else {
      profileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Student',
        role: 'student',
        avatarId: 'avatar1',
        rollNumber: '',
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profileData);
    }

    return { 
      success: true, 
      user, 
      role: profileData.role || 'student', 
      displayName: profileData.displayName || user.displayName || 'Student',
      avatarId: profileData.avatarId || 'avatar1',
      rollNumber: profileData.rollNumber || ''
    };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Save / Update Student Roll Number in Firestore
 */
export async function saveUserRollNumber(uid, rollNumber) {
  if (!uid) return false;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { rollNumber }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving roll number:', e);
    return false;
  }
}

/**
 * Logout User
 */
export async function logoutFirebaseUser() {
  try {
    await signOut(auth);
    return true;
  } catch (e) {
    console.error('Logout error:', e);
    return false;
  }
}
