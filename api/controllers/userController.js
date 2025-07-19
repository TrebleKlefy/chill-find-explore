const supabase = require('../config/supabase');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Create user profile in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          preferences: {},
          contributions: { placesSubmitted: 0, placesApproved: 0, reviewsSubmitted: 0 },
          saved_places: []
        }
      ])
      .select()
      .single();

    if (userError) {
      return res.status(400).json({ message: userError.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return res.status(500).json({ message: 'Error fetching user profile' });
    }

    res.json({
      message: 'Login successful',
      user: userData,
      session: authData.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        *,
        saved_places_data:saved_places(
          id,
          name,
          description,
          location
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const updates = req.body;
  const allowedUpdates = ['name', 'bio', 'profile_picture', 'preferences', 'location'];
  
  // Filter out disallowed updates
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  try {
    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Save a place
exports.savePlace = async (req, res) => {
  try {
    const placeId = req.params.placeId;
    
    // Get current saved places
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('saved_places')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: fetchError.message });
    }

    const savedPlaces = userData.saved_places || [];
    
    if (savedPlaces.includes(placeId)) {
      return res.status(400).json({ message: 'Place already saved' });
    }

    savedPlaces.push(placeId);

    const { error: updateError } = await supabase
      .from('users')
      .update({ saved_places: savedPlaces })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    res.json({ message: 'Place saved successfully' });
  } catch (error) {
    console.error('Save place error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove saved place
exports.removeSavedPlace = async (req, res) => {
  try {
    const placeId = req.params.placeId;
    
    // Get current saved places
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('saved_places')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: fetchError.message });
    }

    const savedPlaces = (userData.saved_places || []).filter(id => id !== placeId);

    const { error: updateError } = await supabase
      .from('users')
      .update({ saved_places: savedPlaces })
      .eq('id', req.user.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message });
    }

    res.json({ message: 'Place removed from saved places' });
  } catch (error) {
    console.error('Remove saved place error:', error);
    res.status(500).json({ message: error.message });
  }
}; 