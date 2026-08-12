import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, setDoc, getDoc, collection, 
  addDoc, query, where, getDocs 
} from 'firebase/firestore';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBF5sN0dMtfSlnRLfOJtCMxoHxqt5c6fVs",
  authDomain: "mca-timetable.firebaseapp.com",
  projectId: "mca-timetable",
  storageBucket: "mca-timetable.firebasestorage.app",
  messagingSenderId: "57704066762",
  appId: "1:57704066762:web:304dcf6b8113e8a8600e33",
  measurementId: "G-Z2JHSER4F6"
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

/**
 * Real-time listener for Teacher Proxy & Swap Notifications
 */
export function subscribeToRemoteTeacherNotifications(teacherName, onData) {
  if (!teacherName) return () => {};
  try {
    const q = query(
      collection(db, 'teacher_notifications'),
      where('toTeacher', '==', teacherName)
    );
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      onData(list);
    }, (err) => {
      console.warn('Teacher notifications sync error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Send Teacher Proxy or Swap Notification
 */
export async function sendRemoteTeacherNotification(notifObj) {
  try {
    await addDoc(collection(db, 'teacher_notifications'), {
      ...notifObj,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error('Failed to send remote teacher notification:', e);
    return false;
  }
}

// ----------------------------------------------------
// USER AUTHENTICATION & USER PROFILE HELPERS
// ----------------------------------------------------

/**
 * User Registration
 */
export async function registerFirebaseUser(email, password, displayName, role, roomNumber = '') {
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
      role, // 'student' | 'teacher' | 'admin'
      roomNumber: roomNumber ? (roomNumber.startsWith('AB-') ? roomNumber : `AB-${roomNumber}`) : '',
      createdAt: new Date().toISOString()
    });

    return { success: true, user, role, roomNumber };
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
      roomNumber: profileData.roomNumber || '' 
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
