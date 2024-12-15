"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordSchema, ResetSchema } from "@/schemas/authSchema";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";

import CardWrapper from "./CardWrapper";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Loader2 } from "lucide-react";
import {
   resetPasswordAction,
   setNewPasswordAction,
} from "@/actions/resetPasswordAction";
import PasswordInput from "./PasswordInput";
import { useSearchParams } from "next/navigation";

const NewPasswordForm = () => {
   const searchParams = useSearchParams();

   const token = searchParams.get("token");

   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");

   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof NewPasswordSchema>>({
      resolver: zodResolver(NewPasswordSchema),
      defaultValues: {
         password: "",
      },
   });

   const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
      setError("");
      setSuccess("");

      startTransition(() => {
         setNewPasswordAction(values, token).then((data) => {
            setError(data?.error);
            setSuccess(data?.success);
         });
      });
   };

   return (
      <CardWrapper
         headerLabel="Unesi svoju novu lozinku"
         mode="Postavi novu lozinku"
         backButtonLabel="Nazad na prijavu"
         backButtonHref="/prijava"
      >
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="space-y-6">
                  <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Lozinka</FormLabel>
                           <FormControl>
                              <PasswordInput
                                 name={field.name}
                                 value={field.value}
                                 onChange={field.onChange}
                                 disabled={isPending}
                                 placeholder="* * * * * *"
                              />
                           </FormControl>

                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <FormError message={error} />
               <FormSuccess message={success} />

               <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                     <Loader2 className="animate-spin !w-6 !h-6" size={48} />
                  ) : (
                     "Resetiraj svoju lozinku"
                  )}
               </Button>
            </form>
         </Form>
      </CardWrapper>
   );
};

export default NewPasswordForm;
