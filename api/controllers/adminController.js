const supabase = require('../config/supabase');

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const { data: userStats } = await supabase
      .from('users')
      .select('created_at, role')
      .order('created_at', { ascending: false });

    const totalUsers = userStats?.length || 0;
    const newUsers30d = userStats?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0;
    const newUsers7d = userStats?.filter(u => new Date(u.created_at) >= sevenDaysAgo).length || 0;
    const adminUsers = userStats?.filter(u => u.role === 'admin').length || 0;

    // Get content statistics
    const [placesResult, eventsResult, restaurantsResult, postsResult] = await Promise.all([
      supabase.from('places').select('approved, created_at'),
      supabase.from('events').select('approved, created_at'),
      supabase.from('restaurants').select('approved, created_at'),
      supabase.from('posts').select('status, created_at')
    ]);

    const places = placesResult.data || [];
    const events = eventsResult.data || [];
    const restaurants = restaurantsResult.data || [];
    const posts = postsResult.data || [];

    // Calculate content stats
    const contentStats = {
      places: {
        total: places.length,
        approved: places.filter(p => p.approved).length,
        pending: places.filter(p => !p.approved).length,
        new30d: places.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length
      },
      events: {
        total: events.length,
        approved: events.filter(e => e.approved).length,
        pending: events.filter(e => !e.approved).length,
        new30d: events.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length
      },
      restaurants: {
        total: restaurants.length,
        approved: restaurants.filter(r => r.approved).length,
        pending: restaurants.filter(r => !r.approved).length,
        new30d: restaurants.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length
      },
      posts: {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        draft: posts.filter(p => p.status === 'draft').length,
        moderated: posts.filter(p => p.status === 'moderated').length,
        new30d: posts.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length
      }
    };

    // Get moderation flags
    const { data: moderationFlags } = await supabase
      .from('moderation_flags')
      .select('status, created_at');

    const moderationStats = {
      total: moderationFlags?.length || 0,
      pending: moderationFlags?.filter(f => f.status === 'pending').length || 0,
      resolved: moderationFlags?.filter(f => f.status === 'resolved').length || 0,
      new7d: moderationFlags?.filter(f => new Date(f.created_at) >= sevenDaysAgo).length || 0
    };

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          new30d: newUsers30d,
          new7d: newUsers7d,
          admins: adminUsers
        },
        content: contentStats,
        moderation: moderationStats,
        overview: {
          totalContent: places.length + events.length + restaurants.length + posts.length,
          pendingApproval: contentStats.places.pending + contentStats.events.pending + contentStats.restaurants.pending,
          pendingModeration: moderationStats.pending
        }
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

// User Management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, role, created_at, stats, profile_image')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

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
        total: count || users.length,
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
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's content counts
    const [placesResult, eventsResult, restaurantsResult, postsResult] = await Promise.all([
      supabase.from('places').select('id').eq('submitted_by', id),
      supabase.from('events').select('id').eq('submitted_by', id),
      supabase.from('restaurants').select('id').eq('submitted_by', id),
      supabase.from('posts').select('id').eq('author_id', id)
    ]);

    const userStats = {
      placesSubmitted: placesResult.data?.length || 0,
      eventsSubmitted: eventsResult.data?.length || 0,
      restaurantsSubmitted: restaurantsResult.data?.length || 0,
      postsCreated: postsResult.data?.length || 0
    };

    res.json({
      success: true,
      user: {
        ...user,
        contentStats: userStats
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, settings } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        role,
        settings,
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
    const { reason, duration } = req.body;

    // For now, we'll use a settings field to track suspension
    const { data: user, error } = await supabase
      .from('users')
      .update({
        settings: {
          suspended: true,
          suspensionReason: reason,
          suspensionDate: new Date(),
          suspensionDuration: duration
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error suspending user'
      });
    }

    res.json({
      success: true,
      message: 'User suspended successfully',
      user
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

    const { data: user, error } = await supabase
      .from('users')
      .update({
        settings: {
          suspended: false,
          suspensionReason: null,
          suspensionDate: null,
          suspensionDuration: null
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error activating user'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      user
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
    const { newRole } = req.body;

    if (!['user', 'contributor', 'admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }

    res.json({
      success: true,
      message: `User promoted to ${newRole}`,
      user
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

// Content Moderation
const getContentForModeration = async (req, res) => {
  try {
    const { type = 'all', status = 'pending', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let content = [];

    // Get places awaiting approval
    if (type === 'all' || type === 'places') {
      const { data: places } = await supabase
        .from('places')
        .select(`
          *,
          submitter:users(id, name, email)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (places) {
        content.push(...places.map(p => ({ ...p, content_type: 'place' })));
      }
    }

    // Get events awaiting approval
    if (type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select(`
          *,
          submitter:users(id, name, email)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (events) {
        content.push(...events.map(e => ({ ...e, content_type: 'event' })));
      }
    }

    // Get restaurants awaiting approval
    if (type === 'all' || type === 'restaurants') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select(`
          *,
          submitter:users(id, name, email)
        `)
        .eq('approved', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (restaurants) {
        content.push(...restaurants.map(r => ({ ...r, content_type: 'restaurant' })));
      }
    }

    // Get flagged content
    const { data: flags } = await supabase
      .from('moderation_flags')
      .select(`
        *,
        reporter:users(id, name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    res.json({
      success: true,
      content,
      flags: flags || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: content.length === parseInt(limit)
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
    const { action, contentType, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve or reject'
      });
    }

    let tableName;
    switch (contentType) {
      case 'place':
        tableName = 'places';
        break;
      case 'event':
        tableName = 'events';
        break;
      case 'restaurant':
        tableName = 'restaurants';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from(tableName)
        .update({ approved: true })
        .eq('id', id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error approving content'
        });
      }
    } else {
      // For rejection, we might want to keep the record but mark it as rejected
      const { error } = await supabase
        .from(tableName)
        .update({ 
          approved: false,
          rejection_reason: reason 
        })
        .eq('id', id);

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error rejecting content'
        });
      }
    }

    res.json({
      success: true,
      message: `Content ${action}d successfully`
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
    const { items, action } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const results = [];
    for (const item of items) {
      try {
        let tableName;
        switch (item.contentType) {
          case 'place':
            tableName = 'places';
            break;
          case 'event':
            tableName = 'events';
            break;
          case 'restaurant':
            tableName = 'restaurants';
            break;
          default:
            continue;
        }

        const { error } = await supabase
          .from(tableName)
          .update({ approved: action === 'approve' })
          .eq('id', item.id);

        results.push({
          id: item.id,
          success: !error,
          error: error?.message
        });
      } catch (err) {
        results.push({
          id: item.id,
          success: false,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Bulk review content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Analytics
const getAnalytics = {
  users: async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      let dateThreshold;
      switch (timeframe) {
        case '7d':
          dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const { data: users } = await supabase
        .from('users')
        .select('created_at, role')
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: true });

      // Group by day
      const dailyStats = {};
      users?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { total: 0, users: 0, contributors: 0, admins: 0 };
        }
        dailyStats[date].total++;
        dailyStats[date][user.role + 's']++;
      });

      res.json({
        success: true,
        analytics: {
          timeframe,
          dailyStats,
          total: users?.length || 0
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
      
      let dateThreshold;
      switch (timeframe) {
        case '7d':
          dateThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const [placesResult, eventsResult, restaurantsResult, postsResult] = await Promise.all([
        supabase.from('places').select('created_at, approved').gte('created_at', dateThreshold.toISOString()),
        supabase.from('events').select('created_at, approved').gte('created_at', dateThreshold.toISOString()),
        supabase.from('restaurants').select('created_at, approved').gte('created_at', dateThreshold.toISOString()),
        supabase.from('posts').select('created_at, status').gte('created_at', dateThreshold.toISOString())
      ]);

      const contentByType = {
        places: placesResult.data || [],
        events: eventsResult.data || [],
        restaurants: restaurantsResult.data || [],
        posts: postsResult.data || []
      };

      // Group by day
      const dailyStats = {};
      Object.entries(contentByType).forEach(([type, items]) => {
        items.forEach(item => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          if (!dailyStats[date]) {
            dailyStats[date] = { total: 0, places: 0, events: 0, restaurants: 0, posts: 0 };
          }
          dailyStats[date].total++;
          dailyStats[date][type]++;
        });
      });

      res.json({
        success: true,
        analytics: {
          timeframe,
          dailyStats,
          totals: {
            places: contentByType.places.length,
            events: contentByType.events.length,
            restaurants: contentByType.restaurants.length,
            posts: contentByType.posts.length
          }
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

// Settings
const getSettings = async (req, res) => {
  try {
    // For now, return default settings since we don't have a settings table
    const settings = {
      site: {
        name: 'Chill Find Explore',
        description: 'Discover authentic local experiences',
        maintenanceMode: false
      },
      moderation: {
        autoApprove: false,
        requireApproval: true,
        flagThreshold: 5
      },
      notifications: {
        emailNotifications: true,
        newContentAlert: true,
        moderationAlert: true
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
    const { settings } = req.body;

    // For now, just return the settings as if updated
    // In a real implementation, you'd save these to a settings table
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