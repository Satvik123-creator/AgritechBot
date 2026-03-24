import { FastifyRequest, FastifyReply } from 'fastify';
import { authAdmin } from '../config/firebaseAdmin';
import { User, IUser } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { logger } from '../utils/logger';

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser;
    firebaseUser?: any; // Decoded ID Token payload
  }
}

function getRoute(request: FastifyRequest): string {
  return request.routeOptions.url || request.url;
}

/**
 * Middleware to verify Firebase ID Token sent from Frontend.
 * It replaces the previous custom JWT logic.
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  const route = getRoute(request);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(
      { reqId: request.id, route, ip: request.ip },
      'Authentication failed: missing or malformed bearer token'
    );
    return reply.status(401).send({ error: 'Authentication required' });
  }

  const idToken = authHeader.substring(7);

  try {
    // 1. Verify the token with Firebase Admin
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    request.firebaseUser = decodedToken;

    // 2. Find or create the user in MongoDB using Firebase UID
    // We trust Firebase to have verified the phone number.
    const firebaseUid = decodedToken.uid;
    const phone = decodedToken.phone_number; // Firebase provides this for Phone Auth

    if (!phone) {
       logger.error({ firebaseUid }, 'Firebase token missing phone_number');
       return reply.status(401).send({ error: 'Invalid authentication provider' });
    }

    let user = await User.findOne({ 
      $or: [{ firebaseUid }, { phone }] 
    });

    if (!user) {
      // Create new user (First time login)
      user = new User({
        firebaseUid,
        phone,
        isVerified: true,
        subscriptionTier: 'free',
      });
      await user.save();
      
      // Auto-create free subscription
      await Subscription.create({
        userId: user._id,
        tier: 'free',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 
        features: TIER_FEATURES.free,
      });

      logger.info({ userId: user._id, phone }, 'Newly registered user via Firebase Phone Auth');
    } else if (!user.firebaseUid) {
      // Link existing phone-only account to Firebase UID
      user.firebaseUid = firebaseUid;
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    }

    request.user = user;
  } catch (err) {
    logger.warn(
      { reqId: request.id, route, ip: request.ip, err },
      'Authentication failed: Firebase token verification error'
    );
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

/**
 * Legacy support for admin check (optional)
 */
export async function adminMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    await authMiddleware(request, reply);
    if (reply.sent) return;
  }

  if (request.user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Admin access required' });
  }
}
