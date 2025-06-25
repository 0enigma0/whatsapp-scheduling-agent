# Debugging Guide for WhatsApp Scheduling Agent

## Issue: Silent Failure - No Logs or Calendar Events

### Step 1: Check Environment Variables

Make sure these environment variables are set in your `.env` file:

```bash
# Required for Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Required for Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id_or_primary
SERVICE_ACCOUNT_JSON=your_service_account_json_here
# OR
SERVICE_ACCOUNT_JSON_BASE64=base64_encoded_service_account_json

# Optional for SMS reminders
TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_NUMBER=your_twilio_phone_number
```

### Step 2: Test the Webhook Locally

1. Start your server:
   ```bash
   npm start
   ```

2. Install axios if not already installed:
   ```bash
   npm install axios
   ```

3. Test the webhook:
   ```bash
   node test-webhook.js
   ```

### Step 3: Check Logs

The enhanced logging will now show:
- 🔔 Webhook received with full request body
- 📝 Message processing details
- 🤖 Gemini API calls
- 📊 Parsed event data
- 📅 Calendar operations
- ⏰ Reminder scheduling
- ❌ Any errors with detailed information

### Step 4: Common Issues and Solutions

#### Issue 1: Rate Limiter Blocking Requests
- **Symptom**: No logs at all
- **Solution**: Fixed - rate limiter now uses correct Twilio field (`From` instead of `WaId`)

#### Issue 2: Missing Environment Variables
- **Symptom**: Error about missing API keys
- **Solution**: Check your `.env` file and ensure all required variables are set

#### Issue 3: Gemini API Issues
- **Symptom**: Error in Gemini API call
- **Solution**: Check your `GEMINI_API_KEY` and ensure it's valid

#### Issue 4: Google Calendar Issues
- **Symptom**: Event parsed but calendar creation fails
- **Solution**: Check your service account JSON and calendar permissions

#### Issue 5: Date Parsing Issues
- **Symptom**: Event parsed but datetime is incorrect
- **Solution**: The prompt now handles date parsing more robustly

### Step 5: Manual Testing

You can also test individual components:

1. **Test Gemini API directly**:
   ```javascript
   const { parseWithGemini } = require('./parser');
   const result = await parseWithGemini('Your test prompt here');
   console.log(result);
   ```

2. **Test Calendar API directly**:
   ```javascript
   const { addEventToCalendar } = require('./calendar');
   const testEvent = {
     title: "Test Event",
     datetime: "2024-08-23T09:00:00",
     location: null,
     recurrence: null
   };
   await addEventToCalendar(testEvent, 'Europe/Berlin');
   ```

### Step 6: Check Render Logs

If deployed on Render:
1. Go to your Render dashboard
2. Click on your service
3. Go to the "Logs" tab
4. Look for the emoji-prefixed log messages

### Expected Flow

When working correctly, you should see:
1. 🔔 Webhook received
2. 📝 Processing message
3. 🤖 Gemini API call
4. 📊 Parsed event data
5. 📅 Calendar event created
6. ⏰ Reminder scheduled
7. ✅ Success response

If any step fails, you'll see ❌ error messages with details. 