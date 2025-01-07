"use client";

import { CreateDepartment } from "@/actions/departmentActions";
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
import { Textarea } from "@/components/ui/textarea";
import {
   CreateDepartmentSchema,
   CreateDepartmentSchemaType,
} from "@/schemas/departments";
import { zodResolver } from "@hookform/resolvers/zod";
import { Department } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusSquare } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
   successCallback: (department: Department) => void;
}

const CreateDepartmentDialog = ({ successCallback }: Props) => {
   const [open, setOpen] = useState(false);

   const form = useForm<CreateDepartmentSchemaType>({
      resolver: zodResolver(CreateDepartmentSchema),
      defaultValues: {
         name: "",
         description: "",
      },
   });

   const {
      formState: { errors },
   } = form;

   const queryClient = useQueryClient();

   const { mutate, isPending } = useMutation({
      mutationFn: CreateDepartment,
      onSuccess: async (data: Department) => {
         form.reset({
            name: "",
            description: "",
         });

         toast.success(`Odjel ${data.name} je uspješno kreiran`, {
            id: "create-department",
         });

         successCallback(data);

         await queryClient.invalidateQueries({
            queryKey: ["departments"],
         });

         setOpen((prev) => !prev);
      },

      onError: (error) => {
         toast.error(error.message, {
            id: "create-department",
         });
      },
   });

   const onSubmit = useCallback(
      (values: CreateDepartmentSchemaType) => {
         toast.loading("Kreiramo novi odjel...", {
            id: "create-department",
         });

         mutate(values);
      },
      [mutate]
   );

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button
               variant="ghost"
               className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
            >
               <PlusSquare className="mr-2 h-4 w-4" />
               Kreiraj novi odjel
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Kreiraj novi odjel</DialogTitle>
               <DialogDescription>
                  Odjeli se koriste kako biste pratili račune po odjelima
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
                           <FormLabel>Ime odjela</FormLabel>
                           <FormControl>
                              <Input {...field} value={field.value || ""} />
                           </FormControl>

                           <FormMessage>{errors.name?.message}</FormMessage>
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Opis odjela</FormLabel>
                           <FormControl>
                              <Textarea
                                 placeholder="Unesite opis odjela"
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
                     onClick={() => {
                        form.reset();
                     }}
                  >
                     Otkaži
                  </Button>
               </DialogClose>

               <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
               >
                  {!isPending ? (
                     "Kreiraj odjel"
                  ) : (
                     <Loader2 className="animate-spin" />
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CreateDepartmentDialog;
