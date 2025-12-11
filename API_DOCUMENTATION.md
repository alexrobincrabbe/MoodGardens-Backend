# Mood Gardens API Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [GraphQL API](#graphql-api)
- [REST API](#rest-api)
- [Error Handling](#error-handling)
- [Development](#development)

## Overview

The Mood Gardens API is a Node.js/TypeScript backend built with:
- **Express** - Web framework
- **Apollo Server** - GraphQL server
- **Prisma** - Database ORM (PostgreSQL)
- **Redis** - Caching and rate limiting
- **BullMQ** - Job queue for background tasks

The API provides both GraphQL and REST endpoints for managing users, diary entries, and AI-generated mood gardens.

## Architecture

### Project Structure

```
src/
  auth/                    # Authentication module
    repositories/          # User data access layer
    services/             # Business logic (auth, user management)
    lib/                  # Auth utilities (JWT, cookies, Google OAuth)
    emailFlows.ts         # Email sending logic
  
  graphql/                # GraphQL layer
    typeDefs.ts          # GraphQL schema definitions
    resolvers.ts         # Root resolver
    resolvers/           # Resolver implementations by module
    services.ts          # Dependency injection container
    queries.ts           # Query resolvers
    mutations.ts         # Mutation resolvers
  
  modules/                # Business modules
    gardens/             # Garden generation logic
    diary/               # Diary entry management
    aggregation/         # Weekly/monthly/yearly aggregations
  
  lib/                    # Shared utilities
    errors/              # Error handling utilities
    validation/          # Input validation
    rateLimit.ts         # Rate limiting middleware
    logger.ts            # Structured logging
  
  routes/                 # REST endpoints
    auth.ts              # Authentication routes
    billing.routes.ts    # Stripe billing
    shareMeta.ts         # Public garden sharing
```

### Design Patterns

- **Repository Pattern** - Data access abstraction (`UserRepository`, `GardenRepository`, `DiaryRepository`)
- **Service Layer** - Business logic encapsulation (`AuthService`, `UserService`, `GardenService`, `DiaryService`)
- **Dependency Injection** - Services container for testability
- **Error Handling** - Standardized GraphQL and HTTP errors

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis instance
- Environment variables (see `.env.example`)

### Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run build
npm start
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moodgardens"

# Redis
REDIS_URL="redis://localhost:6379"
# or
REDISCLOUD_URL="rediss://..."

# JWT
JWT_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PREMIUM_PRICE_ID="price_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Email (Mailgun)
MAILGUN_API_KEY="..."
MAILGUN_DOMAIN="..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
APP_ORIGIN="http://localhost:3000"
PORT=4000
```

## Authentication

### GraphQL Authentication

Most GraphQL queries and mutations require authentication. Include the JWT token in the request:

**Header:**
```
Authorization: Bearer <token>
```

**Cookie (alternative):**
```
mg_jwt=<token>
```

### REST Authentication

REST endpoints use the same JWT authentication via headers or cookies.

### Authentication Flow

1. **Register** - Create account → receive verification email
2. **Verify Email** - Click link in email → account activated
3. **Login** - Email + password → receive JWT token
4. **Google OAuth** - Google ID token → receive JWT token

### Token Format

JWT tokens contain:
```json
{
  "sub": "user-id",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Rate Limiting

The API implements Redis-backed rate limiting:

### GraphQL Endpoint
- **Limit:** 100 requests per 15 minutes per user (falls back to IP if not authenticated)
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Auth Routes
- **Short window:** 10 requests per 10 minutes per IP
- **Daily limit:** 50 requests per 24 hours per IP

### Resolver-Level Limits

**`createDiaryEntry` mutation:**
- 30 requests per 5 minutes per user

**`requestGenerateGarden` mutation:**
- 5 requests per 15 minutes per user
- 25 requests per 24 hours per user

### Rate Limit Errors

When rate limit is exceeded:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again after 2024-01-01T12:00:00Z",
  "retryAfter": 1704110400
}
```

## GraphQL API

### Endpoint

```
POST /graphql
```

### Schema Overview

#### Queries

- `user` - Get current authenticated user
- `diaryEntry(dayKey: String!)` - Get diary entry for a specific day
- `paginatedDiaryEntries(limit: Int!, offset: Int!)` - Get paginated diary entries
- `currentDiaryDayKey` - Get current day key based on user timezone
- `garden(period: GardenPeriod!, periodKey: String!)` - Get a specific garden
- `gardensByPeriod(period: GardenPeriod!)` - Get all gardens for a period type
- `gardensByMonth(monthKey: String!)` - Get all day gardens for a month

#### Mutations

**Authentication:**
- `register(email: String!, password: String!, displayName: String!)` - Create account
- `login(email: String!, password: String!)` - Login with email/password
- `loginWithGoogle(idToken: String!)` - Login with Google OAuth
- `logout` - Logout current session
- `verifyEmail(token: String!)` - Verify email address
- `requestPasswordReset(email: String!)` - Request password reset email
- `resetPassword(token: String!, newPassword: String!)` - Reset password

**User Management:**
- `updateUserSettings(timezone: String!, dayRolloverHour: Int!)` - Update timezone and day rollover
- `updateUserProfile(displayName: String!, email: String!)` - Update profile
- `changePassword(currentPassword: String!, newPassword: String!)` - Change password
- `addRegenTokens(amount: Int!)` - Add regeneration tokens (admin)

**Diary:**
- `createDiaryEntry(text: String!)` - Create/update today's diary entry

**Gardens:**
- `requestGenerateGarden(period: GardenPeriod!, periodKey: String, gardenType: GardenType)` - Request garden generation
- `regenerateGarden(gardenId: String!)` - Regenerate an existing garden (uses tokens)

### Example Queries

#### Get Current User
```graphql
query {
  user {
    id
    email
    displayName
    isPremium
    regenerateTokens
    timezone
    dayRolloverHour
  }
}
```

#### Create Diary Entry
```graphql
mutation {
  createDiaryEntry(text: "Today was a great day!") {
    id
    dayKey
    createdAt
  }
}
```

#### Request Garden Generation
```graphql
mutation {
  requestGenerateGarden(
    period: DAY
    gardenType: CLASSIC
  ) {
    id
    status
    progress
    periodKey
  }
}
```

#### Get Gardens for a Month
```graphql
query {
  gardensByMonth(monthKey: "2025-02") {
    id
    periodKey
    status
    imageUrl
    summary
    shortTheme
  }
}
```

### Types

#### GardenPeriod
```graphql
enum GardenPeriod {
  DAY
  WEEK
  MONTH
  YEAR
}
```

#### GardenStatus
```graphql
enum GardenStatus {
  PENDING
  GENERATING
  READY
  FAILED
}
```

#### GardenType
```graphql
enum GardenType {
  CLASSIC
  UNDERWATER
  GALAXY
}
```

## REST API

### Authentication Routes

**Base URL:** `/auth`

#### POST `/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "User created; verification email sent"
}
```

#### GET `/auth/verify-email?token=<token>`
Verify email address from verification link.

**Response:**
```json
{
  "ok": true,
  "message": "Email verified"
}
```

#### POST `/auth/forgot-password`
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "If that email exists, a reset link was sent"
}
```

#### POST `/auth/reset-password`
Reset password with token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Password updated"
}
```

### Billing Routes

**Base URL:** `/billing`

#### POST `/billing/create-checkout-session`
Create Stripe checkout session for premium subscription.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### POST `/billing/create-portal-session`
Create Stripe customer portal session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### POST `/billing/webhook`
Stripe webhook endpoint for subscription events. Handles:
- `customer.subscription.created` - Marks user as premium
- `customer.subscription.updated` - Updates premium status
- `customer.subscription.deleted` - Removes premium status

**Note:** This endpoint requires Stripe signature verification and should only be called by Stripe.

### Public Routes

#### GET `/share-meta/:shareId` or `/share-meta/:shareId.json`
Get public garden metadata for sharing (Open Graph data).

**Response:**
```json
{
  "owner": "User Name",
  "title": "User Name's Mood Garden — Monday 1st of January 2025",
  "desc": "A peaceful garden...",
  "img": "https://res.cloudinary.com/...",
  "period": "DAY",
  "periodKey": "2025-01-01",
  "formattedDate": "Monday 1st of January 2025",
  "viewLink": "https://app-origin.com"
}
```

#### GET `/healthz`
Health check endpoint.

**Response:**
```
ok
```

## Error Handling

### GraphQL Errors

All GraphQL errors follow a standard format:

```json
{
  "errors": [
    {
      "message": "Error message",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

### Error Codes

- `BAD_USER_INPUT` - Invalid input data
- `UNAUTHENTICATED` - Not authenticated or invalid credentials
- `EMAIL_NOT_VERIFIED` - Email not verified
- `EMAIL_IN_USE` - Email already registered
- `INTERNAL_SERVER_ERROR` - Server error
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

### HTTP Errors

REST endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Build TypeScript
npm run build

# Start server
npm start
```

### Development Mode

For development with auto-reload, use a process manager like `nodemon`:

```bash
npx nodemon --exec "npm run build && npm start"
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Background Workers

The API uses BullMQ for background job processing:

**Garden Generation Worker:**
```bash
npm run worker:garden
```

**Aggregation Worker:**
```bash
npm run worker:aggregation
```

### Scripts

- `backfill:diary` - Backfill diary encryption
- `backfill:garden-summaries` - Backfill garden summary encryption
- `schedule:aggregations` - Schedule daily aggregation jobs

## Security

### Data Encryption

- **Diary Entries** - Encrypted at rest using user-specific Data Encryption Keys (DEK)
- **Garden Summaries** - Encrypted at rest using user-specific DEK
- **Passwords** - Hashed using bcrypt (12 rounds)

### Key Management

- DEKs are stored encrypted in Azure Key Vault or AWS KMS
- Keys are rotated via `keyVersion` field
- Old encrypted data can be decrypted with previous key versions

### Best Practices

- Always use HTTPS in production
- Store sensitive environment variables securely
- Regularly rotate JWT secrets
- Monitor rate limit violations
- Use strong password requirements (8+ characters)
- Validate all user input

## Support

For issues or questions, please contact the development team or open an issue in the repository.

