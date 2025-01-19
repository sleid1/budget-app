/*
 * Sets the time of a given Date object to the start of the day in UTC (00:00:00.000).
 */
export function setUTCStartOfDay(date: Date): Date {
   return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
   );
}

export function DateToUTCDate(date: Date) {
   return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
   );
}

export function formatToCurrency(value?: number): Intl.NumberFormat {
   return new Intl.NumberFormat("hr-HR", {
      style: "currency",
      currency: "EUR",
   });
}
