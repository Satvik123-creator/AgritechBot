import { FastifyRequest, FastifyReply } from 'fastify';
import { Order } from '../models/Order';
import mongoose from 'mongoose';

export const createOrder = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentId } = req.body as any;
    
    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(), // Simulated user ID for bypass
      items,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      paymentId
    });

    await newOrder.save();
    return reply.code(201).send({ success: true, order: newOrder });
  } catch (error) {
    return reply.code(500).send({ success: false, message: 'Failed to create order', error });
  }
};

export const getAllOrders = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return reply.code(200).send({ success: true, orders });
  } catch (error) {
    return reply.code(500).send({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return reply.code(404).send({ success: false, message: 'Order not found' });
    return reply.code(200).send({ success: true, order });
  } catch (error) {
    return reply.code(500).send({ success: false, message: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: FastifyRequest<{ Params: { id: string }, Body: { orderStatus: string } }>, reply: FastifyReply) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: orderStatus },
      { new: true }
    );
    if (!order) return reply.code(404).send({ success: false, message: 'Order not found' });
    return reply.code(200).send({ success: true, order });
  } catch (error) {
    return reply.code(500).send({ success: false, message: 'Failed to update order' });
  }
};
