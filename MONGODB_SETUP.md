# MongoDB Setup Guide

Complete guide to setup and use MongoDB for the Collaborative Code Editor.

---

## Overview

MongoDB is a NoSQL database where your user data, rooms, documents, and activity logs are stored.

**Two Options:**
1. **Local MongoDB** - Install on your computer
2. **MongoDB Atlas** - Free cloud database (recommended for beginners)

---

## Option 1: Local MongoDB Setup

### Windows Installation

#### Method A: Direct Download
1. Go to https://www.mongodb.com/try/download/community
2. Select OS: **Windows**
3. Download the `.msi` installer
4. Run installer and follow instructions
5. Choose "Install MongoDB as a Service"
6. Default installation path: `C:\Program Files\MongoDB\Server\[version]`

#### Method B: Chocolatey (Windows Package Manager)
```bash
# If you have Chocolatey installed:
choco install mongodb-community
```

#### Method C: Windows Subsystem for Linux (WSL)
```bash
# In WSL terminal:
curl https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB:
sudo systemctl start mongod
```

### Starting MongoDB

**Method 1: Windows Service (Automatic)**
```bash
# MongoDB should start automatically after installation
# Verify:
tasklist | find "mongod"
```

**Method 2: Manual Start**
```bash
# Open Command Prompt as Administrator:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\7.0\etc\mongod.conf"

# Or if in installation directory:
mongod --dbpath "C:\data\db"
```

**Method 3: PowerShell**
```powershell
# Start MongoDB service:
Start-Service MongoDB

# Check status:
Get-Service MongoDB

# Stop MongoDB:
Stop-Service MongoDB
```

### Verify Local MongoDB is Running

**Open Terminal/PowerShell and type:**
```bash
mongosh
```

**Expected Output:**
```
Current Mongosh Log ID: 507f1f77bcf86cd799439011
Connecting to:    mongodb://127.0.0.1:27017/?directConnection=true
MongoServerSelectionError: Error connecting to MongoDB:
  Error connecting to 127.0.0.1:27017
    reason: connect ECONNREFUSED 127.0.0.1:27017
```

If you see connection error, MongoDB is not running. Start it first!

**Success Response:**
```
test>
```

### Basic MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Show all databases
show dbs

# Switch to or create database
use collaborative-editor

# Show all collections
show collections

# View all documents in a collection
db.users.find()

# View first 5 documents
db.users.find().limit(5)

# View specific user
db.users.findOne({ email: "user@example.com" })

# Count documents
db.users.countDocuments()

# Delete a document
db.users.deleteOne({ _id: ObjectId("...") })

# Delete all documents (cleanup)
db.users.deleteMany({})

# Exit MongoDB shell
exit
```

### Backup & Restore

**Backup Database:**
```bash
mongodump --db collaborative-editor --out ./backup
```

**Restore Database:**
```bash
mongorestore --db collaborative-editor ./backup/collaborative-editor
```

---

## Option 2: MongoDB Atlas Setup (Cloud)

### Create Free Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Atlas"** or **"Register"**
3. Create account with email/password
4. Verify email

### Create First Cluster

1. After login, you'll see **"Create a Database"**
2. Choose **"M0"** tier (Free)
3. Select **Provider**: AWS/Google/Azure (all free, pick any)
4. Select **Region**: Choose closest to you
5. Click **"Create"** (takes 1-2 minutes)

### Configure Network Access

1. On left menu: Click **"Network Access"**
2. Click **"Add IP Address"**
3. Choose:
   - **Option A:** "Allow Access from Anywhere" (easy for testing)
   - **Option B:** Add your IP specifically

### Create Database User

1. On left menu: Click **"Database Access"**
2. Click **"Add New Database User"**
3. Enter username: `admin` (or your choice)
4. Enter password: (generate strong password)
5. Click **"Add User"**

**Save these credentials!** You'll need them for connection string.

### Get Connection String

1. On left menu: Click **"Databases"**
2. Click **"Connect"**
3. Choose **"Drivers"**
4. Select **"Node.js"** and version **"4.1 or later"**
5. Copy connection string:
```
mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

### Update Backend .env

Replace `MONGODB_URI` in `backend/.env`:

```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/collaborative-editor?retryWrites=true&w=majority
```

**Replace:**
- `admin` - Your database username
- `YOUR_PASSWORD` - Your database password
- `cluster0.xxxxx` - Your cluster connection string
- `collaborative-editor` - Database name

### Test Connection

```bash
mongosh "mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/test"
```

**Success:**
```
collaborative-editor>
```

---

## Database Structure

### Collections Created Automatically

When backend starts, these collections are created:

1. **users** - User accounts
2. **rooms** - Collaboration rooms
3. **roommembers** - Room membership
4. **codedocuments** - Code documents
5. **activitylogs** - Activity history

### View Your Data

**Local MongoDB with Compass:**
1. Download: https://www.mongodb.com/products/compass
2. Connect to `mongodb://localhost:27017`
3. Database: `collaborative-editor`
4. Browse collections visually

**MongoDB Atlas with Compass:**
1. Open Compass
2. Click **"New Connection"**
3. Paste connection string from Atlas
4. Click **"Connect"**

**Command Line:**
```bash
mongosh collaborative-editor

# View users
db.users.find()

# View rooms
db.rooms.find()

# View documents
db.codedocuments.find()

# View activity logs
db.activitylogs.find()
```

---

## Sample Data Structure

### User Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2b$10$encrypted_password_hash",
  "avatar": null,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Room Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Project Alpha",
  "description": "Team collaboration room",
  "owner": ObjectId("507f1f77bcf86cd799439011"),
  "members": [ObjectId("507f1f77bcf86cd799439011"), ObjectId("507f1f77bcf86cd799439015")],
  "isPublic": false,
  "status": "active",
  "createdAt": ISODate("2024-01-15T10:40:00Z")
}
```

### CodeDocument
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "name": "main.js",
  "content": "console.log('Hello');",
  "room": ObjectId("507f1f77bcf86cd799439012"),
  "createdBy": ObjectId("507f1f77bcf86cd799439011"),
  "language": "javascript",
  "version": 2,
  "status": "active",
  "createdAt": ISODate("2024-01-15T10:45:00Z"),
  "updatedAt": ISODate("2024-01-15T11:00:00Z")
}
```

---

## Common Issues

### Issue: "Cannot connect to MongoDB"
**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Start MongoDB: `mongod` or `Start-Service MongoDB`
2. Wait 5-10 seconds for it to initialize
3. Check firewall isn't blocking port 27017
4. Verify port 27017 is open: `netstat -an | find "27017"`

### Issue: "Authentication failed"
**Error:** `Authentication failed` (with Atlas)

**Solutions:**
1. Check username and password are correct
2. Check IP whitelist in Network Access
3. Check string format: `mongodb+srv://user:password@...`
4. Try adding `?authSource=admin` at end

### Issue: "Database not found"
**Error:** `database does not exist`

**Solutions:**
1. Database is created automatically on first write
2. Make sure backend is running and makes first API call
3. Refresh MongoDB Compass to see collections

### Issue: "Out of storage" (Atlas)
**Error:** `Exceeds maximum database size`

**Solutions:**
1. Upgrade to paid tier
2. Delete old data: `db.activitylogs.deleteMany({})`
3. Use another provider

---

## Performance Tips

### Indexing
Add indexes for faster queries:
```bash
# Index user emails for faster login
db.users.createIndex({ email: 1 })

# Index documents by room
db.codedocuments.createIndex({ room: 1 })

# Index activity logs by document
db.activitylogs.createIndex({ document: 1, createdAt: -1 })
```

### Backup Strategy
```bash
# Daily backup
mongodump --db collaborative-editor --out ./backup/daily

# Weekly backup
mongodump --db collaborative-editor --out ./backup/weekly
```

### Clean Old Data
```bash
# Delete activity logs older than 30 days
db.activitylogs.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})
```

---

## Connection String Examples

### Local MongoDB
```
mongodb://localhost:27017/collaborative-editor
```

### MongoDB Atlas (Free)
```
mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/collaborative-editor?retryWrites=true&w=majority
```

### With Authentication
```
mongodb://user:password@localhost:27017/collaborative-editor
```

### Advanced Options
```
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/db?retryWrites=true&w=majority&maxPoolSize=10
```

---

## Monitoring & Debugging

### Check Collections & Sizes
```bash
mongosh collaborative-editor

# Show all collections
show collections

# Collection stats
db.users.stats()

# Total size
db.stats()
```

### Monitor Connections
```bash
# In MongoDB shell:
db.currentOp()
```

### Enable Logging
```bash
# In backend: src/config/db.js already logs connections
# Check console output when backend starts
```

---

## Migration (Local to Cloud)

**Export from Local:**
```bash
mongodump --db collaborative-editor --out ./export
```

**Import to Atlas:**
```bash
mongorestore --uri "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net" ./export
```

---

## Security Best Practices

✅ **Change Default Password** - Don't use default atlas password  
✅ **Limit IP Access** - Don't use "Allow from anywhere" in production  
✅ **Use Strong Passwords** - 12+ characters, mix of upper/lower/numbers/symbols  
✅ **Enable SSL** - Use `mongodb+srv://` protocol  
✅ **Backup Regularly** - Weekly backups minimum  
✅ **Monitor Usage** - Check MongoDB Atlas dashboard  

---

## Useful Resources

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB University: https://university.mongodb.com/ (free courses)
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Compass Download: https://www.mongodb.com/products/compass
- Mongoose Documentation: https://mongoosejs.com/

---

## Quick Reference

| Task | Command |
|------|---------|
| Start MongoDB | `mongod` or `Start-Service MongoDB` |
| Connect to DB | `mongosh` |
| Use database | `use collaborative-editor` |
| View collections | `show collections` |
| View documents | `db.users.find()` |
| View one document | `db.users.findOne()` |
| Count documents | `db.users.countDocuments()` |
| Backup | `mongodump` |
| Restore | `mongorestore` |
| Exit shell | `exit` |

---

## Troubleshooting Checklist

- [ ] MongoDB is running (check with `mongosh`)
- [ ] Backend .env has correct `MONGODB_URI`
- [ ] Database name is `collaborative-editor`
- [ ] Firewall isn't blocking port 27017 (local) or connection (cloud)
- [ ] No typos in username/password
- [ ] IP is whitelisted (if using Atlas)
- [ ] Backend server is running (`npm run dev`)
- [ ] Collections are created (run API call to trigger creation)

---

For backend setup: See [README.md](./backend/README.md)  
For quick start: See [QUICK_START.md](./backend/QUICK_START.md)  
For API docs: See [API_DOCS.md](./backend/API_DOCS.md)
