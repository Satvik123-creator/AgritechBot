import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const otpRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 15 * 60 * 1000 // 15 mins
      }
    }
  };

  app.post('/api/auth/send-otp', otpRateLimit, sendOtp);
  app.post('/api/auth/verify-otp', otpRateLimit, verifyOtp);
}
