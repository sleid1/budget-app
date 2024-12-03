"use client";

import React, { ReactNode, useState } from "react";
import Logo from "./Logo";
import { ChartNoAxesCombined, Layers3, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { ThemeSwitcherButton } from "./ThemeSwitcherButton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";

const Navbar = () => {
   return (
      <>
         <DesktopNavbar />
         <MobileNavbar />
      </>
   );
};

const items = [
   { label: "Dashboard", href: "/", icon: <ChartNoAxesCombined /> },
   { label: "Računi", href: "/racuni", icon: <Layers3 /> },
   { label: "Postavke", href: "/racuni", icon: <Settings /> },
];

function MobileNavbar() {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="block border-separate bg-background md:hidden">
         <nav className="container flex items-center justify-between px-8">
            <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
               <Logo />
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
               <SheetTrigger asChild>
                  <Button variant="ghost">
                     <Menu className="min-w-8 min-h-8" />
                  </Button>
               </SheetTrigger>
               <SheetContent className="w-[400px] sm:w-[540px]" side="right">
                  <DialogTitle className="hidden">Title</DialogTitle>
                  <div className="flex flex-col py-12 gap-y-6">
                     <div className="flex flex-col gap-4 pt-4">
                        {items.map((item) => (
                           <NavbarItem
                              key={item.label}
                              link={item.href}
                              label={item.label}
                              icon={item.icon}
                              clickCallBack={() => setIsOpen((prev) => !prev)}
                           />
                        ))}
                     </div>
                     <div>
                        <ThemeSwitcherButton />
                     </div>
                  </div>
               </SheetContent>
            </Sheet>
         </nav>
      </div>
   );
}

function DesktopNavbar() {
   return (
      <div className="hidden border-separate border-b bg-background md:block">
         <nav className="container flex items-center justify-between px-8">
            <div className="flex h-[80px] min-h-[60px] items-center gap-x-4 justify-between w-full">
               <Logo />
               <div className="flex h-full gap-12">
                  {items.map((item) => (
                     <NavbarItem
                        key={item.label}
                        link={item.href}
                        label={item.label}
                        icon={item.icon}
                     />
                  ))}
               </div>
               <div className="flex items-center gap-2">
                  <ThemeSwitcherButton />
               </div>
            </div>
         </nav>
      </div>
   );
}

function NavbarItem({
   link,
   label,
   icon,
   clickCallBack,
}: {
   link: string;
   label: string;
   icon: ReactNode;
   clickCallBack?: () => void;
}) {
   const pathName = usePathname();
   const isActive = pathName === link;

   return (
      <div className="relative flex items-center">
         <Link
            href={link}
            className={cn(
               buttonVariants({ variant: "ghost" }),
               "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
               isActive && "text-foreground bg-blue-200 hover:bg-blue-200"
            )}
            onClick={() => {
               if (clickCallBack) clickCallBack();
            }}
         >
            <span>{icon}</span>
            {label}
         </Link>
      </div>
   );
}

export default Navbar;
