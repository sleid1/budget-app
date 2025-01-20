import { useSession } from "next-auth/react";

//GET USER ROLE CLIENT SIDE
export const useCurrentUserRole = () => {
   const session = useSession();

   return session.data?.user?.role;
};
