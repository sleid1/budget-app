"use client";

import { GetBalanceStatsResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatToCurrency } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import {
   AlertCircle,
   Euro,
   Scale,
   TrendingDown,
   TrendingUp,
   Wallet,
} from "lucide-react";
import { ReactNode, useCallback, useMemo } from "react";
import CountUp from "react-countup";

interface Props {
   from: Date;
   to: Date;
}

const StatsCards = ({ from, to }: Props) => {
   const statsQuery = useQuery<GetBalanceStatsResponseType>({
      queryKey: ["overview", "stats", from, to],
      queryFn: () =>
         fetch(`/api/stats/balance?from=${from}&to=${to}`).then((res) =>
            res.json()
         ),
   });

   const income = statsQuery.data?.income || 0;
   const expense = statsQuery.data?.expense || 0;
   const vatPaid = statsQuery.data?.vatPaid || 0;
   const vatOwed = statsQuery.data?.vatOwed || 0;

   const amountBalance = income - expense;
   const vatBalance = vatPaid - vatOwed;

   const formatter = useMemo(() => {
      return formatToCurrency();
   }, []);

   const tooltipExplanations = useMemo(
      () => ({
         income: (
            <div className="space-y-2">
               <strong>Prihodi</strong>
               <p>
                  Ukupni iznos prihoda (izlaznih računa) za odabrani vremenski
                  period.
               </p>
            </div>
         ),
         expense: (
            <div className="space-y-2">
               <strong>Rashodi</strong>
               <p>
                  Ukupni iznos rashoda (ulaznih računa) za odabrani vremenski
                  period.
               </p>
            </div>
         ),
         amountBalance: (
            <div className="space-y-2">
               <strong>Stanje</strong>
               <p>
                  Razlika između prihoda i rashoda. Pozitivno stanje znači da su
                  prihodi veći od rashoda.
               </p>
            </div>
         ),
         vatPaid: (
            <div className="space-y-2">
               <strong>Ulazni PDV</strong>
               <p>
                  Ukupni iznos PDV-a koji je plaćen za ulazne račune tijekom
                  odabranog razdoblja.
               </p>
            </div>
         ),
         vatOwed: (
            <div className="space-y-2">
               <strong>Izlazni PDV</strong>
               <p>
                  Ukupni iznos PDV-a koji je naplaćen na izlazne račune tijekom
                  odabranog razdoblja.
               </p>
            </div>
         ),
         vatBalance:
            vatBalance >= 0 ? (
               <div className="space-y-2">
                  <strong>Ulazni PDV &gt; Izlazni PDV</strong>
                  <p>Trenutno ste u pretplati PDV-a za odabrano razdoblje.</p>
               </div>
            ) : (
               <div className="space-y-2">
                  <strong>Ulazni PDV &lt; Izlazni PDV</strong>
                  <p>Trenutno dugujete PDV državi za odabrano razdoblje.</p>
               </div>
            ),
      }),
      [vatBalance]
   );

   return (
      <div className="space-y-4">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={income}
                  title="Prihodi"
                  icon={
                     <TrendingUp className="h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.income}
               />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={expense}
                  title="Rashodi"
                  icon={
                     <TrendingDown className="h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.expense}
               />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={amountBalance}
                  title="Stanje"
                  icon={
                     <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.amountBalance}
               />
            </SkeletonWrapper>
         </div>

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={vatPaid}
                  title="Ulazni PDV"
                  icon={
                     <Euro className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.vatPaid}
               />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={vatOwed}
                  title="Izlazni PDV"
                  icon={
                     <AlertCircle className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.vatOwed}
               />
            </SkeletonWrapper>

            <SkeletonWrapper isLoading={statsQuery.isFetching}>
               <StatCard
                  formatter={formatter}
                  value={vatBalance}
                  title="Stanje PDV"
                  icon={
                     <Scale className="h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
                  }
                  tooltip={true}
                  tooltipText={tooltipExplanations.vatBalance}
               />
            </SkeletonWrapper>
         </div>
      </div>
   );
};

export default StatsCards;

function StatCard({
   value,
   title,
   icon,
   tooltip = false,
   tooltipText,
   formatter,
}: {
   icon: ReactNode;
   title: string;
   value: number;
   tooltip?: boolean;
   tooltipText?: ReactNode;
   formatter: Intl.NumberFormat;
}) {
   const formattingFn = useCallback(
      (value: number) => {
         return formatter.format(value);
      },
      [formatter]
   );

   return (
      <Card className="flex h-24 w-full items-center gap-2 p-4">
         {tooltip ? (
            <TooltipProvider>
               <Tooltip>
                  <TooltipTrigger>{icon}</TooltipTrigger>
                  <TooltipContent className="text-lg">
                     {tooltipText}
                  </TooltipContent>
               </Tooltip>
            </TooltipProvider>
         ) : (
            <div>{icon}</div>
         )}
         <div className="flex flex-col items-start gap-0">
            <p className="text-muted-foreground">{title}</p>
            <CountUp
               preserveValue
               redraw={false}
               end={value}
               decimals={2}
               formattingFn={formattingFn}
               className={cn(
                  "text-2xl",
                  (title === "Stanje" || title === "Stanje PDV") &&
                     value >= 0 &&
                     "text-emerald-500",
                  (title === "Stanje" || title === "Stanje PDV") &&
                     value < 0 &&
                     "text-red-500"
               )}
            />
         </div>
      </Card>
   );
}
