# API Testing Guide - Secure Authentication System

## 🚀 Prerequisites

**Server must be running**:
```bash
cd c:\Users\rjven\Desktop\secure-auth-system\backend
npm start
```

Expected output:
```
✅ MongoDB Connected: cluster0.ru2dxzr.mongodb.net
🚀 Server running on port 5000
```

---

## 🧪 Testing Flow

Follow this order to test all features:

1. Health Check
2. Register User
3. Verify Email
4. Login (Get JWT)
5. Access Protected Dashboard
6. List Sessions
7. Logout from Current Device
8. Login Again (Multiple Devices)
9. Logout from All Devices
10. Password Reset Flow

---

## 📋 All API Endpoints

### 1. Health Check 

**Endpoint**: `GET /api/health`

**Test Command**:
```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-08T14:14:00.000Z"
}
```

---

### 2. Register User ✅

**Endpoint**: `POST /api/auth/register`

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "email": "test@example.com",
    "isEmailVerified": false
  }
}
```

**Notes**:
- Email verification link will be sent (if email is configured)
- Check MongoDB Atlas → Browse Collections → `tokens` to see the verification token
- Password must be at least 6 characters

---

### 3. Verify Email

**Endpoint**: `GET /api/auth/verify-email/:token`

**How to Get Token**:

**Option 1 - From MongoDB Atlas**:
1. Go to MongoDB Atlas → Collections
2. Database: `secure-auth-system`
3. Collection: `tokens`
4. Find the document with `type: "VERIFY_EMAIL"`
5. Copy the `_id` value (NOT tokenHash)

**Option 2 - From Email** (if configured):
- Check your email inbox
- Click the verification link or copy the token from URL

**Test Command** (replace `YOUR_TOKEN_HERE` with actual token):
```bash
curl http://localhost:5000/api/auth/verify-email/YOUR_TOKEN_HERE
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

**⚠️ Manual Verification (If No Email)**:

If you don't have email configured, manually verify in MongoDB:

1. Go to MongoDB Atlas → Collections → `users`
2. Find your user document
3. Click "Edit Document"
4. Change `isEmailVerified` from `false` to `true`
5. Click "Update"

---

### 4. Login ✅

**Endpoint**: `POST /api/auth/login`

**Test Command** (saves cookie to file):
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -c cookies.txt ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65abc123def456789...",
      "email": "test@example.com",
      "isEmailVerified": true
    },
    "session": {
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "deviceType": "Desktop",
      "browser": "Chrome",
      "os": "Windows",
      "ipAddress": "127.0.0.1"
    }
  }
}
```

**Notes**:
- JWT token is stored in HTTP-only cookie
- `cookies.txt` file will be created with the session
- Email must be verified before login

---

### 5. Access Protected Dashboard ✅

**Endpoint**: `GET /api/dashboard`  
**Authentication**: Required

**Test Command** (uses cookie from login):
```bash
curl http://localhost:5000/api/dashboard ^
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "65abc123...",
      "email": "test@example.com",
      "isEmailVerified": true,
      "createdAt": "2026-02-08T14:00:00.000Z"
    },
    "stats": {
      "activeSessionCount": 1
    }
  }
}
```

---

### 6. List Active Sessions ✅

**Endpoint**: `GET /api/sessions`  
**Authentication**: Required

**Test Command**:
```bash
curl http://localhost:5000/api/sessions ^
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "deviceInfo": {
          "deviceType": "Desktop",
          "browser": "Chrome",
          "os": "Windows"
        },
        "ipAddress": "127.0.0.1",
        "lastActive": "2026-02-08T14:15:00.000Z",
        "createdAt": "2026-02-08T14:10:00.000Z",
        "isCurrent": true
      }
    ],
    "totalSessions": 1
  }
}
```

---

### 7. Logout from Current Device ✅

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Required

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/auth/logout ^
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Verify**: Try accessing dashboard again - should fail with 401

---

### 8. Logout from All Devices✅

**Endpoint**: `POST /api/auth/logout-all`  
**Authentication**: Required

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/auth/logout-all ^
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Verify**: All sessions in MongoDB `sessions` collection should have `isActive: false`

---

### 9. Revoke Specific Session✅

**Endpoint**: `DELETE /api/sessions/:sessionId`  
**Authentication**: Required

**Steps**:
1. Login from 2 different terminals/browsers
2. List sessions to get `sessionId`
3. Revoke one specific session

**Test Command** (replace `SESSION_ID_HERE`):
```bash
curl -X DELETE http://localhost:5000/api/sessions/SESSION_ID_HERE ^
  -b cookies.txt
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

### 10. Forgot Password ✅

**Endpoint**: `POST /api/auth/forgot-password`

**Test Command**:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Notes**:
- Always returns success (prevents email enumeration)
- Reset token sent to email (if configured)
- Token also saved in MongoDB `tokens` collection

---

### 11. Reset Password ✅

**Endpoint**: `POST /api/auth/reset-password`

**Get Token From**:
- Email (if configured)
- MongoDB Atlas → `tokens` collection → find `type: "RESET_PASSWORD"` → copy `_id`

**Test Command** (replace `YOUR_RESET_TOKEN`):
```bash
curl -X POST http://localhost:5000/api/auth/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"token\":\"YOUR_RESET_TOKEN\",\"newPassword\":\"newpassword123\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Password reset successful! Please log in with your new password."
}
```

**Notes**:
- All active sessions are invalidated
- Must login again with new password

---

## 🎯 Complete Testing Scenario

### Scenario: Test Full Authentication Flow

```bash
# 1. Health Check
curl http://localhost:5000/api/health

# 2. Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"john@example.com\",\"password\":\"john123456\"}"

# 3. Manually verify email in MongoDB (set isEmailVerified: true)
# OR get token from MongoDB and verify

# 4. Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -c cookies.txt -d "{\"email\":\"john@example.com\",\"password\":\"john123456\"}"

# 5. Access Dashboard
curl http://localhost:5000/api/dashboard -b cookies.txt

# 6. List Sessions
curl http://localhost:5000/api/sessions -b cookies.txt

# 7. Logout
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

---

## 🧪 Test Race Condition (Concurrent Login)✅

**Option 1 - Using Multiple Terminals**:

Terminal 1:
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -c cookies1.txt -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

Terminal 2 (run simultaneously):
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -c cookies2.txt -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

**Expected**: Both succeed, 2 different session IDs created

**Verify in MongoDB**:
- Go to `sessions` collection
- Filter: `{ userId: ObjectId("YOUR_USER_ID"), isActive: true }`
- Should see 2 sessions with different `sessionId` values

---

## 🛠️ Testing Tools

### Option 1: curl (Command Line)
- Already shown above
- Best for automation and scripting

### Option 2: Postman

**Import Collection**:

Create a new Postman collection with these requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:5000/api/health`

2. **Register**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "test123456"
     }
     ```

3. **Login**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "test123456"
     }
     ```
   - Settings: Enable "Save cookies"

4. **Dashboard**
   - Method: GET
   - URL: `http://localhost:5000/api/dashboard`
   - Uses cookies from login automatically

### Option 3: Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Create new request
3. Follow same structure as Postman

---

## 📊 Expected Database Structure After Testing

**Database: `secure-auth-system`**

**Collections Created**:

1. **users**
   ```javascript
   {
     _id: ObjectId("..."),
     email: "test@example.com",
     passwordHash: "$2b$12$...",
     isEmailVerified: true,
     createdAt: ISODate("..."),
     updatedAt: ISODate("...")
   }
   ```

2. **sessions**
   ```javascript
   {
     _id: ObjectId("..."),
     userId: ObjectId("..."),
     sessionId: "uuid-here",
     deviceInfo: {
       userAgent: "curl/...",
       deviceType: "Desktop",
       browser: "Unknown",
       os: "Windows"
     },
     ipAddress: "127.0.0.1",
     isActive: true,
     lastActive: ISODate("..."),
     createdAt: ISODate("...")
   }
   ```

3. **tokens**
   ```javascript
   {
     _id: ObjectId("..."),
     userId: ObjectId("..."),
     tokenHash: "sha256-hash-here",
     type: "VERIFY_EMAIL",
     expiresAt: ISODate("..."),
     used: false,
     createdAt: ISODate("...")
   }
   ```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Email not verified"
**Solution**: Manually set `isEmailVerified: true` in MongoDB users collection

### Issue 2: "Authentication required"
**Solution**: Make sure you're using `-b cookies.txt` to send the JWT cookie

### Issue 3: "Invalid or expired token"
**Solution**: 
- Verification tokens expire in 24 hours
- Reset tokens expire in 1 hour
- Generate new token by registering again or requesting password reset

### Issue 4: "Too many requests"
**Solution**: Rate limit hit. Wait 15 minutes or restart server

---

## ✅ Success Checklist

After testing, verify:

- [ ] User registered successfully
- [ ] Email verified (manually or via token)
- [ ] Login successful with JWT cookie
- [ ] Dashboard accessible with valid session
- [ ] Multiple sessions created from concurrent logins
- [ ] Session list shows all active sessions
- [ ] Logout invalidates current session
- [ ] Logout-all invalidates all sessions
- [ ] Password reset works and invalidates sessions
- [ ] Protected routes blocked without authentication

---

## 📝 Test Report Template

```
# API Test Report

Date: ___________
Tester: ___________

## Test Results

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| /api/health | GET | ✅/❌ | |
| /api/auth/register | POST | ✅/❌ | |
| /api/auth/verify-email/:token | GET | ✅/❌ | |
| /api/auth/login | POST | ✅/❌ | |
| /api/dashboard | GET | ✅/❌ | |
| /api/sessions | GET | ✅/❌ | |
| /api/auth/logout | POST | ✅/❌ | |
| /api/auth/logout-all | POST | ✅/❌ | |
| /api/sessions/:id | DELETE | ✅/❌ | |
| /api/auth/forgot-password | POST | ✅/❌ | |
| /api/auth/reset-password | POST | ✅/❌ | |

## Race Condition Test
- Concurrent logins: ✅/❌
- Duplicate sessions prevented: ✅/❌
- Both logins successful: ✅/❌

## Issues Found
1. 
2. 
3. 
```

---

**Happy Testing! 🧪🚀**
