const supabase = require('../config/supabase');

const getMoodBasedRecommendations = async (req, res) => {
  try {
    const { mood, lat, lng, limit = 20, type = 'all' } = req.query;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood parameter is required'
      });
    }

    let recommendations = {
      places: [],
      events: [],
      restaurants: []
    };

    // Get mood-based places
    if (type === 'all' || type === 'places') {
      const { data: places } = await supabase
        .from('places')
        .select('*')
        .eq('approved', true)
        .contains('mood_tags', [mood])
        .order('rating->>average', { ascending: false })
        .limit(limit);

      recommendations.places = places || [];
    }

    // Get mood-based events
    if (type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .contains('mood_tags', [mood])
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);

      recommendations.events = events || [];
    }

    // Get mood-based restaurants
    if (type === 'all' || type === 'restaurants') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .eq('approved', true)
        .contains('mood_tags', [mood])
        .order('rating->>average', { ascending: false })
        .limit(limit);

      recommendations.restaurants = restaurants || [];
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
    const { 
      timeframe = '7d', 
      lat, 
      lng, 
      maxDistance = 50, 
      limit = 20, 
      type = 'all' 
    } = req.query;

    // Calculate date for timeframe
    const now = new Date();
    const daysBack = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
    const fromDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    let trending = {
      places: [],
      events: [],
      restaurants: []
    };

    // Get trending places (based on recent views/likes)
    if (type === 'all' || type === 'places') {
      const { data: places } = await supabase
        .from('places')
        .select('*')
        .eq('approved', true)
        .gte('updated_at', fromDate.toISOString())
        .order('views', { ascending: false })
        .limit(limit);

      trending.places = places || [];
    }

    // Get trending events
    if (type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .gte('start_date', now.toISOString())
        .gte('updated_at', fromDate.toISOString())
        .order('views', { ascending: false })
        .limit(limit);

      trending.events = events || [];
    }

    // Get trending restaurants
    if (type === 'all' || type === 'restaurants') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .eq('approved', true)
        .gte('updated_at', fromDate.toISOString())
        .order('views', { ascending: false })
        .limit(limit);

      trending.restaurants = restaurants || [];
    }

    res.json({
      success: true,
      timeframe,
      trending
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