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

  const firstRecord = total === 0 ? 0 : (auditData.page - 1) * auditData.pageSize + 1;
  const lastRecord = Math.min(auditData.page * auditData.pageSize, total);
  const invalidTimeRange = Boolean(date && timeFrom && timeTo && timeFrom > timeTo);

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-700" />
              ADMINISTRAÇÃO <span className="text-slate-300">/</span> BRISE
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">
              Auditoria
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Acompanhe as operações realizadas na plataforma e consulte o histórico de alterações.
            </p>
          </div>

          <nav aria-label="Navegação administrativa" className="flex flex-wrap gap-2">
            <Link
              href="/admin/users"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <UsersIcon />
              Gerenciar usuários
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              <BackIcon />
              Painel principal
            </Link>
          </nav>
        </header>

        <section aria-labelledby="overview-heading" className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="overview-heading" className="text-sm font-semibold text-slate-900">
              Visão geral
            </h2>
            <p className="text-xs text-slate-500">
              Totais de todo o histórico, independentemente dos filtros
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Eventos registrados" value={stats.total} description="em todo o sistema" tone="blue" icon={<HistoryIcon />} />
            <SummaryCard label="Ações sobre usuários" value={stats.users} description="contas e permissões" tone="violet" icon={<UserIcon />} />
            <SummaryCard label="Eventos de equipamentos" value={stats.devices} description="parâmetros e controle" tone="cyan" icon={<DeviceIcon />} />
            <SummaryCard label="Eventos de agendamentos" value={stats.schedules} description="programações registradas" tone="green" icon={<CalendarSmallIcon />} />
          </div>
        </section>

        <section aria-labelledby="filters-heading" className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 id="filters-heading" className="text-base font-semibold text-slate-900">
              Localizar registros
            </h2>
            <p className="text-sm text-slate-500">
              Combine os campos para encontrar uma operação específica.
            </p>
          </div>

          <form action="/admin/audit" method="get" className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <label htmlFor="q" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Busca
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <SearchIcon />
                  </span>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={search}
                    placeholder="Nome, e-mail, descrição ou identificador"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="xl:col-span-2">
                <label htmlFor="action" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tipo de ação
                </label>
                <select
                  id="action"
                  name="action"
                  defaultValue={action}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Todas as ações</option>
                  {filterOptions.actions.map((option) => (
                    <option key={option} value={option}>{getActionLabel(option)}</option>
                  ))}
                </select>
              </div>

              <div className="xl:col-span-2">
                <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Data
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={date}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label htmlFor="timeFrom" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Horário inicial
                </label>
                <input
                  id="timeFrom"
                  name="timeFrom"
                  type="time"
                  defaultValue={timeFrom}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="xl:col-span-2">
                <label htmlFor="timeTo" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Horário final
                </label>
                <input
                  id="timeTo"
                  name="timeTo"
                  type="time"
                  defaultValue={timeTo}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Os horários são considerados quando uma data é informada. Sem horário, a consulta considera o dia inteiro.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {hasFilters && (
                  <Link
                    href="/admin/audit"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Limpar filtros
                  </Link>
                )}
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <SearchIcon />
                  Aplicar filtros
                </button>
              </div>
            </div>
            {invalidTimeRange && (
              <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                O horário final deve ser igual ou posterior ao horário inicial.
              </p>
            )}
          </form>
        </section>

        <section aria-labelledby="history-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="history-heading" className="text-base font-semibold text-slate-900">
                  Histórico de atividades
                </h2>
                {hasFilters && (
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                    Filtros aplicados
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {total.toLocaleString("pt-BR")} {total === 1 ? "registro encontrado" : "registros encontrados"}
                {total > 0 && <span> · Exibindo {firstRecord}–{lastRecord}</span>}
              </p>
            </div>
            {totalPages > 1 && (
              <span className="text-xs font-medium tabular-nums text-slate-500">
                Página {auditData.page} de {totalPages}
              </span>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <HistoryIcon />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {hasFilters ? "Nenhum registro corresponde à pesquisa" : "Ainda não há atividades registradas"}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                {hasFilters
                  ? "Altere os critérios ou limpe os filtros para consultar outros registros."
                  : "As operações realizadas na plataforma aparecerão aqui."}
              </p>
              {hasFilters && (
                <Link href="/admin/audit" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                  Remover todos os filtros
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hidden xl:block">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[170px]" />
                    <col className="w-[210px]" />
                    <col />
                    <col className="w-[190px]" />
                    <col className="w-[170px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <TableHeader>Data e hora</TableHeader>
                      <TableHeader>Responsável</TableHeader>
                      <TableHeader>Evento</TableHeader>
                      <TableHeader>Recurso</TableHeader>
                      <TableHeader>Registro</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-xs leading-5 tabular-nums text-slate-600">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                              {getActorInitials(log.actorName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900" title={log.actorName}>{log.actorName}</p>
                              <p className="mt-0.5 truncate text-xs text-slate-500" title={log.actorEmail}>{log.actorEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <ActionBadge action={log.action} />
                            <div className="space-y-1">
                              {getAuditDescriptionLines(log).map((line, index) => (
                                <p key={`${log.id}-description-${index}`} className="text-[13px] leading-5 text-slate-700">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <ResourceCell resource={log.resource} resourceId={log.resourceId} metadata={log.metadata} />
                        </td>
                        <td className="px-5 py-4">
                          <AuditDetails action={log.action} metadata={log.metadata} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 xl:hidden">
                {logs.map((log) => (
                  <article key={log.id} className="px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <ActionBadge action={log.action} />
                      <time className="text-xs tabular-nums text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </time>
                    </div>
                    <div className="mt-3 flex items-start gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                        {getActorInitials(log.actorName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{log.actorName}</p>
                        <p className="mt-0.5 break-all text-xs text-slate-500">{log.actorEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {getAuditDescriptionLines(log).map((line, index) => (
                        <p key={`${log.id}-mobile-description-${index}`} className="text-sm leading-5 text-slate-700">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <ResourceCell resource={log.resource} resourceId={log.resourceId} metadata={log.metadata} />
                      <AuditDetails action={log.action} metadata={log.metadata} />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-slate-600">
                Página {auditData.page} de {totalPages} · {total.toLocaleString("pt-BR")} registros no resultado
              </p>
              <div className="flex items-center gap-2">
                {auditData.page > 1 && (
                  <Link
                    href={buildPageHref({ page: auditData.page - 1, search, action, date, timeFrom, timeTo })}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Anterior
                  </Link>
                )}
                {auditData.page < totalPages && (
                  <Link
                    href={buildPageHref({ page: auditData.page + 1, search, action, date, timeFrom, timeTo })}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
          <span>Brise · SEMEQ</span>
          <span>Registro de operações administrativas</span>
        </footer>
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
  const data = toObject(metadata);
  if (!data) {
    return <span className="text-xs text-slate-400">Sem detalhes adicionais</span>;
  }

  const changes = toObject(data.changes);
  if (changes && Object.keys(changes).length > 0) {
    return (
      <details className="min-w-0">
        <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <DetailsIcon />
          Consultar alterações
        </summary>
        <div className="mt-2 w-full max-w-[360px] space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          {Object.entries(changes).map(([key, value]) => {
            const change = toObject(value);
            if (!change) return null;
            return (
              <ChangeItem
                key={key}
                label={getFieldLabel(key)}
                from={formatAuditValue(key, change.from)}
                to={formatAuditValue(key, change.to)}
              />
            );
          })}
        </div>
      </details>
    );
  }

  if (action === "ACTIVATE_USER" || action === "DEACTIVATE_USER") {
    return <SimpleDetail label="Status da conta" value={action === "ACTIVATE_USER" ? "Ativada" : "Desativada"} />;
  }

  if (action === "RESET_USER_PASSWORD") {
    return <SimpleDetail label="Segurança" value="Senha redefinida" />;
  }

  if (action === "CREATE_USER") {
    return <SimpleDetail label="Perfil atribuído" value={getRoleLabel(data.role)} />;
  }

  if (action === "UPDATE_DEVICE_PARAMETERS" || action === "UPDATE_SCHEDULE") {
    return <LegacyDetail message="Este registro foi criado antes do detalhamento de alterações estar disponível." />;
  }

  if (action === "CREATE_SCHEDULE") {
    return (
      <div className="space-y-2">
        <SimpleDetail label="Agendamento" value={toText(data.scheduleName)} />
        <SimpleDetail label="Dispositivos" value={formatCount(data.successCount)} />
      </div>
    );
  }

  if (action === "ACTIVATE_SCHEDULE" || action === "DEACTIVATE_SCHEDULE") {
    return (
      <div className="space-y-2">
        <SimpleDetail label="Status" value={action === "ACTIVATE_SCHEDULE" ? "Ativado" : "Desativado"} />
        <SimpleDetail label="Dispositivos" value={formatCount(data.successCount)} />
      </div>
    );
  }

  if (action === "DELETE_SCHEDULE") {
    return <SimpleDetail label="Removido de" value={formatCount(data.successCount)} />;
  }

  return <span className="text-xs text-slate-400">Sem detalhes adicionais</span>;
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
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] font-medium text-slate-600">{label}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-full break-words rounded bg-red-50 px-2 py-1 font-medium text-red-700">{from}</span>
        <span className="text-slate-400" aria-hidden="true">→</span>
        <span className="max-w-full break-words rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-700">{to}</span>
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
    <div className="inline-flex max-w-[240px] flex-col rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
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
    <div className="max-w-[240px] rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
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
  metadata,
}: {
  resource: string;
  resourceId: string | null;
  metadata: unknown;
}) {
  const data = toObject(metadata);
  const storedDeviceName =
    resource === "DEVICE" && typeof data?.deviceName === "string"
      ? data.deviceName.trim()
      : "";
  const resourceTitle = storedDeviceName || getResourceLabel(resource);

  const resourceStyle: Record<string, string> = {
    USER: "bg-violet-50 text-violet-700",
    DEVICE: "bg-blue-50 text-blue-700",
    SCHEDULE: "bg-emerald-50 text-emerald-700",
  };
  const iconStyle = resourceStyle[resource] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
        {resource === "DEVICE" ? <DeviceIcon /> : resource === "USER" ? <UserIcon /> : <CalendarSmallIcon />}
      </span>
      <div className="min-w-0">
        <p title={resourceTitle} className="truncate text-xs font-semibold text-slate-800">
          {resourceTitle}
        </p>
        {resourceId && (
          <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
            {resource === "DEVICE" ? `Nº ${resourceId}` : `ID ${resourceId}`}
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
  icon,
}: {
  label: string;
  value: number;
  description: string;
  tone: "blue" | "violet" | "cyan" | "green";
  icon: React.ReactNode;
}) {
  const iconStyle = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    cyan: "bg-cyan-50 text-cyan-700",
    green: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <article className="flex min-h-[112px] items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-slate-950 tabular-nums">
          {value.toLocaleString("pt-BR")}
        </p>
        <p className="mt-2 text-xs leading-4 text-slate-500">{description}</p>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}>
        {icon}
      </div>
    </article>
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
    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500 sm:px-6">
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
    action.includes("DELETE") || action.includes("DEACTIVATE")
      ? "border-red-200 bg-red-50 text-red-700"
      : action.includes("CREATE") || action.includes("ACTIVATE")
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : action.includes("RESET")
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <span className={`inline-flex whitespace-nowrap rounded-md border px-2.5 py-1.5 text-[11px] font-medium ${style}`}>
      {getActionLabel(action)}
    </span>
  );
}

/* ==========================================
   LABELS
   ========================================== */

function getActorInitials(name: string) {
  const parts = name.trim().split(/\\s+/).filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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