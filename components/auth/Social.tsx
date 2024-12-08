import { Globe } from "lucide-react";
import { Button } from "../ui/button";
import Facebook from "./Facebook";
import Instagram from "./Instagram";

const Social = () => {
   return (
      <div className="flex items-center w-full gap-x-2">
         <a
            href="https://www.diamond-realestate.hr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
         >
            <Button size="lg" className="w-full" variant="outline">
               <Globe />
            </Button>
         </a>

         <a
            href="https://www.diamond-realestate.hr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
         >
            <Button size="lg" className="w-full" variant="outline">
               <Facebook />
            </Button>
         </a>

         <a
            href="https://www.diamond-realestate.hr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
         >
            <Button size="lg" className="w-full" variant="outline">
               <Instagram />
            </Button>
         </a>
      </div>
   );
};

export default Social;
