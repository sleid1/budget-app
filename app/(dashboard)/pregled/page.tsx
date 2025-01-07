import { auth } from "@/auth";
import CreateInvoiceButtons from "../_components/CreateInvoiceButtons";

const Pregled = async () => {
   const session = await auth();

   return (
      <div className="h-full bg-background">
         <div className="border-b bg-card">
            <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
               <p className="text-3xl font-bold">
                  Dobrodošao/la, {session?.user.name} !
               </p>

               <CreateInvoiceButtons />
            </div>
         </div>
      </div>
   );
};

export default Pregled;
