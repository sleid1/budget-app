import { LoginButton } from "@/components/auth/LoginButton";
import { Button } from "@/components/ui/button";

export default function Home() {
   return (
      <main className="flex h-full flex-col items-center justify-center">
         <div className="space-y-6 text-center">
            <h1 className="text-6xl font-semibold drop-shadow-md">🔏Prijava</h1>
            <div>
               <LoginButton>
                  <Button size="lg">Prijava</Button>
               </LoginButton>
            </div>
         </div>
      </main>
   );
}
