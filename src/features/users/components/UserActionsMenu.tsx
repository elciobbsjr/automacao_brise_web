"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
  useFormStatus,
} from "react-dom";

import {
  useRouter,
} from "next/navigation";

import type {
  UserRole,
} from "@/generated/prisma/client";

import {
  toggleUserStatusAction,
  type ToggleUserStatusActionState,
} from "@/features/users/actions/toggle-user-status.action";

import {
  EditUserModal,
} from "@/features/users/components/EditUserModal";

interface UserActionsMenuProps {
  userId: string;

  userName: string;

  userEmail: string;

  userRole: UserRole;

  active: boolean;

  isCurrentUser: boolean;
}

const initialState:
  ToggleUserStatusActionState = {
    success: false,
    error: null,
  };

export function UserActionsMenu({
  userId,
  userName,
  userEmail,
  userRole,
  active,
  isCurrentUser,
}: UserActionsMenuProps) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    confirmationOpen,
    setConfirmationOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    menuPosition,
    setMenuPosition,
  ] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Posiciona o menu fora da tabela
   * através de portal.
   *
   * Isso evita cortes causados
   * pelo overflow da tabela.
   */
  function openMenu() {
    if (
      !buttonRef.current
    ) {
      return;
    }

    const rect =
      buttonRef.current
        .getBoundingClientRect();

    const menuWidth =
      220;

    const left =
      Math.max(
        12,
        Math.min(
          window.innerWidth -
            menuWidth -
            12,
          rect.right -
            menuWidth,
        ),
      );

    setMenuPosition({
      top:
        rect.bottom +
        8,

      left,
    });

    setOpen(
      (current) =>
        !current,
    );
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target =
        event.target as Node;

      if (
        buttonRef.current?.contains(
          target,
        ) ||
        menuRef.current?.contains(
          target,
        )
      ) {
        return;
      }

      setOpen(false);
    }

    function closeMenu() {
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
      "pointerdown",
      handlePointerDown,
    );

    window.addEventListener(
      "resize",
      closeMenu,
    );

    window.addEventListener(
      "scroll",
      closeMenu,
      true,
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
        "resize",
        closeMenu,
      );

      window.removeEventListener(
        "scroll",
        closeMenu,
        true,
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
  ]);

  function handleEditAction() {
    setOpen(false);

    setEditOpen(
      true,
    );
  }

  function handleStatusAction() {
    /*
     * O próprio administrador
     * não pode desativar sua conta.
     */
    if (
      active &&
      isCurrentUser
    ) {
      return;
    }

    setOpen(false);

    setConfirmationOpen(
      true,
    );
  }

  return (
    <>
      {/* ==========================================
          BOTÃO DE AÇÕES
          ========================================== */}

      <button
        ref={
          buttonRef
        }
        type="button"
        onClick={
          openMenu
        }
        aria-label={`Ações de ${userName}`}
        aria-haspopup="menu"
        aria-expanded={
          open
        }
        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
          open
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <MoreIcon />
      </button>

      {/* ==========================================
          MENU
          ========================================== */}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={
              menuRef
            }
            role="menu"
            style={{
              top:
                menuPosition.top,

              left:
                menuPosition.left,
            }}
            className="fixed z-[9998] w-[220px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.15)] backdrop-blur-xl"
          >
            {/* EDITAR */}

            <button
              type="button"
              role="menuitem"
              onClick={
                handleEditAction
              }
              className="group flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-slate-400 transition group-hover:text-blue-600">
                  <EditIcon />
                </span>

                Editar usuário
              </span>

              <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500">
                <ArrowIcon />
              </span>
            </button>

            <div className="mx-2 my-1 h-px bg-slate-100" />

            {/* STATUS */}

            <button
              type="button"
              role="menuitem"
              disabled={
                active &&
                isCurrentUser
              }
              onClick={
                handleStatusAction
              }
              className={`group flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-xs font-semibold transition ${
                active
                  ? "text-red-600 hover:bg-red-50"
                  : "text-emerald-700 hover:bg-emerald-50"
              } disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`transition ${
                    active
                      ? "text-red-400 group-hover:text-red-600"
                      : "text-emerald-500 group-hover:text-emerald-700"
                  }`}
                >
                  {active ? (
                    <DisableIcon />
                  ) : (
                    <EnableIcon />
                  )}
                </span>

                {active
                  ? isCurrentUser
                    ? "Sua conta"
                    : "Desativar conta"
                  : "Reativar conta"}
              </span>

              {!(
                active &&
                isCurrentUser
              ) && (
                <span
                  className={`transition group-hover:translate-x-0.5 ${
                    active
                      ? "text-red-300"
                      : "text-emerald-300"
                  }`}
                >
                  <ArrowIcon />
                </span>
              )}
            </button>

            {active &&
              isCurrentUser && (
                <p className="px-3 pb-2 pt-1 text-[9px] leading-4 text-slate-400">
                  Sua própria conta não
                  pode ser desativada.
                </p>
              )}
          </div>,
          document.body,
        )}

      {/* ==========================================
          MODAL DE EDIÇÃO
          ========================================== */}

      {editOpen && (
        <EditUserModal
          userId={
            userId
          }
          userName={
            userName
          }
          userEmail={
            userEmail
          }
          userRole={
            userRole
          }
          onClose={() =>
            setEditOpen(
              false,
            )
          }
        />
      )}

      {/* ==========================================
          MODAL DE STATUS
          ========================================== */}

      {confirmationOpen && (
        <ToggleUserStatusModal
          userId={
            userId
          }
          userName={
            userName
          }
          active={
            active
          }
          onClose={() =>
            setConfirmationOpen(
              false,
            )
          }
        />
      )}
    </>
  );
}

/* ==========================================
   CONFIRMAÇÃO DE STATUS
   ========================================== */

function ToggleUserStatusModal({
  userId,
  userName,
  active,
  onClose,
}: {
  userId: string;

  userName: string;

  active: boolean;

  onClose: () => void;
}) {
  const router =
    useRouter();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    state,
    formAction,
  ] = useActionState(
    toggleUserStatusAction,
    initialState,
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (
      !state.success
    ) {
      return;
    }

    router.refresh();

    onClose();
  }, [
    state.success,
    router,
    onClose,
  ]);

  useEffect(() => {
    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    onClose,
  ]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl">
        {/* FUNDO */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />

          <div
            className={`absolute inset-x-0 top-0 h-[3px] ${
              active
                ? "bg-gradient-to-r from-red-600 via-orange-500 to-amber-400"
                : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400"
            }`}
          />
        </div>

        <div className="relative p-6">
          {/* ÍCONE */}

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              active
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {active ? (
              <DisableIcon />
            ) : (
              <EnableIcon />
            )}
          </div>

          {/* TEXTO */}

          <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] text-slate-950">
            {active
              ? "Desativar usuário?"
              : "Reativar usuário?"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {active ? (
              <>
                O usuário{" "}
                <strong className="font-semibold text-slate-700">
                  {userName}
                </strong>{" "}
                não poderá realizar novos
                acessos enquanto a conta
                estiver desativada.
              </>
            ) : (
              <>
                O usuário{" "}
                <strong className="font-semibold text-slate-700">
                  {userName}
                </strong>{" "}
                voltará a ter acesso ao
                sistema de acordo com seu
                perfil.
              </>
            )}
          </p>

          {/* ERRO */}

          {state.error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
              {state.error}
            </div>
          )}

          {/* FORMULÁRIO */}

          <form
            action={
              formAction
            }
            className="mt-6"
          >
            <input
              type="hidden"
              name="userId"
              value={
                userId
              }
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={
                  onClose
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>

              <ConfirmButton
                active={
                  active
                }
              />
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ==========================================
   BOTÃO DE CONFIRMAÇÃO
   ========================================== */

function ConfirmButton({
  active,
}: {
  active: boolean;
}) {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={
        pending
      }
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white shadow-sm transition disabled:cursor-wait disabled:opacity-60 ${
        active
          ? "bg-red-600 hover:bg-red-700"
          : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {pending && (
        <LoadingIcon />
      )}

      {pending
        ? active
          ? "Desativando..."
          : "Reativando..."
        : active
          ? "Desativar conta"
          : "Reativar conta"}
    </button>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle
        cx="5"
        cy="12"
        r="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="1.5"
      />

      <circle
        cx="19"
        cy="12"
        r="1.5"
      />
    </svg>
  );
}

function EditIcon() {
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
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function DisableIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 8 8 8" />
    </svg>
  );
}

function EnableIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="m8 12 2.5 2.5L16 9" />
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

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4 animate-spin"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}