import type { Metadata } from "next";
import { Montserrat, Fraunces } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const editorial = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bellezista",
  description: "El mundo de la belleza, en un solo lugar",
  // Chrome's auto-translate injects DOM mutations outside React's control --
  // when it touches a Radix portal (Select/Dialog), React's own cleanup
  // later tries to remove a node Translate already moved/replaced, throwing
  // "Failed to execute 'removeChild'". The whole app is Spanish for a
  // Spain-market audience, so blocking auto-translate outright is the right
  // trade here, not just a workaround for a dev-only annoyance.
  other: { google: "notranslate" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      translate="no"
      className={`${montserrat.variable} ${editorial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
