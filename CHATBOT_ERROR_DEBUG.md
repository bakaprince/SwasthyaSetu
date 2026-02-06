# 🔍 Chatbot Error Diagnostic Guide

## ✅ Good News!
Your chatbot **IS working** - the UI appears correctly! The error you're seeing is from the **Gemini API call**.

## 🐛 Current Error
```
"Sorry, I encountered an error. Please try again or contact support."
```

This means the chatbot is trying to call the Gemini API but something is failing.

---

## 🔧 How to Debug

### **Step 1: Open Browser Console**
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Type a message in the chatbot
4. Look for detailed error messages

### **Step 2: Check What the Console Shows**

The console will now show detailed information:

#### **Scenario A: API Key Error**
```
API Response Error: 400 Bad Request
API_KEY_INVALID
```
**Fix:** Your API key is incorrect or invalid
- Go to: https://makersuite.google.com/app/apikey
- Generate a new API key
- Replace in `js/config/gemini-config.js`

#### **Scenario B: Network Error**
```
Failed to fetch
Network request failed
```
**Fix:** Internet connection or CORS issue
- Check your internet connection
- Try accessing: https://generativelanguage.googleapis.com
- Check if firewall is blocking the request

#### **Scenario C: Quota Exceeded**
```
429 Resource Exhausted
RATE_LIMIT_EXCEEDED
```
**Fix:** You've exceeded the free tier limit
- Wait for quota to reset (usually 24 hours)
- Or upgrade your Google Cloud account

#### **Scenario D: API Not Enabled**
```
403 Forbidden
API_KEY_INVALID or SERVICE_DISABLED
```
**Fix:** Gemini API not enabled for your project
- Go to: https://console.cloud.google.com/apis/library
- Search for "Generative Language API"
- Click "Enable"

---

## 🎯 Quick Fixes

### **Fix 1: Verify API Key**

1. Open `js/config/gemini-config.js`
2. Check line 9:
   ```javascript
   apiKey: 'AIzaSyADjvknSiVO5hSfsevGj4noi5VKKVOu0H0',
   ```

3. Verify this key at: https://console.cloud.google.com/apis/credentials

4. Make sure:
   - ✅ Key exists
   - ✅ Key is enabled
   - ✅ "Generative Language API" is enabled
   - ✅ No restrictions blocking localhost

### **Fix 2: Test API Key Manually**

Open browser console and run:

```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyADjvknSiVO5hSfsevGj4noi5VKKVOu0H0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{
            parts: [{ text: 'Hello' }]
        }]
    })
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

**Expected Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{ "text": "Hello! How can I help you today?" }]
    }
  }]
}
```

**If you get an error**, the API key or API access is the issue.

---

## 📊 Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 400 | Bad Request | Check API key format |
| 401 | Unauthorized | API key is invalid |
| 403 | Forbidden | API not enabled or restricted |
| 429 | Too Many Requests | Quota exceeded, wait or upgrade |
| 500 | Server Error | Google's issue, try again later |

---

## 🔐 API Key Checklist

Go to: https://console.cloud.google.com/apis/credentials

### **Check 1: API Key Exists**
- [ ] API key is listed
- [ ] API key is not deleted
- [ ] API key shows "Active" status

### **Check 2: API is Enabled**
Go to: https://console.cloud.google.com/apis/library

- [ ] Search for "Generative Language API"
- [ ] Status shows "Enabled"
- [ ] If not, click "Enable"

### **Check 3: No Restrictions**
Click on your API key → Check restrictions:

- [ ] **Application restrictions:** None (or HTTP referrers with `localhost/*`)
- [ ] **API restrictions:** None (or includes "Generative Language API")

### **Check 4: Billing**
- [ ] Billing account is set up (even for free tier)
- [ ] No payment issues
- [ ] Quota not exceeded

---

## 🧪 Test Commands

### **Test 1: Check if API Key is Set**
Open browser console:
```javascript
console.log('API Key:', window.GeminiConfig?.apiKey);
```

Should show: `AIzaSy...` (your key)

### **Test 2: Check if Chatbot Loaded**
```javascript
console.log('Chatbot:', typeof Chatbot);
console.log('Instance:', window.chatbotInstance);
```

Should show: `function` and the chatbot instance

### **Test 3: Manual API Call**
Use the fetch command from "Fix 2" above

---

## 📝 What to Share for Help

If still not working, share these details:

1. **Console Error:**
   - Copy the full error from console
   - Include the "Error details" object

2. **API Response:**
   - What does the manual API test show?
   - Any specific error codes?

3. **API Key Status:**
   - Is it enabled in Google Cloud Console?
   - Any restrictions set?

4. **Network Tab:**
   - Press F12 → Network tab
   - Filter by "generativelanguage"
   - Screenshot the failed request

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Type "hi" in chatbot
2. ✅ See typing indicator (3 dots)
3. ✅ Get AI response (not error message)
4. ✅ Console shows: `Gemini API Response: {candidates: ...}`

---

## 🚀 Most Likely Issues

Based on the error, it's probably one of these:

### **90% Chance: API Key Issue**
- API key is invalid
- API key is restricted
- Generative Language API not enabled

### **5% Chance: Network Issue**
- Firewall blocking request
- No internet connection
- CORS policy blocking

### **5% Chance: Quota Issue**
- Free tier limit exceeded
- Billing not set up

---

## 🔧 Recommended Action

1. **Open browser console** (F12)
2. **Type a message** in chatbot
3. **Look for this line** in console:
   ```
   API Response Error: {status: XXX, ...}
   ```
4. **Note the status code**
5. **Follow the fix** for that status code above

---

**The chatbot UI is working perfectly! We just need to fix the API connection.** 🎯

Check the console and let me know what error code you see!
