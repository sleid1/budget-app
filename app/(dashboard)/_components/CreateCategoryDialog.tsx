"use client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { InvoiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
   CreateCategorySchema,
   CreateCategorySchemaType,
} from "@/schemas/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";

import { ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/actions/categoryActions";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Textarea } from "@/components/ui/textarea";

interface Props {
   type: InvoiceType;
   successCallback: (category: Category) => void;
   trigger?: ReactNode;
}

const CreateCategoryDialog = ({ type, successCallback, trigger }: Props) => {
   const [open, setOpen] = useState(false);

   const form = useForm<CreateCategorySchemaType>({
      resolver: zodResolver(CreateCategorySchema),
      defaultValues: {
         name: "",
         icon: "",
         description: "",
         type,
      },
   });

   const {
      formState: { errors },
   } = form;

   const queryClient = useQueryClient();

   const theme = useTheme();

   const { mutate, isPending } = useMutation({
      mutationFn: createCategory,
      onSuccess: async (data: Category) => {
         form.reset({
            name: "",
            icon: "",
            description: "",
            type,
         }),
            toast.success(`Kategorija ${data.name} je uspješno kreirana`, {
               id: "create-category",
            });

         successCallback(data);

         await queryClient.invalidateQueries({
            queryKey: ["categories"],
         });

         setOpen((prev) => !prev);
      },
      onError: (error) => {
         toast.error(error.message, {
            id: "create-category",
         });
      },
   });

   const onSubmit = useCallback(
      (values: CreateCategorySchemaType) => {
         toast.loading("Kreiranje kategorije...", {
            id: "create-category",
         });
         mutate(values);
      },
      [mutate]
   );

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            {trigger ? (
               trigger
            ) : (
               <Button
                  variant="ghost"
                  className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
               >
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Kreiraj novu kategoriju
               </Button>
            )}
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>
                  Kreiraj kategoriju
                  <span
                     className={cn(
                        "mx-2 tracking-wider font-bold",
                        type === "IZLAZNI_RACUN"
                           ? "text-emerald-500"
                           : "text-red-500"
                     )}
                  >
                     {type === "IZLAZNI_RACUN" ? "IZLAZNOG" : "ULAZNOG"}
                  </span>
                  računa
               </DialogTitle>
               <DialogDescription>
                  Kategorije su korištene kako bi grupirale tvoje račune
               </DialogDescription>
            </DialogHeader>
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
               >
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Ime kategorije</FormLabel>
                           <FormControl>
                              <Input {...field} value={field.value || ""} />
                           </FormControl>

                           <FormMessage>{errors.name?.message}</FormMessage>
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="icon"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Ikona</FormLabel>
                           <FormControl>
                              <Popover>
                                 <PopoverTrigger asChild>
                                    <Button
                                       variant="outline"
                                       className="h-[100px] w-full"
                                    >
                                       {form.watch("icon") ? (
                                          <div className="flex flex-col items-center gap-2">
                                             <span
                                                className="text-5xl"
                                                role="img"
                                             >
                                                {field.value}
                                             </span>
                                             <p className="text-xs text-muted-foreground">
                                                Klikni za izmjenu
                                             </p>
                                          </div>
                                       ) : (
                                          <div className="flex flex-col items-center gap-2">
                                             <CircleOff className="!h-[48px] !w-[48px]" />
                                             <p className="text-xs text-muted-foreground">
                                                Klikni za odabir
                                             </p>
                                          </div>
                                       )}
                                    </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-full">
                                    <Picker
                                       data={data}
                                       theme={theme.resolvedTheme}
                                       onEmojiSelect={(emoji: {
                                          native: string;
                                       }) => {
                                          field.onChange(emoji.native);
                                       }}
                                    />
                                 </PopoverContent>
                              </Popover>
                           </FormControl>
                           <FormMessage>{errors.icon?.message}</FormMessage>
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Opis kategorije</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Unesite opis kategorije"
                                 {...field}
                                 value={field.value || ""}
                                 onChange={(e) =>
                                    form.setValue("description", e.target.value)
                                 }
                              />
                           </FormControl>
                           <FormMessage>
                              {errors.description?.message}
                           </FormMessage>
                        </FormItem>
                     )}
                  />
               </form>
            </Form>

            <DialogFooter>
               <DialogClose asChild>
                  <Button
                     type="button"
                     variant="secondary"
                     onClick={() => form.reset()}
                  >
                     Otkaži
                  </Button>
               </DialogClose>
               <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
               >
                  {!isPending ? (
                     "Kreiraj kategoriju"
                  ) : (
                     <Loader2 className="animate-spin" />
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CreateCategoryDialog;
