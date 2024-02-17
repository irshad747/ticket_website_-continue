const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3000; 
app.use(express.json());
app.use(cors()); 

// Endpoint for  Vue app to call
app.post('/send-to-gchat', async (req, res) => {
  const { message } = req.body;
  const webhookUrl = 'https://chat.googleapis.com/v1/spaces/AAAAC69pMD0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=A_xonZ8wqT0m3qlIY4yG1oYwU7w2kgu8Ahq2sbY8vTY';

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ text: message }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Message sent to Google Chat.' });
    } else {
      console.error('Failed to send message to Google Chat:', response.statusText);
      return res.status(500).json({ success: false, message: 'Failed to send message to Google Chat.' });
    }
  } catch (error) {
    console.error('Error sending message to Google Chat:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while sending message to Google Chat.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
