"use client";
import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

function RootProviders({ children }: { children: ReactNode }) {
   return (
      <ThemeProvider
         attribute="class"
         defaultTheme="light"
         enableSystem
         disableTransitionOnChange
      >
         {children}
      </ThemeProvider>
   );
}

export default RootProviders;
