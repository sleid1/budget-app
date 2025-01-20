import { signOutAction } from "@/actions/authActions";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import React from "react";

const Settings = async () => {
   const user = await currentUser();

   return (
      <div>
         {JSON.stringify(user)}
         <form action={signOutAction}>
            <Button type="submit">Odjava</Button>
         </form>
      </div>
   );
};

export default Settings;
