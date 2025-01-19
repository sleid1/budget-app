import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InvoiceBadgeProps {
   status: "NEPLACENO" | "PLACENO" | "KASNJENJE" | "STORNIRANO";
}

const InvoiceBadge: React.FC<InvoiceBadgeProps> = ({ status }) => {
   const statusStyles: Record<string, string> = {
      NEPLACENO: "bg-red-100 text-red-700",
      PLACENO: "bg-green-100 text-green-700",
      KASNJENJE: "bg-yellow-100 text-yellow-700",
      STORNIRANO: "bg-gray-100 text-gray-700",
   };

   return (
      <div
         className={cn(
            "capitalize rounded-lg text-center p-2 font-bold",
            statusStyles[status] || "bg-gray-200 text-gray-600"
         )}
      >
         {status}
      </div>
   );
};

export default InvoiceBadge;
