const supabase = require('../config/supabase');

const search = async (req, res) => {
  try {
    const { 
      query, 
      type, 
      location, 
      radius = 10000, 
      page = 1, 
      limit = 20,
      sortBy = 'relevance',
      minRating,
      priceRange,
      tags
    } = req.query;

    if (!query && !location) {
      return res.status(400).json({
        success: false,
        message: 'Search query or location is required'
      });
    }

    let results = {
      places: [],
      events: [],
      restaurants: [],
      posts: []
    };

    const offset = (page - 1) * limit;
    const searchTerms = query ? query.split(' ').join(' | ') : '';

    // Search places
    if (!type || type === 'places') {
      let placesQuery = supabase
        .from('places')
        .select('*')
        .eq('approved', true);

      if (query) {
        placesQuery = placesQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,mood_tags.cs.{${query}}`);
      }

      if (location) {
        const [lng, lat] = location.split(',');
        placesQuery = placesQuery.rpc('places_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      if (minRating) {
        placesQuery = placesQuery.gte('rating->>average', minRating);
      }

      if (priceRange) {
        placesQuery = placesQuery.eq('price_range', priceRange);
      }

      if (tags) {
        const tagArray = tags.split(',');
        placesQuery = placesQuery.overlaps('mood_tags', tagArray);
      }

      const { data: places, error: placesError } = await placesQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!placesError) {
        results.places = places || [];
      }
    }

    // Search events
    if (!type || type === 'events') {
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .gte('end_date', new Date().toISOString());

      if (query) {
        eventsQuery = eventsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,mood_tags.cs.{${query}}`);
      }

      if (location) {
        const [lng, lat] = location.split(',');
        eventsQuery = eventsQuery.rpc('events_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      if (tags) {
        const tagArray = tags.split(',');
        eventsQuery = eventsQuery.overlaps('mood_tags', tagArray);
      }

      const { data: events, error: eventsError } = await eventsQuery
        .order('start_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (!eventsError) {
        results.events = events || [];
      }
    }

    // Search restaurants
    if (!type || type === 'restaurants') {
      let restaurantsQuery = supabase
        .from('restaurants')
        .select('*')
        .eq('approved', true);

      if (query) {
        restaurantsQuery = restaurantsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine.cs.{${query}}`);
      }

      if (location) {
        const [lng, lat] = location.split(',');
        restaurantsQuery = restaurantsQuery.rpc('restaurants_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      if (minRating) {
        restaurantsQuery = restaurantsQuery.gte('rating->>average', minRating);
      }

      if (priceRange) {
        restaurantsQuery = restaurantsQuery.eq('price_range', priceRange);
      }

      const { data: restaurants, error: restaurantsError } = await restaurantsQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!restaurantsError) {
        results.restaurants = restaurants || [];
      }
    }

    // Search posts
    if (!type || type === 'posts') {
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          author:users(id, name, profile_image)
        `)
        .eq('status', 'published');

      if (query) {
        postsQuery = postsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
      }

      if (location) {
        const [lng, lat] = location.split(',');
        postsQuery = postsQuery.rpc('posts_within_radius', {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius_meters: parseInt(radius)
        });
      }

      const { data: posts, error: postsError } = await postsQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!postsError) {
        results.posts = posts || [];
      }
    }

    // Save search history if user is authenticated
    if (req.user && query) {
      await supabase
        .from('search_history')
        .insert({
          user_id: req.user.id,
          query,
          filters: {
            type,
            location,
            radius,
            minRating,
            priceRange,
            tags
          },
          results_count: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        });
    }

    res.json({
      success: true,
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: Object.values(results).some(arr => arr.length === parseInt(limit))
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
    const { query, type = 'all', limit = 5 } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    let suggestions = [];

    // Get place suggestions
    if (type === 'all' || type === 'places') {
      const { data: places } = await supabase
        .from('places')
        .select('name, category')
        .eq('approved', true)
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (places) {
        suggestions.push(...places.map(p => ({
          text: p.name,
          type: 'place',
          category: p.category
        })));
      }
    }

    // Get event suggestions
    if (type === 'all' || type === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('name, type')
        .eq('approved', true)
        .gte('end_date', new Date().toISOString())
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (events) {
        suggestions.push(...events.map(e => ({
          text: e.name,
          type: 'event',
          category: e.type
        })));
      }
    }

    // Get restaurant suggestions
    if (type === 'all' || type === 'restaurants') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('name, type')
        .eq('approved', true)
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (restaurants) {
        suggestions.push(...restaurants.map(r => ({
          text: r.name,
          type: 'restaurant',
          category: r.type
        })));
      }
    }

    // Limit total suggestions
    suggestions = suggestions.slice(0, limit * 3);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
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