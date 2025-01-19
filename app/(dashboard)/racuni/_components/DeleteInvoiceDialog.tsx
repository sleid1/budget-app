import { deleteInvoice } from "@/actions/invoiceActions";
import {
   AlertDialogFooter,
   AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface Props {
   open: boolean;
   setOpen: (open: boolean) => void;
   invoiceId: string;
}

const DeleteInvoiceDialog = ({ open, setOpen, invoiceId }: Props) => {
   const queryClient = useQueryClient();

   const deleteMutation = useMutation({
      mutationFn: deleteInvoice,
      onSuccess: async (response) => {
         if (response.success) {
            toast.success(response.message || "Račun je uspješno obrisan", {
               id: invoiceId,
            });
         }

         await queryClient.invalidateQueries({
            queryKey: ["invoices"],
         });

         setOpen(false);
      },
      onError: (error) => {
         let errorMessage = "Nešto je pošlo po zlu.";
         if (error instanceof Error) {
            errorMessage = error.message;
         }
         toast.error(errorMessage, {
            id: invoiceId,
         });
      },
   });

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>
                  Jesi li siguran da želiš obrisati ovaj račun ?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  Ova radnja ne može se otkazati te će kategorija biti trajno
                  obrisana.
               </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
               <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Odustani
               </AlertDialogCancel>
               <AlertDialogAction
                  className={cn(
                     "disabled:cursor-not-allowed",
                     buttonVariants({ variant: "destructive" })
                  )}
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                     toast.loading("Brisanje računa...", {
                        id: invoiceId,
                     });
                     deleteMutation.mutate(invoiceId);
                  }}
               >
                  <Trash />
                  {deleteMutation.isPending
                     ? "Brisanje računa..."
                     : "Obriši račun"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default DeleteInvoiceDialog;
