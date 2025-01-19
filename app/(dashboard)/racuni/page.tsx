import {
   Card,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import CreateInvoiceButtons from "../_components/CreateInvoiceButtons";
import InvoiceTableSection from "./_components/InvoiceTableSection";

const Racuni = () => {
   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <div className="flex flex-wrap items-center justify-between gap-6 py-8">
                  <div>
                     <CardTitle className="text-3xl font-bold">
                        Popis računa
                     </CardTitle>
                     <CardDescription>
                        Upravljaj svojim računima
                     </CardDescription>
                  </div>
                  <CreateInvoiceButtons />
               </div>
            </CardHeader>
         </Card>
         <div>
            <InvoiceTableSection />
         </div>
      </div>
   );
};

export default Racuni;
