import "@/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { TRPCReactProvider } from "@/trpc/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/Toaster";
import { TooltipProvider } from "@/components/ui";

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
    <html
      lang="es"
      className={geologica.className + " h-screen overflow-hidden"}
    >
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full min-h-screen">
        <TRPCReactProvider>
          <ClerkProvider
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#319678",
                colorText: "white",
                colorBackground: "#0D0D0D",
              },
            }}
          >
            <TooltipProvider>
              <SidebarProvider>
                <div className="max-w-screen h-full min-h-screen w-full">
                  {children}
                </div>
                <Toaster />
              </SidebarProvider>
            </TooltipProvider>
          </ClerkProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
