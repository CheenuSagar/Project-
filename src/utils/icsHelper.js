/**
 * Helper to generate ICS (iCalendar) files for class schedules with 5-minute pre-alarms.
 */

const DAY_MAP_ICS = {
  'Monday': 'MO',
  'Tuesday': 'TU',
  'Wednesday': 'WE',
  'Thursday': 'TH',
  'Friday': 'FR',
  'Saturday': 'SA',
  'Sunday': 'SU'
};

const DAY_INDEX_MAP = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

/**
 * Get the date object for the next/current occurrence of a weekday.
 * @param {string} dayName - Name of the day (e.g. 'Monday')
 * @param {string} timeStr - Time string 'HH:MM' (24h)
 * @returns {Date}
 */
function getLocalDateForDay(dayName, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const targetDayIndex = DAY_INDEX_MAP[dayName];
  
  const now = new Date();
  const currentDayIndex = now.getDay();
  
  // Calculate difference in days to align with this week
  let diff = targetDayIndex - currentDayIndex;
  
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);
  targetDate.setHours(hours, minutes, 0, 0);
  
  return targetDate;
}

/**
 * Format a Date object to YYYYMMDDTHHMMSS format (Local time, no Z)
 * @param {Date} date 
 * @returns {string}
 */
function formatDateToICS(date) {
  const pad = (num) => String(num).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generates an ICS string from a list of classes
 * @param {Array} classes - List of class objects
 * @returns {string}
 */
export function generateICS(classes) {
  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LecAlert//Class Schedule Notification//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const nowString = formatDateToICS(new Date()) + 'Z';

  classes.forEach((cls) => {
    const startLocalDate = getLocalDateForDay(cls.day, cls.startTime);
    const endLocalDate = getLocalDateForDay(cls.day, cls.endTime);
    
    // Fallback if endTime is somehow before startTime (e.g. overnight class)
    if (endLocalDate < startLocalDate) {
      endLocalDate.setDate(endLocalDate.getDate() + 1);
    }

    const startICS = formatDateToICS(startLocalDate);
    const endICS = formatDateToICS(endLocalDate);
    const icsDay = DAY_MAP_ICS[cls.day];

    const uid = `lecalert-${cls.id}-${startICS}`;
    const description = `Instructor: ${cls.teacher || 'N/A'}\\nLocation: ${cls.location || 'N/A'}`;

    icsString.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowString}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${icsDay}`,
      `SUMMARY:${cls.name}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${cls.location || 'Classroom'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT5M', // 5 minutes before
      'ACTION:DISPLAY',
      `DESCRIPTION:Upcoming Class: ${cls.name} in 5 minutes!`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsString.push('END:VCALENDAR');

  return icsString.join('\r\n');
}

/**
 * Triggers a download of the ICS file
 * @param {Array} classes 
 */
export function downloadICSFile(classes) {
  if (!classes || classes.length === 0) return;
  const icsData = generateICS(classes);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'lecalert_schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
