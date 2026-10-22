"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  createPortal,
  useFormStatus,
} from "react-dom";

import {
  resetUserPasswordAction,
  type ResetUserPasswordActionState,
} from "@/features/users/actions/reset-user-password.action";

interface ResetUserPasswordModalProps {
  userId: string;

  userName: string;

  onClose: () => void;
}

const initialState:
  ResetUserPasswordActionState = {
    success: false,
    error: null,
  };

export function ResetUserPasswordModal({
  userId,
  userName,
  onClose,
}: ResetUserPasswordModalProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    state,
    formAction,
  ] = useActionState(
    resetUserPasswordAction,
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

    onClose();
  }, [
    state.success,
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
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-[26px] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl">
        {/* FUNDO */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/70" />

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-slate-900 via-blue-700 to-sky-400" />
        </div>

        <div className="relative">
          {/* CABEÇALHO */}

          <header className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <KeyIcon />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Administração
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">
                  Redefinir senha
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Defina uma nova senha
                  para{" "}
                  <strong className="font-semibold text-slate-700">
                    {userName}
                  </strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              aria-label="Fechar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            >
              <CloseIcon />
            </button>
          </header>

          {/* FORMULÁRIO */}

          <form
            action={
              formAction
            }
            className="space-y-5 px-5 py-5 sm:px-6"
          >
            <input
              type="hidden"
              name="userId"
              value={
                userId
              }
            />

            {/* NOVA SENHA */}

            <Field
              label="Nova senha"
              error={
                state
                  .fieldErrors
                  ?.password
              }
            >
              <div className="relative">
                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Mínimo de 12 caracteres"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOffIcon />
                  ) : (
                    <EyeIcon />
                  )}
                </button>
              </div>
            </Field>

            {/* CONFIRMAÇÃO */}

            <Field
              label="Confirmar nova senha"
              error={
                state
                  .fieldErrors
                  ?.confirmPassword
              }
            >
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Digite novamente"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon />
                  ) : (
                    <EyeIcon />
                  )}
                </button>
              </div>
            </Field>

            {/* INFORMAÇÃO */}

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0 text-blue-600">
                  <InfoIcon />
                </div>

                <p className="text-[11px] leading-5 text-blue-700">
                  A senha atual não é
                  exibida nem recuperada.
                  O sistema armazenará
                  somente o hash seguro
                  da nova senha.
                </p>
              </div>
            </div>

            {/* ERRO */}

            {state.error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
              >
                {state.error}
              </div>
            )}

            {/* AÇÕES */}

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={
                  onClose
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancelar
              </button>

              <ResetButton />
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ==========================================
   CAMPO
   ========================================== */

function Field({
  label,
  error,
  children,
}: {
  label: string;

  error?: string;

  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ==========================================
   BOTÃO REDEFINIR
   ========================================== */

function ResetButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={
        pending
      }
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoadingIcon />

          Redefinindo...
        </>
      ) : (
        <>
          <KeyIcon />

          Redefinir senha
        </>
      )}
    </button>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function KeyIcon() {
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
      <circle
        cx="8"
        cy="15"
        r="4"
      />

      <path d="m11 12 9-9" />

      <path d="m15 8 3 3" />
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />

      <path d="M18 6 6 18" />
    </svg>
  );
}

function EyeIcon() {
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
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />
    </svg>
  );
}

function EyeOffIcon() {
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
      <path d="M3 3l18 18" />

      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />

      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.1 3.1" />

      <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 5.4-1.5" />
    </svg>
  );
}

function InfoIcon() {
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

      <path d="M12 11v5" />

      <path d="M12 8h.01" />
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