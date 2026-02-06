# Gemini AI Chatbot Integration Guide

## Overview
Your SwasthyaSetu chatbot has been upgraded with Google's Gemini AI! The chatbot now provides intelligent, context-aware responses to user questions about healthcare, ABHA ID, hospital bookings, and more.

## Features
✅ **AI-Powered Responses** - Natural language understanding using Gemini Pro
✅ **Customizable Behavior** - Define bot personality and guidelines
✅ **Conversation Memory** - Maintains context across messages
✅ **Typing Indicators** - Shows when AI is thinking
✅ **Free-form Input** - Users can type any question
✅ **Quick Action Buttons** - Pre-defined FAQs for common questions
✅ **Bilingual Support** - Can respond in English and Hindi

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### Step 2: Configure the API Key

1. Open the file: `js/config/gemini-config.js`
2. Find this line:
   ```javascript
   apiKey: 'YOUR_GEMINI_API_KEY_HERE',
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   apiKey: 'AIzaSyC...your-actual-key-here',
   ```
4. Save the file

### Step 3: Test the Chatbot

1. Open your website in a browser
2. Click the chat button (green circle in bottom-right)
3. Try asking questions like:
   - "How do I book an appointment?"
   - "What is ABHA ID?"
   - "Find hospitals near me"
   - "मुझे डॉक्टर से कैसे मिलें?" (Hindi)

## Customizing Bot Behavior

### Modify the System Prompt

The bot's personality and behavior are defined in `js/config/gemini-config.js` under `systemPrompt`. You can customize:

**Example modifications:**

```javascript
systemPrompt: `You are "Swasthya Assistant", a helpful AI for SwasthyaSetu.

Your role:
- Help users with healthcare platform questions
- Be warm, professional, and empathetic
- Keep responses under 3 sentences
- Never provide medical diagnosis
- Speak in simple, clear language

For emergencies, immediately suggest calling 108.
For medical advice, recommend booking a doctor consultation.`,
```

### Adjust AI Parameters

In `gemini-config.js`, you can tune these settings:

```javascript
generationConfig: {
    temperature: 0.7,  // 0.0 = predictable, 1.0 = creative
    topK: 40,          // Diversity of word choices
    topP: 0.95,        // Cumulative probability threshold
    maxOutputTokens: 1024,  // Max response length
}
```

**Recommendations:**
- **Customer Support**: `temperature: 0.3` (more consistent)
- **Creative Responses**: `temperature: 0.9` (more varied)
- **Short Answers**: `maxOutputTokens: 256`
- **Detailed Answers**: `maxOutputTokens: 1024`

## File Structure

```
SwasthyaSetu/
├── js/
│   ├── config/
│   │   └── gemini-config.js      # ⭐ API key & bot behavior
│   └── components/
│       └── chatbot.js             # ⭐ Enhanced chatbot with AI
├── css/
│   └── components/
│       └── chatbot.css            # Updated styles
└── index.html                     # Includes config script
```

## Important Notes

### API Key Security
⚠️ **IMPORTANT**: Your API key is currently client-side (visible in browser). For production:

1. **Option 1**: Use environment variables and a backend proxy
2. **Option 2**: Implement API key restrictions in Google Cloud Console:
   - Restrict to your domain only
   - Set usage quotas
   - Monitor usage regularly

### Free Tier Limits
- Gemini API has a free tier with rate limits
- Check current limits at [Google AI Pricing](https://ai.google.dev/pricing)
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com)

### Error Handling
If users see "AI features not configured":
- Check that API key is correctly set
- Verify API key is active in Google Cloud Console
- Check browser console for error messages

## Troubleshooting

### Chatbot shows "AI features not configured"
- Ensure API key is set in `gemini-config.js`
- Key should not be `'YOUR_GEMINI_API_KEY_HERE'`

### No response from AI
- Check browser console for errors
- Verify API key is valid
- Check if you've exceeded free tier limits

### Slow responses
- Normal for first request (cold start)
- Reduce `maxOutputTokens` for faster responses
- Consider caching common questions

## Example Conversations

**User**: "How do I register for ABHA?"
**Bot**: "You can register for ABHA ID by clicking 'Create New ABHA Number' on our login page. You'll need your Aadhaar or mobile number for verification. The process takes just 2-3 minutes! Would you like me to guide you through the steps?"

**User**: "मुझे बुखार है क्या करूं?"
**Bot**: "मैं आपको चिकित्सा सलाह नहीं दे सकता, लेकिन आप हमारे प्लेटफॉर्म पर डॉक्टर से टेलीमेडिसिन परामर्श बुक कर सकते हैं। अगर यह गंभीर है, तो कृपया 108 पर कॉल करें या Emergency Access बटन का उपयोग करें।"

## Support

For issues or questions:
- Email: swasthyasetu.helpdesk@gmail.com
- WhatsApp: +91-123-456-7890

---

**Created**: February 2026
**Version**: 1.0
**AI Model**: Google Gemini Pro
