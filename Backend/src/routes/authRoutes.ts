import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp, send2FactorOtp, verify2FactorOtp } from '../controllers/authController';

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

  // 2Factor.in SMS OTP Integration Routes
  app.post('/send-otp', otpRateLimit, send2FactorOtp);
  app.post('/verify-otp', otpRateLimit, verify2FactorOtp);
}
