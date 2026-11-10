import { ClerkFailed, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Suspense, type ReactNode } from "react";

function AuthSkeleton() {
  return (
    <div role="status" aria-label="Cargando formulario de acceso" className="min-h-[28rem] space-y-5 rounded-2xl border border-[#263c35] bg-[#101f1a] p-6">
      <div className="skeleton mx-auto h-7 w-48" />
      <div className="skeleton mx-auto h-4 w-56 max-w-full" />
      <div className="skeleton mt-8 h-12 w-full" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-12 w-full" />
    </div>
  );
}

export default function AuthLoadingBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <ClerkLoading><AuthSkeleton /></ClerkLoading>
      <ClerkLoaded>{children}</ClerkLoaded>
      <ClerkFailed><p role="alert">No se pudo cargar el acceso. Actualiza la página para intentarlo de nuevo.</p></ClerkFailed>
    </Suspense>
  );
}
