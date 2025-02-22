"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas/authSchema";
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
import { loginAction } from "@/actions/authActions";
import PasswordInput from "./PasswordInput";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const LoginForm = () => {
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");

   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof LoginSchema>>({
      resolver: zodResolver(LoginSchema),
      defaultValues: {
         email: "",
         password: "",
      },
   });

   const onSubmit = (values: z.infer<typeof LoginSchema>) => {
      setError("");
      setSuccess("");

      startTransition(() => {
         loginAction(values).then((data) => {
            setError(data?.error);
            setSuccess(data?.success);
         });
      });
   };

   return (
      <CardWrapper headerLabel="Dobrodošli nazad !" showSocial mode="Prijava">
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
                           <Button
                              size="sm"
                              variant="link"
                              asChild
                              className="px-0 font-normal"
                           >
                              <Link href="/resetiraj-lozinku">
                                 Zaboravili ste svoju lozinku ?
                              </Link>
                           </Button>
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
                     "Prijavi se"
                  )}
               </Button>
            </form>
         </Form>
      </CardWrapper>
   );
};

export default LoginForm;
