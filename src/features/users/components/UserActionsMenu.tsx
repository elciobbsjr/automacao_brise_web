"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useFormStatus,
} from "react-dom";

import {
  useRouter,
} from "next/navigation";

import {
  toggleUserStatusAction,
  type ToggleUserStatusActionState,
} from "@/features/users/actions/toggle-user-status.action";

interface UserActionsMenuProps {
  userId: string;

  userName: string;

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
   * usando um portal.
   *
   * Isso evita que overflow da tabela
   * corte o menu.
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
      210;

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
    };
  }, [
    open,
  ]);

  function handleStatusAction() {
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
            className="fixed z-[9998] w-[210px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.15)] backdrop-blur-xl"
          >
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
              className={`flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-xs font-semibold transition ${
                active
                  ? "text-red-600 hover:bg-red-50"
                  : "text-emerald-700 hover:bg-emerald-50"
              } disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300`}
            >
              {active ? (
                <DisableIcon />
              ) : (
                <EnableIcon />
              )}

              {active
                ? isCurrentUser
                  ? "Sua conta"
                  : "Desativar conta"
                : "Reativar conta"}
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
   CONFIRMAÇÃO
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

          {state.error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
              {state.error}
            </div>
          )}

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
   CONFIRMAR
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