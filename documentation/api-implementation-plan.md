# API Implementation Plan

## Overview

This document provides a detailed implementation plan for completing the missing API features identified in the analysis. It includes specific code examples, database migrations, and step-by-step instructions.

## Phase 1: Database Schema Extensions

### Step 1.1: Create Database Migration

Create a new migration file: `api/supabase/migrations/20240608_add_missing_tables.sql`

```sql
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
```

### Step 1.2: Update Existing Tables

Add missing fields to existing tables:

```sql
-- Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"posts": 0, "likes": 0, "comments": 0, "views": 0, "followers": 0, "following": 0}';

-- Add missing fields to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id);
ALTER TABLE places ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE places ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add missing fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add missing fields to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
```

## Phase 2: Middleware Extensions

### Step 2.1: Create Additional Middleware

#### `api/middleware/adminAuth.js`
```javascript
const { auth } = require('./auth');

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin only.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Please authenticate' 
    });
  }
};

module.exports = { adminAuth };
```

#### `api/middleware/validation.js`
```javascript
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

const validatePost = [
  body('type').isIn(['event', 'restaurant', 'chill']).withMessage('Invalid post type'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1 and 2000 characters'),
  body('location').isObject().withMessage('Location must be an object'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  handleValidationErrors
];

const validateUserSettings = [
  body('notifications.email.marketing').optional().isBoolean(),
  body('privacy.profileVisibility').optional().isIn(['public', 'private', 'friends']),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePost,
  validateUserSettings
};
```

#### `api/middleware/upload.js`
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: fileFilter
});

module.exports = { upload };
```

#### `api/middleware/errorHandler.js`
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Token expired' 
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
};

module.exports = { errorHandler };
```

## Phase 3: New Route Files

### Step 3.1: Create Authentication Routes

#### `api/routes/auth.js`
```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  logout,
  refreshToken,
  getCurrentUser
} = require('../controllers/authController');

// Auth routes
router.post('/logout', auth, logout);
router.post('/refresh', refreshToken);
router.get('/me', auth, getCurrentUser);

module.exports = router;
```

### Step 3.2: Create Posts Routes

#### `api/routes/posts.js`
```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  reportPost
} = require('../controllers/postController');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/comments', getComments);

// Protected routes
router.post('/', auth, validatePost, createPost);
router.put('/:id', auth, validatePost, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likePost);
router.delete('/:id/like', auth, unlikePost);
router.post('/:id/comment', auth, addComment);
router.post('/:id/report', auth, reportPost);

module.exports = router;
```

### Step 3.3: Create Search Routes

#### `api/routes/search.js`
```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  search,
  getSuggestions
} = require('../controllers/searchController');

// Public routes
router.get('/', search);
router.get('/suggestions', getSuggestions);

module.exports = router;
```

### Step 3.4: Create Discovery Routes

#### `api/routes/discovery.js`
```javascript
const express = require('express');
const router = express.Router();
const {
  getMoodBasedRecommendations,
  getTrendingPlaces
} = require('../controllers/discoveryController');

// Public routes
router.get('/mood-based', getMoodBasedRecommendations);
router.get('/trending', getTrendingPlaces);

module.exports = router;
```

### Step 3.5: Create Admin Routes

#### `api/routes/admin.js`
```javascript
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  suspendUser,
  activateUser,
  promoteUser,
  deleteUser,
  getContentForModeration,
  reviewContent,
  bulkReviewContent,
  getAnalytics,
  getSettings,
  updateSettings
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// User management
router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserById);
router.put('/users/:id', adminAuth, updateUser);
router.post('/users/:id/suspend', adminAuth, suspendUser);
router.post('/users/:id/activate', adminAuth, activateUser);
router.post('/users/:id/promote', adminAuth, promoteUser);
router.delete('/users/:id', adminAuth, deleteUser);

// Content moderation
router.get('/content', adminAuth, getContentForModeration);
router.post('/content/:id/review', adminAuth, reviewContent);
router.post('/content/bulk-review', adminAuth, bulkReviewContent);

// Analytics
router.get('/analytics/users', adminAuth, getAnalytics.users);
router.get('/analytics/content', adminAuth, getAnalytics.content);

// Settings
router.get('/settings', adminAuth, getSettings);
router.put('/settings', adminAuth, updateSettings);

module.exports = router;
```

## Phase 4: New Controllers

### Step 4.1: Create Auth Controller

#### `api/controllers/authController.js`
```javascript
const supabase = require('../config/supabase');

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    res.json({
      success: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  logout,
  refreshToken,
  getCurrentUser
};
```

### Step 4.2: Create Post Controller

#### `api/controllers/postController.js`
```javascript
const supabase = require('../config/supabase');

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, userId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, profile_image),
        location,
        tags,
        metadata
      `)
      .eq('status', 'published')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (userId) {
      query = query.eq('author_id', userId);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || posts.length,
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, profile_image, bio),
        location,
        tags,
        metadata
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await supabase
      .from('posts')
      .update({ views: post.views + 1 })
      .eq('id', id);

    res.json({
      success: true,
      post: { ...post, views: post.views + 1 }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { type, title, description, location, tags, metadata } = req.body;
    const authorId = req.user.id;

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        type,
        title,
        description,
        location,
        tags,
        metadata,
        author_id: authorId
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating post'
      });
    }

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, location, tags, metadata } = req.body;
    const userId = req.user.id;

    // Check if user owns the post
    const { data: existingPost, error: checkError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (checkError || !existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update({
        type,
        title,
        description,
        location,
        tags,
        metadata,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating post'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the post
    const { data: post, error: checkError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (checkError || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting post'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Post already liked'
      });
    }

    // Add like
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        post_id: id,
        user_id: userId
      });

    if (likeError) {
      return res.status(500).json({
        success: false,
        message: 'Error liking post'
      });
    }

    // Update post like count
    await supabase
      .from('posts')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Post liked successfully'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error unliking post'
      });
    }

    // Update post like count
    await supabase
      .from('posts')
      .update({ likes: supabase.raw('GREATEST(likes - 1, 0)') })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Post unliked successfully'
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:users(id, name, profile_image)
      `)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding comment'
      });
    }

    // Update post comment count
    await supabase
      .from('posts')
      .update({ comments: supabase.raw('comments + 1') })
      .eq('id', id);

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, profile_image)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('moderation_flags')
      .insert({
        reported_by: userId,
        content_type: 'post',
        content_id: id,
        reason,
        description
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error reporting post'
      });
    }

    res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  reportPost
};
```

## Phase 5: Update App Configuration

### Step 5.1: Update `api/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const placesRoutes = require('./routes/places');
const eventsRoutes = require('./routes/events');
const restaurantsRoutes = require('./routes/restaurants');
const postsRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const discoveryRoutes = require('./routes/discovery');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

module.exports = app;
```

## Phase 6: Update Package Dependencies

### Step 6.1: Update `api/package.json`

```json
{
  "name": "chill-find-explore-api",
  "version": "1.0.0",
  "description": "API for Chill Find Explore location-based discovery app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "supabase db push",
    "seed": "supabase db reset"
  },
  "keywords": ["location", "discovery", "places", "events", "restaurants"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "helmet": "^6.0.1",
    "jsonwebtoken": "^9.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
```

## Implementation Timeline

### Week 1: Database & Core Infrastructure
- [ ] Run database migrations
- [ ] Create new middleware files
- [ ] Update app configuration
- [ ] Install new dependencies

### Week 2: Authentication & User Management
- [ ] Implement auth controller
- [ ] Create auth routes
- [ ] Extend user controller
- [ ] Add user settings endpoints

### Week 3: Content Management
- [ ] Implement post controller
- [ ] Create post routes
- [ ] Add image upload functionality
- [ ] Implement draft management

### Week 4: Search & Discovery
- [ ] Implement search controller
- [ ] Create discovery controller
- [ ] Add mood-based recommendations
- [ ] Implement search suggestions

### Week 5: Social Features
- [ ] Add like/unlike functionality
- [ ] Implement comments system
- [ ] Create user collections
- [ ] Add follow/unfollow features

### Week 6: Admin Dashboard
- [ ] Implement admin controller
- [ ] Create admin routes
- [ ] Add analytics endpoints
- [ ] Implement moderation system

### Week 7: Testing & Documentation
- [ ] Update Postman collection
- [ ] Add comprehensive tests
- [ ] Update API documentation
- [ ] Performance optimization

## Estimated Effort

- **Database Schema:** 4 hours
- **Middleware Development:** 8 hours
- **Controller Implementation:** 24 hours
- **Route Creation:** 8 hours
- **Testing & Documentation:** 16 hours
- **Total Estimated Time:** 60 hours

This implementation plan provides a complete roadmap for extending the current API to support all the features documented in our comprehensive API documentation. 