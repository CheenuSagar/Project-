// App Version & Remote Update Service

export const CURRENT_APP_VERSION = {
  versionCode: 1,
  versionName: '1.0.1',
  buildDate: '2026-08-21'
};

const REMOTE_VERSION_URL = 'https://mca-timetable.web.app/version.json';
const DISMISSED_VERSION_KEY = 'lecalert_dismissed_update_version';

export async function fetchServerVersion() {
  try {
    const response = await fetch(`${REMOTE_VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch version info');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching server version:', error);
    return null;
  }
}

export async function checkAppUpdate(isManualCheck = false) {
  const serverData = await fetchServerVersion();
  if (!serverData || !serverData.versionCode) {
    return { error: 'Unable to connect to update server', isManualCheck };
  }

  const isUpdateAvailable = serverData.versionCode > CURRENT_APP_VERSION.versionCode;
  
  if (!isUpdateAvailable) {
    return {
      updateAvailable: false,
      serverData,
      currentVersion: CURRENT_APP_VERSION,
      isManualCheck
    };
  }

  // Calculate hours since release
  const releaseTime = new Date(serverData.releaseDate || Date.now()).getTime();
  const now = Date.now();
  const hoursSinceRelease = Math.max(0, (now - releaseTime) / (1000 * 60 * 60));

  // Check if user previously dismissed this version
  const lastDismissed = localStorage.getItem(DISMISSED_VERSION_KEY);
  const isDismissed = lastDismissed && parseInt(lastDismissed, 10) === serverData.versionCode;

  // Notification rule:
  // - If manual check: Always show update prompt
  // - If auto check on launch: Only show if release age >= 48 hours AND not dismissed by user
  const shouldPrompt = isManualCheck || (hoursSinceRelease >= 48 && !isDismissed);

  return {
    updateAvailable: true,
    serverData,
    hoursSinceRelease: Math.floor(hoursSinceRelease),
    isDismissed,
    shouldPrompt,
    isManualCheck
  };
}

export function dismissUpdate(versionCode) {
  try {
    localStorage.setItem(DISMISSED_VERSION_KEY, String(versionCode));
  } catch (e) {
    console.error('Failed to dismiss update:', e);
  }
}
