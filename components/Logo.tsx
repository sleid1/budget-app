import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoIcon from "@/public/diamond-logo.png";
import { cn } from "@/lib/utils";

type LogoProps = {
   className?: string;
};

const Logo = ({ className }: LogoProps) => {
   return (
      <Link href="/" className={cn(className)}>
         <Image
            width="100"
            height="100"
            src={LogoIcon}
            alt="Logo"
            className="inline-block w-28 h-auto"
         />
      </Link>
   );
};

export default Logo;
