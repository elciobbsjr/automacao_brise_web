"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useFormStatus,
} from "react-dom";

import type {
  UserRole,
} from "@/generated/prisma/client";

import {
  logoutAction,
} from "@/features/auth/actions/logout.action";

interface UserMenuProps {
  name: string;

  role: UserRole;
}

export function UserMenu({
  name,
  role,
}: UserMenuProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        !containerRef.current?.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
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
      "pointerdown",
      handlePointerDown,
    );

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const initials =
    getInitials(
      name,
    );

  const roleLabel =
    getRoleLabel(
      role,
    );

  return (
    <div
      ref={
        containerRef
      }
      className="relative h-16"
    >
      {/* ==========================================
          BOTÃO
          ========================================== */}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={
          open
        }
        aria-label="Abrir menu do usuário"
        title={
          name
        }
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className={`group flex h-16 w-full items-center justify-center gap-1 rounded-2xl border bg-white/80 px-2 shadow-sm backdrop-blur transition duration-200 ${
          open
            ? "border-slate-300 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
            : "border-slate-200/80 hover:border-slate-300 hover:bg-white"
        }`}
      >
        {/* AVATAR */}

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold tracking-[0.04em] text-white shadow-sm">
          {initials}
        </span>

        {/* SETA */}

        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 transition duration-200 group-hover:text-slate-600 ${
            open
              ? "rotate-180 text-slate-700"
              : ""
          }`}
        >
          <ChevronIcon />
        </span>
      </button>

      {/* ==========================================
          MENU
          ========================================== */}

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+9px)] z-[100] w-[220px] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl"
        >
          {/* ======================================
              USUÁRIO
              ====================================== */}

          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold tracking-[0.04em] text-white shadow-sm">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-slate-900">
                {name}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    role ===
                    "ADMIN"
                      ? "bg-blue-600"
                      : role ===
                          "OPERATOR"
                        ? "bg-cyan-500"
                        : "bg-slate-400"
                  }`}
                />

                <span className="text-[10px] font-semibold text-slate-400">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mx-2 h-px bg-slate-100" />

          {/* ======================================
              LOGOUT
              ====================================== */}

          <form
            action={
              logoutAction
            }
          >
            <LogoutButton />
          </form>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   LOGOUT
   ========================================== */

function LogoutButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      role="menuitem"
      disabled={
        pending
      }
      className="group mt-1 flex h-10 w-full items-center justify-between rounded-xl px-3 text-xs font-semibold text-slate-600 transition duration-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
    >
      <span className="flex items-center gap-2.5">
        <span className="text-slate-400 transition group-hover:text-red-600">
          <LogoutIcon />
        </span>

        {pending
          ? "Saindo..."
          : "Sair da conta"}
      </span>

      {!pending && (
        <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-red-400">
          <ArrowIcon />
        </span>
      )}
    </button>
  );
}

/* ==========================================
   INICIAIS
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

/* ==========================================
   PERFIL
   ========================================== */

function getRoleLabel(
  role: UserRole,
) {
  switch (role) {
    case "ADMIN":
      return "Administrador";

    case "OPERATOR":
      return "Operador";

    case "VIEWER":
      return "Visualização";

    default:
      return "Usuário";
  }
}

/* ==========================================
   ÍCONES
   ========================================== */

function ChevronIcon() {
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
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />

      <path d="M15 12H3" />

      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
  );
}

function ArrowIcon() {
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
      <path d="M5 12h14" />

      <path d="m15 8 4 4-4 4" />
    </svg>
  );
}