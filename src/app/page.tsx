import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, FileText, ListChecks } from "lucide-react";

const pasos = [
  { title: "Registra tus conceptos", description: "Guarda los ítems pendientes y asígnalos al cliente correspondiente.", icon: ListChecks },
  { title: "Prepara tu cuenta", description: "Selecciona los ítems que vas a cobrar y genera tu documento en PDF.", icon: FileText },
  { title: "Haz seguimiento", description: "Consulta tus cuentas y marca como pagadas las que ya recibiste.", icon: Check },
];

export default async function Home() {
  return (
    <main className="min-h-screen bg-[#0b1512] text-[#edf5ef]">
      <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-b border-[#365147] px-5 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="text-lg font-semibold tracking-tight sm:text-xl">SigueTuCobro<span className="text-[#67c59b]">.</span></Link>
        <nav aria-label="Navegación principal" className="flex items-center gap-3 sm:gap-6">
          <a href="#como-funciona" className="hidden text-sm text-[#c7dad0] hover:text-white md:block">Cómo funciona</a>
          <Link href="/entrar" className="text-sm font-medium text-[#dcece3] hover:text-white">Iniciar sesión</Link>
          <Link href="/registro" className="btn btn-sm rounded-lg border-0 bg-[#74d5a7] px-4 text-[#10231a] hover:bg-[#9be4bd]">Crear cuenta</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-10 sm:pt-28 lg:px-16 lg:pb-28 lg:pt-36">
        <div>
          <h1 className="max-w-4xl text-balance text-[clamp(3.1rem,8vw,7.5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Tus cobros merecen claridad.</h1>
          <div className="mt-8 h-1 w-20 rounded-full bg-[#74d5a7]" aria-hidden="true" />
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#c1d3c8] sm:text-xl">Organiza tus conceptos, crea cuentas de cobro y sigue lo pendiente. Todo en un lugar, a tu ritmo.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/registro" className="btn min-h-14 rounded-lg border-0 bg-[#74d5a7] px-7 text-base text-[#10231a] hover:bg-[#9be4bd]">Crear mi cuenta <ArrowUpRight size={18} aria-hidden="true" /></Link>
            <a href="#como-funciona" className="inline-flex min-h-14 items-center gap-2 px-2 text-sm font-medium text-[#dcece3] hover:text-white">Conoce cómo funciona <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#e8f1e9] text-[#142a20]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
          <div className="border-b border-[#aabfb0] pb-10">
            <h2 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">De lo pendiente a una cuenta lista.</h2>
          </div>
          <div className="grid md:grid-cols-3">
            {pasos.map(({ title, description, icon: Icon }) => (
              <article key={title} className="border-b border-[#aabfb0] py-8 md:border-b-0 md:pr-10 md:pt-10">
                <Icon size={25} strokeWidth={1.7} aria-hidden="true" className="text-[#257d58]" />
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 max-w-xs leading-relaxed text-[#435d4d]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[#acc4b5] sm:px-10 lg:px-16"><span>SigueTuCobro</span><Link href="/entrar" className="hover:text-white">Iniciar sesión</Link></footer>
    </main>
  );
}
