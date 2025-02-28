import { SignUp } from "@clerk/nextjs";

function Registro() {
  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="flex h-full max-h-full w-full max-w-full items-center justify-center overflow-hidden bg-background">
        <div className="z-50">
          <SignUp />
        </div>
      </div>
    </main>
  );
}

export default Registro;
