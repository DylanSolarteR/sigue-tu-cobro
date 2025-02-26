import { Meteors } from "@/components/MeteorsBackground";
import { SignIn } from "@clerk/nextjs";

function Entrar() {
  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="max-w-screen flex h-screen max-h-screen w-screen items-center justify-center overflow-hidden bg-background">
        <div className="z-50">
          <SignIn />
        </div>
        <Meteors number={30} />
      </div>
    </main>
  );
}

export default Entrar;
