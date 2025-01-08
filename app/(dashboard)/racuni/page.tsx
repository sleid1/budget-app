import {
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import React from "react";
import CreateInvoiceButtons from "../_components/CreateInvoiceButtons";

const Racuni = () => {
   return (
      <Card className="container">
         <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-6 py-8">
               <div className="">
                  <CardTitle className="text-3xl font-bold">Računi</CardTitle>
                  <CardDescription>Upravljaj svojim računima</CardDescription>
               </div>
               <CreateInvoiceButtons />
            </div>
         </CardHeader>
      </Card>
   );
};

export default Racuni;
