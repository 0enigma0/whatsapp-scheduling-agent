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

// This function is now safe to call *after* the service_account.json file is ready
async function addEventToCalendar(event) {
  const calendar = createCalendarClient();

  const eventBody = {
    summary: event.title,
    start: {
      dateTime: event.datetime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: new Date(event.datetime.getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC'
    },
    location: event.location
  };

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: eventBody
  });

  return response.data;
}

module.exports = { addEventToCalendar };
