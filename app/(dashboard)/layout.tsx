import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
   return (
      <div className="relative flex h-screen w-full flex-col">
         <Navbar />
         <div className="w-full mt-5">
            <div className="container">{children}</div>
         </div>
      </div>
   );
};

export default layout;
