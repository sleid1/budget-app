"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface LoginButtonprops {
   children: ReactNode;
   mode?: "modal" | "redirect";
   asChild?: boolean;
}

export const LoginButton = ({
   children,
   mode = "redirect",
   asChild,
}: LoginButtonprops) => {
   const router = useRouter();

   const onClick = () => {
      router.push("/prijava");
   };

   if (mode === "modal") {
      return <span>TODO: IMPLEMENT MODAL</span>;
   }

   return (
      <span onClick={onClick} className="cursor-pointer">
         {children}
      </span>
   );
};
