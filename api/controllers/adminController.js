const supabase = require('../config/supabase');

const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [
      { count: usersCount },
      { count: placesCount },
      { count: eventsCount },
      { count: restaurantsCount },
      { count: postsCount },
      { count: pendingFlags }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('places').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('moderation_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    // Get recent activity
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, created_at, author:users(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      stats: {
        users: usersCount || 0,
        places: placesCount || 0,
        events: eventsCount || 0,
        restaurants: restaurantsCount || 0,
        posts: postsCount || 0,
        pendingModerationFlags: pendingFlags || 0
      },
      recentActivity: {
        users: recentUsers || [],
        posts: recentPosts || []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        posts:posts(count),
        favorites:user_favorites(count),
        collections:user_collections(count)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { error } = await supabase
      .from('users')
      .update({
        role: 'suspended',
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error suspending user'
      });
    }

    // Log admin action
    await supabase
      .from('user_activity')
      .insert({
        user_id: id,
        type: 'admin_action',
        title: 'Account suspended',
        description: reason || 'Account suspended by admin',
        data: { action: 'suspend', admin_id: req.user.id, reason }
      });

    res.json({
      success: true,
      message: 'User suspended successfully'
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .update({
        role: 'user',
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error activating user'
      });
    }

    // Log admin action
    await supabase
      .from('user_activity')
      .insert({
        user_id: id,
        type: 'admin_action',
        title: 'Account activated',
        description: 'Account activated by admin',
        data: { action: 'activate', admin_id: req.user.id }
      });

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const promoteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'contributor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const { error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }

    // Log admin action
    await supabase
      .from('user_activity')
      .insert({
        user_id: id,
        type: 'admin_action',
        title: `Role changed to ${role}`,
        description: `User role changed to ${role} by admin`,
        data: { action: 'promote', admin_id: req.user.id, new_role: role }
      });

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getContentForModeration = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending', type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('moderation_flags')
      .select(`
        *,
        reported_by:users(id, name),
        content_type,
        content_id
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('content_type', type);
    }

    const { data: flags, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    res.json({
      success: true,
      flags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: flags.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get content for moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const reviewContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve', 'reject', 'dismiss'

    if (!['approve', 'reject', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const { error } = await supabase
      .from('moderation_flags')
      .update({
        status: action === 'approve' ? 'resolved' : action === 'reject' ? 'resolved' : 'dismissed',
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error reviewing content'
      });
    }

    res.json({
      success: true,
      message: 'Content reviewed successfully'
    });
  } catch (error) {
    console.error('Review content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const bulkReviewContent = async (req, res) => {
  try {
    const { flagIds, action } = req.body;

    if (!Array.isArray(flagIds) || !['approve', 'reject', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    const { error } = await supabase
      .from('moderation_flags')
      .update({
        status: action === 'approve' ? 'resolved' : action === 'reject' ? 'resolved' : 'dismissed',
        updated_at: new Date()
      })
      .in('id', flagIds);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error bulk reviewing content'
      });
    }

    res.json({
      success: true,
      message: `${flagIds.length} items reviewed successfully`
    });
  } catch (error) {
    console.error('Bulk review content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAnalytics = {
  users: async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 30;
      const fromDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

      // Get user registration stats
      const { data: userStats } = await supabase
        .from('users')
        .select('created_at, role')
        .gte('created_at', fromDate.toISOString());

      // Get user activity stats
      const { data: activityStats } = await supabase
        .from('user_activity')
        .select('type, created_at')
        .gte('created_at', fromDate.toISOString());

      res.json({
        success: true,
        analytics: {
          userRegistrations: userStats || [],
          userActivity: activityStats || []
        }
      });
    } catch (error) {
      console.error('User analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  content: async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 30;
      const fromDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

      const [
        { data: posts },
        { data: places },
        { data: events },
        { data: restaurants }
      ] = await Promise.all([
        supabase.from('posts').select('created_at, type').gte('created_at', fromDate.toISOString()),
        supabase.from('places').select('created_at, category').gte('created_at', fromDate.toISOString()),
        supabase.from('events').select('created_at, type').gte('created_at', fromDate.toISOString()),
        supabase.from('restaurants').select('created_at, type').gte('created_at', fromDate.toISOString())
      ]);

      res.json({
        success: true,
        analytics: {
          posts: posts || [],
          places: places || [],
          events: events || [],
          restaurants: restaurants || []
        }
      });
    } catch (error) {
      console.error('Content analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
};

const getSettings = async (req, res) => {
  try {
    // For now, return mock settings - in production, these would be stored in database
    const settings = {
      app: {
        maintenanceMode: false,
        registrationOpen: true,
        requireEmailVerification: true
      },
      content: {
        autoApproveContent: false,
        maxImagesPerPost: 10,
        maxPostLength: 2000
      },
      moderation: {
        autoFlagKeywords: ['spam', 'inappropriate'],
        requireManualApproval: true
      }
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    // In production, save to database
    // For now, just return success
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};