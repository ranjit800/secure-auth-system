# Frontend - Secure Authentication System

## 📋 Overview

The frontend for the Secure Authentication System, built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. It provides a responsive, modern UI for user authentication, dashboard management, and session control.

## ✨ Features

- ✅ **Authentication Pages**: Login, Register, Forgot Password, Reset Password
- ✅ **Protected Dashboard**: Session management, user profile
- ✅ **Real-time Feedback**: Loading states, success/error toasts
- ✅ **Responsive Design**: Mobile-first UI with Tailwind CSS
- ✅ **State Management**: Global auth state with **Zustand**
- ✅ **Security**: HttpOnly cookie handling, automatic token refresh

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- Backend server running on port 5000

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Update the values (see Configuration section below)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will start on `http://localhost:3000`

---

## ⚙️ Configuration

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📂 Project Structure

```
frontend/
├── app/
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   ├── dashboard/       # Protected dashboard
│   ├── forgot-password/ # Request password reset
│   ├── reset-password/  # Reset password with token
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components
├── lib/
│   └── api.ts           # Axios instance & interceptors
├── store/
│   └── useAuthStore.ts  # Zustand auth store
└── public/              # Static assets
```

---

## 📜 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

---

## 👤 Author

Created by: Ranjit Jana  
Assignment for: **Kalp Intelligence Internship**  
Evaluator: **Aman Sharma**
