"use client";

import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { UserRole } from "@prisma/client";

interface RoleGateProps {
   children: React.ReactNode;
   allowedRole: UserRole;
}

const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
   const role = useCurrentUserRole();

   if (role !== allowedRole) {
      return null;
   }

   return <>{children}</>;
};

export default RoleGate;
