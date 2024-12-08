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

interface CardWrapperProps {
   children: React.ReactNode;
   headerLabel?: string | undefined;
   backButtonLabel?: string;
   backButtonHref?: string;
   showSocial?: boolean;
   mode?: string;
}

const CardWrapper = ({
   children,
   headerLabel,
   showSocial,
   mode,
}: CardWrapperProps) => {
   return (
      <Card className="w-[400px] shadow-md">
         <CardHeader>
            <Header label={headerLabel} mode={mode} />
         </CardHeader>
         <CardContent>{children}</CardContent>
         {showSocial && (
            <CardFooter>
               <Social />
            </CardFooter>
         )}
      </Card>
   );
};

export default CardWrapper;
