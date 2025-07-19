const supabase = require('../config/supabase');

const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, userId, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, profile_image)
      `)
      .eq('status', 'published')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (userId) query = query.eq('author_id', userId);

    const { data: posts, error } = await query;

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
        total: posts.length,
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
        author:users(id, name, profile_image, bio)
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
    const { data: postData } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    await supabase
      .from('posts')
      .update({ likes: (postData.likes || 0) + 1 })
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
    const { data: postData } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', id)
      .single();

    await supabase
      .from('posts')
      .update({ likes: Math.max((postData.likes || 0) - 1, 0) })
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
    const { data: postData } = await supabase
      .from('posts')
      .select('comments')
      .eq('id', id)
      .single();

    await supabase
      .from('posts')
      .update({ comments: (postData.comments || 0) + 1 })
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