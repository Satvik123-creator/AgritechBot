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

  const response: Record<string, unknown> = {
    message: 'OTP sent successfully',
    expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60,
      otp: otp, // User requested to ALWAYS send OTP preview during review phase
    };

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

// --- 2Factor.in SMS OTP Integration ---
const twoFactorSessions = new Map<string, string>(); // Maps phone -> sessionId
const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || 'YOUR_2FACTOR_API_KEY';

export async function send2FactorOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ success: false, message: 'Invalid phone number format' });
  }

  const { phone } = parsed.data;

  try {
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${encodeURIComponent(phone)}/AUTOGEN`;
    const res = await fetch(url);
    const data = await res.json() as Record<string, string>;

    if (data.Status === 'Success') {
      twoFactorSessions.set(phone, data.Details); // Store sessionId
      return reply.send({ success: true, message: 'OTP sent successfully' });
    } else {
      return reply.status(400).send({ success: false, message: data.Details || 'Failed to send OTP' });
    }
  } catch (error) {
    logger.error({ error }, 'Send 2Factor OTP failed');
    return reply.status(500).send({ success: false, message: 'Internal Server Error' });
  }
}

export async function verify2FactorOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ success: false, message: 'Invalid phone or OTP format' });
  }

  const { phone, otp } = parsed.data;
  const sessionId = twoFactorSessions.get(phone);

  if (!sessionId) {
    return reply.status(400).send({ success: false, message: 'OTP session not found or expired. Please request a new OTP.' });
  }

  try {
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
    const res = await fetch(url);
    const data = await res.json() as Record<string, string>;

    if (data.Details === 'OTP Matched') {
      twoFactorSessions.delete(phone); // Clean up session

      // Standard user upsert sequence replacing OTP payload to allow access precisely like the existing system
      let user = await User.findOne({ phone });
      if (!user) {
        user = new User({ phone, isVerified: true, subscriptionTier: 'free' });
        await user.save();
      } else if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

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
        success: true,
        message: 'Login successful',
        token: internalToken,
        user: buildUserPayload(user),
      });
    } else {
      return reply.status(400).send({ success: false, message: data.Details || 'Invalid OTP' });
    }
  } catch (error) {
    logger.error({ error }, 'Verify 2Factor OTP failed');
    return reply.status(500).send({ success: false, message: 'Internal Server Error' });
  }
}
