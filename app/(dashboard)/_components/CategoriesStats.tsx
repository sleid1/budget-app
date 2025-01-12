import { GetCategoriesStatsResponseType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceType } from "@/lib/types";
import { DateToUTCDate, formatToCurrency } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
   from: Date;
   to: Date;
}

const CategoriesStats = ({ from, to }: Props) => {
   const statsQuery = useQuery<GetCategoriesStatsResponseType>({
      queryKey: ["overview", "stats", "categories", from, to],
      queryFn: () =>
         fetch(
            `/api/stats/categories?from=${DateToUTCDate(
               from
            )}&to=${DateToUTCDate(to)}`
         ).then((res) => res.json()),
   });

   console.log(statsQuery.data);

   return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
         <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <CategoriesCard type="IZLAZNI_RACUN" data={statsQuery.data || []} />
         </SkeletonWrapper>

         <SkeletonWrapper isLoading={statsQuery.isFetching}>
            <CategoriesCard type="ULAZNI_RACUN" data={statsQuery.data || []} />
         </SkeletonWrapper>
      </div>
   );
};

export default CategoriesStats;

function CategoriesCard({
   type,
   data,
}: {
   type: InvoiceType;
   data: GetCategoriesStatsResponseType;
}) {
   const filteredData = data.filter((el) => el.type === type);

   console.log(filteredData);

   const total = filteredData.reduce(
      (acc, el) => acc + (el._sum?.grossAmount || 0),
      0
   );

   console.log(total);

   return (
      <Card className="h-80 w-full">
         <CardHeader>
            <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
               {type === "IZLAZNI_RACUN" ? "Prihodi" : "Rashodi"} po
               kategorijama
            </CardTitle>
         </CardHeader>

         <div className="flex items-center justify-between gap-2">
            {filteredData.length === 0 && (
               <div className="flex h-60 w-full flex-col items-center justify-center">
                  Nema podataka za odabrano razdoblje
                  <p className="text-sm text-muted-foreground">
                     Pokušaj odabrati neko drugo razdoblje ili dodaj novi{" "}
                     {type === "ULAZNI_RACUN" ? "ulazni" : "izlazni"} račun za
                     odabrano razdoblje.
                  </p>
               </div>
            )}

            {filteredData.length > 0 && (
               <ScrollArea className="h-60 w-full px-4">
                  <div className="flex w-full flex-col gap-4 p-4">
                     {filteredData.map((item) => {
                        const amount = item._sum.grossAmount || 0;
                        const percentage = (amount * 100) / (total || amount);
                        console.log(item);

                        return (
                           <div
                              className="flex flex-col gap-2"
                              key={item.categoryId}
                           >
                              <div className="flex items-center justify-between">
                                 <span className="flex items-center text-gray-400">
                                    {item.category.icon} {item.category.name}
                                    <span className="ml-2 text-xs text-muted-foreground">
                                       ( {percentage.toFixed(0)} % )
                                    </span>
                                 </span>

                                 <span className="text-sm text-gray-400">
                                    {formatToCurrency(amount)}
                                 </span>
                              </div>

                              <Progress
                                 value={percentage}
                                 indicator={
                                    type === "IZLAZNI_RACUN"
                                       ? "bg-emerald-500"
                                       : "bg-red-500"
                                 }
                              />
                           </div>
                        );
                     })}
                  </div>
               </ScrollArea>
            )}
         </div>
      </Card>
   );
}
