const { google } = require('googleapis');
const path = require('path');

// --- Configuration ---
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// Use the environment variable, but fall back to 'primary' if it's not set.
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
// A more robust way to get the path to your service account file
const KEYFILE_PATH = path.join(__dirname, 'service_account.json');


// --- Initialization ---

// 1. Create the auth client ONCE at the top level.
// This is the key fix. This 'auth' object will be available to all functions in this file.
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

// 2. Create the calendar client ONCE using the auth object.
// We will reuse this 'calendar' client for every event.
const calendar = google.calendar({ version: 'v3', auth });


// --- Function Definitions ---

/**
 * Adds an event to the Google Calendar using a specific time zone.
 * @param {object} event - The event object with title, location, and a datetime STRING.
 * @param {string} timeZone - The IANA time zone ID (e.g., 'Europe/Berlin').
 */
async function addEventToCalendar(event, timeZone) {
  // 3. Use the pre-configured 'calendar' client. No need to create it again.
  
  // Create start time and a default 1-hour end time from the string
  const startTime = event.datetime; // e.g., "2025-06-25T09:00:00"
  const endTimeDate = new Date(new Date(startTime).getTime() + 60 * 60 * 1000); // Add 1 hour
  // Format to "YYYY-MM-DDTHH:mm:ss" which Google Calendar prefers
  const endTime = endTimeDate.toISOString().split('.')[0];

  const eventResource = {
    summary: event.title,
    location: event.location,
    start: {
      dateTime: startTime,
      timeZone: timeZone,
    },
    end: {
      dateTime: endTime,
      timeZone: timeZone,
    },
    // Optional: Add a reminder for the user
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', 'minutes': 30 }, // 30-minute popup reminder
        { method: 'email', 'minutes': 60 }, // 1-hour email reminder
      ],
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: eventResource,
    });
    console.log('Calendar event created:', res.data.htmlLink);
    return res.data;
  } catch (error) {
    console.error('Error creating calendar event:', error.message);
    // It's good practice to re-throw the error so the calling function knows something went wrong
    throw error;
  }
}

module.exports = { addEventToCalendar };