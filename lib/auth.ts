import { auth } from "@/auth";

//GET USER SERVER SIDE
export const currentUser = async () => {
   const session = await auth();

   return session?.user;
};

//GET USER ROLE SERVER SIDE
export const currentUserRole = async () => {
   const session = await auth();

   return session?.user?.role;
};
