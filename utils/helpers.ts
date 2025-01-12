export function DateToUTCDate(date: Date) {
   return new Date(
      Date.UTC(
         date.getFullYear(),
         date.getMonth(),
         date.getDate(),
         date.getHours(),
         date.getMinutes(),
         date.getSeconds(),
         date.getMilliseconds()
      )
   );
}

export function formatToCurrency(value?: number): string {
   if (typeof value !== "number") {
      return "Format broja nije ispravan";
   }

   return new Intl.NumberFormat("hr-HR", {
      style: "currency",
      currency: "EUR",
   }).format(value);
}
