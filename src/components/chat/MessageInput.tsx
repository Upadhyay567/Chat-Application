'use client'

import { useState, useRef } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Send, Paperclip, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, fileData?: any) => void
  roomId?: string
  disabled?: boolean
}

export default function MessageInput({ onSendMessage, roomId, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { sendTyping } = useSocket()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage('')
    handleStopTyping()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (roomId && !disabled) {
      handleStartTyping()
    }
  }

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      sendTyping(roomId!, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 2000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      if (roomId) {
        sendTyping(roomId, false)
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For now, we'll just show an alert. In a real app, you'd upload to a service like Supabase Storage
    alert('File upload functionality would be implemented here. For now, only text messages are supported.')
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={disabled ? "Select a room or user to start chatting..." : "Type a message..."}
            value={message}
            onChange={handleInputChange}
            disabled={disabled}
            className="pr-20"
            onBlur={handleStopTyping}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 w-8"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-8 w-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
      </form>
    </div>
  )
}
