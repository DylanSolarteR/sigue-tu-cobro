import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/AuthLayout";

function Entrar() {
  return (
    <AuthLayout><SignIn /></AuthLayout>
  );
}

export default Entrar;
