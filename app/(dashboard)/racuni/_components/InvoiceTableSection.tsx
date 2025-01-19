"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { hr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import InvoiceTable from "./InvoiceTable";

const InvoiceTableSection = () => {
   const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
      from: startOfMonth(new Date()),
      to: new Date(),
   });

   return (
      <div>
         <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            locale={hr}
            onUpdate={(values) => {
               const { from, to } = values.range;

               //UPDATEAMO DATERANGE SAMO AKO SU OBA DATUMA ODABRANA
               if (!from || !to) return;
               if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                  toast.error(
                     `Selektirani raspon datuma je prevelik. Maksimalan dozvoljeni raspon datuma je ${MAX_DATE_RANGE_DAYS} dana.`
                  );
                  return;
               }
               setDateRange({
                  from,
                  to,
               });
            }}
         />
         <InvoiceTable from={dateRange.from} to={dateRange.to} />
      </div>
   );
};

export default InvoiceTableSection;
