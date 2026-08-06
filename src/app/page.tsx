type BriseDevice = {
  id: number;
  name: string;
  model: string;
  state: boolean;
  temperature: number;
  humidity: number;
  mode: string;
  fanSpeed: string;
  consumption: number;
};

const devices: BriseDevice[] = [
  {
    id: 123456,
    name: "Sala dos Nobreaks",
    model: "Brise Lite-R",
    state: true,
    temperature: 22.8,
    humidity: 70.4,
    mode: "Eco",
    fanSpeed: "Alta",
    consumption: 0,
  },
  {
    id: 123457,
    name: "Sala Administrativa",
    model: "Brise Lite-R",
    state: false,
    temperature: 25.1,
    humidity: 68.2,
    mode: "Manual",
    fanSpeed: "Média",
    consumption: 18,
  },
  {
    id: 123458,
    name: "Sala de Servidores",
    model: "Brise Lite-R",
    state: true,
    temperature: 20.7,
    humidity: 61.5,
    mode: "Eco",
    fanSpeed: "Alta",
    consumption: 32,
  },
];

export default function Home() {
  const onlineDevices = devices.filter((device) => device.state).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Brise
          </h1>

          <p className="mt-2 text-gray-600">
            Monitoramento dos dispositivos de ar-condicionado
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            title="Total de dispositivos"
            value={String(devices.length)}
          />

          <SummaryCard
            title="Ligados"
            value={String(onlineDevices)}
          />

          <SummaryCard
            title="Desligados"
            value={String(devices.length - onlineDevices)}
          />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Dispositivos
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </article>
  );
}

function DeviceCard({ device }: { device: BriseDevice }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {device.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {device.model} · Nº {device.id}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            device.state
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {device.state ? "Ligado" : "Desligado"}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <DeviceInfo
          label="Temperatura"
          value={`${device.temperature.toFixed(1).replace(".", ",")} °C`}
        />

        <DeviceInfo
          label="Umidade"
          value={`${device.humidity.toFixed(1).replace(".", ",")}%`}
        />

        <DeviceInfo label="Modo" value={device.mode} />

        <DeviceInfo label="Ventilação" value={device.fanSpeed} />

        <DeviceInfo
          label="Consumo"
          value={`${device.consumption} kWh`}
        />
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-gray-700"
      >
        Ver detalhes
      </button>
    </article>
  );
}

function DeviceInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">{value}</p>
    </div>
  );
}