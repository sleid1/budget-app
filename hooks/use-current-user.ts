import { useSession } from "next-auth/react";

//GET USER CLIENT SIDE
export const useCurrentUser = () => {
   const session = useSession();

   return session.data?.user;
};
