import {
  LoginForm,
} from "./LoginForm";

export function LoginScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-8">
      {/* Fundo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-blue-200/35 blur-3xl" />

        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 h-[480px] w-[480px] rounded-full bg-indigo-100/40 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/70 to-transparent" />
      </div>

      <div className="relative z-10 grid w-full max-w-[1040px] overflow-hidden rounded-[32px] border border-white/80 bg-white/75 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        {/* Área institucional */}
        <section className="relative hidden overflow-hidden border-r border-white/60 bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />

            <div className="absolute -bottom-28 right-[-80px] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950/90" />

            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg backdrop-blur">
                <ClimateLogo />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  AGST Brise
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  SEMEQ · Monitoramento
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                Gestão climatizada
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.04em]">
                Controle inteligente
                da climatização.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                Acompanhe equipamentos,
                temperaturas, estados e
                programações em uma única
                plataforma.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-3">
              <LoginFeature
                label="Monitoramento"
                value="Tempo real"
              />

              <LoginFeature
                label="Operação"
                value="Centralizada"
              />

              <LoginFeature
                label="Acesso"
                value="Seguro"
              />
            </div>

            <p className="mt-6 text-[10px] leading-5 text-slate-500">
              Acesso restrito a usuários
              autorizados.
            </p>
          </div>
        </section>

        {/* Login */}
        <section className="relative flex min-h-[620px] items-center bg-white/80 px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-[390px]">
            {/* Marca mobile */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md">
                <ClimateLogo />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  AGST Brise
                </p>

                <p className="text-xs text-slate-500">
                  SEMEQ · Monitoramento
                </p>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                Área segura
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950">
                Bem-vindo
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entre com suas credenciais
                para acessar o painel de
                monitoramento e controle.
              </p>
            </div>

            <div className="mt-8">
              <LoginForm />
            </div>

            <div className="mt-7 border-t border-slate-200/70 pt-5">
              <div className="flex items-start gap-2.5 text-xs leading-5 text-slate-400">
                <div className="mt-0.5 shrink-0 text-slate-400">
                  <ShieldIcon />
                </div>

                <p>
                  Suas credenciais são
                  processadas de forma
                  segura e o acesso é
                  controlado conforme seu
                  perfil.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginFeature({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ClimateLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="11"
        rx="2"
      />

      <path d="M7 11h10" />
      <path d="M8 16v2" />
      <path d="M12 16v3" />
      <path d="M16 16v2" />
    </svg>
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