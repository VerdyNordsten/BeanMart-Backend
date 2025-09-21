# Beanmart Backend API

This project implements a modern e-commerce backend API for a coffee shop using Express.js with TypeScript and raw PostgreSQL queries for database operations.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Database Management](#database-management)
- [Authentication](#authentication)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Architecture Overview

The project follows a clean architecture pattern with the following layers:

1. **Controllers** - Handle HTTP requests and responses
2. **Models** - Contain business logic and database operations using raw PostgreSQL queries
3. **Validation** - Zod schemas for input validation
4. **Database Schema** - SQL schema definitions in `database.sql`

This approach uses raw PostgreSQL queries for maximum performance and control, while still benefiting from type safety through TypeScript interfaces and input validation through Zod schemas.

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (accessed via raw queries)
- **Zod** - Input validation
- **Swagger/OpenAPI** - API documentation
- **PNPM** - Package manager
- **JWT** - Authentication tokens
- **BCrypt** - Password hashing

## Project Structure

```
src/
├── controllers/          # Request handlers
├── models/              # Data access layer with raw queries
├── routes/              # API routes
├── validation/          # Zod validation schemas
├── config/              # Configuration files
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── scripts/             # Database initialization scripts
├── app.ts               # Application entry point
└── server.ts            # Server initialization
```

## Database Management

### Schema Definitions

Database schemas are defined in `database.sql` using standard PostgreSQL syntax. This file contains all table definitions, indexes, and relationships.

### Raw Queries

All database operations in the models use raw PostgreSQL queries for maximum performance and control, while still benefiting from:

1. Type safety through TypeScript interfaces
2. Input validation through Zod schemas

## Storage Configuration

This project uses S3-compatible storage for product images. You need to configure the following environment variables:

- `STORAGE_ENDPOINT` - The endpoint URL for your S3-compatible storage service
- `STORAGE_PUBLIC_ENDPOINT` - The public endpoint URL for accessing stored files
- `STORAGE_ACCESS_KEY` - Access key for your storage service
- `STORAGE_SECRET_KEY` - Secret key for your storage service
- `STORAGE_BUCKET_NAME` - The name of the bucket to store files in
- `STORAGE_REGION` - The region for your storage service

For development, you can use MinIO as a local S3-compatible storage solution.

## Authentication

The API supports two types of users:
1. **Regular Users** - Customers who can browse products and place orders
2. **Admins** - Administrators who can manage products, categories, and orders

Authentication is handled through JWT tokens. Passwords are securely hashed using BCrypt.

### Roles and Permissions

- **Users**: Can register, login, view products, and place orders
- **Admins**: Can manage all aspects of the system including products, categories, and orders

## API Documentation

The API is documented using Swagger/OpenAPI and can be accessed at:
- Development: `http://localhost:3000/api-docs`
- Production: `https://your-domain.com/api-docs`

Additionally, a comprehensive HTML documentation is available in `API_DOCUMENTATION.html`.

## Getting Started

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- PNPM >= 7.x
- S3-compatible storage service (e.g., AWS S3, MinIO) for file storage

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd beanmart/backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Setup database:
   - Create a PostgreSQL database
   - Run the `database.sql` script to create tables
   - Configure database connection in `.env` file

4. Configure storage:
   - Set up an S3-compatible storage service (AWS S3, MinIO, etc.)
   - Create a bucket for storing product images
   - Generate access keys for the storage service
   - Configure storage settings in `.env` file

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database and storage configuration
```

5. Initialize database:
```bash
pnpm run db:init
```

### Development

Run in development mode:
```bash
pnpm run dev
```

Server will run on `http://localhost:3000`

### Production

Build the project:
```bash
pnpm run build
```

Start the server:
```bash
pnpm start
```

## Development Workflow

1. Make changes to the database schema in `database.sql`
2. Update TypeScript interfaces in `src/models/index.ts` if needed
3. Update models to use new schema if needed
4. Update Zod schemas in `src/validation/schemas.ts` if needed
5. Update controllers and routes as needed

## Deployment

1. Build the project: `pnpm run build`
2. Set environment variables in production environment
3. Run database initialization: `pnpm run db:init`
4. Start the server: `pnpm start`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

Please ensure your code follows the existing style and includes appropriate tests.

---

For detailed API documentation, please refer to `API_DOCUMENTATION.html` or visit the Swagger UI at `/api-docs` when the server is running.