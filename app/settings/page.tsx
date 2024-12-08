import { signOutAction } from "@/actions/authActions";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import React from "react";

const Settings = async () => {
   const session = await auth();

   return (
      <div>
         {JSON.stringify(session)}
         <form action={signOutAction}>
            <Button type="submit">Odjava</Button>
         </form>
      </div>
   );
};

export default Settings;
