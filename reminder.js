const schedule = require('node-schedule');
require('dotenv').config();

// Make Twilio optional - only initialize if credentials are available
let client = null;
let twilioEnabled = false;

if (process.env.TWILIO_SID && process.env.TWILIO_AUTH && process.env.TWILIO_NUMBER) {
  try {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    twilioEnabled = true;
    console.log('Twilio initialized successfully');
  } catch (error) {
    console.log('Twilio initialization failed:', error.message);
  }
} else {
  console.log('Twilio credentials not found - SMS reminders disabled');
}

function scheduleReminder(event, number, timeZone) {
  console.log('⏰ Scheduling reminder for event:', event);
  console.log('📞 Phone number:', number);
  console.log('🌍 Timezone:', timeZone);
  
  // Handle both Date objects and datetime strings
  const eventDateTime = event.datetime instanceof Date ? event.datetime : new Date(event.datetime);
  const reminderTime = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000);

  console.log('📅 Event time:', eventDateTime);
  console.log('⏰ Reminder time:', reminderTime);

  schedule.scheduleJob(reminderTime, () => {
    if (twilioEnabled && client) {
      try {
        client.messages.create({
          body: `Reminder: ${event.title} is tomorrow at ${eventDateTime.toLocaleTimeString()}`,
          from: process.env.TWILIO_NUMBER,
          to: number
        });
        console.log(`✅ SMS reminder sent for event: ${event.title}`);
      } catch (error) {
        console.error('❌ Failed to send SMS reminder:', error.message);
      }
    } else {
      console.log(`📝 Reminder scheduled (SMS disabled): ${event.title} is tomorrow at ${eventDateTime.toLocaleTimeString()}`);
    }
  });
  
  console.log('✅ Reminder scheduled successfully');
}

module.exports = { scheduleReminder };
