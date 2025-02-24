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
      className={`t-0 l-0 ~px-2/56 fixed z-50 w-full min-w-full text-foreground backdrop-blur-sm backdrop-filter sm:flex ${
        ShowCollapse ? "max-h-60 bg-background" : "max-h-20"
      } transition-all duration-300`}
    >
      {/* Logo */}
      <nav className="flex h-full w-full flex-col items-center justify-between gap-2 py-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="~text-lg/3xl font-bold">SigueTuCobro</h1>
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
          <Button className="~text-sm/base rounded-2xl bg-transparent hover:brightness-110">
            Iniciar Sesión
          </Button>
          <Link href={"/dashboard"}>
            <Button className="~text-sm/base rounded-2xl hover:brightness-110">
              Registrarse
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
