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
import { Category, Department } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import CreateDepartmentDialog from "./CreateDepartmentDialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
   onChange: (value: Category) => void;
}

const DepartmentPicker = ({ onChange }: Props) => {
   const [open, setOpen] = useState(false);
   const [value, setValue] = useState("");

   useEffect(() => {
      if (!value) return;
      onChange(value);
   }, [onChange, value]);

   const departmentsQuery = useQuery({
      queryKey: ["departments"],
      queryFn: () => fetch("/api/departments").then((res) => res.json()),
   });

   const selectedDepartment = departmentsQuery.data?.find(
      (department: Department) => department.name === value.name
   );

   const successCallback = useCallback(
      (department: Department) => {
         setValue(department);
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
               {selectedDepartment ? (
                  <DepartmentRow department={selectedDepartment} />
               ) : (
                  "Odaberi odjel"
               )}

               <ChevronsUpDown className="ml-2 w-4 h-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>

         <PopoverContent className="w-[400px] p-0">
            <Command
               onSubmit={(e) => {
                  e.preventDefault();
               }}
            >
               <CommandInput placeholder="Pronađi odjel..."></CommandInput>

               <CreateDepartmentDialog successCallback={successCallback} />
               <CommandEmpty>
                  <p>Odjel nije pronađen</p>
                  <p className="text-xs text-muted-foreground">
                     Kreiraj novi odjel
                  </p>
               </CommandEmpty>

               <CommandGroup>
                  <CommandList>
                     {departmentsQuery.data &&
                        departmentsQuery.data.map((department: Department) => (
                           <CommandItem
                              key={department.name}
                              onSelect={() => {
                                 setValue(department);

                                 setOpen((prev) => !prev);
                              }}
                           >
                              <DepartmentRow department={department} />

                              <Check
                                 className={cn(
                                    "mr-2 w-4 h-4 opacity-0",
                                    value === department.name && "opacity-100"
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

export default DepartmentPicker;

function DepartmentRow({ department }: { department: Department }) {
   return (
      <div className="flex items-center gap-2">
         <span>{department.name}</span>
      </div>
   );
}
