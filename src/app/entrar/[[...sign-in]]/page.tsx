import { SignIn } from "@clerk/nextjs";
import AuthLoadingBoundary from "@/components/AuthLoadingBoundary";
import { AuthLayout } from "@/components/AuthLayout";

function Entrar() {
  return (
    <AuthLayout><AuthLoadingBoundary><SignIn /></AuthLoadingBoundary></AuthLayout>
  );
}

export default Entrar;
