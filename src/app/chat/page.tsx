'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'
import { useSocket } from '@/contexts/SocketContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ChatRoom, Message } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const { socket, joinRoom, leaveRoom } = useSocket()
  const { user } = useAuth()

  // Load user's rooms
  useEffect(() => {
    if (user) {
      loadRooms()
    }
  }, [user])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Join user to socket with their info
    socket.emit('user:join', {
      userId: user?.id,
      username: user?.username,
      avatar_url: user?.avatar_url
    })

    // Listen for new messages
    socket.on('message:received', (message: Message) => {
      if (selectedRoom && message.room_id === selectedRoom.id) {
        setMessages(prev => [...prev, message])
      }
    })

    // Listen for private messages
    socket.on('message:private:received', (message: Message) => {
      if (selectedUser && message.user_id === selectedUser.id) {
        setMessages(prev => [...prev, message])
      }
    })

    socket.on('message:private:sent', (message: Message) => {
      if (selectedUser && message.private_to === selectedUser.id) {
        setMessages(prev => [...prev, message])
      }
    })

    return () => {
      socket.off('message:received')
      socket.off('message:private:received')
      socket.off('message:private:sent')
    }
  }, [socket, selectedRoom, selectedUser, user])

  const loadRooms = async () => {
    try {
      setLoading(true)
      
      // Get public rooms and rooms user is a member of
      const { data: publicRooms, error: publicError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('type', 'public')
        .order('created_at', { ascending: false })

      if (publicError) throw publicError

      const { data: memberRooms, error: memberError } = await supabase
        .from('room_members')
        .select(`
          chat_rooms (*)
        `)
        .eq('user_id', user?.id)

      if (memberError) throw memberError

      const privateRooms = memberRooms
        ?.map(member => member.chat_rooms)
        .filter(room => room?.type === 'private') || []

      setRooms([...publicRooms, ...privateRooms])
    } catch (error) {
      console.error('Error loading rooms:', error)
      toast.error('Failed to load chat rooms')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (roomId?: string, userId?: string) => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          users:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: true })
        .limit(50)

      if (roomId) {
        query = query.eq('room_id', roomId)
      } else if (userId) {
        query = query.or(`and(user_id.eq.${user?.id},private_to.eq.${userId}),and(user_id.eq.${userId},private_to.eq.${user?.id})`)
      }

      const { data, error } = await query

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const handleRoomSelect = async (room: ChatRoom) => {
    // Leave current room if any
    if (selectedRoom) {
      leaveRoom(selectedRoom.id)
    }
    
    setSelectedUser(null)
    setSelectedRoom(room)
    
    // Join new room
    joinRoom(room.id)
    
    // Load messages for this room
    await loadMessages(room.id)
  }

  const handleUserSelect = async (selectedUser: any) => {
    // Leave current room if any
    if (selectedRoom) {
      leaveRoom(selectedRoom.id)
    }
    
    setSelectedRoom(null)
    setSelectedUser(selectedUser)
    
    // Load private messages with this user
    await loadMessages(undefined, selectedUser.id)
  }

  const createRoom = async (name: string, description: string, type: 'public' | 'private') => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          type,
          created_by: user?.id
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      await supabase
        .from('room_members')
        .insert({
          room_id: data.id,
          user_id: user?.id,
          role: 'admin'
        })

      // Refresh rooms list
      await loadRooms()
      
      toast.success('Room created successfully!')
      return data
    } catch (error) {
      console.error('Error creating room:', error)
      toast.error('Failed to create room')
      return null
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoom}
          selectedUser={selectedUser}
          onRoomSelect={handleRoomSelect}
          onUserSelect={handleUserSelect}
          onCreateRoom={createRoom}
        />
        <ChatWindow
          selectedRoom={selectedRoom}
          selectedUser={selectedUser}
          messages={messages}
        />
      </div>
    </ProtectedRoute>
  )
}
