# SwasthyaSetu - Team Setup Guide

## For Team Members: Setting Up Your Development Environment

### Quick Start (Recommended for Team Development)

**Step 1: Get the MongoDB Connection String from Project Owner**

Ask the project owner to share the MongoDB connection string with you. It looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/swasthyasetu?retryWrites=true&w=majority
```

**Step 2: Set Up Backend**

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   copy .env.example .env
   ```

   Or manually create a file named `.env` in the `backend` folder with this content:
   ```
   MONGODB_URI=<ASK_PROJECT_OWNER_FOR_CONNECTION_STRING>
   JWT_SECRET=<ASK_PROJECT_OWNER_FOR_JWT_SECRET>
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   **Important:** Ask the project owner for the actual MongoDB connection string and JWT secret.

4. **Seed the database (only if database is empty):**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ MongoDB Atlas Connected
   🚀 Server running on port 5000
   ```

**Step 3: Set Up Frontend**

1. **Open a NEW terminal** (keep backend running in the first terminal)

2. **Navigate to project root:**
   ```bash
   cd c:\Users\YourName\Documents\SwasthyaSetu
   ```

3. **Start a local web server** (choose ONE option):

   **Option A: Using Python (if installed):**
   ```bash
   python -m http.server 3000
   ```

   **Option B: Using Node.js http-server:**
   ```bash
   npx http-server -p 3000 -c-1
   ```

   **Option C: Using VS Code Live Server:**
   - Install "Live Server" extension in VS Code
   - Right-click `index.html` → "Open with Live Server"
   - Change port to 3000 in settings if needed

4. **Open browser:**
   ```
   http://localhost:3000
   ```

5. **Test login with demo credentials:**
   - ABHA ID: `12-3456-7890-1234`
   - Password: `patient123`

---

## Common Issues & Solutions

### ❌ "No internet connection" or "Network Error" when logging in

**Cause:** Backend server is not running or frontend can't reach it

**Solution:**
1. Make sure backend is running on port 5000
2. Check if you see `🚀 Server running on port 5000` in backend terminal
3. Test backend directly: Open browser → http://localhost:5000/api/health
4. Should see: `{"success":true,"message":"Server is running"}`

### ❌ "MongoServerError: bad auth"

**Cause:** Wrong MongoDB username or password in `.env`

**Solution:**
1. Ask project owner for correct MongoDB connection string
2. Update `MONGODB_URI` in your `.env` file
3. Restart backend server (Ctrl+C, then `npm start`)

### ❌ "Could not connect to MongoDB"

**Cause:** IP not whitelisted or internet connection issue

**Solution:**
1. Check your internet connection
2. Ask project owner to verify `0.0.0.0/0` is in MongoDB Atlas whitelist
3. Try restarting backend server

### ❌ "Port 5000 is already in use"

**Cause:** Another application is using port 5000

**Solution:**
1. **Option A:** Kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Option B:** Change port in `.env`:
   ```
   PORT=5001
   ```
   Then update frontend API calls to use port 5001

### ❌ "No hospitals found"

**Cause:** Database is empty

**Solution:**
```bash
cd backend
npm run seed
```

---

## Important Notes for Team Development

### ✅ DO:
- Keep your backend server running while developing
- Use the shared MongoDB connection string
- Pull latest code from Git before starting work
- Test login after pulling new changes

### ❌ DON'T:
- Commit `.env` file to Git (it's in `.gitignore`)
- Change the MongoDB connection string without telling the team
- Run `npm run seed` if database already has data (it will duplicate)
- Share your `.env` file publicly (contains sensitive credentials)

---

## Architecture Overview

```
Your PC:
├── Frontend (http://localhost:3000)
│   └── Makes API calls to → Backend
│
├── Backend (http://localhost:5000)
│   └── Connects to → MongoDB Atlas (Cloud)
│
└── MongoDB Atlas (Cloud Database)
    └── Shared by all team members
```

**Key Point:** Each team member runs their own frontend and backend servers locally, but they all connect to the SAME cloud MongoDB database.

---

## Need Help?

1. Check if backend is running: http://localhost:5000/api/health
2. Check browser console for errors (F12 → Console tab)
3. Check backend terminal for error messages
4. Contact project owner with screenshot of error

---

## Quick Reference Commands

```bash
# Start Backend
cd backend
npm start

# Start Frontend (in new terminal)
cd ..
python -m http.server 3000

# Seed Database (only once)
cd backend
npm run seed

# Check if backend is running
curl http://localhost:5000/api/health
```
