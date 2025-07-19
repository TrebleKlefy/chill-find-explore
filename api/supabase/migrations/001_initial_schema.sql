-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  bio TEXT,
  location GEOGRAPHY(POINT, 4326),
  preferences JSONB DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'contributor', 'admin')),
  contributions JSONB DEFAULT '{"placesSubmitted": 0, "placesApproved": 0, "reviewsSubmitted": 0}',
  saved_places UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places table
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beach', 'restaurant', 'event', 'nature', 'cultural', 'other')),
  sub_category TEXT,
  mood_tags TEXT[],
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address JSONB,
  images TEXT[],
  opening_hours JSONB,
  contact_info JSONB,
  features TEXT[],
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  rating JSONB DEFAULT '{"average": 0, "count": 0}',
  submitted_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('popup', 'festival', 'concert', 'market', 'sports', 'cultural', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address JSONB,
  venue TEXT,
  organizer JSONB,
  images TEXT[],
  price JSONB,
  capacity INTEGER,
  current_attendees INTEGER DEFAULT 0,
  mood_tags TEXT[],
  features TEXT[],
  social_media JSONB,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  submitted_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('restaurant', 'cafe', 'food_truck', 'bar', 'pub', 'street_food', 'other')),
  cuisine TEXT[],
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address JSONB,
  contact_info JSONB,
  opening_hours JSONB,
  images TEXT[],
  menu JSONB[],
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  features TEXT[],
  mood_tags TEXT[],
  rating JSONB DEFAULT '{"average": 0, "count": 0}',
  social_media JSONB,
  special_features JSONB DEFAULT '{}',
  submitted_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant reviews table
CREATE TABLE restaurant_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(restaurant_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_places_location ON places USING GIST (location);
CREATE INDEX idx_events_location ON events USING GIST (location);
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (location);
CREATE INDEX idx_users_location ON users USING GIST (location);

CREATE INDEX idx_events_dates ON events (start_date, end_date);
CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_events_type ON events (type);
CREATE INDEX idx_restaurants_type ON restaurants (type);

-- Create functions for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Create policies for places table
CREATE POLICY "Everyone can view approved places" ON places FOR SELECT USING (approved = true OR auth.uid() = submitted_by);
CREATE POLICY "Authenticated users can create places" ON places FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own places" ON places FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "Users can delete own places" ON places FOR DELETE USING (auth.uid() = submitted_by);

-- Create policies for events table
CREATE POLICY "Everyone can view approved events" ON events FOR SELECT USING (approved = true OR auth.uid() = submitted_by);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = submitted_by);

-- Create policies for restaurants table
CREATE POLICY "Everyone can view approved restaurants" ON restaurants FOR SELECT USING (approved = true OR auth.uid() = submitted_by);
CREATE POLICY "Authenticated users can create restaurants" ON restaurants FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own restaurants" ON restaurants FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "Users can delete own restaurants" ON restaurants FOR DELETE USING (auth.uid() = submitted_by);

-- Create policies for restaurant reviews table
CREATE POLICY "Everyone can view reviews" ON restaurant_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON restaurant_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON restaurant_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON restaurant_reviews FOR DELETE USING (auth.uid() = user_id); 