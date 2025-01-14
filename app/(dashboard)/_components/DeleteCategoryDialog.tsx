"use client";

import { DeleteCategory } from "@/actions/categoryActions";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InvoiceType } from "@/lib/types";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
   trigger: ReactNode;
   category: Category;
}

const DeleteCategoryDialog = ({ category, trigger }: Props) => {
   const categoryIdentifier = `${category.name}-${category.type}`;

   const queryClient = useQueryClient();

   const deleteMutation = useMutation({
      mutationFn: DeleteCategory,
      onSuccess: async (data) => {
         toast.success(`Kategorija ${data.name} je uspješno obrisana`, {
            id: categoryIdentifier,
         });

         await queryClient.invalidateQueries({
            queryKey: ["categories"],
         });
      },
      onError: (error) => {
         let errorMessage = "Nešto je pošlo po zlu";

         if (error instanceof Error) {
            errorMessage = error.message;
         }

         toast.error(errorMessage, {
            id: categoryIdentifier,
         });
      },
   });

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>
                  Jesi li siguran da želiš obrisati{" "}
                  {category.type === "IZLAZNI_RACUN" ? "izlaznu" : "ulaznu"}{" "}
                  kategoriju pod nazivom {category.name} ?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  Ova radnja ne može se otkazati te će kategorija biti trajno
                  obrisana.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Odustani</AlertDialogCancel>
               <AlertDialogAction
                  onClick={() => {
                     toast.loading(`Brišemo kategoriju ${category.name}...`, {
                        id: categoryIdentifier,
                     });

                     deleteMutation.mutate({
                        name: category.name,
                        type: category.type as InvoiceType,
                     });
                  }}
               >
                  Obriši
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default DeleteCategoryDialog;
