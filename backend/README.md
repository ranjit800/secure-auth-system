# Backend - Secure Authentication System

## 📋 Overview

This is the backend server for the Secure Authentication System, built with **Node.js**, **Express**, and **MongoDB**. It provides a comprehensive authentication system with multi-device session management and race-condition-safe concurrent login handling.

## ✨ Features

- ✅ **User Registration** with email verification
- ✅ **Email Verification** using secure, single-use tokens
- ✅ **JWT-based Authentication** with HTTP-only cookies
- ✅ **Race Condition Handling** for concurrent logins
- ✅ **Multi-Device Session Management** with device tracking
- ✅ **Password Reset** with expiring, single-use tokens
- ✅ **Rate Limiting** on authentication endpoints
- ✅ **Session Revocation** (current device or all devices)
- ✅ **Protected Routes** with JWT middleware

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email Service**: SendGrid (HTTP API)
- **Security**: express-rate-limit, HTTP-only cookies

---

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- SendGrid Account (for transactional emails)

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```
   *(Note: Ensure `@sendgrid/mail` is installed)*

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values (see Configuration section below)

3. **Start MongoDB**:
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Start the server**:
   ```bash
   npm start
   # Or for development with auto-restart:
   npm run dev
   ```

   The server will start on `http://localhost:5000`

---

## ⚙️ Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/secure-auth-system

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=your-verified-sender@example.com

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 📧 Email Setup (Gmail)

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Generate a new App Password
3. Use that password in `EMAIL_PASSWORD`

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| GET | `/verify-email/:token` | Verify email with token | No |
| POST | `/login` | Login user (race-safe) | No |
| POST | `/logout` | Logout current device | Yes |
| POST | `/logout-all` | Logout all devices | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |

### Session Routes (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all active sessions | Yes |
| DELETE | `/:sessionId` | Revoke specific session | Yes |

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get dashboard data | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 📝 Request/Response Examples

### 1. Register

**Request**:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "email": "user@example.com",
    "isEmailVerified": false
  }
}
```

### 2. Login

**Request**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": true
    },
    "session": {
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "deviceType": "Desktop",
      "browser": "Chrome",
      "os": "Windows",
      "ipAddress": "192.168.1.1"
    }
  }
}
```

### 3. Get Active Sessions

**Request**:
```bash
GET /api/sessions
Cookie: token=<jwt-token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "session-id-1",
        "deviceInfo": {
          "deviceType": "Desktop",
          "browser": "Chrome",
          "os": "Windows"
        },
        "ipAddress": "192.168.1.1",
        "lastActive": "2026-02-08T13:30:00.000Z",
        "createdAt": "2026-02-08T10:00:00.000Z",
        "isCurrent": true
      },
      {
        "sessionId": "session-id-2",
        "deviceInfo": {
          "deviceType": "Mobile",
          "browser": "Safari",
          "os": "iOS"
        },
        "ipAddress": "192.168.1.2",
        "lastActive": "2026-02-08T12:00:00.000Z",
        "createdAt": "2026-02-07T15:00:00.000Z",
        "isCurrent": false
      }
    ],
    "totalSessions": 2
  }
}
```

---

## 🔒 Security Features

### Password Hashing
- Passwords are hashed using **bcrypt** with 12 salt rounds
- Password hashes are never exposed in API responses

### JWT Tokens
- Stored in **HTTP-only cookies** (not accessible via JavaScript)
- Include `userId` and `sessionId` in payload
- Expire after 7 days (configurable)

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **Password Reset**: 3 requests per hour

### Token Security
- All tokens (email verification, password reset) are **hashed** before storage
- Tokens are **single-use** and **expire** after a set time
- Email verification: 24 hours expiry
- Password reset: 1 hour expiry

### Session Security
- Sessions are validated on every protected route access
- `lastActive` timestamp updated on each request
- Password reset invalidates all existing sessions

---

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── email.js           # Email service (Nodemailer)
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── rateLimit.js       # Rate limiting configurations
├── models/
│   ├── User.js            # User model
│   ├── Session.js         # Session model
│   └── Token.js           # Token model (verification, reset)
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── session.js         # Session management routes
│   └── dashboard.js       # Protected dashboard route
├── utils/
│   └── helpers.js         # Helper functions (user-agent parsing, IP extraction)
├── .env.example           # Environment variable template
├── .gitignore
├── package.json
├── server.js              # Express server entry point
└── README.md
```

---

## 🚦 Race Condition Handling

### Problem
When a user logs in from two different devices at the **exact same time**, both requests hit the database simultaneously. Without proper handling, this could cause:
- Duplicate sessions
- Inconsistent data
- One login overwriting the other

### Solution
We use **MongoDB's atomic operations** to ensure session consistency:

1. **UUID Session IDs**: Each session gets a unique identifier
2. **Atomic Creation**: `Session.create()` is an atomic operation in MongoDB
3. **Unique Index**: `sessionId` field has a unique index in the database
4. **Error Handling**: If a conflict occurs (duplicate key), the request fails gracefully

**Code Implementation** (from `routes/auth.js`):
```javascript
// Generate unique session ID
const sessionId = uuidv4();

// Atomic session creation - MongoDB handles concurrency
const session = await Session.create({
  userId: user._id,
  sessionId,
  deviceInfo: { /* ... */ },
  ipAddress,
  isActive: true,
  lastActive: new Date()
});
```

### Why This Works
- MongoDB's write operations are **atomic at the document level**
- Each `Session.create()` is executed **sequentially** by MongoDB
- Even if two requests arrive simultaneously, MongoDB processes them **one after another**
- Both sessions are created successfully with **unique sessionIds**

### Testing
To test concurrent logins:
1. Open two browser tabs (Incognito mode)
2. Enter same credentials in both
3. Click login simultaneously
4. **Result**: Both logins succeed, two active sessions appear in session list

---

## 🧪 Testing

### Manual Testing

1. **Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Register**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Login** (after email verification):
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -c cookies.txt \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

4. **Get Sessions**:
   ```bash
   curl http://localhost:5000/api/sessions \
     -b cookies.txt
   ```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your cloud MongoDB connection string
- Verify `MONGODB_URI` in `.env`

### Email Not Sending
- Check Gmail App Password is correct
- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` in `.env`
- Check email logs in terminal

### CORS Errors
- Ensure `CORS_ORIGIN` in `.env` matches your frontend URL
- Frontend should send requests with `credentials: 'include'`

---

## 📄 License

This project is for internship evaluation purposes.

---

## 👤 Author

Created by: Ranjit Jana  
Assignment for: **Kalp Intelligence Internship**  
Evaluator: **Aman Sharma**
