"use client";
import { useActionState } from "react";
import { BeatLoader } from "react-spinners";
import CardWrapper from "@/components/auth/CardWrapper";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import PasswordInput from "./PasswordInput";
import { confirmAccount } from "@/actions/confirmAccount";
import FormError from "../FormError";
import FormSuccess from "../FormSuccess";
import { Loader2 } from "lucide-react";

export const NewVerificationForm = () => {
   const [state, formAction, isPending] = useActionState(confirmAccount, null);
   const searchParams = useSearchParams();

   const token = searchParams.get("token") || "";

   if (!token) {
      return (
         <CardWrapper
            headerLabel="Postavi željenu lozinku i potvrdi svoj račun"
            backButtonLabel="Nazad na prijavu"
            backButtonHref="/prijava"
            mode="Potvrdi svoj račun"
         >
            <FormError message="Token nedostaje !" />
         </CardWrapper>
      );
   }

   return (
      <CardWrapper
         headerLabel="Postavi željenu lozinku i potvrdi svoj račun"
         backButtonLabel="Nazad na prijavu"
         backButtonHref="/prijava"
         mode="Potvrdi svoj račun"
      >
         {isPending && (
            <div className="text-center">
               <BeatLoader />
            </div>
         )}
         <div>
            <form action={formAction} className="space-y-6">
               <input type="hidden" name="token" value={token} />
               <PasswordInput name="password" />

               <FormError message={state?.error} />
               <FormSuccess message={state?.success} />
               <Button type="submit" disabled={isPending} className="w-full">
                  Potvrdi svoj račun
               </Button>
            </form>
         </div>
      </CardWrapper>
   );
};
