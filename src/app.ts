import type { Application, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import v1Routes from './routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import Swagger
import { setupSwagger } from './config/swagger';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api/v1', (req, res, next) => {
  // Simple health check that doesn't depend on database
  if (req.path === '/' && req.method === 'GET') {
    return res.status(200).json({ 
      status: 'OK', 
      version: 'v1',
      message: 'Beanmart API v1 is running'
    });
  }
  // For other routes, pass to the actual routes
  next();
  return; // Explicitly return void
}, v1Routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Beanmart API is running' });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 