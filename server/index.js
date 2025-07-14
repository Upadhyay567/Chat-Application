const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = createServer(app)

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// Store online users and their socket connections
const onlineUsers = new Map()
const userSockets = new Map()
const roomUsers = new Map()
const typingUsers = new Map()

// Typing timeout duration (3 seconds)
const TYPING_TIMEOUT = 3000
const typingTimeouts = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user authentication and join
  socket.on('user:join', (userData) => {
    const { userId, username, avatar_url } = userData
    
    // Store user information
    onlineUsers.set(userId, {
      id: userId,
      username,
      avatar_url,
      socketId: socket.id,
      status: 'online',
      last_seen: new Date().toISOString()
    })
    
    userSockets.set(socket.id, userId)
    socket.userId = userId
    socket.username = username

    // Broadcast updated online users list
    io.emit('users:online', Array.from(onlineUsers.values()))
    
    console.log(`User ${username} (${userId}) joined`)
  })

  // Handle joining a chat room
  socket.on('room:join', (roomId) => {
    socket.join(roomId)
    
    // Add user to room users list
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set())
    }
    roomUsers.get(roomId).add(socket.userId)
    
    // Notify room members
    socket.to(roomId).emit('user:joined', {
      userId: socket.userId,
      username: socket.username,
      roomId
    })
    
    console.log(`User ${socket.username} joined room ${roomId}`)
  })

  // Handle leaving a chat room
  socket.on('room:leave', (roomId) => {
    socket.leave(roomId)
    
    // Remove user from room users list
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(socket.userId)
      if (roomUsers.get(roomId).size === 0) {
        roomUsers.delete(roomId)
      }
    }
    
    // Clear any typing indicators for this user in this room
    clearTypingIndicator(roomId, socket.userId, socket.username)
    
    // Notify room members
    socket.to(roomId).emit('user:left', {
      userId: socket.userId,
      username: socket.username,
      roomId
    })
    
    console.log(`User ${socket.username} left room ${roomId}`)
  })

  // Handle sending messages to rooms
  socket.on('message:send', (messageData) => {
    const { room_id, content, message_type, file_url, file_name, file_size } = messageData
    
    const message = {
      id: generateId(),
      content,
      user_id: socket.userId,
      username: socket.username,
      room_id,
      message_type: message_type || 'text',
      file_url,
      file_name,
      file_size,
      created_at: new Date().toISOString()
    }
    
    // Broadcast message to room members
    io.to(room_id).emit('message:received', message)
    
    console.log(`Message sent to room ${room_id} by ${socket.username}`)
  })

  // Handle private messages
  socket.on('message:private', (messageData) => {
    const { private_to, content, message_type, file_url, file_name, file_size } = messageData
    
    const message = {
      id: generateId(),
      content,
      user_id: socket.userId,
      username: socket.username,
      private_to,
      message_type: message_type || 'text',
      file_url,
      file_name,
      file_size,
      created_at: new Date().toISOString()
    }
    
    // Find recipient's socket
    const recipientUser = Array.from(onlineUsers.values()).find(user => user.id === private_to)
    
    if (recipientUser) {
      // Send to recipient
      io.to(recipientUser.socketId).emit('message:private:received', message)
      // Send back to sender for confirmation
      socket.emit('message:private:sent', message)
    } else {
      // User is offline, you might want to store this in database
      socket.emit('message:private:failed', { error: 'User is offline' })
    }
    
    console.log(`Private message sent from ${socket.username} to ${private_to}`)
  })

  // Handle typing indicators
  socket.on('typing:start', (roomId) => {
    // Clear existing timeout for this user in this room
    const timeoutKey = `${roomId}:${socket.userId}`
    if (typingTimeouts.has(timeoutKey)) {
      clearTimeout(typingTimeouts.get(timeoutKey))
    }
    
    // Add user to typing users for this room
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set())
    }
    
    const wasTyping = typingUsers.get(roomId).has(socket.userId)
    typingUsers.get(roomId).add(socket.userId)
    
    // Only broadcast if user wasn't already typing
    if (!wasTyping) {
      socket.to(roomId).emit('typing:start', {
        roomId,
        userId: socket.userId,
        username: socket.username
      })
    }
    
    // Set timeout to automatically stop typing indicator
    const timeout = setTimeout(() => {
      clearTypingIndicator(roomId, socket.userId, socket.username)
    }, TYPING_TIMEOUT)
    
    typingTimeouts.set(timeoutKey, timeout)
  })

  socket.on('typing:stop', (roomId) => {
    clearTypingIndicator(roomId, socket.userId, socket.username)
  })

  // Handle message reactions
  socket.on('reaction:add', (reactionData) => {
    const { message_id, emoji, room_id } = reactionData
    
    const reaction = {
      id: generateId(),
      message_id,
      user_id: socket.userId,
      username: socket.username,
      emoji,
      created_at: new Date().toISOString()
    }
    
    // Broadcast reaction to room members
    if (room_id) {
      io.to(room_id).emit('reaction:added', reaction)
    }
  })

  socket.on('reaction:remove', (reactionData) => {
    const { message_id, emoji, room_id } = reactionData
    
    // Broadcast reaction removal to room members
    if (room_id) {
      io.to(room_id).emit('reaction:removed', {
        message_id,
        user_id: socket.userId,
        emoji
      })
    }
  })

  // Handle user status updates
  socket.on('status:update', (status) => {
    if (onlineUsers.has(socket.userId)) {
      const user = onlineUsers.get(socket.userId)
      user.status = status
      user.last_seen = new Date().toISOString()
      
      // Broadcast updated user status
      io.emit('user:status:updated', {
        userId: socket.userId,
        status,
        last_seen: user.last_seen
      })
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    if (socket.userId) {
      // Remove from online users
      onlineUsers.delete(socket.userId)
      userSockets.delete(socket.id)
      
      // Clear all typing indicators for this user
      typingUsers.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          clearTypingIndicator(roomId, socket.userId, socket.username)
        }
      })
      
      // Remove from all rooms
      roomUsers.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId)
          socket.to(roomId).emit('user:left', {
            userId: socket.userId,
            username: socket.username,
            roomId
          })
        }
      })
      
      // Broadcast updated online users list
      io.emit('users:online', Array.from(onlineUsers.values()))
      
      console.log(`User ${socket.username} (${socket.userId}) disconnected`)
    }
  })
})

// Helper function to clear typing indicators
function clearTypingIndicator(roomId, userId, username) {
  const timeoutKey = `${roomId}:${userId}`
  
  // Clear timeout
  if (typingTimeouts.has(timeoutKey)) {
    clearTimeout(typingTimeouts.get(timeoutKey))
    typingTimeouts.delete(timeoutKey)
  }
  
  // Remove from typing users
  if (typingUsers.has(roomId)) {
    const wasTyping = typingUsers.get(roomId).has(userId)
    typingUsers.get(roomId).delete(userId)
    
    if (typingUsers.get(roomId).size === 0) {
      typingUsers.delete(roomId)
    }
    
    // Broadcast typing stop if user was typing
    if (wasTyping) {
      io.to(roomId).emit('typing:stop', {
        roomId,
        userId,
        username
      })
    }
  }
}

// Helper function to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    onlineUsers: onlineUsers.size,
    activeRooms: roomUsers.size 
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
