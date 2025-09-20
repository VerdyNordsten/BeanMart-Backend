import { Router } from 'express';
import { 
  getAllCoffeesHandler,
  getCoffeeByIdHandler,
  createCoffeeHandler,
  updateCoffeeHandler,
  deleteCoffeeHandler
} from '../../controllers/v1/coffeeController';

const router = Router();

// Coffee routes
router.get('/coffees', getAllCoffeesHandler);
router.get('/coffees/:id', getCoffeeByIdHandler);
router.post('/coffees', createCoffeeHandler);
router.put('/coffees/:id', updateCoffeeHandler);
router.delete('/coffees/:id', deleteCoffeeHandler);

export default router;