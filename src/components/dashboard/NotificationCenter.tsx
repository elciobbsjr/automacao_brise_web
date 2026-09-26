"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import type {
  DashboardDevice,
} from "@/types/dashboard";

/* ==========================================
   TIPOS
   ========================================== */

interface NotificationCenterProps {
  devices: DashboardDevice[];
}

interface TemperatureAlert {
  deviceId: number;
  name: string;
  temperature: number;
}

type ToastVariant =
  | "warning"
  | "success";

interface ToastMessage {
  title: string;
  message: string;
  variant: ToastVariant;
  alerts?: TemperatureAlert[];
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
}

/* ==========================================
   CONFIGURAÇÕES
   ========================================== */

const TEMPERATURE_LIMIT =
  23;

const SNOOZE_DURATION =
  15 * 60 * 1000;

/*
 * Tempo de permanência do popup.
 *
 * A barra de progresso usa exatamente
 * a mesma duração.
 */
const TOAST_DURATION =
  7000;

const TOAST_EXIT_DURATION =
  220;

const STORAGE_KEY =
  "brise-temperature-alert-snoozes";

/* ==========================================
   COMPONENTE
   ========================================== */

export function NotificationCenter({
  devices,
}: NotificationCenterProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    now,
    setNow,
  ] = useState(
    Date.now(),
  );

  const [
    snoozedUntil,
    setSnoozedUntil,
  ] = useState<
    Record<string, number>
  >({});

  const [
    toast,
    setToast,
  ] =
    useState<ToastMessage | null>(
      null,
    );

  const [
    toastClosing,
    setToastClosing,
  ] = useState(false);

  /*
   * Usado para reiniciar corretamente
   * a animação da barra quando surge
   * uma nova notificação.
   */
  const [
    toastVersion,
    setToastVersion,
  ] = useState(0);

  const [
    panelPosition,
    setPanelPosition,
  ] =
    useState<PanelPosition>({
      top: 0,
      left: 0,
      width: 390,
    });

  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const panelRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const previousAlertsRef =
    useRef<Set<number>>(
      new Set(),
    );

  const initializedAlertsRef =
    useRef(false);

  /* ==========================================
     MONTAGEM
     ========================================== */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* ==========================================
     CARREGA ALERTAS SILENCIADOS
     ========================================== */

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (stored) {
        const parsed =
          JSON.parse(
            stored,
          ) as Record<
            string,
            number
          >;

        setSnoozedUntil(
          parsed,
        );
      }
    } catch {
      setSnoozedUntil(
        {},
      );
    } finally {
      setReady(true);
    }
  }, []);

  /* ==========================================
     RELÓGIO DOS ALERTAS RESOLVIDOS
     ========================================== */

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            Date.now(),
          );
        },
        5000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  /* ==========================================
     LIMPA SILENCIAMENTOS EXPIRADOS
     ========================================== */

  useEffect(() => {
    if (!ready) {
      return;
    }

    const entries =
      Object.entries(
        snoozedUntil,
      );

    const validEntries =
      entries.filter(
        ([, until]) =>
          until > now,
      );

    if (
      validEntries.length ===
      entries.length
    ) {
      return;
    }

    const next =
      Object.fromEntries(
        validEntries,
      );

    setSnoozedUntil(
      next,
    );

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          next,
        ),
      );
    } catch {
      /*
       * Caso o armazenamento local
       * falhe, o sistema continua
       * funcionando durante a sessão.
       */
    }
  }, [
    now,
    ready,
    snoozedUntil,
  ]);

  /* ==========================================
     EQUIPAMENTOS ABAIXO DE 23 °C
     ========================================== */

  const temperatureAlerts =
    useMemo<
      TemperatureAlert[]
    >(() => {
      return devices
        .flatMap(
          (device) => {
            const temperature =
              device.parameters
                ?.setpointCool;

            /*
             * O alerta somente aparece
             * quando o equipamento:
             *
             * - está online;
             * - está ligado;
             * - possui setpoint válido;
             * - está abaixo de 23 °C.
             */

            if (
              !device.online ||
              device.variables
                ?.state !== true ||
              typeof temperature !==
                "number" ||
              !Number.isFinite(
                temperature,
              ) ||
              temperature <= 0 ||
              temperature >=
                TEMPERATURE_LIMIT
            ) {
              return [];
            }

            const name =
              device.config?.name
                ?.trim() ||
              `Equipamento ${device.deviceId}`;

            return [
              {
                deviceId:
                  device.deviceId,

                name,

                temperature,
              },
            ];
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            first.temperature -
            second.temperature,
        );
    }, [devices]);

  /* ==========================================
     REMOVE TEMPORARIAMENTE OS RESOLVIDOS
     ========================================== */

  const activeAlerts =
    useMemo(() => {
      if (!ready) {
        return [];
      }

      return temperatureAlerts.filter(
        (alert) => {
          const until =
            snoozedUntil[
              String(
                alert.deviceId,
              )
            ];

          return (
            !until ||
            until <= now
          );
        },
      );
    }, [
      temperatureAlerts,
      snoozedUntil,
      now,
      ready,
    ]);

  /* ==========================================
     FUNÇÕES DO POPUP
     ========================================== */

  function publishToast(
    nextToast: ToastMessage,
  ) {
    setToastClosing(
      false,
    );

    setToast(
      nextToast,
    );

    setToastVersion(
      (current) =>
        current + 1,
    );
  }

  function dismissToast() {
    if (!toast) {
      return;
    }

    setToastClosing(
      true,
    );

    window.setTimeout(
      () => {
        setToast(null);

        setToastClosing(
          false,
        );
      },
      TOAST_EXIT_DURATION,
    );
  }

  /* ==========================================
     NOVOS ALERTAS
     ========================================== */

  useEffect(() => {
    if (!ready) {
      return;
    }

    const currentIds =
      new Set(
        activeAlerts.map(
          (alert) =>
            alert.deviceId,
        ),
      );

    /*
     * Primeira verificação:
     * caso o painel seja aberto
     * e já existam alertas.
     */
    if (
      !initializedAlertsRef.current
    ) {
      initializedAlertsRef.current =
        true;

      previousAlertsRef.current =
        currentIds;

      if (
        activeAlerts.length >
        0
      ) {
        showTemperatureToast(
          activeAlerts,
        );
      }

      return;
    }

    const newAlerts =
      activeAlerts.filter(
        (alert) =>
          !previousAlertsRef.current.has(
            alert.deviceId,
          ),
      );

    previousAlertsRef.current =
      currentIds;

    if (
      newAlerts.length >
      0
    ) {
      showTemperatureToast(
        newAlerts,
      );
    }
  }, [
    activeAlerts,
    ready,
  ]);

  function showTemperatureToast(
    alerts: TemperatureAlert[],
  ) {
    if (
      alerts.length === 1
    ) {
      publishToast({
        title:
          "Temperatura abaixo de 23 °C",

        message:
          "Foi identificado um equipamento em operação fora da faixa definida para este alerta.",

        variant:
          "warning",

        alerts,
      });

      return;
    }

    publishToast({
      title:
        "Temperaturas abaixo de 23 °C",

      message:
        `${alerts.length} equipamentos em operação estão configurados abaixo do limite definido.`,

      variant:
        "warning",

      alerts,
    });
  }

  /* ==========================================
     FECHAMENTO AUTOMÁTICO DO POPUP
     ========================================== */

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setToastClosing(
            true,
          );

          window.setTimeout(
            () => {
              setToast(
                null,
              );

              setToastClosing(
                false,
              );
            },
            TOAST_EXIT_DURATION,
          );
        },
        TOAST_DURATION,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    toast,
    toastVersion,
  ]);

  /* ==========================================
     RESOLVIDO / IGNORAR 15 MIN
     ========================================== */

  function handleResolve(
    alert: TemperatureAlert,
  ) {
    const until =
      Date.now() +
      SNOOZE_DURATION;

    const next = {
      ...snoozedUntil,

      [String(
        alert.deviceId,
      )]: until,
    };

    setSnoozedUntil(
      next,
    );

    setNow(
      Date.now(),
    );

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          next,
        ),
      );
    } catch {
      /*
       * Continua em memória
       * caso o localStorage falhe.
       */
    }

    publishToast({
      title:
        "Alerta temporariamente resolvido",

      message:
        "Este equipamento ficará fora da lista de notificações durante 15 minutos.",

      variant:
        "success",

      alerts: [
        alert,
      ],
    });
  }

  /* ==========================================
     POSIÇÃO DO DROPDOWN
     ========================================== */

  function updatePanelPosition() {
    const button =
      buttonRef.current;

    if (!button) {
      return;
    }

    const rect =
      button.getBoundingClientRect();

    const width =
      Math.min(
        390,
        window.innerWidth -
          24,
      );

    const idealLeft =
      rect.right - width;

    const left =
      Math.max(
        12,
        Math.min(
          idealLeft,
          window.innerWidth -
            width -
            12,
        ),
      );

    setPanelPosition({
      top:
        rect.bottom + 10,

      left,

      width,
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePanelPosition();

    function handleWindowChange() {
      updatePanelPosition();
    }

    window.addEventListener(
      "resize",
      handleWindowChange,
    );

    window.addEventListener(
      "scroll",
      handleWindowChange,
      true,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleWindowChange,
      );

      window.removeEventListener(
        "scroll",
        handleWindowChange,
        true,
      );
    };
  }, [open]);

  /* ==========================================
     CLIQUE FORA / ESC
     ========================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleMouseDown(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        buttonRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      if (
        panelRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleMouseDown,
    );

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown,
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  const notificationCount =
    activeAlerts.length;

  return (
    <>
      {/* ======================================
          BOTÃO DO SINO
          ====================================== */}

      <button
        ref={buttonRef}
        type="button"
        aria-label="Notificações"
        aria-haspopup="true"
        aria-expanded={
          open
        }
        onClick={() => {
          updatePanelPosition();

          setOpen(
            (value) =>
              !value,
          );
        }}
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl text-slate-500 transition duration-200 ${
          open
            ? "text-blue-700"
            : "hover:text-blue-700"
        }`}
      >
        <BellIcon />

        {notificationCount >
          0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 px-1 text-[9px] font-extrabold leading-none text-slate-950 shadow-sm">
            {notificationCount >
            99
              ? "99+"
              : notificationCount}
          </span>
        )}
      </button>

      {/* ======================================
          PORTAL
          ====================================== */}

      {mounted &&
        createPortal(
          <>
            {/* ==================================
                DROPDOWN
                ================================== */}

            {open && (
              <div
                ref={
                  panelRef
                }
                className="fixed z-[10000] overflow-hidden rounded-[22px] border border-slate-200/90 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
                style={{
                  top:
                    panelPosition.top,

                  left:
                    panelPosition.left,

                  width:
                    panelPosition.width,

                  maxHeight:
                    `calc(100vh - ${panelPosition.top + 12}px)`,
                }}
              >
                {/* CABEÇALHO */}

                <div className="border-b border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950">
                          Notificações
                        </h3>

                        {notificationCount >
                          0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                            {
                              notificationCount
                            }{" "}
                            ativa(s)
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] leading-4 text-slate-400">
                        Alertas de
                        climatização que
                        precisam de
                        atenção.
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <BellIcon />
                    </div>
                  </div>
                </div>

                {/* LISTA */}

                <div className="max-h-[430px] overflow-y-auto">
                  {activeAlerts.length >
                  0 ? (
                    <div className="divide-y divide-slate-100">
                      {activeAlerts.map(
                        (
                          alert,
                        ) => (
                          <NotificationItem
                            key={
                              alert.deviceId
                            }
                            alert={
                              alert
                            }
                            onResolve={() =>
                              handleResolve(
                                alert,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyNotifications
                      hasSnoozed={
                        temperatureAlerts.length >
                        0
                      }
                    />
                  )}
                </div>

                {/* RODAPÉ */}

                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <InfoIcon />

                    <p className="text-[10px] leading-4 text-slate-400">
                      São exibidos
                      equipamentos ligados
                      com temperatura
                      configurada abaixo de{" "}
                      <strong className="font-bold text-slate-600">
                        23 °C
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================
                POPUP
                ================================== */}

            {toast && (
              <TemperatureToast
                key={
                  toastVersion
                }
                toast={
                  toast
                }
                closing={
                  toastClosing
                }
                onClose={
                  dismissToast
                }
              />
            )}

            {/* ==================================
                ANIMAÇÕES
                ================================== */}

            <style jsx global>{`
              @keyframes brise-toast-enter {
                0% {
                  opacity: 0;
                  transform: translate3d(24px, -8px, 0)
                    scale(0.97);
                }

                100% {
                  opacity: 1;
                  transform: translate3d(0, 0, 0)
                    scale(1);
                }
              }

              @keyframes brise-toast-exit {
                0% {
                  opacity: 1;
                  transform: translate3d(0, 0, 0)
                    scale(1);
                }

                100% {
                  opacity: 0;
                  transform: translate3d(18px, -4px, 0)
                    scale(0.98);
                }
              }

              @keyframes brise-toast-progress {
                from {
                  transform: scaleX(1);
                }

                to {
                  transform: scaleX(0);
                }
              }

              .brise-toast-enter {
                animation:
                  brise-toast-enter
                  360ms
                  cubic-bezier(
                    0.16,
                    1,
                    0.3,
                    1
                  )
                  both;
              }

              .brise-toast-exit {
                animation:
                  brise-toast-exit
                  ${TOAST_EXIT_DURATION}ms
                  ease-in
                  both;
              }

              .brise-toast-progress {
                transform-origin: left center;
                animation-name:
                  brise-toast-progress;
                animation-timing-function:
                  linear;
                animation-fill-mode:
                  forwards;
              }

              @media
                (prefers-reduced-motion:
                  reduce) {
                .brise-toast-enter,
                .brise-toast-exit,
                .brise-toast-progress {
                  animation: none !important;
                }
              }
            `}</style>
          </>,
          document.body,
        )}
    </>
  );
}

/* ==========================================
   POPUP PROFISSIONAL
   ========================================== */

function TemperatureToast({
  toast,
  closing,
  onClose,
}: {
  toast: ToastMessage;

  closing: boolean;

  onClose: () => void;
}) {
  const warning =
    toast.variant ===
    "warning";

  const alerts =
    toast.alerts ?? [];

  const singleAlert =
    alerts.length === 1
      ? alerts[0]
      : null;

  const accentClass =
    warning
      ? "from-amber-400 via-orange-500 to-amber-500"
      : "from-emerald-400 via-emerald-500 to-teal-500";

  const iconClass =
    warning
      ? "border-amber-100 bg-amber-50 text-amber-600"
      : "border-emerald-100 bg-emerald-50 text-emerald-600";

  const labelClass =
    warning
      ? "text-amber-700"
      : "text-emerald-700";

  const temperatureClass =
    warning
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`brise-toast fixed right-4 top-4 z-[10001] w-[calc(100%-2rem)] max-w-[520px] overflow-hidden rounded-[26px] border border-slate-200/90 bg-white/95 shadow-[0_28px_85px_rgba(15,23,42,0.24)] backdrop-blur-2xl ${
        closing
          ? "brise-toast-exit"
          : "brise-toast-enter"
      }`}
    >
      {/* BARRA LATERAL */}

      <div
        className={`absolute inset-y-0 left-0 w-[5px] bg-gradient-to-b ${accentClass}`}
      />

      {/* FUNDO DECORATIVO */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${
            warning
              ? "bg-amber-100/55"
              : "bg-emerald-100/55"
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-slate-50/30" />
      </div>

      {/* CONTEÚDO */}

      <div className="relative p-5 pl-6 sm:p-6 sm:pl-7">
        <div className="flex items-start gap-4">
          {/* ÍCONE */}

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${iconClass}`}
          >
            {warning ? (
              <TemperatureWarningIcon />
            ) : (
              <CheckLargeIcon />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* TÍTULO */}

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-[0.15em] ${labelClass}`}
                  >
                    {warning
                      ? "Atenção de climatização"
                      : "Alerta atualizado"}
                  </span>

                  {alerts.length >
                    1 && (
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                      {
                        alerts.length
                      }{" "}
                      equipamentos
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 text-[15px] font-bold tracking-tight text-slate-950 sm:text-base">
                  {toast.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {toast.message}
                </p>
              </div>

              {/* FECHAR */}

              <button
                type="button"
                onClick={
                  onClose
                }
                aria-label="Fechar notificação"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ==================================
                UM EQUIPAMENTO
                ================================== */}

            {singleAlert && (
              <div
                className={`mt-4 overflow-hidden rounded-2xl border ${
                  warning
                    ? "border-amber-100 bg-gradient-to-r from-amber-50/85 via-white to-white"
                    : "border-emerald-100 bg-gradient-to-r from-emerald-50/85 via-white to-white"
                }`}
              >
                <div className="flex items-center gap-3 p-3.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      warning
                        ? "bg-amber-100/80 text-amber-700"
                        : "bg-emerald-100/80 text-emerald-700"
                    }`}
                  >
                    <AirConditionerIcon />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[9px] font-bold uppercase tracking-[0.12em] ${labelClass}`}
                    >
                      Equipamento identificado
                    </p>

                    <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
                      {
                        singleAlert.name
                      }
                    </p>

                    <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                      Nº{" "}
                      {
                        singleAlert.deviceId
                      }
                    </p>
                  </div>

                  <div
                    className={`shrink-0 rounded-xl border px-3 py-2 shadow-sm ${temperatureClass}`}
                  >
                    <span className="text-lg font-extrabold tracking-tight">
                      {formatTemperature(
                        singleAlert.temperature,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================
                VÁRIOS EQUIPAMENTOS
                ================================== */}

            {alerts.length > 1 && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/45">
                {alerts
                  .slice(
                    0,
                    3,
                  )
                  .map(
                    (
                      alert,
                      index,
                    ) => (
                      <div
                        key={
                          alert.deviceId
                        }
                        className={`flex items-center gap-3 px-3.5 py-2.5 ${
                          index >
                          0
                            ? "border-t border-amber-100/70"
                            : ""
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100/70 text-amber-700">
                          <AirConditionerIcon />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-bold text-slate-800">
                            {
                              alert.name
                            }
                          </p>

                          <p className="font-mono text-[8px] text-slate-400">
                            Nº{" "}
                            {
                              alert.deviceId
                            }
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold text-amber-700 shadow-sm ring-1 ring-amber-100">
                          {formatTemperature(
                            alert.temperature,
                          )}
                        </span>
                      </div>
                    ),
                  )}

                {alerts.length >
                  3 && (
                  <div className="border-t border-amber-100/70 px-3.5 py-2 text-center text-[9px] font-bold text-amber-700">
                    +
                    {alerts.length -
                      3}{" "}
                    outros equipamentos
                  </div>
                )}
              </div>
            )}

            {/* RODAPÉ DO TOAST */}

            <div className="mt-4 flex items-center gap-2 text-[9px] font-medium text-slate-400">
              <ClockSmallIcon />

              <span>
                Esta notificação será
                fechada automaticamente.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================
          BARRA DE TEMPO
          ====================================== */}

      <div className="relative h-1 overflow-hidden bg-slate-100">
        <div
          className={`brise-toast-progress absolute inset-y-0 left-0 w-full bg-gradient-to-r ${accentClass}`}
          style={{
            animationDuration:
              `${TOAST_DURATION}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================
   ITEM DA LISTA DE NOTIFICAÇÕES
   ========================================== */

function NotificationItem({
  alert,
  onResolve,
}: {
  alert: TemperatureAlert;

  onResolve: () => void;
}) {
  return (
    <article className="group px-4 py-4 transition hover:bg-slate-50/80">
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <TemperatureWarningIcon />

          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900">
                {alert.name}
              </p>

              <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                Nº{" "}
                {
                  alert.deviceId
                }
              </p>
            </div>

            <span className="shrink-0 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
              {formatTemperature(
                alert.temperature,
              )}
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Temperatura configurada
            abaixo do limite de{" "}
            <strong className="font-bold text-slate-700">
              23 °C
            </strong>
            .
          </p>

          <button
            type="button"
            onClick={
              onResolve
            }
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <CheckIcon />

            Resolvido
          </button>

          <p className="mt-1.5 text-[9px] text-slate-400">
            Ocultar alerta por
            15 minutos
          </p>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   LISTA VAZIA
   ========================================== */

function EmptyNotifications({
  hasSnoozed,
}: {
  hasSnoozed: boolean;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckLargeIcon />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900">
        Nenhum alerta ativo
      </p>

      <p className="mx-auto mt-1 max-w-[260px] text-[11px] leading-5 text-slate-400">
        {hasSnoozed
          ? "Os alertas atuais foram temporariamente marcados como resolvidos."
          : "Nenhum equipamento ligado está configurado abaixo de 23 °C."}
      </p>
    </div>
  );
}

/* ==========================================
   FORMATAÇÃO
   ========================================== */

function formatTemperature(
  value: number,
) {
  if (
    Number.isInteger(
      value,
    )
  ) {
    return `${value} °C`;
  }

  return `${value.toFixed(
    1,
  )} °C`;
}

/* ==========================================
   ÍCONES
   ========================================== */

function BellIcon() {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

      <path d="M10 21h4" />
    </svg>
  );
}

function TemperatureWarningIcon() {
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
      <path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z" />

      <path d="M10 5v9" />

      <path d="M18 8v4" />

      <path d="M18 16h.01" />
    </svg>
  );
}

function AirConditionerIcon() {
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
      <rect
        x="3"
        y="5"
        width="18"
        height="10"
        rx="2"
      />

      <path d="M7 11h10" />

      <path d="M8 15v2" />

      <path d="M12 15v3" />

      <path d="M16 15v2" />
    </svg>
  );
}

function CheckIcon() {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CheckLargeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="m6 6 12 12" />

      <path d="m18 6-12 12" />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
    </svg>
  );
}