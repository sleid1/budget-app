import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SquareMinus, SquarePlus } from "lucide-react";
import Link from "next/link";
import React from "react";

const CreateInvoiceButtons = () => {
   return (
      <div className="flex items-center gap-3">
         <Link
            href="/racuni/kreiraj-izlazni-racun"
            className={cn(
               buttonVariants(),
               "border-emerald-500 bg-emerald-800 text-white hover:bg-emerald-700 hover:text-white"
            )}
         >
            <SquarePlus />
            Novi izlazni račun
         </Link>

         <Link
            href="/racuni/kreiraj-ulazni-racun"
            className={cn(
               buttonVariants(),
               "border-rose-500 bg-rose-800 text-white hover:bg-rose-700 hover:text-white"
            )}
         >
            <SquareMinus />
            Novi ulazni račun
         </Link>
      </div>
   );
};

export default CreateInvoiceButtons;
