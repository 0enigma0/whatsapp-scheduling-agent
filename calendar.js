const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Create a function that initializes the Google Calendar client
function createCalendarClient() {
  const raw = fs.readFileSync('./service_account.json', 'utf-8');
  const credentials = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * ADAPTED AND CORRECTED VERSION
 * Adds an event to the Google Calendar using a specific time zone.
 * @param {object} event - The event object with title, location, and a datetime STRING.
 * @param {string} timeZone - The IANA time zone ID (e.g., 'Europe/Berlin').
 */
async function addEventToCalendar(event, timeZone) {
  const calendar = google.calendar({ version: 'v3', auth }); // your auth object

  // Create start and end time from the string
  const startTime = event.datetime; // e.g., "2025-06-25T09:00:00"
  // Let's assume a 1-hour duration for the event
  const endTimeDate = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
  const endTime = endTimeDate.toISOString().split('.')[0]; // Format to "YYYY-MM-DDTHH:mm:ss"

  const eventResource = {
    summary: event.title,
    location: event.location,
    start: {
      dateTime: startTime, // Pass the RAW datetime string
      timeZone: timeZone,  // TELL GOOGLE THE TIME ZONE
    },
    end: {
      dateTime: endTime,   // Pass the RAW datetime string for the end time
      timeZone: timeZone,  // TELL GOOGLE THE TIME ZONE
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary', // or your specific calendar ID
      resource: eventResource,
    });
    console.log('Calendar event created: ', res.data.htmlLink);
    return res.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

module.exports = { addEventToCalendar };