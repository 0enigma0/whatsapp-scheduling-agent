const axios = require('axios');

async function testWebhook() {
  const testMessage = "doctor appointment on aug 23 at 9am";
  const testPhone = "+1234567890";
  
  const webhookData = {
    Body: testMessage,
    From: testPhone
  };
  
  try {
    console.log('🧪 Testing webhook with message:', testMessage);
    console.log('📞 From phone:', testPhone);
    
    const response = await axios.post('http://localhost:3000/whatsapp-webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook response:', response.status, response.data);
  } catch (error) {
    console.error('❌ Webhook test failed:', error.response?.data || error.message);
  }
}

// Check if axios is available, if not, provide instructions
try {
  require('axios');
  testWebhook();
} catch (error) {
  console.log('❌ Axios not found. To test the webhook, run:');
  console.log('npm install axios');
  console.log('node test-webhook.js');
} 