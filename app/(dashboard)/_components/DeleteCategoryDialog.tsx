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
import { InvoiceType } from "@/lib/types";
import { Category } from "@prisma/client";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

interface Props {
   trigger: ReactNode;
   category: Category;
}

const DeleteCategoryDialog = ({ category, trigger }: Props) => {
   const categoryIdentifier = `${category.name}-${category.type}`;
   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
      null
   );
   const [isDialogOpen, setIsDialogOpen] = useState(false);

   const queryClient = useQueryClient();

   // Fetch invoice count for the category
   const invoiceCountQuery = useQuery({
      queryKey: ["category", "invoiceCount", category.id],
      queryFn: async () => {
         const response = await fetch(
            `/api/categories?categoryId=${category.id}`
         );
         if (!response.ok) {
            throw new Error("Failed to fetch invoice count");
         }
         return response.json();
      },
      enabled: isDialogOpen,
      staleTime: Infinity,
   });

   // Fetch all categories for reassignment
   const categoriesQuery = useQuery({
      queryKey: ["categories", category.type],
      queryFn: async () => {
         const response = await fetch(`/api/categories?type=${category.type}`);
         if (!response.ok) {
            throw new Error("Failed to fetch categories");
         }
         return response.json();
      },
      staleTime: Infinity,
   });

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
         await queryClient.invalidateQueries({ queryKey: ["categories"] });
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
   const filteredCategories = categoriesQuery.data?.filter(
      (cat: Category) => cat.id !== category.id
   );

   const handleDialogClose = (open: boolean) => {
      if (!deleteMutation.isLoading && !invoiceCountQuery.isFetching) {
         setIsDialogOpen(open);
         if (!open) {
            setSelectedCategoryId(null); // Reset category selection on dialog close
         }
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
                  kategoriju pod nazivom {category.name}?
               </AlertDialogTitle>
               <AlertDialogDescription>
                  {invoiceCountQuery.isFetching ? (
                     <span>Provjera povezanih računa...</span>
                  ) : invoiceCountQuery.data?.invoiceCount > 0 ? (
                     <span>
                        Kategorija ima {invoiceCountQuery.data.invoiceCount}{" "}
                        povezanih računa. Molimo odaberite novu kategoriju za
                        povezane račune.
                     </span>
                  ) : (
                     <span>
                        Ova radnja ne može se otkazati te će kategorija biti
                        trajno obrisana.
                     </span>
                  )}
               </AlertDialogDescription>
            </AlertDialogHeader>
            {invoiceCountQuery.data?.invoiceCount > 0 && filteredCategories && (
               <div>
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
               </div>
            )}
            <AlertDialogFooter>
               <AlertDialogCancel
                  disabled={
                     deleteMutation.isLoading || invoiceCountQuery.isFetching
                  }
               >
                  Odustani
               </AlertDialogCancel>
               <AlertDialogAction
                  disabled={
                     invoiceCountQuery.isFetching ||
                     deleteMutation.isLoading ||
                     (invoiceCountQuery.data?.invoiceCount > 0 &&
                        !selectedCategoryId)
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
                  {deleteMutation.isLoading ? "Brisanje..." : "Obriši"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

export default DeleteCategoryDialog;
