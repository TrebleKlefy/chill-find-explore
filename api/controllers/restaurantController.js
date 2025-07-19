const supabase = require('../config/supabase');

// Get nearby restaurants
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const {
      lat,
      lng,
      maxDistance = 5,
      type,
      cuisine,
      priceRange,
      features,
      moodTags,
      limit = 20,
      skip = 0
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' });
    }

    // Build the query - simplified without geospatial for now
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('approved', true);

    // Add optional filters
    if (type) query = query.eq('type', type);
    if (cuisine) {
      const cuisineArray = cuisine.split(',');
      query = query.overlaps('cuisine', cuisineArray);
    }
    if (priceRange) query = query.eq('price_range', priceRange);
    if (features) {
      const featuresArray = features.split(',');
      query = query.overlaps('features', featuresArray);
    }
    if (moodTags) {
      const moodTagsArray = moodTags.split(',');
      query = query.overlaps('mood_tags', moodTagsArray);
    }

    // Add pagination and ordering
    const { data: restaurants, error } = await query
      .order('rating->>average', { ascending: false })
      .range(parseInt(skip), parseInt(skip) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching nearby restaurants:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    // For now, return all restaurants without distance calculation
    // TODO: Implement proper PostGIS distance calculation
    res.json(restaurants);
  } catch (err) {
    console.error('Nearby restaurants error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit new restaurant
exports.submitRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      approved: false,
      submitted_by: req.user?.id
    };

    // Convert location coordinates to PostGIS format
    if (restaurantData.location && restaurantData.location.coordinates) {
      const [lng, lat] = restaurantData.location.coordinates;
      restaurantData.location = `POINT(${lng} ${lat})`;
    }

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting restaurant:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      message: 'Restaurant submitted successfully and pending approval',
      restaurant
    });
  } catch (err) {
    console.error('Submit restaurant error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get restaurant details
exports.getRestaurantDetails = async (req, res) => {
  try {
    // Get restaurant details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Get reviews with user information
    const { data: reviews, error: reviewsError } = await supabase
      .from('restaurant_reviews')
      .select(`
        *,
        user:users(name, profile_picture)
      `)
      .eq('restaurant_id', req.params.id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    res.json({
      ...restaurant,
      reviews: reviews || []
    });
  } catch (err) {
    console.error('Get restaurant details error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('submitted_by')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user is authorized to update
    if (restaurant.submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'name', 'description', 'type', 'cuisine', 'location', 'address',
      'contact_info', 'opening_hours', 'images', 'menu', 'price_range',
      'features', 'mood_tags', 'social_media', 'special_features'
    ];

    // Filter out disallowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Convert location coordinates to PostGIS format if provided
    if (filteredUpdates.location && filteredUpdates.location.coordinates) {
      const [lng, lat] = filteredUpdates.location.coordinates;
      filteredUpdates.location = `POINT(${lng} ${lat})`;
    }

    const { data: updatedRestaurant, error: updateError } = await supabase
      .from('restaurants')
      .update(filteredUpdates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    res.json(updatedRestaurant);
  } catch (err) {
    console.error('Update restaurant error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Add review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user has already reviewed this restaurant
    const { data: existingReview, error: checkError } = await supabase
      .from('restaurant_reviews')
      .select('id')
      .eq('restaurant_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing review:', checkError);
      return res.status(500).json({ message: 'Server error' });
    }

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }

    // Add the review
    const { data: review, error: reviewError } = await supabase
      .from('restaurant_reviews')
      .insert([{
        restaurant_id: req.params.id,
        user_id: req.user.id,
        rating,
        comment
      }])
      .select()
      .single();

    if (reviewError) {
      console.error('Error adding review:', reviewError);
      return res.status(400).json({ message: reviewError.message });
    }

    // Update restaurant rating
    const { data: allReviews, error: ratingsError } = await supabase
      .from('restaurant_reviews')
      .select('rating')
      .eq('restaurant_id', req.params.id);

    if (ratingsError) {
      console.error('Error fetching all ratings:', ratingsError);
    } else {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await supabase
        .from('restaurants')
        .update({
          rating: {
            average: averageRating,
            count: allReviews.length
          }
        })
        .eq('id', req.params.id);
    }

    res.json(review);
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search restaurants
exports.searchRestaurants = async (req, res) => {
  try {
    const { query, lat, lng, maxDistance = 5 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    let searchQuery = supabase
      .from('restaurants')
      .select('*')
      .eq('approved', true);

    // Add text search using PostgreSQL's ilike and array search
    searchQuery = searchQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine.cs.{${query}},address->>city.ilike.%${query}%`);

    // Add location filter if coordinates provided
    if (lat && lng) {
      const point = `POINT(${lng} ${lat})`;
      const maxDistanceMeters = parseFloat(maxDistance) * 1000;
      
      searchQuery = searchQuery.filter('location', 'st_dwithin', {
        geom: point,
        distance: maxDistanceMeters
      });
    }

    const { data: restaurants, error } = await searchQuery
      .order('rating->>average', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Search restaurants error:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(restaurants);
  } catch (err) {
    console.error('Search restaurants error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 