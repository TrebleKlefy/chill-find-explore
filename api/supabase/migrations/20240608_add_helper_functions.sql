-- Helper functions for updating post counters

-- Function to increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET likes = likes + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post comments
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comments = comments + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post comments
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comments = GREATEST(comments - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Functions for radius searches
CREATE OR REPLACE FUNCTION places_within_radius(lat FLOAT, lng FLOAT, radius_meters INTEGER)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  sub_category TEXT,
  mood_tags TEXT[],
  location GEOGRAPHY,
  address JSONB,
  images TEXT[],
  opening_hours JSONB,
  contact_info JSONB,
  features TEXT[],
  price_range TEXT,
  rating JSONB,
  submitted_by UUID,
  approved BOOLEAN,
  views INTEGER,
  likes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM places p
  WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    radius_meters
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION events_within_radius(lat FLOAT, lng FLOAT, radius_meters INTEGER)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location GEOGRAPHY,
  address JSONB,
  venue TEXT,
  organizer JSONB,
  images TEXT[],
  price JSONB,
  capacity INTEGER,
  current_attendees INTEGER,
  mood_tags TEXT[],
  features TEXT[],
  social_media JSONB,
  status TEXT,
  submitted_by UUID,
  approved BOOLEAN,
  views INTEGER,
  likes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM events e
  WHERE ST_DWithin(
    e.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    radius_meters
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restaurants_within_radius(lat FLOAT, lng FLOAT, radius_meters INTEGER)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  cuisine TEXT[],
  location GEOGRAPHY,
  address JSONB,
  contact_info JSONB,
  opening_hours JSONB,
  images TEXT[],
  menu JSONB[],
  price_range TEXT,
  features TEXT[],
  mood_tags TEXT[],
  rating JSONB,
  social_media JSONB,
  special_features JSONB,
  submitted_by UUID,
  approved BOOLEAN,
  views INTEGER,
  likes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM restaurants r
  WHERE ST_DWithin(
    r.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    radius_meters
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION posts_within_radius(lat FLOAT, lng FLOAT, radius_meters INTEGER)
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  images TEXT[],
  author_id UUID,
  location GEOGRAPHY,
  tags TEXT[],
  metadata JSONB,
  status TEXT,
  likes INTEGER,
  comments INTEGER,
  views INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM posts p
  WHERE p.location IS NOT NULL
  AND ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326),
    radius_meters
  );
END;
$$ LANGUAGE plpgsql;