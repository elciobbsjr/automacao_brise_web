import Image from "next/image";

import {
  LoginForm,
} from "./LoginForm";

export function LoginScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-44 top-1/3 h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -bottom-56 left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-100/35 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <div className="relative z-10 grid w-full max-w-[1080px] overflow-hidden rounded-[30px] border border-white/80 bg-white/72 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-blue-700 to-sky-400" />

        <section className="relative hidden min-h-[640px] border-r border-slate-200/70 px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-12 xl:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-blue-50/70" />
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-sky-100/45 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 shadow-sm backdrop-blur">
              <div className="relative h-16 w-16">
                <Image
                  src="/tre-ma.png"
                  alt="TRE-MA"
                  fill
                  sizes="64px"
                  priority
                  className="object-contain"
                />
              </div>

              <div className="h-12 w-px bg-slate-200" />

              <div className="relative h-16 w-[185px]">
                <Image
                  src="/semeq-completo.png"
                  alt="SEMEQ"
                  fill
                  sizes="185px"
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <div className="mt-16 max-w-[480px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Central de climatização
              </span>

              <h1 className="mt-5 text-[44px] font-bold leading-none tracking-[-0.05em] text-slate-950">
                Brise{" "}
                <span className="font-medium text-slate-300">
                  /
                </span>{" "}
                <span className="text-blue-700">
                  SEMEQ
                </span>
              </h1>

              <p className="mt-5 max-w-[430px] text-[15px] leading-7 text-slate-500">
                Monitoramento e controle
                dos dispositivos de
                climatização do Tribunal
                Regional Eleitoral do
                Maranhão.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <ShieldIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Acesso restrito
                </p>

                <p className="text-xs text-slate-400">
                  Uso exclusivo por usuários autorizados.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[640px] items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-[390px]">
            <div className="mb-10 lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm">
                <div className="relative h-11 w-11">
                  <Image
                    src="/tre-ma.png"
                    alt="TRE-MA"
                    fill
                    sizes="44px"
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="h-9 w-px bg-slate-200" />

                <div className="relative h-11 w-[135px]">
                  <Image
                    src="/semeq-completo.png"
                    alt="SEMEQ"
                    fill
                    sizes="135px"
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Acesso ao sistema
              </span>

              <h2 className="mt-4 text-[30px] font-bold tracking-[-0.04em] text-slate-950">
                Identifique-se
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entre com suas credenciais
                para acessar a plataforma.
              </p>
            </div>

            <div className="mt-8">
              <LoginForm />
            </div>

            <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
              Tribunal Regional Eleitoral do Maranhão
              <br />
              Seção de Manutenção de Equipamentos
            </p>
          </div>
        </section>
      </div>
    </main>
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
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}