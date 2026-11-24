import Image from "next/image";

import {
  LoginForm,
} from "./LoginForm";

export function LoginScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-44 top-1/3 h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -bottom-56 left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-100/35 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <section className="relative z-10 isolate w-full max-w-[460px] overflow-hidden rounded-[26px] border border-white/90 bg-white/85 px-7 py-9 shadow-[0_24px_70px_rgba(30,64,175,0.10)] backdrop-blur-xl sm:px-11 sm:py-11">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,rgba(219,234,254,0.48),transparent_58%),radial-gradient(ellipse_at_bottom_right,rgba(224,242,254,0.38),transparent_56%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400"
        />

        <div className="relative z-10 mb-9 flex items-center justify-center gap-5">
          <div className="relative h-[58px] w-[58px] shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/tre-ma.png"
              alt="TRE-MA"
              fill
              sizes="64px"
              priority
              className="object-contain"
            />
          </div>

          <div className="h-10 w-px bg-slate-200" />

          <div className="relative h-[58px] w-[166px] sm:h-16 sm:w-[184px]">
            <Image
              src="/semeq-completo.png"
              alt="SEMEQ"
              fill
              sizes="184px"
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative z-10 mb-7">
          <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-slate-950">
            Entrar
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Acesse sua conta para continuar.
          </p>
        </div>

        <div className="relative z-10">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
