// Format number for Croatian locale
export const formatToCroatian = (value: number): string => {
   return new Intl.NumberFormat("hr-HR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   }).format(value);
};

// Parse a Croatian formatted string into a raw number
export const parseFromCroatian = (value: string): number | null => {
   const normalized = value.replace(/\./g, "").replace(",", ".");
   const parsed = parseFloat(normalized);
   return isNaN(parsed) ? null : parsed;
};
