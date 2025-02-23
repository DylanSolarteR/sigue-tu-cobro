import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";

import { TRPCReactProvider } from "@/trpc/react";
const geologica = localFont({ src: "../fonts/Geologica.woff2" });

export const metadata: Metadata = {
  title: "Sigue tu cobro - Gestiona tus cuentas de cobro.",
  description:
    "Plataforma para la optimización y el seguimiento de cuentas de cobro.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={geologica.className}>
      <body className="h-full min-h-screen">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
