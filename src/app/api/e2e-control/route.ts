import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (process.env.STC_E2E !== "1" || !process.env.E2E_CONTROL_TOKEN || request.headers.get("x-e2e-token") !== process.env.E2E_CONTROL_TOKEN || !["localhost", "127.0.0.1"].includes(new URL(request.url).hostname)) return new NextResponse(null, { status: 404 });
  const { resetStore, store, identity, loadStore, saveStore } = await import("@/app/tests/e2e/harness/store");
  const input = await request.json() as { action?: string; accounts?: number; pending?: number; fault?: string; delay?: number };
  loadStore();
  if (input.action === "reset") {
    if (!Number.isInteger(input.accounts ?? 12) || !Number.isInteger(input.pending ?? 3) || (input.accounts ?? 12) < 0 || (input.accounts ?? 12) > 10000 || (input.pending ?? 3) < 0 || (input.pending ?? 3) > 1000) return new NextResponse(null, { status: 400 });
    resetStore(input.accounts, input.pending);
  }
  if (input.fault !== undefined) store().fault = input.fault;
  if (input.delay !== undefined && Number.isFinite(input.delay) && input.delay >= 0 && input.delay <= 3000) store().delay = input.delay;
  saveStore();
  return NextResponse.json({ owner: identity(), accounts: store().accounts, items: store().items, actors: store().actors });
}
