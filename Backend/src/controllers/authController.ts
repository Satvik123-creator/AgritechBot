import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { authAdmin } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * We still use our own JWT for internal API sessions 
 * to avoid hitting Firebase Admin for every single request
 * and to maintain our payload structure.
 */
function generateInternalToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

const firebaseVerifySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  token: z.string().min(10, 'Invalid Firebase ID Token'),
});

/**
 * POST /api/auth/verify-otp
 * Verifies the Firebase ID Token and returns a local session token.
 */
export async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = firebaseVerifySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { phone, token } = parsed.data;

  try {
    // 1. Verify with Firebase Admin
    const decodedToken = await authAdmin.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    const firebasePhone = decodedToken.phone_number;

    // Security: Check if the token phone matches requested phone
    if (firebasePhone !== phone && env.NODE_ENV === 'production') {
       return reply.status(401).send({ error: 'Identity mismatch' });
    }

    // 2. Sync with MongoDB
    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        phone,
        firebaseUid,
        isVerified: true,
        subscriptionTier: 'free',
      });
      await user.save();

      // Create free subscription
      await Subscription.create({
        userId: user._id,
        tier: 'free',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: TIER_FEATURES.free,
      });
    } else if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    }

    // 3. Generate Local JWT for subsequent requests
    const internalToken = generateInternalToken(String(user._id), user.role);

    return reply.send({
      message: 'Login successful',
      token: internalToken,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        language: user.language,
        location: user.location,
        crops: user.crops,
        landSize: user.landSize,
        landUnit: user.landUnit,
        subscriptionTier: user.subscriptionTier,
      },
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Firebase token verification failed in controller');
    return reply.status(401).send({ error: 'Unauthorized: Invalid Firebase token' });
  }
}

/**
 * Deprecated: Handled by Firebase on Frontend
 */
export async function sendOtp(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(410).send({ 
        error: 'Deprecated. Please use Firebase Phone Auth on the client side.' 
    });
}
