# 🔧 Chatbot Troubleshooting Guide

## ✅ Quick Fix Applied

I've fixed the chatbot initialization issue on all pages. Here's what was changed:

### **Problem:**
- Scripts were loading with `defer` attribute
- Chatbot was trying to initialize before scripts fully loaded
- Race condition causing chatbot to not appear

### **Solution:**
- Removed `defer` from script tags
- Added proper initialization with timeout
- Added error checking and console logging

---

## 🧪 How to Test

### **Option 1: Use Test Page**
1. Open: `test-chatbot.html` in your browser
2. You should see:
   - ✅ "Chatbot loaded successfully!" message
   - Green chat button in bottom-right corner
3. Click the button to test

### **Option 2: Test on Patient Pages**
1. Open any patient page:
   - `pages/dashboard.html`
   - `pages/hospitals.html`
   - `pages/appointments.html`
2. Look for green chat button (bottom-right)
3. Open browser console (F12) - you should see:
   ```
   Chatbot initialized successfully
   ```

---

## 🔍 Troubleshooting Steps

### **Issue 1: Chatbot Button Not Visible**

#### Check 1: Browser Console
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Look for errors

**Expected Output:**
```
Chatbot initialized successfully
Chatbot context initialized
```

**If you see errors:**
- `Chatbot class not found` → Scripts not loading
- `Cannot read property of undefined` → Missing dependency
- `404 Not Found` → File path issue

#### Check 2: Network Tab
1. In Developer Tools, go to "Network" tab
2. Refresh the page (F5)
3. Check if these files loaded successfully:
   - `gemini-config.js` ✅
   - `chatbot-context.js` ✅
   - `chatbot.js` ✅
   - `chatbot.css` ✅

**If files show 404:**
- Check file paths are correct
- Verify files exist in the directories

#### Check 3: Elements Tab
1. In Developer Tools, go to "Elements" tab
2. Press `Ctrl+F` and search for: `chatbot-container`
3. You should see the chatbot HTML structure

**If not found:**
- Chatbot didn't initialize
- Check console for errors

---

### **Issue 2: Chatbot Appears But Doesn't Respond**

#### Check API Key
1. Open: `js/config/gemini-config.js`
2. Verify line 9 has your actual API key:
   ```javascript
   apiKey: 'AIzaSyADjvknSiVO5hSfsevGj4noi5VKKVOu0H0',
   ```
3. Should NOT be: `'YOUR_GEMINI_API_KEY_HERE'`

#### Check API Key Status
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Verify it's:
   - ✅ Enabled
   - ✅ Not expired
   - ✅ Has Gemini API access

#### Check Network Requests
1. Open Developer Tools → Network tab
2. Type a message in chatbot
3. Look for request to: `generativelanguage.googleapis.com`

**If request fails:**
- Check API key is valid
- Check internet connection
- Check for CORS errors

---

### **Issue 3: Chatbot Shows "AI features not configured"**

This means the API key check failed.

**Fix:**
1. Open `js/config/gemini-config.js`
2. Replace `YOUR_GEMINI_API_KEY_HERE` with actual key
3. Save file
4. Hard refresh browser (`Ctrl+Shift+R`)

---

### **Issue 4: Scripts Not Loading (404 Errors)**

#### For Patient Pages (`pages/*.html`):
Scripts should use `../js/` path:
```html
<script src="../js/config/gemini-config.js"></script>
<script src="../js/services/chatbot-context.js"></script>
<script src="../js/components/chatbot.js"></script>
```

#### For Index Page (`index.html`):
Scripts should use `js/` path:
```html
<script src="js/config/gemini-config.js"></script>
<script src="js/services/chatbot-context.js"></script>
<script src="js/components/chatbot.js"></script>
```

---

## 📁 File Structure Verification

Ensure these files exist:

```
SwasthyaSetu/
├── index.html ✅
├── test-chatbot.html ✅ (NEW - for testing)
├── css/
│   └── components/
│       └── chatbot.css ✅
├── js/
│   ├── config/
│   │   └── gemini-config.js ✅ (with your API key)
│   ├── services/
│   │   └── chatbot-context.js ✅
│   ├── components/
│   │   └── chatbot.js ✅
│   └── main.js ✅
└── pages/
    ├── dashboard.html ✅
    ├── hospitals.html ✅
    ├── appointments.html ✅
    └── ... (other pages) ✅
```

---

## 🎯 Manual Verification Checklist

### **Step 1: Check Files Exist**
```powershell
# Run in PowerShell from project root
Test-Path "js/config/gemini-config.js"
Test-Path "js/services/chatbot-context.js"
Test-Path "js/components/chatbot.js"
Test-Path "css/components/chatbot.css"
```

All should return `True`

### **Step 2: Check API Key**
```powershell
# Check if API key is set
Select-String -Path "js/config/gemini-config.js" -Pattern "AIzaSy"
```

Should show your API key (starts with `AIzaSy`)

### **Step 3: Check Script Tags**
```powershell
# Check dashboard has chatbot scripts
Select-String -Path "pages/dashboard.html" -Pattern "chatbot.js"
```

Should show the script tag

---

## 🚀 Quick Test Commands

### **Test 1: Open Test Page**
```powershell
# Open test page in default browser
Start-Process "test-chatbot.html"
```

### **Test 2: Open Dashboard**
```powershell
# Open dashboard page
Start-Process "pages/dashboard.html"
```

### **Test 3: Check Console Logs**
1. Open page in browser
2. Press `F12`
3. Look for: `"Chatbot initialized successfully"`

---

## 🔧 Common Fixes

### **Fix 1: Hard Refresh**
Sometimes browser cache causes issues:
1. Press `Ctrl+Shift+R` (Windows)
2. Or `Cmd+Shift+R` (Mac)
3. This forces browser to reload all files

### **Fix 2: Clear Browser Cache**
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload page

### **Fix 3: Try Different Browser**
- Chrome
- Edge
- Firefox

### **Fix 4: Check File Permissions**
Ensure files are readable:
```powershell
# Check file permissions
Get-Acl "js/components/chatbot.js" | Format-List
```

---

## 📞 Still Not Working?

### **Collect Debug Information:**

1. **Browser Console Output:**
   - Press F12
   - Copy all errors from Console tab

2. **Network Tab:**
   - Check which files failed to load
   - Screenshot the Network tab

3. **File Paths:**
   - Verify all file paths are correct
   - Check for typos

4. **API Key Status:**
   - Verify in Google Cloud Console
   - Check quota limits

---

## ✅ Success Indicators

You'll know it's working when you see:

1. ✅ **Green chat button** in bottom-right corner
2. ✅ **Console log:** "Chatbot initialized successfully"
3. ✅ **Console log:** "Chatbot context initialized"
4. ✅ **No 404 errors** in Network tab
5. ✅ **Chatbot opens** when clicking button
6. ✅ **AI responds** to your messages

---

## 🎓 Testing Scenarios

### **Test 1: Basic Functionality**
1. Open `test-chatbot.html`
2. Click chat button
3. Type: "Hello"
4. Should get AI response

### **Test 2: Context Awareness**
1. Login to patient dashboard
2. Open chatbot
3. Type: "What's my name?"
4. Should know your name (if logged in)

### **Test 3: Hospital Search**
1. Open chatbot
2. Type: "Find cardiology hospitals"
3. Should list hospitals with cardiology

### **Test 4: Emergency**
1. Open chatbot
2. Type: "Emergency chest pain"
3. Should show emergency response with 108

---

## 📊 Expected Behavior

### **On Homepage (index.html):**
- ✅ Chatbot button visible
- ✅ Works for guest users
- ✅ General information only

### **On Patient Pages (after login):**
- ✅ Chatbot button visible
- ✅ Knows patient name
- ✅ Shows appointments
- ✅ Access to hospital data

---

## 🔐 Security Note

Your API key is visible in the browser. For production:

1. **Restrict API Key:**
   - Go to Google Cloud Console
   - Add HTTP referrer restrictions
   - Limit to your domain

2. **Set Quotas:**
   - Limit requests per day
   - Set up billing alerts

3. **Monitor Usage:**
   - Check API usage regularly
   - Watch for unusual activity

---

**Last Updated:** February 7, 2026  
**Status:** Fixed and Ready to Test  
**Next Step:** Open `test-chatbot.html` in your browser!
