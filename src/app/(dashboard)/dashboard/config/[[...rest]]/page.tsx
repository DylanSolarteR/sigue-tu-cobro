import { UserProfile } from "@clerk/nextjs";

function Config() {
  return (
    <section className="min-w-0 space-y-6">
      <header className="space-y-2 border-b border-[#263c35] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Configuración
        </h1>
        <p className="max-w-full text-sm leading-6 text-[#b9c9c2]">
          Administra tu perfil y los datos de acceso a tu cuenta.
        </p>
      </header>
      <div className="flex w-full min-w-0 justify-center">
        <UserProfile
          appearance={{ elements: { rootBox: { width: "100%", maxWidth: "none" }, cardBox: { width: "100%", maxWidth: "none" }, card: { width: "100%", maxWidth: "none" } } }}
          fallback={
            <div
              className="skeleton min-h-96 w-full rounded-2xl"
              role="status"
              aria-label="Cargando configuración"
            />
          }
        />
      </div>
    </section>
  );
}

export default Config;
