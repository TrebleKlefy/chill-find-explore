const supabase = require('../config/supabase');

// Get nearby events
exports.getNearbyEvents = async (req, res) => {
  try {
    const {
      lat,
      lng,
      maxDistance = 5,
      type,
      moodTags,
      startDate,
      endDate,
      limit = 20,
      skip = 0
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' });
    }

    // Build the query - simplified without geospatial for now
    let query = supabase
      .from('events')
      .select('*')
      .eq('approved', true)
      .in('status', ['upcoming', 'ongoing']);

    // Add optional filters
    if (type) query = query.eq('type', type);
    if (moodTags) {
      const moodTagsArray = moodTags.split(',');
      query = query.overlaps('mood_tags', moodTagsArray);
    }
    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('end_date', endDate);

    // Add pagination and ordering
    const { data: events, error } = await query
      .order('start_date', { ascending: true })
      .range(parseInt(skip), parseInt(skip) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching nearby events:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    // For now, return all events without distance calculation
    // TODO: Implement proper PostGIS distance calculation
    res.json(events);
  } catch (err) {
    console.error('Nearby events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit new event
exports.submitEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      approved: false,
      submitted_by: req.user?.id
    };

    // Convert location coordinates to PostGIS format
    if (eventData.location && eventData.location.coordinates) {
      const [lng, lat] = eventData.location.coordinates;
      eventData.location = `POINT(${lng} ${lat})`;
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting event:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      message: 'Event submitted successfully and pending approval',
      event
    });
  } catch (err) {
    console.error('Submit event error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get event details
exports.getEventDetails = async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    console.error('Get event details error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('submitted_by')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is authorized to update
    if (event.submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'name', 'description', 'type', 'start_date', 'end_date',
      'location', 'address', 'venue', 'organizer', 'images',
      'price', 'capacity', 'mood_tags', 'features', 'social_media'
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

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(filteredUpdates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    res.json(updatedEvent);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('submitted_by')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is authorized to delete
    if (event.submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      return res.status(500).json({ message: deleteError.message });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate required' });
    }

    let query = supabase
      .from('events')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .eq('approved', true)
      .in('status', ['upcoming', 'ongoing']);

    if (type) query = query.eq('type', type);

    const { data: events, error } = await query
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events by date range:', error);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(events);
  } catch (err) {
    console.error('Get events by date range error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 