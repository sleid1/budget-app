"use client";

import { DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
   ChartNoAxesCombined,
   Layers3,
   Menu,
   Settings,
   Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { LogoutButton } from "./auth/SignOutButton";
import Logo from "./Logo";
import { ThemeSwitcherButton } from "./ThemeSwitcherButton";
import { Button, buttonVariants } from "./ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import RoleGate from "./auth/RoleGate";

const Navbar = () => {
   return (
      <>
         <DesktopNavbar />
         <MobileNavbar />
      </>
   );
};

const items = [
   { label: "Pregled", href: "/pregled", icon: <ChartNoAxesCombined /> },
   { label: "Računi", href: "/racuni", icon: <Layers3 /> },
   { label: "Postavke", href: "/postavke", icon: <Settings /> },
];

function MobileNavbar() {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <header className="container block border-separate bg-background md:hidden">
         <nav className="flex items-center justify-between">
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

                     <div className="flex justify-center gap-2">
                        <RoleGate allowedRole="ADMIN">
                           <NavbarItem
                              link="/korisnici"
                              icon={<Users />}
                              clickCallBack={() => setIsOpen((prev) => !prev)}
                           />
                        </RoleGate>
                        <ThemeSwitcherButton />
                     </div>
                     <LogoutButton />
                  </div>
               </SheetContent>
            </Sheet>
         </nav>
      </header>
   );
}

function DesktopNavbar() {
   return (
      <div className="container hidden border-separate border-b bg-background md:block">
         <nav className="flex items-center justify-between">
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
                  <RoleGate allowedRole="ADMIN">
                     <NavbarItem link="/korisnici" icon={<Users />} />
                  </RoleGate>
                  <ThemeSwitcherButton />
                  <LogoutButton />
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
   label?: string;
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
