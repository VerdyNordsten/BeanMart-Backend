# Beanmart Backend API

This project implements a modern e-commerce backend API for a coffee shop using Express.js with TypeScript and raw PostgreSQL queries for database operations.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features](#features)
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
- **Multer** - File upload handling
- **AWS SDK** - S3-compatible storage
- **UUID** - Generate unique identifiers
- **Helmet** - Security middleware
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

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

## Features

The Beanmart Backend API provides a comprehensive set of e-commerce features:

### User Management
- User registration with email and password
- User authentication with JWT tokens
- User profile management
- Password hashing with BCrypt
- Admin and regular user roles

### Product Management
- CRUD operations for products
- Product variants with different prices, weights, and stock levels
- Product descriptions (short and long)
- Active/inactive product status
- Product categorization

### Category Management
- Create, read, update, and delete categories
- Assign products to categories
- Retrieve products by category

### Inventory Management
- Track product variant stock levels
- Update stock quantities
- Active/inactive variant status

### Order Management
- Create orders with multiple items
- Order status tracking (pending, processing, shipped, delivered, cancelled)
- Order history for users
- Retrieve orders by user or admin access
- Automatic order number generation
- Currency support

### Address Management
- User address book functionality
- Multiple addresses per user
- Default address designation
- Shipping and billing address support

### File Upload
- S3-compatible storage for product images
- Upload product variant images
- Support for multiple images per product variant
- Image management functionality

### Authentication & Security
- JWT-based authentication
- Role-based access control (user vs admin)
- Secure password storage with BCrypt
- CORS and Helmet security middleware

### API Features
- Consistent snake_case field naming in requests and responses
- Proper validation and error handling
- Comprehensive CRUD operations for all entities
- Support for optional fields with proper default value handling

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


### Available API Endpoints

The API provides the following endpoints:

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires authentication)

#### User Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a specific user (admin only or own profile)
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/:id` - Update a user (admin only or own profile)
- `DELETE /api/users/:id` - Delete a user (admin only)

#### User Addresses
- `GET /api/user-addresses` - Get all user addresses (authenticated users)
- `GET /api/user-addresses/:id` - Get a specific address (owner or admin)
- `POST /api/user-addresses` - Create a new user address (authenticated users)
- `PUT /api/user-addresses/:id` - Update a user address (owner or admin)
- `DELETE /api/user-addresses/:id` - Delete a user address (owner or admin)
- `PUT /api/user-addresses/:id/set-default` - Set default address (owner or admin)

#### Product Management
- `GET /api/products` - Get all products (public)
- `GET /api/products/active` - Get only active products (public)
- `GET /api/products/:id` - Get a specific product (public)
- `GET /api/products/slug/:slug` - Get a product by slug (public)
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

#### Product Variants
- `GET /api/product-variants` - Get all product variants (public)
- `GET /api/product-variants/active` - Get only active variants (public)
- `GET /api/product-variants/:id` - Get a specific variant (public)
- `POST /api/product-variants` - Create a new product variant (admin only)
- `PUT /api/product-variants/:id` - Update a product variant (admin only)
- `DELETE /api/product-variants/:id` - Delete a product variant (admin only)

#### Categories
- `GET /api/categories` - Get all categories (public)
- `GET /api/categories/:id` - Get a specific category (public)
- `GET /api/categories/:id/products` - Get products in a category (public)
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)
- `POST /api/categories/:id/products` - Add a product to a category (admin only)
- `DELETE /api/categories/:id/products/:productId` - Remove a product from a category (admin only)

#### Orders
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/user` - Get authenticated user's orders
- `GET /api/orders/:id` - Get a specific order (owner or admin)
- `POST /api/orders` - Create a new order (authenticated users)
- `PUT /api/orders/:id` - Update an order (admin only)
- `DELETE /api/orders/:id` - Delete an order (admin only)

#### File Upload
- `POST /api/upload/variant-image` - Upload a product variant image (admin only)
- `POST /api/upload/variant-images` - Upload multiple product variant images (admin only)

#### Variant Images
- `GET /api/variant-images` - Get all variant images
- `GET /api/variant-images/:id` - Get a specific variant image
- `POST /api/variant-images` - Create a new variant image
- `PUT /api/variant-images/:id` - Update a variant image
- `DELETE /api/variant-images/:id` - Delete a variant image

### API Request/Response Examples

Most endpoints follow a consistent pattern with JSON requests and responses:

**Successful Response Format:**
```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors, if applicable */ ]
}
```

**Example Product Request:**
```json
{
  "name": "Espresso",
  "slug": "espresso",
  "short_description": "Strong black coffee",
  "long_description": "Finely ground coffee beans brewed under pressure",
  "currency": "IDR"
}
```

## Getting Started

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- PNPM >= 7.x
- S3-compatible storage service (e.g., AWS S3, MinIO) for file storage
- An S3-compatible storage account with appropriate permissions

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
6. Run linting and tests to ensure code quality:
   ```bash
   pnpm lint
   pnpm build  # or pnpm run build
   ```
7. Test API endpoints using the Swagger UI at `/api-docs`

The API follows consistent field naming patterns with snake_case for both requests and responses to ensure compatibility with the database schema.

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

For detailed API documentation, please visit the Swagger UI at `/api-docs` when the server is running.

## Recent Improvements

- **Field Name Mapping**: Fixed consistent snake_case field naming in requests and responses to match the database schema
- **Product Descriptions**: Fixed issue where short_description and long_description fields are properly saved when creating products
- **User Management**: Fixed proper saving of the full_name field when creating users
- **Database Error Handling**: Resolved database errors when updating users, products, product variants, categories, and user addresses
- **Order Validation**: Improved order creation validation schema to properly handle optional orderNumber and totalAmount fields with controller auto-generation
- **API Consistency**: Ensured all endpoints are functional and working correctly with proper validation