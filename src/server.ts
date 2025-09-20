import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Coffee Store API is running!');
});

// API Documentation
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Coffee Store API',
    versions: {
      v1: {
        path: '/api/v1',
        status: 'active',
        endpoints: {
          coffees: '/api/v1/coffees'
        }
      }
    }
  });
});

// API routes with versioning
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Coffee Store API is running on port ${PORT}`);
  
  // In development mode, also start Drizzle Studio
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Drizzle Studio available at http://localhost:${PORT}/studio (when running separately)`);
  }
});