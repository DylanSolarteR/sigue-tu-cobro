"use client";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

function Navbar() {
  const [ShowCollapse, setShowCollapse] = useState<boolean>(false);
  return (
    <header
      className={`t-0 l-0 fixed z-50 w-full min-w-full px-2 text-foreground backdrop-blur-sm backdrop-filter md:flex md:px-56 ${
        ShowCollapse ? "max-h-fit pb-4" : "max-h-20"
      } transition-all duration-300`}
    >
      {/* Logo */}
      <nav className="flex h-full w-full flex-col items-center justify-between gap-2 md:my-6 md:flex-row">
        <div className="flex w-full items-center justify-between gap-2">
          <h1 className="text-lg font-bold md:text-3xl">SigueTuCobro</h1>
          <button
            type="button"
            className="flex md:hidden"
            aria-label={ShowCollapse ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={ShowCollapse}
            onClick={() => setShowCollapse(!ShowCollapse)}
          >
            {ShowCollapse ? <X size={56} /> : <Menu size={56} />}
          </button>
        </div>
        {/* Buttons */}
        <div
          className={`flex-col items-center gap-5 md:flex-row md:opacity-100 ${ShowCollapse ? "flex" : "hidden md:flex"} transition-opacity`}
        >
          <Link href={"/entrar"} className="hidden 2xl:flex">
            <Button className="rounded-2xl bg-transparent text-sm hover:brightness-110 md:text-base">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href={"/entrar"} className="hidden 2xl:flex">
            <Button className="rounded-2xl text-sm hover:brightness-110 md:text-base">
              Registrarse
            </Button>
          </Link>
          <Link href={"/"} className="flex 2xl:hidden">
            <Button className="rounded-2xl bg-transparent text-sm hover:brightness-110 md:text-base">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href={"/"} className="flex 2xl:hidden">
            <Button className="rounded-2xl text-sm hover:brightness-110 md:text-base">
              Registrarse
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
