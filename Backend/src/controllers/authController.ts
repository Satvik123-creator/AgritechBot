import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
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

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  otp: z.string().regex(/^\d{6}$/, 'Invalid OTP'),
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildUserPayload(user: any) {
  return {
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
  };
}

/**
 * POST /api/auth/send-otp
 * Generates OTP and stores hashed OTP in DB. Returns OTP in response
 * (requested temporary behavior for both development and production).
 */
export async function sendOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { phone } = parsed.data;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({
      phone,
      isVerified: false,
      subscriptionTier: 'free',
      otp,
      otpExpiresAt: expiresAt,
    });
  } else {
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
  }

  await user.save();

  logger.info({ phone }, 'OTP generated successfully');

  return reply.send({
    message: 'OTP sent successfully',
    otp,
    expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60,
  });
}

/**
 * POST /api/auth/verify-otp
 * Verifies the provided OTP and returns local session token.
 */
export async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { phone, otp } = parsed.data;

  const user = await User.findOne({ phone }).select('+otp +otpExpiresAt');

  if (!user || !user.otp || !user.otpExpiresAt) {
    return reply.status(401).send({ error: 'OTP not requested or expired' });
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    return reply.status(401).send({ error: 'OTP expired' });
  }

  const isValid = await user.compareOtp(otp);
  if (!isValid) {
    return reply.status(401).send({ error: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const existingSub = await Subscription.findOne({ userId: user._id });
  if (!existingSub) {
    await Subscription.create({
      userId: user._id,
      tier: 'free',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: TIER_FEATURES.free,
    });
  }

  const internalToken = generateInternalToken(String(user._id), user.role);

  return reply.send({
    message: 'Login successful',
    token: internalToken,
    user: buildUserPayload(user),
  });
}
