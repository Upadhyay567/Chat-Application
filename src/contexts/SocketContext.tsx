'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { Message, User } from '@/lib/supabase'

interface SocketContextType {
  socket: Socket | null
  onlineUsers: User[]
  typingUsers: { [roomId: string]: string[] }
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => void
  sendTyping: (roomId: string, isTyping: boolean) => void
  sendPrivateMessage: (message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: string[] }>({})
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
      const newSocket = io(socketUrl, {
        auth: {
          userId: user.id,
          username: user.username,
        },
      })

      setSocket(newSocket)

      // Listen for online users updates
      newSocket.on('users:online', (users: User[]) => {
        setOnlineUsers(users)
      })

      // Listen for typing indicators
      newSocket.on('typing:start', ({ roomId, userId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []).filter(u => u !== username), username]
        }))
      })

      newSocket.on('typing:stop', ({ roomId, userId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(u => u !== username)
        }))
      })

      // Clean up typing indicators after timeout
      newSocket.on('typing:timeout', ({ roomId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(u => u !== username)
        }))
      })

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('room:join', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('room:leave', roomId)
    }
  }

  const sendMessage = (message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => {
    if (socket) {
      socket.emit('message:send', message)
    }
  }

  const sendPrivateMessage = (message: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => {
    if (socket) {
      socket.emit('message:private', message)
    }
  }

  const sendTyping = (roomId: string, isTyping: boolean) => {
    if (socket) {
      if (isTyping) {
        socket.emit('typing:start', roomId)
      } else {
        socket.emit('typing:stop', roomId)
      }
    }
  }

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    sendPrivateMessage,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
