"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { InvoiceType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {
   Pencil,
   PlusSquare,
   TrashIcon,
   TrendingDown,
   TrendingUp,
} from "lucide-react";
import CreateCategoryDialog from "../_components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import DeleteCategoryDialog from "../_components/DeleteCategoryDialog";

const Postavke = () => {
   return (
      <div className="container flex flex-col gap-4">
         <Card>
            <CardHeader>
               <CardTitle>Kategorije</CardTitle>
               <CardDescription>
                  Upravljaj svojim kategorijama računa
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <CategoryList type="IZLAZNI_RACUN" />
               <CategoryList type="ULAZNI_RACUN" />
            </CardContent>
         </Card>
      </div>
   );
};

export default Postavke;

function CategoryList({ type }: { type: InvoiceType }) {
   const categoriesQuery = useQuery({
      queryKey: ["categories", type],
      queryFn: () =>
         fetch(`/api/categories?type=${type}`).then((res) => res.json()),
   });

   const dataAvailable =
      categoriesQuery.data && categoriesQuery.data.length > 0;

   return (
      <SkeletonWrapper isLoading={categoriesQuery.isFetching}>
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                     {type === "ULAZNI_RACUN" ? (
                        <TrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
                     ) : (
                        <TrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
                     )}

                     <div>
                        Kategorije{" "}
                        {type === "IZLAZNI_RACUN" ? "izlaznih " : "ulaznih"}{" "}
                        računa{" "}
                        <div className="text-sm text-muted-foreground">
                           Sortirano po nazivu
                        </div>
                     </div>
                  </div>

                  <CreateCategoryDialog
                     type={type}
                     trigger={
                        <Button className="gap-2">
                           <PlusSquare className="w-4 h-4" />
                           Kreiraj kategoriju
                        </Button>
                     }
                  />
               </CardTitle>
            </CardHeader>

            <Separator />
            {!dataAvailable && (
               <div className="flex h-60 w-full items-center justify-center flex-col">
                  <p>
                     Nema
                     <span
                        className={cn(
                           "m-1",
                           type === "IZLAZNI_RACUN"
                              ? "text-emerald-500"
                              : "text-red-500"
                        )}
                     >
                        {type === "IZLAZNI_RACUN" ? "izlaznih" : "ulaznih"}
                     </span>
                     kategorija.
                  </p>

                  <p className="text-sm text-muted-foreground">
                     Kreiraj novu kategoriju
                  </p>
               </div>
            )}

            {dataAvailable && (
               <div className="grid grid-flow-row gap-10 p-4 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {categoriesQuery.data.map((category: Category) => (
                     <CategoryCard
                        category={category}
                        categories={categoriesQuery.data || []}
                        key={category.name}
                     />
                  ))}
               </div>
            )}
         </Card>
      </SkeletonWrapper>
   );
}

function CategoryCard({
   category,
   categories,
}: {
   category: Category;
   categories: Category[];
}) {
   return (
      <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
         <div className="flex flex-col items-center gap-2 p-4">
            <span className="text-3xl" role="img">
               {category.icon}
            </span>
            <span>
               {category.name} ({category._count.invoices})
            </span>
         </div>
         <div className="grid grid-cols-2 gap-2">
            <DeleteCategoryDialog
               category={category}
               categories={categories}
               trigger={
                  <Button
                     className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500 hover:text-white"
                     variant="secondary"
                  >
                     <TrashIcon className="h-4 w-4" />
                     Izbriši
                  </Button>
               }
            />

            <CreateCategoryDialog
               mode="update"
               category={category}
               type={category.type}
               trigger={
                  <Button
                     className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-blue-500 hover:text-white"
                     variant="secondary"
                  >
                     <Pencil className="h-4 w-4" />
                     Ažuriraj
                  </Button>
               }
            />
         </div>
      </div>
   );
}
