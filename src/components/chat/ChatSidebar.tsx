'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChatRoom, User } from '@/lib/supabase'
import { 
  Plus, 
  Hash, 
  Lock, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut,
  Search,
  UserPlus
} from 'lucide-react'
import CreateRoomModal from './CreateRoomModal'

interface ChatSidebarProps {
  rooms: ChatRoom[]
  selectedRoom: ChatRoom | null
  selectedUser: User | null
  onRoomSelect: (room: ChatRoom) => void
  onUserSelect: (user: User) => void
  onCreateRoom: (name: string, description: string, type: 'public' | 'private') => Promise<ChatRoom | null>
}

export default function ChatSidebar({
  rooms,
  selectedRoom,
  selectedUser,
  onRoomSelect,
  onUserSelect,
  onCreateRoom
}: ChatSidebarProps) {
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'rooms' | 'users'>('rooms')
  const { user, signOut } = useAuth()
  const { onlineUsers } = useSocket()

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = onlineUsers.filter(u =>
    u.id !== user?.id && 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">ChatApp</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateRoom(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'rooms'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Hash className="h-4 w-4 inline mr-2" />
          Rooms
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Users ({onlineUsers.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'rooms' ? (
          <div className="p-2">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No rooms found</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowCreateRoom(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {room.type === 'public' ? (
                        <Hash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{room.name}</p>
                        {room.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {room.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users online</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((onlineUser) => (
                  <button
                    key={onlineUser.id}
                    onClick={() => onUserSelect(onlineUser)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedUser?.id === onlineUser.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {onlineUser.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{onlineUser.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{onlineUser.status}</p>
                      </div>
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={onCreateRoom}
        />
      )}
    </div>
  )
}
