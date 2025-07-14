# Chat Application

A modern, real-time chat application built with Next.js, Socket.io, and Supabase. Features include user authentication, chat rooms, private messaging, and media sharing capabilities.

## Features

- ✅ **User Authentication** - Sign up, sign in, and secure user management
- ✅ **Real-time Messaging** - Instant messaging with Socket.io
- ✅ **Chat Rooms** - Public and private chat rooms
- ✅ **Private Messaging** - One-on-one conversations
- ✅ **Typing Indicators** - See when users are typing
- ✅ **Online Status** - See who's online
- 🚧 **Media Sharing** - Image, video, and file sharing (in progress)
- 🚧 **Message Reactions** - React to messages with emojis (in progress)
- 🚧 **Message Search** - Search through chat history (planned)
- 🚧 **Push Notifications** - Real-time notifications (planned)

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Socket.io
- **UI Components**: Custom components with Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd chat-app

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your project URL and anon key
4. Go to the SQL Editor in your Supabase dashboard
5. Copy and paste the contents of `supabase-schema.sql` and run it

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

### 4. Run the Application

You need to run both the Socket.io server and the Next.js frontend:

**Terminal 1 - Start the Socket.io server:**
```bash
cd server
npm start
# Server will run on http://localhost:3001 (or 3002 if 3001 is taken)
```

**Terminal 2 - Start the Next.js frontend:**
```bash
npm run dev
# Frontend will run on http://localhost:3000 (or next available port)
```

### 5. Access the Application

Open your browser and navigate to the URL shown in Terminal 2 (usually `http://localhost:3000` or `http://localhost:3001`)

## Usage Guide

### Getting Started

1. **Sign Up**: Create a new account with email and username
2. **Sign In**: Log in with your credentials
3. **Join Rooms**: Browse and join public chat rooms
4. **Create Rooms**: Create your own public or private rooms
5. **Private Messages**: Click on online users to start private conversations

### Chat Features

- **Send Messages**: Type in the message input and press Enter or click Send
- **Typing Indicators**: See when others are typing in real-time
- **Online Status**: View who's currently online in the sidebar
- **Room Management**: Create, join, and leave chat rooms
- **Message History**: Scroll up to view previous messages

## Current Status

🎉 **The application is currently running!**

- **Frontend**: http://localhost:3000 ✅
- **Socket.io Server**: http://localhost:3001 ✅

Both servers are active and the application is ready to use. You can:

1. Open http://localhost:3000 in your browser
2. View the beautiful landing page with feature overview
3. See the demo mode instructions for full setup

**Note**: The app is currently in demo mode. To enable full chat functionality, you'll need to set up Supabase as described in the setup instructions above.

## Quick Start

For future runs, you can use the provided startup scripts:

**Windows PowerShell:**
```powershell
.\start-servers.ps1
```

**Windows Command Prompt:**
```cmd
start-servers.bat
```

**Manual Start:**
```bash
# Terminal 1 - Socket.io Server
cd server
node index.js

# Terminal 2 - Next.js Frontend
npm run dev
```
