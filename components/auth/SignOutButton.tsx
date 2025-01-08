"use client";

import React, { useTransition } from "react";
import { signOutAction } from "@/actions/authActions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const LogoutButton = () => {
   const [isPending, startTransition] = useTransition();

   const handleLogout = () => {
      startTransition(async () => {
         await signOutAction();
      });
   };

   return (
      <Button onClick={handleLogout} disabled={isPending} className="w-full">
         {isPending ? (
            <Loader2 className="animate-spin !w-6 !h-6" size={48} />
         ) : (
            "Odjavi se"
         )}
      </Button>
   );
};
