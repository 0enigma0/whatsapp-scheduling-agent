const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let credentials;
try {
  const raw = fs.readFileSync('./service_account.json');
  credentials = JSON.parse(raw);
} catch (e) {
  console.error('❌ Could not load service_account.json:', e.message);
  throw e; // Let it crash clearly if the file isn’t created
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES
});

const calendar = google.calendar({ version: 'v3', auth });

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

async function addEventToCalendar(event) {
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
