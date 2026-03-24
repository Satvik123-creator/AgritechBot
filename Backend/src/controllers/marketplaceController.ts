import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { env } from '../config/env';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  }),
  paymentId: z.string().min(1).optional(),
});

/**
 * GET /api/products
 */
export async function getProducts(request: FastifyRequest, reply: FastifyReply) {
  const {
    page = 1,
    limit = 20,
    category,
    subCategory,
    search,
    sort = 'newest',
  } = request.query as {
    page?: number;
    limit?: number;
    category?: string;
    subCategory?: string;
    search?: string;
    sort?: 'newest' | 'price-asc' | 'price-desc';
  };

  const filter: Record<string, unknown> = {
    $or: [{ inStock: true }, { 'inventory.available': true }],
  };
  if (category) filter.category = new RegExp(`^${category}$`, 'i');
  if (subCategory) filter.subCategory = new RegExp(`^${subCategory}$`, 'i');
  if (search) filter.$text = { $search: search };

  const sortBy: Record<string, 1 | -1> =
    sort === 'price-asc'
      ? { price: 1 as const }
      : sort === 'price-desc'
        ? { price: -1 as const }
        : { createdAt: -1 as const };

  const products = await Product.find(filter)
    .sort(sortBy)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Product.countDocuments(filter);

  return reply.send({
    products,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
}

/**
 * GET /api/products/:id
 */
export async function getProductById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  const orConditions: Record<string, unknown>[] = [{ slug: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    orConditions.push({ _id: id });
  }

  const product = await Product.findOne({
    $or: orConditions,
  }).lean();
  if (!product) {
    return reply.status(404).send({ error: 'Product not found' });
  }

  return reply.send({ product });
}

/**
 * POST /api/orders
 */
export async function createOrder(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createOrderSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const { items: orderItems, deliveryAddress, paymentId } = parsed.data;

  if (env.NODE_ENV === 'production') {
    if (!paymentId) {
      return reply.status(400).send({ error: 'paymentId is required in production' });
    }

    if (/^mock[_-]/i.test(paymentId)) {
      return reply.status(400).send({ error: 'Mock paymentId is not allowed in production' });
    }
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder: unknown;

    await session.withTransaction(async () => {
      // Fetch product details in transaction
      const productIds = orderItems.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds }, inStock: true }).session(session);

      if (products.length !== orderItems.length) {
        throw new Error('One or more products not found or out of stock');
      }

      const items = orderItems.map((item) => {
        const product = products.find((p: { _id: unknown }) => String(p._id) === item.productId)!;
        const effectivePrice =
          product.pricing?.discountPrice ?? product.pricing?.price ?? product.price;
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: effectivePrice,
        };
      });

      // Reserve inventory atomically per item
      for (const item of orderItems) {
        const product = products.find((p: { _id: unknown }) => String(p._id) === item.productId)!;
        const quantityStock = typeof product.quantity === 'number' ? product.quantity : 0;
        const pricingStock = typeof product.pricing?.stock === 'number' ? product.pricing.stock : undefined;

        const source: 'quantity' | 'pricing.stock' | null =
          quantityStock > 0 ? 'quantity' : typeof pricingStock === 'number' ? 'pricing.stock' : null;

        if (!source) {
          throw new Error(`Product ${product.name} is out of stock`);
        }

        const query =
          source === 'quantity'
            ? { _id: product._id, quantity: { $gte: item.quantity } }
            : { _id: product._id, 'pricing.stock': { $gte: item.quantity } };

        const update =
          source === 'quantity'
            ? { $inc: { quantity: -item.quantity } }
            : { $inc: { 'pricing.stock': -item.quantity } };

        const updated = await Product.findOneAndUpdate(query, update, {
          new: true,
          session,
        });

        if (!updated) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const remainingQty = source === 'quantity' ? updated.quantity : (updated.pricing?.stock ?? 0);
        if (remainingQty <= 0) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { inStock: false, 'inventory.available': false } },
            { session }
          );
        }
      }

      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const [order] = await Order.create(
        [{
          userId,
          items,
          totalAmount,
          deliveryAddress,
          paymentId: paymentId ?? `mock_${Date.now()}`,
        }],
        { session }
      );

      createdOrder = order;
    });

    return reply.status(201).send({ order: createdOrder });
  } catch (err) {
    return reply.status(400).send({ error: (err as Error).message || 'Order creation failed' });
  } finally {
    await session.endSession();
  }
}

/**
 * GET /api/orders
 */
export async function getOrders(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!._id;
  const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number };

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Order.countDocuments({ userId });

  return reply.send({
    orders,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
}
