import { FastifyRequest, FastifyReply } from 'fastify';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser;
  }
}

interface AuthTokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

function getRoute(request: FastifyRequest): string {
  return request.routeOptions.url || request.url;
}

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

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    if (!decoded?.userId) {
      return reply.status(401).send({ error: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    request.user = user;
  } catch (err) {
    logger.warn(
      { reqId: request.id, route, ip: request.ip, err },
      'Authentication failed: token verification error'
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
