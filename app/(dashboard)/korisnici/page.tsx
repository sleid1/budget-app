import {
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import React from "react";

import { PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateUserDialog from "../_components/CreateUserDialog";
import UserTable from "../_components/UserTable";

const Korisnici = () => {
   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <div className="flex flex-wrap items-center justify-between gap-6 py-8">
                  <div>
                     <CardTitle className="text-3xl font-bold">
                        Popis korisnika
                     </CardTitle>
                     <CardDescription>
                        Upravljaj svojim računima
                     </CardDescription>
                  </div>
                  <CreateUserDialog
                     trigger={
                        <Button className="gap-2">
                           <PlusSquare className="w-4 h-4" />
                           Kreiraj novog korisnika
                        </Button>
                     }
                  />
               </div>
            </CardHeader>
         </Card>
         <div>
            <UserTable />
         </div>
      </div>
   );
};

export default Korisnici;
