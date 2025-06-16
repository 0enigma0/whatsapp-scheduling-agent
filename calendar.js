const { google } = require('googleapis');
const credentials = require('./service_account.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendar = google.calendar('v3');

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES
});

async function addEventToCalendar(event) {
  const authClient = await auth.getClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  const eventBody = {
    summary: event.title,
    location: event.location,
    start: {
      dateTime: event.datetime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: new Date(event.datetime.getTime() + 60 * 60 * 1000).toISOString(),
      timeZone: 'UTC'
    }
  };

  return calendar.events.insert({
    auth: authClient,
    calendarId,
    requestBody: eventBody
  });
}

module.exports = { addEventToCalendar };
