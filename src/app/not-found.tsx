import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh w-full items-center bg-stc-bg px-4 py-8 text-stc-text sm:px-8 lg:px-12">
      <section aria-labelledby="not-found-title" className="w-full rounded-2xl border border-stc-border bg-base-200 px-6 py-10 sm:px-10 sm:py-16">
        <h1 id="not-found-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          404 · Página no encontrada
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stc-muted sm:text-lg">
          Revisa la dirección o vuelve a una de estas secciones.
        </p>
        <nav aria-label="Opciones para continuar" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary min-h-11 w-full rounded-xl px-5 transition-colors focus-visible:border-stc-focus focus-visible:bg-stc-hover focus-visible:text-stc-text focus-visible:outline-none motion-reduce:transition-none sm:w-auto">
            Volver al inicio
          </Link>
          <Link href="/dashboard/resumen" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-stc-border px-5 font-medium transition-colors hover:bg-stc-hover focus-visible:border-stc-focus focus-visible:bg-stc-hover focus-visible:outline-none motion-reduce:transition-none sm:w-auto">
            Ir al resumen
          </Link>
        </nav>
      </section>
    </main>
  );
}
