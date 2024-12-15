"use client";

import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from "@/components/ui/card";
import Header from "@/components/auth/Header";
import Social from "@/components/auth/Social";
import BackButton from "@/components/auth/BackButton";
import Logo from "../Logo";

interface CardWrapperProps {
   children: React.ReactNode;
   headerLabel?: string | undefined;
   showSocial?: boolean;
   mode?: string;
   backButtonLabel?: string;
   backButtonHref?: string;
}

const CardWrapper = ({
   children,
   headerLabel,
   showSocial,
   mode,
   backButtonLabel,
   backButtonHref,
}: CardWrapperProps) => {
   return (
      <Card className="w-[400px] shadow-md">
         <CardHeader className="space-y-6">
            <Logo className="text-center" />

            <Header label={headerLabel} mode={mode} />
         </CardHeader>
         <CardContent>{children}</CardContent>
         {showSocial && (
            <CardFooter>
               <Social />
            </CardFooter>
         )}

         {backButtonLabel && (
            <CardFooter className="justify-center">
               <BackButton label={backButtonLabel} href={backButtonHref} />
            </CardFooter>
         )}
      </Card>
   );
};

export default CardWrapper;
