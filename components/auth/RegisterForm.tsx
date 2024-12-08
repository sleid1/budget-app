"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas/authSchema";
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
import { registerAction } from "@/actions/authActions";

const RegisterForm = () => {
   const [error, setError] = useState<string | undefined>("");
   const [success, setSuccess] = useState<string | undefined>("");

   const [isPending, startTransition] = useTransition();

   const form = useForm<z.infer<typeof RegisterSchema>>({
      resolver: zodResolver(RegisterSchema),
      defaultValues: {
         name: "",
         lastName: "",
         email: "",
         password: "",
      },
   });

   const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
      setError("");
      setSuccess("");

      startTransition(() => {
         registerAction(values).then((data) => {
            setError(data.error);
            setSuccess(data.success);
         });
      });
   };

   return (
      <CardWrapper
         headerLabel="Registriraj novog korisnika"
         mode="Registracija"
      >
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="space-y-4">
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
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Ime</FormLabel>
                           <FormControl>
                              <Input
                                 {...field}
                                 placeholder="Marko"
                                 disabled={isPending}
                              ></Input>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="lastName"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Prezime</FormLabel>
                           <FormControl>
                              <Input
                                 {...field}
                                 placeholder="Maric"
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
                              <Input
                                 {...field}
                                 placeholder="* * * * * *"
                                 type="password"
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
                  Registriraj korisnika
               </Button>
            </form>
         </Form>
      </CardWrapper>
   );
};

export default RegisterForm;
