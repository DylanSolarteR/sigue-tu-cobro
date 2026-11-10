import { UserProfile } from "@clerk/nextjs";

function Config() {
  return (
    <>
      <UserProfile
        fallback={
          <div className="skeleton min-h-96 w-full max-w-4xl" role="status" aria-label="Cargando configuración" />
        }
      />
    </>
  );
}

export default Config;
