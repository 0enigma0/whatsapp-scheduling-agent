const fs = require('fs');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const https = require('https');
const { parseWithGemini } = require('./parser');
const { addEventToCalendar } = require('./calendar');
const { scheduleReminder } = require('./reminder');

dotenv.config();

// ✅ Create service_account.json from environment variable (raw JSON or base64)
if (!fs.existsSync('service_account.json')) {
  if (process.env.SERVICE_ACCOUNT_JSON) {
    console.log('🔽 Writing service_account.json from raw JSON env variable...');
    fs.writeFileSync('service_account.json', process.env.SERVICE_ACCOUNT_JSON, { encoding: 'utf-8' });
    console.log('✅ service_account.json written from raw JSON');
  } else if (process.env.SERVICE_ACCOUNT_JSON_BASE64) {
    console.log('🔽 Decoding service_account.json from base64 env variable...');
    const json = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
    fs.writeFileSync('service_account.json', json, { encoding: 'utf-8' });
    console.log('✅ service_account.json written from base64');
  }
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/whatsapp-webhook', async (req, res) => {
  try {
    console.log('Received webhook request:', req.body);

    const message = req.body.Body;
    const sender = req.body.From;

    console.log(`Processing message: "${message}" from ${sender}`);

    // Use Gemini to parse the event
    const geminiResponse = await parseWithGemini(
      `Extract the event title, datetime, and location from this message: "${message}". Respond in JSON with keys: title, datetime (ISO 8601), location.`
    );
    let event = null;
    try {
      event = JSON.parse(geminiResponse);
      // Optionally, convert datetime to Date object
      if (event && event.datetime) {
        event.datetime = new Date(event.datetime);
      }
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', geminiResponse);
    }

    if (event && event.title && event.datetime) {
      console.log('Event extracted:', event);

      await addEventToCalendar(event);
      console.log('Event added to calendar');

      scheduleReminder(event, sender);
      console.log('Reminder scheduled');

      return res.status(200).json({
        status: 'event_added',
        event: event,
        message: 'Event successfully processed and added to calendar'
      });
    }

    console.log('No event detected in message');
    res.status(200).json({
      status: 'no_event_detected',
      message: 'No event found in the message'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

console.log('Private key preview:');
try {
  let serviceAccountJson;
  if (process.env.SERVICE_ACCOUNT_JSON) {
    serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
  } else if (process.env.SERVICE_ACCOUNT_JSON_BASE64) {
    serviceAccountJson = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
  } else if (fs.existsSync('service_account.json')) {
    serviceAccountJson = fs.readFileSync('service_account.json', 'utf-8');
  }
  
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    console.log(parsed.private_key.split('\n').slice(0, 3).join('\n'));
  } else {
    console.log('No service account found');
  }
} catch (e) {
  console.error('❌ Could not parse service account:', e.message);
}

// Add a simple test endpoint for Postman
app.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp scheduling agent is running',
    timestamp: new Date().toISOString()
  });
});

// Add GET endpoint for the webhook to show usage instructions
app.get('/whatsapp-webhook', (req, res) => {
  res.json({
    message: 'WhatsApp Webhook Endpoint',
    instructions: {
      method: 'POST',
      url: 'http://localhost:3000/whatsapp-webhook',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        Body: 'Your message with event details (e.g., "Meeting tomorrow at 2pm")',
        From: 'Your phone number (e.g., "+1234567890")'
      }
    },
    example_curl: 'curl -X POST http://localhost:3000/whatsapp-webhook -H "Content-Type: application/json" -d \'{"Body":"Meeting tomorrow at 2pm","From":"+1234567890"}\'',
    note: 'Use POST method to actually process events'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/whatsapp-webhook`);
  console.log('=================================');
});
