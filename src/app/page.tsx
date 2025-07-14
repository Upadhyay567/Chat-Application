'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { MessageCircle, Users, Shield, Zap, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    setIsDemoMode(!supabaseUrl || supabaseUrl === 'https://demo.supabase.co')

    if (!loading && user) {
      router.push('/chat')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Demo Mode Warning */}
        {isDemoMode && (
          <div className="mb-8 mx-auto max-w-4xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Demo Mode Active</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    The application is running in demo mode. To enable full functionality including authentication and database features,
                    please set up Supabase by following the instructions in the README.
                  </p>
                  <div className="mt-3">
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-yellow-800 hover:text-yellow-900"
                    >
                      Get started with Supabase
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">ChatApp</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with friends, join chat rooms, share media, and experience real-time messaging like never before.
          </p>
          <div className="flex gap-4 justify-center">
            {isDemoMode ? (
              <div className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="px-8" disabled>
                    Get Started (Setup Required)
                  </Button>
                  <Button variant="outline" size="lg" className="px-8" disabled>
                    Sign In (Setup Required)
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Set up Supabase to enable authentication and start chatting
                </p>
              </div>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-gray-600">Instant messaging with typing indicators and delivery status</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat Rooms</h3>
            <p className="text-gray-600">Join public rooms or create private spaces for your team</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Private Messages</h3>
            <p className="text-gray-600">Secure one-on-one conversations with end-to-end encryption</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Zap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Media Sharing</h3>
            <p className="text-gray-600">Share images, videos, documents, and more with ease</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start chatting?</h2>
          <p className="text-gray-600 mb-8">Join thousands of users already connecting on ChatApp</p>
          {isDemoMode ? (
            <div className="space-y-4">
              <Button size="lg" className="px-12" disabled>
                Create Your Account (Setup Required)
              </Button>
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Setup Guide:</h3>
                <ol className="text-left text-sm text-gray-600 space-y-1">
                  <li>1. Create a free Supabase account</li>
                  <li>2. Run the SQL schema from supabase-schema.sql</li>
                  <li>3. Update .env.local with your Supabase credentials</li>
                  <li>4. Restart the application</li>
                </ol>
              </div>
            </div>
          ) : (
            <Link href="/auth/register">
              <Button size="lg" className="px-12">
                Create Your Account
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
