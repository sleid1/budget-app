"use client";

import { startOfMonth } from "date-fns";
import { useState } from "react";

const Overview = () => {
   const [dateRange, setDateRange] = useState({
      from: startOfMonth(new Date()),
      to: new Date(),
   });

   return <div>Overview</div>;
};

export default Overview;
