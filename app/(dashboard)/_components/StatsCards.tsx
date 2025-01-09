"use client";

import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DateToUTCDate } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";

interface Props {
   from: Date;
   to: Date;
}

const StatsCards = ({ from, to }: Props) => {
   const statsQuery = useQuery<GetBalanceStatsResponseType>({
      queryKey: ["overview", "stats", from, to],
      queryFn: () =>
         fetch(
            `/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(
               to
            )}`
         ).then((res) => res.json()),
   });

   const income = statsQuery.data?.income || 0;
   const expense = statsQuery.data?.expense || 0;
   const vatPaid = statsQuery.data?.vatPaid || 0;
   const vatOwed = statsQuery.data?.vatOwed || 0;

   const amountBalance = income - expense;
   const vatBalance = vatPaid - vatOwed;

   return (
      <div className="relative w-full flex flex-wrap gap-2 md:flex-nowrap">
         <SkeletonWrapper />
      </div>
   );
};

export default StatsCards;
