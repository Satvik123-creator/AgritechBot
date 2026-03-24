import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Order } from '../models/Order';
import { logger } from '../utils/logger';

const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  signature: z.string().optional(), // In a real flow, this would be required
});

/**
 * POST /api/payment/verify
 * Dummy stub for verifying Razorpay/Stripe payments.
 * Always auto-approves for now based on user request.
 */
export async function verifyPayment(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyPaymentSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { paymentId, orderId } = parsed.data;
  const userId = request.user!._id;

  try {
    // Check if the order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });
    
    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return reply.status(400).send({ error: `Order is already ${order.status}` });
    }

    // --- DUMMY SUCCESS VERIFICATION ---
    // In production, we'd hash the orderId + paymentId with the webhook secret
    // and compare it to the signature here.
    
    logger.info({ orderId, paymentId }, 'Mocking successful payment verification');

    order.paymentId = paymentId;
    order.status = 'confirmed';
    await order.save();

    return reply.send({
      message: 'Payment verified successfully (dummy)',
      orderId: order._id,
      status: order.status,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Payment verification failed');
    return reply.status(500).send({ error: 'Internal Server Error during verification' });
  }
}
