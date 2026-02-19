import { Injectable } from '@nestjs/common';
import { Prisma } from '../../database/generated/client';
import { PrismaService } from '../../database/prisma/prisma.service';

export interface AuditLogPayload {
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service d'audit pour la traçabilité HDS : qui a accédé à quoi, quand.
 * À appeler depuis les services métier (accès patient, modification, etc.).
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(payload: AuditLogPayload): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId ?? null,
        userId: payload.userId ?? null,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ?? null,
        metadata: (payload.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findRecent(limit = 100, offset = 0) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
      skip: offset,
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        userId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        metadata: true,
      },
    });
  }
}
