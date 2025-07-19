# Outside - Location-Based Discovery App

A location-based mobile app backend designed to help people discover authentic, off-the-beaten-path experiences in their area. Built with Node.js, Express, and Supabase.

## Features

🌴 **Hidden gems** — rivers, beaches, hills, and trails only locals know
🍽 **Local restaurants & food trucks**
🎉 **Events** — pop-ups, street parties, and cultural happenings
🧘🏾 **Vibe-based filters** — chill, romantic, adventurous, or turn-up
📍 **What's nearby** — instant suggestions based on your mood and location

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: Supabase Auth
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## Setup

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Supabase CLI** - Install globally:
   ```bash
   npm install -g supabase
   ```
3. **Supabase account** - Create at [supabase.com](https://supabase.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd outside
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase project:**
   ```bash
   # Login to Supabase (this will open a browser)
   supabase login
   
   # Initialize Supabase in your project
   supabase init
   
   # Link to your remote Supabase project
   supabase link --project-ref your-project-ref
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

5. **Configure your environment variables in `.env`:**
   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=development
   ```
   
   You can find your Supabase URL and anon key in your [Supabase dashboard](https://app.supabase.com) under Settings > API.

6. **Set up the database:**
   ```bash
   # Start local Supabase (optional - for local development)
   supabase start
   
   # Push the database schema to your remote Supabase project
   supabase db push
   
   # OR reset the database and apply schema + seed data
   supabase db reset
   ```

7. **Seed the database with sample data:**
   ```bash
   # The seed data is automatically applied when using db reset
   # Or you can manually run the seed file:
   supabase db reset --linked
   ```

8. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Supabase Commands Reference

```bash
# Project Management
supabase login                    # Login to Supabase
supabase init                     # Initialize Supabase in project
supabase link --project-ref <ref> # Link to remote project
supabase status                   # Check project status

# Local Development
supabase start                    # Start local Supabase stack
supabase stop                     # Stop local Supabase stack
supabase restart                  # Restart local Supabase stack

# Database Management
supabase db push                  # Push local migrations to remote
supabase db pull                  # Pull remote changes to local
supabase db reset                 # Reset database with migrations + seed
supabase db reset --linked        # Reset linked remote database

# Migrations
supabase migration new <name>     # Create new migration
supabase migration up             # Apply pending migrations
supabase migration repair <id>    # Mark migration as applied

# Functions & Types
supabase gen types typescript --linked  # Generate TypeScript types
supabase functions new <name>     # Create new Edge Function
supabase functions deploy <name>  # Deploy Edge Function

# Utilities
supabase --help                   # Show all available commands
```

### Development Workflow

1. **Make database changes:**
   ```bash
   # Create a new migration for schema changes
   supabase migration new add_new_table
   
   # Edit the migration file in supabase/migrations/
   # Then apply it
   supabase db reset
   ```

2. **Update seed data:**
   ```bash
   # Edit supabase/seed.sql
   # Then reset database to apply changes
   supabase db reset
   ```

3. **Test API endpoints:**
   ```bash
   # Start the server
   npm run dev
   
   # Test an endpoint
   curl http://localhost:3000/api/places/nearby?lat=40.7128&lng=-74.0060
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### User Profile
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile
- `POST /api/users/places/:placeId/save` - Save a place
- `DELETE /api/users/places/:placeId/save` - Remove saved place

### Places
- `GET /api/places/nearby` - Get nearby places with filters
- `GET /api/places/search` - Search places by text
- `POST /api/places` - Submit new place
- `GET /api/places/:id` - Get place details
- `POST /api/places/:id/rate` - Rate a place

### Events
- `GET /api/events/nearby` - Get nearby events with filters
- `GET /api/events/date-range` - Get events by date range
- `POST /api/events` - Submit new event
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Restaurants
- `GET /api/restaurants/nearby` - Get nearby restaurants with filters
- `GET /api/restaurants/search` - Search restaurants
- `POST /api/restaurants` - Submit new restaurant
- `GET /api/restaurants/:id` - Get restaurant details
- `PATCH /api/restaurants/:id` - Update restaurant
- `POST /api/restaurants/:id/reviews` - Add review

## Example Usage

### Get nearby places with filters
```bash
GET /api/places/nearby?lat=40.7128&lng=-74.0060&category=beach&moodTags=chill,romantic&maxDistance=10
```

### Submit a new event
```bash
POST /api/events
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "name": "Summer Beach Festival",
  "description": "Annual beach festival with live music and food",
  "type": "festival",
  "startDate": "2024-07-15T10:00:00Z",
  "endDate": "2024-07-15T22:00:00Z",
  "location": {
    "type": "Point",
    "coordinates": [-74.0060, 40.7128]
  },
  "venue": "Central Beach",
  "moodTags": ["chill", "turn-up"]
}
```

## Database Schema

The app uses PostgreSQL with PostGIS extension for geospatial operations:

- **users** - User profiles and preferences
- **places** - General places and hidden gems
- **events** - Time-based events and activities
- **restaurants** - Food establishments
- **restaurant_reviews** - User reviews for restaurants

## Security Features

- Row Level Security (RLS) policies
- JWT-based authentication via Supabase
- Rate limiting
- Input validation
- CORS protection
- Security headers with Helmet

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License. 