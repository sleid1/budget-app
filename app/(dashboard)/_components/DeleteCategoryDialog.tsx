"use client";

import { deleteCategory } from "@/actions/categoryActions";
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
import { buttonVariants } from "@/components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { InvoiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
   trigger: ReactNode;
   category: Category;
   categories: Category[];
}

const DeleteCategoryDialog = ({ category, categories, trigger }: Props) => {
   const categoryIdentifier = `${category.name}-${category.type}`;
   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
      null
   );
   const [isDialogOpen, setIsDialogOpen] = useState(false);

   const queryClient = useQueryClient();

   const deleteMutation = useMutation({
      mutationFn: deleteCategory,
      onSuccess: async (response) => {
         if (response.success) {
            toast.success(
               response.message || "Kategorija je uspješno obrisana",
               {
                  id: categoryIdentifier,
               }
            );
         }

         setSelectedCategoryId(null); // Reset category selection on success
         await queryClient.invalidateQueries({
            queryKey: ["categories", category.type],
         }); // Invalidate categories list

         setIsDialogOpen(false);
      },
      onError: (error) => {
         let errorMessage = "Nešto je pošlo po zlu.";
         if (error instanceof Error) {
            errorMessage = error.message;
         }
         toast.error(errorMessage, {
            id: categoryIdentifier,
         });
      },
   });

   // Filter out the category being deleted from reassignment options

   const filteredCategories = useMemo(
      () => categories.filter((cat) => cat.id !== category.id),
      [categories, category.id]
   );

   const handleDialogClose = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
         setSelectedCategoryId(null); // Reset category selection on dialog close
      }
   };

   return (
      <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
         <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>
                  Jesi li siguran da želiš obrisati{" "}
                  {category.type === "IZLAZNI_RACUN" ? "izlaznu" : "ulaznu"}{" "}
                  kategoriju pod nazivom{" "}
                  <span
                     className={cn(
                        "uppercase",
                        category.type === "IZLAZNI_RACUN"
                           ? "text-red-500"
                           : "text-emerald-500"
                     )}
                  >
                     {category.name}
                  </span>{" "}
                  ?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  {categories.length > 1 ? (
                     category.invoiceCount > 0 ? (
                        <>
                           Kategorija ima{" "}
                           <span
                              className={cn(
                                 "font-bold mx-2 text-lg",
                                 category.type === "IZLAZNI_RACUN"
                                    ? "text-red-500"
                                    : "text-emerald-500"
                              )}
                           >
                              {category.invoiceCount}
                           </span>{" "}
                           povezanih računa. Molimo odaberite novu kategoriju za
                           povezane račune.
                        </>
                     ) : (
                        "Ova radnja ne može se otkazati te će kategorija biti trajno obrisana."
                     )
                  ) : (
                     "Trenutno imate samo jednu kategoriju. Stoga ne možete obrisati svoju posljednju kategoriju. Prije brisanja postojeće, molimo prvo kreirajte novu kategoriju."
                  )}
               </AlertDialogDescription>
            </AlertDialogHeader>
            {category?.invoiceCount > 0 && filteredCategories.length > 0 && (
               <div className="space-y-2">
                  <h3 className="text-sm font-medium mb-2">
                     Odaberite novu kategoriju:
                  </h3>
                  <Select
                     onValueChange={(value) =>
                        setSelectedCategoryId(parseInt(value, 10))
                     }
                  >
                     <SelectTrigger className="w-full">
                        <SelectValue placeholder="Odaberite kategoriju" />
                     </SelectTrigger>
                     <SelectContent>
                        {filteredCategories.map((cat: Category) => (
                           <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <p>
                     Ova radnja ne može se otkazati te će kategorija biti trajno
                     obrisana.
                  </p>
               </div>
            )}
            <AlertDialogFooter>
               <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Odustani
               </AlertDialogCancel>
               <AlertDialogAction
                  className={cn(
                     "disabled:cursor-not-allowed",
                     buttonVariants({ variant: "destructive" })
                  )}
                  disabled={
                     deleteMutation.isPending ||
                     (category?.invoiceCount > 0 && !selectedCategoryId) ||
                     filteredCategories.length === 0
                  }
                  onClick={() => {
                     toast.loading("Brisanje kategorije i izmjena računa...", {
                        id: categoryIdentifier,
                     });
                     deleteMutation.mutate({
                        name: category.name,
                        type: category.type as InvoiceType,
                        oldCategoryId: category.id,
                        newCategoryId: selectedCategoryId,
                     });
                  }}
               >
                  <Trash />
                  {deleteMutation.isPending ? "Brisanje..." : "Obriši"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default DeleteCategoryDialog;
