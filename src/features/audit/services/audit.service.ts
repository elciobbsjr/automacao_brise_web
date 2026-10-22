import "server-only";

import {
  prisma,
} from "@/lib/prisma";

import type {
  Prisma,
} from "@/generated/prisma/client";

export interface CreateAuditLogData {
  actor: {
    id: string;
    name: string;
    email: string;
  };

  action: string;

  resource: string;

  resourceId?:
    | string
    | null;

  description: string;

  metadata?:
    Prisma.InputJsonValue;
}

/**
 * Registra uma ação relevante
 * realizada dentro do sistema.
 *
 * IMPORTANTE:
 *
 * Nunca enviar para metadata:
 *
 * - senha;
 * - passwordHash;
 * - token;
 * - AUTH_SECRET;
 * - cookies;
 * - credenciais de dispositivos;
 * - qualquer outro segredo.
 */
export async function createAuditLog(
  data: CreateAuditLogData,
) {
  return prisma.auditLog.create({
    data: {
      actorId:
        data.actor.id,

      actorName:
        data.actor.name,

      actorEmail:
        data.actor.email,

      action:
        data.action,

      resource:
        data.resource,

      resourceId:
        data.resourceId ??
        null,

      description:
        data.description,

      metadata:
        data.metadata,
    },

    select: {
      id: true,
      createdAt: true,
    },
  });
}