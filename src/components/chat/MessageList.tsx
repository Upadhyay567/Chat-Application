'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { File, Image as ImageIcon, Video, Download } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  typingUsers: string[]
}

export default function MessageList({ messages, currentUserId, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const renderMessageContent = (message: Message) => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="max-w-sm">
            <img
              src={message.file_url}
              alt={message.file_name || 'Image'}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url, '_blank')}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="max-w-sm">
            <video
              src={message.file_url}
              controls
              className="rounded-lg max-w-full h-auto"
            >
              Your browser does not support the video tag.
            </video>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg max-w-sm">
            <File className="h-8 w-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.file_name}
              </p>
              <p className="text-xs text-gray-500">
                {message.file_size && formatFileSize(message.file_size)}
              </p>
            </div>
            <a
              href={message.file_url}
              download={message.file_name}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        )
      
      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messageGroups).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-xs text-gray-500 font-medium">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          {dayMessages.map((message, index) => {
            const isOwnMessage = message.user_id === currentUserId
            const showAvatar = index === 0 || dayMessages[index - 1].user_id !== message.user_id
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-4' : 'mt-1'
                }`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <div className="flex-shrink-0 mr-3">
                      {showAvatar ? (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(message as any).users?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {/* Username for received messages */}
                    {!isOwnMessage && showAvatar && (
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {(message as any).users?.username || 'Unknown User'}
                      </p>
                    )}

                    {/* Message content */}
                    {renderMessageContent(message)}

                    {/* Timestamp */}
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="flex max-w-xs lg:max-w-md">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8" />
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
