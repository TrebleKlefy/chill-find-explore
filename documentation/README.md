# Chill Find Explore - Application Documentation

## Overview

Chill Find Explore is a React-based web application that allows users to discover and share amazing places, events, restaurants, and chill spots. The application features a modern UI built with shadcn/ui components and provides both public and authenticated user experiences.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

## Application Structure

### Pages
- **Home Page** (`/`) - Main landing page with authentication and discovery features
- **Search Results** (`/search`) - Search functionality with filtering and location detection
- **Admin Dashboard** (`/admin`) - Administrative interface for managing users and content
- **404 Page** (`*`) - Not found page for invalid routes

### Core Features

1. **Authentication System**
   - User registration and login
   - Session management
   - Role-based access control

2. **Discovery & Search**
   - Location-based search
   - Mood-based recommendations
   - Advanced filtering options
   - Location detection

3. **Content Management**
   - Post creation (events, restaurants, chill spots)
   - Image upload functionality
   - User-generated content

4. **Admin Panel**
   - User management
   - Content moderation
   - Analytics and statistics
   - System settings

## Documentation Sections

### [Authentication System](./authentication.md)
- Login and registration flows
- User session management
- Security considerations

### [Home Page](./home-page.md)
- Landing page functionality
- Public vs authenticated views
- Discovery features

### [Search & Discovery](./search-discovery.md)
- Search functionality
- Location detection
- Filtering and sorting
- Mood-based recommendations

### [Content Management](./content-management.md)
- Post creation system
- Image upload handling
- Content moderation

### [Admin Dashboard](./admin-dashboard.md)
- User management interface
- Content moderation tools
- Analytics and reporting
- System administration

### [User Management](./user-management.md)
- User profiles and settings
- Post management
- Activity tracking

### [API Routes & Data Schema](./api-routes-schema.md)
- Complete API endpoint documentation
- Database schema definitions
- Data models and relationships

## Getting Started

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## Development Guidelines

- Follow TypeScript best practices
- Use shadcn/ui components for consistency
- Implement proper error handling
- Write responsive, accessible components
- Follow the established routing patterns 