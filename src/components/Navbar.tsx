"use client";
import UseAnimations from "react-useanimations";
import { Button } from "./ui/button";
import menu2 from "react-useanimations/lib/menu2";
import { useState } from "react";
import Link from "next/link";

function Navbar() {
  const [ShowCollapse, setShowCollapse] = useState<boolean>(false);
  return (
    <header
      className={`t-0 l-0 fixed z-50 w-full min-w-full px-2 text-foreground backdrop-blur-sm backdrop-filter sm:flex sm:px-56 ${
        ShowCollapse ? "max-h-fit pb-4" : "max-h-20"
      } transition-all duration-300`}
    >
      {/* Logo */}
      <nav className="flex h-full w-full flex-col items-center justify-between gap-2 sm:flex-row md:my-6">
        <div className="flex w-full items-center justify-between gap-2">
          <h1 className="text-lg font-bold sm:text-3xl">SigueTuCobro</h1>
          <button onClick={() => setShowCollapse(!ShowCollapse)}>
            <UseAnimations
              animation={menu2}
              size={56}
              speed={3}
              strokeColor="white"
              className="flex sm:hidden"
            />
          </button>
        </div>
        {/* Buttons */}
        <div
          className={`flex-col items-center gap-5 sm:flex-row sm:opacity-100 ${ShowCollapse ? "flex" : "hidden sm:flex"} transition-opacity`}
        >
          <Link href={"/entrar"}>
            <Button className="rounded-2xl bg-transparent text-sm hover:brightness-110 sm:text-base">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href={"/entrar"}>
            <Button className="rounded-2xl text-sm hover:brightness-110 sm:text-base">
              Registrarse
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
