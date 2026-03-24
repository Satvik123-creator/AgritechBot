import { FastifyRequest, FastifyReply } from 'fastify';
import { Notification, NotificationType } from '../models/Notification';
import { logger } from '../utils/logger';

// ── Sample notifications to seed for new users ──
const SEED_NOTIFICATIONS: Array<{
  type: NotificationType;
  title: string;
  body: string;
  actionLabel?: string;
  hoursAgo: number;
}> = [
  {
    type: 'crop_alert',
    title: 'Pest Risk Detected',
    body: 'High probability of aphids in your wheat crop. Monitor closely and consider applying neem oil spray.',
    actionLabel: 'Take Action',
    hoursAgo: 2,
  },
  {
    type: 'weather',
    title: 'Heavy Rain Expected',
    body: 'Heavy rainfall predicted in your region for the next 48 hours. Ensure proper drainage in your fields.',
    actionLabel: 'View Forecast',
    hoursAgo: 4,
  },
  {
    type: 'crop_alert',
    title: 'Irrigation Update',
    body: 'Soil moisture has dropped to 45%. Consider irrigating your fields within the next 24 hours.',
    actionLabel: 'Dismiss',
    hoursAgo: 5,
  },
  {
    type: 'ai_suggestion',
    title: 'AI Yield Insight',
    body: 'Based on current conditions, a 12% yield increase is projected if you apply urea fertilizer this week.',
    actionLabel: 'View Analysis',
    hoursAgo: 18,
  },
  {
    type: 'weather',
    title: 'Frost Warning',
    body: 'Temperature expected to drop below 4°C tonight. Protect sensitive crops with mulch or row covers.',
    actionLabel: 'Dismiss',
    hoursAgo: 24,
  },
  {
    type: 'ai_suggestion',
    title: 'New AI Insights Available',
    body: 'Your crop health summary has changed in the last 24 hours. Open the assistant for updated advice.',
    actionLabel: 'Open Assistant',
    hoursAgo: 30,
  },
  {
    type: 'system',
    title: 'Welcome to Anaaj AI!',
    body: 'Your account is set up. Explore Crop Alerts, Weather updates and AI powered suggestions.',
    hoursAgo: 48,
  },
  {
    type: 'crop_alert',
    title: 'Harvest Window Opening',
    body: 'Optimal harvesting conditions for wheat expected in 5-7 days. Prepare your equipment.',
    actionLabel: 'View Details',
    hoursAgo: 36,
  },
];

/**
 * GET /api/notifications
 * Query params: ?type=crop_alert|weather|ai_suggestion|order|system
 */
export async function getNotifications(
  request: FastifyRequest<{ Querystring: { type?: string } }>,
  reply: FastifyReply
) {
  const userId = request.user!._id;
  const { type } = request.query;

  // Auto-seed notifications if user has none
  const count = await Notification.countDocuments({ userId });
  if (count === 0) {
    await seedNotificationsForUser(userId);
  }

  const filter: Record<string, any> = { userId };
  if (type && ['crop_alert', 'weather', 'ai_suggestion', 'order', 'system'].includes(type)) {
    filter.type = type;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return reply.send({ notifications, unreadCount });
}

/**
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user!._id;
  const unreadCount = await Notification.countDocuments({ userId, read: false });
  return reply.send({ unreadCount });
}

/**
 * PUT /api/notifications/:id/read
 */
export async function markAsRead(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user!._id;
  const { id } = request.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return reply.status(404).send({ error: 'Notification not found' });
  }

  return reply.send({ notification });
}

/**
 * PUT /api/notifications/read-all
 */
export async function markAllRead(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user!._id;

  await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );

  return reply.send({ message: 'All notifications marked as read' });
}

/**
 * Helper: seed sample notifications for a user
 */
async function seedNotificationsForUser(userId: any) {
  const now = Date.now();
  const docs = SEED_NOTIFICATIONS.map((n) => ({
    userId,
    type: n.type,
    title: n.title,
    body: n.body,
    actionLabel: n.actionLabel,
    read: false,
    createdAt: new Date(now - n.hoursAgo * 60 * 60 * 1000),
  }));

  try {
    await Notification.insertMany(docs);
    logger.info({ userId }, 'Seeded notifications for new user');
  } catch (err) {
    logger.error({ userId, err }, 'Failed to seed notifications');
  }
}
