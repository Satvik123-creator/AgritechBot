import { FastifyInstance } from 'fastify';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/orders', createOrder);
  app.get('/api/v1/orders', getAllOrders);
  app.get('/api/v1/orders/:id', getOrderById);
  app.patch('/api/v1/orders/:id/status', updateOrderStatus);
}
