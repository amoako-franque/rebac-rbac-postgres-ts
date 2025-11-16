# RBAC + ReBAC API with Prisma & TypeScript

A production-ready REST API demonstrating Role-Based Access Control (RBAC) and Relationship-Based Access Control (ReBAC) patterns using Express.js, TypeScript, Prisma ORM, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Docker Setup](#docker-setup)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Features

- **RBAC (Role-Based Access Control)**: Permission-based access control using roles and permissions
- **ReBAC (Relationship-Based Access Control)**: Access control based on relationships between entities
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database access with migrations
- **Docker Support**: Containerized development and production environments
- **CI/CD Pipeline**: Automated testing and deployment
- **Advanced Security**:
  - Helmet.js for security headers
  - Rate limiting to prevent abuse
  - Input validation and sanitization
  - Strong password requirements
  - CORS protection
- **Production-Ready Error Handling**:
  - Custom error classes with proper HTTP status codes
  - Centralized error handling middleware
  - Detailed error logging
  - User-friendly error messages
- **Comprehensive Logging**:
  - Winston-based structured logging
  - Request/response logging
  - Database query logging (development)
  - Error tracking
  - Log levels (error, warn, info, debug)
- **Health Check**: Database connectivity monitoring with detailed status
- **Graceful Shutdown**: Proper cleanup on application termination
- **Request Logging**: Detailed request/response logging with IP and user agent tracking

## Architecture

### Access Control Models

#### RBAC (Role-Based Access Control)

- Users are assigned **roles** (e.g., `doctor`, `nurse`, `admin`)
- Roles have associated **permissions** (e.g., `record:read`, `record:write`)
- Access is granted based on role membership

#### ReBAC (Relationship-Based Access Control)

- Access is determined by **relationships** between entities
- Relationships have a **type** (e.g., `assigned_to`, `manages`)
- Access is granted if a specific relationship exists

### Database Schema

```
User ──┬── UserRole ── Role ── RolePermission ── Permission
       │
       ├── PatientRecord (owner)
       │
       └── Relationship (subject/object)
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22.x
- **PostgreSQL** >= 15.x (or use Docker)
- **Docker** >= 20.x and **Docker Compose** >= 2.x (optional, for containerized setup)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd rebac-rbac-prisma-ts

# Copy environment file
cp .env.example .env

# Start services (database + application)
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npm run seed:cli

# The API will be available at http://localhost:4090
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (using Docker)
docker-compose up -d db

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run seed:cli

# Start development server
npm run dev
```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Using Docker Compose (Database Only)

```bash
# Start PostgreSQL container
docker-compose up -d db

# The database will be available at localhost:5432
# Default credentials:
#   User: postgres
#   Password: password
#   Database: rebac_rbac_example
```

#### Using Local PostgreSQL

1. Create a PostgreSQL database:

```sql
CREATE DATABASE rebac_rbac_example;
```

2. Update `.env` with your connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/rebac_rbac_example?schema=public
```

### 3. Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 chars in production)

Optional variables:

- `PORT`: Server port (default: 4090)
- `NODE_ENV`: Environment (development/production/test)
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)
- `JWT_ISSUER`: JWT issuer claim
- `JWT_AUDIENCE`: JWT audience claim
- `CORS_ORIGIN`: CORS allowed origin (default: *)

### 5. Seed Database

The seed script creates:

- **Roles**: `doctor`, `nurse`, `admin`
- **Permissions**: `record:read`, `record:write`
- **Users**:
  - `doc@example.com` (doctor role)
  - `nurse@example.com` (nurse role)
  - `patient@example.com` (patient, no role)
- **Sample Records**: Patient records owned by patient user
- **Relationships**: Doctor assigned to patient

```bash
# Seed the database
npm run seed:cli
```

### 6. Start Development Server

```bash
# Development mode with hot reload (using ts-node-dev)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:4090`

#### About ts-node-dev

**ts-node-dev** works similarly to **nodemon** but is specifically designed for TypeScript projects:

- **Hot Reload**: Automatically restarts the server when files change
- **TypeScript Support**: Directly runs TypeScript files without compilation
- **Fast Startup**: Uses incremental compilation for faster restarts
- **Watch Mode**: Monitors file changes and restarts automatically
- **Transpile Only**: Uses `--transpile-only` flag for faster development (skips type checking)

**Key Differences from nodemon:**

- Built specifically for TypeScript
- No need for separate compilation step
- Better performance with TypeScript projects
- Integrated with ts-node for seamless TypeScript execution

**Usage in this project:**

```bash
npm run dev  # Runs: ts-node-dev --transpile-only src/index.ts
```

This provides a development experience similar to nodemon but optimized for TypeScript.

## Docker Setup

### Docker Compose Services

The `docker-compose.yml` includes:

1. **PostgreSQL Database** (`db`)

   - Image: `postgres:15`
   - Port: `5432`
   - Persistent volume for data
2. **Application** (`app`)

   - Built from Dockerfile
   - Port: `4090`
   - Depends on database
   - Auto-runs migrations on startup

### Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Execute commands in container
docker-compose exec app npm run seed:cli
docker-compose exec app npx prisma studio
```

### Dockerfile

The application uses a multi-stage build:

- **Stage 1**: Install dependencies and build TypeScript
- **Stage 2**: Production runtime with minimal dependencies

## Database Management

### Prisma Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only - deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Prisma Studio

Visual database browser:

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Manual Database Operations

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes without migrations (dev only)
npx prisma db push

# Validate Prisma schema
npx prisma validate
```

## API Documentation

### Base URL

```
Development: http://localhost:4090
Production: https://your-domain.com
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

#### Health Check

```http
GET /
```

**Response (Healthy):**

```json
{
  "status": "healthy",
  "message": "RBAC+ReBAC Prisma TS API",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "database": {
    "status": "connected",
    "provider": "postgresql"
  },
  "services": {
    "api": "operational",
    "database": "connected"
  }
}
```

**Response (Unhealthy - Database Disconnected):**

```json
{
  "status": "unhealthy",
  "message": "RBAC+ReBAC Prisma TS API",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "status": "disconnected",
    "error": "Connection timeout"
  },
  "services": {
    "api": "operational",
    "database": "disconnected"
  }
}
```

The health check endpoint performs a live database connectivity test and returns detailed status information.

#### Authentication

##### Register User

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Password Requirements:**

- Minimum 8 characters (configurable via `MIN_PASSWORD_LENGTH`)
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Error Responses:**

- `400`: Validation error (missing fields, invalid email, weak password)
  ```json
  {
    "error": "ValidationError",
    "message": "Validation failed",
    "fields": {
      "password": ["Password must contain at least one uppercase letter"]
    }
  }
  ```
- `409`: User already exists
  ```json
  {
    "error": "ConflictError",
    "message": "User with this email already exists"
  }
  ```

##### Login

```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "doc@example.com",
  "password": "password"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "id": 1,
      "email": "doc@example.com",
      "name": "Dr. Smith"
    }
  }
}
```

**Error Responses:**

- `400`: Validation error
  ```json
  {
    "error": "ValidationError",
    "message": "Validation failed",
    "fields": {
      "email": ["Invalid email format"]
    }
  }
  ```
- `401`: Invalid credentials
  ```json
  {
    "error": "UnauthorizedError",
    "message": "Invalid email or password"
  }
  ```

#### Records

##### Get Record (RBAC)

```http
GET /records/rbac/:id
Authorization: Bearer <token>
```

**Path Parameters:**

- `id` (number): Record ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "patientName": "Patient Paul",
    "data": "Record A",
    "ownerId": 3,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Invalid record ID
  ```json
  {
    "error": "BadRequestError",
    "message": "Record ID must be a positive integer"
  }
  ```
- `401`: Missing or invalid token
  ```json
  {
    "error": "UnauthorizedError",
    "message": "Missing or invalid authorization header"
  }
  ```
- `403`: Insufficient permissions
  ```json
  {
    "error": "ForbiddenError",
    "message": "Insufficient permissions. Required: record:read"
  }
  ```
- `404`: Record not found
  ```json
  {
    "error": "NotFoundError",
    "message": "Record with ID 1 not found"
  }
  ```

##### Get Record (ReBAC)

```http
GET /records/rebac/:id
Authorization: Bearer <token>
```

**Path Parameters:**

- `id` (number): Record ID

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "patientName": "Patient Paul",
    "data": "Record A",
    "ownerId": 3,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Invalid record ID
  ```json
  {
    "error": "BadRequestError",
    "message": "Record ID must be a positive integer"
  }
  ```
- `401`: Missing or invalid token
  ```json
  {
    "error": "UnauthorizedError",
    "message": "Missing or invalid authorization header"
  }
  ```
- `403`: No relationship found
  ```json
  {
    "error": "ForbiddenError",
    "message": "No assigned_to relationship found with record owner"
  }
  ```
- `404`: Record not found
  ```json
  {
    "error": "NotFoundError",
    "message": "Record with ID 1 not found"
  }
  ```

### Access Control Examples

#### RBAC Example

1. User with `doctor` role has `record:read` permission
2. Accessing `/records/rbac/1` requires `record:read` permission
3. Doctor can access the record

#### ReBAC Example

1. Doctor has `assigned_to` relationship with patient
2. Patient owns record with ID 1
3. Accessing `/records/rebac/1` checks for `assigned_to` relationship
4. Doctor can access the record due to the relationship

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

Tests are located in the `test/` directory:

- `rbac.spec.ts`: RBAC middleware tests
- `testApp.ts`: Test application setup

### Manual Testing with Postman

A complete Postman collection is provided in `postman_collection.json`. Import it into Postman for:

- **Pre-configured requests**: All API endpoints ready to use
- **Environment variables**: Automatic token management
- **Test scripts**: Automated response validation
- **Example requests**: Pre-filled with seed data
- **Multiple user scenarios**: Test with doctor, nurse, and patient accounts

**To use:**

1. Open Postman
2. Click **Import** → Select `postman_collection.json`
3. Create a new environment with variable `base_url` = `http://localhost:4090`
4. Start with "Login - Doctor" to get an authentication token
5. Tokens are automatically stored and used in subsequent requests

**Test Flow:**

1. Login as Doctor → Get token
2. Get Record (RBAC) - Doctor → Should succeed (has `record:read`)
3. Get Record (ReBAC) - Doctor → Should succeed (has `assigned_to` relationship)
4. Login as Nurse → Get token
5. Get Record (RBAC) - Nurse → Should succeed (has `record:read`)
6. Get Record (ReBAC) - Nurse → Should fail (no relationship)
7. Login as Patient → Get token
8. Get Record (RBAC) - Patient → Should fail (no permissions)

## Environment Variables

### Required Variables

| Variable         | Description                  | Example                                      |
| ---------------- | ---------------------------- | -------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | Secret for JWT signing       | `your-secret-key-min-32-chars`             |

### Optional Variables

| Variable                 | Description                                        | Default                 |
| ------------------------ | -------------------------------------------------- | ----------------------- |
| `PORT`                 | Server port                                        | `4090`                |
| `NODE_ENV`             | Environment mode                                   | `development`         |
| `JWT_EXPIRES_IN`       | Token expiration                                   | `7d`                  |
| `JWT_ISSUER`           | JWT issuer claim                                   | -                       |
| `JWT_AUDIENCE`         | JWT audience claim                                 | -                       |
| `CORS_ORIGIN`          | Allowed CORS origin (comma-separated for multiple) | `*`                   |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds                  | `900000` (15 minutes) |
| `RATE_LIMIT_MAX`       | Maximum requests per window                        | `100`                 |
| `BCRYPT_ROUNDS`        | Bcrypt salt rounds                                 | `10`                  |
| `MIN_PASSWORD_LENGTH`  | Minimum password length                            | `8`                   |

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (≥32 characters)
- [ ] Configure `CORS_ORIGIN` to specific domain
- [ ] Use secure database connection (SSL)
- [ ] Set appropriate `JWT_EXPIRES_IN`
- [ ] Configure `JWT_ISSUER` and `JWT_AUDIENCE`

## 🚢 Deployment

### Build for Production

```bash
# Build TypeScript
npm run build

# The output will be in ./dist/
```

### Production Start

```bash
# Set environment variables
export NODE_ENV=production
export DATABASE_URL=...
export JWT_SECRET=...

# Start server
npm start
```

### Docker Production Deployment

```bash
# Build production image
docker build -t rebac-rbac-api:latest .

# Run container
docker run -d \
  -p 4090:4090 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  -e NODE_ENV=production \
  rebac-rbac-api:latest
```

### Environment-Specific Configurations

#### Development

- Hot reload enabled
- Detailed error messages
- Request logging enabled
- CORS: `*`

#### Production

- Compiled JavaScript
- Generic error messages
- Optimized logging
- CORS: Specific domain
- JWT secret validation

## CI/CD

The project includes GitHub Actions workflows for:

### Continuous Integration

- **Lint & Type Check**: Validates TypeScript code
- **Build**: Compiles TypeScript to JavaScript
- **Test**: Runs test suite
- **Prisma Validation**: Validates Prisma schema

### Continuous Deployment

- **Docker Build**: Builds Docker image
- **Docker Push**: Pushes to container registry
- **Deploy**: Deploys to production (configure as needed)

### Workflow Files

- `.github/workflows/ci.yml`: CI pipeline
- `.github/workflows/cd.yml`: CD pipeline (configure secrets)

## Project Structure

```
rebac-rbac-prisma-ts/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── dist/                   # Compiled JavaScript (generated)
├── logs/                   # Log files (production, generated)
├── node_modules/           # Dependencies
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config.ts          # Environment configuration
│   ├── index.ts           # Application entry point
│   ├── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication middleware
│   │   ├── rbac.ts        # RBAC middleware
│   │   └── rebac.ts       # ReBAC middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   └── records.ts     # Record routes
│   ├── utils/
│   │   ├── errors.ts      # Custom error classes
│   │   └── logger.ts      # Winston logger configuration
│   ├── seed.ts            # Seed function
│   └── seed-cli.ts        # Seed CLI entry
├── test/                  # Test files
├── .env.example           # Environment template
├── .gitignore
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker image definition
├── package.json
├── README.md             # This file
└── tsconfig.json         # TypeScript configuration
```

### Key Files Explained

- **`src/utils/errors.ts`**: Custom error classes for consistent error handling
- **`src/utils/logger.ts`**: Winston logger configuration with different log levels
- **`src/config.ts`**: Centralized configuration with validation
- **`src/index.ts`**: Main application entry point with middleware setup
- **`src/middleware/`**: Authentication and authorization middleware
- **`src/routes/`**: API route handlers with validation

## 🔧 Available Scripts

| Script                     | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `npm run dev`            | Start development server with hot reload (ts-node-dev) |
| `npm run build`          | Compile TypeScript to JavaScript                       |
| `npm start`              | Start production server                                |
| `npm run seed`           | Seed database (module)                                 |
| `npm run seed:cli`       | Seed database (CLI)                                    |
| `npm run prisma:migrate` | Create and apply migration                             |
| `npm test`               | Run test suite                                         |

### Development Workflow

1. **Start Development Server**: `npm run dev`

   - Uses `ts-node-dev` for hot reload
   - Automatically restarts on file changes
   - TypeScript files run directly without compilation
2. **Build for Production**: `npm run build`

   - Compiles TypeScript to JavaScript in `dist/` folder
   - Type checks the codebase
3. **Run Production**: `npm start`

   - Runs the compiled JavaScript from `dist/`
   - Requires build step first

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Ensure all tests pass

## License

This project is licensed under the MIT License.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs db

# Test connection
psql -h localhost -U postgres -d rebac_rbac_example

# Check health endpoint
curl http://localhost:4090/
```

### Prisma Issues

```bash
# Reset Prisma Client
rm -rf node_modules/.prisma
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=4001

# Or kill process using port 4090
lsof -ti:4090 | xargs kill

# On Windows
netstat -ano | findstr :4090
taskkill /PID <PID> /F
```

### Logging Issues

```bash
# Check log files (production)
tail -f logs/error.log
tail -f logs/combined.log

# Development logs appear in console
# Adjust log level via NODE_ENV
```

### Rate Limiting

If you're hitting rate limits during development:

- Increase `RATE_LIMIT_MAX` in `.env`
- Increase `RATE_LIMIT_WINDOW_MS` for longer windows
- Or disable rate limiting in development (modify `src/index.ts`)

### TypeScript Compilation Errors

```bash
# Type check without building
npx tsc --noEmit

# Clean and rebuild
rm -rf dist node_modules/.prisma
npm install
npx prisma generate
npm run build
```

## Support

For issues and questions:

- Open an issue on GitHub
- Check existing documentation
- Review Prisma documentation: https://www.prisma.io/docs

---

**Built with ❤️ using TypeScript, Express, Prisma, and PostgreSQL by @amoako-franque**
