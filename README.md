# 💬 Modern Chat Application

A feature-rich, real-time chat application built with Next.js, Socket.io, and Supabase. Experience seamless communication with modern UI/UX design.

![Chat Application](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Features

### 🔐 **Authentication System**
- Secure user registration and login
- Session management with Supabase Auth
- Protected routes and middleware
- Password reset functionality

### 💬 **Real-time Messaging**
- Instant message delivery using Socket.io
- Live typing indicators
- Online/offline user status
- Message read receipts
- Emoji support

### 🏠 **Chat Rooms**
- Create and manage public chat rooms
- Join existing rooms with ease
- Room member management
- Room-specific settings and permissions

### 📱 **Private Messaging**
- Direct messages between users
- Private conversation history
- User search and discovery
- Block/unblock functionality

### 📎 **Media Sharing**
- Image upload and preview
- File attachment support (documents, videos, etc.)
- Drag-and-drop file upload
- Secure cloud storage with Supabase

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Clean, intuitive interface
- Smooth animations and transitions
- Dark/light theme support
- Mobile-first approach

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **Real-time** | Socket.io WebSockets |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed
- **npm** or **yarn** package manager
- A **Supabase account** (free tier available)
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Upadhyay567/Chat-Application.git
cd Chat-Application
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Set up Supabase

1. **Create a Supabase Project:**
   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Get API Credentials:**
   - Go to Settings → API
   - Copy your Project URL and anon/public key

3. **Set up Database Schema:**
   - Open the SQL Editor in Supabase
   - Run the SQL commands from `supabase-schema.sql`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3005

# Optional: Custom configurations
NEXT_PUBLIC_APP_NAME=Chat Application
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

## 🚀 Running the Application

### Quick Start (Recommended)

**Windows PowerShell:**
```powershell
.\start-servers.ps1
```

**Windows Command Prompt:**
```cmd
start-servers.bat
```

### Manual Start

**Terminal 1 - Socket.io Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Socket.io Server:** http://localhost:3005

## 📁 Project Structure

```
chat-app/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 auth/              # Authentication pages
│   │   │   ├── login/page.tsx    # Login page
│   │   │   └── register/page.tsx # Registration page
│   │   ├── 📁 chat/              # Chat interface
│   │   │   └── page.tsx          # Main chat page
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── 📁 components/            # Reusable components
│   │   ├── 📁 chat/              # Chat-specific components
│   │   │   ├── ChatSidebar.tsx   # Sidebar with rooms/users
│   │   │   ├── ChatWindow.tsx    # Main chat interface
│   │   │   ├── MessageInput.tsx  # Message input component
│   │   │   ├── MessageList.tsx   # Message display
│   │   │   └── CreateRoomModal.tsx # Room creation modal
│   │   ├── 📁 ui/                # UI components
│   │   │   ├── Button.tsx        # Custom button component
│   │   │   ├── Card.tsx          # Card component
│   │   │   └── Input.tsx         # Input component
│   │   └── ProtectedRoute.tsx    # Route protection
│   ├── 📁 contexts/              # React contexts
│   │   ├── AuthContext.tsx       # Authentication context
│   │   └── SocketContext.tsx     # Socket.io context
│   └── 📁 lib/                   # Utility functions
│       ├── supabase.ts           # Supabase client
│       └── utils.ts              # Helper functions
├── 📁 server/                    # Socket.io server
│   ├── index.js                  # Server entry point
│   ├── package.json              # Server dependencies
│   └── package-lock.json         # Lock file
├── 📁 public/                    # Static assets
├── supabase-schema.sql           # Database schema
├── start-servers.ps1             # PowerShell startup script
├── start-servers.bat             # Batch startup script
├── tailwind.config.js            # Tailwind configuration
├── next.config.js                # Next.js configuration
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

## 🎯 Key Features Breakdown

### Authentication Flow
1. **Registration:** Users create accounts with email/password
2. **Login:** Secure authentication with Supabase
3. **Session Management:** Automatic token refresh
4. **Route Protection:** Middleware guards protected pages

### Real-time Communication
1. **WebSocket Connection:** Established on chat page load
2. **Message Broadcasting:** Real-time message delivery
3. **Presence System:** Online/offline status tracking
4. **Typing Indicators:** Live typing status updates

### File Upload System
1. **Drag & Drop:** Intuitive file upload interface
2. **File Validation:** Size and type restrictions
3. **Cloud Storage:** Secure storage with Supabase
4. **Preview System:** Image and file previews

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Server (in server/ directory)
npm run dev          # Start server with nodemon
npm start            # Start production server
```

### Code Quality

- **ESLint:** Code linting and formatting
- **TypeScript:** Type safety and better DX
- **Prettier:** Code formatting (optional)

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect Repository:**
   ```bash
   # Push to GitHub first
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   NEXT_PUBLIC_SOCKET_URL=your_server_url
   ```

### Backend (Railway/Heroku)

1. **Railway Deployment:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables:**
   - Set `PORT` (Railway sets this automatically)
   - Configure CORS origins for production

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes and commit:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

- **Bug Reports:** [Create an issue](https://github.com/Upadhyay567/Chat-Application/issues)
- **Feature Requests:** [Request a feature](https://github.com/Upadhyay567/Chat-Application/issues)
- **Questions:** Check existing issues or create a new one

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Socket.io](https://socket.io/)** - Real-time bidirectional event-based communication
- **[Supabase](https://supabase.com/)** - The open source Firebase alternative
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[Vercel](https://vercel.com/)** - Platform for frontend frameworks and static sites

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Upadhyay567/Chat-Application)
![GitHub forks](https://img.shields.io/github/forks/Upadhyay567/Chat-Application)
![GitHub issues](https://img.shields.io/github/issues/Upadhyay567/Chat-Application)
![GitHub license](https://img.shields.io/github/license/Upadhyay567/Chat-Application)

---

<div align="center">

**Built with ❤️ by [Upadhyay567](https://github.com/Upadhyay567)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
