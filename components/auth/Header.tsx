import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
   subsets: ["latin"],
   weight: ["600"],
});

interface HeaderProps {
   label: string | undefined;
   mode?: string;
}

const Header = ({ label, mode }: HeaderProps) => {
   return (
      <div className="w-full flex flex-col gap-y-4 items-center justify-center">
         <h1 className={cn("text-3xl font-semibold", font.className)}>
            {mode === "Prijava" ? "🔏Prijava" : "Registracija"}
         </h1>
         <p className="text-muted-foreground text-sm">{label}</p>
      </div>
   );
};

export default Header;
