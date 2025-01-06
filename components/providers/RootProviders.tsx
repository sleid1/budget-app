"use client";
import React, { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";

function RootProviders({ children }: { children: ReactNode }) {
   const [queryClient] = React.useState(() => new QueryClient({}));

   return (
      <SessionProvider>
         <QueryClientProvider client={queryClient}>
            <ThemeProvider
               attribute="class"
               defaultTheme="light"
               enableSystem
               disableTransitionOnChange
            >
               {children}
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
         </QueryClientProvider>
      </SessionProvider>
   );
}

export default RootProviders;
