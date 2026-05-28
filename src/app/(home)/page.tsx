import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="relative h-[50vh] min-h-[320px] md:h-[60vh] bg-brand-blue flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 to-brand-blue/30" />
        <div className="relative z-10 px-6 pb-8">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Explora el
            <br />
            MAMB
          </h1>
          <p className="text-white/80 mt-2 text-sm">
            Museo de Arte Moderno de Barranquilla
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 py-8">
        <h2 className="text-lg font-semibold text-brand-blue mb-4">
          Obra del Día
        </h2>
        <div className="bg-brand-grey rounded-2xl p-6 text-center max-w-2xl">
          <p className="text-gray-400 text-sm">Cargando obra destacada...</p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-20 pb-8 space-y-3 max-w-2xl">
        <h2 className="text-lg font-semibold text-brand-blue mb-4">
          Sobre el Museo
        </h2>
        {["Historia", "Misión", "Visión"].map((title) => (
          <details
            key={title}
            className="bg-brand-grey rounded-xl group"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-700 list-none">
              {title}
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-600">
              Contenido de {title.toLowerCase()} del MAMB próximamente.
            </div>
          </details>
        ))}
      </section>

      <Link
        href="/upload"
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-brand-blue text-white rounded-full shadow-lg shadow-brand-blue/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </main>
  );
}
