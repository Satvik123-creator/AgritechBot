import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { generateToken } from '../middlewares/authMiddleware';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

/**
 * POST /api/auth/send-otp
 */
export async function sendOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { phone } = parsed.data;

  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({ phone });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  // TODO: Integrate SMS gateway (Twilio, MSG91, etc.) here for production.
  // For now, we return the OTP in the response to allow testing without an SMS provider.
  logger.info({ phone, otp }, 'OTP generated (bypassing SMS for testing)');

  return reply.send({
    message: 'OTP sent successfully',
    otp, // Always returned for functional testing
  });
}

/**
 * POST /api/auth/verify-otp
 */
export async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { phone, otp } = parsed.data;

  const user = await User.findOne({ phone }).select('+otp +otpExpiresAt');
  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return reply.status(400).send({ error: 'OTP expired' });
  }

  const isValid = await user.compareOtp(otp);
  if (!isValid) {
    return reply.status(400).send({ error: 'Invalid OTP' });
  }

  // Mark as verified, clear OTP
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  // Create free subscription if none exists
  const existingSub = await Subscription.findOne({ userId: user._id });
  if (!existingSub) {
    try {
      await Subscription.create({
        userId: user._id,
        tier: 'free',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        features: TIER_FEATURES.free,
      });
    } catch (err: unknown) {
      const isDuplicateKey =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: number }).code === 11000;

      if (isDuplicateKey) {
        logger.warn({ err, userId: user._id }, 'Skipping subscription create due to duplicate index state');
      } else {
        throw err;
      }
    }
  }

  const token = generateToken({ userId: String(user._id), role: user.role });

  return reply.send({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      language: user.language,
      subscriptionTier: user.subscriptionTier,
    },
  });
}
