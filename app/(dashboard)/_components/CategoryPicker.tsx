"use client";

import { Button } from "@/components/ui/button";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { InvoiceType } from "@/lib/types";
import { Category } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
   type: InvoiceType;
   onChange: (value: Category) => void;
   excludeCategory?: Category;
}

const CategoryPicker = ({
   type,
   onChange,
   excludeCategory,
}: Props & { excludeCategory?: Category }) => {
   const [open, setOpen] = useState(false);
   const [value, setValue] = useState("");

   useEffect(() => {
      if (!value) return;
      onChange(value);
   }, [onChange, value]);

   const categoriesQuery = useQuery({
      queryKey: ["categories", type],
      queryFn: () =>
         fetch(`/api/categories?type=${type}`).then((res) => res.json()),
   });

   // Filter out the excluded category
   const filteredCategories = categoriesQuery.data?.filter(
      (category: Category) => category.id !== excludeCategory?.id
   );

   const selectedCategory = filteredCategories?.find(
      (category: Category) => category.name === value.name
   );

   const successCallback = useCallback(
      (category: Category) => {
         setValue(category);
         setOpen((prev) => !prev);
      },
      [setValue, setOpen]
   );

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="justify-between w-full"
            >
               {selectedCategory ? (
                  <CategoryRow category={selectedCategory} />
               ) : (
                  "Odaberi kategoriju"
               )}
               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[400px] p-0">
            <Command
               onSubmit={(e) => {
                  e.preventDefault();
               }}
            >
               <CommandInput placeholder="Pretraži kategorije..." />
               <CreateCategoryDialog
                  type={type}
                  successCallback={successCallback}
               />
               <CommandEmpty>
                  <p>Kategorija nije pronađena</p>
                  <p className="text-xs text-muted-foreground">
                     Kreiraj novu kategoriju
                  </p>
               </CommandEmpty>
               <CommandGroup>
                  <CommandList>
                     {filteredCategories &&
                        filteredCategories.map((category: Category) => (
                           <CommandItem
                              key={category.name}
                              onSelect={() => {
                                 setValue(category);
                                 setOpen((prev) => !prev);
                              }}
                           >
                              <CategoryRow category={category} />
                              <Check
                                 className={cn(
                                    "mr-2 w-4 h-4 opacity-0",
                                    value.name === category.name &&
                                       "opacity-100"
                                 )}
                              />
                           </CommandItem>
                        ))}
                  </CommandList>
               </CommandGroup>
            </Command>
         </PopoverContent>
      </Popover>
   );
};

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
   return (
      <div className="flex items-center gap-2">
         <span role="img">{category.icon}</span>
         <span>{category.name}</span>
      </div>
   );
}
