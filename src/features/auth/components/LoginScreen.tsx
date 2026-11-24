import Image from "next/image";

import {
  LoginForm,
} from "./LoginForm";

export function LoginScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-8 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-44 top-1/3 h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -bottom-56 left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-100/35 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <div className="relative z-10 grid w-full max-w-[980px] overflow-hidden rounded-[26px] border border-white/80 bg-white/80 shadow-[0_20px_65px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-2">
        <section className="flex flex-col justify-center border-b border-slate-200/70 px-7 py-9 sm:px-12 sm:py-12 lg:min-h-[570px] lg:border-b-0 lg:border-r lg:px-14">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <Image
                src="/tre-ma.png"
                alt="TRE-MA"
                fill
                sizes="64px"
                priority
                className="object-contain"
              />
            </div>

            <div className="h-11 w-px bg-slate-200" />

            <div className="relative h-14 w-[158px] sm:h-16 sm:w-[185px]">
              <Image
                src="/semeq-completo.png"
                alt="SEMEQ"
                fill
                sizes="185px"
                priority
                className="object-contain object-left"
              />
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <h1 className="text-[38px] font-semibold leading-none tracking-[-0.055em] text-slate-950 sm:text-[46px]">
              Brise
              <span className="mx-2 font-normal text-slate-300">/</span>
              <span className="text-blue-700">SEMEQ</span>
            </h1>

            <p className="mt-5 max-w-[360px] text-[15px] leading-7 text-slate-500">
              Monitoramento e controle da climatização do TRE-MA.
            </p>
          </div>
        </section>

        <section className="flex items-center px-7 py-10 sm:px-12 lg:min-h-[570px] lg:px-14">
          <div className="mx-auto w-full max-w-[370px]">
            <div className="mb-8">
              <h2 className="text-[28px] font-semibold tracking-[-0.045em] text-slate-950">
                Entrar
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Acesse sua conta para continuar.
              </p>
            </div>

            <LoginForm />

            <p className="mt-9 text-center text-xs text-slate-400">
              Tribunal Regional Eleitoral do Maranhão
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
