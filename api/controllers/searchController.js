const supabase = require('../config/supabase');

const search = async (req, res) => {
  try {
    const { 
      q, 
      type = 'all', 
      lat, 
      lng, 
      maxDistance = 50,
      category,
      moodTags,
      priceRange,
      limit = 20,
      page = 1
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const offset = (page - 1) * limit;
    let results = {
      places: [],
      events: [],
      restaurants: [],
      posts: []
    };

    // Search places
    if (type === 'all' || type === 'places') {
      let placesQuery = supabase
        .from('places')
        .select('*')
        .eq('approved', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .range(offset, offset + limit - 1);

      if (category) placesQuery = placesQuery.eq('category', category);
      if (moodTags) {
        const moodTagsArray = moodTags.split(',');
        placesQuery = placesQuery.overlaps('mood_tags', moodTagsArray);
      }
      if (priceRange) placesQuery = placesQuery.eq('price_range', priceRange);

      const { data: places } = await placesQuery;
      results.places = places || [];
    }

    // Search events
    if (type === 'all' || type === 'events') {
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .range(offset, offset + limit - 1);

      if (moodTags) {
        const moodTagsArray = moodTags.split(',');
        eventsQuery = eventsQuery.overlaps('mood_tags', moodTagsArray);
      }

      const { data: events } = await eventsQuery;
      results.events = events || [];
    }

    // Search restaurants
    if (type === 'all' || type === 'restaurants') {
      let restaurantsQuery = supabase
        .from('restaurants')
        .select('*')
        .eq('approved', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .range(offset, offset + limit - 1);

      if (priceRange) restaurantsQuery = restaurantsQuery.eq('price_range', priceRange);
      if (moodTags) {
        const moodTagsArray = moodTags.split(',');
        restaurantsQuery = restaurantsQuery.overlaps('mood_tags', moodTagsArray);
      }

      const { data: restaurants } = await restaurantsQuery;
      results.restaurants = restaurants || [];
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          author:users(id, name, profile_image)
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .range(offset, offset + limit - 1);

      const { data: posts } = await postsQuery;
      results.posts = posts || [];
    }

    // Store search history if user is authenticated
    if (req.user) {
      await supabase
        .from('search_history')
        .insert({
          user_id: req.user.id,
          query: q,
          filters: {
            type,
            category,
            moodTags,
            priceRange,
            location: lat && lng ? { lat, lng } : null
          },
          results_count: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        });
    }

    res.json({
      success: true,
      query: q,
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query is required for suggestions'
      });
    }

    let suggestions = [];

    // Get suggestions from places
    if (type === 'all' || type === 'places') {
      const { data: places } = await supabase
        .from('places')
        .select('name')
        .eq('approved', true)
        .ilike('name', `${q}%`)
        .limit(limit);

      suggestions.push(...(places || []).map(p => ({ type: 'place', text: p.name })));
    }

    // Get suggestions from events
    if (type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('name')
        .eq('approved', true)
        .ilike('name', `${q}%`)
        .limit(limit);

      suggestions.push(...(events || []).map(e => ({ type: 'event', text: e.name })));
    }

    // Get suggestions from restaurants
    if (type === 'all' || type === 'restaurants') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('name')
        .eq('approved', true)
        .ilike('name', `${q}%`)
        .limit(limit);

      suggestions.push(...(restaurants || []).map(r => ({ type: 'restaurant', text: r.name })));
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, limit);

    res.json({
      success: true,
      suggestions: uniqueSuggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  search,
  getSuggestions
};