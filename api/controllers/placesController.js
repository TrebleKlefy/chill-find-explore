const supabase = require('../config/supabase');

// Get nearby places with filters
exports.getNearbyPlaces = async (req, res) => {
  try {
    const {
      lat,
      lng,
      maxDistance = 5,
      category,
      moodTags,
      priceRange,
      features,
      limit = 20,
      skip = 0
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' });
    }

    // Build the query - simplified without geospatial for now
    let query = supabase
      .from('places')
      .select('*')
      .eq('approved', true);

    // Add optional filters
    if (category) query = query.eq('category', category);
    if (moodTags) {
      const moodTagsArray = moodTags.split(',');
      query = query.overlaps('mood_tags', moodTagsArray);
    }
    if (priceRange) query = query.eq('price_range', priceRange);
    if (features) {
      const featuresArray = features.split(',');
      query = query.overlaps('features', featuresArray);
    }

    // Add pagination and ordering
    const { data: places, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(skip), parseInt(skip) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching nearby places:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    // For now, return all places without distance calculation
    // TODO: Implement proper PostGIS distance calculation
    res.json(places);
  } catch (err) {
    console.error('Nearby places error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a new place
exports.submitPlace = async (req, res) => {
  try {
    const placeData = {
      ...req.body,
      approved: false,
      submitted_by: req.user?.id
    };

    // Convert location coordinates to PostGIS format
    if (placeData.location && placeData.location.coordinates) {
      const [lng, lat] = placeData.location.coordinates;
      placeData.location = `POINT(${lng} ${lat})`;
    }

    const { data: place, error } = await supabase
      .from('places')
      .insert([placeData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting place:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      message: 'Place submitted successfully and pending approval',
      place
    });
  } catch (err) {
    console.error('Submit place error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get place details
exports.getPlaceDetails = async (req, res) => {
  try {
    const { data: place, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(place);
  } catch (err) {
    console.error('Get place details error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update place rating
exports.updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating value' });
    }

    const { data: place, error: fetchError } = await supabase
      .from('places')
      .select('rating')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Update rating
    const currentRating = place.rating || { average: 0, count: 0 };
    const newCount = currentRating.count + 1;
    const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

    const { data: updatedPlace, error: updateError } = await supabase
      .from('places')
      .update({
        rating: {
          average: newAverage,
          count: newCount
        }
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    res.json(updatedPlace);
  } catch (err) {
    console.error('Update rating error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search places by text
exports.searchPlaces = async (req, res) => {
  try {
    const { query, lat, lng, maxDistance = 5 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    let searchQuery = supabase
      .from('places')
      .select('*')
      .eq('approved', true);

    // Add text search using PostgreSQL's ilike
    searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,address->>city.ilike.%${query}%`);

    // Add location filter if coordinates provided
    if (lat && lng) {
      const point = `POINT(${lng} ${lat})`;
      const maxDistanceMeters = parseFloat(maxDistance) * 1000;
      
      searchQuery = searchQuery.filter('location', 'st_dwithin', {
        geom: point,
        distance: maxDistanceMeters
      });
    }

    const { data: places, error } = await searchQuery
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Search places error:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(places);
  } catch (err) {
    console.error('Search places error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
