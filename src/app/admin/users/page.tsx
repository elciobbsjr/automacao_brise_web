import Link from "next/link";

import {
  UserRole,
} from "@/generated/prisma/client";

import {
  requireRole,
} from "@/features/auth/guards/require-role";

import {
  getUsers,
} from "@/features/users/services/user.service";

import {
  CreateUserModal,
} from "@/features/users/components/CreateUserModal";

import {
  UserActionsMenu,
} from "@/features/users/components/UserActionsMenu";

export const dynamic =
  "force-dynamic";

export default async function UsersPage() {
  /*
   * Apenas administradores podem
   * acessar esta página.
   */
  const currentUser =
  await requireRole([
    UserRole.ADMIN,
  ]);

  const users =
    await getUsers();

  const activeUsers =
    users.filter(
      (user) =>
        user.active,
    ).length;

  const adminUsers =
    users.filter(
      (user) =>
        user.role ===
        UserRole.ADMIN,
    ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      {/* ==========================================
          FUNDO
          ========================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -right-40 top-[320px] h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-3xl" />

        <div className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-100/35 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/65 to-transparent" />
      </div>

      {/* ==========================================
          CONTEÚDO
          ========================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        {/* ==========================================
            CABEÇALHO
            ========================================== */}

        <header className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-blue-50/80" />

            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-blue-700 to-sky-400" />
          </div>

          <div className="relative p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />

                    Administração
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    Brise · SEMEQ
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[34px]">
                  Gerenciamento de usuários
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Consulte as contas cadastradas
                  e os respectivos níveis de
                  acesso à plataforma.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <CreateUserModal />

                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <BackIcon />

                  Voltar ao painel
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ==========================================
            RESUMO
            ========================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Usuários"
            value={
              users.length
            }
            icon={
              <UsersIcon />
            }
            tone="blue"
          />

          <SummaryCard
            label="Contas ativas"
            value={
              activeUsers
            }
            icon={
              <ActiveIcon />
            }
            tone="green"
          />

          <SummaryCard
            label="Administradores"
            value={
              adminUsers
            }
            icon={
              <ShieldIcon />
            }
            tone="slate"
          />
        </section>

        {/* ==========================================
            LISTAGEM
            ========================================== */}

        <section className="mt-6 overflow-hidden rounded-[26px] border border-white/80 bg-white/80 shadow-[0_14px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <UsersIcon />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Usuários cadastrados
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {users.length}{" "}
                  {users.length ===
                  1
                    ? "conta encontrada"
                    : "contas encontradas"}
                </p>
              </div>
            </div>
          </div>

          {users.length ===
          0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum usuário cadastrado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-50/65">
                    <TableHeader>
                      Usuário
                    </TableHeader>

                    <TableHeader>
                      Perfil
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                    <TableHeader>
                      Cadastrado em
                    </TableHeader>
                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:px-6">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (user) => (
                      <tr
                        key={
                          user.id
                        }
                        className="border-b border-slate-100 last:border-b-0 transition hover:bg-blue-50/25"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold tracking-[0.04em] text-white">
                              {getInitials(
                                user.name,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {
                                  user.name
                                }
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {
                                  user.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <StatusBadge
                            active={
                              user.active
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-500 sm:px-6">
                          {formatDate(
                            user.createdAt,
                          )}
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex justify-end">
                            <UserActionsMenu
                              userId={
                                user.id
                              }
                              userName={
                                user.name
                              }
                              active={
                                user.active
                              }
                              isCurrentUser={
                                user.id ===
                                currentUser.id
                              }
                            />
                          </div>
                        </td>

                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ==========================================
   RESUMO
   ========================================== */

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;

  value: number;

  icon: React.ReactNode;

  tone:
    | "blue"
    | "green"
    | "slate";
}) {
  const styles = {
    blue: {
      border:
        "border-blue-100",

      icon:
        "bg-blue-50 text-blue-700",

      accent:
        "bg-blue-600",
    },

    green: {
      border:
        "border-emerald-100",

      icon:
        "bg-emerald-50 text-emerald-700",

      accent:
        "bg-emerald-500",
    },

    slate: {
      border:
        "border-slate-200",

      icon:
        "bg-slate-100 text-slate-600",

      accent:
        "bg-slate-500",
    },
  };

  const current =
    styles[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-white/80 p-5 shadow-sm backdrop-blur ${current.border}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] ${current.accent}`}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${current.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   TABELA
   ========================================== */

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:px-6">
      {children}
    </th>
  );
}

/* ==========================================
   PERFIL
   ========================================== */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const styles = {
    ADMIN:
      "border-blue-100 bg-blue-50 text-blue-700",

    OPERATOR:
      "border-cyan-100 bg-cyan-50 text-cyan-700",

    VIEWER:
      "border-slate-200 bg-slate-50 text-slate-600",
  };

  const labels = {
    ADMIN:
      "Administrador",

    OPERATOR:
      "Operador",

    VIEWER:
      "Visualização",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}

/* ==========================================
   STATUS
   ========================================== */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-red-500"
        }`}
      />

      {active
        ? "Ativo"
        : "Inativo"}
    </span>
  );
}

/* ==========================================
   AUXILIARES
   ========================================== */

function getInitials(
  name: string,
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "US";
  }

  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day:
        "2-digit",

      month:
        "2-digit",

      year:
        "numeric",
    },
  ).format(
    date,
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}