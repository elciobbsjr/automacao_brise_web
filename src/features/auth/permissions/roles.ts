import {
  UserRole,
} from "@/generated/prisma/client";

/*
 * Perfis que podem consultar
 * informações do sistema.
 */
export const BRISE_READ_ROLES = [
  UserRole.VIEWER,
  UserRole.OPERATOR,
  UserRole.ADMIN,
] as const;

/*
 * Perfis que podem enviar comandos,
 * alterar parâmetros e gerenciar
 * agendamentos.
 */
export const BRISE_CONTROL_ROLES = [
  UserRole.OPERATOR,
  UserRole.ADMIN,
] as const;

/*
 * Recursos exclusivamente
 * administrativos.
 */
export const ADMIN_ONLY_ROLES = [
  UserRole.ADMIN,
] as const;