# Twilio Webhook Verification Guide

## Issue: No Webhook Logs

Since your server is running but no webhook logs appear, the issue is likely that Twilio is not sending webhooks to your server.

## Step 1: Check Twilio Webhook URL

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** → **Settings** → **WhatsApp Sandbox**
3. Check the **Webhook URL** field
4. It should be: `https://your-app-name.onrender.com/whatsapp-webhook`

## Step 2: Verify Webhook URL is Correct

Replace `your-app-name` with your actual Render app name. The URL should look like:
```
https://whatsapp-scheduling-agent-abc123.onrender.com/whatsapp-webhook
```

## Step 3: Test Your Webhook URL

1. Get your Render app URL from your Render dashboard
2. Run the test script:
   ```bash
   RENDER_URL=https://your-actual-render-url.onrender.com node test-render-webhook.js
   ```

## Step 4: Check Twilio Logs

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Monitor** → **Logs** → **Error Logs**
3. Look for any webhook delivery errors

## Step 5: Common Issues

### Issue 1: Wrong Webhook URL
- **Symptom**: No webhook logs
- **Solution**: Update the webhook URL in Twilio console

### Issue 2: HTTPS Required
- **Symptom**: Webhook delivery failures
- **Solution**: Make sure you're using `https://` not `http://`

### Issue 3: Server Not Responding
- **Symptom**: 5xx errors in Twilio logs
- **Solution**: Check if your Render app is running

### Issue 4: Rate Limiting
- **Symptom**: 429 errors
- **Solution**: Check your rate limiter settings

## Step 6: Manual Webhook Test

You can also test your webhook manually using curl:

```bash
curl -X POST https://your-app-name.onrender.com/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "Body": "doctor appointment on aug 23 at 9am",
    "From": "+1234567890"
  }'
```

## Step 7: Check Render Logs

1. Go to your Render dashboard
2. Click on your app
3. Go to the **Logs** tab
4. Look for any errors or webhook requests

## Expected Behavior

When working correctly:
1. You send a WhatsApp message
2. Twilio receives the message
3. Twilio sends a webhook to your Render app
4. Your app logs show: 🔔 Received webhook request
5. Your app processes the message and adds to calendar
6. Your app responds to Twilio

If step 3 is missing, the webhook URL is incorrect. 