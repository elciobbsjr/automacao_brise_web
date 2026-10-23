import Link from "next/link";

import {
  UserRole,
} from "@/generated/prisma/client";

import {
  requireRole,
} from "@/features/auth/guards/require-role";

import {
  getAuditFilterOptions,
  getAuditLogs,
  getAuditStats,
} from "@/features/audit/services/audit-query.service";

export const dynamic =
  "force-dynamic";

interface AuditPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    action?: string;
    date?: string;
    timeFrom?: string;
    timeTo?: string;
  }>;
}

export default async function AuditPage({
  searchParams,
}: AuditPageProps) {
  await requireRole([
    UserRole.ADMIN,
  ]);

  const params =
    await searchParams;

  const requestedPage =
    Number(
      params.page ??
        "1",
    );

  const page =
    Number.isInteger(
      requestedPage,
    ) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const search =
    params.q
      ?.trim() ??
    "";

  const action =
    params.action
      ?.trim() ??
    "";

  const date =
    params.date
      ?.trim() ??
    "";

  const timeFrom =
    params.timeFrom
      ?.trim() ??
    "";

  const timeTo =
    params.timeTo
      ?.trim() ??
    "";

  const {
    fromDate,
    toDate,
  } =
    getAuditDateRange({
      date,
      timeFrom,
      timeTo,
    });

  const [
    auditData,
    filterOptions,
    stats,
  ] =
    await Promise.all([
      getAuditLogs({
        page,
        pageSize:
          20,
        search,
        action,
        from:
          fromDate,
        to:
          toDate,
      }),

      getAuditFilterOptions(),

      getAuditStats(),
    ]);

  const {
    logs,
    total,
    totalPages,
  } = auditData;

  const hasFilters =
    Boolean(
      search ||
        action ||
        date ||
        timeFrom ||
        timeTo,
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f4f8fc_0%,#eef5fb_45%,#eaf2fa_100%)]">
      {/* ==========================================
          FUNDO
          ========================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-44 h-[560px] w-[560px] rounded-full bg-blue-200/35 blur-3xl" />

        <div className="absolute -right-36 top-10 h-[520px] w-[520px] rounded-full bg-sky-200/30 blur-3xl" />

        <div className="absolute left-[18%] top-[360px] h-[360px] w-[360px] rounded-full bg-cyan-100/30 blur-3xl" />

        <div className="absolute bottom-[-180px] right-[16%] h-[420px] w-[420px] rounded-full bg-blue-100/25 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/80 via-white/35 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* ==========================================
            CABEÇALHO
            ========================================== */}

        <header className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(110deg,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.94)_58%,rgba(231,243,255,0.88)_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-blue-50/45" />

            <div className="absolute -right-16 -top-32 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />

            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-blue-700 to-sky-400" />
          </div>

          <div className="relative flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                  Administração
                </span>

                <span className="text-[11px] font-medium text-slate-400">
                  Brise · SEMEQ
                </span>
              </div>

              <h1 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
                Auditoria do sistema
              </h1>

              <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-slate-500">
                Consulte o histórico de
                alterações realizadas por
                usuários na plataforma.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href="/admin/users"
                className="inline-flex h-11 min-w-[164px] items-center justify-center gap-2 rounded-[16px] border border-white/80 bg-white/80 px-5 text-sm font-semibold text-slate-600 shadow-[0_8px_22px_rgba(15,23,42,0.075)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/90 hover:text-blue-700"
              >
                <UsersIcon />

                Usuários
              </Link>

              <Link
                href="/"
                className="inline-flex h-11 min-w-[164px] items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#0f172a_0%,#172554_100%)] px-5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.22)]"
              >
                <BackIcon />

                Voltar ao painel
              </Link>
            </div>
          </div>
        </header>

        {/* ==========================================
            RESUMO
            ========================================== */}

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Eventos"
            value={
              stats.total
            }
            description="registros totais"
            tone="blue"
          />

          <SummaryCard
            label="Usuários"
            value={
              stats.users
            }
            description="ações administrativas"
            tone="slate"
          />

          <SummaryCard
            label="Equipamentos"
            value={
              stats.devices
            }
            description="alterações de controle"
            tone="cyan"
          />

          <SummaryCard
            label="Agendamentos"
            value={
              stats.schedules
            }
            description="operações registradas"
            tone="green"
          />
        </section>

        {/* ==========================================
            FILTROS
            ========================================== */}

        <section className="mt-4 rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.93)_0%,rgba(247,250,254,0.96)_100%)] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.065)] backdrop-blur-xl sm:p-5">
          <form
            action="/admin/audit"
            method="get"
            className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_220px_170px_150px_150px_auto]"
          >
            <div>
              <label
                htmlFor="q"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
              >
                Buscar
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <SearchIcon />
                </span>

                <input
                  id="q"
                  name="q"
                  defaultValue={
                    search
                  }
                  placeholder="Usuário, e-mail, descrição ou ID..."
                  className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 pl-10 pr-3 text-sm text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.035)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="action"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
              >
                Ação
              </label>

              <select
                id="action"
                name="action"
                defaultValue={
                  action
                }
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm font-medium text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.035)] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  Todas as ações
                </option>

                {filterOptions.actions.map(
                  (
                    option,
                  ) => (
                    <option
                      key={
                        option
                      }
                      value={
                        option
                      }
                    >
                      {getActionLabel(
                        option,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
              >
                Data
              </label>

              <input
                id="date"
                name="date"
                type="date"
                defaultValue={
                  date
                }
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm font-medium text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.035)] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label
                htmlFor="timeFrom"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
              >
                A partir de
              </label>

              <input
                id="timeFrom"
                name="timeFrom"
                type="time"
                defaultValue={
                  timeFrom
                }
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm font-medium text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.035)] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label
                htmlFor="timeTo"
                className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
              >
                Até
              </label>

              <input
                id="timeTo"
                name="timeTo"
                type="time"
                defaultValue={
                  timeTo
                }
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 text-sm font-medium text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.035)] outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Filtrar
              </button>

              {hasFilters && (
                <Link
                  href="/admin/audit"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  Limpar
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* ==========================================
            TABELA
            ========================================== */}

        <section className="mt-4 overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,250,254,0.97)_100%)] shadow-[0_20px_52px_rgba(15,23,42,0.075)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Histórico de atividades
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {total}{" "}
                {total ===
                1
                  ? "registro encontrado"
                  : "registros encontrados"}
              </p>
            </div>

            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500 sm:inline-flex">
              Página{" "}
              {
                auditData.page
              }{" "}
              de{" "}
              {totalPages}
            </span>
          </div>

          {logs.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <HistoryIcon />
              </div>

              <p className="mt-3 text-base font-bold text-slate-700">
                Nenhum registro encontrado
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Tente alterar os filtros de
                pesquisa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(238,244,251,0.96)_0%,rgba(247,250,253,0.96)_100%)]">
                    <TableHeader>
                      Data e hora
                    </TableHeader>

                    <TableHeader>
                      Responsável
                    </TableHeader>

                    <TableHeader>
                      Ação
                    </TableHeader>

                    <TableHeader>
                      Recurso
                    </TableHeader>

                    <TableHeader>
                      Descrição
                    </TableHeader>

                    <TableHeader>
                      Detalhes
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {logs.map(
                    (
                      log,
                      index,
                    ) => (
                      <tr
                        key={
                          log.id
                        }
                        className={`border-b border-slate-200/80 align-top transition-colors last:border-b-0 ${
                          index %
                            2 ===
                          0
                            ? "bg-white/80"
                            : "bg-slate-100/55"
                        } hover:bg-blue-50/75`}
                      >
                        {/* DATA */}

                        <td className="whitespace-nowrap px-5 py-5 align-top text-xs font-semibold tabular-nums text-slate-500 sm:px-6">
                          {formatDateTime(
                            log.createdAt,
                          )}
                        </td>

                        {/* RESPONSÁVEL */}

                        <td className="px-5 py-5 align-top sm:px-6">
                          <div className="min-w-[150px]">
                            <p className="max-w-[210px] truncate text-sm font-bold text-slate-900">
                              {
                                log.actorName
                              }
                            </p>

                            <p className="mt-1 max-w-[210px] truncate text-[11px] font-medium text-slate-400">
                              {
                                log.actorEmail
                              }
                            </p>
                          </div>
                        </td>

                        {/* AÇÃO */}

                        <td className="px-5 py-5 align-top sm:px-6">
                          <ActionBadge
                            action={
                              log.action
                            }
                          />
                        </td>

                        {/* RECURSO */}

                        <td className="px-5 py-5 align-top sm:px-6">
                          <ResourceCell
                            resource={
                              log.resource
                            }
                            resourceId={
                              log.resourceId
                            }
                          />
                        </td>

                        {/* DESCRIÇÃO */}

                        <td className="px-5 py-5 align-top sm:px-6">
                          <div className="max-w-[390px] rounded-2xl border border-slate-200/65 bg-white/60 px-3.5 py-3 shadow-[0_3px_12px_rgba(15,23,42,0.035)] backdrop-blur-sm">
                            <div className="space-y-1.5">
                              {getAuditDescriptionLines(log).map(
                                (line, index) => (
                                  <p
                                    key={`${log.id}-description-${index}`}
                                    className="text-[14px] leading-6 font-medium text-slate-600"
                                  >
                                    {line}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        </td>

                        {/* DETALHES */}

                        <td className="px-5 py-5 align-top sm:px-6">
                          <AuditDetails
                            action={
                              log.action
                            }
                            metadata={
                              log.metadata
                            }
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ======================================
              PAGINAÇÃO
              ====================================== */}

          {totalPages >
            1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs font-medium text-slate-400">
                Exibindo página{" "}
                {
                  auditData.page
                }{" "}
                de{" "}
                {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {auditData.page >
                  1 && (
                  <Link
                    href={buildPageHref({
                      page:
                        auditData.page -
                        1,

                      search,

                      action,

                      date,

                      timeFrom,

                      timeTo,
                    })}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Anterior
                  </Link>
                )}

                {auditData.page <
                  totalPages && (
                  <Link
                    href={buildPageHref({
                      page:
                        auditData.page +
                        1,

                      search,

                      action,

                      date,

                      timeFrom,

                      timeTo,
                    })}
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ==========================================
            RODAPÉ
            ========================================== */}

        <div className="mt-3 flex justify-end px-1">
          <p className="text-[11px] font-medium text-slate-400">
            Histórico administrativo ·
            SEMEQ
          </p>
        </div>
      </div>
    </main>
  );
}

/* ==========================================
   DESCRIÇÃO DINÂMICA
   ========================================== */

function getAuditDescriptionLines(
  log: {
    action: string;

    resourceId:
      | string
      | null;

    metadata: unknown;

    description: string;
  },
): string[] {
  const data =
    toObject(
      log.metadata,
    );

  if (!data) {
    return [
      log.description,
    ];
  }

  const changes =
    toObject(
      data.changes,
    );

  /*
   * ========================================
   * EQUIPAMENTO
   * ========================================
   */

  if (
    log.action ===
      "UPDATE_DEVICE_PARAMETERS" &&
    changes
  ) {
    const descriptions =
      getChangeDescriptions(
        changes,
      );

    if (
      descriptions.length >
      0
    ) {
      return descriptions.map(
        (description) =>
          `${description}.`,
      );
    }
  }

  /*
   * ========================================
   * EDIÇÃO DE USUÁRIO
   * ========================================
   */

  if (
    log.action ===
      "UPDATE_USER" &&
    changes
  ) {
    const descriptions =
      getChangeDescriptions(
        changes,
      );

    if (
      descriptions.length >
      0
    ) {
      return descriptions.map(
        (description) =>
          `${description}.`,
      );
    }
  }

  /*
   * ========================================
   * CRIAÇÃO DE USUÁRIO
   * ========================================
   */

  if (
    log.action ===
    "CREATE_USER"
  ) {
    const name =
      toText(
        data.targetName,
      );

    const role =
      getRoleLabel(
        data.role,
      );

    if (
      name !== "—"
    ) {
      return [
        `Usuário "${name}" criado com perfil ${role}.`,
      ];
    }
  }

  /*
   * ========================================
   * RESET DE SENHA
   * ========================================
   */

  if (
    log.action ===
    "RESET_USER_PASSWORD"
  ) {
    const name =
      toText(
        data.targetName,
      );

    if (
      name !== "—"
    ) {
      return [
        `Senha de "${name}" redefinida.`,
      ];
    }

    return [
      "Senha do usuário redefinida.",
    ];
  }

  /*
   * ========================================
   * ATIVAÇÃO DE USUÁRIO
   * ========================================
   */

  if (
    log.action ===
    "ACTIVATE_USER"
  ) {
    const name =
      toText(
        data.targetName,
      );

    if (
      name !== "—"
    ) {
      return [
        `Conta de "${name}" reativada.`,
      ];
    }

    return [
      "Usuário ativado.",
    ];
  }

  /*
   * ========================================
   * DESATIVAÇÃO DE USUÁRIO
   * ========================================
   */

  if (
    log.action ===
    "DEACTIVATE_USER"
  ) {
    const name =
      toText(
        data.targetName,
      );

    if (
      name !== "—"
    ) {
      return [
        `Conta de "${name}" desativada.`,
      ];
    }

    return [
      "Usuário desativado.",
    ];
  }

  /*
   * ========================================
   * CRIAÇÃO DE AGENDAMENTO
   * ========================================
   */

  if (
    log.action ===
    "CREATE_SCHEDULE"
  ) {
    const name =
      toText(
        data.scheduleName,
      );

    const count =
      formatCount(
        data.successCount,
      );

    if (
      name !== "—"
    ) {
      return [
        `Agendamento "${name}" criado para ${count}.`,
      ];
    }

    return [
      "Agendamento criado.",
    ];
  }

  /*
   * ========================================
   * EDIÇÃO DE AGENDAMENTO
   * ========================================
   */

  if (
    log.action ===
      "UPDATE_SCHEDULE" &&
    changes
  ) {
    const descriptions =
      getChangeDescriptions(
        changes,
      );

    if (
      descriptions.length >
      0
    ) {
      return descriptions.map(
        (description) =>
          `${description}.`,
      );
    }
  }

  /*
   * ========================================
   * ATIVAÇÃO DE AGENDAMENTO
   * ========================================
   */

  if (
    log.action ===
    "ACTIVATE_SCHEDULE"
  ) {
    const name =
      toText(
        data.scheduleName,
      );

    const count =
      formatCount(
        data.successCount,
      );

    if (
      name !== "—"
    ) {
      return [
        `Agendamento "${name}" ativado em ${count}.`,
      ];
    }

    return [
      "Agendamento ativado.",
    ];
  }

  /*
   * ========================================
   * DESATIVAÇÃO DE AGENDAMENTO
   * ========================================
   */

  if (
    log.action ===
    "DEACTIVATE_SCHEDULE"
  ) {
    const name =
      toText(
        data.scheduleName,
      );

    const count =
      formatCount(
        data.successCount,
      );

    if (
      name !== "—"
    ) {
      return [
        `Agendamento "${name}" desativado em ${count}.`,
      ];
    }

    return [
      "Agendamento desativado.",
    ];
  }

  /*
   * ========================================
   * EXCLUSÃO DE AGENDAMENTO
   * ========================================
   */

  if (
    log.action ===
    "DELETE_SCHEDULE"
  ) {
    const count =
      formatCount(
        data.successCount,
      );

    return [
      `Agendamento excluído de ${count}.`,
    ];
  }

  /*
   * ========================================
   * FALLBACK
   * ========================================
   */

  return [
    log.description,
  ];
}


/* ==========================================
   DESCRIÇÕES DE ALTERAÇÕES
   ========================================== */

function getChangeDescriptions(
  changes: Record<
    string,
    unknown
  >,
) {
  return Object.entries(
    changes,
  )
    .map(
      ([
        field,
        value,
      ]) => {
        const change =
          toObject(
            value,
          );

        if (!change) {
          return null;
        }

        const label =
          getFieldLabel(
            field,
          );

        const from =
          formatAuditValue(
            field,
            change.from,
          );

        const to =
          formatAuditValue(
            field,
            change.to,
          );

        return `${label}: ${from} → ${to}`;
      },
    )
    .filter(
      (
        value,
      ): value is string =>
        value !== null,
    );
}

/* ==========================================
   DETALHES DA AUDITORIA
   ========================================== */

function AuditDetails({
  action,
  metadata,
}: {
  action: string;

  metadata: unknown;
}) {
  const data =
    toObject(
      metadata,
    );

  if (!data) {
    return (
      <span className="text-xs text-slate-300">
        —
      </span>
    );
  }

  const changes =
    toObject(
      data.changes,
    );

  /*
   * Quando existem alterações
   * reais, mostramos somente elas.
   */
  if (
    changes &&
    Object.keys(
      changes,
    ).length > 0
  ) {
    return (
      <details className="group">
        <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-xs font-bold text-blue-600 transition hover:border-blue-100 hover:bg-blue-50/90 hover:text-blue-700">
          <DetailsIcon />

          Ver alterações
        </summary>

        <div className="mt-2 w-[320px] space-y-2 rounded-[20px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,253,0.98)_100%)] p-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          {Object.entries(
            changes,
          ).map(
            ([
              key,
              value,
            ]) => {
              const change =
                toObject(
                  value,
                );

              if (!change) {
                return null;
              }

              return (
                <ChangeItem
                  key={
                    key
                  }
                  label={
                    getFieldLabel(
                      key,
                    )
                  }
                  from={
                    formatAuditValue(
                      key,
                      change.from,
                    )
                  }
                  to={
                    formatAuditValue(
                      key,
                      change.to,
                    )
                  }
                />
              );
            },
          )}
        </div>
      </details>
    );
  }

  /*
   * ATIVAÇÃO / DESATIVAÇÃO
   * DE USUÁRIO
   */

  if (
    action ===
      "ACTIVATE_USER" ||
    action ===
      "DEACTIVATE_USER"
  ) {
    return (
      <SimpleDetail
        label="Status"
        value={
          action ===
          "ACTIVATE_USER"
            ? "Ativado"
            : "Desativado"
        }
      />
    );
  }

  /*
   * RESET DE SENHA
   */

  if (
    action ===
    "RESET_USER_PASSWORD"
  ) {
    return (
      <SimpleDetail
        label="Segurança"
        value="Senha redefinida"
      />
    );
  }

  /*
   * CRIAÇÃO DE USUÁRIO
   */

  if (
    action ===
    "CREATE_USER"
  ) {
    return (
      <SimpleDetail
        label="Perfil"
        value={
          getRoleLabel(
            data.role,
          )
        }
      />
    );
  }

  /*
   * ALTERAÇÃO DE EQUIPAMENTO ANTIGA
   */

  if (
    action ===
    "UPDATE_DEVICE_PARAMETERS"
  ) {
    return (
      <LegacyDetail
        message="Registro anterior ao histórico de diferenças."
      />
    );
  }

  /*
   * CRIAÇÃO DE AGENDAMENTO
   */

  if (
    action ===
    "CREATE_SCHEDULE"
  ) {
    return (
      <div className="space-y-1.5">
        <SimpleDetail
          label="Agendamento"
          value={
            toText(
              data.scheduleName,
            )
          }
        />

        <SimpleDetail
          label="Dispositivos"
          value={
            formatCount(
              data.successCount,
            )
          }
        />
      </div>
    );
  }

  /*
   * EDIÇÃO DE AGENDAMENTO
   */

  if (
    action ===
    "UPDATE_SCHEDULE"
  ) {
    return (
      <LegacyDetail
        message="Registro anterior ao histórico de diferenças."
      />
    );
  }

  /*
   * STATUS DO AGENDAMENTO
   */

  if (
    action ===
      "ACTIVATE_SCHEDULE" ||
    action ===
      "DEACTIVATE_SCHEDULE"
  ) {
    return (
      <div className="space-y-1.5">
        <SimpleDetail
          label="Status"
          value={
            action ===
            "ACTIVATE_SCHEDULE"
              ? "Ativado"
              : "Desativado"
          }
        />

        <SimpleDetail
          label="Dispositivos"
          value={
            formatCount(
              data.successCount,
            )
          }
        />
      </div>
    );
  }

  /*
   * EXCLUSÃO
   */

  if (
    action ===
    "DELETE_SCHEDULE"
  ) {
    return (
      <SimpleDetail
        label="Removido de"
        value={
          formatCount(
            data.successCount,
          )
        }
      />
    );
  }

  return (
    <span className="text-xs text-slate-300">
      —
    </span>
  );
}

/* ==========================================
   ALTERAÇÃO
   ========================================== */

function ChangeItem({
  label,
  from,
  to,
}: {
  label: string;

  from: string;

  to: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.045)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold">
        <span className="max-w-[110px] truncate rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-red-600">
          {from}
        </span>

        <span className="text-slate-300">
          →
        </span>

        <span className="max-w-[110px] truncate rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-emerald-700">
          {to}
        </span>
      </div>
    </div>
  );
}

/* ==========================================
   DETALHE SIMPLES
   ========================================== */

function SimpleDetail({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="inline-flex max-w-[240px] flex-col rounded-2xl border border-slate-200/80 bg-white/80 px-3.5 py-2.5 shadow-[0_3px_12px_rgba(15,23,42,0.035)]">
      <span className="text-[9px] font-bold uppercase tracking-[0.11em] text-slate-400">
        {label}
      </span>

      <span className="mt-0.5 truncate text-xs font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

/* ==========================================
   REGISTRO ANTIGO
   ========================================== */

function LegacyDetail({
  message,
}: {
  message: string;
}) {
  return (
    <div className="max-w-[240px] rounded-2xl border border-amber-200/70 bg-amber-50/85 px-3.5 py-2.5 shadow-[0_3px_12px_rgba(180,83,9,0.05)]">
      <p className="text-[10px] leading-4 font-medium text-amber-700">
        {message}
      </p>
    </div>
  );
}

/* ==========================================
   RECURSO
   ========================================== */

function ResourceCell({
  resource,
  resourceId,
}: {
  resource: string;

  resourceId:
    | string
    | null;
}) {
  const styles:
    Record<
      string,
      {
        container: string;
        icon: string;
        dot: string;
      }
    > = {
    USER: {
      container:
        "border-violet-200/65 bg-gradient-to-br from-white/90 to-violet-50/85",

      icon:
        "text-violet-600",

      dot:
        "bg-violet-500",
    },

    DEVICE: {
      container:
        "border-blue-200/65 bg-gradient-to-br from-white/90 to-blue-50/90",

      icon:
        "text-blue-600",

      dot:
        "bg-blue-500",
    },

    SCHEDULE: {
      container:
        "border-emerald-200/65 bg-gradient-to-br from-white/90 to-emerald-50/85",

      icon:
        "text-emerald-600",

      dot:
        "bg-emerald-500",
    },
  };

  const current =
    styles[resource] ??
    {
      container:
        "border-slate-200 bg-slate-50",

      icon:
        "text-slate-500",

      dot:
        "bg-slate-400",
    };

  return (
    <div
      className={`inline-flex min-w-[178px] items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-[0_5px_16px_rgba(15,23,42,0.04)] ${current.container}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-[0_4px_10px_rgba(15,23,42,0.06)] ${current.icon}`}
      >
        {resource ===
        "DEVICE" ? (
          <DeviceIcon />
        ) : resource ===
          "USER" ? (
          <UserIcon />
        ) : (
          <CalendarSmallIcon />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`}
          />

          <p className="truncate text-[11px] font-bold text-slate-700">
            {getResourceLabel(
              resource,
            )}
          </p>
        </div>

        {resourceId && (
          <p className="mt-0.5 max-w-[125px] truncate font-mono text-[10px] font-semibold text-slate-400">
            {resource ===
            "DEVICE"
              ? `Nº ${resourceId}`
              : `ID ${resourceId}`}
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   RESUMO
   ========================================== */

function SummaryCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;

  value: number;

  description: string;

  tone:
    | "blue"
    | "cyan"
    | "green"
    | "slate";
}) {
  const styles = {
    blue: {
      card:
        "border-blue-200/70 bg-gradient-to-br from-white via-blue-50/85 to-blue-100/60 shadow-[0_12px_30px_rgba(37,99,235,0.08)]",

      accent:
        "from-blue-600 to-sky-400",

      icon:
        "border-blue-100 bg-blue-50 text-blue-600",

      badge:
        "border-blue-100 bg-blue-50/80 text-blue-700",
    },

    cyan: {
      card:
        "border-cyan-200/70 bg-gradient-to-br from-white via-cyan-50/80 to-cyan-100/55 shadow-[0_12px_30px_rgba(8,145,178,0.08)]",

      accent:
        "from-cyan-500 to-sky-400",

      icon:
        "border-cyan-100 bg-cyan-50 text-cyan-600",

      badge:
        "border-cyan-100 bg-cyan-50/80 text-cyan-700",
    },

    green: {
      card:
        "border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/55 shadow-[0_12px_30px_rgba(5,150,105,0.08)]",

      accent:
        "from-emerald-500 to-teal-400",

      icon:
        "border-emerald-100 bg-emerald-50 text-emerald-600",

      badge:
        "border-emerald-100 bg-emerald-50/80 text-emerald-700",
    },

    slate: {
      card:
        "border-slate-200/80 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/65 shadow-[0_12px_30px_rgba(15,23,42,0.065)]",

      accent:
        "from-slate-700 to-slate-400",

      icon:
        "border-slate-200 bg-slate-100 text-slate-600",

      badge:
        "border-slate-200 bg-white/75 text-slate-600",
    },
  };

  const current =
    styles[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)] ${current.card}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${current.accent}`}
      />

      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/55 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <div className="mt-2 flex items-end gap-2.5">
            <p className="text-[34px] font-bold leading-none tracking-[-0.05em] text-slate-950">
              {value}
            </p>

            <p className="mb-1 truncate text-xs font-medium text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-[0_5px_14px_rgba(15,23,42,0.05)] ${current.icon}`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-current opacity-90" />
        </div>
      </div>

      <div className="relative mt-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${current.badge}`}
        >
          Atualizado
        </span>
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
    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-6">
      {children}
    </th>
  );
}

/* ==========================================
   AÇÃO
   ========================================== */

function ActionBadge({
  action,
}: {
  action: string;
}) {
  const style =
    action.includes(
      "DELETE",
    ) ||
    action.includes(
      "DEACTIVATE",
    )
      ? "border-red-100 bg-red-50 text-red-700"
      : action.includes(
            "CREATE",
          ) ||
          action.includes(
            "ACTIVATE",
          )
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : action.includes(
              "RESET",
            )
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-blue-100 bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-[10px] font-bold shadow-[0_2px_8px_rgba(15,23,42,0.035)] ${style}`}
    >
      {getActionLabel(
        action,
      )}
    </span>
  );
}

/* ==========================================
   LABELS
   ========================================== */

function getActionLabel(
  action: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    CREATE_USER:
      "Criou usuário",

    UPDATE_USER:
      "Editou usuário",

    RESET_USER_PASSWORD:
      "Redefiniu senha",

    ACTIVATE_USER:
      "Ativou usuário",

    DEACTIVATE_USER:
      "Desativou usuário",

    UPDATE_DEVICE_PARAMETERS:
      "Alterou equipamento",

    CREATE_SCHEDULE:
      "Criou agendamento",

    UPDATE_SCHEDULE:
      "Editou agendamento",

    ACTIVATE_SCHEDULE:
      "Ativou agendamento",

    DEACTIVATE_SCHEDULE:
      "Desativou agendamento",

    DELETE_SCHEDULE:
      "Excluiu agendamento",
  };

  return (
    labels[action] ??
    action
  );
}

function getResourceLabel(
  resource: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    USER:
      "Usuário",

    DEVICE:
      "Equipamento",

    SCHEDULE:
      "Agendamento",
  };

  return (
    labels[resource] ??
    resource
  );
}

function getFieldLabel(
  field: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
    name:
      "Nome",

    email:
      "E-mail",

    role:
      "Perfil",

    active:
      "Status",

    modeDevice:
      "Modo do dispositivo",

    modeAC:
      "Modo do ar",

    fanSpeed:
      "Velocidade",

    setpointCool:
      "Temperatura",

    setpointHeat:
      "Aquecimento",

    ecoCool:
      "Temperatura Eco",

    ecoHeat:
      "Aquecimento Eco",

    scheduleName:
      "Nome",

    enable:
      "Status",

    dateStart:
      "Início",

    dateEnd:
      "Fim",

    repetitionMode:
      "Repetição",

    repetitionValue:
      "Valor da repetição",
  };

  return (
    labels[field] ??
    field
  );
}

/* ==========================================
   OBJETOS
   ========================================== */

function toObject(
  value: unknown,
): Record<
  string,
  unknown
> | null {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

/* ==========================================
   TEXTO
   ========================================== */

function toText(
  value: unknown,
) {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(
      value,
    );
  }

  return "—";
}

/* ==========================================
   CONTAGEM
   ========================================== */

function formatCount(
  value: unknown,
) {
  if (
    typeof value !==
    "number"
  ) {
    return "—";
  }

  return `${value} ${
    value === 1
      ? "equipamento"
      : "equipamentos"
  }`;
}

/* ==========================================
   PERFIL
   ========================================== */

function getRoleLabel(
  value: unknown,
) {
  if (
    value ===
    "ADMIN"
  ) {
    return "Administrador";
  }

  if (
    value ===
    "OPERATOR"
  ) {
    return "Operador";
  }

  if (
    value ===
    "VIEWER"
  ) {
    return "Visualização";
  }

  return toText(
    value,
  );
}

/* ==========================================
   VALORES DA AUDITORIA
   ========================================== */

function formatAuditValue(
  field: string,
  value: unknown,
) {
  /*
   * PERFIL
   */

  if (
    field ===
    "role"
  ) {
    return getRoleLabel(
      value,
    );
  }

  /*
   * BOOLEANOS
   */

  if (
    field ===
      "active" ||
    field ===
      "enable"
  ) {
    if (
      value === true
    ) {
      return "Ativo";
    }

    if (
      value === false
    ) {
      return "Inativo";
    }
  }

  /*
   * TEMPERATURAS
   */

  if (
    field ===
      "setpointCool" ||
    field ===
      "setpointHeat" ||
    field ===
      "ecoCool" ||
    field ===
      "ecoHeat"
  ) {
    if (
      typeof value ===
      "number"
    ) {
      if (
        value === 0
      ) {
        return "Desligado";
      }

      return `${value} °C`;
    }
  }

  /*
   * VELOCIDADE
   */

  if (
    field ===
    "fanSpeed"
  ) {
    const speeds:
      Record<
        number,
        string
      > = {
      1:
        "Baixa",

      2:
        "Média",

      3:
        "Alta",
    };

    if (
      typeof value ===
      "number"
    ) {
      return (
        speeds[value] ??
        String(
          value,
        )
      );
    }
  }

  /*
   * MODO DO AR
   */

  if (
    field ===
    "modeAC"
  ) {
    const modes:
      Record<
        number,
        string
      > = {
      0:
        "Frio",

      1:
        "Quente",

      2:
        "Automático",

      3:
        "Ventilação",
    };

    if (
      typeof value ===
      "number"
    ) {
      return (
        modes[value] ??
        String(
          value,
        )
      );
    }
  }

  /*
   * MODO DO DISPOSITIVO
   */

  if (
    field ===
    "modeDevice"
  ) {
    const modes:
      Record<
        number,
        string
      > = {
      0:
        "Modo 0",

      1:
        "Normal",

      2:
        "Modo 2",

      3:
        "Eco",
    };

    if (
      typeof value ===
      "number"
    ) {
      return (
        modes[value] ??
        String(
          value,
        )
      );
    }
  }

  return toText(
    value,
  );
}

/* ==========================================
   FILTRO DE DATA E HORA
   ========================================== */

function getAuditDateRange({
  date,
  timeFrom,
  timeTo,
}: {
  date: string;

  timeFrom: string;

  timeTo: string;
}) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      date,
    )
  ) {
    return {
      fromDate:
        undefined,

      toDate:
        undefined,
    };
  }

  const startTime =
    /^\d{2}:\d{2}$/.test(
      timeFrom,
    )
      ? timeFrom
      : "00:00";

  const endTime =
    /^\d{2}:\d{2}$/.test(
      timeTo,
    )
      ? timeTo
      : "23:59";

  const fromDate =
    new Date(
      `${date}T${startTime}:00-03:00`,
    );

  const toDate =
    new Date(
      `${date}T${endTime}:59.999-03:00`,
    );

  return {
    fromDate:
      Number.isNaN(
        fromDate.getTime(),
      )
        ? undefined
        : fromDate,

    toDate:
      Number.isNaN(
        toDate.getTime(),
      )
        ? undefined
        : toDate,
  };
}

/* ==========================================
   DATA E HORA
   ========================================== */

function formatDateTime(
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

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      timeZone:
        "America/Fortaleza",
    },
  ).format(
    date,
  );
}

/* ==========================================
   PAGINAÇÃO
   ========================================== */

function buildPageHref({
  page,
  search,
  action,
  date,
  timeFrom,
  timeTo,
}: {
  page: number;

  search: string;

  action: string;

  date: string;

  timeFrom: string;

  timeTo: string;
}) {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(
      page,
    ),
  );

  if (search) {
    params.set(
      "q",
      search,
    );
  }

  if (action) {
    params.set(
      "action",
      action,
    );
  }

  if (date) {
    params.set(
      "date",
      date,
    );
  }

  if (timeFrom) {
    params.set(
      "timeFrom",
      timeFrom,
    );
  }

  if (timeTo) {
    params.set(
      "timeTo",
      timeTo,
    );
  }

  return `/admin/audit?${params.toString()}`;
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
      className="h-4 w-4"
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

function SearchIcon() {
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
      <circle
        cx="11"
        cy="11"
        r="8"
      />

      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HistoryIcon() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7" />

      <path d="M3 4v6h6" />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function DetailsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M9 18h6" />

      <path d="M10 22h4" />

      <path d="M12 2a7 7 0 0 0-4 12.74c.63.44 1 1.16 1 1.93V17h6v-.33c0-.77.37-1.49 1-1.93A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
      />

      <path d="M8 7h8" />

      <path d="M8 11h8" />

      <circle
        cx="12"
        cy="16"
        r="1"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CalendarSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M16 3v4" />

      <path d="M8 3v4" />

      <path d="M3 10h18" />
    </svg>
  );
}