const supabase = require('../config/supabase');

const getMoodBasedRecommendations = async (req, res) => {
  try {
    const { mood, location, radius = 10000, limit = 10 } = req.query;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood parameter is required'
      });
    }

    // Define mood mappings to categories and tags
    const moodMappings = {
      chill: {
        placeTags: ['peaceful', 'quiet', 'relaxing', 'nature', 'scenic'],
        placeCategories: ['nature', 'beach'],
        eventTypes: ['cultural', 'other'],
        restaurantTypes: ['cafe', 'bar']
      },
      adventure: {
        placeTags: ['exciting', 'outdoor', 'active', 'adventure'],
        placeCategories: ['nature', 'cultural'],
        eventTypes: ['sports', 'festival'],
        restaurantTypes: ['other']
      },
      social: {
        placeTags: ['social', 'lively', 'popular', 'trendy'],
        placeCategories: ['restaurant', 'cultural'],
        eventTypes: ['festival', 'concert', 'market'],
        restaurantTypes: ['restaurant', 'bar', 'pub']
      },
      cultural: {
        placeTags: ['historical', 'cultural', 'artistic', 'educational'],
        placeCategories: ['cultural'],
        eventTypes: ['cultural', 'market'],
        restaurantTypes: ['restaurant']
      },
      romantic: {
        placeTags: ['romantic', 'scenic', 'intimate', 'beautiful'],
        placeCategories: ['beach', 'nature'],
        eventTypes: ['cultural'],
        restaurantTypes: ['restaurant', 'cafe']
      }
    };

    const mapping = moodMappings[mood.toLowerCase()];
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood. Available moods: chill, adventure, social, cultural, romantic'
      });
    }

    let recommendations = {
      places: [],
      events: [],
      restaurants: []
    };

    // Get place recommendations
    let placesQuery = supabase
      .from('places')
      .select('*')
      .eq('approved', true)
      .or(`mood_tags.ov.{${mapping.placeTags.join(',')}},category.in.(${mapping.placeCategories.join(',')})`);

    if (location) {
      const [lng, lat] = location.split(',');
      placesQuery = placesQuery.rpc('places_within_radius', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_meters: parseInt(radius)
      });
    }

    const { data: places, error: placesError } = await placesQuery
      .order('rating->>average', { ascending: false })
      .limit(limit);

    if (!placesError) {
      recommendations.places = places || [];
    }

    // Get event recommendations
    let eventsQuery = supabase
      .from('events')
      .select('*')
      .eq('approved', true)
      .gte('end_date', new Date().toISOString())
      .in('type', mapping.eventTypes);

    if (location) {
      const [lng, lat] = location.split(',');
      eventsQuery = eventsQuery.rpc('events_within_radius', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_meters: parseInt(radius)
      });
    }

    const { data: events, error: eventsError } = await eventsQuery
      .order('start_date', { ascending: true })
      .limit(limit);

    if (!eventsError) {
      recommendations.events = events || [];
    }

    // Get restaurant recommendations
    let restaurantsQuery = supabase
      .from('restaurants')
      .select('*')
      .eq('approved', true)
      .in('type', mapping.restaurantTypes);

    if (location) {
      const [lng, lat] = location.split(',');
      restaurantsQuery = restaurantsQuery.rpc('restaurants_within_radius', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_meters: parseInt(radius)
      });
    }

    const { data: restaurants, error: restaurantsError } = await restaurantsQuery
      .order('rating->>average', { ascending: false })
      .limit(limit);

    if (!restaurantsError) {
      recommendations.restaurants = restaurants || [];
    }

    // Save user activity if authenticated
    if (req.user) {
      await supabase
        .from('user_activity')
        .insert({
          user_id: req.user.id,
          type: 'mood_search',
          title: `Searched for ${mood} recommendations`,
          description: `User searched for ${mood}-based recommendations`,
          data: {
            mood,
            location,
            radius,
            results_count: Object.values(recommendations).reduce((sum, arr) => sum + arr.length, 0)
          }
        });
    }

    res.json({
      success: true,
      mood,
      recommendations
    });
  } catch (error) {
    console.error('Mood-based recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getTrendingPlaces = async (req, res) => {
  try {
    const { type = 'all', location, radius = 50000, limit = 20, timeframe = '7d' } = req.query;

    // Calculate date threshold based on timeframe
    const now = new Date();
    let dateThreshold;
    switch (timeframe) {
      case '1d':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let trending = {
      places: [],
      events: [],
      restaurants: []
    };

    // Get trending places (based on views and recent activity)
    if (type === 'all' || type === 'places') {
      let placesQuery = supabase
        .from('places')
        .select('*, views, likes')
        .eq('approved', true);

      if (location) {
        const [lng, lat] = location.split(',');
        placesQuery = placesQuery.rpc('places_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      const { data: places, error: placesError } = await placesQuery
        .order('views', { ascending: false })
        .order('likes', { ascending: false })
        .limit(limit);

      if (!placesError) {
        trending.places = places || [];
      }
    }

    // Get trending events (upcoming events with high interest)
    if (type === 'all' || type === 'events') {
      let eventsQuery = supabase
        .from('events')
        .select('*, views, likes')
        .eq('approved', true)
        .gte('start_date', new Date().toISOString())
        .lte('end_date', new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()); // Next 30 days

      if (location) {
        const [lng, lat] = location.split(',');
        eventsQuery = eventsQuery.rpc('events_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      const { data: events, error: eventsError } = await eventsQuery
        .order('views', { ascending: false })
        .order('likes', { ascending: false })
        .order('start_date', { ascending: true })
        .limit(limit);

      if (!eventsError) {
        trending.events = events || [];
      }
    }

    // Get trending restaurants
    if (type === 'all' || type === 'restaurants') {
      let restaurantsQuery = supabase
        .from('restaurants')
        .select('*, views, likes')
        .eq('approved', true);

      if (location) {
        const [lng, lat] = location.split(',');
        restaurantsQuery = restaurantsQuery.rpc('restaurants_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      const { data: restaurants, error: restaurantsError } = await restaurantsQuery
        .order('views', { ascending: false })
        .order('likes', { ascending: false })
        .order('rating->>average', { ascending: false })
        .limit(limit);

      if (!restaurantsError) {
        trending.restaurants = restaurants || [];
      }
    }

    // Get trending posts related to these places
    const { data: trendingPosts } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, name, profile_image)
      `)
      .eq('status', 'published')
      .gte('created_at', dateThreshold.toISOString())
      .order('views', { ascending: false })
      .order('likes', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      trending: {
        ...trending,
        posts: trendingPosts || []
      },
      timeframe,
      location: location ? { radius: parseInt(radius) } : null
    });
  } catch (error) {
    console.error('Trending places error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to get location suggestions based on user preferences
const getLocationSuggestions = async (req, res) => {
  try {
    const { userLocation, interests, limit = 10 } = req.query;

    if (!userLocation) {
      return res.status(400).json({
        success: false,
        message: 'User location is required'
      });
    }

    const [lng, lat] = userLocation.split(',');
    const interestArray = interests ? interests.split(',') : [];

    // Get diverse suggestions within a reasonable radius
    let query = supabase
      .from('places')
      .select('*')
      .eq('approved', true)
      .rpc('places_within_radius', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_meters: 25000 // 25km radius
      });

    if (interestArray.length > 0) {
      query = query.overlaps('mood_tags', interestArray);
    }

    const { data: suggestions, error } = await query
      .order('rating->>average', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    // Categorize suggestions
    const categorized = {
      nearby: suggestions.filter(p => p.category === 'nature' || p.category === 'beach'),
      cultural: suggestions.filter(p => p.category === 'cultural'),
      dining: suggestions.filter(p => p.category === 'restaurant'),
      other: suggestions.filter(p => !['nature', 'beach', 'cultural', 'restaurant'].includes(p.category))
    };

    res.json({
      success: true,
      suggestions: categorized,
      userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });
  } catch (error) {
    console.error('Location suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMoodBasedRecommendations,
  getTrendingPlaces,
  getLocationSuggestions
};