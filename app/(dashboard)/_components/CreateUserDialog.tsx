"use client";

import {
   Dialog,
   DialogClose,
   DialogContent,
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
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { registerAction } from "@/actions/authActions";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { RegisterSchema } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
   trigger?: React.ReactNode;
}

const CreateUserDialog = ({ trigger }: Props) => {
   const [open, setOpen] = useState(false);

   const form = useForm({
      resolver: zodResolver(RegisterSchema),
      defaultValues: {
         name: "",
         lastName: "",
         email: "",
         // role: "USER",
      },
   });

   const {
      formState: { errors },
   } = form;

   const queryClient = useQueryClient();

   const { mutate, isPending } = useMutation({
      mutationFn: registerAction,
      onSuccess: async (response) => {
         if (response.success) {
            toast.success(response.message, { id: "user-create" });
            await queryClient.invalidateQueries({
               queryKey: ["users"],
            });
            setOpen(false);
            form.reset();
         } else {
            toast.error(response.message || "Došlo je do pogreške", {
               id: "user-create",
            });
         }
      },
      onError: (error: any) => {
         toast.error(error.message || "Došlo je do pogreške", {
            id: "user-create",
         });
      },
      // onSettled: () => {

      // },
   });

   const onSubmit = form.handleSubmit((values) => {
      toast.loading("Kreiranje korisnika...", { id: "user-create" });
      mutate(values);
   });

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>{trigger}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Kreiraj novog korisnika</DialogTitle>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-4">
                     <FormField
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                 <Input
                                    {...field}
                                    placeholder="john.doe@example.com"
                                    type="email"
                                    disabled={isPending}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        name="name"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Ime</FormLabel>
                              <FormControl>
                                 <Input
                                    {...field}
                                    placeholder="Marko"
                                    disabled={isPending}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        name="lastName"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Prezime</FormLabel>
                              <FormControl>
                                 <Input
                                    {...field}
                                    placeholder="Maric"
                                    disabled={isPending}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Ovlasti</FormLabel>
                              <FormControl>
                                 <Select
                                    value={field.value}
                                    onValueChange={(value) =>
                                       field.onChange(value)
                                    }
                                 >
                                    <SelectTrigger>
                                       <SelectValue placeholder="Ovlasti" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="USER">
                                          Korisnik
                                       </SelectItem>
                                       <SelectItem value="ADMIN">
                                          Administrator
                                       </SelectItem>
                                    </SelectContent>
                                 </Select>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
                  {/* <FormError message={form.formState.errors.root?.message} />
                  <FormSuccess message="Korisnik je uspješno kreiran." /> */}
               </form>
            </Form>

            <DialogFooter>
               <DialogClose asChild>
                  <Button
                     type="button"
                     variant="secondary"
                     onClick={() => form.reset()}
                  >
                     Odustani
                  </Button>
               </DialogClose>
               <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
               >
                  {!isPending ? (
                     "Kreiraj korisnika"
                  ) : (
                     <Loader2 className="animate-spin" />
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default CreateUserDialog;
