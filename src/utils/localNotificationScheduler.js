/**
 * Schedules OFFLINE lecture reminder notifications using Capacitor Local Notifications.
 * These fire from the device's own alarm system — works even if the app is closed
 * or the phone has no internet connection.
 *
 * Only runs inside the native Capacitor app (Android/iOS). In a normal browser tab
 * it silently does nothing, so the web version (Vercel) is unaffected.
 */
import { Capacitor } from '@capacitor/core';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function timeToParts(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return { h, m };
}

// Deterministic 32-bit int ID from a class id + day-of-week, required by the plugin.
function makeNotifId(classId, dayIndex) {
  const str = `${classId}-${dayIndex}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2147483647;
}

export async function requestLocalNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.error('Local notification permission error:', e);
    return false;
  }
}

/**
 * Wipes all previously scheduled lecture reminders and re-schedules fresh ones
 * for the next 7 days based on the current timetable + preTime setting.
 * Call this whenever the timetable or preTime setting changes.
 */
export async function rescheduleLectureReminders(timetable, preTime) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // Cancel everything we previously scheduled
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
    }

    if (!timetable || timetable.length === 0) return;

    const notifications = [];
    const now = new Date();

    // Schedule for the next 7 days so reminders keep working even if the
    // app isn't opened daily to re-sync.
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);
      const dayName = DAYS[targetDate.getDay()];

      const classesToday = timetable.filter(cls => cls.day === dayName);

      classesToday.forEach(cls => {
        const { h, m } = timeToParts(cls.startTime);
        const fireDate = new Date(targetDate);
        fireDate.setHours(h, m - preTime, 0, 0);

        // Skip anything already in the past
        if (fireDate.getTime() <= Date.now()) return;

        const subInfo = cls.substituteTeacher ? ` (Substitute: ${cls.substituteTeacher})` : '';

        notifications.push({
          id: makeNotifId(cls.id, dayOffset),
          title: 'Class Starting Soon!',
          body: `${cls.name} starts in ${preTime} minutes${cls.location ? ` at ${cls.location}` : ''}.${subInfo}`,
          schedule: { at: fireDate, allowWhileIdle: true },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
        });
      });
    }

    // Capacitor local-notifications allows scheduling in batches
    for (let i = 0; i < notifications.length; i += 64) {
      const batch = notifications.slice(i, i + 64);
      await LocalNotifications.schedule({ notifications: batch });
    }

    console.log(`Scheduled ${notifications.length} offline lecture reminders.`);
  } catch (e) {
    console.error('Failed to schedule local notifications:', e);
  }
}
