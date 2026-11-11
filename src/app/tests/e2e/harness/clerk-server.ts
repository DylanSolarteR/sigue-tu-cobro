import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { identity } from "./store";

export function clerkMiddleware() {
  return (request: NextRequest) => {
    if (request.nextUrl.pathname.startsWith("/dashboard") && !request.cookies.has("stc-e2e-session")) return NextResponse.redirect(new URL("/entrar", request.url));
    return NextResponse.next();
  };
}
export function createRouteMatcher() { return () => true; }
export async function auth() { return { userId: (await cookies()).has("stc-e2e-session") ? identity() : null }; }
