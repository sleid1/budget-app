import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoIcon from "@/public/diamond-logo.png";

const Logo = () => {
   return (
      <Link href="/">
         <Image width="100" height="100" src={LogoIcon} alt="Logo" />
      </Link>
   );
};

export default Logo;
