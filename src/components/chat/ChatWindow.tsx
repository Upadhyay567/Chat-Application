'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChatRoom, Message, User } from '@/lib/supabase'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Hash, 
  Lock, 
  Users,
  MessageCircle
} from 'lucide-react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

interface ChatWindowProps {
  selectedRoom: ChatRoom | null
  selectedUser: User | null
  messages: Message[]
}

export default function ChatWindow({
  selectedRoom,
  selectedUser,
  messages
}: ChatWindowProps) {
  const { user } = useAuth()
  const { sendMessage, sendPrivateMessage, typingUsers } = useSocket()

  if (!selectedRoom && !selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to ChatApp
          </h3>
          <p className="text-gray-500 max-w-sm">
            Select a room or start a private conversation to begin chatting
          </p>
        </div>
      </div>
    )
  }

  const handleSendMessage = (content: string, messageType: string = 'text', fileData?: any) => {
    if (!content.trim() && messageType === 'text') return

    const messageData = {
      content: content.trim(),
      user_id: user?.id!,
      message_type: messageType,
      file_url: fileData?.url,
      file_name: fileData?.name,
      file_size: fileData?.size,
    }

    if (selectedRoom) {
      sendMessage({
        ...messageData,
        room_id: selectedRoom.id,
      })
    } else if (selectedUser) {
      sendPrivateMessage({
        ...messageData,
        private_to: selectedUser.id,
      })
    }
  }

  const currentTypingUsers = selectedRoom 
    ? typingUsers[selectedRoom.id] || []
    : []

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedRoom ? (
              <>
                {selectedRoom.type === 'public' ? (
                  <Hash className="h-5 w-5 text-gray-400" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedRoom.name}
                  </h2>
                  {selectedRoom.description && (
                    <p className="text-sm text-gray-500">
                      {selectedRoom.description}
                    </p>
                  )}
                </div>
              </>
            ) : selectedUser ? (
              <>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedUser.username}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedUser.status}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex items-center space-x-2">
            {selectedRoom && (
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          currentUserId={user?.id!}
          typingUsers={currentTypingUsers}
        />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          onSendMessage={handleSendMessage}
          roomId={selectedRoom?.id}
          disabled={!selectedRoom && !selectedUser}
        />
      </div>
    </div>
  )
}
