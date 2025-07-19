# Authentication System

## Overview

The authentication system provides user registration, login, and session management functionality. It supports both public and authenticated user experiences with role-based access control.

## Components

### LoginForm (`src/components/auth/LoginForm.tsx`)

**Functionality:**
- Email and password authentication
- Form validation and error handling
- Loading states during authentication
- Navigation to signup form
- Success callback handling

**Props:**
```typescript
interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}
```

**Features:**
- Email validation
- Password field with proper input type
- Loading state during submission
- Toast notifications for success/error
- Responsive design with shadcn/ui components

### SignupForm (`src/components/auth/SignupForm.tsx`)

**Functionality:**
- New user registration
- Form validation for required fields
- Password confirmation
- Terms and conditions acceptance
- Navigation to login form

**Props:**
```typescript
interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}
```

**Features:**
- Email and password validation
- Password strength requirements
- Terms of service checkbox
- Account creation confirmation
- Error handling and user feedback

## Authentication Flow

### 1. Public User Experience
- Users can browse and search without authentication
- Limited functionality (view-only)
- Call-to-action buttons for signup/login

### 2. Authentication Process
1. User clicks "Sign In" or "Create Account"
2. Form validation and submission
3. API authentication request
4. Session token storage
5. Redirect to authenticated dashboard

### 3. Authenticated User Experience
- Full access to all features
- Personal dashboard with user-specific content
- Ability to create posts and interact with content

## API Routes Required

### Authentication Endpoints

#### POST `/api/auth/login`
**Purpose:** Authenticate user with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/auth/register`
**Purpose:** Create new user account

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword",
  "acceptTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/auth/logout`
**Purpose:** Logout user and invalidate session

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/me`
**Purpose:** Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActive": "2024-06-08T12:00:00Z"
  }
}
```

#### POST `/api/auth/refresh`
**Purpose:** Refresh authentication token

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token_here",
  "refreshToken": "new_refresh_token_here"
}
```

## Data Schema

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  password: string; // hashed
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  emailVerified: boolean;
  profileImage?: string;
  bio?: string;
  location?: string;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    privacy: 'public' | 'private';
  };
}
```

### Session Model
```typescript
interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsed: Date;
  userAgent?: string;
  ipAddress?: string;
}
```

## Security Considerations

### Password Security
- Passwords must be hashed using bcrypt or similar
- Minimum password length: 8 characters
- Require mix of uppercase, lowercase, numbers, and symbols
- Password confirmation validation

### Token Management
- JWT tokens with appropriate expiration times
- Refresh token rotation
- Secure token storage (httpOnly cookies recommended)
- Token blacklisting for logout

### Input Validation
- Email format validation
- XSS prevention
- SQL injection prevention
- Rate limiting on authentication endpoints

### Session Security
- HTTPS enforcement
- CSRF protection
- Session timeout
- Concurrent session management

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### Error Types
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_EXISTS` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_TOKEN` - Expired or invalid token
- `ACCOUNT_SUSPENDED` - User account suspended
- `EMAIL_NOT_VERIFIED` - Email verification required

## Implementation Notes

### State Management
- Use React Query for authentication state
- Implement automatic token refresh
- Handle authentication errors gracefully
- Provide loading states for better UX

### Form Validation
- Client-side validation with immediate feedback
- Server-side validation for security
- Proper error message display
- Accessibility considerations

### Responsive Design
- Mobile-friendly authentication forms
- Touch-friendly input fields
- Proper keyboard navigation
- Screen reader compatibility 