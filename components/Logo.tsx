import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoIcon from "@/public/diamond-logo.png";
import { cn } from "@/lib/utils";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

type LogoProps = {
   className?: string;
};

const Logo = ({ className }: LogoProps) => {
   return (
      <Link href={DEFAULT_LOGIN_REDIRECT} className={cn(className)}>
         <Image
            width="100"
            height="100"
            src={LogoIcon}
            alt="Logo"
            className="inline-block w-24 h-auto"
         />
      </Link>
   );
};

export default Logo;
