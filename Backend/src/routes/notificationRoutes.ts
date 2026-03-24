import { FastifyInstance } from 'fastify';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authMiddleware);

  app.get('/api/notifications', getNotifications);
  app.get('/api/notifications/unread-count', getUnreadCount);
  app.put('/api/notifications/:id/read', markAsRead);
  app.put('/api/notifications/read-all', markAllRead);
}
