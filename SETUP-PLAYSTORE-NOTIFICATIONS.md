# LecAlert → Android App with Offline Lecture Reminders

No Firebase, no backend, no account setup needed — this is a fully self-contained
offline app. Notifications are scheduled directly on the phone using Capacitor's
Local Notifications, so they fire 5 (or however many) minutes before each class,
even with no internet and even if the app is closed.

Code changes already done:
- `android/` — full native Android project (via Capacitor)
- `src/utils/localNotificationScheduler.js` — schedules reminders for the next 7 days based on your timetable + the "pre-alert minutes" setting, re-runs automatically whenever the timetable or that setting changes
- `src/App.jsx` — wired up to request notification permission and call the scheduler
- `AndroidManifest.xml` — permissions added (notifications, exact alarms, survive reboot)

The web version (`college-time-table.vercel.app`) is untouched — none of this runs in a browser tab, only inside the native app.

---

## Part A — Build the Android App

You need **Android Studio** installed (free): https://developer.android.com/studio

```bash
npm install
npm run android:sync     # builds the web app + copies it into android/
npm run android:open     # opens the project in Android Studio
```

In Android Studio:
- Wait for Gradle sync to finish (first time takes a few minutes).
- Connect your phone via USB (enable USB debugging in Developer Options) or use an emulator.
- Click **Run ▶**.
- On first launch, Android will ask for notification permission — allow it.

Test it: add/edit a class in Admin Portal so a lecture starts a few minutes from now, close the app fully, and wait — the reminder should still pop up.

Every time you change the code, just re-run `npm run android:sync` before rebuilding in Android Studio.

---

## Part B — Publish to Play Store

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**.
   - First time: create a new keystore. **Save the keystore file + both passwords somewhere safe** — you need the exact same one for every future update, or Play Store will reject it.
2. Create a Play Console developer account (one-time **$25 USD**): https://play.google.com/console
3. Create a new app → fill in title, short/full description, screenshots (Android Studio's emulator can generate these), and a privacy policy link (required — a simple one-page policy is fine; free generators exist online since this app doesn't collect personal data beyond what's stored locally on-device).
4. Upload the `.aab` under **Production → Create release**.
5. Fill the content rating questionnaire and the "Data safety" form (you can state: no data collected/shared — everything is stored locally on the device).
6. Submit for review. Usually takes 1–3 days for a new app.

---

## Notes

- Reminders reschedule automatically for the next 7 days every time you open the app or change the timetable/pre-alert setting — so open the app at least once a week to keep them fresh.
- If you later want real-time cross-device proxy/swap push alerts (needs a Firebase backend), that's a separate add-on — just ask whenever you're ready for it.
