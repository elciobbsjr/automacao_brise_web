"use client";

import {
  useActionState,
  useEffect,
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

import type {
  UserRole,
} from "@/generated/prisma/client";

import {
  editUserAction,
  type EditUserActionState,
} from "@/features/users/actions/edit-user.action";

interface EditUserModalProps {
  userId: string;

  userName: string;

  userEmail: string;

  userRole: UserRole;

  onClose: () => void;
}

const initialState:
  EditUserActionState = {
    success: false,
    error: null,
  };

export function EditUserModal({
  userId,
  userName,
  userEmail,
  userRole,
  onClose,
}: EditUserModalProps) {
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
    editUserAction,
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
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[26px] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl">
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
                <EditIcon />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Administração
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">
                  Editar usuário
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Atualize os dados e o
                  nível de acesso da conta.
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

            <Field
              label="Nome"
              error={
                state
                  .fieldErrors
                  ?.name
              }
            >
              <input
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={
                  userName
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60"
              />
            </Field>

            <Field
              label="E-mail"
              error={
                state
                  .fieldErrors
                  ?.email
              }
            >
              <input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={
                  userEmail
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60"
              />
            </Field>

            <Field
              label="Perfil de acesso"
              error={
                state
                  .fieldErrors
                  ?.role
              }
            >
              <select
                name="role"
                defaultValue={
                  userRole
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100/60"
              >
                <option value="VIEWER">
                  Visualização
                </option>

                <option value="OPERATOR">
                  Operador
                </option>

                <option value="ADMIN">
                  Administrador
                </option>
              </select>

              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                Alterações de perfil são
                aplicadas na próxima
                atualização da sessão.
              </p>
            </Field>

            {state.error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700"
              >
                {state.error}
              </div>
            )}

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

              <SaveButton />
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
   SALVAR
   ========================================== */

function SaveButton() {
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

          Salvando...
        </>
      ) : (
        <>
          <CheckIcon />

          Salvar alterações
        </>
      )}
    </button>
  );
}

/* ==========================================
   ÍCONES
   ========================================== */

function EditIcon() {
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
      <path d="M12 20h9" />

      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
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

function CheckIcon() {
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
      <path d="m5 12 4 4L19 6" />
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