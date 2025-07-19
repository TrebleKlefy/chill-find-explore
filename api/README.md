# Chill Find Explore API

A comprehensive location-based API for discovering authentic local experiences, built with Node.js, Express, and Supabase.

## 🚀 Features

### Core Features
- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: Profiles, settings, roles, and social features
- **Location Discovery**: Places, events, restaurants with geospatial search
- **Content Management**: User-generated posts with rich media support
- **Social Features**: Likes, comments, follows, collections
- **Search & Discovery**: Advanced search with filters and mood-based recommendations
- **Admin Dashboard**: Content moderation, user management, analytics
- **File Upload**: Image upload with processing and optimization

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile

#### Users (`/api/users`)
- `GET /` - Get users list
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `GET /:id/posts` - Get user's posts
- `GET /:id/favorites` - Get user's favorites
- `POST /:id/follow` - Follow user
- `DELETE /:id/follow` - Unfollow user

#### Places (`/api/places`)
- `GET /` - Get places with filters
- `GET /:id` - Get place by ID
- `POST /` - Create new place
- `PUT /:id` - Update place
- `DELETE /:id` - Delete place

#### Events (`/api/events`)
- `GET /` - Get events with filters
- `GET /:id` - Get event by ID
- `POST /` - Create new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event

#### Restaurants (`/api/restaurants`)
- `GET /` - Get restaurants with filters
- `GET /:id` - Get restaurant by ID
- `POST /` - Create new restaurant
- `PUT /:id` - Update restaurant
- `DELETE /:id` - Delete restaurant
- `POST /:id/review` - Add review

#### Posts (`/api/posts`)
- `GET /` - Get posts feed
- `GET /:id` - Get post by ID
- `POST /` - Create new post
- `PUT /:id` - Update post
- `DELETE /:id` - Delete post
- `POST /:id/like` - Like post
- `DELETE /:id/like` - Unlike post
- `POST /:id/comment` - Add comment
- `GET /:id/comments` - Get post comments
- `POST /:id/report` - Report post

#### Search (`/api/search`)
- `GET /` - Universal search with filters
- `GET /suggestions` - Search suggestions

#### Discovery (`/api/discovery`)
- `GET /mood-based` - Mood-based recommendations
- `GET /trending` - Trending places and content
- `GET /location-suggestions` - Location-based suggestions

#### Admin (`/api/admin`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /users` - Manage users
- `GET /content` - Content moderation queue
- `POST /content/:id/review` - Review content
- `GET /analytics/*` - Various analytics endpoints
- `GET /settings` - Get admin settings
- `PUT /settings` - Update admin settings

## 🛠 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project
- PostgreSQL with PostGIS extension

### Environment Variables
Create a `.env` file in the API directory:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Database Setup**
   
   Run the initial schema migration:
   ```bash
   npm run migrate
   # or manually in Supabase SQL editor
   ```
   
   Apply the new tables and features:
   - Run `/supabase/migrations/20240608_add_missing_tables.sql`
   - Run `/supabase/migrations/20240608_add_helper_functions.sql`

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Installation**
   Visit `http://localhost:3000/health` to check if the API is running.

## 📁 Project Structure

```
api/
├── config/
│   └── supabase.js          # Supabase configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── placesController.js  # Places CRUD
│   ├── eventController.js   # Events CRUD
│   ├── restaurantController.js # Restaurants CRUD
│   ├── postController.js    # Posts and social features
│   ├── searchController.js  # Search functionality
│   ├── discoveryController.js # Discovery and recommendations
│   └── adminController.js   # Admin dashboard
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── adminAuth.js        # Admin authorization
│   ├── validation.js       # Request validation
│   ├── upload.js           # File upload handling
│   └── errorHandler.js     # Global error handling
├── routes/
│   ├── auth.js             # Auth routes
│   ├── users.js            # User routes
│   ├── places.js           # Places routes
│   ├── events.js           # Events routes
│   ├── restaurants.js      # Restaurant routes
│   ├── posts.js            # Posts routes
│   ├── search.js           # Search routes
│   ├── discovery.js        # Discovery routes
│   └── admin.js            # Admin routes
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── uploads/                # File upload directory
├── app.js                  # Express app configuration
├── server.js               # Server entry point
└── package.json            # Dependencies and scripts
```

## 🗄 Database Schema

### Core Tables
- **users**: User profiles and authentication
- **places**: Location points of interest
- **events**: Time-based events and activities
- **restaurants**: Dining establishments with reviews
- **posts**: User-generated content
- **comments**: Post comments
- **likes**: Post and content likes
- **user_collections**: User-created collections
- **collection_items**: Items in collections
- **user_activity**: Activity tracking
- **moderation_flags**: Content reporting
- **search_history**: User search tracking
- **user_favorites**: Saved places
- **user_follows**: Social following relationships

### Key Features
- **PostGIS Integration**: Geospatial queries for location-based features
- **Row Level Security**: Fine-grained access control
- **Full-text Search**: Advanced search capabilities
- **JSONB Fields**: Flexible metadata storage
- **Automated Triggers**: Timestamp management

## 🔧 API Usage Examples

### Search for Places
```bash
curl "http://localhost:3000/api/search?query=coffee&location=-122.4194,37.7749&radius=5000&type=places"
```

### Get Mood-based Recommendations
```bash
curl "http://localhost:3000/api/discovery/mood-based?mood=chill&location=-122.4194,37.7749"
```

### Create a Post (with auth)
```bash
curl -X POST "http://localhost:3000/api/posts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chill",
    "title": "Amazing sunset spot",
    "description": "Found this perfect spot for watching sunsets",
    "location": {"type": "Point", "coordinates": [-122.4194, 37.7749]},
    "tags": ["sunset", "peaceful", "scenic"]
  }'
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Cross-origin request handling
- **Helmet Security**: Security headers and protection
- **File Upload Security**: Secure file handling with type validation

## 📊 Admin Features

### Dashboard Analytics
- User growth and engagement metrics
- Content creation and approval statistics
- Geographic distribution of content
- Trending topics and locations

### Content Moderation
- Flagged content review queue
- Bulk approval/rejection actions
- User-generated content oversight
- Automated content filtering

### User Management
- User role management (user/contributor/admin)
- Account suspension and activation
- User activity monitoring
- Bulk user operations

## 🚀 Deployment

### Production Checklist
- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Set up file storage (AWS S3, Cloudinary, etc.)
- [ ] Configure monitoring and logging
- [ ] Set up automated backups
- [ ] Configure SSL/TLS certificates
- [ ] Set up CI/CD pipeline

### Environment-specific Configurations
- **Development**: Local file storage, debug logging
- **Staging**: Cloud storage, performance monitoring
- **Production**: CDN integration, advanced security, monitoring

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📚 API Documentation

Full API documentation is available in the Postman collection:
- Import `Outside_API_Postman_Collection.json`
- Set up environment variables
- Test all endpoints with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the Postman collection
- Open an issue on the repository

---

**Note**: This implementation includes all the features outlined in the comprehensive API implementation plan. Make sure to run the database migrations before starting the server.
