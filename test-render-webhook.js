const axios = require('axios');

async function testRenderWebhook() {
  // Replace this with your actual Render URL
  const RENDER_URL = process.env.RENDER_URL || 'https://your-app-name.onrender.com';
  
  const testMessage = "doctor appointment on aug 23 at 9am";
  const testPhone = "+1234567890";
  
  const webhookData = {
    Body: testMessage,
    From: testPhone
  };
  
  try {
    console.log('🧪 Testing Render webhook with message:', testMessage);
    console.log('📞 From phone:', testPhone);
    console.log('🌐 URL:', `${RENDER_URL}/whatsapp-webhook`);
    
    const response = await axios.post(`${RENDER_URL}/whatsapp-webhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Webhook response:', response.status, response.data);
  } catch (error) {
    console.error('❌ Webhook test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Check if the URL is correct and the server is running.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check if RENDER_URL is set
if (!process.env.RENDER_URL) {
  console.log('❌ RENDER_URL environment variable not set.');
  console.log('Please set it to your Render app URL:');
  console.log('export RENDER_URL=https://your-app-name.onrender.com');
  console.log('');
  console.log('Or run: RENDER_URL=https://your-app-name.onrender.com node test-render-webhook.js');
} else {
  testRenderWebhook();
} 