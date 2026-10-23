import "server-only";

import {
  prisma,
} from "@/lib/prisma";

import type {
  Prisma,
} from "@/generated/prisma/client";

const DEFAULT_PAGE_SIZE =
  20;

const MAX_PAGE_SIZE =
  100;

/*
 * ==========================================
 * FILTROS
 * ==========================================
 */

export interface AuditLogFilters {
  page?: number;

  pageSize?: number;

  search?: string;

  action?: string;

  /*
   * Período da auditoria.
   *
   * As datas já chegam convertidas
   * para Date pela página.
   */
  from?: Date;

  to?: Date;
}

/*
 * ==========================================
 * LISTAGEM DOS LOGS
 * ==========================================
 */

export async function getAuditLogs(
  filters: AuditLogFilters = {},
) {
  /*
   * ========================================
   * PAGINAÇÃO
   * ========================================
   */

  const page =
    Number.isInteger(
      filters.page,
    ) &&
    (filters.page ?? 0) > 0
      ? filters.page!
      : 1;

  const requestedPageSize =
    Number.isInteger(
      filters.pageSize,
    ) &&
    (filters.pageSize ?? 0) > 0
      ? filters.pageSize!
      : DEFAULT_PAGE_SIZE;

  const pageSize =
    Math.min(
      requestedPageSize,
      MAX_PAGE_SIZE,
    );

  /*
   * ========================================
   * NORMALIZAÇÃO DOS FILTROS
   * ========================================
   */

  const search =
    filters.search
      ?.trim();

  const action =
    filters.action
      ?.trim();

  /*
   * ========================================
   * WHERE
   * ========================================
   */

  const where:
    Prisma.AuditLogWhereInput = {};

  /*
   * AÇÃO
   */

  if (action) {
    where.action =
      action;
  }

  /*
   * BUSCA TEXTUAL
   */

  if (search) {
    where.OR = [
      {
        actorName: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        actorEmail: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        description: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        action: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        resource: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },

      {
        resourceId: {
          contains:
            search,

          mode:
            "insensitive",
        },
      },
    ];
  }

  /*
   * ========================================
   * DATA / HORÁRIO
   * ========================================
   *
   * Exemplos:
   *
   * from:
   * 22/10/2026 00:00
   *
   * to:
   * 22/10/2026 23:59:59
   *
   * ou:
   *
   * from:
   * 22/10/2026 18:00
   *
   * to:
   * 22/10/2026 18:30:59
   */

  if (
    filters.from ||
    filters.to
  ) {
    where.createdAt = {
      ...(filters.from
        ? {
            gte:
              filters.from,
          }
        : {}),

      ...(filters.to
        ? {
            lte:
              filters.to,
          }
        : {}),
    };
  }

  /*
   * ========================================
   * CONSULTAS
   * ========================================
   */

  const [
    total,
    logs,
  ] =
    await Promise.all([
      prisma.auditLog.count({
        where,
      }),

      prisma.auditLog.findMany({
        where,

        /*
         * Logs mais recentes primeiro.
         */
        orderBy: {
          createdAt:
            "desc",
        },

        skip:
          (page - 1) *
          pageSize,

        take:
          pageSize,

        select: {
          id: true,

          actorId: true,

          actorName: true,

          actorEmail: true,

          action: true,

          resource: true,

          resourceId: true,

          description: true,

          metadata: true,

          createdAt: true,
        },
      }),
    ]);

  /*
   * ========================================
   * TOTAL DE PÁGINAS
   * ========================================
   */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          pageSize,
      ),
    );

  return {
    logs,

    total,

    page,

    pageSize,

    totalPages,
  };
}

/*
 * ==========================================
 * OPÇÕES DOS FILTROS
 * ==========================================
 *
 * Atualmente precisamos somente das
 * ações existentes no banco.
 *
 * O filtro por recurso foi removido
 * da interface administrativa.
 */

export async function getAuditFilterOptions() {
  const actions =
    await prisma.auditLog.findMany({
      distinct: [
        "action",
      ],

      select: {
        action:
          true,
      },

      orderBy: {
        action:
          "asc",
      },
    });

  return {
    actions:
      actions.map(
        (item) =>
          item.action,
      ),
  };
}

/*
 * ==========================================
 * ESTATÍSTICAS
 * ==========================================
 */

export async function getAuditStats() {
  const [
    total,
    users,
    devices,
    schedules,
  ] =
    await Promise.all([
      /*
       * Todos os eventos.
       */
      prisma.auditLog.count(),

      /*
       * Eventos relacionados
       * a usuários.
       */
      prisma.auditLog.count({
        where: {
          resource:
            "USER",
        },
      }),

      /*
       * Eventos relacionados
       * a equipamentos.
       */
      prisma.auditLog.count({
        where: {
          resource:
            "DEVICE",
        },
      }),

      /*
       * Eventos relacionados
       * a agendamentos.
       */
      prisma.auditLog.count({
        where: {
          resource:
            "SCHEDULE",
        },
      }),
    ]);

  return {
    total,

    users,

    devices,

    schedules,
  };
}