import "./globals.css";
import NavigationButtons from "@/components/NavigateButtons";
import ForceLightMode from "@/components/ForceLightMode";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Uhe~",
    template: "%s | Uhe~",
  },
  description: "Blue Archive tools",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NeonAuthUIProvider authClient={authClient} defaultTheme="light">
          <ForceLightMode />
          <NavigationButtons />
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
