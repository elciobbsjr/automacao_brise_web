import type {
  UserRole,
} from "@/generated/prisma/client";

export interface UserCapabilities {
  canControlDevices: boolean;
  canManageSchedules: boolean;
  canManageUsers: boolean;
}

/*
 * Centraliza as permissões visuais
 * e funcionais de cada perfil.
 *
 * VIEWER:
 * somente consulta.
 *
 * OPERATOR:
 * consulta + controle + agendamentos.
 *
 * ADMIN:
 * tudo do operador + administração.
 */
export function getUserCapabilities(
  role: UserRole,
): UserCapabilities {
  const canOperate =
    role === "ADMIN" ||
    role === "OPERATOR";

  return {
    canControlDevices:
      canOperate,

    canManageSchedules:
      canOperate,

    canManageUsers:
      role === "ADMIN",
  };
}