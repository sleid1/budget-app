import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { SquareMinus, SquarePlus } from "lucide-react";
import React from "react";
import CreateinvoiceDialog from "./_components/CreateinvoiceDialog";

const Dashboard = async () => {
   const session = await auth();

   return (
      <div className="h-full bg-background">
         <div className="border-b bg-card">
            <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
               <p className="text-3xl font-bold">
                  Dobrodošao, {session?.user.name} !
               </p>

               <div className="flex items-center gap-3">
                  <CreateinvoiceDialog
                     trigger={
                        <Button
                           variant="outline"
                           className="border-emerald-500 bg-emerald-800 text-white hover:bg-emerald-700 hover:text-white"
                        >
                           <SquarePlus />
                           Novi izlazni račun
                        </Button>
                     }
                     type="IZLAZNI_RACUN"
                  />

                  <CreateinvoiceDialog
                     trigger={
                        <Button
                           variant="outline"
                           className="border-rose-500 bg-rose-800 text-white hover:bg-emerald-700 hover:text-white"
                        >
                           <SquareMinus />
                           Novi ulazni račun
                        </Button>
                     }
                     type="ULAZNI_RACUN"
                  />
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;
