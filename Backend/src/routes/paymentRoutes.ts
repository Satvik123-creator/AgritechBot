import { FastifyInstance } from 'fastify';
import { verifyPayment } from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.post('/api/payment/verify', verifyPayment);
}
