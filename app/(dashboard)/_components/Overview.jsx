"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth } from "date-fns";
import { hr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import StatsCards from "./StatsCards";
import CategoriesStats from "./CategoriesStats";
import { setUTCStartOfDay } from "@/utils/helpers";

const Overview = () => {
   const [dateRange, setDateRange] = useState({
      from: startOfMonth(new Date()),
      to: setUTCStartOfDay(new Date()),
   });

   return (
      <>
         <div className="flex flex-wrap items-end justify-between gap-2 py-6">
            <h2 className="text-3xl font-bold">Pregled</h2>
            <div className="flex items-center gap-3">
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
            </div>
         </div>
         <div className="space-y-6">
            <StatsCards from={dateRange.from} to={dateRange.to} />

            <CategoriesStats from={dateRange.from} to={dateRange.to} />
         </div>
      </>
   );
};

export default Overview;
