const supabase = require('../config/supabase');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Just create the auth user - profile is created automatically
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // This gets stored in raw_user_meta_data
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Debug logging
    console.log('Auth Data:', {
      user: authData.user ? { id: authData.user.id, email: authData.user.email } : null,
      session: authData.session ? 'exists' : 'missing',
      user_metadata: authData.user?.user_metadata
    });

    // Check if we have a session (user might need to confirm email)
    if (!authData.session) {
      // Try to sign in the user immediately after registration
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !signInData.session) {
        return res.status(201).json({
          success: true,
          message: 'User registered successfully. Please check your email to confirm your account.',
          data: {
            user: {
              id: authData.user.id,
              name: authData.user.user_metadata.name,
              email: authData.user.email,
              role: 'user'
            },
            requiresConfirmation: true
          }
        });
      }

      // Use the sign-in session
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: signInData.user.id,
            name: signInData.user.user_metadata.name,
            email: signInData.user.email,
            role: 'user'
          },
          token: signInData.session.access_token
        }
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: authData.user.id,
            name: authData.user.user_metadata.name,
            email: authData.user.email,
            role: 'user'
          },
          token: authData.session.access_token
        }
      });
    }
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
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: authData.session.access_token
      }
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