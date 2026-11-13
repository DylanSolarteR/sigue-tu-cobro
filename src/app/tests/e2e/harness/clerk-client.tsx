"use client";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ClerkProvider({ children }: { children: ReactNode }) { return children; }
export function Show({ children }: { children: ReactNode }) { return children; }
export function ClerkLoaded({ children }: { children: ReactNode }) { return children; }
export function ClerkLoading() { return null; }
export function ClerkFailed() { return null; }
export function UserButton() { return <Link href="/dashboard/config">Perfil de prueba</Link>; }
export function UserProfile({ appearance }: { appearance?: { elements?: Record<string, CSSProperties> } }) {
  return <div data-testid="mock-clerk-profile" style={appearance?.elements?.rootBox}><div style={appearance?.elements?.cardBox} className="rounded-2xl border border-stc-border p-6"><h2>Perfil de usuario simulado</h2><p>Las funciones internas de Clerk se verifican con servicios reales.</p></div></div>;
}
export function SignIn() {
  const router = useRouter();
  return <button type="button" className="btn btn-primary" onClick={() => { document.cookie = "stc-e2e-session=1;path=/;SameSite=Lax"; router.push("/dashboard/resumen"); }}>Entrar con cuenta simulada</button>;
}
export function SignUp() { return <SignIn />; }
