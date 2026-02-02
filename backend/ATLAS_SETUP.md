# SwasthyaSetu Backend - MongoDB Atlas Setup

## Atlas Configuration Steps:

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/atlas
- Sign up for a free account
- Create a new project named "SwasthyaSetu"

### 2. Create Cluster
- Click "Build a Database"
- Choose "FREE" tier (M0 Sandbox)
- Select your preferred cloud provider and region
- Name your cluster (e.g., "Cluster0")

### 3. Database Access
- Go to "Database Access" in left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Username: `swasthyasetu_user`
- Generate a secure password
- Database User Privileges: "Read and write to any database"

### 4. Network Access
- Go to "Network Access" in left sidebar
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
- Or add your specific IP address for production

### 5. Get Connection String
- Go to "Database" in left sidebar
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Node.js" and version "4.1 or later"
- Copy the connection string

### 6. Update Environment Variables
Replace the placeholders in your `.env` file:

```env
MONGODB_URI=mongodb+srv://swasthyasetu_user:<password>@cluster0.xxxxx.mongodb.net/swasthyasetu?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 7. Test Connection
Run the backend server:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected: cluster0-shard-00-02.xxxxx.mongodb.net
📊 Database: swasthyasetu
```

## Security Notes:
- Never commit your `.env` file
- Use strong passwords for database users
- Restrict IP access in production
- Rotate JWT secrets regularly
- Enable MongoDB Atlas monitoring
