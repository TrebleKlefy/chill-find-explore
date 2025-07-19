-- Add missing tables for complete functionality

-- Posts table for user-generated content
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('event', 'restaurant', 'chill')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'moderated')),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- User collections table
CREATE TABLE user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items table
CREATE TABLE collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES user_collections(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity table
CREATE TABLE user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation flags table
CREATE TABLE moderation_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_by UUID REFERENCES users(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- User follows table
CREATE TABLE user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_posts_type ON posts (type);
CREATE INDEX idx_posts_status ON posts (status);
CREATE INDEX idx_posts_created_at ON posts (created_at);
CREATE INDEX idx_posts_location ON posts USING GIST (location);

CREATE INDEX idx_comments_post_id ON comments (post_id);
CREATE INDEX idx_comments_user_id ON comments (user_id);
CREATE INDEX idx_comments_created_at ON comments (created_at);

CREATE INDEX idx_likes_post_id ON likes (post_id);
CREATE INDEX idx_likes_user_id ON likes (user_id);

CREATE INDEX idx_user_collections_user_id ON user_collections (user_id);
CREATE INDEX idx_collection_items_collection_id ON collection_items (collection_id);

CREATE INDEX idx_user_activity_user_id ON user_activity (user_id);
CREATE INDEX idx_user_activity_type ON user_activity (type);
CREATE INDEX idx_user_activity_created_at ON user_activity (created_at);

CREATE INDEX idx_moderation_flags_content ON moderation_flags (content_type, content_id);
CREATE INDEX idx_moderation_flags_status ON moderation_flags (status);

CREATE INDEX idx_search_history_user_id ON search_history (user_id);
CREATE INDEX idx_search_history_created_at ON search_history (created_at);

CREATE INDEX idx_user_favorites_user_id ON user_favorites (user_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows (follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows (following_id);

-- Add triggers for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view published posts" ON posts FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections" ON user_collections FOR SELECT USING (is_private = false OR auth.uid() = user_id);
CREATE POLICY "Users can create collections" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON user_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON user_collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view collection items" ON collection_items FOR SELECT USING (true);
CREATE POLICY "Users can manage collection items" ON collection_items FOR ALL USING (auth.uid() IN (
  SELECT user_id FROM user_collections WHERE id = collection_id
));

CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view moderation flags" ON moderation_flags FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Users can create moderation flags" ON moderation_flags FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- Add missing fields to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"posts": 0, "likes": 0, "comments": 0, "views": 0, "followers": 0, "following": 0}';

-- Add missing fields to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE places ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add missing fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add missing fields to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;