'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ChatRoom } from '@/lib/supabase'
import { X, Hash, Lock } from 'lucide-react'

interface CreateRoomModalProps {
  onClose: () => void
  onCreateRoom: (name: string, description: string, type: 'public' | 'private') => Promise<ChatRoom | null>
}

export default function CreateRoomModal({ onClose, onCreateRoom }: CreateRoomModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'public' | 'private'>('public')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    setLoading(true)
    try {
      const room = await onCreateRoom(name.trim(), description.trim(), type)
      if (room) {
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create New Room</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Enter room description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={type === 'public'}
                  onChange={(e) => setType(e.target.value as 'public' | 'private')}
                  className="text-blue-600"
                />
                <Hash className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Public</p>
                  <p className="text-xs text-gray-500">Anyone can join this room</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={type === 'private'}
                  onChange={(e) => setType(e.target.value as 'public' | 'private')}
                  className="text-blue-600"
                />
                <Lock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Private</p>
                  <p className="text-xs text-gray-500">Only invited members can join</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Room'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
