-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private')),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_members table
CREATE TABLE public.room_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  private_to UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_message_target CHECK (
    (room_id IS NOT NULL AND private_to IS NULL) OR 
    (room_id IS NULL AND private_to IS NOT NULL)
  )
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create media_files table
CREATE TABLE public.media_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_messages_private_to ON public.messages(private_to);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for chat_rooms table
CREATE POLICY "Anyone can view public rooms" ON public.chat_rooms FOR SELECT USING (type = 'public');
CREATE POLICY "Room members can view private rooms" ON public.chat_rooms FOR SELECT USING (
  type = 'private' AND EXISTS (
    SELECT 1 FROM public.room_members WHERE room_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update rooms" ON public.chat_rooms FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for room_members table
CREATE POLICY "Room members can view room membership" ON public.room_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_members.room_id AND user_id = auth.uid())
);
CREATE POLICY "Room admins can manage membership" ON public.room_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.room_members 
    WHERE room_id = room_members.room_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);
CREATE POLICY "Users can join public rooms" ON public.room_members FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.chat_rooms WHERE id = room_id AND type = 'public'
  )
);

-- RLS Policies for messages table
CREATE POLICY "Room members can view room messages" ON public.messages FOR SELECT USING (
  (room_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
  )) OR
  (private_to IS NOT NULL AND (user_id = auth.uid() OR private_to = auth.uid()))
);
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
    )) OR
    (private_to IS NOT NULL)
  )
);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for message_reactions table
CREATE POLICY "Users can view reactions on accessible messages" ON public.message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_id AND (
      (room_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
      )) OR
      (private_to IS NOT NULL AND (user_id = auth.uid() OR private_to = auth.uid()))
    )
  )
);
CREATE POLICY "Users can manage own reactions" ON public.message_reactions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for media_files table
CREATE POLICY "Users can view media from accessible messages" ON public.media_files FOR SELECT USING (
  message_id IS NULL OR EXISTS (
    SELECT 1 FROM public.messages 
    WHERE id = message_id AND (
      (room_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.room_members WHERE room_id = messages.room_id AND user_id = auth.uid()
      )) OR
      (private_to IS NOT NULL AND (user_id = auth.uid() OR private_to = auth.uid()))
    )
  )
);
CREATE POLICY "Users can upload own media" ON public.media_files FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
