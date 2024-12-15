"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/schemas/authSchema";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";

import CardWrapper from "./CardWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/resetPasswordAction";

const ResetPasswordForm = () => {
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");

   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof ResetSchema>>({
      resolver: zodResolver(ResetSchema),
      defaultValues: {
         email: "",
      },
   });

   const onSubmit = (values: z.infer<typeof ResetSchema>) => {
      setError("");
      setSuccess("");

      startTransition(() => {
         resetPasswordAction(values).then((data) => {
            setError(data?.error);
            setSuccess(data?.success);
         });
      });
   };

   return (
      <CardWrapper
         headerLabel="Zaboravili ste svoju lozinku ?"
         mode="Zaboravljena lozinka"
         backButtonLabel="Nazad na prijavu"
         backButtonHref="/prijava"
      >
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="space-y-6">
                  <FormField
                     control={form.control}
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
                              ></Input>
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
                     "Pošalji email za resetiranje lozinke"
                  )}
               </Button>
            </form>
         </Form>
      </CardWrapper>
   );
};

export default ResetPasswordForm;
