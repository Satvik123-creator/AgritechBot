import { FastifyInstance } from 'fastify';
import { getStats, listUsers, getQueuesHealth } from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/authMiddleware';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  const adminOnly = { preHandler: adminMiddleware };

  app.get('/api/admin/stats', adminOnly, getStats);
  app.get('/api/admin/users', adminOnly, listUsers);
  app.get('/api/admin/queues', adminOnly, getQueuesHealth);
  
}
