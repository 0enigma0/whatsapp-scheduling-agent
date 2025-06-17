const dotenv = require('dotenv');   // ✅ Import first
dotenv.config();                    // ✅ Then configure

const fs = require('fs');
if (!fs.existsSync('service_account.json') && process.env.SERVICE_ACCOUNT_JSON_BASE64) {
  const json = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
  fs.writeFileSync('service_account.json', json);
}

const express = require('express');
const bodyParser = require('body-parser');
const { extractEvent } = require('./parser');
const { addEventToCalendar } = require('./calendar');
const { scheduleReminder } = require('./reminder');

const app = express();

// ✅ Add both middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/whatsapp-webhook', async (req, res) => {
  try {
    console.log('Received webhook request:', req.body);
    
    const message = req.body.Body;
    const sender = req.body.From;

    console.log(`Processing message: "${message}" from ${sender}`);

    const event = extractEvent(message);
    if (event) {
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

// ✅ FIX: Use environment PORT for cloud deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/whatsapp-webhook`);
  console.log('=================================');
});
