import { auth } from "@/auth";
import CreateInvoiceButtons from "../_components/CreateInvoiceButtons";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Overview from "../_components/Overview";

const Pregled = async () => {
   const session = await auth();

   return (
      <div className="space-y-4">
         <Card className="container">
            <CardHeader>
               <div className="flex flex-wrap items-center justify-between gap-6 py-8">
                  <div className="">
                     <CardTitle className="text-3xl font-bold">
                        {" "}
                        Dobrodošao/la, {session?.user.name} !
                     </CardTitle>
                  </div>
                  <CreateInvoiceButtons />
               </div>
            </CardHeader>
         </Card>
         <Overview />
      </div>
   );
};

export default Pregled;
