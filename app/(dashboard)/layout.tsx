import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
   return (
      <div className="min-h-screen flex flex-col gap-4">
         {/* Header */}
         <header>
            <Navbar />
         </header>

         {/* Main Content */}
         <main className="container">{children}</main>
      </div>
   );
};

export default layout;
