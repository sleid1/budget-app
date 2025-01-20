import { deleteInvoice } from "@/actions/invoiceActions";
import { getInvoiceHistoryResponseType } from "@/app/api/invoice-history/route";
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
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

interface InvoiceData {
   invoiceId: string;
   invoiceNumber: string;
   formattedAmount: string;
   status: string;
}

interface Props {
   open: boolean;
   setOpen: (open: boolean) => void;
   invoice: InvoiceData;
}

const DeleteInvoiceDialog = ({ open, setOpen, invoice }: Props) => {
   const queryClient = useQueryClient();

   console.dir(invoice);

   const deleteMutation = useMutation({
      mutationFn: deleteInvoice,
      onSuccess: async (response) => {
         if (response.success) {
            toast.success(response.message || "Račun je uspješno obrisan", {
               id: invoice.invoiceId,
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
            id: invoice.invoiceId,
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

            <Table className="table-fixed w-full border border-gray-100">
               <TableHeader>
                  <TableRow>
                     <TableHead className="font-bolder border-r border-gray-100">
                        Broj računa
                     </TableHead>
                     <TableHead className="border-r border-gray-100">
                        Iznos
                     </TableHead>
                     <TableHead className="border-r border-gray-100">
                        Status
                     </TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  <TableRow>
                     <TableCell className="font-bold border-r border-gray-100">
                        {invoice.invoiceNumber}
                     </TableCell>
                     <TableCell className="border-r border-gray-100">
                        {invoice.formattedAmount}
                     </TableCell>
                     <TableCell className="border-r border-gray-100">
                        {invoice.status}
                     </TableCell>
                  </TableRow>
               </TableBody>
            </Table>

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
                        id: invoice.invoiceId,
                     });
                     deleteMutation.mutate(invoice.invoiceId);
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
